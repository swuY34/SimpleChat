package com.simplechat.controller;

import com.simplechat.entity.*;
import com.simplechat.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/channels")
public class ChannelController {

    private final ChannelRepository channelRepository;
    private final UserRepository userRepository;
    private final ChannelMemberRepository channelMemberRepository;
    private final MessageRepository messageRepository;

    @Autowired
    public ChannelController(ChannelRepository channelRepository,
                             UserRepository userRepository,
                             ChannelMemberRepository channelMemberRepository,
                             MessageRepository messageRepository) {
        this.channelRepository = channelRepository;
        this.userRepository = userRepository;
        this.channelMemberRepository = channelMemberRepository;
        this.messageRepository = messageRepository;
    }

    // ✅ 加入频道，如果不存在就创建（channelName -> UUID）
    @PostMapping("/join")
    public Channel joinOrCreateChannel(@RequestBody JoinRequest request) {
        User user = userRepository.findById(request.getUserId()).orElseThrow(() ->
                new IllegalArgumentException("用户不存在"));

        String channelName = request.getChannelName();
        UUID channelUUID = UUID.nameUUIDFromBytes(channelName.getBytes(StandardCharsets.UTF_8));
        String channelId = channelUUID.toString();

        Optional<Channel> optionalChannel = channelRepository.findById(channelId);
        Channel channel;

        if (optionalChannel.isEmpty()) {
            channel = new Channel();
            channel.setChannelId(channelId);
            channel.setChannelName(channelName);
            channel.setCreatedBy(user);
            channel = channelRepository.save(channel);
        } else {
            channel = optionalChannel.get();
        }

        boolean alreadyJoined = channelMemberRepository.existsByUserAndChannel(user, channel);
        if (!alreadyJoined) {
            ChannelMember member = new ChannelMember();
            member.setUser(user);
            member.setChannel(channel);

            ChannelMemberId id = new ChannelMemberId();
            id.setUserId(user.getUserId());
            id.setChannelId(channel.getChannelId());
            member.setId(id);

            channelMemberRepository.save(member);
        }

        return channel;
    }

    // ✅ 退出频道
    @DeleteMapping("/{channelId}/leave")
    public String leaveChannel(@PathVariable String channelId, @RequestBody LeaveRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("频道不存在"));

        ChannelMemberId id = new ChannelMemberId();
        id.setUserId(user.getUserId());
        id.setChannelId(channel.getChannelId());

        if (channelMemberRepository.existsById(id)) {
            channelMemberRepository.deleteById(id);
            return "退出频道成功";
        } else {
            return "该用户未加入该频道";
        }
    }

    // ✅ 删除频道（包括成员 + 消息）
    @DeleteMapping("/{channelId}")
    public String deleteChannel(@PathVariable String channelId) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("频道不存在"));

        List<ChannelMember> members = channelMemberRepository.findByChannel(channel);
        channelMemberRepository.deleteAll(members);

        List<Message> messages = messageRepository.findByChannelOrderBySentAtAsc(channel);
        messageRepository.deleteAll(messages);

        channelRepository.delete(channel);

        return "频道删除成功";
    }

    // DTOs
    public static class JoinRequest {
        private String userId;
        private String channelName;

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getChannelName() { return channelName; }
        public void setChannelName(String channelName) { this.channelName = channelName; }
    }

    public static class LeaveRequest {
        private String userId;

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
    }
}
