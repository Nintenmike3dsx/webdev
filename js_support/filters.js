document.addEventListener("DOMContentLoaded", () => {
  const applyBtn = document.getElementById("apply-filters");
  const clearBtn = document.getElementById("clear-filters");
  const searchInput = document.getElementById("search-input");
  const cookTimeSlider = document.getElementById("cook-time-slider");
  const cookTimeValue = document.getElementById("cook-time-value");
  const resultsCount = document.getElementById("results-count");

  if (!applyBtn || !clearBtn || !searchInput || !cookTimeSlider || !cookTimeValue) return;

  const updateCookTimeLabel = () => {
    const maxBound = Number(cookTimeSlider.max || 360);
    const value = Number(cookTimeSlider.value);
    cookTimeValue.textContent = value >= maxBound ? "All" : formatMinutes(value);
  };

  cookTimeSlider.addEventListener("input", updateCookTimeLabel);

  applyBtn.addEventListener("click", applyFilters);
  clearBtn.addEventListener("click", clearFilters);
  searchInput.addEventListener("input", applyFilters);

  updateCookTimeLabel();

  function applyFilters() {
    const recipeList = window.recipes || [];
    const searchTerm = normalize(searchInput.value || "");
    const maxMinutes = Number(cookTimeSlider.value);

    const selected = {
      difficulty: new Set(),
      dietary: new Set(),
      protein: new Set()
    };

    document.querySelectorAll('input[type="checkbox"][data-group]:checked').forEach((cb) => {
      const group = cb.dataset.group;
      if (selected[group]) {
        selected[group].add(normalize(cb.value));
      }
    });

    const filtered = recipeList.filter((recipe) => {
      if (searchTerm && !matchesSearch(recipe, searchTerm)) return false;

      if (!matchesSingleValue(selected.difficulty, recipe.difficulty || "")) return false;

      if (selected.dietary.size > 0) {
        const tags = (recipe.dietary || []).map(normalize);
        const hasMatch = tags.some((tag) => selected.dietary.has(tag));
        if (!hasMatch) return false;
      }

      if (selected.protein.size > 0) {
        const tags = getProteinTags(recipe).map(normalize);
        const hasMatch = tags.some((tag) => selected.protein.has(tag));
        if (!hasMatch) return false;
      }

      const recipeMinutes = parsePrepMinutes(recipe.prep_time);
      if (recipeMinutes > maxMinutes) return false;

      return true;
    });

    if (typeof window.renderRecipes === "function") {
      window.renderRecipes(filtered);
    } else {
      renderFallback(filtered);
    }

    if (resultsCount) {
      resultsCount.textContent = `${filtered.length} recipe${filtered.length === 1 ? "" : "s"} found`;
    }

    const offcanvas = document.querySelector(".offcanvas.show");
    if (offcanvas && window.bootstrap && bootstrap.Offcanvas) {
      bootstrap.Offcanvas.getInstance(offcanvas)?.hide();
    }
  }

  function clearFilters() {
    document.querySelectorAll('input[type="checkbox"][data-group]').forEach((cb) => {
      cb.checked = false;
    });

    searchInput.value = "";

    const maxBound = Number(cookTimeSlider.max || 360);
    cookTimeSlider.value = String(maxBound);
    cookTimeValue.textContent = "All";

    const recipeList = window.recipes || [];
    if (typeof window.renderRecipes === "function") {
      window.renderRecipes(recipeList);
    } else {
      renderFallback(recipeList);
    }

    if (resultsCount) {
      resultsCount.textContent = `${recipeList.length} recipe${recipeList.length === 1 ? "" : "s"} found`;
    }
  }
});

function renderFallback(list) {
  const grid = document.getElementById('recipe-grid');
  if (!grid) return;

  grid.innerHTML = list.map(recipe => `
    <div class="col-md-4 mb-4">
      <div class="card h-100 shadow-sm">
        <img src="../dataset/images/${recipe.images?.[0] || ""}" class="card-img-top" alt="${escapeHtml(recipe.name || "")}" style="height: 220px; object-fit: cover;">
        <div class="card-body">
          <h5 class="card-title">${escapeHtml(recipe.name || "")}</h5>
          <p class="card-text mb-1"><strong>Difficulty:</strong> ${escapeHtml(recipe.difficulty || "")}</p>
          <p class="card-text mb-1"><strong>Dietary:</strong> ${(recipe.dietary || []).map(escapeHtml).join(", ") || "None"}</p>
          <p class="card-text mb-1"><strong>Cook Time:</strong> ${escapeHtml(recipe.prep_time || "")}</p>
        </div>
      </div>
    </div>
  `).join("");
}

function matchesSingleValue(selectedSet, value) {
  if (!selectedSet || selectedSet.size === 0) return true;
  return selectedSet.has(normalize(value));
}

function matchesSearch(recipe, term) {
  const text = [
    recipe.name,
    recipe.category,
    recipe.cuisine,
    recipe.difficulty,
    recipe.prep_time,
    ...(recipe.ingredients || []),
    ...(recipe.dietary || [])
  ].join(" ").toLowerCase();

  return text.includes(term);
}

function getProteinTags(recipe) {
  const text = `${recipe.name || ""} ${(recipe.ingredients || []).join(" ")}`.toLowerCase();
  const tags = [];

  if (/\bbeef\b|\bsteak\b|\bground beef\b/.test(text)) tags.push("Beef");
  if (/\bchicken\b/.test(text)) tags.push("Chicken");
  if (/\bpork\b|\bbacon\b|\bham\b/.test(text)) tags.push("Pork");
  if (/\bturkey\b/.test(text)) tags.push("Turkey");
  if (/\bshrimp\b|\bsalmon\b|\btuna\b|\bfish\b|\bcrab\b/.test(text)) tags.push("Seafood");

  if (tags.length === 0) tags.push("Vegetarian");

  return tags;
}

function parsePrepMinutes(value) {
  if (!value) return 0;

  const text = String(value).toLowerCase();

  const hourMatch = text.match(/(\d+(\.\d+)?)\s*h(?:r|rs|ours?)/);
  if (hourMatch) {
    return Math.round(parseFloat(hourMatch[1]) * 60);
  }

  const minMatch = text.match(/(\d+)\s*min/);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }

  return 0;
}

function formatMinutes(minutes) {
  if (!minutes || minutes <= 0) return "All";
  if (minutes < 60) return `${minutes} min`;
  if (minutes % 60 === 0) return `${minutes / 60} hr`;
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}

function normalize(value) {
  return String(value).trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}