package com.jobtracker.jobtracker;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final PendingLoginService pendingLoginService;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            JwtService jwtService,
            OtpService otpService,
            PendingLoginService pendingLoginService
    ) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.pendingLoginService = pendingLoginService;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    public String register(
            String name,
            String email,
            String phone,
            String password
    ) {

        // Validate name
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Name is required");
        }

        // Validate email
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }

        // Validate phone
        if (phone == null || phone.isBlank()) {
            throw new RuntimeException("Phone number is required");
        }

        // Validate password
        if (password == null || password.isBlank()) {
            throw new RuntimeException("Password is required");
        }

        if (password.length() < 8) {
            throw new RuntimeException(
                    "Password must be at least 8 characters"
            );
        }

        // Normalize email
        String normalizedEmail =
                email.trim().toLowerCase();

        // Check duplicate user
        if (userRepository
                .findByEmail(normalizedEmail)
                .isPresent()) {

            throw new RuntimeException(
                    "Email is already registered"
            );
        }

        // -----------------------------------------------------
        // Create User
        // -----------------------------------------------------

        User user = new User();

        user.setName(name.trim());
        user.setEmail(normalizedEmail);
        user.setPhone(phone.trim());

        // Store encrypted password
        user.setPassword(
                passwordEncoder.encode(password)
        );

        // Registration through this endpoint creates
        // a student account.
        user.setRole(Role.STUDENT);

        User savedUser =
                userRepository.save(user);

        // -----------------------------------------------------
        // Automatically create Student profile
        // -----------------------------------------------------

        createStudentProfileIfMissing(savedUser);

        // -----------------------------------------------------
        // Generate JWT
        // -----------------------------------------------------

        return jwtService.generateToken(
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    // =========================================================
    // LOGIN
    // =========================================================

    public Map<String, String> login(
            String email,
            String password
    ) {

        // Validate email
        if (email == null || email.isBlank()) {
            throw new RuntimeException(
                    "Email is required"
            );
        }

        // Validate password
        if (password == null || password.isBlank()) {
            throw new RuntimeException(
                    "Password is required"
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        // -----------------------------------------------------
        // Find user
        // -----------------------------------------------------

        User user = userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        // -----------------------------------------------------
        // Check password
        // -----------------------------------------------------

        if (!passwordEncoder.matches(
                password,
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "Wrong password"
            );
        }

        // -----------------------------------------------------
        // IMPORTANT:
        // Make sure every STUDENT has a Student profile.
        //
        // This also fixes old accounts that were created
        // before automatic Student profile creation existed.
        // -----------------------------------------------------

        if (user.getRole() == Role.STUDENT) {
            createStudentProfileIfMissing(user);
        }

        // -----------------------------------------------------
        // Check phone
        // -----------------------------------------------------

        if (user.getPhone() == null ||
                user.getPhone().isBlank()) {

            throw new RuntimeException(
                    "No phone number is registered for this account"
            );
        }

        // -----------------------------------------------------
        // Create OTP challenge
        // -----------------------------------------------------

        String challengeId =
                pendingLoginService.createChallenge(
                        user.getEmail(),
                        user.getPhone()
                );

        String otp =
                pendingLoginService.getOtp(
                        challengeId
                );

        // Development OTP service
        // prints OTP to Spring Boot console.
        otpService.sendOtp(
                user.getPhone(),
                otp
        );

        // -----------------------------------------------------
        // Return OTP response
        // -----------------------------------------------------

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
                "OTP has been sent to your registered phone number"
        );

        return response;
    }

    // =========================================================
    // VERIFY LOGIN OTP
    // =========================================================

    public String verifyOtp(
            String challengeId,
            String otp
    ) {

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

        // Verify OTP
        String email =
                pendingLoginService.verifyOtp(
                        challengeId,
                        otp.trim()
                );

        // Find user
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        // Safety check:
        // Student profile should exist before JWT
        // is finally issued.
        if (user.getRole() == Role.STUDENT) {
            createStudentProfileIfMissing(user);
        }

        // Generate JWT
        return jwtService.generateToken(
                user.getEmail(),
                user.getRole()
        );
    }

    // =========================================================
    // CREATE STUDENT PROFILE IF MISSING
    // =========================================================

    private void createStudentProfileIfMissing(
            User user
    ) {

        // Only STUDENT users should have Student profiles.
        if (user.getRole() != Role.STUDENT) {
            return;
        }

        // Check whether profile already exists.
        boolean profileExists =
                studentRepository
                        .findByEmail(user.getEmail())
                        .isPresent();

        // If it already exists, do nothing.
        if (profileExists) {
            return;
        }

        // Create new Student profile.
        Student student = new Student();

        student.setName(user.getName());
        student.setEmail(user.getEmail());

        // These will be filled from My Profile.
        student.setCgpa(null);
        student.setBranch(null);
        student.setResumeUrl(null);

        studentRepository.save(student);
    }
}