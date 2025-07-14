package com.simplechat.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simplechat.dao.UserSessionDao;
import com.simplechat.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketController extends TextWebSocketHandler {
    private final ObjectMapper objectMapper;
    private final ChatService chatService;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Autowired
    public ChatWebSocketController(ObjectMapper objectMapper, ChatService chatService) {
        this.objectMapper = objectMapper;
        this.chatService = chatService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String username = getUsernameFromQuery(session.getUri().getQuery());

        UserSessionDao.UserSession userSession = chatService.authenticateUser(username);
        chatService.addUserSession(session.getId(), userSession);
        sessions.put(session.getId(), session);

        broadcastSystemMessage(userSession.getUsername() + " joined the chat!");
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        UserSessionDao.UserSession userSession = chatService.getUserSession(session.getId());
        if (userSession == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE);
            return;
        }

        broadcastChatMessage(userSession.getUsername(), message.getPayload());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        UserSessionDao.UserSession userSession = chatService.getUserSession(session.getId());
        if (userSession != null) {
            broadcastSystemMessage(userSession.getUsername() + " left the chat");
            chatService.removeUserSession(session.getId());
        }
        sessions.remove(session.getId());
    }

    private void broadcastSystemMessage(String content) throws IOException {
        String messageJson = objectMapper.writeValueAsString(
                Map.of("type", "SYSTEM", "content", content)
        );

        for (WebSocketSession session : sessions.values()) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(messageJson));
            }
        }
    }

    private void broadcastChatMessage(String username, String content) throws IOException {
        String messageJson = objectMapper.writeValueAsString(
                Map.of("type", "CHAT", "sender", username, "content", content)
        );

        for (WebSocketSession session : sessions.values()) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(messageJson));
            }
        }
    }

    private String getUsernameFromQuery(String query) {
        if (query == null || query.isEmpty()) {
            throw new IllegalArgumentException("Username parameter is required");
        }

        String[] params = query.split("&");
        for (String param : params) {
            String[] pair = param.split("=");
            if (pair.length > 0 && "username".equals(pair[0])) {
                return pair.length > 1 ? pair[1] : "";
            }
        }

        throw new IllegalArgumentException("Username parameter is required");
    }
}