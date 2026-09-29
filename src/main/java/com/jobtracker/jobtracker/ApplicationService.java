package com.jobtracker.jobtracker;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final PlacementDriveRepository placementDriveRepository;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            StudentRepository studentRepository,
            PlacementDriveRepository placementDriveRepository) {

        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.placementDriveRepository = placementDriveRepository;
    }

    // =========================================================
    // GET APPLICATIONS FOR A STUDENT
    // =========================================================

    public List<Application> getByStudentEmail(String email) {

        Student student = studentRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student profile not found"));

        return applicationRepository.findByStudent(student);
    }

    // =========================================================
    // APPLY FOR A PLACEMENT DRIVE
    // =========================================================

    public Application apply(
            String studentEmail,
            Long driveId) {

        // -----------------------------------------------------
        // 1. Find student
        // -----------------------------------------------------

        Student student = studentRepository
                .findByEmail(studentEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student profile not found"));

        // -----------------------------------------------------
        // 2. Find placement drive
        // -----------------------------------------------------

        PlacementDrive drive = placementDriveRepository
                .findById(driveId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Placement drive not found"));

        // -----------------------------------------------------
        // 3. Check whether drive is OPEN
        // -----------------------------------------------------

        if (!"OPEN".equalsIgnoreCase(drive.getStatus())) {

            throw new RuntimeException(
                    "This placement drive is not open for applications");
        }

        // -----------------------------------------------------
        // 4. Check application deadline
        // -----------------------------------------------------

        if (drive.getDeadline() != null &&
                !LocalDate.now().isBefore(drive.getDeadline())) {

            throw new RuntimeException(
                    "Application deadline has passed");
        }

        // -----------------------------------------------------
        // 5. Check student CGPA
        // -----------------------------------------------------

        if (student.getCgpa() == null) {

            throw new RuntimeException(
                    "Please update your CGPA before applying");
        }

        // -----------------------------------------------------
        // 6. Check CGPA eligibility
        // -----------------------------------------------------

        if (drive.getMinCgpa() != null &&
                student.getCgpa() < drive.getMinCgpa()) {

            throw new RuntimeException(
                    "You are not eligible based on CGPA");
        }

        // -----------------------------------------------------
        // 7. Check branch eligibility
        // -----------------------------------------------------

        if (drive.getEligibleBranch() != null &&
                !drive.getEligibleBranch().isBlank()) {

            if (student.getBranch() == null ||
                    !drive.getEligibleBranch()
                            .equalsIgnoreCase(student.getBranch())) {

                throw new RuntimeException(
                        "You are not eligible for this branch");
            }
        }

        // -----------------------------------------------------
        // 8. Check existing application
        // -----------------------------------------------------

        Optional<Application> existingApplication =
                applicationRepository.findByStudentAndDrive(
                        student,
                        drive
                );

        // -----------------------------------------------------
        // 9. Existing application found
        // -----------------------------------------------------

        if (existingApplication.isPresent()) {

            Application application =
                    existingApplication.get();

            // -----------------------------------------------
            // Previously withdrawn
            // -----------------------------------------------

            if ("WITHDRAWN".equalsIgnoreCase(
                    application.getStatus())) {

                // Re-activate the same application
                application.setStatus("APPLIED");

                // Update application time
                application.setAppliedAt(
                        LocalDateTime.now()
                );

                return applicationRepository.save(
                        application
                );
            }

            // -----------------------------------------------
            // Any other existing status
            // -----------------------------------------------

            throw new RuntimeException(
                    "You have already applied for this placement drive");
        }

        // -----------------------------------------------------
        // 10. Create new application
        // -----------------------------------------------------

        Application application =
                new Application();

        application.setStudent(student);
        application.setDrive(drive);
        application.setStatus("APPLIED");
        application.setAppliedAt(
                LocalDateTime.now()
        );

        return applicationRepository.save(
                application
        );
    }

    // =========================================================
    // GET APPLICATIONS FOR A PLACEMENT DRIVE
    // =========================================================

    public List<Application> getByDriveId(Long driveId) {

        PlacementDrive drive = placementDriveRepository
                .findById(driveId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Placement drive not found"));

        return applicationRepository.findByDrive(drive);
    }

    // =========================================================
    // UPDATE APPLICATION STATUS - ADMIN
    // =========================================================

    public Application updateStatus(
            Long applicationId,
            String status) {

        Application application =
                applicationRepository
                        .findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Application not found"));

        // -----------------------------------------------------
        // Validate status
        // -----------------------------------------------------

        if (status == null ||
                status.isBlank()) {

            throw new RuntimeException(
                    "Application status is required");
        }

        String normalizedStatus =
                status.trim().toUpperCase();

        // -----------------------------------------------------
        // Allowed statuses
        // -----------------------------------------------------

        if (!normalizedStatus.equals("APPLIED") &&
                !normalizedStatus.equals("SHORTLISTED") &&
                !normalizedStatus.equals("REJECTED") &&
                !normalizedStatus.equals("SELECTED") &&
                !normalizedStatus.equals("WITHDRAWN")) {

            throw new RuntimeException(
                    "Invalid application status");
        }

        application.setStatus(
                normalizedStatus
        );

        return applicationRepository.save(
                application
        );
    }

    // =========================================================
    // WITHDRAW APPLICATION - STUDENT
    // =========================================================

    public Application withdraw(
            String studentEmail,
            Long applicationId) {

        // -----------------------------------------------------
        // 1. Find application
        // -----------------------------------------------------

        Application application =
                applicationRepository
                        .findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Application not found"));

        // -----------------------------------------------------
        // 2. Check ownership
        // -----------------------------------------------------

        if (!application.getStudent()
                .getEmail()
                .equalsIgnoreCase(studentEmail)) {

            throw new RuntimeException(
                    "You are not allowed to withdraw this application");
        }

        // -----------------------------------------------------
        // 3. Only APPLIED applications can be withdrawn
        // -----------------------------------------------------

        if (!"APPLIED".equalsIgnoreCase(
                application.getStatus())) {

            throw new RuntimeException(
                    "Only an APPLIED application can be withdrawn");
        }

        // -----------------------------------------------------
        // 4. Get placement drive
        // -----------------------------------------------------

        PlacementDrive drive =
                application.getDrive();

        // -----------------------------------------------------
        // 5. Check deadline exists
        // -----------------------------------------------------

        if (drive.getDeadline() == null) {

            throw new RuntimeException(
                    "Application withdrawal is not available for this drive");
        }

        // -----------------------------------------------------
        // 6. Withdrawal must happen before deadline
        // -----------------------------------------------------

        if (!LocalDate.now().isBefore(
                drive.getDeadline())) {

            throw new RuntimeException(
                    "Application withdrawal deadline has passed");
        }

        // -----------------------------------------------------
        // 7. Change status to WITHDRAWN
        // -----------------------------------------------------

        application.setStatus("WITHDRAWN");

        return applicationRepository.save(
                application
        );
    }
}