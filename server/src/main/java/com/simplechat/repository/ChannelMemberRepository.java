package com.simplechat.repository;

import com.simplechat.entity.Channel;
import com.simplechat.entity.ChannelMember;
import com.simplechat.entity.ChannelMemberId;
import com.simplechat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChannelMemberRepository extends JpaRepository<ChannelMember, ChannelMemberId> {
    List<ChannelMember> findByUser(User user);
    List<ChannelMember> findByChannel(Channel channel);
    boolean existsByUserAndChannel(User user, Channel channel);
}
