/* FarmEase Data Store & Repository Layer */
const DEFAULT_COW_IMAGE = "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400";

const INDIAN_BREEDS = [
  "Kangayam",
  "Gir",
  "Sahiwal",
  "Tharparkar",
  "Red Sindhi",
  "Ongole",
  "Hallikar",
  "Deoni",
  "Kankrej",
  "Rathi",
  "Hariana",
  "Krishna Valley",
  "Amrit Mahal",
  "Vechur",
  "Malnad Gidda",
  "Bargur",
  "Pulikulam",
  "Umblachery",
  "Punganur",
  "Nagori",
  "Dangi",
  "Khillari",
  "Crossbreed",
  "Jersey Cross",
  "Holstein Friesian (HF)",
  "HF Cross",
  "Jersey",
  "Other"
];

const INITIAL_DATA = {
  farmInfo: {
    name: "GreenPasture Enterprise Farms",
    owner: "Dr. Mohan Kumar",
    license: "FE-2026-88910-US",
    location: "Green Valley Farm Road, Sector 12",
    coordinates: { lat: 12.9716, lng: 77.5946 },
    totalArea: "150 Acres",
    logoUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=150"
  },
  currentUser: {
    id: "U-101",
    name: "Dr. Mohan Kumar",
    role: "Admin", // Admin or Farm Owner
    email: "admin@farmease.com",
    avatar: "MK"
  },
  cattles: [
    {
      id: "CTL-1001",
      tagNumber: "FE-COW-001",
      nickname: "Bella",
      officialName: "Bella Queen Supreme",
      photo: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400",
      breed: "Holstein Friesian",
      color: "Black & White",
      gender: "Female",
      dob: "2021-03-15",
      age: "5 Yrs 4 Mos",
      weight: 580, // kg
      height: 145, // cm
      purchaseDate: "2022-01-10",
      purchasePrice: 2200,
      currentMarketValue: 3100,
      owner: "GreenPasture Enterprise Farms",
      status: "Pregnant", // Available, Sold, Passed Away, Under Treatment, Pregnant
      healthStatus: "Healthy",
      grandMotherTag: "FE-COW-900",
      motherTag: "FE-COW-950",
      fatherTag: "FE-BULL-700",
      lactationNumber: 3,
      notes: "High milk producer with calm temperament."
    },
    {
      id: "CTL-1002",
      tagNumber: "FE-COW-002",
      nickname: "Daisy",
      officialName: "Daisy Princess Gold",
      photo: "https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=400",
      breed: "Jersey",
      color: "Fawn & Brown",
      gender: "Female",
      dob: "2022-06-20",
      age: "4 Yrs 1 Mo",
      weight: 460,
      height: 132,
      purchaseDate: "2023-03-14",
      purchasePrice: 1800,
      currentMarketValue: 2400,
      owner: "GreenPasture Enterprise Farms",
      status: "Available",
      healthStatus: "Healthy",
      grandMotherTag: "FE-COW-900",
      motherTag: "FE-COW-001", // Mother is Bella
      fatherTag: "FE-BULL-701",
      lactationNumber: 2,
      notes: "High butterfat milk percentage (4.8%)."
    },
    {
      id: "CTL-1003",
      tagNumber: "FE-COW-003",
      nickname: "Luna",
      officialName: "Luna Star Gir",
      photo: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400",
      breed: "Gir",
      color: "Reddish Brown",
      gender: "Female",
      dob: "2020-11-05",
      age: "5 Yrs 8 Mos",
      weight: 510,
      height: 140,
      purchaseDate: "2021-08-01",
      purchasePrice: 2500,
      currentMarketValue: 3400,
      owner: "GreenPasture Enterprise Farms",
      status: "Under Treatment",
      healthStatus: "Sick",
      grandMotherTag: "FE-COW-880",
      motherTag: "FE-COW-920",
      fatherTag: "FE-BULL-690",
      lactationNumber: 4,
      notes: "Recovering from mild mastitis. Responding well to antibiotics."
    },
    {
      id: "CTL-1004",
      tagNumber: "FE-CALF-004",
      nickname: "Coco",
      officialName: "Little Coco",
      photo: "https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=400",
      breed: "Holstein Friesian",
      color: "Black & White",
      gender: "Female",
      dob: "2026-02-10",
      age: "5 Mos",
      weight: 110,
      height: 85,
      purchaseDate: "Born in Farm",
      purchasePrice: 0,
      currentMarketValue: 850,
      owner: "GreenPasture Enterprise Farms",
      status: "Available",
      healthStatus: "Healthy",
      grandMotherTag: "FE-COW-950",
      motherTag: "FE-COW-001", // Daughter of Bella
      fatherTag: "FE-BULL-700",
      lactationNumber: 0,
      notes: "Healthy calf born via normal delivery."
    },
    {
      id: "CTL-1005",
      tagNumber: "FE-COW-005",
      nickname: "Rosie",
      officialName: "Sahiwal Beauty",
      photo: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400",
      breed: "Sahiwal",
      color: "Reddish Brown",
      gender: "Female",
      dob: "2023-01-12",
      age: "3 Yrs 6 Mos",
      weight: 480,
      height: 136,
      purchaseDate: "2024-02-18",
      purchasePrice: 2100,
      currentMarketValue: 2800,
      owner: "GreenPasture Enterprise Farms",
      status: "Pregnant",
      healthStatus: "Healthy",
      grandMotherTag: "FE-COW-850",
      motherTag: "FE-COW-910",
      fatherTag: "FE-BULL-695",
      lactationNumber: 1,
      notes: "First pregnancy progressing normally."
    }
  ],
  milkLogs: [
    { id: "MLK-1", date: "2026-07-26", cattleTag: "FE-COW-001", morningQty: 14.5, eveningQty: 12.0, totalQty: 26.5, fatPct: 4.2 },
    { id: "MLK-2", date: "2026-07-26", cattleTag: "FE-COW-002", morningQty: 11.0, eveningQty: 9.5, totalQty: 20.5, fatPct: 4.8 },
    { id: "MLK-3", date: "2026-07-26", cattleTag: "FE-COW-005", morningQty: 12.0, eveningQty: 10.5, totalQty: 22.5, fatPct: 4.5 },
    { id: "MLK-4", date: "2026-07-25", cattleTag: "FE-COW-001", morningQty: 15.0, eveningQty: 12.5, totalQty: 27.5, fatPct: 4.1 },
    { id: "MLK-5", date: "2026-07-25", cattleTag: "FE-COW-002", morningQty: 11.5, eveningQty: 10.0, totalQty: 21.5, fatPct: 4.7 }
  ],
  breedingRecords: [
    {
      id: "BRD-101",
      cattleTag: "FE-COW-001",
      heatDate: "2025-11-10",
      breedingDate: "2025-11-12",
      type: "Artificial Insemination", // Artificial Insemination / Natural
      technicianName: "Dr. Sarah Jenkins",
      technicianId: "VET-882",
      semenBatchNumber: "SEM-HF-9941",
      bullBreed: "Holstein Friesian Elite",
      confirmed: true,
      confirmationDate: "2025-12-15",
      pregnancyMonth: 8,
      status: "Active Pregnancy",
      notes: "Calculated delivery expected in 24 days."
    },
    {
      id: "BRD-102",
      cattleTag: "FE-COW-005",
      heatDate: "2026-02-01",
      breedingDate: "2026-02-03",
      type: "Artificial Insemination",
      technicianName: "Dr. Sarah Jenkins",
      technicianId: "VET-882",
      semenBatchNumber: "SEM-SAH-3320",
      bullBreed: "Sahiwal Bull Prime",
      confirmed: true,
      confirmationDate: "2026-03-08",
      pregnancyMonth: 5,
      status: "Active Pregnancy",
      notes: "Fetal heart rate normal."
    }
  ],
  pregnancyChecklist: {
    "FE-COW-001": {
      nutrition: true,
      calcium: true,
      mineralSupplements: true,
      deworming: true,
      vaccination: true,
      cleanShelter: true,
      water: true,
      exercise: true,
      doctorCheckup: true
    },
    "FE-COW-005": {
      nutrition: true,
      calcium: true,
      mineralSupplements: true,
      deworming: true,
      vaccination: false,
      cleanShelter: true,
      water: true,
      exercise: true,
      doctorCheckup: true
    }
  },
  healthRecords: [
    {
      id: "HLT-201",
      cattleTag: "FE-COW-001",
      type: "Vaccination",
      vaccineName: "FMD (Foot & Mouth Disease)",
      date: "2026-05-10",
      nextDueDate: "2026-11-10",
      batchNumber: "VAC-FMD-2026-A",
      doctorName: "Dr. Sarah Jenkins",
      doctorId: "VET-882",
      hospitalName: "City Veterinary Care",
      medicines: "FMD Booster 5ml",
      notes: "Annual routine vaccination completed."
    },
    {
      id: "HLT-202",
      cattleTag: "FE-COW-003",
      type: "Treatment",
      disease: "Mastitis (Mild)",
      symptoms: "Swelling in udder quarter, drop in milk yield",
      diagnosis: "Acute Bacterial Mastitis",
      medicines: "Cephapirin Benzathine 300mg",
      dosage: "1 intramammary tube daily for 3 days",
      startDate: "2026-07-24",
      endDate: "2026-07-27",
      veterinarianName: "Dr. Sarah Jenkins",
      veterinarianId: "VET-882",
      prescriptionUpload: "prescription_luna_mastitis.pdf",
      notes: "Isolated from main herd during treatment."
    }
  ],
  feedLogs: [
    { id: "FED-1", date: "2026-07-26", feedType: "Green Fodder & Silage", dailyQtyKg: 25, costPerKg: 0.25, totalCost: 6.25, waterIntakeLiters: 85, supplements: "Calcium & Mineral Mix 100g", schedule: "07:00 AM & 04:30 PM" },
    { id: "FED-2", date: "2026-07-26", feedType: "Concentrate Feed", dailyQtyKg: 8, costPerKg: 0.60, totalCost: 4.80, waterIntakeLiters: 40, supplements: "B-Complex", schedule: "08:00 AM & 05:00 PM" }
  ],
  financials: {
    monthlyIncome: 14850, // USD
    monthlyExpense: 6200,
    incomeBreakdown: [
      { category: "Milk Sales", amount: 12500 },
      { category: "Cattle Sales", amount: 1850 },
      { category: "Manure / Organic Fertilizer", amount: 500 }
    ],
    expenseBreakdown: [
      { category: "Feed & Fodder", amount: 3100 },
      { category: "Veterinary & Medicines", amount: 950 },
      { category: "Labor & Wages", amount: 1400 },
      { category: "Utilities & Fuel", amount: 750 }
    ]
  },
  reminders: [
    { id: "REM-1", title: "FMD Vaccine Due for FE-COW-002", dueDate: "2026-08-01", type: "Vaccination", status: "Pending", priority: "High" },
    { id: "REM-2", title: "Expected Delivery Countdown: Bella (FE-COW-001)", dueDate: "2026-08-22", type: "Delivery", status: "Pending", priority: "Critical" },
    { id: "REM-3", title: "Deworming Checkup for Calves", dueDate: "2026-08-05", type: "Doctor Visit", status: "Pending", priority: "Medium" }
  ],
  documents: [
    { id: "DOC-1", cattleTag: "FE-COW-001", title: "Vaccination Certificate 2026", type: "Vaccination Certificate", date: "2026-05-10", size: "1.2 MB" },
    { id: "DOC-2", cattleTag: "FE-COW-001", title: "Original Purchase Bill & Pedigree Certificate", type: "Purchase Bill", date: "2022-01-10", size: "2.4 MB" },
    { id: "DOC-3", cattleTag: "FE-COW-003", title: "Vet Prescription - Mastitis Care", type: "Medical Report", date: "2026-07-24", size: "850 KB" }
  ]
};

class DataStoreManager {
  constructor() {
    this.key = "FARMEASE_APP_DATA_V1";
    this.init();
  }

  init() {
    const existing = localStorage.getItem(this.key);
    if (!existing) {
      this.save(INITIAL_DATA);
    }
  }

  get() {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : INITIAL_DATA;
    } catch (e) {
      console.error("Error reading localStorage:", e);
      return INITIAL_DATA;
    }
  }

  save(data) {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (e) {
      console.error("Error writing localStorage:", e);
    }
  }

  resetToDefault() {
    this.save(INITIAL_DATA);
    return INITIAL_DATA;
  }
}

window.DataStore = new DataStoreManager();
