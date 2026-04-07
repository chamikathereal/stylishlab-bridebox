package com.stylishlab.bridebox.stylishlab_bridebox_backend.user.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmployeeId(Long employeeId);
    boolean existsByUsername(String username);
}
