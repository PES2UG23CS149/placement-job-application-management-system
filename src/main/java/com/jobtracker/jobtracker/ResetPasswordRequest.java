package com.jobtracker.jobtracker;

import lombok.Data;

@Data
public class ResetPasswordRequest {

    private String resetToken;

    private String newPassword;
}