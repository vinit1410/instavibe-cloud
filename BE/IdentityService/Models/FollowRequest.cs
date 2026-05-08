using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IdentityService.Models
{
    public class FollowRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string RequesterId { get; set; } = null!;

        [Required]
        public string TargetId { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("RequesterId")]
        public virtual ApplicationUser Requester { get; set; } = null!;

        [ForeignKey("TargetId")]
        public virtual ApplicationUser Target { get; set; } = null!;
    }
}
