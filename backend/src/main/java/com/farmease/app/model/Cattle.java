package com.farmease.app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "cattles")
public class Cattle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String tagNumber;

    private String internalId;
    private String nickname;
    private String officialName;
    private String photoUrl;
    private String breed;
    private String color;
    private String gender;
    private LocalDate dob;
    private Double weightKg;
    private Double heightCm;
    private LocalDate purchaseDate;
    private Double purchasePrice;
    private Double currentMarketValue;
    private String owner;

    @Enumerated(EnumType.STRING)
    private CattleStatus status;

    private String healthStatus;
    private String motherTag;
    private String fatherTag;
    private String grandMotherTag;
    private Integer lactationNumber;

    @Column(length = 1000)
    private String notes;

    public Cattle() {
    }

    public Cattle(Long id,
                  String tagNumber,
                  String internalId,
                  String nickname,
                  String officialName,
                  String photoUrl,
                  String breed,
                  String color,
                  String gender,
                  LocalDate dob,
                  Double weightKg,
                  Double heightCm,
                  LocalDate purchaseDate,
                  Double purchasePrice,
                  Double currentMarketValue,
                  String owner,
                  CattleStatus status,
                  String healthStatus,
                  String motherTag,
                  String fatherTag,
                  String grandMotherTag,
                  Integer lactationNumber,
                  String notes) {
        this.id = id;
        this.tagNumber = tagNumber;
        this.internalId = internalId;
        this.nickname = nickname;
        this.officialName = officialName;
        this.photoUrl = photoUrl;
        this.breed = breed;
        this.color = color;
        this.gender = gender;
        this.dob = dob;
        this.weightKg = weightKg;
        this.heightCm = heightCm;
        this.purchaseDate = purchaseDate;
        this.purchasePrice = purchasePrice;
        this.currentMarketValue = currentMarketValue;
        this.owner = owner;
        this.status = status;
        this.healthStatus = healthStatus;
        this.motherTag = motherTag;
        this.fatherTag = fatherTag;
        this.grandMotherTag = grandMotherTag;
        this.lactationNumber = lactationNumber;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTagNumber() {
        return tagNumber;
    }

    public void setTagNumber(String tagNumber) {
        this.tagNumber = tagNumber;
    }

    public String getInternalId() {
        return internalId;
    }

    public void setInternalId(String internalId) {
        this.internalId = internalId;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getOfficialName() {
        return officialName;
    }

    public void setOfficialName(String officialName) {
        this.officialName = officialName;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getBreed() {
        return breed;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public Double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
    }

    public Double getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(Double heightCm) {
        this.heightCm = heightCm;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public Double getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(Double purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public Double getCurrentMarketValue() {
        return currentMarketValue;
    }

    public void setCurrentMarketValue(Double currentMarketValue) {
        this.currentMarketValue = currentMarketValue;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public CattleStatus getStatus() {
        return status;
    }

    public void setStatus(CattleStatus status) {
        this.status = status;
    }

    public String getHealthStatus() {
        return healthStatus;
    }

    public void setHealthStatus(String healthStatus) {
        this.healthStatus = healthStatus;
    }

    public String getMotherTag() {
        return motherTag;
    }

    public void setMotherTag(String motherTag) {
        this.motherTag = motherTag;
    }

    public String getFatherTag() {
        return fatherTag;
    }

    public void setFatherTag(String fatherTag) {
        this.fatherTag = fatherTag;
    }

    public String getGrandMotherTag() {
        return grandMotherTag;
    }

    public void setGrandMotherTag(String grandMotherTag) {
        this.grandMotherTag = grandMotherTag;
    }

    public Integer getLactationNumber() {
        return lactationNumber;
    }

    public void setLactationNumber(Integer lactationNumber) {
        this.lactationNumber = lactationNumber;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
