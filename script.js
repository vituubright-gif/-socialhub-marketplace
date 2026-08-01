const SUPABASE_URL = "PASTE_YOUR_PROJECT_URL_HERE";
const SUPABASE_PUBLISHABLE_KEY = "PASTE_YOUR_PUBLISHABLE_KEY_HERE";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const listings=[
 {platform:"Instagram",title:"Lifestyle creator page",followers:12000,price:75,description:"Example marketplace listing."},
 {platform:"TikTok",title:"Short-form creator page",followers:8300,price:48,description:"Example marketplace listing."},
 {platform:"YouTube",title:"Niche video channel",followers:5100,price:95,description:"Example marketplace listing."}
];
const cards=document.getElementById("cards"),search=document.getElementById("search"),platformFilter=document.getElementById("platformFilter"),sortFilter=document.getElementById("sortFilter"),empty=document.getElementById("empty");
function render(){let r=[...listings],q=search.value.toLowerCase();if(q)r=r.filter(x=>(x.title+" "+x.platform+" "+x.description).toLowerCase().includes(q));if(platformFilter.value!="all")r=r.filter(x=>x.platform===platformFilter.value);if(sortFilter.value==="low")r.sort((a,b)=>a.price-b.price);if(sortFilter.value==="high")r.sort((a,b)=>b.price-a.price);cards.innerHTML=r.map(x=>`<article class="card"><span class="tag">${x.platform}</span><h3>${x.title}</h3><p>${x.description}</p><div class="meta"><span>${x.followers.toLocaleString()} followers/subscribers</span><span class="price">$${x.price.toFixed(2)}</span></div><button class="primary">Contact seller</button></article>`).join("");empty.classList.toggle("hidden",r.length>0)}
search.addEventListener("input",render);platformFilter.addEventListener("change",render);sortFilter.addEventListener("change",render);render();

const modal=document.getElementById("modal"),signInBtn=document.getElementById("signInBtn"),closeModal=document.getElementById("closeModal"),form=document.getElementById("authForm"),toggle=document.getElementById("toggleAuth"),title=document.getElementById("modalTitle"),submit=document.getElementById("authSubmit"),message=document.getElementById("authMessage"),status=document.getElementById("authStatus");
let signup=false;
function open(){modal.classList.remove("hidden")} function close(){modal.classList.add("hidden");message.textContent=""}
signInBtn.onclick=open;closeModal.onclick=close;
toggle.onclick=()=>{signup=!signup;title.textContent=signup?"Create account":"Sign in";submit.textContent=signup?"Create account":"Sign in";toggle.textContent=signup?"Already have an account? Sign in":"Create an account"};
form.onsubmit=async e=>{e.preventDefault();message.textContent="Working...";const email=document.getElementById("email").value,password=document.getElementById("password").value;if(SUPABASE_URL.includes("PASTE_")){message.textContent="Supabase is not connected yet. Add your Project URL and Publishable key to script.js.";return}let result=signup?await supabaseClient.auth.signUp({email,password}):await supabaseClient.auth.signInWithPassword({email,password});if(result.error){message.textContent=result.error.message;return}message.textContent=signup?"Account created. Check your email to confirm it.":"Signed in successfully.";modal.classList.add("hidden");status.textContent=`Signed in as ${email}`;signInBtn.textContent="Account"};