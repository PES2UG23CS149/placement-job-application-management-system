package com.jobtracker.jobtracker;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/drives")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminPlacementDriveController {

    private final PlacementDriveService placementDriveService;

    public AdminPlacementDriveController(
            PlacementDriveService placementDriveService) {
        this.placementDriveService = placementDriveService;
    }

    @PostMapping
    public PlacementDrive createDrive(
            @RequestBody PlacementDrive drive) {

        return placementDriveService.create(drive);
    }

    @GetMapping
    public List<PlacementDrive> getAllDrives() {
        return placementDriveService.getAll();
    }

    @GetMapping("/{id}")
    public PlacementDrive getDrive(
            @PathVariable Long id) {

        return placementDriveService.getById(id);
    }

    @PutMapping("/{id}")
    public PlacementDrive updateDrive(
            @PathVariable Long id,
            @RequestBody PlacementDrive drive) {

        return placementDriveService.update(id, drive);
    }

    @DeleteMapping("/{id}")
    public void deleteDrive(
            @PathVariable Long id) {

        placementDriveService.delete(id);
    }
}