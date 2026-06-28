using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.Services;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.FileProviders;
using PlaceGuide.Server.Models;
using System.Text;
using PlaceGuide.Server.Configuration;
using PayOS;
using Npgsql;
using AppPayOSOptions = PlaceGuide.Server.Configuration.PayOSOptions;

var builder = WebApplication.CreateBuilder(args);
var databaseConnectionString = ResolveDatabaseConnectionString(
    builder.Configuration);
var configuredCorsOrigins = (builder.Configuration["Cors:AllowedOrigins"] ?? string.Empty)
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Select(origin => origin.TrimEnd('/'))
    .ToHashSet(StringComparer.OrdinalIgnoreCase);
// cau hinh Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole<long>>(options =>
{
    // Password settings - giảm độ khó mật khẩu
    options.Password.RequiredLength = 6;
    options.Password.RequiredUniqueChars = 1;

    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;

    // User settings
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();
builder.Services.AddAuthentication(options =>
{   
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;

})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            var localOrigins = new HashSet<string>(
                [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:5174",
                    "http://127.0.0.1:5174",
                    "http://localhost:3000",
                    "http://127.0.0.1:3000"
                ],
                StringComparer.OrdinalIgnoreCase);

            policy
                .SetIsOriginAllowed(origin =>
                    localOrigins.Contains(origin.TrimEnd('/')) ||
                    configuredCorsOrigins.Contains(origin.TrimEnd('/')))
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor |
        ForwardedHeaders.XForwardedProto;
    options.ForwardLimit = 1;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddControllers();

builder.Services.AddMemoryCache();

builder.Services.AddScoped<IGuestAudioPassService, GuestAudioPassService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<
    IAudioListeningAnalyticsService,
    AudioListeningAnalyticsService>();
builder.Services.AddSingleton<IVisitorPresenceService, VisitorPresenceService>();
builder.Services.Configure<TranslationOptions>(
    builder.Configuration.GetSection(TranslationOptions.SectionName));
builder.Services.AddHttpClient<ITranslationProvider, HttpTranslationProvider>();
builder.Services.AddScoped<IAutoTranslationService, AutoTranslationService>();

builder.Services.Configure<AudioPassPaymentOptions>(
    builder.Configuration.GetSection(AudioPassPaymentOptions.SectionName));

builder.Services
    .AddOptions<AppPayOSOptions>()
    .BindConfiguration(AppPayOSOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateDataAnnotations();
    //.ValidateOnStart();

builder.Services.AddSingleton<PayOSClient>(serviceProvider =>
{
    var payOSOptions = serviceProvider
        .GetRequiredService<Microsoft.Extensions.Options.IOptions<AppPayOSOptions>>()
        .Value;

    return new PayOSClient(new PayOS.PayOSOptions
    {
        ClientId = payOSOptions.ClientId,
        ApiKey = payOSOptions.ApiKey,
        ChecksumKey = payOSOptions.ChecksumKey
    });
});

builder.Services.AddScoped<IAudioPassCheckoutService, AudioPassCheckoutService>();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<PlaceGuide.Server.Data.ApplicationDbContext>(options =>
    options.UseNpgsql(databaseConnectionString));

var app = builder.Build();

var payOSWebhookUrl = builder.Configuration["PayOSOptions:WebhookUrl"];
var hasPayOSConfiguration =
    Uri.TryCreate(payOSWebhookUrl, UriKind.Absolute, out _) &&
    !string.IsNullOrWhiteSpace(builder.Configuration["PayOSOptions:ClientId"]) &&
    !string.IsNullOrWhiteSpace(builder.Configuration["PayOSOptions:ApiKey"]) &&
    !string.IsNullOrWhiteSpace(builder.Configuration["PayOSOptions:ChecksumKey"]);

if (hasPayOSConfiguration)
{
    app.Lifetime.ApplicationStarted.Register(() =>
    {
        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = app.Services.CreateScope();
                var payOSClient = scope.ServiceProvider
                    .GetRequiredService<PayOSClient>();
                var payOSOptions = scope.ServiceProvider
                    .GetRequiredService<Microsoft.Extensions.Options.IOptions<AppPayOSOptions>>()
                    .Value;

                await payOSClient.Webhooks.ConfirmAsync(payOSOptions.WebhookUrl);
                app.Logger.LogInformation("PayOS webhook URL was registered successfully.");
            }
            catch (Exception exception)
            {
                app.Logger.LogWarning(
                    exception,
                    "Could not register the PayOS webhook URL. Keep the tunnel running and restart the server to retry.");
            }
        });
    });
}

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();

        // Lệnh CanConnect() sẽ trả về true nếu ping thành công tới DB
        if (app.Environment.IsProduction())
        {
            await context.Database.MigrateAsync();
        }

        if (await context.Database.CanConnectAsync())
        {
            Console.WriteLine("✅ THÀNH CÔNG: Đã kết nối tới PostgreSQL!");

            var roleManager = services.GetRequiredService<RoleManager<IdentityRole<long>>>();
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            await IdentitySeeder.SeedRolesAsync(
                roleManager,
                userManager,
                builder.Configuration);

            if (app.Environment.IsDevelopment())
            {
                await DevelopmentDatabaseSeeder.SeedAsync(
                    context,
                    roleManager,
                    userManager);
                Console.WriteLine("✅ Development seed data đã sẵn sàng.");
            }
        }
        else
        {
            Console.WriteLine("❌ THẤT BẠI: Không thể kết nối tới PostgreSQL.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ LỖI KẾT NỐI: {ex.Message}");

        if (app.Environment.IsProduction())
        {
            throw;
        }
    }
}

app.UseDefaultFiles();
app.UseStaticFiles();

var legacyUploadsPath = Path.Combine(app.Environment.ContentRootPath, "Uploads");
if (Directory.Exists(legacyUploadsPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(legacyUploadsPath),
        RequestPath = "/Uploads"
    });
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseForwardedHeaders();
app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapGet("/api/health", () => Results.Ok(new
{
    status = "ok",
    environment = app.Environment.EnvironmentName,
    timestampUtc = DateTimeOffset.UtcNow
}));

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();

static string ResolveDatabaseConnectionString(IConfiguration configuration)
{
    var databaseUrl = configuration["DATABASE_URL"];
    if (string.IsNullOrWhiteSpace(databaseUrl))
    {
        return configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Database connection is not configured. Set DATABASE_URL or ConnectionStrings:DefaultConnection.");
    }

    if (!Uri.TryCreate(databaseUrl, UriKind.Absolute, out var databaseUri) ||
        !string.Equals(
            databaseUri.Scheme,
            "postgresql",
            StringComparison.OrdinalIgnoreCase) &&
        !string.Equals(
            databaseUri.Scheme,
            "postgres",
            StringComparison.OrdinalIgnoreCase))
    {
        throw new InvalidOperationException("DATABASE_URL is not a valid PostgreSQL URL.");
    }

    var credentials = databaseUri.UserInfo.Split(':', 2);
    if (credentials.Length != 2)
    {
        throw new InvalidOperationException("DATABASE_URL does not contain database credentials.");
    }

    return new NpgsqlConnectionStringBuilder
    {
        Host = databaseUri.Host,
        Port = databaseUri.IsDefaultPort ? 5432 : databaseUri.Port,
        Database = databaseUri.AbsolutePath.TrimStart('/'),
        Username = Uri.UnescapeDataString(credentials[0]),
        Password = Uri.UnescapeDataString(credentials[1]),
        SslMode = SslMode.Prefer
    }.ConnectionString;
}
