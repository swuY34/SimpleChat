package com.simplechat.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simplechat.dao.UserSessionDao;
import com.simplechat.entity.*;
import com.simplechat.repository.*;
import com.simplechat.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketController extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;
    private final ChatService chatService;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    // 添加必要的 Repository 用于写入数据库
    private final MessageRepository messageRepository;
    private final ChannelRepository channelRepository;
    private final UserRepository userRepository;

    @Autowired
    public ChatWebSocketController(
            ObjectMapper objectMapper,
            ChatService chatService,
            MessageRepository messageRepository,
            ChannelRepository channelRepository,
            UserRepository userRepository
    ) {
        this.objectMapper = objectMapper;
        this.chatService = chatService;
        this.messageRepository = messageRepository;
        this.channelRepository = channelRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String username = getUsernameFromQuery(session.getUri().getQuery());
        String channelId = getChannelIdFromUri(session.getUri().getPath());

        UserSessionDao.UserSession userSession = chatService.authenticateUser(username);
        userSession.setChannelId(channelId); // 这里设置 channelId
        chatService.addUserSession(session.getId(), userSession);
        sessions.put(session.getId(), session);

        broadcastSystemMessage(channelId, userSession.getUsername() + " joined the chat!");
    }

    private String getChannelIdFromUri(String path) {
        // 路径格式应该是 "/chat/{channelId}"
        String[] parts = path.split("/");
        if (parts.length >= 3) {
            return parts[2]; // 取第三部分作为 channelId
        }
        throw new IllegalArgumentException("Invalid WebSocket path format");
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        UserSessionDao.UserSession userSession = chatService.getUserSession(session.getId());
        if (userSession == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE);
            return;
        }

        // 1. 解析客户端消息 JSON
        Map<String, String> payload = objectMapper.readValue(message.getPayload(), Map.class);
        String content = payload.get("content");
        String channelId = payload.get("channelId");

        // 2. 写入数据库
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("频道不存在"));
        User sender = userRepository.findByUsername(userSession.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        Message msg = new Message();
        msg.setContent(content);
        msg.setChannel(channel);
        msg.setSender(sender);
        messageRepository.save(msg); // 会自动触发 @PrePersist 设置 sentAt

        // 3. 广播消息
        String jsonResponse = objectMapper.writeValueAsString(
                Map.of(
                        "type", "CHAT",
                        "channelId", channelId,
                        "sender", sender.getUsername(),
                        "content", content,
                        "timestamp", msg.getSentAt().toString()
                )
        );

        for (WebSocketSession ws : sessions.values()) {
            UserSessionDao.UserSession wsUserSession = chatService.getUserSession(ws.getId());
            System.out.println(ws);
            System.out.println("检查会话: " + ws.getId());

            if (wsUserSession == null) {
                System.out.println("⚠️ 会话无用户信息: " + ws.getId());
                continue;
            }

            if (!ws.isOpen()) {
                System.out.println("⚠️ 会话已关闭: " + ws.getId());
                continue;
            }

            if (!channelId.equals(wsUserSession.getChannelId())) {
                System.out.println("⚠️ 会话不在目标频道: " + ws.getId() +
                        " (实际频道: " + wsUserSession.getChannelId() + ")");
                continue;
            }

            try {
                ws.sendMessage(new TextMessage(jsonResponse));
                System.out.println("✅ 成功发送消息到会话: " + ws.getId());
            } catch (IOException e) {
                System.out.println("❌ 发送失败: " + ws.getId() + " - " + e.getMessage());
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        UserSessionDao.UserSession userSession = chatService.getUserSession(session.getId());
        if (userSession != null) {
            String channelId = userSession.getChannelId();
            broadcastSystemMessage(channelId, userSession.getUsername() + " left the chat");
            chatService.removeUserSession(session.getId());
        }
        sessions.remove(session.getId());
    }

    private void broadcastSystemMessage(String channelId, String content) throws IOException {
        String messageJson = objectMapper.writeValueAsString(
                Map.of("type", "SYSTEM", "content", content)
        );

        for (WebSocketSession session : sessions.values()) {
            UserSessionDao.UserSession userSession = chatService.getUserSession(session.getId());
            if (session.isOpen() && userSession != null && channelId.equals(userSession.getChannelId())) {
                session.sendMessage(new TextMessage(messageJson));
            }
        }
    }

    private String getUsernameFromQuery(String query) {
        if (query == null || query.isEmpty()) {
            throw new IllegalArgumentException("Username parameter is required");
        }

        for (String param : query.split("&")) {
            String[] pair = param.split("=");
            if ("username".equals(pair[0]) && pair.length > 1) {
                return pair[1];
            }
        }

        throw new IllegalArgumentException("Username parameter is required");
    }
}
