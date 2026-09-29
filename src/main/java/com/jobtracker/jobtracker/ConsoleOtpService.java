package com.jobtracker.jobtracker;

import org.springframework.stereotype.Service;

@Service
public class ConsoleOtpService implements OtpService {

    @Override
    public void sendOtp(String phone, String otp) {

        System.out.println();
        System.out.println("========================================");
        System.out.println("        PLACEMENT PORTAL OTP");
        System.out.println("========================================");
        System.out.println("Phone : " + maskPhone(phone));
        System.out.println("OTP   : " + otp);
        System.out.println("Valid : 5 minutes");
        System.out.println("========================================");
        System.out.println();
    }

    private String maskPhone(String phone) {

        if (phone == null || phone.length() < 4) {
            return "****";
        }

        return "******" + phone.substring(phone.length() - 4);
    }
}