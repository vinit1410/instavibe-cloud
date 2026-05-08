using Newtonsoft.Json;

namespace NotificationService.Models
{
    public class Notification
    {
        [JsonProperty("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty("type")]
        public string Type { get; set; } = "notification";

        [JsonProperty("userId")]
        public string UserId { get; set; } = null!;

        [JsonProperty("fromUsername")]
        public string FromUsername { get; set; } = null!;

        [JsonProperty("notificationType")]
        public string NotificationType { get; set; } = null!;

        [JsonProperty("postId")]
        public string? PostId { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; } = null!;

        [JsonProperty("isRead")]
        public bool IsRead { get; set; } = false;

        [JsonProperty("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
