package com.jobtracker.jobtracker;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PlacementDriveService {

    private final PlacementDriveRepository repository;
    private final CompanyRepository companyRepository;

    public PlacementDriveService(
            PlacementDriveRepository repository,
            CompanyRepository companyRepository) {

        this.repository = repository;
        this.companyRepository = companyRepository;
    }

    public PlacementDrive create(PlacementDrive drive) {

        if (drive.getCompany() == null ||
                drive.getCompany().getId() == null) {

            throw new RuntimeException("Company is required");
        }

        Company company = companyRepository
                .findById(drive.getCompany().getId())
                .orElseThrow(() ->
                        new RuntimeException("Company not found"));

        drive.setCompany(company);

        if (drive.getStatus() == null ||
                drive.getStatus().isBlank()) {

            drive.setStatus("OPEN");
        }

        return repository.save(drive);
    }

    public List<PlacementDrive> getAll() {

        updateExpiredDrives();

        return repository.findAll();
    }

    public List<PlacementDrive> getOpenDrives() {

        updateExpiredDrives();

        return repository.findByStatus("OPEN");
    }

    public PlacementDrive getById(Long id) {

        updateExpiredDrives();

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Placement drive not found"));
    }

    public PlacementDrive update(
            Long id,
            PlacementDrive updatedDrive) {

        PlacementDrive existing = getById(id);

        if (updatedDrive.getCompany() != null &&
                updatedDrive.getCompany().getId() != null) {

            Company company = companyRepository
                    .findById(updatedDrive.getCompany().getId())
                    .orElseThrow(() ->
                            new RuntimeException("Company not found"));

            existing.setCompany(company);
        }

        existing.setJobTitle(updatedDrive.getJobTitle());
        existing.setLocation(updatedDrive.getLocation());
        existing.setSalary(updatedDrive.getSalary());
        existing.setDescription(updatedDrive.getDescription());
        existing.setDeadline(updatedDrive.getDeadline());
        existing.setMinCgpa(updatedDrive.getMinCgpa());
        existing.setEligibleBranch(updatedDrive.getEligibleBranch());
        existing.setStatus(updatedDrive.getStatus());

        return repository.save(existing);
    }

    public void delete(Long id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException(
                    "Placement drive not found");
        }

        repository.deleteById(id);
    }

    private void updateExpiredDrives() {

        List<PlacementDrive> openDrives =
                repository.findByStatus("OPEN");

        LocalDate today = LocalDate.now();

        for (PlacementDrive drive : openDrives) {

            if (drive.getDeadline() != null &&
                    drive.getDeadline().isBefore(today)) {

                drive.setStatus("CLOSED");
            }
        }

        repository.saveAll(openDrives);
    }
}