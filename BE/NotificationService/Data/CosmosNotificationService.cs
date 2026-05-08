using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Linq;
using NotificationService.Models;

namespace NotificationService.Data
{
    public class CosmosNotificationService
    {
        private readonly CosmosClient _client;
        private readonly string _databaseName;
        private Container NotificationsContainer => _client.GetContainer(_databaseName, "notifications");

        public CosmosNotificationService(IConfiguration configuration)
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
            await db.CreateContainerIfNotExistsAsync("notifications", "/userId");
        }

        public async Task<List<Notification>> GetNotificationsAsync(string userId)
        {
            var query = NotificationsContainer.GetItemLinqQueryable<Notification>(true)
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .ToFeedIterator();

            var results = new List<Notification>();
            while (query.HasMoreResults)
                results.AddRange(await query.ReadNextAsync());

            return results;
        }

        public async Task<Notification> CreateNotificationAsync(Notification notification)
        {
            var response = await NotificationsContainer.CreateItemAsync(notification, new PartitionKey(notification.UserId));
            return response.Resource;
        }

        public async Task MarkNotificationsReadAsync(string userId)
        {
            var query = NotificationsContainer.GetItemLinqQueryable<Notification>(true)
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToFeedIterator();

            var unread = new List<Notification>();
            while (query.HasMoreResults)
                unread.AddRange(await query.ReadNextAsync());

            foreach (var n in unread)
            {
                n.IsRead = true;
                await NotificationsContainer.ReplaceItemAsync(n, n.Id, new PartitionKey(n.UserId));
            }
        }
    }
}
