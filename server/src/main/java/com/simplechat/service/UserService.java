package com.simplechat.service;

import com.simplechat.entity.User;
import com.simplechat.repository.UserRepository;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(User user) {
        try {
            return userRepository.save(user);
        } catch (OptimisticLockingFailureException e) {
            throw new IllegalStateException("该用户信息已被其他用户修改，请重试！");
        }
    }
}