package com.simplechat.repository;

import com.simplechat.entity.Channel;
import com.simplechat.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, String> {
    List<Message> findByChannelOrderBySentAtAsc(Channel channel);

}
