package com.jobtracker.jobtracker;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(
            ApplicationService applicationService) {

        this.applicationService = applicationService;
    }

    // ---------------------------------------------------------
    // GET CURRENT STUDENT'S APPLICATIONS
    // ---------------------------------------------------------

    @GetMapping
    public List<Application> getMyApplications(
            Authentication authentication) {

        return applicationService.getByStudentEmail(
                authentication.getName()
        );
    }

    // ---------------------------------------------------------
    // APPLY FOR PLACEMENT DRIVE
    // ---------------------------------------------------------

    @PostMapping("/{driveId}")
    public Application apply(
            @PathVariable Long driveId,
            Authentication authentication) {

        return applicationService.apply(
                authentication.getName(),
                driveId
        );
    }

    // ---------------------------------------------------------
    // WITHDRAW APPLICATION
    // ---------------------------------------------------------

    @PutMapping("/{applicationId}/withdraw")
    public Application withdrawApplication(
            @PathVariable Long applicationId,
            Authentication authentication) {

        return applicationService.withdraw(
                authentication.getName(),
                applicationId
        );
    }
}