package com.jobtracker.jobtracker;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository repository;

    public CompanyService(CompanyRepository repository) {
        this.repository = repository;
    }

    public Company create(Company company) {
        return repository.save(company);
    }

    public List<Company> getAll() {
        return repository.findAll();
    }

    public Company getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Company not found"));
    }

    public Company update(Long id, Company updatedCompany) {

        Company existing = getById(id);

        existing.setName(updatedCompany.getName());
        existing.setWebsite(updatedCompany.getWebsite());
        existing.setDescription(updatedCompany.getDescription());

        return repository.save(existing);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Company not found");
        }

        repository.deleteById(id);
    }
}