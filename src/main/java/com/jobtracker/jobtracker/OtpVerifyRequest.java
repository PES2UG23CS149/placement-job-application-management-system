package com.jobtracker.jobtracker;

import lombok.Data;

@Data
public class OtpVerifyRequest {

    private String challengeId;

    private String otp;
}