package com.jobtracker.jobtracker;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class PasswordResetController {

    private final UserRepository userRepository;
    private final PasswordResetService passwordResetService;
    private final OtpService otpService;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public PasswordResetController(
            UserRepository userRepository,
            PasswordResetService passwordResetService,
            OtpService otpService
    ) {
        this.userRepository = userRepository;
        this.passwordResetService = passwordResetService;
        this.otpService = otpService;
    }

    // ==========================================
    // FORGOT PASSWORD
    // ==========================================
    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(
            @RequestBody ForgotPasswordRequest request
    ) {

        if (request.getEmail() == null ||
                request.getEmail().isBlank()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "No account found with this email"
                        )
                );

        if (user.getPhone() == null ||
                user.getPhone().isBlank()) {

            throw new RuntimeException(
                    "No phone number is registered for this account"
            );
        }

        String challengeId =
                passwordResetService.createChallenge(
                        user.getEmail(),
                        user.getPhone()
                );

        String otp =
                passwordResetService.getOtp(
                        challengeId
                );

        otpService.sendOtp(
                user.getPhone(),
                otp
        );

        Map<String, String> response =
                new HashMap<>();

        response.put(
                "status",
                "OTP_REQUIRED"
        );

        response.put(
                "challengeId",
                challengeId
        );

        response.put(
                "message",
                "Password reset OTP has been sent to your registered phone number"
        );

        return response;
    }

    // ==========================================
    // VERIFY RESET OTP
    // ==========================================
    @PostMapping("/verify-reset-otp")
    public Map<String, String> verifyResetOtp(
            @RequestBody Map<String, String> request
    ) {

        String challengeId =
                request.get("challengeId");

        String otp =
                request.get("otp");

        if (challengeId == null ||
                challengeId.isBlank()) {

            throw new RuntimeException(
                    "Challenge ID is required"
            );
        }

        if (otp == null ||
                otp.isBlank()) {

            throw new RuntimeException(
                    "OTP is required"
            );
        }

        String resetToken =
                passwordResetService.verifyOtp(
                        challengeId,
                        otp.trim()
                );

        Map<String, String> response =
                new HashMap<>();

        response.put(
                "status",
                "OTP_VERIFIED"
        );

        response.put(
                "resetToken",
                resetToken
        );

        response.put(
                "message",
                "OTP verified successfully"
        );

        return response;
    }

    // ==========================================
    // RESET PASSWORD
    // ==========================================
    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(
            @RequestBody ResetPasswordRequest request
    ) {

        if (request.getResetToken() == null ||
                request.getResetToken().isBlank()) {

            throw new RuntimeException(
                    "Reset token is required"
            );
        }

        if (request.getNewPassword() == null ||
                request.getNewPassword().isBlank()) {

            throw new RuntimeException(
                    "New password is required"
            );
        }

        if (request.getNewPassword().length() < 8) {

            throw new RuntimeException(
                    "Password must be at least 8 characters"
            );
        }

        String email =
                passwordResetService
                        .getEmailFromResetToken(
                                request.getResetToken()
                        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);

        // Make reset token single-use
        passwordResetService.consumeResetToken(
                request.getResetToken()
        );

        Map<String, String> response =
                new HashMap<>();

        response.put(
                "status",
                "PASSWORD_RESET"
        );

        response.put(
                "message",
                "Password has been reset successfully"
        );

        return response;
    }
}