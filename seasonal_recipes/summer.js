let allRecipes = []; // full list of recipes loaded from JSON
let limiter = 4; //we can change this to whatever but the page shows 4 at a time rn

function showRecipes(recipes) {
  filteredRecipes = recipes; // update the current list to whatever was passed in (right now its just all because we do not have filters yet :p)
  limiter = 4; // reset to 4 so a new search/filter starts from the top
  displayRecipes(); // function to render the cards
}

function displayRecipes() {
  const grid = document.getElementById('recipe-grid'); 
  grid.innerHTML = ''; // clear existing cards 

  filteredRecipes.slice(0, limiter).forEach(recipe => { // only show up to limiter recipes
    const col = document.createElement('div');
    col.className = 'col-6 col-md-3 mb-4 fade-in';
    const favorited = isFavorite(recipe.id);
    col.innerHTML = `
      <div class="card h-100" style="cursor:pointer;">
        <div style="position:relative;">
          <img src="../dataset/images/${recipe.images[0]}" class="card-img-top" style="height:180px;object-fit:cover;"> <!-- first image from the recipe's image list -->
          <button class="heart-btn" data-id="${recipe.id}" style="position:absolute;top:6px;right:8px;background:none;border:none;padding:0;cursor:pointer;line-height:1;">
            <span class="material-icons" style="font-size:26px;color:${favorited ? '#e74c3c' : 'rgba(255,255,255,0.8)'};text-shadow:0 1px 3px rgba(0,0,0,0.6);">${favorited ? 'favorite' : 'favorite_border'}</span>
          </button>
        </div>
        <div class="card-body bg-dark text-white">
          <h6 class="card-title fw-bold text-center">${recipe.name}</h6> <!-- display the recipe name -->
        </div>
      </div>`;
    col.addEventListener('click', () => { // clicking a card saves the recipe and navigates to the detail page
      localStorage.setItem('selectedRecipe', JSON.stringify(recipe)); // save recipe data so recipe.html can read it
      window.location.href = '../recipe.html?id=' + recipe.id;
    });
    col.querySelector('.heart-btn').addEventListener('click', e => {
      e.stopPropagation(); // prevent card navigation
      const icon = e.currentTarget.querySelector('.material-icons');
      if (isFavorite(recipe.id)) {
        removeFromFavorites(recipe.id);
        icon.textContent = 'favorite_border';
        icon.style.color = 'rgba(255,255,255,0.8)';
      } else {
        addToFavorites(recipe);
        icon.textContent = 'favorite';
        icon.style.color = '#e74c3c';
      }
      icon.classList.remove('heart-pop');
      void icon.offsetWidth;
      icon.classList.add('heart-pop');
    });
    grid.appendChild(col); // adds the finished card
  });

  if (filteredRecipes.length === 0) { // check for if search result is empty
    grid.innerHTML = '<p class="text-center w-100 mt-4"><b>No Results</b></p>';
    return;
  }

  if (limiter < filteredRecipes.length) { // only show more if there are hidden recipes remaining
    const btnCol = document.createElement('div');
    btnCol.className = 'col-12 text-center mt-2 mb-4';
    btnCol.innerHTML = `<button class="btn btn-dark" id="more">More</button>`; // button maybe change this later
    grid.appendChild(btnCol);
    document.getElementById('more').addEventListener('click', () => {
      limiter += 4; //this can also be adjusted but 4 is what the page shows
      displayRecipes(); // redner the cards
    });
  }
}

async function loadRecipes() {
  const grid = document.getElementById('recipe-grid');

  if (!grid) return;

  const res = await fetch('../dataset/recipes/summer_recipes.json');
  allRecipes = await res.json();
  showRecipes(allRecipes);

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      showRecipes(allRecipes.filter(r => r.name.toLowerCase().includes(query)));
    });
  }
}

document.addEventListener('DOMContentLoaded', loadRecipes);

//favorites
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