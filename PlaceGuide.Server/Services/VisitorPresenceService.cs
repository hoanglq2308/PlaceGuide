using System.Collections.Concurrent;

namespace PlaceGuide.Server.Services
{
    public interface IVisitorPresenceService
    {
        int ActiveWindowSeconds { get; }

        void Connect(string deviceIdHash, string tabId, string sessionId);

        void RecordHeartbeat(string deviceIdHash, string tabId, string sessionId);

        void Disconnect(string deviceIdHash, string tabId, string sessionId);

        int GetActiveVisitorCount();
    }

    public sealed class VisitorPresenceService : IVisitorPresenceService
    {
        private static readonly TimeSpan ActiveWindow = TimeSpan.FromSeconds(30);
        private static readonly TimeSpan DisconnectedSessionRetention = TimeSpan.FromMinutes(2);
        private readonly ConcurrentDictionary<string, ActivePresence> _activeTabs = new();
        private readonly ConcurrentDictionary<string, DateTimeOffset> _disconnectedSessionExpiry = new();

        public int ActiveWindowSeconds => (int)ActiveWindow.TotalSeconds;

        public void Connect(string deviceIdHash, string tabId, string sessionId)
        {
            var now = DateTimeOffset.UtcNow;
            var tabKey = CreateTabKey(deviceIdHash, tabId);
            var sessionKey = CreateSessionKey(tabKey, sessionId);

            RemoveExpiredEntries(now);

            if (_disconnectedSessionExpiry.ContainsKey(sessionKey))
            {
                return;
            }

            var presence = new ActivePresence(deviceIdHash, sessionId, now);
            _activeTabs[tabKey] = presence;

            if (_disconnectedSessionExpiry.ContainsKey(sessionKey) &&
                _activeTabs.TryGetValue(tabKey, out var activePresence) &&
                activePresence.SessionId == sessionId)
            {
                _activeTabs.TryRemove(tabKey, out _);
            }
        }

        public void RecordHeartbeat(string deviceIdHash, string tabId, string sessionId)
        {
            var now = DateTimeOffset.UtcNow;
            var tabKey = CreateTabKey(deviceIdHash, tabId);
            var sessionKey = CreateSessionKey(tabKey, sessionId);

            if (_disconnectedSessionExpiry.ContainsKey(sessionKey) ||
                !_activeTabs.TryGetValue(tabKey, out var presence) ||
                presence.SessionId != sessionId)
            {
                return;
            }

            _activeTabs.TryUpdate(tabKey, presence with { LastSeenAt = now }, presence);
            RemoveExpiredEntries(now);
        }

        public void Disconnect(string deviceIdHash, string tabId, string sessionId)
        {
            var now = DateTimeOffset.UtcNow;
            var tabKey = CreateTabKey(deviceIdHash, tabId);
            var sessionKey = CreateSessionKey(tabKey, sessionId);

            _disconnectedSessionExpiry[sessionKey] = now.Add(DisconnectedSessionRetention);

            if (_activeTabs.TryGetValue(tabKey, out var presence) &&
                presence.SessionId == sessionId)
            {
                _activeTabs.TryRemove(tabKey, out _);
            }
        }

        public int GetActiveVisitorCount()
        {
            var now = DateTimeOffset.UtcNow;
            RemoveExpiredEntries(now);

            return _activeTabs.Values
                .Where(presence => now - presence.LastSeenAt <= ActiveWindow)
                .Select(presence => presence.DeviceIdHash)
                .Distinct(StringComparer.Ordinal)
                .Count();
        }

        private void RemoveExpiredEntries(DateTimeOffset now)
        {
            foreach (var activeTab in _activeTabs)
            {
                if (now - activeTab.Value.LastSeenAt > ActiveWindow &&
                    _activeTabs.TryGetValue(activeTab.Key, out var currentPresence) &&
                    currentPresence == activeTab.Value)
                {
                    _activeTabs.TryRemove(activeTab.Key, out _);
                }
            }

            foreach (var disconnectedSession in _disconnectedSessionExpiry)
            {
                if (disconnectedSession.Value <= now)
                {
                    _disconnectedSessionExpiry.TryRemove(disconnectedSession.Key, out _);
                }
            }
        }

        private static string CreateTabKey(string deviceIdHash, string tabId) =>
            $"{deviceIdHash}:{tabId}";

        private static string CreateSessionKey(string tabKey, string sessionId) =>
            $"{tabKey}:{sessionId}";

        private sealed record ActivePresence(
            string DeviceIdHash,
            string SessionId,
            DateTimeOffset LastSeenAt);
    }
}
