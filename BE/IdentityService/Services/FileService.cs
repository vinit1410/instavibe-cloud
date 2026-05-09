namespace IdentityService.Services
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file);
    }

    /// <summary>
    /// Calls MediaService to upload profile pictures
    /// </summary>
    public class MediaServiceFileService : IFileService
    {
        private readonly HttpClient _httpClient;

        public MediaServiceFileService()
        {
            _httpClient = new HttpClient
            {
                BaseAddress = new Uri("https://instavibe-media-gncvahdtbed3egg4.polandcentral-01.azurewebsites.net")
            };
        }

        public async Task<string> SaveFileAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("No file uploaded");

            using var content = new MultipartFormDataContent();
            using var stream = file.OpenReadStream();
            var streamContent = new StreamContent(stream);
            streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);
            content.Add(streamContent, "file", file.FileName);

            var response = await _httpClient.PostAsync("/api/media/profile-pic", content);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<UploadResult>();
            return result?.Url ?? throw new Exception("Upload failed");
        }

        private class UploadResult
        {
            public string Url { get; set; } = null!;
        }
    }
}
