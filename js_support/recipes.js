let allRecipes = [];
let filteredRecipes = [];

let limiter = 4;
let previousLimiter = 0;

// Expose these so filters.js can use them
window.recipes = allRecipes;
window.renderRecipes = showRecipes;

function showRecipes(recipes) {
  filteredRecipes = recipes;
  limiter = 4;
  previousLimiter = 0;
  displayRecipes();
}

function displayRecipes() {
  const grid = document.getElementById('recipe-grid');
  if (!grid) return;

  const isLoadingMore = previousLimiter > 0;

  if (!isLoadingMore) {
    grid.innerHTML = '';
  } else {
    const moreBtn = document.getElementById('more');
    if (moreBtn) moreBtn.closest('.col-12')?.remove();
  }

  filteredRecipes.slice(isLoadingMore ? previousLimiter : 0, limiter).forEach(recipe => {
    const col = document.createElement('div');
    col.className = 'col-6 col-md-3 mb-4 fade-in';

    const favorited = isFavorite(recipe.id);

    col.innerHTML = `
      <div class="card h-100" style="cursor:pointer;">
        <div style="position:relative;">
          <img src="../dataset/images/${recipe.images?.[0] || ""}" class="card-img-top" style="height:180px;object-fit:cover;">
          <button class="heart-btn" data-id="${recipe.id}" style="position:absolute;top:6px;right:8px;background:none;border:none;padding:0;cursor:pointer;line-height:1;">
            <span class="material-icons" style="font-size:26px;color:${favorited ? '#e74c3c' : 'rgba(255,255,255,0.8)'};text-shadow:0 1px 3px rgba(0,0,0,0.6);">${favorited ? 'favorite' : 'favorite_border'}</span>
          </button>
        </div>
        <div class="card-body bg-dark text-white">
          <h6 class="card-title fw-bold text-center">${recipe.name}</h6>
        </div>
      </div>
    `;

    col.addEventListener('click', () => {
      localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
      window.location.href = 'recipe.html?id=' + recipe.id;
    });

    col.querySelector('.heart-btn').addEventListener('click', e => {
      e.stopPropagation();
      const icon = e.currentTarget.querySelector('.material-icons');

      if (isFavorite(recipe.id)) {
        removeFromFavorites(recipe.id);
        icon.textContent = 'favorite_border';
        icon.style.color = 'rgba(255,255,255,0.8)';
        showFavoriteToast(`${recipe.name} removed from favorites`);
      } else {
        addToFavorites(recipe);
        icon.textContent = 'favorite';
        icon.style.color = '#e74c3c';
        showFavoriteToast(`${recipe.name} added to favorites`);
      }

      icon.classList.remove('heart-pop');
      void icon.offsetWidth;
      icon.classList.add('heart-pop');
    });

    grid.appendChild(col);
  });

  if (filteredRecipes.length === 0) {
    grid.innerHTML = '<p class="text-center w-100 mt-4"><b>No Results</b></p>';
    return;
  }

  if (limiter < filteredRecipes.length) {
    const btnCol = document.createElement('div');
    btnCol.className = 'col-12 text-center mt-2 mb-4';
    btnCol.innerHTML = `<button class="btn btn-dark " id="more" type="button">More</button>`;
    grid.appendChild(btnCol);

    document.getElementById('more').addEventListener('click', () => {
      previousLimiter = limiter;
      limiter += 4;
      displayRecipes();
    });
  }
}

async function loadRecipes() {
  const res = await fetch('dataset/recipes/all_recipes.json');
  allRecipes = await res.json();

  // This is the important part for filters.js
  window.recipes = allRecipes;

  if (document.getElementById('recipe-grid')) showRecipes(allRecipes);
  renderFeaturedCarousel();
}

document.addEventListener('DOMContentLoaded', loadRecipes);

// favorites
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function isFavorite(id) {
  return getFavorites().some(r => String(r.id) === String(id));
}

function addToFavorites(recipe) {
  let favorites = getFavorites();

  if (!isFavorite(recipe.id)) {
    favorites.push(recipe);
    saveFavorites(favorites);
    return true;
  }
  return false;
}

function removeFromFavorites(id) {
  let favorites = getFavorites().filter(r => String(r.id) !== String(id));
  saveFavorites(favorites);
}

function ensureFavoriteToast() {
  let toastEl = document.getElementById("favoriteToast");
  if (toastEl) return toastEl;

  const container = document.createElement("div");
  container.className = "toast-container position-fixed bottom-0 end-0 p-3";
  container.innerHTML = `
    <div id="favoriteToast" class="toast bg-dark text-white" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header bg-dark text-white border-secondary">
        <strong class="me-auto">Favorites</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body text-white" id="favoriteToastBody"></div>
    </div>
  `;

  document.body.appendChild(container);
  return document.getElementById("favoriteToast");
}

function showFavoriteToast(message) {
  const toastEl = ensureFavoriteToast();
  const toastBody = document.getElementById("favoriteToastBody");

  if (!toastEl || !toastBody || !window.bootstrap || !bootstrap.Toast) return;

  toastBody.textContent = message;

  const toast = bootstrap.Toast.getOrCreateInstance(toastEl, {
    autohide: true,
    delay: 2500
  });

  toast.show();
}

function renderFeaturedCarousel() {
  if (!allRecipes || allRecipes.length === 0) return;

  const d = new Date();
  let index = ((d.getDate() + d.getMonth()) * d.getFullYear()) % allRecipes.length;
  const recipe = allRecipes[index];

  const carouselInner = document.getElementById("featured-carousel-inner");
  if (!carouselInner) return;

  const images = recipe.images && recipe.images.length > 0
    ? recipe.images
    : ["placeholder.jpg"];

  carouselInner.innerHTML = images.map((img, i) => `
    <div class="carousel-item ${i === 0 ? "active" : ""}">
      <img src="dataset/images/${img}" class="d-block w-100" alt="${recipe.name}">
    </div>
  `).join("");

  const indicators = document.querySelector("#carouselIndicators .carousel-indicators");
  if (indicators) {
    indicators.innerHTML = images.map((_, i) => `
      <button type="button"
        data-bs-target="#carouselIndicators"
        data-bs-slide-to="${i}"
        class="${i === 0 ? "active" : ""}"
        ${i === 0 ? 'aria-current="true"' : ""}
        aria-label="Slide ${i + 1}">
      </button>
    `).join("");
  }

  const nameEl = document.getElementById("recipe-of-the-day-name");
  if (nameEl) nameEl.innerHTML = `<a href="recipe.html?id=${recipe.id}">${recipe.name}</a>`;

  const carouselEl = document.getElementById("carouselIndicators");
  if (carouselEl && window.bootstrap) {
    const existing = bootstrap.Carousel.getInstance(carouselEl);
    if (existing) existing.dispose();
    new bootstrap.Carousel(carouselEl, { interval: 4000, ride: true });
  }
}