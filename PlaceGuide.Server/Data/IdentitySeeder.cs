using Microsoft.AspNetCore.Identity;
using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Data
{
    public static class IdentitySeeder
    {
        private static readonly string[] ApplicationRoles = ["Admin", "Owner"];

        public static async Task SeedRolesAsync(
            RoleManager<IdentityRole<long>> roleManager,
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration)
        {
            foreach (var roleName in ApplicationRoles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    var result = await roleManager.CreateAsync(
                        new IdentityRole<long>(roleName));

                    if (!result.Succeeded)
                    {
                        throw new InvalidOperationException(
                            $"Could not create the {roleName} role.");
                    }
                }
            }

            var bootstrapAdminEmail = configuration["AdminBootstrap:Email"];

            if (string.IsNullOrWhiteSpace(bootstrapAdminEmail))
            {
                return;
            }

            var adminUser = await userManager.FindByEmailAsync(bootstrapAdminEmail);

            if (adminUser is not null &&
                !await userManager.IsInRoleAsync(adminUser, "Admin"))
            {
                var result = await userManager.AddToRoleAsync(adminUser, "Admin");

                if (!result.Succeeded)
                {
                    throw new InvalidOperationException(
                        "Could not assign the configured bootstrap user to the Admin role.");
                }
            }
        }
    }
}
