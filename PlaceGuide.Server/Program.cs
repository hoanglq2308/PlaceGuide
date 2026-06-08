using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
using Microsoft.IdentityModel.Tokens;
using PlaceGuide.Server.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
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
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000") // Cập nhật cổng frontend của bạn ở đây
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<PlaceGuide.Server.Data.ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();

        // Lệnh CanConnect() sẽ trả về true nếu ping thành công tới DB
        if (context.Database.CanConnect())
        {
            Console.WriteLine("✅ THÀNH CÔNG: Đã kết nối tới PostgreSQL!");

            if (app.Environment.IsDevelopment())
            {
                RestaurantSeeder.SeedDevelopmentRestaurants(context);
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
    }
}

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
