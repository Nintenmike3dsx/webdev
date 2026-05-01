document.addEventListener("DOMContentLoaded", () => {
  const filterRoot = document.getElementById("filter-groups");
  const applyBtn = document.getElementById("apply-filters");
  const clearBtn = document.getElementById("clear-filters");
  const searchInput = document.getElementById("search-input");

  if (!filterRoot || !window.recipes || !window.renderRecipes) return;

  // BUILD FILTER GROUPS
  const groups = {
    category: getUniqueValues(window.recipes, "category"),
    season: getUniqueValues(window.recipes, "season"),
    dietary: getUniqueFlatValues(window.recipes, "dietary"),
    cuisine: getUniqueValues(window.recipes, "cuisine"),
    difficulty: getUniqueValues(window.recipes, "difficulty"),
    prepTime: ["0–15 min", "16–30 min", "31–60 min", "60+ min"]
  };

  filterRoot.innerHTML = `
    ${buildGroup("Category", "category", groups.category)}
    ${buildGroup("Season", "season", groups.season)}
    ${buildGroup("Dietary", "dietary", groups.dietary)}
    ${buildGroup("Cuisine", "cuisine", groups.cuisine)}
    ${buildGroup("Difficulty", "difficulty", groups.difficulty)}
    ${buildGroup("Prep Time", "prepTime", groups.prepTime)}
  `;

  // APPLY BUTTON
  applyBtn.addEventListener("click", applyFilters);

  // CLEAR BUTTON
  clearBtn.addEventListener("click", () => {
    filterRoot.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    if (searchInput) searchInput.value = "";
    window.renderRecipes(window.recipes);
  });

  // OPTIONAL: search applies instantly
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  window.renderRecipes(window.recipes);
});

function buildGroup(title, name, values) {
  return `
    <div class="filter-group mb-4">
      <h6>${title}</h6>
      ${values.map(v => `
        <div class="form-check">
          <input class="form-check-input" type="checkbox"
            value="${v}" data-group="${name}" id="${name}-${slug(v)}">
          <label class="form-check-label" for="${name}-${slug(v)}">${v}</label>
        </div>
      `).join("")}
    </div>
  `;
}

function applyFilters() {
  const searchTerm = normalize(document.getElementById("search-input")?.value || "");

  const selected = {
    category: new Set(),
    season: new Set(),
    dietary: new Set(),
    cuisine: new Set(),
    difficulty: new Set(),
    prepTime: new Set()
  };

  document.querySelectorAll('#filter-groups input:checked').forEach(cb => {
    selected[cb.dataset.group].add(normalize(cb.value));
  });

  const filtered = window.recipes.filter(r => {

    if (searchTerm && !matchesSearch(r, searchTerm)) return false;

    if (!match(selected.category, r.category)) return false;
    if (!match(selected.season, r.season)) return false;
    if (!match(selected.cuisine, r.cuisine)) return false;
    if (!match(selected.difficulty, r.difficulty)) return false;

    if (selected.dietary.size > 0) {
      const tags = (r.dietary || []).map(normalize);
      if (!tags.some(t => selected.dietary.has(t))) return false;
    }

    if (selected.prepTime.size > 0) {
      const bucket = prepBucket(r.prep_time);
      if (!selected.prepTime.has(normalize(bucket))) return false;
    }

    return true;
  });

  window.renderRecipes(filtered);
}

function match(set, value) {
  return set.size === 0 || set.has(normalize(value));
}

function matchesSearch(r, term) {
  return [
    r.name,
    r.category,
    r.cuisine,
    ...(r.ingredients || [])
  ].join(" ").toLowerCase().includes(term);
}

function prepBucket(str) {
  const min = parseInt(str);
  if (min <= 15) return "0–15 min";
  if (min <= 30) return "16–30 min";
  if (min <= 60) return "31–60 min";
  return "60+ min";
}

function getUniqueValues(arr, key) {
  return [...new Set(arr.map(x => x[key]).filter(Boolean))];
}

function getUniqueFlatValues(arr, key) {
  return [...new Set(arr.flatMap(x => x[key] || []))];
}

function normalize(v) {
  return String(v).toLowerCase().trim();
}

function slug(v) {
  return v.toLowerCase().replace(/\s+/g, "-");
}