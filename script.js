const SUPABASE_URL="https://kzydpyhwowiqibtiwtti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_MKcJYgB2QzsushX-CnnDuA_UJGvMLBV";
let supabaseClient=null,currentUser=null,isSignup=false;
const $=id=>document.getElementById(id);
const msg=(id,t)=>{const e=$(id);if(e)e.textContent=t};

function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}

async function loadListings(){
 if(!supabaseClient)return;
 const cards=$("cards");
 const {data,error}=await supabaseClient.from("listings").select("id,platform,title,description,followers,price,created_at").order("created_at",{ascending:false});
 if(error){console.error(error);msg("empty","Could not load listings. Refresh and try again.");$("empty").classList.remove("hidden");return}
 let rows=data||[],q=($("search").value||"").toLowerCase(),p=$("platformFilter").value,s=$("sortFilter").value;
 if(q)rows=rows.filter(x=>`${x.title} ${x.platform} ${x.description||""}`.toLowerCase().includes(q));
 if(p!=="all")rows=rows.filter(x=>x.platform===p);
 if(s==="low")rows.sort((a,b)=>Number(a.price)-Number(b.price));
 if(s==="high")rows.sort((a,b)=>Number(b.price)-Number(a.price));
 cards.innerHTML=rows.map(x=>`<article class="card"><span class="tag">${esc(x.platform)}</span><h3>${esc(x.title)}</h3><p>${esc(x.description||"No description provided.")}</p><div class="meta"><span>${Number(x.followers||0).toLocaleString()} followers/subscribers</span><span class="price">$${Number(x.price||0).toFixed(2)}</span></div><button class="primary contact-btn" data-id="${x.id}" type="button">Contact seller</button></article>`).join("");
 $("empty").classList.toggle("hidden",rows.length!==0);
}

function updateAuth(){const on=!!currentUser;$("signInBtn").classList.toggle("hidden",on);$("logoutBtn").classList.toggle("hidden",!on);$("authStatus").textContent=on?`Signed in as ${currentUser.email}`:""}

async function init(){
 if(!window.supabase){msg("authMessage","Authentication library failed to load. Refresh.");return}
 supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
 const {data}=await supabaseClient.auth.getSession();currentUser=data?.session?.user||null;updateAuth();await loadListings();
 supabaseClient.auth.onAuthStateChange((_e,session)=>{currentUser=session?.user||null;updateAuth()});
}

function openAuth(){ $("authModal").classList.remove("hidden") }
function closeAuth(){ $("authModal").classList.add("hidden");msg("authMessage","") }
function openListing(){if(!currentUser){openAuth();msg("authMessage","Please sign in first to post a listing.");return}$("listingModal").classList.remove("hidden")}
function closeListing(){$("listingModal").classList.add("hidden");msg("listingMessage","")}

document.addEventListener("DOMContentLoaded",()=>{
 $("signInBtn").onclick=openAuth;$("closeAuth").onclick=closeAuth;$("postBtn").onclick=openListing;$("closeListing").onclick=closeListing;
 $("logoutBtn").onclick=async()=>{await supabaseClient.auth.signOut();currentUser=null;updateAuth()};
 ["search","platformFilter","sortFilter"].forEach(id=>$(id).addEventListener(id==="search"?"input":"change",loadListings));
 $("toggleAuth").onclick=()=>{isSignup=!isSignup;$("authTitle").textContent=isSignup?"Create account":"Sign in";$("authSubmit").textContent=isSignup?"Create account":"Sign in";$("toggleAuth").textContent=isSignup?"Already have an account? Sign in":"Create an account";msg("authMessage","")};
 $("authForm").onsubmit=async e=>{e.preventDefault();if(!supabaseClient)return;let email=$("email").value.trim(),password=$("password").value;$("authSubmit").disabled=true;msg("authMessage",isSignup?"Creating account...":"Signing in...");
 let r=isSignup?await supabaseClient.auth.signUp({email,password}):await supabaseClient.auth.signInWithPassword({email,password});$("authSubmit").disabled=false;
 if(r.error){msg("authMessage",r.error.message);return}if(isSignup){msg("authMessage","Account created. Check your email to confirm your account.")}else{currentUser=r.data.user;updateAuth();closeAuth()}};
 $("listingForm").onsubmit=async e=>{e.preventDefault();if(!currentUser){msg("listingMessage","Please sign in first.");return}
 let row={user_id:currentUser.id,platform:$("listingPlatform").value,title:$("listingTitle").value.trim(),description:$("listingDescription").value.trim(),followers:Number($("listingFollowers").value),price:Number($("listingPrice").value)};
 $("listingSubmit").disabled=true;msg("listingMessage","Publishing...");
 let r=await supabaseClient.from("listings").insert(row);$("listingSubmit").disabled=false;if(r.error){msg("listingMessage",r.error.message);return}
 $("listingForm").reset();$("listingFollowers").value=0;$("listingPrice").value=0;msg("listingMessage","Listing published successfully!");await loadListings();setTimeout(closeListing,900)};
 $("cards").onclick=e=>{if(!e.target.closest(".contact-btn"))return;if(!currentUser){openAuth();msg("authMessage","Please sign in to contact a seller.");return}alert("Seller contact messaging will be added next.")};
 init();
});