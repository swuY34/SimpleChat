package com.simplechat.service;

import com.simplechat.dao.UserSessionDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class ChatService {
    private final UserSessionDao userSessionDao;

    @Autowired
    public ChatService(UserSessionDao userSessionDao) {
        this.userSessionDao = userSessionDao;
    }

    public Map<String, UserSessionDao.UserSession> getAllActiveSessions() {
        return userSessionDao.getAllActiveSessions();
    }

    public UserSessionDao.UserSession authenticateUser(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }

        UserSessionDao.UserSession userSession = new UserSessionDao.UserSession();
        userSession.setUsername(username);
        userSession.setUuid(UUID.randomUUID());
        
        return userSession;
    }

    public void addUserSession(String sessionId, UserSessionDao.UserSession userSession) {
        userSessionDao.addSession(sessionId, userSession);
    }

    public void removeUserSession(String sessionId) {
        userSessionDao.removeSession(sessionId);
    }

    public UserSessionDao.UserSession getUserSession(String sessionId) {
        return userSessionDao.getSession(sessionId);
    }
}