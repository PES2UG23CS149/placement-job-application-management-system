package com.jobtracker.jobtracker;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    public AdminSeeder(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {

        String adminEmail = "admin@pesu.edu";

        if (userRepository.findByEmail(adminEmail).isEmpty()) {

            BCryptPasswordEncoder encoder =
                    new BCryptPasswordEncoder();

            User admin = new User();

            admin.setName("Placement Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(
                    encoder.encode("Admin@12345")
            );
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);

            System.out.println(
                    "========================================"
            );
            System.out.println(
                    "ADMIN ACCOUNT CREATED"
            );
            System.out.println(
                    "Email: admin@pesu.edu"
            );
            System.out.println(
                    "Password: Admin@12345"
            );
            System.out.println(
                    "========================================"
            );
        }
    }
}