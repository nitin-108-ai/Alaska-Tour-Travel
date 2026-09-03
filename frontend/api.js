
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
  booking(data){return this.request("/bookings",{method:"POST",body:JSON.stringify(data)});},
  payment(data){return this.request("/payments",{method:"POST",body:JSON.stringify(data)});},
  transfer(data){return this.request("/transfers",{method:"POST",body:JSON.stringify(data)});}
};
