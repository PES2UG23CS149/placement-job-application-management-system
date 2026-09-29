package com.jobtracker.jobtracker;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String website;

    @Column(length = 2000)
    private String description;
}