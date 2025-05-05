using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using System.Collections.Concurrent;
using System.Threading.RateLimiting;

namespace RealTimeUpdates.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly IHubContext<UpdateHub> _hubContext;
        private static ConcurrentDictionary<int, Post> _posts = new ConcurrentDictionary<int, Post>();
        private static readonly RateLimiter _rateLimiter = new RateLimiter(10, TimeSpan.FromSeconds(1)); // Max 10 updates per second

        public PostsController(IHubContext<UpdateHub> hubContext)
        {
            _hubContext = hubContext;

            // Initialize with sample posts if empty
            if (_posts.IsEmpty)
            {
                for (int i = 1; i <= 5; i++)
                {
                    _posts[i] = new Post { Id = i, Title = $"Post {i}", LikeCount = 0 };
                }
            }
        }

        [HttpGet]
        public IActionResult GetPosts()
        {
            return Ok(_posts.Values);
        }

        [HttpPost("{id}/like")]
        public async Task<IActionResult> LikePost(int id)
        {
            if (!_posts.TryGetValue(id, out var post))
            {
                return NotFound();
            }

            // Update like count
            post.LikeCount++;
            _posts[id] = post;

            // Rate limit the broadcasts
            if (_rateLimiter.ShouldAllow())
            {
                // Broadcast the update to all subscribers
                await _hubContext.Clients.Group("posts").SendAsync("ReceiveUpdate", post);
            }

            return Ok(post);
        }
    }
}