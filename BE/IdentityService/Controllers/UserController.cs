using System.Security.Claims;
using IdentityService.Data;
using IdentityService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public UserController(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpGet("{username}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProfile(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return NotFound();

            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var followersCount = await _context.Follows.CountAsync(f => f.FollowingId == user.Id);
            var followingCount = await _context.Follows.CountAsync(f => f.FollowerId == user.Id);
            var isFollowing = currentUserId != null && await _context.Follows.AnyAsync(f => f.FollowerId == currentUserId && f.FollowingId == user.Id);

            var isRequested = currentUserId != null && await _context.FollowRequests.AnyAsync(fr => fr.RequesterId == currentUserId && fr.TargetId == user.Id);

            return Ok(new
            {
                user.Id,
                user.UserName,
                user.FullName,
                user.Bio,
                user.ProfileImageUrl,
                FollowersCount = followersCount,
                FollowingCount = followingCount,
                IsFollowing = isFollowing,
                IsRequested = isRequested,
                IsPrivate = user.IsPrivate
            });
        }

        [HttpPost("toggle-privacy")]
        public async Task<IActionResult> TogglePrivacy()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            user.IsPrivate = !user.IsPrivate;
            await _userManager.UpdateAsync(user);

            return Ok(new { isPrivate = user.IsPrivate });
        }

        [HttpGet("suggestions")]
        public async Task<IActionResult> GetSuggestions()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var followedUserIds = await _context.Follows
                .Where(f => f.FollowerId == userId)
                .Select(f => f.FollowingId)
                .ToListAsync();

            var suggestions = await _userManager.Users
                .Where(u => u.Id != userId && !followedUserIds.Contains(u.Id))
                .Take(5)
                .Select(u => new { u.UserName, u.FullName, u.ProfileImageUrl })
                .ToListAsync();

            return Ok(suggestions);
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchUsers(string query)
        {
            if (string.IsNullOrEmpty(query)) return Ok(new List<object>());

            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var users = await _userManager.Users
                .Where(u => u.UserName.Contains(query) || u.FullName.Contains(query))
                .Where(u => !u.IsPrivate || (currentUserId != null && _context.Follows.Any(f => f.FollowerId == currentUserId && f.FollowingId == u.Id)))
                .Take(10)
                .Select(u => new { u.UserName, u.FullName, u.ProfileImageUrl, u.IsPrivate })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost("{username}/follow")]
        public async Task<IActionResult> FollowUser(string username)
        {
            var userToFollow = await _userManager.FindByNameAsync(username);
            if (userToFollow == null) return NotFound();

            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId == null) return Unauthorized();
            if (currentUserId == userToFollow.Id) return BadRequest("You cannot follow yourself.");

            var existingFollow = await _context.Follows
                .FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowingId == userToFollow.Id);

            if (existingFollow != null)
            {
                _context.Follows.Remove(existingFollow);
                await _context.SaveChangesAsync();
                return Ok(new { isFollowing = false, isRequested = false });
            }

            var existingRequest = await _context.FollowRequests
                .FirstOrDefaultAsync(fr => fr.RequesterId == currentUserId && fr.TargetId == userToFollow.Id);

            if (existingRequest != null)
            {
                _context.FollowRequests.Remove(existingRequest);
                await _context.SaveChangesAsync();
                return Ok(new { isFollowing = false, isRequested = false });
            }

            if (userToFollow.IsPrivate)
            {
                _context.FollowRequests.Add(new FollowRequest { RequesterId = currentUserId, TargetId = userToFollow.Id });
                await _context.SaveChangesAsync();
                return Ok(new { isFollowing = false, isRequested = true });
            }
            else
            {
                _context.Follows.Add(new Follow { FollowerId = currentUserId, FollowingId = userToFollow.Id });
                
                try {
                   using var client = new HttpClient();
                   var notif = new {
                       UserId = userToFollow.Id,
                       FromUsername = User.Identity?.Name,
                       Type = "Follow",
                       Message = "started following you.",
                       CreatedAt = DateTime.UtcNow
                   };
                   await client.PostAsJsonAsync("https://instavibe-notification-b4gtatc8eaaxe7dd.polandcentral-01.azurewebsites.net/api/notifications", notif);
                } catch { /* Ignore if post service is down */ }

                await _context.SaveChangesAsync();
                return Ok(new { isFollowing = true, isRequested = false });
            }
        }

        [HttpGet("follow-requests")]
        public async Task<IActionResult> GetFollowRequests()
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId == null) return Unauthorized();

            var requests = await _context.FollowRequests
                .Where(fr => fr.TargetId == currentUserId)
                .Include(fr => fr.Requester)
                .Select(fr => new { fr.Id, fr.Requester.UserName, fr.Requester.FullName, fr.Requester.ProfileImageUrl })
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPost("follow-requests/{id}/accept")]
        public async Task<IActionResult> AcceptFollowRequest(int id)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var request = await _context.FollowRequests.FindAsync(id);
            if (request == null || request.TargetId != currentUserId) return NotFound();

            _context.Follows.Add(new Follow { FollowerId = request.RequesterId, FollowingId = request.TargetId });
            _context.FollowRequests.Remove(request);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("follow-requests/{id}/reject")]
        public async Task<IActionResult> RejectFollowRequest(int id)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var request = await _context.FollowRequests.FindAsync(id);
            if (request == null || request.TargetId != currentUserId) return NotFound();

            _context.FollowRequests.Remove(request);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileDto model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            user.FullName = model.FullName ?? user.FullName;
            user.Bio = model.Bio ?? user.Bio;
            user.ProfileImageUrl = model.ProfileImageUrl ?? user.ProfileImageUrl;
            if (model.IsPrivate.HasValue) user.IsPrivate = model.IsPrivate.Value;

            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded) return Ok(user);

            return BadRequest(result.Errors);
        }

        [HttpPost("profile-pic")]
        public async Task<IActionResult> UploadProfilePic(IFormFile file, [FromServices] Services.IFileService fileService)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            try
            {
                var fileUrl = await fileService.SaveFileAsync(file);
                user.ProfileImageUrl = fileUrl;
                await _userManager.UpdateAsync(user);
                return Ok(new { url = fileUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{username}/followers")]
        public async Task<IActionResult> GetFollowers(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return NotFound();

            var followers = await _context.Follows
                .Where(f => f.FollowingId == user.Id)
                .Select(f => new { f.Follower.UserName, f.Follower.FullName, f.Follower.ProfileImageUrl })
                .ToListAsync();

            return Ok(followers);
        }

        [HttpGet("{username}/following")]
        public async Task<IActionResult> GetFollowing(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return NotFound();

            var following = await _context.Follows
                .Where(f => f.FollowerId == user.Id)
                .Select(f => new { f.Following.UserName, f.Following.FullName, f.Following.ProfileImageUrl })
                .ToListAsync();

            return Ok(following);
        }

        // ── Admin endpoints ───────────────────────────────────────────────────

        [HttpPost("admin/promote-creator/{username}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PromoteToCreator(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return NotFound("User not found");

            var currentRoles = await _userManager.GetRolesAsync(user);
            if (currentRoles.Contains("Creator"))
                return Ok(new { message = $"{username} is already a Creator" });

            // Remove Consumer role if present, add Creator
            if (currentRoles.Contains("Consumer"))
                await _userManager.RemoveFromRoleAsync(user, "Consumer");

            await _userManager.AddToRoleAsync(user, "Creator");
            return Ok(new { message = $"{username} promoted to Creator" });
        }

        [HttpPost("admin/demote-consumer/{username}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DemoteToConsumer(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return NotFound("User not found");

            var currentRoles = await _userManager.GetRolesAsync(user);
            if (currentRoles.Contains("Creator"))
                await _userManager.RemoveFromRoleAsync(user, "Creator");

            if (!currentRoles.Contains("Consumer"))
                await _userManager.AddToRoleAsync(user, "Consumer");

            return Ok(new { message = $"{username} demoted to Consumer" });
        }

        [HttpGet("admin/users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var result = new List<object>();
            foreach (var u in users)
            {
                var roles = await _userManager.GetRolesAsync(u);
                result.Add(new { u.UserName, u.FullName, u.Email, u.ProfileImageUrl, Role = roles.FirstOrDefault() });
            }
            return Ok(result);
        }
    }

    public class UpdateProfileDto
    {
        public string? FullName { get; set; }
        public string? Bio { get; set; }
        public string? ProfileImageUrl { get; set; }
        public bool? IsPrivate { get; set; }
    }
}
