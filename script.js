const listings = [
  {
    platform: "Instagram",
    title: "Lifestyle creator page",
    followers: 12000,
    price: 75,
    description: "Example marketplace listing."
  },
  {
    platform: "TikTok",
    title: "Short-form creator page",
    followers: 8300,
    price: 48,
    description: "Example marketplace listing."
  },
  {
    platform: "YouTube",
    title: "Niche video channel",
    followers: 5100,
    price: 95,
    description: "Example marketplace listing."
  }
];

const cards = document.getElementById("cards");
const search = document.getElementById("search");
const platformFilter = document.getElementById("platformFilter");
const sortFilter = document.getElementById("sortFilter");
const empty = document.getElementById("empty");
const listingCount = document.getElementById("listingCount");

function renderListings() {
  let results = [...listings];

  const searchText = search.value.toLowerCase();

  if (searchText) {
    results = results.filter(item =>
      `${item.title} ${item.platform} ${item.description}`
        .toLowerCase()
        .includes(searchText)
    );
  }

  if (platformFilter.value !== "all") {
    results = results.filter(
      item => item.platform === platformFilter.value
    );
  }

  if (sortFilter.value === "low") {
    results.sort((a, b) => a.price - b.price);
  }

  if (sortFilter.value === "high") {
    results.sort((a, b) => b.price - a.price);
  }

  cards.innerHTML = "";

  results.forEach(item => {
    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <span class="tag">${item.platform}</span>
      <h3>${item.title}</h3>
      <p>${item.description}</p>

      <div class="meta">
        <span>${item.followers.toLocaleString()} followers/subscribers</span>
        <span class="price">$${item.price.toFixed(2)}</span>
      </div>

      <button class="primary contact-button">
        Contact seller
      </button>
    `;

    card.querySelector(".contact-button").addEventListener("click", () => {
      alert(
        "Contact seller feature coming soon."
      );
    });

    cards.appendChild(card);
  });

  empty.classList.toggle("hidden", results.length !== 0);

  if (listingCount) {
    listingCount.textContent = listings.length;
  }
}

search.addEventListener("input", renderListings);
platformFilter.addEventListener("change", renderListings);
sortFilter.addEventListener("change", renderListings);

renderListings();
