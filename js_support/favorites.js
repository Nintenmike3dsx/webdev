function loadFavorites() {
  const container = document.getElementById("favoritesList");
  if (!container) return;

  const favorites = getFavorites();

  if (favorites.length === 0) {
    container.innerHTML = "<p class='text-center'>No favorite recipes yet.</p>";
    return;
  }

  container.innerHTML = favorites.map(recipe => `
    <div class="col-md-4 mb-4">
      <div class="card h-100">
        <img src="dataset/images/${recipe.images[0]}" class="card-img-top" style="height:180px;object-fit:cover;">

        <div class="card-body bg-dark text-white d-flex flex-column">
          <h5 class="card-title text-center">${recipe.name}</h5>

          <a href="recipe.html?id=${recipe.id}" class="btn btn-light text-dark mt-auto mb-2">
            View Recipe
          </a>

          <button class="btn btn-danger w-100 remove-btn" data-id="${recipe.id}">
            Remove
          </button>
        </div>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      removeFromFavorites(id);
      loadFavorites();
    });
  });
}

window.addEventListener("DOMContentLoaded", loadFavorites);