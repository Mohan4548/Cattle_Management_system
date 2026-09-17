/* FarmEase Export & Report Generator Module */

const ReportsModule = {
  generateReport(reportType) {
    const data = DataStore.get();
    let title = "";
    let headers = [];
    let rows = [];

    if (reportType === "milk") {
      title = "Milk Production Report";
      headers = ["Date", "Cattle Tag", "Morning (L)", "Evening (L)", "Daily Total (L)", "Fat %"];
      rows = data.milkLogs.map(m => [m.date, m.cattleTag, m.morningQty, m.eveningQty, m.totalQty, m.fatPct + '%']);
    } else if (reportType === "vaccination") {
      title = "Cattle Vaccination & Health Report";
      headers = ["Date", "Cattle Tag", "Vaccine Name", "Batch #", "Doctor", "Next Due Date"];
      rows = data.healthRecords.filter(h => h.type === "Vaccination").map(h => [
        h.date, h.cattleTag, h.vaccineName, h.batchNumber, h.doctorName, h.nextDueDate
      ]);
    } else if (reportType === "pregnancy") {
      title = "Gestation & Pregnancy Progress Report";
      headers = ["Cattle Tag", "Breeding Date", "Type", "EDD Date", "Remaining Days", "Status"];
      rows = data.breedingRecords.map(b => {
        const edd = SmartPregnancyModule.calculateEDD(b.breedingDate);
        return [b.cattleTag, b.breedingDate, b.type, edd.expectedDeliveryDate, edd.remainingDays + " Days", b.status];
      });
    } else if (reportType === "financial") {
      title = "Financial Income & Expense Summary";
      headers = ["Category", "Type", "Amount (Rs)", "Status"];
      const incomeRows = data.financials.incomeBreakdown.map(i => [i.category, "Income", "Rs" + i.amount, "Realized"]);
      const expenseRows = data.financials.expenseBreakdown.map(e => [e.category, "Expense", "Rs" + e.amount, "Paid"]);
      rows = [...incomeRows, ...expenseRows];
    }

    this.showReportPreviewModal(title, headers, rows, reportType);
  },

  showReportPreviewModal(title, headers, rows, reportType) {
    const modalHtml = `
      <div class="modal-backdrop active" id="reportPreviewModal">
        <div class="modal-container" style="max-width:850px;">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fa-solid fa-file-invoice"></i> ${title}</h3>
            <span class="modal-close" onclick="document.getElementById('reportPreviewModal').remove()">&times;</span>
          </div>
          <div class="modal-body">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
              <div>
                <strong>FarmEase SaaS Report Exporter</strong>
                <div style="font-size:0.8rem; color:var(--text-sub);">Generated on: ${new Date().toLocaleDateString()} | Farm: GreenPasture Enterprise</div>
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button class="btn btn-primary btn-sm" onclick="ReportsModule.downloadPDF('${title}')">
                  <i class="fa-solid fa-file-pdf"></i> Download PDF
                </button>
                <button class="btn btn-secondary btn-sm" onclick="ReportsModule.downloadCSV('${title}', '${reportType}')">
                  <i class="fa-solid fa-file-excel"></i> Export Excel/CSV
                </button>
              </div>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    ${headers.map(h => `<th>${h}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${rows.map(row => `
                    <tr>
                      ${row.map(cell => `<td>${cell}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('reportPreviewModal').remove()">Close</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  downloadCSV(title, reportType) {
    const data = DataStore.get();
    let headers = [];
    let rows = [];

    if (reportType === "milk") {
      headers = ["Date", "Cattle Tag", "Morning (L)", "Evening (L)", "Daily Total (L)", "Fat %"];
      rows = data.milkLogs.map(m => [m.date, m.cattleTag, m.morningQty, m.eveningQty, m.totalQty, m.fatPct + '%']);
    } else if (reportType === "vaccination") {
      headers = ["Date", "Cattle Tag", "Vaccine Name", "Batch #", "Doctor", "Next Due Date"];
      rows = data.healthRecords.filter(h => h.type === "Vaccination").map(h => [
        h.date, h.cattleTag, h.vaccineName, h.batchNumber, h.doctorName, h.nextDueDate
      ]);
    } else if (reportType === "pregnancy") {
      headers = ["Cattle Tag", "Breeding Date", "Type", "EDD Date", "Remaining Days", "Status"];
      rows = data.breedingRecords.map(b => {
        const edd = SmartPregnancyModule.calculateEDD(b.breedingDate);
        return [b.cattleTag, b.breedingDate, b.type, edd.expectedDeliveryDate, edd.remainingDays + " Days", b.status];
      });
    } else if (reportType === "financial") {
      headers = ["Category", "Type", "Amount (Rs)", "Status"];
      const incomeRows = data.financials.incomeBreakdown.map(i => [i.category, "Income", "Rs" + i.amount, "Realized"]);
      const expenseRows = data.financials.expenseBreakdown.map(e => [e.category, "Expense", "Rs" + e.amount, "Paid"]);
      rows = [...incomeRows, ...expenseRows];
    }

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    App.showToast(`Exported "${title}" as CSV file.`);
  },

  downloadPDF(title) {
    window.print();
  }
};

window.ReportsModule = ReportsModule;
