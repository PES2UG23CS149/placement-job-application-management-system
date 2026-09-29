package com.jobtracker.jobtracker;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "placement_drives")
public class PlacementDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false)
    private String jobTitle;

    private String location;

    private String salary;

    @Column(length = 3000)
    private String description;

    private LocalDate deadline;

    private Double minCgpa;

    private String eligibleBranch;

    private String status;
}