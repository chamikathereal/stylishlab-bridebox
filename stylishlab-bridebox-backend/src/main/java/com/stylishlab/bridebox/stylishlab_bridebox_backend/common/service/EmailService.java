package com.stylishlab.bridebox.stylishlab_bridebox_backend.common.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);

            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}", to, e);
        }
    }

    public void sendPasswordResetEmail(String to, String resetLink) {
        String subject = "Password Reset - Stylish Lab Bridebox";
        String body = "<h3>Password Reset Request</h3>" +
                "<p>We received a request to reset your password for the Salon Management System.</p>" +
                "<p>Click the link below to set a new password. This link will expire in 1 hour:</p>" +
                "<p><a href=\"" + resetLink + "\">Reset My Password</a></p>" +
                "<p>If you did not request this, please ignore this email.</p>";
        
        sendEmail(to, subject, body);
    }
}
