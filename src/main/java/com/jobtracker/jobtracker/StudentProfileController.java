package com.jobtracker.jobtracker;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/student/profile")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentProfileController {

    private final StudentService studentService;

    public StudentProfileController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    public Student createProfile(
            @RequestBody Student student,
            Authentication authentication) {

        String email = authentication.getName();

        student.setEmail(email);

        return studentService.create(student);
    }

    @GetMapping
    public Student getProfile(Authentication authentication) {

        String email = authentication.getName();

        return studentService.getByEmail(email);
    }

    @PutMapping
    public Student updateProfile(
            @RequestBody Student student,
            Authentication authentication) {

        String email = authentication.getName();

        return studentService.update(email, student);
    }

    @PostMapping("/resume")
    public Student uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        String email = authentication.getName();

        return studentService.uploadResume(email, file);
    }
}