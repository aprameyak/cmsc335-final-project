// ── Load UMD buildings from our backend proxy ─────────────────
async function loadBuildings() {
  const select = document.getElementById("pickupLocation");
  try {
    const res  = await fetch("/api/buildings");
    const data = await res.json();

    select.innerHTML = '<option value="" disabled selected>Select a pickup location</option>';
    const buildings = Array.isArray(data) ? data : [];
    buildings.forEach(b => {
      const name = b.name || b.building_name || String(b);
      if (!name) return;
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });
  } catch {
    // Fallback — keep a generic set if the API is unreachable
    const fallback = [
      "McKeldin Library", "Stamp Student Union", "Brendan Iribe Center",
      "ESJ Building", "A.V. Williams Building", "Cole Field House",
      "Eppley Recreation Center", "Hornbake Library", "Xfinity Center",
    ];
    select.innerHTML = '<option value="" disabled selected>Select a pickup location</option>';
    fallback.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });
  }
}

// ── Form submission ───────────────────────────────────────────
const form     = document.getElementById("sell-form");
const errorBox = document.getElementById("form-error");
const submitBtn = document.getElementById("submit-btn");

form.addEventListener("submit", async e => {
  e.preventDefault();
  errorBox.classList.add("hidden");

  const email = document.getElementById("sellerEmail").value.trim().toLowerCase();
  if (!email.endsWith("@umd.edu")) {
    showError("Only UMD email addresses (@umd.edu) are allowed.");
    return;
  }

  const price = parseFloat(document.getElementById("price").value);
  if (isNaN(price) || price < 0) {
    showError("Please enter a valid price (0 or more).");
    return;
  }

  const body = {
    title:           document.getElementById("title").value.trim(),
    description:     document.getElementById("description").value.trim(),
    price,
    category:        document.getElementById("category").value,
    sellerEmail:     email,
    pickupLocation:  document.getElementById("pickupLocation").value,
  };

  if (!body.title || !body.description || !body.category || !body.pickupLocation) {
    showError("Please fill in all required fields.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Posting...";

  try {
    const res = await fetch("/api/listings", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create listing.");
    }

    window.location.href = "index.html";
  } catch (err) {
    showError(err.message);
    submitBtn.disabled = false;
    submitBtn.textContent = "Post Listing";
  }
});

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
  errorBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ── Init ──────────────────────────────────────────────────────
loadBuildings();
