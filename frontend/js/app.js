/* FarmEase Core Application Controller — Complete Version */

/* ===================== AUTH MODULE ===================== */
const Auth = {
  currentRole: 'Admin',

  showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.classList.add('active');
      setTimeout(() => document.getElementById('loginEmail')?.focus(), 300);
    }
  },

  hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('active');
  },

  setLoginRole(role) {
    this.currentRole = role;
    const tabAdmin = document.getElementById('tabAdmin');
    const tabOwner = document.getElementById('tabOwner');
    if (tabAdmin && tabOwner) {
      if (role === 'Admin') {
        tabAdmin.style.background = 'var(--primary-600)';
        tabAdmin.style.color = '#fff';
        tabOwner.style.background = 'transparent';
        tabOwner.style.color = 'var(--text-sub)';
      } else {
        tabOwner.style.background = 'var(--primary-600)';
        tabOwner.style.color = '#fff';
        tabAdmin.style.background = 'transparent';
        tabAdmin.style.color = 'var(--text-sub)';
      }
    }
  },

  togglePasswordVisibility() {
    const input = document.getElementById('loginPassword');
    const icon = document.getElementById('passEyeIcon');
    if (input && icon) {
      input.type = input.type === 'password' ? 'text' : 'password';
      icon.className = input.type === 'password' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
    }
  },

  login() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
      App.showToast('Please enter your email and password.', 'error');
      return;
    }

    // Demo credential validation
    const validCredentials = [
      { email: 'admin@farmease.com', password: 'farmease@2026', role: 'Admin' },
      { email: 'owner@farmease.com', password: 'owner@2026', role: 'Farm Owner' }
    ];

    const match = validCredentials.find(c => c.email === email && c.password === password);

    if (match || true) { // Allow any credentials for demo
      const role = match ? match.role : this.currentRole;

      const btn = document.getElementById('loginBtn');
      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing In...';
        btn.disabled = true;
      }

      setTimeout(() => {
        this.hideLoginModal();
        App.userRole = role;
        App.navigateTo('dashboard');
        App.showToast(`Welcome back! Signed in as ${role}.`);
        if (btn) { btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In to FarmEase'; btn.disabled = false; }
      }, 900);
    }
  },

  showForgotPassword() {
    App.showToast('Password reset link sent to your email address.');
  },

  logout() {
    App.navigateTo('landing');
    App.showToast('You have been signed out successfully.');
    // After slight delay show login again
    setTimeout(() => this.showLoginModal(), 400);
  }
};

/* ===================== MAIN APP ===================== */
const App = {
  activeView: 'dashboard',
  theme: 'light',
  userRole: 'Admin',
  chartInstances: {},

  init() {
    this.setupTheme();
    this.setupNavigation();
    this.setupSearch();
    this.animateCounters();
    // Show login on first load
    setTimeout(() => Auth.showLoginModal(), 500);
    console.log('%cFarmEase SaaS v1.0 Initialized', 'color:#16a34a; font-weight:bold; font-size:14px;');
  },

  setupTheme() {
    const savedTheme = localStorage.getItem('FARMEASE_THEME') || 'light';
    this.applyTheme(savedTheme);
  },

  applyTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('FARMEASE_THEME', theme);

    // Update all theme toggle icons
    const icons = ['themeToggleIcon', 'themeToggleIconApp'];
    icons.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    });
  },

  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);

    // Destroy & re-render charts with new theme colors
    if (this.activeView === 'dashboard') {
      setTimeout(() => this.renderCharts(), 100);
    }
  },

  switchUserRole(role) {
    this.userRole = role;
    const roleDisplay = document.getElementById('currentUserRoleDisplay');
    if (roleDisplay) roleDisplay.innerText = role;

    const adminBtn = document.getElementById('roleAdminBtn');
    const ownerBtn = document.getElementById('roleOwnerBtn');
    if (adminBtn && ownerBtn) {
      adminBtn.className = role === 'Admin' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
      ownerBtn.className = role === 'Farm Owner' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
      adminBtn.style.borderRadius = 'var(--radius-full)';
      ownerBtn.style.borderRadius = 'var(--radius-full)';
    }

    this.showToast(`Switched to ${role} mode.`);
  },

  setupNavigation() {
    document.querySelectorAll('[data-nav]').forEach(item => {
      item.addEventListener('click', (e) => {
        const targetView = item.getAttribute('data-nav');
        this.navigateTo(targetView);
      });
    });
  },

  navigateTo(viewId) {
    this.activeView = viewId;

    const landing = document.getElementById('landingView');
    const appShell = document.getElementById('appMainShell');

    if (viewId === 'landing') {
      if (landing) landing.style.display = 'block';
      if (appShell) appShell.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (landing) landing.style.display = 'none';
    if (appShell) appShell.style.display = 'flex';

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-nav') === viewId);
    });

    // Update page title
    const titles = {
      dashboard: 'Dashboard Analytics',
      cattle: 'Cattle Directory & Management',
      milk: 'Milk Production Management',
      feed: 'Feed & Nutrition Management',
      health: 'Health, Vaccines & Medical History',
      breeding: 'Smart Breeding & Pregnancy Calculator',
      familyTree: 'Animal Lineage & Family Tree',
      timeline: 'Cattle Activity Lifecycle Timeline',
      documents: 'Document Vault & Reminders',
      map: 'Farm GPS Geofencing Map',
      settings: 'Farm Settings & System Backup'
    };
    const titleEl = document.getElementById('currentPageTitle');
    if (titleEl) titleEl.innerText = titles[viewId] || 'FarmEase';

    // Switch panels
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(`panel-${viewId}`);
    if (panel) panel.classList.add('active');

    this.renderActiveView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderActiveView() {
    const view = this.activeView;
    if (view === 'dashboard') {
      this.renderDashboard();
    } else if (view === 'cattle') {
      this.renderCattleModule();
    } else if (view === 'milk') {
      this.renderMilkModule();
    } else if (view === 'feed') {
      this.renderFeedModule();
    } else if (view === 'health') {
      this.renderHealthModule();
    } else if (view === 'breeding') {
      const tag = document.getElementById('breedingCattleSelect')?.value || 'FE-COW-001';
      SmartPregnancyModule.renderCalculatorWidget('pregnancyWidgetContainer', tag);
      this.renderBreedingRecordsTable();
    } else if (view === 'familyTree') {
      const tag = document.getElementById('treeCattleSelect')?.value || 'FE-COW-002';
      FamilyTreeModule.renderFamilyTree('familyTreeRenderArea', tag);
    } else if (view === 'timeline') {
      const tag = document.getElementById('timelineCattleSelect')?.value || 'FE-COW-001';
      TimelineModule.renderTimeline('timelineRenderArea', tag);
    } else if (view === 'documents') {
      this.renderDocumentsAndReminders();
    } else if (view === 'map') {
      this.renderMapModule();
    } else if (view === 'settings') {
      this.renderSettingsModule();
    }
  },

  renderDashboard() {
    const data = DataStore.get();
    const cattles = data.cattles;

    const totalAnimals = cattles.length;
    const healthy = cattles.filter(c => c.healthStatus === 'Healthy').length;
    const sick = cattles.filter(c => c.healthStatus === 'Sick').length;
    const pregnant = cattles.filter(c => c.status === 'Pregnant').length;
    const calves = cattles.filter(c => c.tagNumber.includes('CALF')).length;
    const sold = cattles.filter(c => c.status === 'Sold').length;
    const dead = cattles.filter(c => c.status === 'Passed Away').length;
    const todayDate = new Date().toISOString().split('T')[0];
    const todayMilk = data.milkLogs.filter(m => m.date === todayDate).reduce((s, m) => s + m.totalQty, 0)
      || data.milkLogs.filter(m => m.date === '2026-07-26').reduce((s, m) => s + m.totalQty, 0);

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    setVal('dashTotalAnimals', totalAnimals);
    setVal('dashHealthyAnimals', healthy);
    setVal('dashSickAnimals', sick);
    setVal('dashPregnantAnimals', pregnant);
    setVal('dashCalves', calves);
    setVal('dashSoldAnimals', sold);
    setVal('dashDeadAnimals', dead);
    setVal('dashTodayMilk', todayMilk + ' L');
    setVal('dashMonthlyMilk', '~2,085 L');
    setVal('dashMonthlyIncome', '$' + data.financials.monthlyIncome.toLocaleString());
    setVal('dashMonthlyExpense', '$' + data.financials.monthlyExpense.toLocaleString());
    setVal('dashMonthlyProfit', '$' + (data.financials.monthlyIncome - data.financials.monthlyExpense).toLocaleString());

    this.renderAlertsBar();
    this.updateNotificationBadge();
    this.renderCharts();
  },

  renderAlertsBar() {
    const data = DataStore.get();
    const alertsBar = document.getElementById('alertsBar');
    if (!alertsBar) return;

    const alerts = data.reminders.slice(0, 3).map(r => {
      const colors = { Critical: '#ef4444', High: '#f59e0b', Medium: '#3b82f6' };
      const icons = { Vaccination: 'fa-syringe', Delivery: 'fa-baby-carriage', 'Doctor Visit': 'fa-user-doctor' };
      const color = colors[r.priority] || '#3b82f6';
      const icon = icons[r.type] || 'fa-bell';
      return `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:0.875rem 1.25rem; background:${color}15; border:1px solid ${color}40; border-left:4px solid ${color}; border-radius:var(--radius-md);">
          <div style="display:flex; align-items:center; gap:0.875rem;">
            <i class="fa-solid ${icon}" style="color:${color}; font-size:1.15rem;"></i>
            <div>
              <strong style="font-size:0.875rem;">${r.title}</strong>
              <div style="font-size:0.75rem; color:var(--text-sub);">Due: ${r.dueDate} &nbsp;·&nbsp; Priority: <strong>${r.priority}</strong></div>
            </div>
          </div>
          <button class="btn btn-sm" style="color:${color}; border:1px solid ${color}40; background:transparent;" onclick="App.dismissReminder('${r.id}')">Dismiss</button>
        </div>
      `;
    });

    alertsBar.innerHTML = alerts.join('');
  },

  renderCharts() {
    if (typeof Chart === 'undefined') return;

    const dark = this.theme === 'dark';
    const textColor = dark ? '#94a3b8' : '#475569';
    const gridColor = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';

    // Destroy existing chart instances
    Object.values(this.chartInstances).forEach(c => { try { c.destroy(); } catch(e) {} });
    this.chartInstances = {};

    const mkChart = (id, type, data, options = {}) => {
      const canvas = document.getElementById(id);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const chart = new Chart(ctx, { type, data, options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor, boxRadius: 4 }, position: 'bottom' } },
        scales: type === 'doughnut' || type === 'polarArea' ? undefined : {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } }
        },
        ...options
      }});
      this.chartInstances[id] = chart;
    };

    // 1. Milk Trend — Line
    mkChart('chartMilkTrend', 'line', {
      labels: ['Jul 20','Jul 21','Jul 22','Jul 23','Jul 24','Jul 25','Jul 26'],
      datasets: [{
        label: 'Liters/Day', data: [65, 68.5, 70, 72, 69, 71.5, 69.5],
        borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.1)',
        fill: true, tension: 0.4, borderWidth: 2.5, pointBackgroundColor: '#16a34a', pointRadius: 4
      }]
    }, { plugins: { legend: { display: false } } });

    // 2. Financial Bar
    mkChart('chartFinancials', 'bar', {
      labels: ['Milk Sales','Cattle Sales','Manure','Feed Cost','Vet/Meds','Labor'],
      datasets: [{
        label: 'Amount ($)',
        data: [12500, 1850, 500, 3100, 950, 1400],
        backgroundColor: ['#16a34a','#22c55e','#4ade80','#ef4444','#f59e0b','#3b82f6'],
        borderRadius: 6, borderSkipped: false
      }]
    }, { plugins: { legend: { display: false } } });

    // 3. Health Doughnut
    mkChart('chartHealthDistribution', 'doughnut', {
      labels: ['Healthy','Under Treatment'],
      datasets: [{ data: [4, 1], backgroundColor: ['#16a34a','#ef4444'], hoverOffset: 8 }]
    });

    // 4. Breed Polar
    mkChart('chartBreedDistribution', 'polarArea', {
      labels: ['Holstein Friesian','Jersey','Gir','Sahiwal'],
      datasets: [{ data: [2,1,1,1], backgroundColor: ['rgba(22,163,74,0.7)','rgba(59,130,246,0.7)','rgba(245,158,11,0.7)','rgba(139,92,246,0.7)'] }]
    });
  },

  renderCattleModule(filterStatus = '', filterBreed = '') {
    const data = DataStore.get();
    const tableBody = document.getElementById('cattleTableBody');
    if (!tableBody) return;

    let cattles = data.cattles;
    if (filterStatus) cattles = cattles.filter(c => c.status === filterStatus);
    if (filterBreed) cattles = cattles.filter(c => c.breed === filterBreed);

    if (cattles.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2.5rem; color:var(--text-muted);">
        <i class="fa-solid fa-cow" style="font-size:2rem; margin-bottom:0.75rem; display:block;"></i>
        No cattle found matching the selected filters.
      </td></tr>`;
      return;
    }

    tableBody.innerHTML = cattles.map(c => {
      const statusClass = c.status.toLowerCase().replace(/\s+/g, '').replace('undertreatment','sick').replace('passedaway','dead');
      return `
        <tr style="cursor:pointer;" onclick="App.openCattleProfile('${c.tagNumber}')">
          <td>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <img src="${c.photo || DEFAULT_COW_IMAGE}" onerror="this.src=DEFAULT_COW_IMAGE" alt="${c.nickname}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid var(--primary-400); flex-shrink:0;">
              <div>
                <div style="font-weight:700;">${c.nickname}</div>
                <div style="font-size:0.75rem; color:var(--text-sub);">${c.officialName}</div>
              </div>
            </div>
          </td>
          <td><span style="font-family:monospace; font-weight:700; color:var(--primary-600);">${c.tagNumber}</span></td>
          <td>${c.breed}</td>
          <td><span class="badge ${c.gender === 'Female' ? 'badge-pregnant' : 'badge-available'}" style="font-size:0.7rem;">${c.gender}</span></td>
          <td>${c.age}</td>
          <td>${c.weight} kg</td>
          <td><span class="badge badge-${statusClass}">${c.status}</span></td>
          <td style="font-weight:700; color:var(--primary-600);">$${c.currentMarketValue.toLocaleString()}</td>
          <td onclick="event.stopPropagation()">
            <div style="display:flex; gap:0.375rem; flex-wrap:nowrap;">
              <button class="btn btn-outline btn-sm" onclick="App.openCattleProfile('${c.tagNumber}')" title="View Profile"><i class="fa-solid fa-eye"></i></button>
              <button class="btn btn-secondary btn-sm" onclick="App.showQRCodeModal('${c.tagNumber}')" title="QR Code"><i class="fa-solid fa-qrcode"></i></button>
              <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('timeline')" title="Timeline"><i class="fa-solid fa-clock-rotate-left"></i></button>
              <button class="btn btn-danger btn-sm" onclick="App.confirmDeleteCattle('${c.tagNumber}', '${c.nickname}')" title="Delete Cattle"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterCattleTable() {
    const statusFilter = document.getElementById('cattleStatusFilter')?.value || '';
    const breedFilter = document.getElementById('cattleBreedFilter')?.value || '';
    this.renderCattleModule(statusFilter, breedFilter);
  },

  renderMilkModule() {
    const data = DataStore.get();
    const tableBody = document.getElementById('milkTableBody');
    if (!tableBody) return;

    const todayTotal = data.milkLogs.filter(m => m.date === '2026-07-26').reduce((s, m) => s + m.totalQty, 0);
    const el = document.getElementById('milkSumToday');
    if (el) el.innerText = todayTotal + ' L';

    tableBody.innerHTML = data.milkLogs.map(m => {
      const cattle = data.cattles.find(c => c.tagNumber === m.cattleTag);
      return `
        <tr>
          <td>${m.date}</td>
          <td><span style="font-family:monospace; font-weight:700; color:var(--primary-600);">${m.cattleTag}</span></td>
          <td>${cattle ? cattle.nickname : '—'}</td>
          <td>${m.morningQty} L</td>
          <td>${m.eveningQty} L</td>
          <td><strong>${m.totalQty} L</strong></td>
          <td>${m.fatPct}%</td>
          <td><span class="badge badge-healthy">Normal</span></td>
        </tr>
      `;
    }).join('');
  },

  renderFeedModule() {
    const data = DataStore.get();
    const tableBody = document.getElementById('feedTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = data.feedLogs.map(f => `
      <tr>
        <td>${f.date}</td>
        <td><strong>${f.feedType}</strong></td>
        <td>${f.dailyQtyKg} kg</td>
        <td>$${f.costPerKg.toFixed(2)}</td>
        <td><strong>$${f.totalCost.toFixed(2)}</strong></td>
        <td>${f.waterIntakeLiters} L</td>
        <td>${f.supplements}</td>
        <td style="font-size:0.8rem; color:var(--text-sub);">${f.schedule}</td>
      </tr>
    `).join('');
  },

  renderHealthModule() {
    const data = DataStore.get();
    const tableBody = document.getElementById('healthTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = data.healthRecords.map(h => {
      const isVacc = h.type === 'Vaccination';
      return `
        <tr>
          <td>${h.date || h.startDate}</td>
          <td><span style="font-family:monospace; font-weight:700; color:var(--primary-600);">${h.cattleTag}</span></td>
          <td><span class="badge ${isVacc ? 'badge-healthy' : 'badge-sick'}">${h.type}</span></td>
          <td><strong>${isVacc ? h.vaccineName : h.disease}</strong></td>
          <td>${isVacc ? h.doctorName : h.veterinarianName}</td>
          <td style="font-family:monospace; font-size:0.8rem;">${isVacc ? h.doctorId : h.veterinarianId}</td>
          <td style="font-size:0.8rem;">${isVacc ? h.hospitalName : '—'}</td>
          <td style="color:${isVacc ? 'var(--primary-600)' : '#ef4444'}; font-weight:600;">${isVacc ? h.nextDueDate : h.endDate}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="App.showHealthDetailModal('${h.id}')">
              <i class="fa-solid fa-notes-medical"></i> Details
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderBreedingRecordsTable() {
    const data = DataStore.get();
    const tableBody = document.getElementById('breedingTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = data.breedingRecords.map(b => {
      const edd = SmartPregnancyModule.calculateEDD(b.breedingDate);
      const daysLeft = edd ? edd.remainingDays : '?';
      const daysColor = daysLeft < 30 ? '#ef4444' : daysLeft < 60 ? '#f59e0b' : 'var(--primary-600)';
      return `
        <tr>
          <td><span style="font-family:monospace; font-weight:700; color:var(--primary-600);">${b.cattleTag}</span></td>
          <td>${b.breedingDate}</td>
          <td><span class="badge badge-pregnant">${b.type}</span></td>
          <td>${b.technicianName}<br><span style="font-size:0.75rem; color:var(--text-muted);">${b.technicianId}</span></td>
          <td style="font-family:monospace; font-size:0.8rem;">${b.semenBatchNumber}</td>
          <td><strong>${edd ? edd.expectedDeliveryDate : '—'}</strong></td>
          <td><strong style="color:${daysColor};">${daysLeft > 0 ? daysLeft + ' Days' : 'OVERDUE!'}</strong></td>
          <td><span class="badge badge-pregnant">${b.status}</span></td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="App.selectBreedingCattle('${b.cattleTag}')">
              <i class="fa-solid fa-calculator"></i> Calculate
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  selectBreedingCattle(tag) {
    const select = document.getElementById('breedingCattleSelect');
    if (select) {
      select.value = tag;
      SmartPregnancyModule.renderCalculatorWidget('pregnancyWidgetContainer', tag);
    }
    // Scroll up to calculator
    document.getElementById('pregnancyWidgetContainer')?.scrollIntoView({ behavior: 'smooth' });
  },

  renderDocumentsAndReminders() {
    const data = DataStore.get();
    const remContainer = document.getElementById('remindersListContainer');
    const docContainer = document.getElementById('documentsListContainer');

    if (remContainer) {
      if (data.reminders.length === 0) {
        remContainer.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted);"><i class="fa-solid fa-check-circle" style="font-size:2rem; margin-bottom:0.75rem; display:block; color:var(--primary-600);"></i>No pending reminders!</div>`;
      } else {
        remContainer.innerHTML = data.reminders.map(r => {
          const pColors = { Critical: '#ef4444', High: '#f59e0b', Medium: '#3b82f6' };
          const color = pColors[r.priority] || '#3b82f6';
          const icons = { Vaccination: 'fa-syringe', Delivery: 'fa-baby-carriage', 'Doctor Visit': 'fa-user-doctor' };
          const icon = icons[r.type] || 'fa-bell';
          return `
            <div class="glass-card" style="padding:1rem 1.25rem; display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem; border-left:4px solid ${color};">
              <div style="display:flex; align-items:center; gap:0.875rem;">
                <i class="fa-solid ${icon}" style="color:${color}; font-size:1.25rem;"></i>
                <div>
                  <strong style="font-size:0.875rem;">${r.title}</strong>
                  <div style="font-size:0.75rem; color:var(--text-sub);">Due: ${r.dueDate} &nbsp;·&nbsp; Priority: <strong style="color:${color};">${r.priority}</strong></div>
                </div>
              </div>
              <button class="btn btn-sm" style="color:${color}; border:1px solid ${color}; background:transparent;" onclick="App.dismissReminder('${r.id}')">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          `;
        }).join('');
      }
    }

    if (docContainer) {
      docContainer.innerHTML = data.documents.map(d => {
        const typeIcons = { 'Vaccination Certificate': 'fa-syringe', 'Purchase Bill': 'fa-receipt', 'Medical Report': 'fa-notes-medical', 'Breeding Report': 'fa-baby-carriage' };
        const icon = typeIcons[d.type] || 'fa-file-pdf';
        return `
          <div class="glass-card" style="padding:1rem 1.25rem; display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem;">
            <div style="display:flex; align-items:center; gap:0.875rem;">
              <i class="fa-solid ${icon}" style="color:#ef4444; font-size:1.35rem;"></i>
              <div>
                <strong style="font-size:0.875rem;">${d.title}</strong>
                <div style="font-size:0.75rem; color:var(--text-sub);">Tag: ${d.cattleTag} &nbsp;·&nbsp; ${d.date} &nbsp;·&nbsp; ${d.size}</div>
              </div>
            </div>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-secondary btn-sm" onclick="App.showToast('Viewing: ${d.title}')"><i class="fa-solid fa-eye"></i></button>
              <button class="btn btn-primary btn-sm" onclick="App.showToast('Downloading: ${d.title}')"><i class="fa-solid fa-download"></i></button>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  renderMapModule() {
    if (typeof L === 'undefined') {
      document.getElementById('farmMapContainer').innerHTML = '<div style="padding:3rem; text-align:center; color:var(--text-sub);">Map loading... (Leaflet.js required)</div>';
      return;
    }
    if (window.farmLeafletMap) return;

    const data = DataStore.get();
    const { lat, lng } = data.farmInfo.coordinates;
    const map = L.map('farmMapContainer').setView([lat, lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const greenIcon = L.divIcon({ html: '<div style="background:#16a34a;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>', iconSize: [16,16], className: '' });
    const redIcon = L.divIcon({ html: '<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>', iconSize: [14,14], className: '' });

    L.marker([lat, lng], { icon: greenIcon }).addTo(map)
      .bindPopup('<strong>GreenPasture Enterprise Farms</strong><br>Main Dairy Barn & Office').openPopup();
    L.marker([lat + 0.0025, lng + 0.003], { icon: greenIcon }).addTo(map)
      .bindPopup('<strong>Bella (FE-COW-001)</strong><br>Pasture Zone A — Pregnant');
    L.marker([lat - 0.001, lng + 0.002], { icon: greenIcon }).addTo(map)
      .bindPopup('<strong>Daisy (FE-COW-002)</strong><br>Milking Parlour B');
    L.marker([lat + 0.001, lng - 0.002], { icon: redIcon }).addTo(map)
      .bindPopup('<strong>Luna (FE-COW-003)</strong><br>Isolation Stall — Under Treatment');
    L.circle([lat, lng], { radius: 400, color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.05 }).addTo(map);

    window.farmLeafletMap = map;
  },

  renderSettingsModule() {
    const data = DataStore.get();
    const setValue = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    setValue('settingFarmName', data.farmInfo.name);
    setValue('settingOwnerName', data.farmInfo.owner);
    setValue('settingLicense', data.farmInfo.license);
    setValue('settingLocation', data.farmInfo.location);
  },

  saveFarmSettings() {
    const data = DataStore.get();
    data.farmInfo.name = document.getElementById('settingFarmName')?.value || data.farmInfo.name;
    data.farmInfo.owner = document.getElementById('settingOwnerName')?.value || data.farmInfo.owner;
    data.farmInfo.location = document.getElementById('settingLocation')?.value || data.farmInfo.location;
    DataStore.save(data);
    this.showToast('Farm settings saved successfully!');
  },

  backupSystemData() {
    const jsonStr = JSON.stringify(DataStore.get(), null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farmease_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast('System backup JSON exported to Downloads.');
  },

  openCattleProfile(tagNumber) {
    const data = DataStore.get();
    const cattle = data.cattles.find(c => c.tagNumber === tagNumber);
    if (!cattle) { this.showToast(`Cattle ${tagNumber} not found.`, 'error'); return; }

    const statusClass = cattle.status.toLowerCase().replace(/\s+/g, '').replace('undertreatment','sick').replace('passedaway','dead');

    const modalHtml = `
      <div class="modal-backdrop active" id="cattleProfileModal">
        <div class="modal-container" style="max-width:760px;">
          <div class="modal-header">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <i class="fa-solid fa-cow" style="color:var(--primary-600); font-size:1.25rem;"></i>
              <div>
                <h3 class="modal-title">${cattle.nickname}</h3>
                <div style="font-size:0.8rem; color:var(--text-sub); margin-top:0.125rem; font-family:monospace;">${cattle.tagNumber} &nbsp;·&nbsp; ${cattle.internalId || cattle.id}</div>
              </div>
            </div>
            <span class="modal-close" onclick="document.getElementById('cattleProfileModal').remove()">&times;</span>
          </div>
          <div class="modal-body">
            <div style="display:flex; gap:1.5rem; align-items:flex-start; margin-bottom:1.5rem; flex-wrap:wrap;">
              <div style="position:relative;">
                <img src="${cattle.photo || DEFAULT_COW_IMAGE}" onerror="this.src=DEFAULT_COW_IMAGE" alt="${cattle.nickname}" style="width:160px; height:160px; border-radius:var(--radius-lg); object-fit:cover; border:3px solid var(--primary-600); display:block;">
                <span class="badge badge-${statusClass}" style="position:absolute; bottom:-10px; left:50%; transform:translateX(-50%); white-space:nowrap;">${cattle.status}</span>
              </div>
              <div style="flex:1; min-width:200px;">
                <h2 style="font-size:1.35rem; margin-bottom:0.25rem;">${cattle.officialName}</h2>
                <div style="display:flex; gap:0.5rem; margin-bottom:0.875rem; flex-wrap:wrap;">
                  <span class="badge badge-healthy" style="font-size:0.72rem;">${cattle.healthStatus}</span>
                  <span class="badge badge-available" style="font-size:0.72rem;">${cattle.breed}</span>
                  <span class="badge badge-sold" style="font-size:0.72rem;">${cattle.gender}</span>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem 1.5rem; font-size:0.875rem;">
                  <div><span style="color:var(--text-sub);">Age:</span> <strong>${cattle.age}</strong></div>
                  <div><span style="color:var(--text-sub);">Weight:</span> <strong>${cattle.weight} kg</strong></div>
                  <div><span style="color:var(--text-sub);">Color:</span> <strong>${cattle.color}</strong></div>
                  <div><span style="color:var(--text-sub);">Height:</span> <strong>${cattle.height} cm</strong></div>
                  <div><span style="color:var(--text-sub);">Lactation #:</span> <strong>${cattle.lactationNumber}</strong></div>
                  <div><span style="color:var(--text-sub);">Market Value:</span> <strong style="color:var(--primary-600);">$${cattle.currentMarketValue.toLocaleString()}</strong></div>
                  <div><span style="color:var(--text-sub);">Purchase Date:</span> <strong>${cattle.purchaseDate}</strong></div>
                  <div><span style="color:var(--text-sub);">Purchase Price:</span> <strong>$${cattle.purchasePrice.toLocaleString()}</strong></div>
                </div>
              </div>
            </div>

            <!-- Lineage Info -->
            <div style="padding:1rem; background:var(--bg-surface-elevated); border:1px solid var(--border-light); border-radius:var(--radius-md); margin-bottom:1rem;">
              <div style="font-weight:700; font-size:0.85rem; color:var(--text-sub); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.625rem;">🌳 Lineage</div>
              <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem; font-size:0.85rem;">
                <div><span style="color:var(--text-sub);">Grandmother:</span> <a href="#" onclick="event.preventDefault(); document.getElementById('cattleProfileModal').remove(); App.openCattleProfile('${cattle.grandMotherTag}');" style="color:var(--primary-600); font-weight:600;">${cattle.grandMotherTag || 'Unknown'}</a></div>
                <div><span style="color:var(--text-sub);">Mother:</span> <a href="#" onclick="event.preventDefault(); document.getElementById('cattleProfileModal').remove(); App.openCattleProfile('${cattle.motherTag}');" style="color:var(--primary-600); font-weight:600;">${cattle.motherTag || 'Unknown'}</a></div>
                <div><span style="color:var(--text-sub);">Father (Bull):</span> <strong>${cattle.fatherTag || 'Unknown'}</strong></div>
              </div>
            </div>

            <!-- Notes -->
            <div style="padding:1rem; background:var(--primary-50); border:1px solid rgba(22,163,74,0.2); border-radius:var(--radius-md);">
              <div style="font-weight:700; font-size:0.8rem; color:var(--primary-700); margin-bottom:0.375rem;">📋 Notes</div>
              <p style="font-size:0.875rem; color:var(--text-sub);">${cattle.notes}</p>
            </div>
          </div>
          <div class="modal-footer" style="justify-content:space-between;">
            <button class="btn btn-danger btn-sm" onclick="document.getElementById('cattleProfileModal').remove(); App.confirmDeleteCattle('${cattle.tagNumber}', '${cattle.nickname}')">
              <i class="fa-solid fa-trash"></i> Delete Cattle
            </button>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-secondary btn-sm" onclick="App.showQRCodeModal('${cattle.tagNumber}')"><i class="fa-solid fa-qrcode"></i> QR Code</button>
              <button class="btn btn-secondary btn-sm" onclick="document.getElementById('cattleProfileModal').remove(); App.navigateTo('timeline'); setTimeout(()=>{ const s=document.getElementById('timelineCattleSelect'); if(s) s.value='${cattle.tagNumber}'; TimelineModule.renderTimeline('timelineRenderArea','${cattle.tagNumber}'); },400);">
                <i class="fa-solid fa-clock-rotate-left"></i> Timeline
              </button>
              <button class="btn btn-secondary btn-sm" onclick="document.getElementById('cattleProfileModal').remove(); App.navigateTo('familyTree'); setTimeout(()=>{ const s=document.getElementById('treeCattleSelect'); if(s) s.value='${cattle.tagNumber}'; FamilyTreeModule.renderFamilyTree('familyTreeRenderArea','${cattle.tagNumber}'); },400);">
                <i class="fa-solid fa-sitemap"></i> Family Tree
              </button>
              <button class="btn btn-primary btn-sm" onclick="document.getElementById('cattleProfileModal').remove()"><i class="fa-solid fa-check"></i> Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('cattleProfileModal')?.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  openCattleModalByTag(tag) {
    this.openCattleProfile(tag);
  },

  showQRCodeModal(tagNumber) {
    document.getElementById('qrModal')?.remove();
    const html = `
      <div class="modal-backdrop active" id="qrModal">
        <div class="modal-container" style="max-width:420px; text-align:center;">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fa-solid fa-qrcode"></i> Digital Tag QR Code</h3>
            <span class="modal-close" onclick="document.getElementById('qrModal').remove()">&times;</span>
          </div>
          <div class="modal-body">
            <p style="color:var(--text-sub); margin-bottom:1.25rem;">Scan this QR code in the field to instantly open the cattle profile on any device.</p>
            <div class="qr-code-canvas-box" id="qrCanvasBox" style="display:inline-block; padding:1.5rem; background:#fff; border-radius:var(--radius-lg); box-shadow:var(--shadow-md);"></div>
            <div style="margin-top:1.25rem;">
              <div style="font-size:1rem; font-weight:700; color:var(--primary-600); font-family:monospace;">${tagNumber}</div>
              <div style="font-size:0.8rem; color:var(--text-sub); margin-top:0.25rem;">FarmEase Smart Cattle Platform</div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary btn-sm" onclick="App.showToast('QR Code image saved to device.')"><i class="fa-solid fa-download"></i> Save QR</button>
            <button class="btn btn-secondary" onclick="document.getElementById('qrModal').remove()">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    setTimeout(() => {
      const box = document.getElementById('qrCanvasBox');
      if (!box) return;
      if (typeof QRCode !== 'undefined') {
        new QRCode(box, { text: `https://farmease.app/cattle/${tagNumber}`, width: 190, height: 190, correctLevel: QRCode.CorrectLevel.H });
      } else {
        box.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=FARMEASE-${tagNumber}" alt="QR Code" style="border-radius:8px;">`;
      }
    }, 150);
  },

  showHealthDetailModal(id) {
    const data = DataStore.get();
    const rec = data.healthRecords.find(h => h.id === id);
    if (!rec) return;
    this.showToast(`${rec.type}: ${rec.vaccineName || rec.disease} — ${rec.medicines || rec.dosage}`);
  },

  currentUploadedPhoto: null,

  openAddCattleModal() {
    this.currentUploadedPhoto = null;
    document.getElementById('addCattleModal')?.remove();

    const breedOptions = INDIAN_BREEDS.map(b => `<option value="${b}">${b}</option>`).join('');

    const html = `
      <div class="modal-backdrop active" id="addCattleModal">
        <div class="modal-container" style="max-width:760px;">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fa-solid fa-cow" style="color:var(--primary-600);"></i> Register New Cattle</h3>
            <span class="modal-close" onclick="document.getElementById('addCattleModal').remove()">&times;</span>
          </div>
          <div class="modal-body">
            
            <!-- 1. ANIMAL PHOTO UPLOAD SECTION -->
            <div style="margin-bottom:1.5rem; padding:1.25rem; background:var(--bg-surface-elevated); border:1px solid var(--border-light); border-radius:var(--radius-lg);">
              <label class="form-label" style="font-size:0.95rem; margin-bottom:0.75rem; display:flex; align-items:center; justify-content:space-between;">
                <span><i class="fa-solid fa-camera" style="color:var(--primary-600);"></i> Animal Photo <span style="font-size:0.8rem; font-weight:400; color:var(--text-sub);">(Optional)</span></span>
                <span style="font-size:0.75rem; color:var(--text-sub);">Accepted: JPG, JPEG, PNG, WEBP &nbsp;|&nbsp; Max: 5MB</span>
              </label>

              <div id="photoDropZone" class="photo-upload-zone" onclick="document.getElementById('photoFileInput').click()">
                <input type="file" id="photoFileInput" accept=".jpg,.jpeg,.png,.webp" style="display:none;" onchange="App.handlePhotoSelect(event)">
                
                <div id="photoPreviewContainer" style="display:none;">
                  <div class="photo-preview-box">
                    <img id="photoPreviewImg" src="" alt="Cattle Preview" onerror="this.src=DEFAULT_COW_IMAGE">
                    <span class="photo-preview-badge" onclick="event.stopPropagation(); App.removePhotoPreview();" title="Remove Photo">
                      <i class="fa-solid fa-xmark"></i>
                    </span>
                  </div>
                </div>

                <div id="photoUploadPrompt">
                  <div class="upload-icon-wrapper">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <div style="font-weight:700; font-size:0.95rem; margin-bottom:0.25rem;">
                    Drag & Drop Animal Photo Here or <span style="color:var(--primary-600); text-decoration:underline;">Browse</span>
                  </div>
                  <p style="font-size:0.8rem; color:var(--text-sub);">High-resolution photo helps identification in digital profiles & QR codes.</p>
                </div>
              </div>

              <!-- Upload Actions & Skip Option -->
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; flex-wrap:wrap; gap:0.75rem;">
                <div style="display:flex; gap:0.5rem; align-items:center;">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('photoFileInput').click()">
                    <i class="fa-solid fa-image"></i> Select Image
                  </button>
                  <button type="button" class="btn btn-outline btn-sm" id="btnSkipPhoto" onclick="App.skipPhotoOption()">
                    <i class="fa-solid fa-forward"></i> Skip Photo (Use Default Cow)
                  </button>
                </div>
                <div id="photoStatusMsg" style="display:none;"></div>
              </div>
            </div>

            <!-- REGISTRATION FORM FIELDS -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
              <div class="form-group">
                <label class="form-label">Animal ID / Tag Number *</label>
                <input type="text" class="form-input" id="newTag" placeholder="e.g. FE-COW-006">
              </div>
              <div class="form-group">
                <label class="form-label">Nickname *</label>
                <input type="text" class="form-input" id="newNickname" placeholder="e.g. Lilly">
              </div>
              <div class="form-group">
                <label class="form-label">Official Registered Name</label>
                <input type="text" class="form-input" id="newOfficialName" placeholder="Full registered pedigree name">
              </div>

              <!-- 4. INDIAN BREED DROPDOWN & 5. SMART BREED SELECTION -->
              <div class="form-group">
                <label class="form-label">Breed *</label>
                <select class="form-select" id="newBreed" onchange="App.handleBreedChange(this.value)">
                  <option value="">-- Select Cattle Breed --</option>
                  ${breedOptions}
                </select>
              </div>

              <!-- Dynamic Custom Breed Input -->
              <div class="form-group" id="customBreedGroup" style="display:none; grid-column:1/-1;">
                <label class="form-label" style="color:var(--primary-700);"><i class="fa-solid fa-pen"></i> Enter Breed Name *</label>
                <input type="text" class="form-input" id="newCustomBreed" placeholder="Enter custom breed name (e.g. Nimari, Ponwar, etc.)" style="border-color:var(--primary-500);">
              </div>

              <div class="form-group">
                <label class="form-label">Gender</label>
                <select class="form-select" id="newGender">
                  <option>Female</option>
                  <option>Male</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Color / Markings</label>
                <input type="text" class="form-input" id="newColor" placeholder="e.g. Reddish Brown with White Patch">
              </div>
              <div class="form-group">
                <label class="form-label">Date of Birth</label>
                <input type="date" class="form-input" id="newDob">
              </div>
              <div class="form-group">
                <label class="form-label">Weight (kg)</label>
                <input type="number" class="form-input" id="newWeight" placeholder="e.g. 450">
              </div>
              <div class="form-group">
                <label class="form-label">Height (cm)</label>
                <input type="number" class="form-input" id="newHeight" placeholder="e.g. 138">
              </div>
              <div class="form-group">
                <label class="form-label">Purchase Date</label>
                <input type="date" class="form-input" id="newPurchaseDate">
              </div>
              <div class="form-group">
                <label class="form-label">Purchase Price ($)</label>
                <input type="number" class="form-input" id="newPurchasePrice" placeholder="0">
              </div>
              <div class="form-group">
                <label class="form-label">Current Market Value ($)</label>
                <input type="number" class="form-input" id="newMarketValue" placeholder="0">
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-select" id="newStatus">
                  <option>Available</option>
                  <option>Pregnant</option>
                  <option>Under Treatment</option>
                  <option>Sold</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Mother Tag Number</label>
                <input type="text" class="form-input" id="newMotherTag" placeholder="e.g. FE-COW-001">
              </div>
              <div class="form-group" style="grid-column:1/-1;">
                <label class="form-label">Health & Pedigree Notes</label>
                <textarea class="form-textarea" id="newNotes" rows="2" placeholder="Any additional notes about this cattle..."></textarea>
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('addCattleModal').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="App.saveNewCattle()"><i class="fa-solid fa-floppy-disk"></i> Register Cattle</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    this.setupPhotoDragAndDrop();
  },

  setupPhotoDragAndDrop() {
    const dropZone = document.getElementById('photoDropZone');
    if (!dropZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        this.processPhotoFile(files[0]);
      }
    });
  },

  handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      this.processPhotoFile(file);
    }
  },

  processPhotoFile(file) {
    const statusMsg = document.getElementById('photoStatusMsg');
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    // Validate type
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!validTypes.includes(file.type) && !['jpg','jpeg','png','webp'].includes(fileExt)) {
      this.showPhotoStatus('Invalid file format! Only JPG, JPEG, PNG, and WEBP images are allowed.', 'error');
      return;
    }

    // Validate size
    if (file.size > maxSize) {
      this.showPhotoStatus('File exceeds maximum 5 MB size limit! Please upload a smaller image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.currentUploadedPhoto = e.target.result;
      this.showPhotoPreview(this.currentUploadedPhoto);
      this.showPhotoStatus('Photo uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  },

  showPhotoPreview(srcUrl) {
    const prompt = document.getElementById('photoUploadPrompt');
    const previewContainer = document.getElementById('photoPreviewContainer');
    const previewImg = document.getElementById('photoPreviewImg');

    if (prompt) prompt.style.display = 'none';
    if (previewContainer) previewContainer.style.display = 'block';
    if (previewImg) previewImg.src = srcUrl;
  },

  removePhotoPreview() {
    this.currentUploadedPhoto = null;
    const prompt = document.getElementById('photoUploadPrompt');
    const previewContainer = document.getElementById('photoPreviewContainer');
    const previewImg = document.getElementById('photoPreviewImg');
    const fileInput = document.getElementById('photoFileInput');

    if (fileInput) fileInput.value = '';
    if (prompt) prompt.style.display = 'block';
    if (previewContainer) previewContainer.style.display = 'none';
    if (previewImg) previewImg.src = '';

    this.showPhotoStatus('', '');
  },

  skipPhotoOption() {
    this.currentUploadedPhoto = DEFAULT_COW_IMAGE;
    this.showPhotoPreview(DEFAULT_COW_IMAGE);
    this.showPhotoStatus('Default cow image assigned!', 'success');
  },

  showPhotoStatus(msg, type) {
    const statusBox = document.getElementById('photoStatusMsg');
    if (!statusBox) return;
    if (!msg) {
      statusBox.style.display = 'none';
      statusBox.className = '';
      statusBox.innerHTML = '';
      return;
    }
    statusBox.style.display = 'flex';
    statusBox.className = `upload-feedback-msg ${type}`;
    const icon = type === 'success' ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>';
    statusBox.innerHTML = `${icon} <span>${msg}</span>`;
  },

  handleBreedChange(val) {
    const customGroup = document.getElementById('customBreedGroup');
    if (!customGroup) return;
    if (val === 'Other') {
      customGroup.style.display = 'block';
      document.getElementById('newCustomBreed')?.focus();
    } else {
      customGroup.style.display = 'none';
    }
  },

  saveNewCattle() {
    const tag = document.getElementById('newTag')?.value.trim();
    const nickname = document.getElementById('newNickname')?.value.trim();
    const selectedBreed = document.getElementById('newBreed')?.value;
    const customBreed = document.getElementById('newCustomBreed')?.value.trim();

    // 7. Validation
    if (!tag) {
      this.showToast('Animal ID / Tag Number is mandatory.', 'error');
      document.getElementById('newTag')?.focus();
      return;
    }

    if (!nickname) {
      this.showToast('Nickname is mandatory.', 'error');
      document.getElementById('newNickname')?.focus();
      return;
    }

    if (!selectedBreed) {
      this.showToast('Breed selection is mandatory.', 'error');
      document.getElementById('newBreed')?.focus();
      return;
    }

    let finalBreed = selectedBreed;
    if (selectedBreed === 'Other') {
      if (!customBreed) {
        this.showToast('Please enter the custom Breed Name.', 'error');
        document.getElementById('newCustomBreed')?.focus();
        return;
      }
      finalBreed = customBreed;
    }

    const data = DataStore.get();
    // Prevent duplicate registration based on Tag ID
    if (data.cattles.some(c => c.tagNumber.toLowerCase() === tag.toLowerCase())) {
      this.showToast(`Animal ID "${tag}" is already registered! Please use a unique ID.`, 'error');
      document.getElementById('newTag')?.focus();
      return;
    }

    const dob = document.getElementById('newDob')?.value;
    let age = '—';
    if (dob) {
      const diffMs = Date.now() - new Date(dob).getTime();
      const diffYrs = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
      const diffMos = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
      age = `${diffYrs} Yrs ${diffMos} Mos`;
    }

    // Photo is optional: if none uploaded/selected, automatically use default cow image
    const finalPhoto = this.currentUploadedPhoto || DEFAULT_COW_IMAGE;

    const newCattle = {
      id: 'CTL-' + Date.now(),
      tagNumber: tag,
      nickname: nickname,
      officialName: document.getElementById('newOfficialName')?.value.trim() || nickname,
      photo: finalPhoto,
      breed: finalBreed,
      color: document.getElementById('newColor')?.value.trim() || 'Standard Breed Color',
      gender: document.getElementById('newGender')?.value || 'Female',
      dob: dob || new Date().toISOString().split('T')[0],
      age: age,
      weight: parseFloat(document.getElementById('newWeight')?.value) || 0,
      height: parseFloat(document.getElementById('newHeight')?.value) || 0,
      purchaseDate: document.getElementById('newPurchaseDate')?.value || 'Born in Farm',
      purchasePrice: parseFloat(document.getElementById('newPurchasePrice')?.value) || 0,
      currentMarketValue: parseFloat(document.getElementById('newMarketValue')?.value) || 0,
      owner: data.farmInfo.name,
      status: document.getElementById('newStatus')?.value || 'Available',
      healthStatus: 'Healthy',
      motherTag: document.getElementById('newMotherTag')?.value.trim() || '',
      fatherTag: '',
      grandMotherTag: '',
      lactationNumber: 0,
      notes: document.getElementById('newNotes')?.value.trim() || 'Newly registered cattle animal.'
    };

    data.cattles.push(newCattle);
    DataStore.save(data);

    document.getElementById('addCattleModal')?.remove();
    this.currentUploadedPhoto = null;
    this.showToast(`✅ Cattle "${nickname}" (${tag}) registered successfully!`);

    if (this.activeView === 'cattle') this.renderCattleModule();
    if (this.activeView === 'dashboard') this.renderDashboard();
  },

  openAddMilkModal() {
    const data = DataStore.get();
    const cattleOptions = data.cattles.filter(c => c.gender === 'Female').map(c => `<option value="${c.tagNumber}">${c.tagNumber} — ${c.nickname}</option>`).join('');
    document.getElementById('addMilkModal')?.remove();
    const html = `
      <div class="modal-backdrop active" id="addMilkModal">
        <div class="modal-container" style="max-width:520px;">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fa-solid fa-flask-vial" style="color:var(--primary-600);"></i> Log New Milk Entry</h3>
            <span class="modal-close" onclick="document.getElementById('addMilkModal').remove()">&times;</span>
          </div>
          <div class="modal-body">
            <div class="form-group"><label class="form-label">Date</label><input type="date" class="form-input" id="mlkDate" value="${new Date().toISOString().split('T')[0]}"></div>
            <div class="form-group"><label class="form-label">Select Cattle</label><select class="form-select" id="mlkCattle">${cattleOptions}</select></div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
              <div class="form-group"><label class="form-label">Morning Yield (L)</label><input type="number" step="0.1" class="form-input" id="mlkMorning" placeholder="0.0"></div>
              <div class="form-group"><label class="form-label">Evening Yield (L)</label><input type="number" step="0.1" class="form-input" id="mlkEvening" placeholder="0.0"></div>
            </div>
            <div class="form-group"><label class="form-label">Fat %</label><input type="number" step="0.1" class="form-input" id="mlkFat" placeholder="e.g. 4.2"></div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('addMilkModal').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="App.saveMilkEntry()"><i class="fa-solid fa-floppy-disk"></i> Save Milk Log</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  saveMilkEntry() {
    const morning = parseFloat(document.getElementById('mlkMorning')?.value) || 0;
    const evening = parseFloat(document.getElementById('mlkEvening')?.value) || 0;
    const data = DataStore.get();
    data.milkLogs.unshift({
      id: 'MLK-' + Date.now(),
      date: document.getElementById('mlkDate')?.value,
      cattleTag: document.getElementById('mlkCattle')?.value,
      morningQty: morning, eveningQty: evening, totalQty: parseFloat((morning + evening).toFixed(1)),
      fatPct: parseFloat(document.getElementById('mlkFat')?.value) || 4.0
    });
    DataStore.save(data);
    document.getElementById('addMilkModal')?.remove();
    this.showToast('Milk entry recorded successfully!');
    if (this.activeView === 'milk') this.renderMilkModule();
  },

  confirmDeleteCattle(tagNumber, nickname) {
    document.getElementById('deleteCattleModal')?.remove();
    const html = `
      <div class="modal-backdrop active" id="deleteCattleModal">
        <div class="modal-container" style="max-width:460px;">
          <div class="modal-header">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:40px; height:40px; border-radius:50%; background:rgba(239,68,68,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <i class="fa-solid fa-triangle-exclamation" style="color:#ef4444; font-size:1.1rem;"></i>
              </div>
              <h3 class="modal-title" style="color:#ef4444;">Delete Cattle</h3>
            </div>
            <span class="modal-close" onclick="document.getElementById('deleteCattleModal').remove()">&times;</span>
          </div>
          <div class="modal-body">
            <div style="padding:1rem; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.3); border-radius:var(--radius-md); margin-bottom:1.25rem;">
              <div style="font-weight:700; margin-bottom:0.25rem;">${nickname}</div>
              <div style="font-family:monospace; font-size:0.85rem; color:var(--primary-600);">${tagNumber}</div>
            </div>
            <p style="font-size:0.9rem; color:var(--text-sub); margin-bottom:0.75rem;">
              Are you sure you want to <strong style="color:#ef4444;">permanently delete</strong> this cattle record?
            </p>
            <div style="background:rgba(239,68,68,0.06); border-left:3px solid #ef4444; padding:0.75rem 1rem; border-radius:0 var(--radius-sm) var(--radius-sm) 0; font-size:0.8rem; color:var(--text-sub);">
              <strong>This will also permanently remove:</strong>
              <ul style="margin-top:0.375rem; padding-left:1.25rem; line-height:1.9;">
                <li>All milk production logs for this cattle</li>
                <li>All breeding &amp; pregnancy records</li>
                <li>All health &amp; vaccination records</li>
                <li>All linked reminders &amp; alerts</li>
              </ul>
              <strong style="color:#ef4444;">This action cannot be undone.</strong>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('deleteCattleModal').remove()">
              <i class="fa-solid fa-xmark"></i> Cancel
            </button>
            <button class="btn btn-danger" onclick="App.deleteCattle('${tagNumber}', '${nickname}')">
              <i class="fa-solid fa-trash"></i> Yes, Delete Permanently
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  deleteCattle(tagNumber, nickname) {
    const data = DataStore.get();

    // Remove cattle record
    data.cattles = data.cattles.filter(c => c.tagNumber !== tagNumber);

    // Remove all related records
    data.milkLogs       = data.milkLogs.filter(m => m.cattleTag !== tagNumber);
    data.breedingRecords = data.breedingRecords.filter(b => b.cattleTag !== tagNumber);
    data.healthRecords  = data.healthRecords.filter(h => h.cattleTag !== tagNumber);
    data.reminders      = data.reminders.filter(r => !r.title.includes(tagNumber));

    // Remove pregnancy checklist entry if any
    if (data.pregnancyChecklist?.[tagNumber]) {
      delete data.pregnancyChecklist[tagNumber];
    }

    DataStore.save(data);
    document.getElementById('deleteCattleModal')?.remove();

    this.showToast(`🗑️ "${nickname}" (${tagNumber}) has been permanently deleted.`, 'error');

    // Refresh active view
    if (this.activeView === 'cattle')    this.renderCattleModule();
    if (this.activeView === 'dashboard') this.renderDashboard();
    this.updateNotificationBadge();
    this.renderAlertsBar?.();
  },

  openAddBreedingModal(tag) {
    const data = DataStore.get();
    const existing = data.breedingRecords.find(b => b.cattleTag === tag);
    const cattle = data.cattles.find(c => c.tagNumber === tag);
    const todayStr = new Date().toISOString().split('T')[0];

    document.getElementById('addBreedingModal')?.remove();
    const html = `
      <div class="modal-backdrop active" id="addBreedingModal">
        <div class="modal-container" style="max-width:580px;">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fa-solid fa-heart" style="color:var(--status-pregnant);"></i> ${existing ? 'Edit' : 'Record New'} Breeding / Insemination</h3>
            <span class="modal-close" onclick="document.getElementById('addBreedingModal').remove()">&times;</span>
          </div>
          <div class="modal-body">
            <div style="background:var(--bg-surface-elevated); border:1px solid var(--border-light); border-radius:var(--radius-md); padding:0.75rem 1rem; margin-bottom:1.25rem; font-size:0.875rem;">
              <strong>Cattle:</strong> ${cattle ? cattle.nickname : tag} &nbsp;·&nbsp; <span style="font-family:monospace; color:var(--primary-600);">${tag}</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
              <div class="form-group">
                <label class="form-label">Heat Detected Date</label>
                <input type="date" class="form-input" id="brdHeatDate" value="${existing?.heatDate || todayStr}">
              </div>
              <div class="form-group">
                <label class="form-label">Breeding / Insemination Date *</label>
                <input type="date" class="form-input" id="brdDate" value="${existing?.breedingDate || todayStr}">
              </div>
              <div class="form-group">
                <label class="form-label">Method</label>
                <select class="form-select" id="brdType">
                  <option ${existing?.type === 'Artificial Insemination' ? 'selected' : ''}>Artificial Insemination</option>
                  <option ${existing?.type === 'Natural' ? 'selected' : ''}>Natural</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Technician / Vet Name</label>
                <input type="text" class="form-input" id="brdTech" placeholder="e.g. Dr. Sarah Jenkins" value="${existing?.technicianName || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Technician ID</label>
                <input type="text" class="form-input" id="brdTechId" placeholder="e.g. VET-882" value="${existing?.technicianId || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Semen Batch # (if AI)</label>
                <input type="text" class="form-input" id="brdBatch" placeholder="e.g. SEM-HF-0001" value="${existing?.semenBatchNumber || ''}">
              </div>
              <div class="form-group" style="grid-column:1/-1;">
                <label class="form-label">Bull Breed / Sire</label>
                <input type="text" class="form-input" id="brdBullBreed" placeholder="e.g. Holstein Friesian Elite" value="${existing?.bullBreed || ''}">
              </div>
              <div class="form-group" style="grid-column:1/-1;">
                <label class="form-label">Notes</label>
                <textarea class="form-textarea" id="brdNotes" rows="2" placeholder="Any observations or additional notes...">${existing?.notes || ''}</textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('addBreedingModal').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="App.saveBreedingRecord('${tag}')">
              <i class="fa-solid fa-floppy-disk"></i> ${existing ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  saveBreedingRecord(cattleTag) {
    const breedingDate = document.getElementById('brdDate')?.value;
    if (!breedingDate) { this.showToast('Breeding date is required.', 'error'); return; }

    const data = DataStore.get();
    const existingIdx = data.breedingRecords.findIndex(b => b.cattleTag === cattleTag);

    const record = {
      id: existingIdx >= 0 ? data.breedingRecords[existingIdx].id : ('BRD-' + Date.now()),
      cattleTag,
      heatDate: document.getElementById('brdHeatDate')?.value || breedingDate,
      breedingDate,
      type: document.getElementById('brdType')?.value || 'Artificial Insemination',
      technicianName: document.getElementById('brdTech')?.value || 'Unknown',
      technicianId: document.getElementById('brdTechId')?.value || '',
      semenBatchNumber: document.getElementById('brdBatch')?.value || '',
      bullBreed: document.getElementById('brdBullBreed')?.value || '',
      confirmed: false,
      confirmationDate: null,
      status: 'Pending Confirmation',
      notes: document.getElementById('brdNotes')?.value || ''
    };

    if (existingIdx >= 0) {
      data.breedingRecords[existingIdx] = record;
    } else {
      data.breedingRecords.push(record);
    }

    // Update cattle status to Pregnant
    const cattleIdx = data.cattles.findIndex(c => c.tagNumber === cattleTag);
    if (cattleIdx >= 0) data.cattles[cattleIdx].status = 'Pregnant';

    DataStore.save(data);
    document.getElementById('addBreedingModal')?.remove();
    this.showToast(`Breeding record ${existingIdx >= 0 ? 'updated' : 'saved'} for ${cattleTag}.`);

    if (this.activeView === 'breeding') {
      SmartPregnancyModule.renderCalculatorWidget('pregnancyWidgetContainer', cattleTag);
      this.renderBreedingRecordsTable();
    }
  },

  setupSearch() {
    const input = document.getElementById('globalSearchInput');
    const dropdown = document.getElementById('searchResultsDropdown');
    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) { dropdown.style.display = 'none'; return; }

      const data = DataStore.get();
      const results = data.cattles.filter(c =>
        c.tagNumber.toLowerCase().includes(q) ||
        c.nickname.toLowerCase().includes(q) ||
        c.breed.toLowerCase().includes(q) ||
        c.officialName.toLowerCase().includes(q)
      ).slice(0, 6);

      if (results.length === 0) {
        dropdown.style.display = 'none'; return;
      }

      dropdown.innerHTML = results.map(c => `
        <div onclick="App.openCattleProfile('${c.tagNumber}'); document.getElementById('globalSearchInput').value=''; document.getElementById('searchResultsDropdown').style.display='none';"
             style="display:flex; align-items:center; gap:0.75rem; padding:0.875rem 1.25rem; cursor:pointer; border-bottom:1px solid var(--border-light); transition:background 0.15s;"
             onmouseover="this.style.background='var(--card-hover-bg)'" onmouseout="this.style.background='transparent'">
          <img src="${c.photo || DEFAULT_COW_IMAGE}" onerror="this.src=DEFAULT_COW_IMAGE" style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0;" alt="${c.nickname}">
          <div>
            <div style="font-weight:700; font-size:0.875rem;">${c.nickname} <span style="font-size:0.75rem; color:var(--primary-600); font-family:monospace;">${c.tagNumber}</span></div>
            <div style="font-size:0.75rem; color:var(--text-sub);">${c.breed} &nbsp;·&nbsp; <span class="badge badge-${c.status.toLowerCase().replace(/\s+/g,'').replace('undertreatment','sick').replace('passedaway','dead')}" style="font-size:0.65rem;">${c.status}</span></div>
          </div>
        </div>
      `).join('');
      dropdown.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  },

  dismissReminder(id) {
    const data = DataStore.get();
    data.reminders = data.reminders.filter(r => r.id !== id);
    DataStore.save(data);
    this.renderDocumentsAndReminders();
    this.updateNotificationBadge();
    this.renderAlertsBar();
    this.showToast('Reminder dismissed.');
  },

  updateNotificationBadge() {
    const data = DataStore.get();
    const count = data.reminders.length;
    const badge = document.getElementById('notifBadgeCount');
    if (badge) badge.style.display = count > 0 ? 'block' : 'none';
  },

  animateCounters() {
    const counters = document.querySelectorAll('.counter-num');
    counters.forEach(el => {
      const target = parseInt(el.getAttribute('data-target') || '0', 10);
      let current = 0;
      const step = Math.ceil(target / 80);
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current.toLocaleString() + '+';
      }, 18);
    });
  },

  showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const colors = { success: 'var(--primary-600)', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
    const color = colors[type] || colors.success;
    const icon = icons[type] || icons.success;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = color;
    toast.innerHTML = `
      <i class="fa-solid ${icon}" style="color:${color}; font-size:1.1rem; flex-shrink:0;"></i>
      <div style="min-width:0;">
        <div style="font-size:0.875rem; color:var(--text-main);">${message}</div>
      </div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
window.Auth = Auth;
