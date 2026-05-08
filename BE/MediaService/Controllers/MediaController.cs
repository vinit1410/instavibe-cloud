using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediaService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MediaController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public MediaController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Upload a post image → stored in post-storage container
        /// </summary>
        [HttpPost("post-image")]
        public async Task<IActionResult> UploadPostImage(IFormFile file)
        {
            var containerName = _configuration["AzureBlob:PostImagesContainer"]!;
            var url = await UploadToBlob(file, containerName);
            return Ok(new { url });
        }

        /// <summary>
        /// Upload a profile picture → stored in profile-storage container
        /// </summary>
        [HttpPost("profile-pic")]
        [AllowAnonymous] // Called internally by IdentityService during registration
        public async Task<IActionResult> UploadProfilePic(IFormFile file)
        {
            var containerName = _configuration["AzureBlob:ProfilePicsContainer"]!;
            var url = await UploadToBlob(file, containerName);
            return Ok(new { url });
        }

        /// <summary>
        /// Generic upload endpoint (backwards compatible with /api/upload)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            var containerName = _configuration["AzureBlob:PostImagesContainer"]!;
            var url = await UploadToBlob(file, containerName);
            return Ok(new { url });
        }

        /// <summary>
        /// Delete a file from blob storage
        /// </summary>
        [HttpDelete]
        public async Task<IActionResult> DeleteFile([FromQuery] string fileUrl, [FromQuery] string container = "post-storage")
        {
            if (string.IsNullOrEmpty(fileUrl)) return BadRequest("fileUrl is required");

            try
            {
                var connectionString = _configuration["AzureBlob:ConnectionString"]!;
                var containerClient = new BlobContainerClient(connectionString, container);
                var uri = new Uri(fileUrl);
                var blobName = Path.GetFileName(uri.LocalPath);
                var blobClient = containerClient.GetBlobClient(blobName);
                await blobClient.DeleteIfExistsAsync();
                return Ok(new { deleted = true });
            }
            catch (Exception ex)
            {
                return Ok(new { deleted = false, error = ex.Message });
            }
        }

        private async Task<string> UploadToBlob(IFormFile file, string containerName)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("No file uploaded");

            var connectionString = _configuration["AzureBlob:ConnectionString"]!;
            var containerClient = new BlobContainerClient(connectionString, containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

            var blobName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var blobClient = containerClient.GetBlobClient(blobName);

            var blobHttpHeaders = new BlobHttpHeaders { ContentType = file.ContentType };

            using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, new BlobUploadOptions
            {
                HttpHeaders = blobHttpHeaders
            });

            return blobClient.Uri.ToString();
        }
    }
}
