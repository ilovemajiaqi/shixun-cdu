package com.huangshan.platform.controller;

import com.huangshan.platform.entity.Attraction;
import com.huangshan.platform.service.AttractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attractions")
@CrossOrigin(origins = "*") // Allow all for simplicity in demo
public class AttractionController {

    @Autowired
    private AttractionService attractionService;

    @GetMapping
    public List<Attraction> getAllAttractions() {
        return attractionService.getAllAttractions();
    }

    @GetMapping("/{id}")
    public Attraction getAttractionById(@PathVariable Long id) {
        return attractionService.getAttractionById(id);
    }
}
