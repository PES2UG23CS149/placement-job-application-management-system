package com.jobtracker.jobtracker;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/drives")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentPlacementDriveController {

    private final PlacementDriveService placementDriveService;

    public StudentPlacementDriveController(
            PlacementDriveService placementDriveService) {
        this.placementDriveService = placementDriveService;
    }

    @GetMapping
    public List<PlacementDrive> getOpenDrives() {
        return placementDriveService.getOpenDrives();
    }

    @GetMapping("/{id}")
    public PlacementDrive getDrive(@PathVariable Long id) {
        return placementDriveService.getById(id);
    }
}