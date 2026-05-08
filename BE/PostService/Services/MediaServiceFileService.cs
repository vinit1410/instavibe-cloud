namespace PostService.Services
{
    /// <summary>
    /// Calls MediaService to upload/delete post images
    /// </summary>
    public class MediaServiceFileService : IFileService
    {
        private readonly HttpClient _httpClient;

        public MediaServiceFileService()
        {
            _httpClient = new HttpClient
            {
                BaseAddress = new Uri("http://localhost:5003")
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

            var response = await _httpClient.PostAsync("/api/media/post-image", content);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<UploadResult>();
            return result?.Url ?? throw new Exception("Upload failed");
        }

        public bool DeleteFile(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl)) return false;

            try
            {
                var response = _httpClient.DeleteAsync($"/api/media?fileUrl={Uri.EscapeDataString(fileUrl)}&container=post-storage").Result;
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        private class UploadResult
        {
            public string Url { get; set; } = null!;
        }
    }
}
