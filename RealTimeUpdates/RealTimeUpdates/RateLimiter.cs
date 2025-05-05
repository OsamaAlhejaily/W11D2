public class RateLimiter
{
    private readonly int _maxUpdates;
    private readonly TimeSpan _interval;
    private int _currentUpdates;
    private DateTime _lastResetTime = DateTime.UtcNow;

    public RateLimiter(int maxUpdates, TimeSpan interval)
    {
        _maxUpdates = maxUpdates;
        _interval = interval;
    }

    public bool ShouldAllow()
    {
        var now = DateTime.UtcNow;

        // Reset counter if interval has passed
        if (now - _lastResetTime > _interval)
        {
            _lastResetTime = now;
            _currentUpdates = 0;
        }

        // Check if we're below the limit
        if (_currentUpdates < _maxUpdates)
        {
            _currentUpdates++;
            return true;
        }

        return false;
    }
}