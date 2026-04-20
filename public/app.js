// ── Category colors for card thumbnails ──────────────────────
const CATEGORY_STYLES = {
  Textbooks:      { bg: "#fff3cd", emoji: "📚" },
  Electronics:    { bg: "#d1ecf1", emoji: "💻" },
  Furniture:      { bg: "#d4edda", emoji: "🛋️" },
  Clothing:       { bg: "#f8d7da", emoji: "👕" },
  Transportation: { bg: "#e2d9f3", emoji: "🚲" },
  Other:          { bg: "#f0f2f5", emoji: "📦" },
};

// ── State ────────────────────────────────────────────────────
let activeCategory = "";
let searchTimeout = null;

// ── DOM refs ─────────────────────────────────────────────────
const grid       = document.getElementById("listings-grid");
const countEl    = document.getElementById("listings-count");
const overlay    = document.getElementById("modal-overlay");
const modalClose = document.getElementById("modal-close");
const searchInput = document.getElementById("searchInput");

// ── Fetch & render listings ───────────────────────────────────
async function loadListings() {
  grid.innerHTML = '<div class="loading-spinner">Loading listings...</div>';
  const params = new URLSearchParams();
  if (activeCategory) params.set("category", activeCategory);
  if (searchInput.value.trim()) params.set("search", searchInput.value.trim());
  try {
    const res  = await fetch(`/api/listings?${params}`);
    const data = await res.json();
    renderListings(data);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <h3>Could not load listings</h3>
      <p>Make sure the server is running and MongoDB is connected.</p>
    </div>`;
  }
}

function renderListings(listings) {
  countEl.textContent = listings.length
    ? `${listings.length} listing${listings.length !== 1 ? "s" : ""} found`
    : "";

  if (!listings.length) {
    grid.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🐢</div>
      <h3>No listings yet</h3>
      <p>Be the first to post something!</p>
    </div>`;
    return;
  }

  grid.innerHTML = listings.map(listing => {
    const style = CATEGORY_STYLES[listing.category] || CATEGORY_STYLES.Other;
    const price = listing.price === 0
      ? "Free"
      : `$${Number(listing.price).toFixed(2)}`;
    return `
      <div class="listing-card" data-id="${listing._id}">
        <div class="card-thumb" style="background-color:${style.bg}">
          ${style.emoji}
        </div>
        <div class="card-body">
          <div class="card-price">${price}</div>
          <div class="card-title">${escHtml(listing.title)}</div>
          <div class="card-location">📍 ${escHtml(listing.pickupLocation)}</div>
        </div>
      </div>`;
  }).join("");

  grid.querySelectorAll(".listing-card").forEach(card => {
    card.addEventListener("click", () => openModal(card.dataset.id, listings));
  });
}

// ── Modal ─────────────────────────────────────────────────────
function openModal(id, listings) {
  const listing = listings.find(l => l._id === id);
  if (!listing) return;

  const style = CATEGORY_STYLES[listing.category] || CATEGORY_STYLES.Other;
  const price = listing.price === 0
    ? "Free"
    : `$${Number(listing.price).toFixed(2)}`;
  const date  = new Date(listing.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric"
  });

  document.getElementById("modal-category").textContent  = `${style.emoji} ${listing.category}`;
  document.getElementById("modal-title").textContent     = listing.title;
  document.getElementById("modal-price").textContent     = price;
  document.getElementById("modal-description").textContent = listing.description;
  document.getElementById("modal-location").textContent  = listing.pickupLocation;
  document.getElementById("modal-date").textContent      = date;

  const emailEl  = document.getElementById("modal-email");
  const emailBtn = document.getElementById("modal-email-btn");
  emailEl.textContent = listing.sellerEmail;
  emailEl.href = `mailto:${listing.sellerEmail}`;
  emailBtn.href = `mailto:${listing.sellerEmail}?subject=Re: ${encodeURIComponent(listing.title)}`;

  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  overlay.classList.add("hidden");
  document.body.style.overflow = "";
}

modalClose.addEventListener("click", closeModal);
overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// ── Category buttons ──────────────────────────────────────────
document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.category;
    loadListings();
  });
});

// ── Search ────────────────────────────────────────────────────
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(loadListings, 350);
});

// ── Weather widget (Open-Meteo, College Park MD) ──────────────
async function loadWeather() {
  try {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=38.9896&longitude=-76.9378&current=temperature_2m,weather_code&temperature_unit=fahrenheit";
    const res  = await fetch(url);
    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    const icon = weatherIcon(data.current.weather_code);
    document.getElementById("weather-text").textContent = `${icon} ${temp}°F · College Park`;
  } catch {
    document.getElementById("weather-text").textContent = "📍 College Park, MD";
  }
}

function weatherIcon(code) {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  return "⛈️";
}

// ── Escape helper ─────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Init ──────────────────────────────────────────────────────
loadListings();
loadWeather();
