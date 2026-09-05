
window.API = {
  base: location.protocol === "file:" ? "http://localhost:5000/api" : "/api",
  token(){ return localStorage.getItem("alaskaToken"); },
  async request(path, options={}){
    const headers={"Content-Type":"application/json",...(options.headers||{})};
    const token=this.token(); if(token) headers.Authorization="Bearer "+token;
    const res=await fetch(this.base+path,{...options,headers});
    const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.message||"Request failed");
    return data;
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
