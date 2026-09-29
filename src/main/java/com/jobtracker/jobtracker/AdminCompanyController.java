package com.jobtracker.jobtracker;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/companies")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminCompanyController {

    private final CompanyService companyService;

    public AdminCompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping
    public Company createCompany(@RequestBody Company company) {
        return companyService.create(company);
    }

    @GetMapping
    public List<Company> getAllCompanies() {
        return companyService.getAll();
    }

    @GetMapping("/{id}")
    public Company getCompany(@PathVariable Long id) {
        return companyService.getById(id);
    }

    @PutMapping("/{id}")
    public Company updateCompany(
            @PathVariable Long id,
            @RequestBody Company company) {

        return companyService.update(id, company);
    }

    @DeleteMapping("/{id}")
    public void deleteCompany(@PathVariable Long id) {
        companyService.delete(id);
    }
}