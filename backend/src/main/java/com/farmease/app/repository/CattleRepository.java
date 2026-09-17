package com.farmease.app.repository;

import com.farmease.app.model.Cattle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CattleRepository extends JpaRepository<Cattle, Long> {
    Optional<Cattle> findByTagNumber(String tagNumber);
}
