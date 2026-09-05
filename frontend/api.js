window.API = {
  get base() {
    if (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) {
      return window.APP_CONFIG.API_BASE_URL.replace(/\/+$/, "");
    }
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem("alaskaApiUrl") : null;
    if (stored) return stored.replace(/\/+$/, "");

    const isLocal = typeof location !== "undefined" && (
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1" ||
      location.protocol === "file:"
    );
    if (isLocal) {
      return location.protocol === "file:" ? "http://localhost:5000/api" : (location.port === "5000" ? "/api" : "http://localhost:5000/api");
    }
    return "https://alaska-tour-travel-backend.onrender.com/api";
  },

  token() { return localStorage.getItem("alaskaToken"); },

  async request(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const token = this.token();
    if (token) headers.Authorization = "Bearer " + token;

    const fullUrl = this.base + path;
    try {
      const res = await fetch(fullUrl, { ...options, headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Request failed with status ${res.status}`);
      return data;
    } catch (err) {
      if (err.name === "TypeError" && err.message && err.message.toLowerCase().includes("fetch")) {
        throw new Error("Unable to connect to Alaska Travel backend. If using cloud hosting, the server may be waking up from sleep. Please retry in 10-20 seconds.");
      }
      throw err;
    }
  },
  login(email,password){return this.request("/auth/login",{method:"POST",body:JSON.stringify({email,password})});},
  register(name,email,password){return this.request("/auth/register",{method:"POST",body:JSON.stringify({name,email,password})});},
  social(provider,email,name){return this.request("/auth/social",{method:"POST",body:JSON.stringify({provider,email,name})});},
  flights(params){return this.request("/flights?"+new URLSearchParams(params));},
  trains(params){return this.request("/trains?"+new URLSearchParams(params));},
  buses(params){return this.request("/buses?"+new URLSearchParams(params));},
  booking(data){return this.request("/bookings",{method:"POST",body:JSON.stringify(data)});},
  getBookings(){return this.request("/bookings");},
  getBooking(id){return this.request("/bookings/"+encodeURIComponent(id));},
  cancelBooking(id){return this.request("/bookings/"+encodeURIComponent(id)+"/cancel",{method:"PATCH"});},
  getProfile(){return this.request("/auth/profile");},
  updateProfile(data){return this.request("/auth/profile",{method:"PUT",body:JSON.stringify(data)});},
  payment(data){return this.request("/payments",{method:"POST",body:JSON.stringify(data)});},
  transfer(data){return this.request("/transfers",{method:"POST",body:JSON.stringify(data)});},
  
  // Admin Endpoints
  getAdminStats(){return this.request("/admin/stats");},
  getAdminUsers(){return this.request("/admin/users");},
  createAdminUser(data){return this.request("/admin/users",{method:"POST",body:JSON.stringify(data)});},
  updateAdminUser(id,data){return this.request("/admin/users/"+encodeURIComponent(id),{method:"PUT",body:JSON.stringify(data)});},
  deleteAdminUser(id){return this.request("/admin/users/"+encodeURIComponent(id),{method:"DELETE"});},
  getAdminBookings(){return this.request("/admin/bookings");},
  updateAdminBookingStatus(id,status){return this.request("/admin/bookings/"+encodeURIComponent(id)+"/status",{method:"PATCH",body:JSON.stringify({status})});},
  deleteAdminBooking(id){return this.request("/admin/bookings/"+encodeURIComponent(id),{method:"DELETE"});},
  getAppStats(){return this.request("/admin/app-stats");},
  recordAppDownload(platform="android"){return this.request("/admin/app-stats/download",{method:"POST",body:JSON.stringify({platform})});},
  getAdminPayments(){return this.request("/admin/payments");}
};
