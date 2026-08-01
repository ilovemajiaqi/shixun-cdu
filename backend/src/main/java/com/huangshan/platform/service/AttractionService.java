package com.huangshan.platform.service;

import com.huangshan.platform.entity.Attraction;
import com.huangshan.platform.repository.AttractionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AttractionService {

    @Autowired
    private AttractionRepository attractionRepository;

    @Cacheable(value = "attractions")
    public List<Attraction> getAllAttractions() {
        return attractionRepository.findAll();
    }

    @Cacheable(value = "attraction", key = "#id")
    public Attraction getAttractionById(Long id) {
        return attractionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attraction not found"));
    }
}
