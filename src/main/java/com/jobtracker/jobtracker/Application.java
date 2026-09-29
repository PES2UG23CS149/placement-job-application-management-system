package com.jobtracker.jobtracker;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(
    name = "applications",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"student_id", "drive_id"}
        )
    }
)
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "drive_id", nullable = false)
    private PlacementDrive drive;

    @Column(nullable = false)
    private String status;

    private LocalDateTime appliedAt;
}