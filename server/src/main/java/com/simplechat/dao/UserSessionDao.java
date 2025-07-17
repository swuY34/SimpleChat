package com.simplechat.dao;

import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class UserSessionDao {
    private final Map<String, UserSession> activeSessions = new ConcurrentHashMap<>();

    public void addSession(String sessionId, UserSession userSession) {
        activeSessions.put(sessionId, userSession);
    }

    public void removeSession(String sessionId) {
        activeSessions.remove(sessionId);
    }

    public UserSession getSession(String sessionId) {
        return activeSessions.get(sessionId);
    }

    public Map<String, UserSession> getAllActiveSessions() {
        return new HashMap<>(activeSessions);
    }

    public static class UserSession {
        private String username;
        private UUID uuid;
        private String channelId;  // 新增字段

        // Getter 和 Setter 方法
        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public UUID getUuid() {
            return uuid;
        }

        public void setUuid(UUID uuid) {
            this.uuid = uuid;
        }

        public String getChannelId() {
            return channelId;
        }

        public void setChannelId(String channelId) {
            this.channelId = channelId;
        }
    }
}