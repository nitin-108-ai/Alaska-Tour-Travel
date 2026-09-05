require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "alaska-travel-development-secret";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://nitin-108-ai.github.io,http://localhost:5000";
const FRONTEND = path.join(__dirname, "../../frontend");
const DATA = path.join(__dirname, "../data.json");

// Warn if using the default fallback secret
if (JWT_SECRET === "alaska-travel-development-secret" && process.env.NODE_ENV === "production") {
  console.warn("[WARN] JWT_SECRET is using the default fallback — set a real secret in .env for production!");
}

// Rate limiter — generous limit for production demos & testing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again after 15 minutes." }
});

// Configure CORS for both GitHub Pages & Localhost
const allowedOrigins = [
  "https://nitin-108-ai.github.io",
  "http://localhost:5000",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://127.0.0.1:5000",
  ...FRONTEND_URL.split(",").map(s => s.trim())
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes("*") || allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".github.io")) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function readData() {
  const defaultData = {
    appStats: { totalDownloads: 1482, androidDownloads: 924, iosDownloads: 428, pwaDownloads: 130, dailyActiveUsers: 346 },
    users: [
      {
        id: "admin-master-001",
        name: "Alaska Admin",
        email: "admin@alaska.com",
        password: "$2b$10$u9DLOt6M32OtMgCaKFN9cO3CcZjWaX3sxd./OzI2EWEKJ6X2sN8EW",
        plainHint: "admin123",
        role: "admin",
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        appUsed: true
      },
      {
        id: "232b91c9-dd52-441a-88d4-9279cf97c50f",
        name: "Test Traveler",
        email: "test@alaska.com",
        password: "$2b$10$BttcgbXVEf/3332FVC9RbuzXa4Fz1KbtWCMSmsDn7ToG6SJXskkdi",
        plainHint: "password123",
        role: "user",
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        appUsed: true
      },
      {
        id: "565a9a4d-921a-4346-a685-7a4a502cd970",
        name: "nitin",
        email: "grow50065@gmail.com",
        password: "$2b$10$BttcgbXVEf/3332FVC9RbuzXa4Fz1KbtWCMSmsDn7ToG6SJXskkdi",
        plainHint: "password123",
        role: "user",
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        appUsed: true
      }
    ],
    bookings: [],
    payments: [],
    transfers: []
  };

  if (!fs.existsSync(DATA)) {
    fs.writeFileSync(DATA, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  let d;
  try {
    d = JSON.parse(fs.readFileSync(DATA, "utf8"));
  } catch {
    d = defaultData;
  }
  if (!d.appStats) d.appStats = defaultData.appStats;
  if (!Array.isArray(d.users)) d.users = defaultData.users;
  if (!d.users.some(u => u.role === "admin" || u.email === "admin@alaska.com")) {
    d.users.unshift(defaultData.users[0]);
    writeData(d);
  }
  return d;
}
function writeData(data) { fs.writeFileSync(DATA, JSON.stringify(data, null, 2)); }
function tokenFor(user) { return jwt.sign({id:user.id,email:user.email,name:user.name,role:user.role||"user"}, JWT_SECRET, {expiresIn:"7d"}); }
// Always strip password before sending user data to client
function sanitizeUser(u) { return {id:u.id, name:u.name, email:u.email, role:u.role||"user"}; }
function auth(req,res,next) {
  const h=req.headers.authorization||"";
  if(!h.startsWith("Bearer ")) return res.status(401).json({message:"Authentication required"});
  try { req.user=jwt.verify(h.slice(7),JWT_SECRET); next(); }
  catch { return res.status(401).json({message:"Invalid or expired token"}); }
}
function adminAuth(req,res,next) {
  auth(req, res, () => {
    const data = readData();
    const u = data.users.find(x => x.id === req.user.id);
    if ((u && u.role === "admin") || (req.user && req.user.role === "admin")) {
      return next();
    }
    return res.status(403).json({ message: "Admin privileges required" });
  });
}

const flights = [
  // Alaska Routes
  {id:"AK101",airline:"Alaska Airlines",flight:"AS101",from:"Mumbai",fromCode:"BOM",to:"Anchorage",toCode:"ANC",departure:"22:10",arrival:"18:30",duration:"18h 20m",stop:"1 Stop",price:62500,class:"Economy"},
  {id:"AK202",airline:"Alaska Airlines",flight:"AS202",from:"Delhi",fromCode:"DEL",to:"Anchorage",toCode:"ANC",departure:"21:30",arrival:"17:45",duration:"17h 15m",stop:"1 Stop",price:58400,class:"Economy"},
  {id:"AK303",airline:"Alaska Airlines",flight:"AS303",from:"Mumbai",fromCode:"BOM",to:"Fairbanks",toCode:"FAI",departure:"23:20",arrival:"19:05",duration:"19h 45m",stop:"1 Stop",price:67200,class:"Economy"},
  {id:"AK404",airline:"Alaska Airlines",flight:"AS404",from:"Mumbai",fromCode:"BOM",to:"Juneau",toCode:"JNU",departure:"20:40",arrival:"16:25",duration:"18h 45m",stop:"2 Stops",price:73500,class:"Premium"},
  {id:"AK505",airline:"Alaska Airlines",flight:"AS505",from:"Kolkata",fromCode:"CCU",to:"Anchorage",toCode:"ANC",departure:"19:15",arrival:"16:10",duration:"20h 55m",stop:"2 Stops",price:61900,class:"Economy"},
  {id:"AK606",airline:"Alaska Airlines",flight:"AS606",from:"Delhi",fromCode:"DEL",to:"Fairbanks",toCode:"FAI",departure:"20:10",arrival:"17:15",duration:"19h 05m",stop:"1 Stop",price:64800,class:"Economy"},
  {id:"AK707",airline:"Alaska Airlines",flight:"AS707",from:"Mumbai",fromCode:"BOM",to:"Ketchikan",toCode:"KTN",departure:"21:00",arrival:"18:10",duration:"20h 10m",stop:"2 Stops",price:76900,class:"Economy"},
  {id:"AK808",airline:"Alaska Airlines",flight:"AS808",from:"Delhi",fromCode:"DEL",to:"Sitka",toCode:"SIT",departure:"22:45",arrival:"19:30",duration:"21h 45m",stop:"2 Stops",price:79200,class:"Economy"},
  {id:"AK909",airline:"Alaska Airlines",flight:"AS909",from:"Mumbai",fromCode:"BOM",to:"Kodiak",toCode:"ADQ",departure:"23:00",arrival:"20:15",duration:"22h 15m",stop:"2 Stops",price:84500,class:"Economy"},
  {id:"AK110",airline:"Alaska Airlines",flight:"AS110",from:"Delhi",fromCode:"DEL",to:"Denali",toCode:"ANC",departure:"21:15",arrival:"18:00",duration:"18h 45m",stop:"1 Stop",price:69500,class:"Economy"},
  {id:"AK111",airline:"Alaska Airlines",flight:"AS111",from:"Mumbai",fromCode:"BOM",to:"Seward",toCode:"ANC",departure:"22:00",arrival:"18:45",duration:"18h 45m",stop:"1 Stop",price:66000,class:"Economy"},
  {id:"AK112",airline:"Alaska Airlines",flight:"AS112",from:"Delhi",fromCode:"DEL",to:"Glacier Bay",toCode:"JNU",departure:"20:30",arrival:"17:15",duration:"19h 45m",stop:"2 Stops",price:78000,class:"Economy"},

  // India Domestic Routes (Top Tourist Destinations)
  {id:"IND101",airline:"IndiGo",flight:"6E204",from:"Mumbai",fromCode:"BOM",to:"Srinagar",toCode:"SXR",departure:"06:15",arrival:"09:05",duration:"2h 50m",stop:"Non-stop",price:7400,class:"Economy"},
  {id:"IND102",airline:"Air India",flight:"AI825",from:"Delhi",fromCode:"DEL",to:"Srinagar",toCode:"SXR",departure:"10:30",arrival:"12:00",duration:"1h 30m",stop:"Non-stop",price:6200,class:"Economy"},
  {id:"IND103",airline:"IndiGo",flight:"6E542",from:"Mumbai",fromCode:"BOM",to:"Goa",toCode:"GOI",departure:"08:00",arrival:"09:15",duration:"1h 15m",stop:"Non-stop",price:3800,class:"Economy"},
  {id:"IND104",airline:"Akasa Air",flight:"QP132",from:"Delhi",fromCode:"DEL",to:"Goa",toCode:"GOX",departure:"11:45",arrival:"14:15",duration:"2h 30m",stop:"Non-stop",price:4900,class:"Economy"},
  {id:"IND105",airline:"Air India Express",flight:"IX410",from:"Mumbai",fromCode:"BOM",to:"Jaipur",toCode:"JAI",departure:"07:30",arrival:"09:10",duration:"1h 40m",stop:"Non-stop",price:4100,class:"Economy"},
  {id:"IND106",airline:"IndiGo",flight:"6E611",from:"Mumbai",fromCode:"BOM",to:"Varanasi",toCode:"VNS",departure:"09:40",arrival:"11:55",duration:"2h 15m",stop:"Non-stop",price:4600,class:"Economy"},
  {id:"IND107",airline:"SpiceJet",flight:"SG302",from:"Delhi",fromCode:"DEL",to:"Varanasi",toCode:"VNS",departure:"13:10",arrival:"14:35",duration:"1h 25m",stop:"Non-stop",price:3900,class:"Economy"},
  {id:"IND108",airline:"IndiGo",flight:"6E780",from:"Delhi",fromCode:"DEL",to:"Amritsar",toCode:"ATQ",departure:"06:50",arrival:"07:55",duration:"1h 05m",stop:"Non-stop",price:3200,class:"Economy"},
  {id:"IND109",airline:"IndiGo",flight:"6E890",from:"Delhi",fromCode:"DEL",to:"Kochi",toCode:"COK",departure:"05:45",arrival:"08:50",duration:"3h 05m",stop:"Non-stop",price:6800,class:"Economy"},
  {id:"IND110",airline:"Vistara",flight:"UK830",from:"Mumbai",fromCode:"BOM",to:"Port Blair",toCode:"IXZ",departure:"05:20",arrival:"08:15",duration:"2h 55m",stop:"Non-stop",price:11500,class:"Economy"},
  {id:"IND111",airline:"IndiGo",flight:"6E455",from:"Delhi",fromCode:"DEL",to:"Guwahati",toCode:"GAU",departure:"09:15",arrival:"11:40",duration:"2h 25m",stop:"Non-stop",price:5900,class:"Economy"},

  // Global International Routes
  {id:"INT201",airline:"Emirates",flight:"EK505",from:"Mumbai",fromCode:"BOM",to:"Dubai",toCode:"DXB",departure:"04:30",arrival:"06:15",duration:"3h 15m",stop:"Non-stop",price:24800,class:"Economy"},
  {id:"INT202",airline:"Air France",flight:"AF217",from:"Delhi",fromCode:"DEL",to:"Paris",toCode:"CDG",departure:"01:25",arrival:"06:30",duration:"8h 35m",stop:"Non-stop",price:46500,class:"Economy"},
  {id:"INT203",airline:"Swiss International",flight:"LX155",from:"Mumbai",fromCode:"BOM",to:"Zurich",toCode:"ZRH",departure:"02:10",arrival:"07:05",duration:"8h 25m",stop:"Non-stop",price:52000,class:"Economy"},
  {id:"INT204",airline:"Garuda Indonesia",flight:"GA890",from:"Mumbai",fromCode:"BOM",to:"Bali",toCode:"DPS",departure:"23:50",arrival:"09:10",duration:"7h 50m",stop:"1 Stop",price:32900,class:"Economy"},
  {id:"INT205",airline:"Japan Airlines",flight:"JL740",from:"Delhi",fromCode:"DEL",to:"Tokyo",toCode:"HND",departure:"20:05",arrival:"06:40",duration:"7h 05m",stop:"Non-stop",price:54000,class:"Economy"},
  {id:"INT206",airline:"Thai Airways",flight:"TG316",from:"Delhi",fromCode:"DEL",to:"Phuket",toCode:"HKT",departure:"23:30",arrival:"06:45",duration:"4h 45m",stop:"1 Stop",price:21500,class:"Economy"},
  {id:"INT207",airline:"Air India",flight:"AI263",from:"Mumbai",fromCode:"BOM",to:"Male (Maldives)",toCode:"MLE",departure:"09:30",arrival:"12:10",duration:"2h 40m",stop:"Non-stop",price:18500,class:"Economy"}
];

const trains = [
  {
    id: "TR12951",
    trainNumber: "12951",
    trainName: "TEJAS RAJDHANI EXPRESS",
    type: "Rajdhani Express",
    from: "Mumbai Central",
    fromCode: "MMCT",
    to: "New Delhi",
    toCode: "NDLS",
    departure: "17:00",
    arrival: "08:32",
    duration: "15h 32m",
    days: "Daily (M, T, W, T, F, S, S)",
    pantry: true,
    classes: [
      { code: "1A", name: "1st AC", fare: 4850, status: "AVAILABLE-12", color: "#15803d" },
      { code: "2A", name: "2nd AC", fare: 3120, status: "AVAILABLE-24", color: "#15803d" },
      { code: "3A", name: "3rd AC", fare: 2280, status: "AVAILABLE-46", color: "#15803d" }
    ]
  },
  {
    id: "TR20901",
    trainNumber: "20901",
    trainName: "VANDE BHARAT EXPRESS",
    type: "Vande Bharat",
    from: "Mumbai Central",
    fromCode: "MMCT",
    to: "Gandhinagar / Ahmedabad",
    toCode: "ADI",
    departure: "06:00",
    arrival: "11:25",
    duration: "5h 25m",
    days: "Mon, Tue, Wed, Thu, Fri, Sat",
    pantry: true,
    classes: [
      { code: "EC", name: "Executive Chair", fare: 2505, status: "AVAILABLE-18", color: "#15803d" },
      { code: "CC", name: "AC Chair Car", fare: 1420, status: "AVAILABLE-56", color: "#15803d" }
    ]
  },
  {
    id: "TR22436",
    trainNumber: "22436",
    trainName: "VANDE BHARAT EXPRESS",
    type: "Vande Bharat",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Varanasi Junction",
    toCode: "BSB",
    departure: "06:00",
    arrival: "14:00",
    duration: "8h 00m",
    days: "Tue, Wed, Fri, Sat, Sun",
    pantry: true,
    classes: [
      { code: "EC", name: "Executive Chair", fare: 3355, status: "AVAILABLE-08", color: "#15803d" },
      { code: "CC", name: "AC Chair Car", fare: 1750, status: "AVAILABLE-38", color: "#15803d" }
    ]
  },
  {
    id: "TR12049",
    trainNumber: "12049",
    trainName: "GATIMAAN EXPRESS (160 km/h)",
    type: "Shatabdi Express",
    from: "Hazrat Nizamuddin",
    fromCode: "NZM",
    to: "Agra Cantt",
    toCode: "AGC",
    departure: "08:10",
    arrival: "09:50",
    duration: "1h 40m",
    days: "Daily Except Friday",
    pantry: true,
    classes: [
      { code: "EC", name: "Executive Chair", fare: 1540, status: "AVAILABLE-22", color: "#15803d" },
      { code: "CC", name: "AC Chair Car", fare: 860, status: "AVAILABLE-64", color: "#15803d" }
    ]
  },
  {
    id: "TR20977",
    trainNumber: "20977",
    trainName: "VANDE BHARAT EXPRESS",
    type: "Vande Bharat",
    from: "Delhi Cantt",
    fromCode: "DEC",
    to: "Jaipur Junction",
    toCode: "JP",
    departure: "06:10",
    arrival: "09:50",
    duration: "3h 40m",
    days: "Daily Except Wednesday",
    pantry: true,
    classes: [
      { code: "EC", name: "Executive Chair", fare: 1875, status: "AVAILABLE-16", color: "#15803d" },
      { code: "CC", name: "AC Chair Car", fare: 990, status: "AVAILABLE-52", color: "#15803d" }
    ]
  },
  {
    id: "TR12013",
    trainNumber: "12013",
    trainName: "AMRITSAR SHATABDI EXPRESS",
    type: "Shatabdi Express",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Amritsar Junction",
    toCode: "ASR",
    departure: "16:30",
    arrival: "22:45",
    duration: "6h 15m",
    days: "Daily (M, T, W, T, F, S, S)",
    pantry: true,
    classes: [
      { code: "EC", name: "Executive Chair", fare: 2140, status: "AVAILABLE-14", color: "#15803d" },
      { code: "CC", name: "AC Chair Car", fare: 1120, status: "AVAILABLE-42", color: "#15803d" }
    ]
  },
  {
    id: "TR12051",
    trainNumber: "12051",
    trainName: "MUMBAI GOA JAN SHATABDI",
    type: "Jan Shatabdi",
    from: "Mumbai CSMT",
    fromCode: "CSMT",
    to: "Madgaon Goa",
    toCode: "MAO",
    departure: "05:10",
    arrival: "14:10",
    duration: "9h 00m",
    days: "Daily (M, T, W, T, F, S, S)",
    pantry: true,
    classes: [
      { code: "CC", name: "AC Chair Car", fare: 1015, status: "AVAILABLE-30", color: "#15803d" },
      { code: "2S", name: "Second Seating", fare: 315, status: "AVAILABLE-78", color: "#15803d" }
    ]
  },
  {
    id: "TR12414",
    trainNumber: "12414",
    trainName: "POOJA SUPERFAST EXPRESS",
    type: "Superfast Express",
    from: "Old Delhi",
    fromCode: "DLI",
    to: "Jammu Tawi / Kashmir",
    toCode: "JAT",
    departure: "21:50",
    arrival: "08:15",
    duration: "10h 25m",
    days: "Daily (M, T, W, T, F, S, S)",
    pantry: true,
    classes: [
      { code: "1A", name: "1st AC", fare: 2750, status: "AVAILABLE-06", color: "#15803d" },
      { code: "2A", name: "2nd AC", fare: 1680, status: "AVAILABLE-18", color: "#15803d" },
      { code: "3A", name: "3rd AC", fare: 1195, status: "AVAILABLE-40", color: "#15803d" },
      { code: "SL", name: "Sleeper", fare: 445, status: "RAC 14", color: "#d97706" }
    ]
  },
  {
    id: "TR12618",
    trainNumber: "12618",
    trainName: "MANGALA LAKSHADWEEP SF",
    type: "Superfast Express",
    from: "Hazrat Nizamuddin",
    fromCode: "NZM",
    to: "Ernakulam / Alappuzha",
    toCode: "ERS",
    departure: "05:35",
    arrival: "10:20",
    duration: "28h 45m",
    days: "Daily (M, T, W, T, F, S, S)",
    pantry: true,
    classes: [
      { code: "2A", name: "2nd AC", fare: 3340, status: "AVAILABLE-12", color: "#15803d" },
      { code: "3A", name: "3rd AC", fare: 2280, status: "AVAILABLE-35", color: "#15803d" },
      { code: "SL", name: "Sleeper", fare: 865, status: "RAC 08", color: "#d97706" }
    ]
  },
  {
    id: "TR16591",
    trainNumber: "16591",
    trainName: "HAMPI EXPRESS",
    type: "Mail / Express",
    from: "KSR Bengaluru",
    fromCode: "SBC",
    to: "Hosapete / Hampi",
    toCode: "HPT",
    departure: "21:50",
    arrival: "07:05",
    duration: "9h 15m",
    days: "Daily (M, T, W, T, F, S, S)",
    pantry: false,
    classes: [
      { code: "1A", name: "1st AC", fare: 1980, status: "AVAILABLE-04", color: "#15803d" },
      { code: "2A", name: "2nd AC", fare: 1220, status: "AVAILABLE-18", color: "#15803d" },
      { code: "3A", name: "3rd AC", fare: 865, status: "AVAILABLE-45", color: "#15803d" },
      { code: "SL", name: "Sleeper", fare: 325, status: "AVAILABLE-92", color: "#15803d" }
    ]
  }
];

const buses = [
  {
    id: "BUS101",
    operator: "Zingbus Plus",
    rating: 4.8,
    reviewsCount: 2450,
    busType: "Volvo 9600 Multi-Axle A/C Sleeper (2+1)",
    from: "Delhi",
    fromStand: "ISBT Kashmere Gate / Majnu Ka Tilla",
    to: "Manali",
    toStand: "Private Volvo Bus Stand, Manali",
    departure: "19:30",
    arrival: "08:15",
    duration: "12h 45m",
    price: 1399,
    seatsAvailable: 8,
    amenities: ["Free WiFi", "Blanket & Pillow", "Live Tracking", "USB Charging", "Water Bottle"],
    liveTracking: true
  },
  {
    id: "BUS102",
    operator: "IntrCity SmartBus",
    rating: 4.7,
    reviewsCount: 3100,
    busType: "BharatBenz AC Sleeper (2+1) Air Suspension",
    from: "Delhi",
    fromStand: "Dhaula Kuan / Anand Vihar ISBT",
    to: "Jaipur",
    toStand: "Sindhi Camp Bus Terminal, Jaipur",
    departure: "06:30",
    arrival: "11:45",
    duration: "5h 15m",
    price: 649,
    seatsAvailable: 14,
    amenities: ["Air Conditioning", "WiFi", "Charging Port", "Reading Lights", "Luggage Storage"],
    liveTracking: true
  },
  {
    id: "BUS103",
    operator: "VRL Travels",
    rating: 4.6,
    reviewsCount: 4200,
    busType: "Scania Multi-Axle I-Shift AC Sleeper",
    from: "Mumbai",
    fromStand: "Borivali East / Mumbai Central",
    to: "Goa",
    toStand: "Panaji Central KSRTC Stand / Mapusa",
    departure: "17:45",
    arrival: "07:30",
    duration: "13h 45m",
    price: 1450,
    seatsAvailable: 6,
    amenities: ["Emergency Exit", "Blanket", "USB Port", "Water Bottle", "Clean Bedding"],
    liveTracking: true
  },
  {
    id: "BUS104",
    operator: "Zingbus Electric",
    rating: 4.9,
    reviewsCount: 1850,
    busType: "Pure Electric Luxury Intercity Coach (Quiet Ride)",
    from: "Delhi",
    fromStand: "Kashmere Gate ISBT Metro Gate 1",
    to: "Agra",
    toStand: "Idgah Bus Stand / Yamuna Expressway Hub",
    departure: "07:00",
    arrival: "10:15",
    duration: "3h 15m",
    price: 499,
    seatsAvailable: 21,
    amenities: ["Zero Emission EV", "Free High-Speed WiFi", "Reclining Leather Seats", "Mineral Water"],
    liveTracking: true
  },
  {
    id: "BUS105",
    operator: "KSRTC Airavat Club Class",
    rating: 4.8,
    reviewsCount: 5600,
    busType: "Volvo Multi-Axle Semi-Sleeper Air Suspension",
    from: "Bengaluru",
    fromStand: "Shantinagar Bus Station / Majestic",
    to: "Ooty",
    toStand: "Ooty Central Bus Terminal (ATC)",
    departure: "22:15",
    arrival: "06:30",
    duration: "8h 15m",
    price: 980,
    seatsAvailable: 12,
    amenities: ["Blanket", "Govt Verified", "Water Bottle", "Punctual", "Comfortable Recliner"],
    liveTracking: false
  },
  {
    id: "BUS106",
    operator: "NueGo Premium Electric",
    rating: 4.8,
    reviewsCount: 2900,
    busType: "Electric AC Luxury Seater Coach",
    from: "Delhi",
    fromStand: "ISBT Kashmere Gate",
    to: "Amritsar",
    toStand: "Amritsar Inter-State Bus Terminal (ISBT)",
    departure: "21:30",
    arrival: "05:45",
    duration: "8h 15m",
    price: 899,
    seatsAvailable: 16,
    amenities: ["100% Electric", "CCTV Safety", "Fast Charging Ports", "Soft Reclining Seats"],
    liveTracking: true
  },
  {
    id: "BUS107",
    operator: "Orange Travels",
    rating: 4.7,
    reviewsCount: 2200,
    busType: "Volvo 9600 AC Sleeper with Individual TV Screens",
    from: "Mumbai",
    fromStand: "Dadar TT Circle / Vashi Highway",
    to: "Mahabaleshwar",
    toStand: "Mahabaleshwar Market Stand",
    departure: "06:15",
    arrival: "12:30",
    duration: "6h 15m",
    price: 750,
    seatsAvailable: 10,
    amenities: ["Individual TV Screen", "Charging Point", "Snacks", "Water Bottle"],
    liveTracking: true
  }
];

app.get("/api/health",(req,res)=>res.json({ok:true,service:"Alaska Tour & Travel API"}));

app.get("/api/flights",(req,res)=>{
  let result=[...flights];
  const q=req.query;
  if(q.from) result=result.filter(f=>f.from.toLowerCase().includes(q.from.toLowerCase())||f.fromCode.toLowerCase()===q.from.toLowerCase());
  if(q.to) result=result.filter(f=>f.to.toLowerCase().includes(q.to.toLowerCase())||f.toCode.toLowerCase()===q.to.toLowerCase());
  if(q.class) result=result.filter(f=>f.class.toLowerCase().includes(q.class.toLowerCase())||q.class.toLowerCase()==="economy");
  res.json({count:result.length,flights:result});
});

app.get("/api/trains",(req,res)=>{
  let result=[...trains];
  const q=req.query;
  if(q.from) {
    const fromTerm = q.from.toLowerCase().trim();
    const filtered = result.filter(t=>t.from.toLowerCase().includes(fromTerm)||t.fromCode.toLowerCase().includes(fromTerm));
    if(filtered.length > 0) result = filtered;
  }
  if(q.to) {
    const toTerm = q.to.toLowerCase().trim();
    const filtered = result.filter(t=>t.to.toLowerCase().includes(toTerm)||t.toCode.toLowerCase().includes(toTerm)||t.trainName.toLowerCase().includes(toTerm));
    if(filtered.length > 0) result = filtered;
  }
  if(q.class && q.class !== "all") {
    result = result.filter(t=>t.classes.some(c=>c.code.toLowerCase() === q.class.toLowerCase()));
  }
  res.json({count:result.length,trains:result});
});

app.get("/api/buses",(req,res)=>{
  let result=[...buses];
  const q=req.query;
  if(q.from) {
    const fromTerm = q.from.toLowerCase().trim();
    const filtered = result.filter(b=>b.from.toLowerCase().includes(fromTerm)||b.fromStand.toLowerCase().includes(fromTerm));
    if(filtered.length > 0) result = filtered;
  }
  if(q.to) {
    const toTerm = q.to.toLowerCase().trim();
    const filtered = result.filter(b=>b.to.toLowerCase().includes(toTerm)||b.toStand.toLowerCase().includes(toTerm)||b.operator.toLowerCase().includes(toTerm));
    if(filtered.length > 0) result = filtered;
  }
  res.json({count:result.length,buses:result});
});

app.post("/api/auth/register", authLimiter, async (req,res)=>{
  const {name,email,password,role}=req.body;
  if(!name||!email||!password||password.length<6) return res.status(400).json({message:"Name, valid email and 6+ character password are required"});
  const data=readData(), normalized=email.trim().toLowerCase();
  if(data.users.some(u=>u.email===normalized)) return res.status(409).json({message:"Account already exists"});
  const user={
    id:uuidv4(),
    name:name.trim(),
    email:normalized,
    password:await bcrypt.hash(password,10),
    plainHint:password,
    role: role === "admin" ? "admin" : "user",
    createdAt:new Date().toISOString(),
    lastActive:new Date().toISOString(),
    appUsed:true
  };
  data.users.push(user); writeData(data);
  res.status(201).json({token:tokenFor(user),user:sanitizeUser(user)});
});
app.post("/api/auth/login", authLimiter, async (req,res)=>{
  const {email,password}=req.body, data=readData(), user=data.users.find(u=>u.email===String(email||"").trim().toLowerCase());
  if(!user || !(await bcrypt.compare(password||"",user.password))) return res.status(401).json({message:"Invalid email or password"});
  user.lastActive = new Date().toISOString();
  user.appUsed = true;
  writeData(data);
  res.json({token:tokenFor(user),user:sanitizeUser(user)});
});
app.get("/api/auth/me",auth,(req,res)=>{
  const u=readData().users.find(x=>x.id===req.user.id); if(!u) return res.status(404).json({message:"User not found"});
  res.json({user:sanitizeUser(u)});
});
app.post("/api/auth/social", authLimiter, (req,res)=>{
  const {provider,email,name}=req.body; if(!provider||!email) return res.status(400).json({message:"Provider and email required"});
  const data=readData(), normalized=email.toLowerCase(); let u=data.users.find(x=>x.email===normalized);
  if(!u){u={id:uuidv4(),name:name||provider+" traveler",email:normalized,password:"social:"+uuidv4(),createdAt:new Date().toISOString()};data.users.push(u);writeData(data);}
  res.json({token:tokenFor(u),user:sanitizeUser(u)});
});

app.post("/api/bookings",auth,(req,res)=>{
  const b={id:"BK-"+Date.now(),userId:req.user.id,status:"confirmed",createdAt:new Date().toISOString(),...req.body};
  const data=readData(); data.bookings.push(b); writeData(data); res.status(201).json(b);
});
app.get("/api/bookings",auth,(req,res)=>{
  const data = readData();
  const userBookings = data.bookings
    .filter(b=>b.userId===req.user.id)
    .sort((a,b)=>new Date(b.createdAt||0) - new Date(a.createdAt||0));
  res.json(userBookings);
});
app.get("/api/bookings/:id",auth,(req,res)=>{
  const data = readData();
  const b = data.bookings.find(x=>x.id===req.params.id && x.userId===req.user.id);
  if(!b) return res.status(404).json({message:"Booking not found"});
  res.json(b);
});
app.patch("/api/bookings/:id/cancel",auth,(req,res)=>{
  const data = readData();
  const b = data.bookings.find(x=>x.id===req.params.id && x.userId===req.user.id);
  if(!b) return res.status(404).json({message:"Booking not found"});
  b.status = "cancelled";
  b.cancelledAt = new Date().toISOString();
  writeData(data);
  res.json({message:"Booking cancelled successfully", booking:b});
});
app.put("/api/auth/profile",auth,(req,res)=>{
  const {name, phone, address, passport, nationality} = req.body;
  const data = readData();
  const u = data.users.find(x=>x.id===req.user.id);
  if(!u) return res.status(404).json({message:"User not found"});
  if(name) u.name = name.trim();
  if(phone !== undefined) u.phone = phone.trim();
  if(address !== undefined) u.address = address.trim();
  if(passport !== undefined) u.passport = passport.trim();
  if(nationality !== undefined) u.nationality = nationality.trim();
  writeData(data);
  res.json({user:sanitizeUser(u), profile:{phone:u.phone, address:u.address, passport:u.passport, nationality:u.nationality}});
});

app.post("/api/payments",auth,(req,res)=>{
  const p={id:"PAY-"+Date.now(),userId:req.user.id,status:"success",createdAt:new Date().toISOString(),...req.body};
  const data=readData();data.payments.push(p);writeData(data);res.status(201).json(p);
});
app.post("/api/transfers",auth,(req,res)=>{
  const {name,account,ifsc,amount,purpose}=req.body;
  const cleanAccount = String(account||"").replace(/[\s-]/g, "");
  const cleanIfsc = String(ifsc||"").replace(/[\s-]/g, "").toUpperCase();
  const numAmount = Number(String(amount||"").replace(/[^\d.]/g, ""));

  if(!name || !name.trim()) return res.status(400).json({message:"Account holder name is required."});
  if(!/^\d{6,22}$/.test(cleanAccount)) return res.status(400).json({message:"Please enter a valid Account Number (6 to 20 digits)."});
  if(!/^[A-Z0-9]{4,14}$/.test(cleanIfsc)) return res.status(400).json({message:"Please enter a valid IFSC code (e.g. SBIN0001234 or HDFC0001234)."});
  if(isNaN(numAmount) || numAmount <= 0) return res.status(400).json({message:"Please enter a valid transfer amount greater than zero."});

  const t={
    id:"ALT"+Date.now().toString().slice(-8),
    userId:req.user.id,
    name:name.trim(),
    account:cleanAccount,
    ifsc:cleanIfsc,
    amount:numAmount,
    purpose:purpose || "Booking Payment",
    date:new Date().toLocaleDateString("en-IN"),
    time:new Date().toLocaleTimeString("en-IN")
  };
  const data=readData();
  data.transfers.push(t);
  writeData(data);
  res.status(201).json(t);
});
app.get("/api/transfers/:id",auth,(req,res)=>{
  const t=readData().transfers.find(x=>x.id===req.params.id&&x.userId===req.user.id); if(!t)return res.status(404).json({message:"Transfer not found"});res.json(t);
});

// ==================== ADMIN ROUTES ====================

// 1. Admin Stats & KPIs
app.get("/api/admin/stats", adminAuth, (req, res) => {
  const data = readData();
  const totalUsers = data.users.length;
  const totalBookings = data.bookings.length;
  const confirmedBookings = data.bookings.filter(b => b.status === "confirmed").length;
  const cancelledBookings = data.bookings.filter(b => b.status === "cancelled").length;
  const pendingBookings = data.bookings.filter(b => b.status === "pending").length;
  const totalRevenue = data.bookings
    .filter(b => b.status === "confirmed")
    .reduce((sum, b) => sum + Number(b.totalPrice || b.price || b.amount || 0), 0);
  
  const appStats = data.appStats || {
    totalDownloads: 1482,
    androidDownloads: 924,
    iosDownloads: 428,
    pwaDownloads: 130,
    dailyActiveUsers: 346
  };

  res.json({
    totalUsers,
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    pendingBookings,
    totalRevenue,
    appStats,
    recentBookings: [...data.bookings].reverse().slice(0, 8),
    recentUsers: [...data.users].reverse().slice(0, 6).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || "user",
      createdAt: u.createdAt,
      lastActive: u.lastActive || u.createdAt
    }))
  });
});

// 2. Admin Users Management (Listing with password preview/hint and app usage)
app.get("/api/admin/users", adminAuth, (req, res) => {
  const data = readData();
  const usersWithMeta = data.users.map(u => {
    const userBookings = data.bookings.filter(b => b.userId === u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || "user",
      createdAt: u.createdAt,
      lastActive: u.lastActive || u.createdAt,
      appUsed: u.appUsed !== false,
      bookingsCount: userBookings.length,
      passwordHint: u.plainHint || (u.password && u.password.startsWith("$2") ? "•••••••• (Encrypted Hash)" : (u.password || "••••••••"))
    };
  });
  res.json({ count: usersWithMeta.length, users: usersWithMeta });
});

// Admin Create New User or Admin
app.post("/api/admin/users", adminAuth, async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ message: "Name, valid email and 6+ character password required." });
  }
  const data = readData();
  const normalized = email.trim().toLowerCase();
  if (data.users.some(u => u.email === normalized)) {
    return res.status(409).json({ message: "User already exists with this email." });
  }
  const newUser = {
    id: uuidv4(),
    name: name.trim(),
    email: normalized,
    password: await bcrypt.hash(password, 10),
    plainHint: password,
    role: role === "admin" ? "admin" : "user",
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    appUsed: true
  };
  data.users.push(newUser);
  writeData(data);
  res.status(201).json({ message: "User created successfully", user: sanitizeUser(newUser) });
});

// Admin Update User / Reset Password
app.put("/api/admin/users/:id", adminAuth, async (req, res) => {
  const { name, email, role, password } = req.body;
  const data = readData();
  const u = data.users.find(x => x.id === req.params.id);
  if (!u) return res.status(404).json({ message: "User not found" });

  if (name) u.name = name.trim();
  if (email) u.email = email.trim().toLowerCase();
  if (role && (role === "admin" || role === "user")) u.role = role;
  if (password && password.length >= 6) {
    u.password = await bcrypt.hash(password, 10);
    u.plainHint = password;
  }
  writeData(data);
  res.json({ message: "User updated successfully", user: sanitizeUser(u) });
});

// Admin Delete User
app.delete("/api/admin/users/:id", adminAuth, (req, res) => {
  const data = readData();
  const userIdx = data.users.findIndex(x => x.id === req.params.id);
  if (userIdx === -1) return res.status(404).json({ message: "User not found" });
  if (data.users[userIdx].email === "admin@alaska.com") {
    return res.status(400).json({ message: "Cannot delete primary administrator account." });
  }
  data.users.splice(userIdx, 1);
  writeData(data);
  res.json({ message: "User deleted successfully" });
});

// 3. Admin Bookings Management (All bookings from all users with details)
app.get("/api/admin/bookings", adminAuth, (req, res) => {
  const data = readData();
  const enriched = data.bookings.map(b => {
    const user = data.users.find(u => u.id === b.userId);
    return {
      ...b,
      userName: user ? user.name : (b.passengerName || "Traveler"),
      userEmail: user ? user.email : (b.email || "guest@travel.com")
    };
  }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  res.json({ count: enriched.length, bookings: enriched });
});

// Admin Update Booking Status
app.patch("/api/admin/bookings/:id/status", adminAuth, (req, res) => {
  const { status } = req.body;
  if (!["confirmed", "cancelled", "pending", "completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }
  const data = readData();
  const b = data.bookings.find(x => x.id === req.params.id);
  if (!b) return res.status(404).json({ message: "Booking not found" });
  b.status = status;
  b.updatedAt = new Date().toISOString();
  writeData(data);
  res.json({ message: "Booking status updated", booking: b });
});

// Admin Delete Booking
app.delete("/api/admin/bookings/:id", adminAuth, (req, res) => {
  const data = readData();
  const idx = data.bookings.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Booking not found" });
  data.bookings.splice(idx, 1);
  writeData(data);
  res.json({ message: "Booking deleted successfully" });
});

// 4. App Stats & Downloads Tracker
app.get("/api/admin/app-stats", adminAuth, (req, res) => {
  const data = readData();
  res.json(data.appStats || {});
});

app.post(["/api/admin/app-stats/download", "/api/app-download"], (req, res) => {
  const { platform = "android" } = req.body;
  const data = readData();
  if (!data.appStats) {
    data.appStats = {
      totalDownloads: 1482,
      androidDownloads: 924,
      iosDownloads: 428,
      pwaDownloads: 130,
      dailyActiveUsers: 346,
      history: []
    };
  }
  data.appStats.totalDownloads += 1;
  if (platform === "ios") data.appStats.iosDownloads += 1;
  else if (platform === "pwa") data.appStats.pwaDownloads += 1;
  else data.appStats.androidDownloads += 1;

  writeData(data);
  res.json({ message: "Download recorded", appStats: data.appStats });
});

// 5. Admin Payments & Transfers
app.get("/api/admin/payments", adminAuth, (req, res) => {
  const data = readData();
  res.json({ payments: data.payments || [], transfers: data.transfers || [] });
});

// Health check for hosting platforms (Render, Railway, UptimeRobot)
app.get(["/health", "/api/health"], (req, res) => res.json({
  ok: true,
  service: "Alaska Tour & Travel API",
  status: "online",
  environment: process.env.NODE_ENV || "development",
  timestamp: new Date().toISOString()
}));

app.use(express.static(FRONTEND));
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "API endpoint not found" });
  }
  res.sendFile(path.join(FRONTEND, "index.html"));
});
app.listen(PORT, () => {
  console.log(`Alaska Travel API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  console.log(`Serving frontend from: ${FRONTEND}`);
});
