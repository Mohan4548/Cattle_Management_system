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
  cattles: [],
  milkLogs: [],
  breedingRecords: [],
  pregnancyChecklist: {},
  healthRecords: [],
  feedLogs: [],
  financials: {
    monthlyIncome: 0,
    monthlyExpense: 0,
    incomeBreakdown: [],
    expenseBreakdown: []
  },
  reminders: [],
  documents: []
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
