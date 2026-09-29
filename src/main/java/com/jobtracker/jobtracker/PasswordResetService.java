package com.jobtracker.jobtracker;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordResetService {

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int RESET_TOKEN_EXPIRY_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 5;

    private final SecureRandom secureRandom = new SecureRandom();

    private final Map<String, PasswordResetChallenge> resetChallenges =
            new ConcurrentHashMap<>();

    private final Map<String, ResetTokenData> resetTokens =
            new ConcurrentHashMap<>();

    // ==========================================
    // CREATE PASSWORD RESET CHALLENGE
    // ==========================================
    public String createChallenge(
            String email,
            String phone
    ) {

        String challengeId = UUID.randomUUID().toString();

        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );

        PasswordResetChallenge challenge =
                new PasswordResetChallenge(
                        email,
                        phone,
                        otp,
                        LocalDateTime.now()
                                .plusMinutes(OTP_EXPIRY_MINUTES)
                );

        resetChallenges.put(
                challengeId,
                challenge
        );

        return challengeId;
    }

    // ==========================================
    // GET OTP
    // ==========================================
    public String getOtp(String challengeId) {

        PasswordResetChallenge challenge =
                resetChallenges.get(challengeId);

        if (challenge == null) {

            throw new RuntimeException(
                    "Invalid or expired password reset session"
            );
        }

        if (LocalDateTime.now()
                .isAfter(challenge.expiresAt())) {

            resetChallenges.remove(challengeId);

            throw new RuntimeException(
                    "Password reset OTP has expired"
            );
        }

        return challenge.otp();
    }

    // ==========================================
    // VERIFY OTP
    // ==========================================
    public String verifyOtp(
            String challengeId,
            String otp
    ) {

        PasswordResetChallenge challenge =
                resetChallenges.get(challengeId);

        if (challenge == null) {

            throw new RuntimeException(
                    "Invalid or expired password reset session"
            );
        }

        // Check expiry
        if (LocalDateTime.now()
                .isAfter(challenge.expiresAt())) {

            resetChallenges.remove(challengeId);

            throw new RuntimeException(
                    "Password reset OTP has expired"
            );
        }

        // Check maximum attempts
        if (challenge.attempts() >= MAX_ATTEMPTS) {

            resetChallenges.remove(challengeId);

            throw new RuntimeException(
                    "Maximum OTP attempts exceeded"
            );
        }

        // Count attempt
        challenge.incrementAttempts();

        // Check OTP
        if (!challenge.otp().equals(otp)) {

            if (challenge.attempts() >= MAX_ATTEMPTS) {

                resetChallenges.remove(challengeId);

                throw new RuntimeException(
                        "Maximum OTP attempts exceeded"
                );
            }

            throw new RuntimeException(
                    "Invalid OTP. Attempts remaining: "
                            + (MAX_ATTEMPTS
                            - challenge.attempts())
            );
        }

        // OTP is correct
        String email = challenge.email();

        // OTP becomes single-use
        resetChallenges.remove(challengeId);

        // Create temporary password reset token
        String resetToken = UUID.randomUUID().toString();

        ResetTokenData resetTokenData =
                new ResetTokenData(
                        email,
                        LocalDateTime.now()
                                .plusMinutes(
                                        RESET_TOKEN_EXPIRY_MINUTES
                                )
                );

        resetTokens.put(
                resetToken,
                resetTokenData
        );

        return resetToken;
    }

    // ==========================================
    // GET EMAIL FROM RESET TOKEN
    // ==========================================
    public String getEmailFromResetToken(
            String resetToken
    ) {

        ResetTokenData resetTokenData =
                resetTokens.get(resetToken);

        if (resetTokenData == null) {

            throw new RuntimeException(
                    "Invalid or expired password reset token"
            );
        }

        if (LocalDateTime.now()
                .isAfter(resetTokenData.expiresAt())) {

            resetTokens.remove(resetToken);

            throw new RuntimeException(
                    "Password reset token has expired"
            );
        }

        return resetTokenData.email();
    }

    // ==========================================
    // CONSUME RESET TOKEN
    // ==========================================
    public void consumeResetToken(
            String resetToken
    ) {

        resetTokens.remove(resetToken);
    }

    // ==========================================
    // PASSWORD RESET CHALLENGE
    // ==========================================
    private static class PasswordResetChallenge {

        private final String email;
        private final String phone;
        private final String otp;
        private final LocalDateTime expiresAt;

        private int attempts;

        public PasswordResetChallenge(
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

    // ==========================================
    // PASSWORD RESET TOKEN
    // ==========================================
    private static class ResetTokenData {

        private final String email;
        private final LocalDateTime expiresAt;

        public ResetTokenData(
                String email,
                LocalDateTime expiresAt
        ) {

            this.email = email;
            this.expiresAt = expiresAt;
        }

        public String email() {
            return email;
        }

        public LocalDateTime expiresAt() {
            return expiresAt;
        }
    }
}