using Newtonsoft.Json;

namespace PostService.Models
{
    public class Post
    {
        [JsonProperty("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty("type")]
        public string Type { get; set; } = "post";

        [JsonProperty("userId")]
        public string UserId { get; set; } = null!;

        [JsonProperty("username")]
        public string Username { get; set; } = null!;

        [JsonProperty("imageUrl")]
        public string? ImageUrl { get; set; }

        [JsonProperty("title")]
        public string? Title { get; set; }

        [JsonProperty("caption")]
        public string? Caption { get; set; }

        [JsonProperty("location")]
        public string? Location { get; set; }

        [JsonProperty("taggedPeople")]
        public List<string> TaggedPeople { get; set; } = new();

        [JsonProperty("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [JsonProperty("likes")]
        public List<string> Likes { get; set; } = new();

        [JsonProperty("comments")]
        public List<Comment> Comments { get; set; } = new();

        [JsonProperty("ratings")]
        public List<Rating> Ratings { get; set; } = new();
    }

    public class Comment
    {
        [JsonProperty("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty("userId")]
        public string UserId { get; set; } = null!;

        [JsonProperty("username")]
        public string Username { get; set; } = null!;

        [JsonProperty("content")]
        public string Content { get; set; } = null!;

        [JsonProperty("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Rating
    {
        [JsonProperty("userId")]
        public string UserId { get; set; } = null!;

        [JsonProperty("score")]
        public int Score { get; set; } // 1-5

        [JsonProperty("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class SavedPost
    {
        [JsonProperty("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty("type")]
        public string Type { get; set; } = "savedpost";

        [JsonProperty("postId")]
        public string PostId { get; set; } = null!;

        [JsonProperty("userId")]
        public string UserId { get; set; } = null!;

        [JsonProperty("savedAt")]
        public DateTime SavedAt { get; set; } = DateTime.UtcNow;
    }
}
