using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace PlaceGuide.Server.Models
{
    public class ApplicationUser : IdentityUser<long>
    {
        [Required]
        [MaxLength(150)]
        public string FullName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }


        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "active";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
