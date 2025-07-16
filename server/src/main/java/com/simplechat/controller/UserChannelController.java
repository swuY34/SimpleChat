package com.simplechat.controller;

import com.simplechat.entity.Channel;
import com.simplechat.entity.User;
import com.simplechat.repository.ChannelMemberRepository;
import com.simplechat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserChannelController {

    private final UserRepository userRepository;
    private final ChannelMemberRepository channelMemberRepository;

    @Autowired
    public UserChannelController(UserRepository userRepository, ChannelMemberRepository channelMemberRepository) {
        this.userRepository = userRepository;
        this.channelMemberRepository = channelMemberRepository;
    }

    // 查询该用户已加入的频道列表（仅返回 ID 和名称）
    @GetMapping("/{userId}/channels")
    public List<ChannelSummary> getUserChannels(@PathVariable String userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return channelMemberRepository.findByUser(user).stream()
                .map(member -> {
                    Channel channel = member.getChannel();
                    return new ChannelSummary(channel.getChannelId(), channel.getChannelName());
                })
                .toList();
    }

    // DTO
    public record ChannelSummary(String channelId, String channelName) {}
}
