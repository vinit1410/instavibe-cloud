using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NotificationService.Data;
using NotificationService.Models;

namespace NotificationService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly CosmosNotificationService _cosmos;

        public NotificationsController(CosmosNotificationService cosmos)
        {
            _cosmos = cosmos;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var notifications = await _cosmos.GetNotificationsAsync(userId);
            return Ok(notifications);
        }

        [HttpPost("mark-read")]
        public async Task<IActionResult> MarkAllRead()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            await _cosmos.MarkNotificationsReadAsync(userId);
            return Ok();
        }

        [HttpPost]
        [AllowAnonymous] // Called internally by PostService and IdentityService
        public async Task<IActionResult> CreateNotification(Notification notification)
        {
            await _cosmos.CreateNotificationAsync(notification);
            return Ok();
        }
    }
}
