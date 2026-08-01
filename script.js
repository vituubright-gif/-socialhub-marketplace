const SUPABASE_URL="https://kzydpyhwowiqibtiwtti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_MKcJYgB2QzsushX-CnnDuA_UJGvMLBV";
let supabaseClient=null,currentUser=null,isSignup=false;
const $=id=>document.getElementById(id);
const msg=(id,t)=>{const e=$(id);if(e)e.textContent=t};
const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");

async function loadListings(){
 const cards=$("cards"); if(!cards||!supabaseClient)return;
 cards.innerHTML="<p class='status'>Loading listings...</p>";
 const {data,error}=await supabaseClient.from("listings").select("id,platform,title,description,followers,price,created_at").order("created_at",{ascending:false});
 console.log("SocialHub listings:",data,error);
 if(error){cards.innerHTML="";msg("empty","Could not load listings: "+error.message);$("empty")?.classList.remove("hidden");return;}
 let rows=Array.isArray(data)?data:[];
 const q=($("search")?.value||"").trim().toLowerCase(), p=$("platformFilter")?.value||"all", s=$("sortFilter")?.value||"default";
 if(q)rows=rows.filter(x=>`${x.title||""} ${x.platform||""} ${x.description||""}`.toLowerCase().includes(q));
 if(p!=="all")rows=rows.filter(x=>x.platform===p);
 if(s==="low")rows.sort((a,b)=>Number(a.price||0)-Number(b.price||0));
 if(s==="high")rows.sort((a,b)=>Number(b.price||0)-Number(a.price||0));
 if(!rows.length){cards.innerHTML="";msg("empty","No listings found.");$("empty")?.classList.remove("hidden");return;}
 cards.innerHTML=rows.map(x=>`<article class="card"><span class="tag">${esc(x.platform)}</span><h3>${esc(x.title)}</h3><p>${esc(x.description||"No description provided.")}</p><div class="meta"><span>${Number(x.followers||0).toLocaleString()} followers/subscribers</span><span class="price">$${Number(x.price||0).toFixed(2)}</span></div><button class="primary contact-btn" data-id="${esc(x.id)}" type="button">Contact seller</button></article>`).join("");
 $("empty")?.classList.add("hidden");
}
function updateAuthUI(){const on=!!currentUser;$("signInBtn")?.classList.toggle("hidden",on);$("logoutBtn")?.classList.toggle("hidden",!on);if($("authStatus"))$("authStatus").textContent=on?`Signed in as ${currentUser.email}`:""}
function openAuth(){$("authModal")?.classList.remove("hidden")}
function closeAuth(){$("authModal")?.classList.add("hidden");msg("authMessage","")}
function openListing(){if(!currentUser){openAuth();msg("authMessage","Please sign in first to post a listing.");return}$("listingModal")?.classList.remove("hidden")}
function closeListing(){$("listingModal")?.classList.add("hidden");msg("listingMessage","")}
async function initSupabase(){
 if(!window.supabase){msg("authMessage","Supabase did not load. Refresh the page.");return}
 supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
 const {data,error}=await supabaseClient.auth.getSession(); if(error)console.error(error);
 currentUser=data?.session?.user||null;updateAuthUI();await loadListings();
 supabaseClient.auth.onAuthStateChange((_event,session)=>{currentUser=session?.user||null;updateAuthUI()});
}
function setup(){
 $("signInBtn")?.addEventListener("click",openAuth);$("closeAuth")?.addEventListener("click",closeAuth);
 $("postBtn")?.addEventListener("click",openListing);$("closeListing")?.addEventListener("click",closeListing);
 $("logoutBtn")?.addEventListener("click",async()=>{await supabaseClient.auth.signOut();currentUser=null;updateAuthUI();await loadListings()});
 $("search")?.addEventListener("input",loadListings);$("platformFilter")?.addEventListener("change",loadListings);$("sortFilter")?.addEventListener("change",loadListings);
 $("toggleAuth")?.addEventListener("click",()=>{isSignup=!isSignup;$("authTitle").textContent=isSignup?"Create account":"Sign in";$("authSubmit").textContent=isSignup?"Create account":"Sign in";$("toggleAuth").textContent=isSignup?"Already have an account? Sign in":"Create an account";msg("authMessage","")});
 $("authForm")?.addEventListener("submit",async e=>{e.preventDefault();const email=$("email").value.trim(),password=$("password").value;$("authSubmit").disabled=true;msg("authMessage",isSignup?"Creating account...":"Signing in...");const r=isSignup?await supabaseClient.auth.signUp({email,password}):await supabaseClient.auth.signInWithPassword({email,password});$("authSubmit").disabled=false;if(r.error){msg("authMessage",r.error.message);return}if(isSignup)msg("authMessage","Account created. Check your email to confirm your account.");else{currentUser=r.data.user;updateAuthUI();closeAuth();await loadListings()}});
 $("listingForm")?.addEventListener("submit",async e=>{e.preventDefault();if(!currentUser){msg("listingMessage","Please sign in first.");return}const row={user_id:currentUser.id,platform:$("listingPlatform").value,title:$("listingTitle").value.trim(),description:$("listingDescription").value.trim(),followers:Number($("listingFollowers").value||0),price:Number($("listingPrice").value||0)};$("listingSubmit").disabled=true;msg("listingMessage","Publishing...");const {error}=await supabaseClient.from("listings").insert(row);$("listingSubmit").disabled=false;if(error){console.error(error);msg("listingMessage",error.message);return}msg("listingMessage","Listing published successfully!");$("listingForm").reset();$("listingFollowers").value=0;$("listingPrice").value=0;await loadListings();setTimeout(closeListing,900)});
 $("cards")?.addEventListener("click",e=>{if(!e.target.closest(".contact-btn"))return;if(!currentUser){openAuth();msg("authMessage","Please sign in to contact a seller.");return}alert("Seller contact messaging will be added next.")});
}
document.addEventListener("DOMContentLoaded",()=>{setup();initSupabase()});
