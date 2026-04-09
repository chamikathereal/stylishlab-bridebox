package com.stylishlab.bridebox.stylishlab_bridebox_backend.user.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByEmployeeId(Long employeeId);
    boolean existsByUsername(String username);
}
