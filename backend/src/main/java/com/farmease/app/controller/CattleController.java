package com.farmease.app.controller;

import com.farmease.app.model.Cattle;
import com.farmease.app.repository.CattleRepository;
import com.farmease.app.service.PregnancyCalculatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cattles")
@CrossOrigin(origins = "*")
public class CattleController {

    @Autowired
    private CattleRepository cattleRepository;

    @Autowired
    private PregnancyCalculatorService pregnancyService;

    @GetMapping
    public List<Cattle> getAllCattles() {
        return cattleRepository.findAll();
    }

    @GetMapping("/{tagNumber}")
    public ResponseEntity<Cattle> getCattleByTag(@PathVariable String tagNumber) {
        return cattleRepository.findByTagNumber(tagNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Cattle createCattle(@RequestBody Cattle cattle) {
        return cattleRepository.save(cattle);
    }

    @GetMapping("/{tagNumber}/gestation-calculator")
    public ResponseEntity<Map<String, Object>> getGestationDetails(
            @PathVariable String tagNumber,
            @RequestParam("breedingDate") String breedingDateStr) {
        
        LocalDate breedingDate = LocalDate.parse(breedingDateStr);
        Map<String, Object> result = pregnancyService.calculateGestation(breedingDate);
        return ResponseEntity.ok(result);
    }
}
