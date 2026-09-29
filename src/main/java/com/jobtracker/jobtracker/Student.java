package com.jobtracker.jobtracker;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private Double cgpa;

    private String branch;

    private String resumeUrl;
}