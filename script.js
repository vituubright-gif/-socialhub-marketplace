/*
  SocialHub authentication + marketplace script
*/

const SUPABASE_URL = "https://kzydpyhwowiqibtiwtti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_MKcJYgB2QzsushX-CnnDuA_UJGvMLBV";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const listings = [
  { platform: "Instagram", title: "Lifestyle creator page", followers: 12000, price: 75, description: "Example marketplace listing." },
  { platform: "TikTok", title: "Short-form creator page", followers: 8300, price: 48, description: "Example marketplace listing." },
  { platform: "YouTube", title: "Niche video channel", followers: 5100, price: 95, description: "Example marketplace listing." }
];

const $ = id => document.getElementById(id);

function renderListings() {
  const cards = $("cards");
  if (!cards) return;
  let results = [...listings];
  const query = $("search")?.value?.toLowerCase() || "";

  if (query) results = results.filter(item =>
    `${item.title} ${item.platform} ${item.description}`.toLowerCase().includes(query)
  );
  if ($("platformFilter")?.value !== "all")
    results = results.filter(item => item.platform === $("platformFilter").value);
  if ($("sortFilter")?.value === "low") results.sort((a,b) => a.price-b.price);
  if ($("sortFilter")?.value === "high") results.sort((a,b) => b.price-a.price);

  cards.innerHTML = results.map(item => `
    <article class="card">
      <span class="tag">${item.platform}</span>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <div class="meta">
        <span>${item.followers.toLocaleString()} followers/subscribers</span>
        <span class="price">$${item.price.toFixed(2)}</span>
      </div>
      <button class="primary" type="button">Contact seller</button>
    </article>
  `).join("");

  $("empty")?.classList.toggle("hidden", results.length > 0);
}

$("search")?.addEventListener("input", renderListings);
$("platformFilter")?.addEventListener("change", renderListings);
$("sortFilter")?.addEventListener("change", renderListings);
renderListings();

const modal = $("modal");
const signInBtn = $("signInBtn");
const closeModalBtn = $("closeModal");
const form = $("authForm");
const toggle = $("toggleAuth");
const title = $("modalTitle");
const submit = $("authSubmit");
const message = $("authMessage");
const status = $("authStatus");

let isSignup = false;

signInBtn?.addEventListener("click", () => modal?.classList.remove("hidden"));
closeModalBtn?.addEventListener("click", () => modal?.classList.add("hidden"));

toggle?.addEventListener("click", () => {
  isSignup = !isSignup;
  if (title) title.textContent = isSignup ? "Create account" : "Sign in";
  if (submit) submit.textContent = isSignup ? "Create account" : "Sign in";
  toggle.textContent = isSignup ? "Already have an account? Sign in" : "Create an account";
});

form?.addEventListener("submit", async event => {
  event.preventDefault();
  if (message) message.textContent = "Working...";

  const email = $("email")?.value?.trim();
  const password = $("password")?.value || "";

  if (!email || !password) {
    if (message) message.textContent = "Enter your email and password.";
    return;
  }

  const result = isSignup
    ? await supabaseClient.auth.signUp({ email, password })
    : await supabaseClient.auth.signInWithPassword({ email, password });

  if (result.error) {
    if (message) message.textContent = result.error.message;
    return;
  }

  if (isSignup) {
    if (message) message.textContent = "Account created. Check your email to confirm your account.";
  } else {
    if (status) status.textContent = `Signed in as ${email}`;
    if (signInBtn) signInBtn.textContent = "Account";
    modal?.classList.add("hidden");
  }
});
