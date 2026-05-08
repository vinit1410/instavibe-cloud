namespace PostService.DTOs
{
    public class PostCreateDto
    {
        public string? Title { get; set; }
        public string? Caption { get; set; }
        public string? ImageUrl { get; set; }
        public string? Location { get; set; }
        public List<string>? TaggedPeople { get; set; }
    }

    public class CommentCreateDto
    {
        public string Content { get; set; } = null!;
    }

    public class RatingCreateDto
    {
        public int Score { get; set; } // 1-5
    }

    public class PostResponseDto
    {
        public string Id { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public string Username { get; set; } = null!;
        public string? ImageUrl { get; set; }
        public string? Title { get; set; }
        public string? Caption { get; set; }
        public string? Location { get; set; }
        public List<string> TaggedPeople { get; set; } = new();
        public int LikesCount { get; set; }
        public bool IsLikedByCurrentUser { get; set; }
        public bool IsSavedByCurrentUser { get; set; }
        public double AverageRating { get; set; }
        public int RatingsCount { get; set; }
        public int? CurrentUserRating { get; set; }
        public List<CommentResponseDto> Comments { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }

    public class CommentResponseDto
    {
        public string Id { get; set; } = null!;
        public string Username { get; set; } = null!;
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }
}
