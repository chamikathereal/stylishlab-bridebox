package com.stylishlab.bridebox.stylishlab_bridebox_backend.auth.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.auth.entity.PasswordResetToken;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser(User user);
    void deleteByUser(User user);
}
