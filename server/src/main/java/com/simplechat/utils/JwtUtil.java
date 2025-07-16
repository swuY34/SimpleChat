package com.simplechat.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private final SecretKey secretKey;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        // 确保密钥长度至少为32个字符
        if (secret.length() < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 characters long");
        }
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // 生成 JWT，没有过期时间
    public String generateToken(String userId, Map<String, ?> claims) {
        Map<String, Object> finalClaims = new HashMap<>(claims);
        finalClaims.put("sub", userId); // 标准主题声明

        return Jwts.builder()
                .claims(finalClaims)
                .signWith(secretKey)
                .compact();
    }

    // 从 token 解析用户ID
    public String getUserIdFromToken(String token) {
        return parseToken(token).getSubject();
    }

    // 解析Token，返回Claims
    private Claims parseToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
    }

    // 验证token
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (RuntimeException e) {
            return false;
        }
    }
}