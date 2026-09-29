package com.jobtracker.jobtracker;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final Cloudinary cloudinary;

    public StudentService(
            StudentRepository studentRepository,
            Cloudinary cloudinary) {

        this.studentRepository = studentRepository;
        this.cloudinary = cloudinary;
    }

    // ==============================
    // CREATE STUDENT PROFILE
    // ==============================
    public Student create(Student student) {

        if (studentRepository.findByEmail(student.getEmail()).isPresent()) {
            throw new RuntimeException("Student already exists");
        }

        return studentRepository.save(student);
    }

    // ==============================
    // GET STUDENT PROFILE
    // ==============================
    public Student getByEmail(String email) {

        return studentRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Student profile not found"));
    }

    // ==============================
    // UPDATE STUDENT PROFILE
    // ==============================
    public Student update(String email, Student updatedStudent) {

        Student existing = getByEmail(email);

        existing.setName(updatedStudent.getName());
        existing.setCgpa(updatedStudent.getCgpa());
        existing.setBranch(updatedStudent.getBranch());
        existing.setResumeUrl(updatedStudent.getResumeUrl());

        return studentRepository.save(existing);
    }

    // ==============================
    // UPLOAD RESUME
    // ==============================
    public Student uploadResume(String email, MultipartFile file) {

        // Find student
        Student student = getByEmail(email);

        // Check file exists
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select a resume file");
        }

        // Check PDF
        if (!"application/pdf".equalsIgnoreCase(file.getContentType())) {
            throw new RuntimeException("Only PDF files are allowed");
        }

        // Maximum 10 MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException(
                    "Resume size must not exceed 10 MB");
        }

        try {

            // Upload PDF to Cloudinary
            Map<String, Object> uploadResult =
                    cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.asMap(
                                    "resource_type", "image",
                                    "folder", "jobtracker/resumes",
                                    "use_filename", true,
                                    "unique_filename", true
                            )
                    );

            // Get Cloudinary secure URL
            String resumeUrl =
                    (String) uploadResult.get("secure_url");

            // Save URL in student profile
            student.setResumeUrl(resumeUrl);

            return studentRepository.save(student);

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to upload resume to Cloudinary", e);
        }
    }
}