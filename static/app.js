const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");
const countrySelect = document.getElementById("countrySelect");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const chips = document.querySelectorAll(".chip");

let currentCategory = "";
let currentCountry = countrySelect.value;

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

function articleCard(a) {
  const img = a.urlToImage || "";
  const title = a.title || "No title";
  const desc = a.description || "";
  const src = (a.source && a.source.name) ? a.source.name : "Unknown";
  const date = a.publishedAt ? new Date(a.publishedAt).toLocaleString() : "";

  return `
    <div class="card">
      ${img ? `<img src="${img}" alt="">` : ""}
      <div class="body">
        <h3 class="title">${title}</h3>
        <div class="meta">${src} • ${date}</div>
        ${desc ? `<p>${desc}</p>` : ""}
        <a href="${a.url}" target="_blank" rel="noopener noreferrer">Read</a>
      </div>
    </div>
  `;
}

function renderArticles(list) {
  if (!list || list.length === 0) {
    grid.innerHTML = "";
    setStatus("No news found. Try a different search.");
    return;
  }
  grid.innerHTML = list.map(articleCard).join("");
  setStatus("");
}

async function getTopHeadlines() {
  try {
    setStatus("Loading top headlines...");
    const url = `/api/top-headlines?country=${encodeURIComponent(currentCountry)}${currentCategory ? `&category=${encodeURIComponent(currentCategory)}` : ""}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Something went wrong");
    renderArticles(json.data.articles || []);
  } catch (err) {
    setStatus(err.message);
  }
}

async function searchNews(q) {
  try {
    setStatus(`Searching “${q}”...`);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Something went wrong");
    renderArticles(json.data.articles || []);
  } catch (err) {
    setStatus(err.message);
  }
}

countrySelect.addEventListener("change", () => {
  currentCountry = countrySelect.value;
  getTopHeadlines();
});

chips.forEach(chip => {
  chip.addEventListener("click", () => {
    currentCategory = chip.dataset.category;
    getTopHeadlines();
  });
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (q) searchNews(q);
});

// Load defaults
getTopHeadlines();
