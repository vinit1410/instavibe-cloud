using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PostService.Data;
using PostService.DTOs;
using PostService.Models;

namespace PostService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PostsController : ControllerBase
    {
        private readonly CosmosDbService _cosmos;
        private readonly Services.IFileService _fileService;
        private static readonly HttpClient _notificationClient = new()
        {
            BaseAddress = new Uri("https://instavibe-notification-b4gtatc8eaaxe7dd.polandcentral-01.azurewebsites.net")
        };

        public PostsController(CosmosDbService cosmos, Services.IFileService fileService)
        {
            _cosmos = cosmos;
            _fileService = fileService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<PostResponseDto>>> GetPosts()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var savedIds = userId != null ? await _cosmos.GetSavedPostIdsAsync(userId) : new List<string>();

            var posts = await _cosmos.GetAllPostsAsync();

            var result = posts.Select(p => MapToDto(p, userId, savedIds)).ToList();
            return Ok(result);
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<PostResponseDto>>> SearchPosts([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q)) return Ok(new List<PostResponseDto>());

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var savedIds = userId != null ? await _cosmos.GetSavedPostIdsAsync(userId) : new List<string>();
            var posts = await _cosmos.GetAllPostsAsync();

            var query = q.ToLower();
            var filtered = posts.Where(p =>
                (p.Title != null && p.Title.ToLower().Contains(query)) ||
                (p.Caption != null && p.Caption.ToLower().Contains(query)) ||
                (p.Location != null && p.Location.ToLower().Contains(query)) ||
                p.TaggedPeople.Any(t => t.ToLower().Contains(query)) ||
                p.Username.ToLower().Contains(query)
            ).ToList();

            var result = filtered.Select(p => MapToDto(p, userId, savedIds)).ToList();
            return Ok(result);
        }

        /// <summary>
        /// Create a post - ONLY Creator and Admin roles can upload content
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Creator,Admin")]
        public async Task<ActionResult<PostResponseDto>> CreatePost(PostCreateDto model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.Identity?.Name;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(username))
                return Unauthorized();

            var post = new Post
            {
                UserId = userId,
                Username = username,
                Title = model.Title,
                Caption = model.Caption,
                ImageUrl = model.ImageUrl,
                Location = model.Location,
                TaggedPeople = model.TaggedPeople ?? new List<string>(),
                CreatedAt = DateTime.UtcNow
            };

            var created = await _cosmos.CreatePostAsync(post);

            return Ok(new PostResponseDto
            {
                Id = created.Id,
                UserId = created.UserId,
                Username = created.Username,
                ImageUrl = created.ImageUrl,
                Title = created.Title,
                Caption = created.Caption,
                Location = created.Location,
                TaggedPeople = created.TaggedPeople,
                CreatedAt = created.CreatedAt
            });
        }

        [HttpPost("{id}/like")]
        public async Task<IActionResult> LikePost(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var post = await _cosmos.FindPostByIdAsync(id);
            if (post == null) return NotFound();

            if (post.Likes.Contains(userId))
            {
                post.Likes.Remove(userId);
            }
            else
            {
                post.Likes.Add(userId);
                if (post.UserId != userId)
                    await SendNotificationAsync(post.UserId, User.Identity?.Name ?? "User", "Like", id, "liked your photo.");
            }

            await _cosmos.UpdatePostAsync(post);
            return Ok();
        }

        /// <summary>
        /// Rate a post (1-5 stars) - Consumer feature
        /// </summary>
        [HttpPost("{id}/rate")]
        public async Task<IActionResult> RatePost(string id, RatingCreateDto model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (model.Score < 1 || model.Score > 5) return BadRequest("Rating must be 1-5");

            var post = await _cosmos.FindPostByIdAsync(id);
            if (post == null) return NotFound();

            // Remove existing rating from this user
            post.Ratings.RemoveAll(r => r.UserId == userId);
            post.Ratings.Add(new Rating { UserId = userId, Score = model.Score, CreatedAt = DateTime.UtcNow });

            await _cosmos.UpdatePostAsync(post);

            var avg = post.Ratings.Average(r => r.Score);
            return Ok(new { averageRating = Math.Round(avg, 1), ratingsCount = post.Ratings.Count, userRating = model.Score });
        }

        [HttpPost("{id}/save")]
        public async Task<IActionResult> SavePost(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var existing = await _cosmos.GetSavedPostAsync(id, userId);
            if (existing != null)
            {
                await _cosmos.DeleteSavedPostAsync(existing.Id, userId);
                return Ok(new { isSaved = false });
            }

            await _cosmos.CreateSavedPostAsync(new SavedPost { PostId = id, UserId = userId, SavedAt = DateTime.UtcNow });
            return Ok(new { isSaved = true });
        }

        [HttpGet("saved")]
        public async Task<ActionResult<IEnumerable<PostResponseDto>>> GetSavedPosts()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var savedIds = await _cosmos.GetSavedPostIdsAsync(userId);
            var allPosts = await _cosmos.GetAllPostsAsync();

            var result = allPosts
                .Where(p => savedIds.Contains(p.Id))
                .Select(p => MapToDto(p, userId, savedIds))
                .ToList();

            return Ok(result);
        }

        [HttpPost("{id}/comment")]
        public async Task<ActionResult<CommentResponseDto>> AddComment(string id, CommentCreateDto model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.Identity?.Name;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(username))
                return Unauthorized();

            var post = await _cosmos.FindPostByIdAsync(id);
            if (post == null) return NotFound();

            var comment = new Comment
            {
                UserId = userId,
                Username = username,
                Content = model.Content,
                CreatedAt = DateTime.UtcNow
            };

            post.Comments.Add(comment);

            if (post.UserId != userId)
                await SendNotificationAsync(post.UserId, username, "Comment", id, $"commented: {model.Content}");

            await _cosmos.UpdatePostAsync(post);

            return Ok(new CommentResponseDto
            {
                Id = comment.Id,
                Username = comment.Username,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Creator,Admin")]
        public async Task<IActionResult> DeletePost(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("Admin");

            var post = await _cosmos.FindPostByIdAsync(id);
            if (post == null) return NotFound();

            if (post.UserId != userId && !isAdmin)
                return Forbid();

            if (!string.IsNullOrEmpty(post.ImageUrl))
                _fileService.DeleteFile(post.ImageUrl);

            await _cosmos.DeletePostAsync(post.Id, post.UserId);
            return Ok();
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private static PostResponseDto MapToDto(Post p, string? userId, List<string> savedIds)
        {
            return new PostResponseDto
            {
                Id = p.Id,
                UserId = p.UserId,
                Username = p.Username,
                ImageUrl = p.ImageUrl,
                Title = p.Title,
                Caption = p.Caption,
                Location = p.Location,
                TaggedPeople = p.TaggedPeople,
                LikesCount = p.Likes.Count,
                IsLikedByCurrentUser = userId != null && p.Likes.Contains(userId),
                IsSavedByCurrentUser = savedIds.Contains(p.Id),
                AverageRating = p.Ratings.Count > 0 ? Math.Round(p.Ratings.Average(r => r.Score), 1) : 0,
                RatingsCount = p.Ratings.Count,
                CurrentUserRating = userId != null ? p.Ratings.FirstOrDefault(r => r.UserId == userId)?.Score : null,
                CreatedAt = p.CreatedAt,
                Comments = p.Comments.Select(c => new CommentResponseDto
                {
                    Id = c.Id,
                    Username = c.Username,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt
                }).ToList()
            };
        }

        private static async Task SendNotificationAsync(string userId, string fromUsername, string type, string postId, string message)
        {
            try
            {
                var notif = new { userId, fromUsername, notificationType = type, postId, message, createdAt = DateTime.UtcNow };
                await _notificationClient.PostAsJsonAsync("/api/notifications", notif);
            }
            catch { }
        }
    }
}
