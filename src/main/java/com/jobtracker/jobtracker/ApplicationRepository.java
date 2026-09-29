package com.jobtracker.jobtracker;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository
        extends JpaRepository<Application, Long> {

    // Get all applications submitted by a student
    List<Application> findByStudent(Student student);

    // Get all applications for a placement drive
    List<Application> findByDrive(PlacementDrive drive);

    // Check whether an application already exists
    boolean existsByStudentAndDrive(
            Student student,
            PlacementDrive drive
    );

    // Find an existing application for a student and drive
    Optional<Application> findByStudentAndDrive(
            Student student,
            PlacementDrive drive
    );
}