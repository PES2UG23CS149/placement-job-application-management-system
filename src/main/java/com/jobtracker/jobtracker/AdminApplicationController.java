package com.jobtracker.jobtracker;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminApplicationController {

    private final ApplicationService applicationService;

    public AdminApplicationController(
            ApplicationService applicationService) {

        this.applicationService = applicationService;
    }

    // Get all applicants for a placement drive
    @GetMapping("/drives/{driveId}/applications")
    public List<Application> getApplicants(
            @PathVariable Long driveId) {

        return applicationService.getByDriveId(driveId);
    }

    // Update application status
    @PutMapping("/applications/{applicationId}/status")
    public Application updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestBody StatusUpdateRequest request) {

        return applicationService.updateStatus(
                applicationId,
                request.getStatus()
        );
    }
}