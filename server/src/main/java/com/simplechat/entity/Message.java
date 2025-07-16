package com.simplechat.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "messages") // 明确表名，防止默认命名冲突
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageId;

    // 多对一关联，消息所属频道，懒加载
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    // 多对一关联，消息发送者，懒加载
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    // 消息内容，使用大文本字段存储
    @Lob
    @Column(nullable = false)
    private String content;

    // 消息发送时间，插入时自动赋值，不可更新，序列化时格式化输出
    @Column(updatable = false, nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime sentAt;

    // 消息状态，枚举类型存储字符串，不能为空，默认 SENT
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageStatus status = MessageStatus.SENT;

    // 实体持久化前设置发送时间
    @PrePersist
    protected void onCreate() {
        this.sentAt = LocalDateTime.now();
    }

    // 消息状态枚举
    public enum MessageStatus {
        SENT, DELIVERED, READ
    }
}
