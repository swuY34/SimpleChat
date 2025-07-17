    package com.simplechat.controller;

    import com.simplechat.entity.Channel;
    import com.simplechat.entity.Message;
    import com.simplechat.repository.ChannelRepository;
    import com.simplechat.repository.MessageRepository;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.web.bind.annotation.*;

    import java.time.LocalDateTime;
    import java.util.List;

    @RestController
    @RequestMapping("/api/messages")
    public class MessageController {

        private final ChannelRepository channelRepository;
        private final MessageRepository messageRepository;

        @Autowired
        public MessageController(ChannelRepository channelRepository, MessageRepository messageRepository) {
            this.channelRepository = channelRepository;
            this.messageRepository = messageRepository;
        }

        // 获取频道消息列表
        @GetMapping("/channel/{channelId}")
        public List<MessageDTO> getMessagesByChannel(@PathVariable String channelId) {
            Channel channel = channelRepository.findById(channelId)
                    .orElseThrow(() -> new IllegalArgumentException("频道不存在"));

            List<Message> messages = messageRepository.findByChannelOrderBySentAtAsc(channel);

            return messages.stream()
                    .map(msg -> new MessageDTO(
                            msg.getMessageId(),
                            msg.getSender().getUsername(),
                            msg.getContent(),
                            msg.getSentAt()
                    ))
                    .toList();
        }

        // 响应 DTO
        public record MessageDTO(Long messageId, String sender, String content, LocalDateTime timestamp) {}
    }
