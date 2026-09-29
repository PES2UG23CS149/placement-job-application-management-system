# Placement Job Application Management System

A full-stack web application designed to manage student placement activities and job applications.

The system provides separate dashboards for **Students** and **Administrators**, with secure authentication, placement drive management, application tracking, resume upload, and application status management.

---

## Features

### Student

- Student registration and login
- OTP-based login verification
- Forgot password and OTP-based password reset
- Role-based authentication using JWT
- Student profile management
- CGPA and branch management
- Resume upload and storage using Cloudinary
- View available placement drives
- Search and filter placement drives
- Apply for placement drives
- Withdraw applications
- Re-apply after withdrawal
- Track application status
- View application statistics on the dashboard

### Administrator

- Secure admin authentication
- Admin dashboard
- Company management
- Placement drive management
- View all student applications
- Search and filter applicants
- Update application status
- Track placement statistics
- Automatically close placement drives after their deadline

### Application Status

Applications can move through the following statuses:

```text
APPLIED
SHORTLISTED
REJECTED
SELECTED
WITHDRAWN

Tech Stack
Frontend
React
Vite
JavaScript
HTML5
CSS3
Tailwind CSS
Axios
React Router
Backend
Java 21
Spring Boot
Spring Security
JWT
Spring Data JPA
Hibernate
MySQL
Maven
Lombok
External Services
Cloudinary – Resume storage
Postman – API testing
Git & GitHub – Version control
Main Modules
Student Module
Dashboard
Student profile
Resume upload
Placement drives
Applications
Application status tracking
Admin Module
Dashboard
Company management
Placement drive management
Applicant management
Application status management
Security

The application uses:

Spring Security
JWT authentication
BCrypt password hashing
Role-based authorization
Protected Student and Admin APIs
CORS configuration
Duplicate application prevention
File type and size validation
Gitignored local credentials
