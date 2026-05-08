using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Linq;
using PostService.Models;

namespace PostService.Data
{
    public class CosmosDbService
    {
        private readonly CosmosClient _client;
        private readonly string _databaseName;

        private Container PostsContainer => _client.GetContainer(_databaseName, "posts");
        private Container SavedPostsContainer => _client.GetContainer(_databaseName, "savedposts");

        public CosmosDbService(IConfiguration configuration)
        {
            var uri = configuration["CosmosDb:AccountUri"]!;
            var key = configuration["CosmosDb:AccountKey"]!;
            _databaseName = configuration["CosmosDb:DatabaseName"]!;

            _client = new CosmosClient(uri, key, new CosmosClientOptions
            {
                SerializerOptions = new CosmosSerializationOptions
                {
                    PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                }
            });
        }

        public async Task InitialiseAsync()
        {
            var db = _client.GetDatabase(_databaseName);
            await db.CreateContainerIfNotExistsAsync("posts", "/userId");
            await db.CreateContainerIfNotExistsAsync("savedposts", "/userId");
        }

        // ── Posts ─────────────────────────────────────────────────────────────
        public async Task<List<Post>> GetAllPostsAsync()
        {
            var query = PostsContainer.GetItemLinqQueryable<Post>(true)
                .OrderByDescending(p => p.CreatedAt)
                .ToFeedIterator();

            var results = new List<Post>();
            while (query.HasMoreResults)
                results.AddRange(await query.ReadNextAsync());

            return results;
        }

        public async Task<Post?> FindPostByIdAsync(string id)
        {
            var query = PostsContainer.GetItemLinqQueryable<Post>(true,
                requestOptions: new QueryRequestOptions { MaxItemCount = 1 })
                .Where(p => p.Id == id)
                .ToFeedIterator();

            while (query.HasMoreResults)
            {
                var page = await query.ReadNextAsync();
                var post = page.FirstOrDefault();
                if (post != null) return post;
            }
            return null;
        }

        public async Task<Post> CreatePostAsync(Post post)
        {
            var response = await PostsContainer.CreateItemAsync(post, new PartitionKey(post.UserId));
            return response.Resource;
        }

        public async Task<Post> UpdatePostAsync(Post post)
        {
            var response = await PostsContainer.ReplaceItemAsync(post, post.Id, new PartitionKey(post.UserId));
            return response.Resource;
        }

        public async Task DeletePostAsync(string id, string userId)
        {
            await PostsContainer.DeleteItemAsync<Post>(id, new PartitionKey(userId));
        }

        // ── Saved Posts ───────────────────────────────────────────────────────
        public async Task<SavedPost?> GetSavedPostAsync(string postId, string userId)
        {
            var query = SavedPostsContainer.GetItemLinqQueryable<SavedPost>(true)
                .Where(s => s.PostId == postId && s.UserId == userId)
                .ToFeedIterator();

            while (query.HasMoreResults)
            {
                var page = await query.ReadNextAsync();
                var item = page.FirstOrDefault();
                if (item != null) return item;
            }
            return null;
        }

        public async Task<List<string>> GetSavedPostIdsAsync(string userId)
        {
            var query = SavedPostsContainer.GetItemLinqQueryable<SavedPost>(true)
                .Where(s => s.UserId == userId)
                .Select(s => s.PostId)
                .ToFeedIterator();

            var results = new List<string>();
            while (query.HasMoreResults)
                results.AddRange(await query.ReadNextAsync());

            return results;
        }

        public async Task<SavedPost> CreateSavedPostAsync(SavedPost savedPost)
        {
            var response = await SavedPostsContainer.CreateItemAsync(savedPost, new PartitionKey(savedPost.UserId));
            return response.Resource;
        }

        public async Task DeleteSavedPostAsync(string id, string userId)
        {
            await SavedPostsContainer.DeleteItemAsync<SavedPost>(id, new PartitionKey(userId));
        }
    }
}
