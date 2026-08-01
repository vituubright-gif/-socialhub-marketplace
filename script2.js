const SUPABASE_URL="https://kzydpyhwowiqibtiwtti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_MKcJYgB2QzsushX-CnnDuA_UJGvMLBV";
let supabaseClient=null,currentUser=null,isSignup=false;
const $=id=>document.getElementById(id);
const msg=(id,t)=>{const e=$(id);if(e)e.textContent=t};
const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");

async function loadListings(){
 const cards=$("cards");if(!cards||!supabaseClient)return;
 cards.innerHTML="<p class='status'>Loading listings...</p>";
 const {data,error}=await supabaseClient.from("listings").select("id,platform,title,description,followers,price,created_at,user_id").order("created_at",{ascending:false});
 if(error){cards.innerHTML="";msg("empty","Could not load listings: "+error.message);$("empty")?.classList.remove("hidden");return}
 let rows=Array.isArray(data)?data:[];
 const q=($("search")?.value||"").trim().toLowerCase(),p=$("platformFilter")?.value||"all",s=$("sortFilter")?.value||"default";
 if(q)rows=rows.filter(x=>`${x.title||""} ${x.platform||""} ${x.description||""}`.toLowerCase().includes(q));
 if(p!=="all")rows=rows.filter(x=>x.platform===p);
 if(s==="low")rows.sort((a,b)=>Number(a.price||0)-Number(b.price||0));
 if(s==="high")rows.sort((a,b)=>Number(b.price||0)-Number(a.price||0));
 if(!rows.length){cards.innerHTML="";msg("empty","No listings found.");$("empty")?.classList.remove("hidden");return}
 cards.innerHTML=rows.map(x=>`<article class="card"><span class="tag">${esc(x.platform)}</span><h3>${esc(x.title)}</h3><p>${esc(x.description||"No description provided.")}</p><div class="meta"><span>${Number(x.followers||0).toLocaleString()} followers/subscribers</span><span class="price">$${Number(x.price||0).toFixed(2)}</span></div><button class="primary contact-btn" data-listing-id="${esc(x.id)}" data-seller-id="${esc(x.user_id)}" data-title="${esc(x.title)}" type="button">Contact seller</button></article>`).join("");
 $("empty")?.classList.add("hidden");
}

function updateAuthUI(){const on=!!currentUser;$("signInBtn")?.classList.toggle("hidden",on);$("logoutBtn")?.classList.toggle("hidden",!on);if($("authStatus"))$("authStatus").textContent=on?`Signed in as ${currentUser.email}`:""}
function openAuth(){$("authModal")?.classList.remove("hidden")}
function closeAuth(){$("authModal")?.classList.add("hidden");msg("authMessage","")}
function openListing(){if(!currentUser){openAuth();msg("authMessage","Please sign in first to post a listing.");return}$("listingModal")?.classList.remove("hidden")}
function closeListing(){$("listingModal")?.classList.add("hidden");msg("listingMessage","")}

function openContactModal(listingId,sellerId,title){
 let modal=$("contactModal");
 if(!modal){
  modal=document.createElement("div");modal.id="contactModal";modal.className="modal";
  modal.innerHTML=`<div class="modal-box"><button id="closeContact" class="close" type="button">&times;</button><h2>Contact seller</h2><p id="contactListingTitle" class="hint"></p><form id="contactForm"><label>Message</label><textarea id="contactText" rows="5" maxlength="1000" placeholder="Write your message..." required></textarea><button id="sendMessageBtn" class="primary full" type="submit">Send message</button></form><p id="contactMessage" class="message"></p></div>`;
  document.body.appendChild(modal);
  $("closeContact").onclick=()=>modal.classList.add("hidden");
  $("contactForm").onsubmit=async e=>{
   e.preventDefault();const text=$("contactText").value.trim();if(!text||!currentUser)return;
   $("sendMessageBtn").disabled=true;msg("contactMessage","Sending...");
   const {error}=await supabaseClient.from("messages").insert({listing_id:modal.dataset.listingId,sender_id:currentUser.id,seller_id:modal.dataset.sellerId,message:text});
   $("sendMessageBtn").disabled=false;
   if(error){msg("contactMessage",error.message);return}
   $("contactText").value="";msg("contactMessage","Message sent successfully!");setTimeout(()=>modal.classList.add("hidden"),900);
  };
 }
 modal.dataset.listingId=listingId;modal.dataset.sellerId=sellerId;$("contactListingTitle").textContent=`Listing: ${title}`;$("contactText").value="";msg("contactMessage","");modal.classList.remove("hidden");
}

async function initSupabase(){
 if(!window.supabase){msg("authMessage","Supabase did not load. Refresh the page.");return}
 supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
 const {data,error}=await supabaseClient.auth.getSession();if(error)console.error(error);
 currentUser=data?.session?.user||null;updateAuthUI();await loadListings();
 supabaseClient.auth.onAuthStateChange((_event,session)=>{currentUser=session?.user||null;updateAuthUI()});
}

function setup(){
 $("signInBtn")?.addEventListener("click",openAuth);$("closeAuth")?.addEventListener("click",closeAuth);$("postBtn")?.addEventListener("click",openListing);$("closeListing")?.addEventListener("click",closeListing);
 $("logoutBtn")?.addEventListener("click",async()=>{await supabaseClient.auth.signOut();currentUser=null;updateAuthUI();await loadListings()});
 $("search")?.addEventListener("input",loadListings);$("platformFilter")?.addEventListener("change",loadListings);$("sortFilter")?.addEventListener("change",loadListings);
 $("toggleAuth")?.addEventListener("click",()=>{isSignup=!isSignup;$("authTitle").textContent=isSignup?"Create account":"Sign in";$("authSubmit").textContent=isSignup?"Create account":"Sign in";$("toggleAuth").textContent=isSignup?"Already have an account? Sign in":"Create an account";msg("authMessage","")});
 $("authForm")?.addEventListener("submit",async e=>{e.preventDefault();const email=$("email").value.trim(),password=$("password").value;$("authSubmit").disabled=true;msg("authMessage",isSignup?"Creating account...":"Signing in...");const r=isSignup?await supabaseClient.auth.signUp({email,password}):await supabaseClient.auth.signInWithPassword({email,password});$("authSubmit").disabled=false;if(r.error){msg("authMessage",r.error.message);return}if(isSignup)msg("authMessage","Account created. Check your email to confirm your account.");else{currentUser=r.data.user;updateAuthUI();closeAuth();await loadListings()}});
 $("listingForm")?.addEventListener("submit",async e=>{e.preventDefault();if(!currentUser){msg("listingMessage","Please sign in first.");return}const row={user_id:currentUser.id,platform:$("listingPlatform").value,title:$("listingTitle").value.trim(),description:$("listingDescription").value.trim(),followers:Number($("listingFollowers").value||0),price:Number($("listingPrice").value||0)};$("listingSubmit").disabled=true;msg("listingMessage","Publishing...");const {error}=await supabaseClient.from("listings").insert(row);$("listingSubmit").disabled=false;if(error){msg("listingMessage",error.message);return}msg("listingMessage","Listing published successfully!");$("listingForm").reset();$("listingFollowers").value=0;$("listingPrice").value=0;await loadListings();setTimeout(closeListing,900)});
 $("cards")?.addEventListener("click",e=>{const b=e.target.closest(".contact-btn");if(!b)return;if(!currentUser){openAuth();msg("authMessage","Please sign in to contact a seller.");return}if(b.dataset.sellerId===currentUser.id){alert("This is your own listing.");return}openContactModal(b.dataset.listingId,b.dataset.sellerId,b.dataset.title)});
}
document.addEventListener("DOMContentLoaded",()=>{setup();initSupabase()});
