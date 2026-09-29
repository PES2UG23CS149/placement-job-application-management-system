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
