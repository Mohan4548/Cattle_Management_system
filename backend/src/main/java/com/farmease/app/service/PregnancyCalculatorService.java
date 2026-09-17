package com.farmease.app.service;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@Service
public class PregnancyCalculatorService {

    public static final int GESTATION_PERIOD_DAYS = 283;

    public Map<String, Object> calculateGestation(LocalDate breedingDate) {
        if (breedingDate == null) return null;

        LocalDate edd = breedingDate.plusDays(GESTATION_PERIOD_DAYS);
        LocalDate today = LocalDate.now();

        long daysPassed = ChronoUnit.DAYS.between(breedingDate, today);
        long remainingDays = ChronoUnit.DAYS.between(today, edd);

        int progressPct = (int) Math.min(100, Math.max(0, (daysPassed * 100) / GESTATION_PERIOD_DAYS));
        int currentMonth = (int) Math.min(9, Math.ceil(daysPassed / 30.0));
        boolean isOverdue = remainingDays < 0;

        Map<String, Object> response = new HashMap<>();
        response.put("breedingDate", breedingDate.toString());
        response.put("expectedDeliveryDate", edd.toString());
        response.put("expectedDayOfWeek", edd.getDayOfWeek().toString());
        response.put("daysPassed", daysPassed);
        response.put("remainingDays", remainingDays);
        response.put("progressPercentage", progressPct);
        response.put("currentGestationMonth", currentMonth);
        response.put("isOverdue", isOverdue);

        return response;
    }
}
