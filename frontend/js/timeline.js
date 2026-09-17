/* FarmEase Cattle Lifecycle Timeline Module */

const TimelineModule = {
  getEventsForCattle(cattleTag) {
    const data = DataStore.get();
    const cattle = data.cattles.find(c => c.tagNumber === cattleTag);
    const events = [];

    if (!cattle) return events;

    // 1. Birth Event
    events.push({
      date: cattle.dob,
      title: "Birth Recorded",
      icon: "fa-cake-candles",
      color: "var(--primary-600)",
      description: `Born on farm. Weight: ${cattle.weight || 45} kg. Breed: ${cattle.breed}.`
    });

    // 2. Purchase / Farm Entry Event
    if (cattle.purchaseDate && cattle.purchaseDate !== "Born in Farm") {
      events.push({
        date: cattle.purchaseDate,
        title: "Purchased & Registered",
        icon: "fa-cart-shopping",
        color: "#3b82f6",
        description: `Acquired for $${cattle.purchasePrice}. Official Tag assigned: ${cattle.tagNumber}.`
      });
    }

    // 3. Health & Vaccinations
    const healthLogs = data.healthRecords.filter(h => h.cattleTag === cattleTag);
    healthLogs.forEach(h => {
      if (h.type === "Vaccination") {
        events.push({
          date: h.date,
          title: `Vaccination: ${h.vaccineName}`,
          icon: "fa-syringe",
          color: "#16a34a",
          description: `Batch #${h.batchNumber} administered by ${h.doctorName}. Next due: ${h.nextDueDate}.`
        });
      } else {
        events.push({
          date: h.startDate,
          title: `Medical Treatment: ${h.disease}`,
          icon: "fa-user-doctor",
          color: "#ef4444",
          description: `Diagnosis: ${h.diagnosis}. Prescribed: ${h.medicines} (${h.dosage}).`
        });
      }
    });

    // 4. Breeding & Gestation
    const breedingLogs = data.breedingRecords.filter(b => b.cattleTag === cattleTag);
    breedingLogs.forEach(b => {
      events.push({
        date: b.breedingDate,
        title: `Artificial Insemination / Breeding`,
        icon: "fa-heart",
        color: "#8b5cf6",
        description: `Technician: ${b.technicianName}. Semen Batch: #${b.semenBatchNumber} (${b.bullBreed}).`
      });

      if (b.confirmed) {
        events.push({
          date: b.confirmationDate,
          title: "Pregnancy Confirmed Positive",
          icon: "fa-baby-carriage",
          color: "#8b5cf6",
          description: `Gestation confirmed. Expected Delivery Date: ${SmartPregnancyModule.calculateEDD(b.breedingDate).expectedDeliveryDate}.`
        });
      }
    });

    // Sort chronologically (newest first)
    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  renderTimeline(containerId, cattleTag) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const events = this.getEventsForCattle(cattleTag);

    if (events.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:3rem 1rem; color:var(--text-sub);">
          <i class="fa-solid fa-clock-rotate-left" style="font-size:2.5rem; margin-bottom:1rem;"></i>
          <p>No activity events logged for cattle ${cattleTag} yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="timeline-wrapper">
        ${events.map(ev => `
          <div class="timeline-item">
            <div class="timeline-icon" style="background:${ev.color};">
              <i class="fa-solid ${ev.icon}"></i>
            </div>
            <div class="timeline-card glass-card">
              <div class="timeline-date">${ev.date}</div>
              <div class="timeline-title">${ev.title}</div>
              <div class="timeline-desc">${ev.description}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
};

window.TimelineModule = TimelineModule;
