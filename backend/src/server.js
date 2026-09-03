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
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5000";
const FRONTEND = path.join(__dirname, "../../frontend");
const DATA = path.join(__dirname, "../data.json");

// Warn if using the default fallback secret
if (JWT_SECRET === "alaska-travel-development-secret") {
  console.warn("[WARN] JWT_SECRET is using the default fallback — set a real secret in .env for production!");
}

// Rate limiter — 10 requests per 15 minutes per IP on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again after 15 minutes." }
});

app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function readData() {
  if (!fs.existsSync(DATA)) fs.writeFileSync(DATA, JSON.stringify({users:[],bookings:[],payments:[],transfers:[]}, null, 2));
  return JSON.parse(fs.readFileSync(DATA, "utf8"));
}
function writeData(data) { fs.writeFileSync(DATA, JSON.stringify(data, null, 2)); }
function tokenFor(user) { return jwt.sign({id:user.id,email:user.email,name:user.name}, JWT_SECRET, {expiresIn:"7d"}); }
// Always strip password before sending user data to client
function sanitizeUser(u) { return {id:u.id, name:u.name, email:u.email}; }
function auth(req,res,next) {
  const h=req.headers.authorization||"";
  if(!h.startsWith("Bearer ")) return res.status(401).json({message:"Authentication required"});
  try { req.user=jwt.verify(h.slice(7),JWT_SECRET); next(); }
  catch { return res.status(401).json({message:"Invalid or expired token"}); }
}

const flights = [
  {id:"AK101",airline:"Alaska Airlines",flight:"AS101",from:"Mumbai",fromCode:"BOM",to:"Anchorage",toCode:"ANC",departure:"22:10",arrival:"18:30",duration:"18h 20m",stop:"1 Stop",price:62500,class:"Economy"},
  {id:"AK202",airline:"Alaska Airlines",flight:"AS202",from:"Delhi",fromCode:"DEL",to:"Anchorage",toCode:"ANC",departure:"21:30",arrival:"17:45",duration:"17h 15m",stop:"1 Stop",price:58400,class:"Economy"},
  {id:"AK303",airline:"Alaska Airlines",flight:"AS303",from:"Mumbai",fromCode:"BOM",to:"Fairbanks",toCode:"FAI",departure:"23:20",arrival:"19:05",duration:"19h 45m",stop:"1 Stop",price:67200,class:"Economy"},
  {id:"AK404",airline:"Alaska Airlines",flight:"AS404",from:"Mumbai",fromCode:"BOM",to:"Juneau",toCode:"JNU",departure:"20:40",arrival:"16:25",duration:"18h 45m",stop:"2 Stops",price:73500,class:"Premium"},
  {id:"AK505",airline:"Alaska Airlines",flight:"AS505",from:"Kolkata",fromCode:"CCU",to:"Anchorage",toCode:"ANC",departure:"19:15",arrival:"16:10",duration:"20h 55m",stop:"2 Stops",price:61900,class:"Economy"}
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

app.post("/api/auth/register", authLimiter, async (req,res)=>{
  const {name,email,password}=req.body;
  if(!name||!email||!password||password.length<6) return res.status(400).json({message:"Name, valid email and 6+ character password are required"});
  const data=readData(), normalized=email.trim().toLowerCase();
  if(data.users.some(u=>u.email===normalized)) return res.status(409).json({message:"Account already exists"});
  const user={id:uuidv4(),name:name.trim(),email:normalized,password:await bcrypt.hash(password,10),createdAt:new Date().toISOString()};
  data.users.push(user); writeData(data);
  res.status(201).json({token:tokenFor(user),user:sanitizeUser(user)});
});
app.post("/api/auth/login", authLimiter, async (req,res)=>{
  const {email,password}=req.body, data=readData(), user=data.users.find(u=>u.email===String(email||"").trim().toLowerCase());
  if(!user || !(await bcrypt.compare(password||"",user.password))) return res.status(401).json({message:"Invalid email or password"});
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
app.get("/api/bookings",auth,(req,res)=>res.json(readData().bookings.filter(b=>b.userId===req.user.id)));

app.post("/api/payments",auth,(req,res)=>{
  const p={id:"PAY-"+Date.now(),userId:req.user.id,status:"success",createdAt:new Date().toISOString(),...req.body};
  const data=readData();data.payments.push(p);writeData(data);res.status(201).json(p);
});
app.post("/api/transfers",auth,(req,res)=>{
  const {name,account,ifsc,amount,purpose}=req.body;
  if(!/^\d{9,18}$/.test(account||"")||!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(ifsc||"").toUpperCase())||Number(amount)<=0)
    return res.status(400).json({message:"Invalid transfer details"});
  const t={id:"ALT"+Date.now().toString().slice(-8),userId:req.user.id,name,account,ifsc:String(ifsc).toUpperCase(),amount:Number(amount),purpose,date:new Date().toLocaleDateString("en-IN"),time:new Date().toLocaleTimeString("en-IN")};
  const data=readData();data.transfers.push(t);writeData(data);res.status(201).json(t);
});
app.get("/api/transfers/:id",auth,(req,res)=>{
  const t=readData().transfers.find(x=>x.id===req.params.id&&x.userId===req.user.id); if(!t)return res.status(404).json({message:"Transfer not found"});res.json(t);
});

app.use(express.static(FRONTEND));
app.use((req,res)=>res.sendFile(path.join(FRONTEND,"index.html")));
app.listen(PORT,()=>{
  console.log(`Alaska Travel API running on http://localhost:${PORT}`);
  console.log(`Serving frontend from: ${FRONTEND}`);
});
