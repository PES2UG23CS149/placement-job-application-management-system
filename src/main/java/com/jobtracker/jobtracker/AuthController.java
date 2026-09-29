package com.jobtracker.jobtracker;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(
            @RequestBody RegisterRequest request
    ) {

        return authService.register(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getPassword()
        );
    }

    @PostMapping("/login")
    public Map<String, String> login(
            @RequestBody LoginRequest request
    ) {

        return authService.login(
                request.getEmail(),
                request.getPassword()
        );
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(
            @RequestBody OtpVerifyRequest request
    ) {

        return authService.verifyOtp(
                request.getChallengeId(),
                request.getOtp()
        );
    }
}