package com.jobtracker.jobtracker;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PendingLoginService {

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 5;

    private final SecureRandom secureRandom = new SecureRandom();

    private final Map<String, PendingLogin> pendingLogins =
            new ConcurrentHashMap<>();

    // ==========================================
    // CREATE LOGIN CHALLENGE
    // ==========================================
    public String createChallenge(String email, String phone) {

        String challengeId = UUID.randomUUID().toString();

        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );

        PendingLogin pendingLogin = new PendingLogin(
                email,
                phone,
                otp,
                LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)
        );

        pendingLogins.put(challengeId, pendingLogin);

        return challengeId;
    }

    // ==========================================
    // VERIFY OTP
    // ==========================================
    public String verifyOtp(
            String challengeId,
            String otp
    ) {

        PendingLogin pendingLogin =
                pendingLogins.get(challengeId);

        // Challenge does not exist
        if (pendingLogin == null) {

            throw new RuntimeException(
                    "Invalid or expired login session"
            );
        }

        // OTP expired
        if (LocalDateTime.now()
                .isAfter(pendingLogin.expiresAt())) {

            pendingLogins.remove(challengeId);

            throw new RuntimeException(
                    "OTP has expired"
            );
        }

        // Maximum attempts already reached
        if (pendingLogin.attempts() >= MAX_ATTEMPTS) {

            pendingLogins.remove(challengeId);

            throw new RuntimeException(
                    "Maximum OTP attempts exceeded"
            );
        }

        // Count this attempt
        pendingLogin.incrementAttempts();

        // Wrong OTP
        if (!pendingLogin.otp().equals(otp)) {

            if (pendingLogin.attempts() >= MAX_ATTEMPTS) {

                pendingLogins.remove(challengeId);

                throw new RuntimeException(
                        "Maximum OTP attempts exceeded"
                );
            }

            throw new RuntimeException(
                    "Invalid OTP. Attempts remaining: "
                            + (MAX_ATTEMPTS
                            - pendingLogin.attempts())
            );
        }

        // OTP is correct
        String email = pendingLogin.email();

        // OTP can only be used once
        pendingLogins.remove(challengeId);

        return email;
    }

    // ==========================================
    // GET OTP
    // ==========================================
    public String getOtp(String challengeId) {

        PendingLogin pendingLogin =
                pendingLogins.get(challengeId);

        if (pendingLogin == null) {

            throw new RuntimeException(
                    "Invalid or expired login session"
            );
        }

        if (LocalDateTime.now()
                .isAfter(pendingLogin.expiresAt())) {

            pendingLogins.remove(challengeId);

            throw new RuntimeException(
                    "OTP has expired"
            );
        }

        return pendingLogin.otp();
    }

    // ==========================================
    // PENDING LOGIN DATA
    // ==========================================
    private static class PendingLogin {

        private final String email;
        private final String phone;
        private final String otp;
        private final LocalDateTime expiresAt;

        private int attempts;

        public PendingLogin(
                String email,
                String phone,
                String otp,
                LocalDateTime expiresAt
        ) {

            this.email = email;
            this.phone = phone;
            this.otp = otp;
            this.expiresAt = expiresAt;
            this.attempts = 0;
        }

        public String email() {
            return email;
        }

        public String phone() {
            return phone;
        }

        public String otp() {
            return otp;
        }

        public LocalDateTime expiresAt() {
            return expiresAt;
        }

        public int attempts() {
            return attempts;
        }

        public void incrementAttempts() {
            attempts++;
        }
    }
}