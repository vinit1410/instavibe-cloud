namespace PostService.Services
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file);
        bool DeleteFile(string fileName);
    }
}
