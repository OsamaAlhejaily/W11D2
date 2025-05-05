using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

public class UpdateHub : Hub
{
    // Handle client subscription
    public async Task SubscribeToUpdates(string itemType)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, itemType);
    }

    // Handle client unsubscription
    public async Task UnsubscribeFromUpdates(string itemType)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, itemType);
    }

    // Handle reconnection
    public override async Task OnDisconnectedAsync(Exception exception)
    {
        // Cleanup logic
        await base.OnDisconnectedAsync(exception);
    }
}