/* FarmEase Smart Breeding & Pregnancy Calculator Module */

const SmartPregnancyModule = {
  PREGNANCY_DAYS: 283,

  calculateEDD(breedingDateStr) {
    if (!breedingDateStr) return null;
    const breedingDate = new Date(breedingDateStr);
    if (isNaN(breedingDate.getTime())) return null;

    const edd = new Date(breedingDate);
    edd.setDate(edd.getDate() + this.PREGNANCY_DAYS);

    const today = new Date();
    // Normalize to midnight for exact day counts
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const breedingMidnight = new Date(breedingDate.getFullYear(), breedingDate.getMonth(), breedingDate.getDate());
    const eddMidnight = new Date(edd.getFullYear(), edd.getMonth(), edd.getDate());

    const totalDurationMs = eddMidnight.getTime() - breedingMidnight.getTime();
    const elapsedMs = todayMidnight.getTime() - breedingMidnight.getTime();
    const remainingMs = eddMidnight.getTime() - todayMidnight.getTime();

    const daysPassed = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
    const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));

    let progressPct = Math.min(100, Math.max(0, Math.round((daysPassed / this.PREGNANCY_DAYS) * 100)));
    const currentMonth = Math.min(9, Math.ceil(daysPassed / 30) || 1);
    const isOverdue = remainingDays < 0;

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const expectedDay = daysOfWeek[edd.getDay()];

    return {
      breedingDate: breedingDateStr,
      expectedDeliveryDate: edd.toISOString().split("T")[0],
      expectedDay: expectedDay,
      daysPassed: daysPassed,
      remainingDays: remainingDays,
      progressPct: progressPct,
      currentMonth: currentMonth,
      isOverdue: isOverdue
    };
  },

  renderCalculatorWidget(containerId, cattleTag) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = DataStore.get();
    const breedingRec = data.breedingRecords.find(b => b.cattleTag === cattleTag);
    const cattle = data.cattles.find(c => c.tagNumber === cattleTag);

    if (!breedingRec || !breedingRec.breedingDate) {
      container.innerHTML = `
        <div class="glass-card pregnancy-calculator-card">
          <h3><i class="fa-solid fa-calculator"></i> Smart Pregnancy Calculator</h3>
          <p class="text-sub" style="margin-top:0.5rem;">No active breeding or insemination record found for cattle <strong>${cattleTag}</strong>.</p>
          <button class="btn btn-primary btn-sm" style="margin-top:1rem;" onclick="App.openAddBreedingModal('${cattleTag}')">
            <i class="fa-solid fa-plus"></i> Record Insemination / Breeding
          </button>
        </div>
      `;
      return;
    }

    const calc = this.calculateEDD(breedingRec.breedingDate);

    container.innerHTML = `
      <div class="glass-card pregnancy-calculator-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <span class="badge badge-pregnant"><i class="fa-solid fa-baby-carriage"></i> Active Pregnancy</span>
            <h2 style="margin-top:0.5rem;">Smart Gestation & Delivery Calculator</h2>
            <p style="color:var(--text-sub);">Calculated based on standard bovine gestation period (${this.PREGNANCY_DAYS} Days)</p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="App.openAddBreedingModal('${cattleTag}')">
            <i class="fa-solid fa-pen"></i> Edit Record
          </button>
        </div>

        <div class="edd-countdown-display">
          <div class="countdown-box">
            <div class="countdown-value">${calc.expectedDeliveryDate}</div>
            <div class="countdown-label">Expected Delivery Date</div>
          </div>
          <div style="width:1px; height:50px; background:var(--border-light);"></div>
          <div class="countdown-box">
            <div class="countdown-value" style="font-size:1.8rem; color:var(--text-main);">${calc.expectedDay}</div>
            <div class="countdown-label">Day of Week</div>
          </div>
          <div style="width:1px; height:50px; background:var(--border-light);"></div>
          <div class="countdown-box">
            <div class="countdown-value" style="color: ${calc.isOverdue ? '#ef4444' : 'var(--primary-600)'};">
              ${calc.isOverdue ? Math.abs(calc.remainingDays) + ' Days Overdue!' : calc.remainingDays + ' Days'}
            </div>
            <div class="countdown-label">${calc.isOverdue ? 'Overdue Warning' : 'Remaining Days'}</div>
          </div>
          <div style="width:1px; height:50px; background:var(--border-light);"></div>
          <div class="countdown-box">
            <div class="countdown-value" style="font-size:1.8rem; color:var(--status-pregnant);">${calc.currentMonth} / 9</div>
            <div class="countdown-label">Current Gestation Month</div>
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-weight:600; font-size:0.875rem;">
            <span>Pregnancy Progress (${calc.progressPct}%)</span>
            <span>${calc.daysPassed} / ${this.PREGNANCY_DAYS} Days</span>
          </div>
          <div class="pregnancy-progress-bar-wrap">
            <div class="pregnancy-progress-fill" style="width: ${calc.progressPct}%;"></div>
          </div>
        </div>

        ${calc.isOverdue ? `
          <div style="margin-top:1.25rem; padding:0.875rem 1.25rem; background:rgba(239,68,68,0.1); border:1px solid #ef4444; border-radius:var(--radius-md); color:#ef4444; display:flex; align-items:center; gap:0.75rem;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size:1.5rem;"></i>
            <div>
              <strong>ATTENTION - OVERDUE DELIVERY WARNING!</strong>
              <div style="font-size:0.85rem;">This cow has surpassed the 283-day expected gestation window. Please contact the veterinarian immediately.</div>
            </div>
          </div>
        ` : ''}

        <!-- Care Checklist -->
        <div style="margin-top:2rem; border-top:1px solid var(--border-light); padding-top:1.5rem;">
          <h3><i class="fa-solid fa-clipboard-check"></i> Pregnancy Care Checklist</h3>
          <p style="font-size:0.85rem; color:var(--text-sub);">Essential health, nutrition, and shelter care guidelines during gestation.</p>

          <div class="checklist-grid" id="checklistGridContainer">
            ${this.renderChecklistItems(cattleTag)}
          </div>
        </div>
      </div>
    `;
  },

  renderChecklistItems(cattleTag) {
    const data = DataStore.get();
    const checklist = (data.pregnancyChecklist && data.pregnancyChecklist[cattleTag]) || {
      nutrition: false, calcium: false, mineralSupplements: false, deworming: false,
      vaccination: false, cleanShelter: false, water: false, exercise: false, doctorCheckup: false
    };

    const items = [
      { key: "nutrition", label: "High Protein Nutrition" },
      { key: "calcium", label: "Calcium Fortification" },
      { key: "mineralSupplements", label: "Mineral Supplements" },
      { key: "deworming", label: "Timely Deworming" },
      { key: "vaccination", label: "Pre-natal Vaccination" },
      { key: "cleanShelter", label: "Clean & Dry Shelter" },
      { key: "water", label: "Abundant Clean Water" },
      { key: "exercise", label: "Mild Daily Exercise" },
      { key: "doctorCheckup", label: "Regular Vet Checkup" }
    ];

    return items.map(item => `
      <div class="checklist-item ${checklist[item.key] ? 'checked' : ''}" onclick="SmartPregnancyModule.toggleChecklist('${cattleTag}', '${item.key}')">
        <input type="checkbox" ${checklist[item.key] ? 'checked' : ''} onclick="event.stopPropagation(); SmartPregnancyModule.toggleChecklist('${cattleTag}', '${item.key}')">
        <span>${item.label}</span>
      </div>
    `).join('');
  },

  toggleChecklist(cattleTag, itemKey) {
    const data = DataStore.get();
    if (!data.pregnancyChecklist) data.pregnancyChecklist = {};
    if (!data.pregnancyChecklist[cattleTag]) {
      data.pregnancyChecklist[cattleTag] = {
        nutrition: false, calcium: false, mineralSupplements: false, deworming: false,
        vaccination: false, cleanShelter: false, water: false, exercise: false, doctorCheckup: false
      };
    }

    data.pregnancyChecklist[cattleTag][itemKey] = !data.pregnancyChecklist[cattleTag][itemKey];
    DataStore.save(data);
    this.renderCalculatorWidget('pregnancyWidgetContainer', cattleTag);
    App.showToast(`Updated care checklist for ${cattleTag}`);
  }
};

window.SmartPregnancyModule = SmartPregnancyModule;
