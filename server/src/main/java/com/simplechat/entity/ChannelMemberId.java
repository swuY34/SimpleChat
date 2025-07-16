package com.simplechat.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
public class ChannelMemberId implements Serializable {

    @Column(name = "channel_id", columnDefinition = "CHAR(36)")
    private String channelId;

    @Column(name = "user_id", columnDefinition = "CHAR(36)")
    private String userId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChannelMemberId that = (ChannelMemberId) o;
        return channelId.equals(that.channelId) && userId.equals(that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(channelId, userId);
    }
}