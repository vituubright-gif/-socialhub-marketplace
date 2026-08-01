/*
  SocialHub authentication
  Supabase Project URL and Publishable key are already configured.
*/

const SUPABASE_URL = "https://kzydpyhwowiqibtiwtti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_MKcJYgB2QzsushX-CnnDuA_UJGvMLBV";

let supabaseClient = null;

function $(id) {
  return document.getElementById(id);
}

function showMessage(text) {
  const el = $("authMessage");
  if (el) el.textContent = text;
}

function renderListings() {
  const listings = [
    { platform: "Instagram", title: "Lifestyle creator page", followers: 12000, price: 75, description: "Example marketplace listing." },
    { platform: "TikTok", title: "Short-form creator page", followers: 8300, price: 48, description: "Example marketplace listing." },
    { platform: "YouTube", title: "Niche video channel", followers: 5100, price: 95, description: "Example marketplace listing." }
  ];

  const cards = $("cards");
  if (!cards) return;

  let results = [...listings];
  const query = ($("search")?.value || "").toLowerCase();

  if (query) {
    results = results.filter(x =>
      `${x.title} ${x.platform} ${x.description}`.toLowerCase().includes(query)
    );
  }

  const platform = $("platformFilter")?.value || "all";
  if (platform !== "all") results = results.filter(x => x.platform === platform);

  const sort = $("sortFilter")?.value;
  if (sort === "low") results.sort((a,b) => a.price - b.price);
  if (sort === "high") results.sort((a,b) => b.price - a.price);

  cards.innerHTML = results.map(x => `
    <article class="card">
      <span class="tag">${x.platform}</span>
      <h3>${x.title}</h3>
      <p>${x.description}</p>
      <div class="meta">
        <span>${x.followers.toLocaleString()} followers/subscribers</span>
        <span class="price">$${x.price.toFixed(2)}</span>
      </div>
      <button class="primary" type="button">Contact seller</button>
    </article>
  `).join("");

  $("empty")?.classList.toggle("hidden", results.length !== 0);
}

async function initAuth() {
  // Wait for the CDN script in case this file is loaded before it finishes.
  if (!window.supabase) {
    showMessage("The authentication library did not load. Refresh the page and try again.");
    return;
  }

  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  const { data } = await supabaseClient.auth.getSession();

  if (data?.session?.user) {
    const email = data.session.user.email;
    if ($("authStatus")) $("authStatus").textContent = `Signed in as ${email}`;
    if ($("signInBtn")) $("signInBtn").textContent = "Account";
  }

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      if ($("authStatus")) $("authStatus").textContent = `Signed in as ${session.user.email}`;
      if ($("signInBtn")) $("signInBtn").textContent = "Account";
    }
  });
}

function initUI() {
  renderListings();

  $("search")?.addEventListener("input", renderListings);
  $("platformFilter")?.addEventListener("change", renderListings);
  $("sortFilter")?.addEventListener("change", renderListings);

  const modal = $("modal");
  const signInBtn = $("signInBtn");
  const closeBtn = $("closeModal");
  const form = $("authForm");
  const toggle = $("toggleAuth");

  let isSignup = false;

  signInBtn?.addEventListener("click", () => modal?.classList.remove("hidden"));
  closeBtn?.addEventListener("click", () => modal?.classList.add("hidden"));

  toggle?.addEventListener("click", () => {
    isSignup = !isSignup;
    $("modalTitle").textContent = isSignup ? "Create account" : "Sign in";
    $("authSubmit").textContent = isSignup ? "Create account" : "Sign in";
    $("password").setAttribute("autocomplete", isSignup ? "new-password" : "current-password");
    toggle.textContent = isSignup ? "Already have an account? Sign in" : "Create an account";
    showMessage("");
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!supabaseClient) {
      showMessage("Supabase is still loading. Please wait a moment and try again.");
      return;
    }

    const email = $("email").value.trim();
    const password = $("password").value;

    if (!email || !password) {
      showMessage("Enter your email and password.");
      return;
    }

    $("authSubmit").disabled = true;
    showMessage(isSignup ? "Creating account..." : "Signing in...");

    try {
      const result = isSignup
        ? await supabaseClient.auth.signUp({ email, password })
        : await supabaseClient.auth.signInWithPassword({ email, password });

      if (result.error) {
        showMessage(result.error.message);
        return;
      }

      if (isSignup) {
        showMessage("Account created. Check your email to confirm your account.");
      } else {
        $("authStatus").textContent = `Signed in as ${email}`;
        $("signInBtn").textContent = "Account";
        modal.classList.add("hidden");
        form.reset();
      }
    } catch (error) {
      showMessage("Something went wrong. Please try again.");
    } finally {
      $("authSubmit").disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initUI();
  initAuth();
});
