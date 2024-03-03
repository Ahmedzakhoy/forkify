import {
  createRecipeObject,
  showSpinner,
  renderError,
  renderMessage,
  toggleHidden,
  getRequest,
  getTenResultsPage,
  clearAllBtnHTML,
  ingredientFormHTML,
  sortHTML,
} from "./helpers.js";
import { API_KEY, API_URL, RESULTS_PER_PAGE } from "./config.js";
import { HTMLGenerator } from "./html-generator.js";

//selections
const paginationContainerEl = document.querySelector(".pagination");
const recipeContainerEl = document.querySelector(".recipe");
const bookmarkContainerEl = document.querySelector(".bookmarks__list");
const addRecipeContainerEl = document.querySelector(".upload");
const previewContainerEl = document.querySelector(".results");
const searchBtn = document.querySelector('form[class="search"] .btn');
const ownRecipeBtn = document.querySelector("#own-recipes");
const addRecipeBtn = document.querySelector(".nav__btn--add-recipe");
const closeModalBtn = document.querySelector(".btn--close-modal");
const sortSelectionList = document.querySelector("#sort");
const bookmarksBtn = document.querySelector(".nav__btn--bookmarks");
const searchInput = document.querySelector('form[class="search"] input');
const addRecipeWindow = document.querySelector(".add-recipe-window");
const addRecipeOverlay = document.querySelector(".overlay");

//global variable
const state = {
  showResults: "search",
  ownRecipes: { data: [], pageNumber: 1, resultsPerPage: RESULTS_PER_PAGE },
  recipe: {},
  search: {
    query: "",
    data: [],
    resultsPerPage: RESULTS_PER_PAGE,
    pageNumber: 1,
  },
  bookmarks: [],
};

//update view with replacing only changed elements
function updateRecipeView(data) {
  const newHtml = HTMLGenerator("recipe", data);

  const newDOM = document.createRange().createContextualFragment(newHtml);
  const newElements = Array.from(newDOM.querySelectorAll("*"));
  const currentElements = Array.from(recipeContainerEl.querySelectorAll("*"));
  newElements.forEach((newEl, i) => {
    const curEl = currentElements[i];
    //update changed text
    if (
      !newEl.isEqualNode(curEl) &&
      newEl.firstChild?.nodeValue.trim() !== ""
    ) {
      curEl.textContent = newEl.textContent;
    }
    //update the change in attribute
    if (!newEl.isEqualNode(curEl)) {
      Array.from(newEl.attributes).forEach((attr) =>
        curEl.setAttribute(attr.name, attr.value)
      );
    }
  });
}

function renderBookmarks(bookmarks) {
  bookmarkContainerEl.innerHTML = "";
  if (bookmarks.length === 0) {
    renderError(
      "no bookmarks yet, kindly find some nice recipes and bookmark them",
      bookmarkContainerEl
    );
  }
  let html = bookmarks
    .map((bookmark) => HTMLGenerator("preview", bookmark))
    .join("");
  if (bookmarks.length > 0) {
    html += clearAllBtnHTML("bookmarks");
  }
  bookmarkContainerEl.insertAdjacentHTML("beforeend", html);
}

function renderResultsAndPagination(dataList, page) {
  if (!page) page = dataList.pageNumber;
  dataList.pageNumber = page; // to update page number
  let html = "";
  const data = getTenResultsPage(dataList, page);
  data.forEach((data) => {
    html += HTMLGenerator("preview", data);
  });
  if (state.showResults === "own-recipes" && state.ownRecipes.data.length > 0) {
    html = clearAllBtnHTML("recipes") + sortHTML + html;
  }
  previewContainerEl.innerHTML = "";
  previewContainerEl.insertAdjacentHTML("beforeend", html);
  paginationContainerEl.innerHTML = "";
  paginationContainerEl.insertAdjacentHTML(
    "beforeend",
    HTMLGenerator("pagination", state)
  );
}

const loadRecipe = async function (id) {
  try {
    if (id.match(/^\d+$/)) {
      state.recipe = state.ownRecipes.data.find((recipe) => recipe.id === id);
    } else {
      const {
        data: { recipe },
      } = await getRequest(`${API_URL}/${id}?key=${API_KEY}`);
      state.recipe = createRecipeObject(recipe);
    }
    if (!state.recipe) return;
    if (state.bookmarks.some((bookmark) => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (err) {
    throw err;
  }
};

const showRecipe = async function () {
  try {
    //get hash
    const id = window.location.hash.slice(1);
    if (!id) return;

    //load spinner
    showSpinner(recipeContainerEl);
    //0) update results view to mark selected search results
    const dataList =
      state.showResults === "search"
        ? state.search
        : state.showResults === "own-recipes"
        ? state.ownRecipes
        : "";
    renderResultsAndPagination(dataList, dataList.pageNumber);
    // 1) render bookmarks
    renderBookmarks(state.bookmarks);
    // 2) loading the recipe
    await loadRecipe(id);
    const recipe = state.recipe;
    // 3) rendering recipe data on the page
    recipeContainerEl.innerHTML = "";
    recipeContainerEl.insertAdjacentHTML(
      "beforeend",
      HTMLGenerator("recipe", recipe)
    );
  } catch (err) {
    renderError(`error has occured: ${err.message}`, recipeContainerEl);
  }
};

const storeData = function () {
  localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
  localStorage.setItem("own-recipes", JSON.stringify(state.ownRecipes));
};

const addBookmark = function (recipe) {
  //add bookmark to array in state
  state.bookmarks.unshift(recipe);

  //mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  //store bookmarks
  storeData();
};

export const deleteBookmark = function (id) {
  //delete bookmark
  const index = state.bookmarks.findIndex((el) => el.id === id);
  state.bookmarks.splice(index, 1);

  //mark current recipe as NOT bookmark
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  //store bookmarks
  storeData();
};

const addRemoveBookmarkHandler = function () {
  //1) add or remove bookmarks
  if (!state.recipe.bookmarked) {
    addBookmark(state.recipe);
  } else {
    deleteBookmark(state.recipe.id);
  }
  // 2) update reciepe view
  updateRecipeView(state.recipe);
  // 3) render bookmarks
  renderBookmarks(state.bookmarks);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach((ing) => {
    ing.quantity = (ing.quantity / state.recipe.servings) * newServings;
  });
  state.recipe.servings = newServings;
};

const changeServings = function (newServings) {
  //update the recipe servings (in the state) Model
  updateServings(newServings);

  //Update the recipe view as well
  //re-rendering recipe data on the page
  // recipeView.render(model.state.recipe);
  updateRecipeView(state.recipe);
};
const addOwnRecipe = function (newRecipe) {
  try {
    const ingredientsItems = Object.entries(newRecipe).filter((entry) =>
      entry[0].startsWith("ingredient-item")
    );
    const ingredientsQuantities = Object.entries(newRecipe).filter((entry) =>
      entry[0].startsWith("ingredient-quantity")
    );
    const ingredientsUnits = Object.entries(newRecipe).filter((entry) =>
      entry[0].startsWith("ingredient-unit")
    );
    const ingredients = [];

    ingredientsItems.forEach((item, index) => {
      if (item[1].length >= 1) {
        ingredients.push({
          description: item[1],
          unit: ingredientsUnits.find((value) =>
            value[0].startsWith(`ingredient-unit-${index + 1}`)
          )[1],
          quantity: +ingredientsQuantities.find((value) =>
            value[0].startsWith(`ingredient-quantity-${index + 1}`)
          )[1]
            ? +ingredientsQuantities.find((value) =>
                value[0].startsWith(`ingredient-quantity-${index + 1}`)
              )[1]
            : null,
        });
      }
    });
    const recipe = {
      title: newRecipe.title,
      sourceUrl: newRecipe.sourceUrl,
      image: newRecipe.image,
      publisher: newRecipe.publisher,
      cookingTime: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
      id: Date.now() + "",
    };

    state.ownRecipes.data.unshift(recipe);
    storeData();
    state.recipe = recipe;
  } catch (err) {
    throw err;
  }
};

const addNewRecipeHandler = async function (newRecipe) {
  try {
    const formHTML = addRecipeContainerEl.innerHTML;
    //render loading spinner
    showSpinner(addRecipeContainerEl);
    //uplaod the new recipe data
    addOwnRecipe(newRecipe);
    //display success message
    renderMessage("successfully added", addRecipeContainerEl);

    //change ID in URL
    window.history.pushState(null, "", `#${state.recipe.id}`);
    //render recipe
    showRecipe();
    //click own recipes button to show them
    ownRecipeBtn.click();
    //close the form window
    setTimeout(function () {
      toggleHidden(addRecipeOverlay, addRecipeWindow);
      addRecipeContainerEl.innerHTML = "";
      addRecipeContainerEl.insertAdjacentHTML("afterbegin", formHTML);
    }, 2 * 1000);
  } catch (err) {
    renderError(err.message, addRecipeContainerEl);
  }
};

const showOwnRecipeHandler = function () {
  //1) set showresults to own-recipes
  state.showResults = "own-recipes";
  //2) show message if non were found
  if (state.ownRecipes.data.length === 0) {
    renderMessage(
      "you don't have own recipes, try adding some recipes",
      recipeContainerEl
    );
  }
  //3) render results
  renderResultsAndPagination(state.ownRecipes, 1);
};

//all event listeners
//all event listeners
//all event listeners
//pagination buttons click listener
paginationContainerEl.addEventListener("click", function (event) {
  const btn = event.target.closest(".btn--inline");
  if (!btn) return;
  const goToPage = +btn.dataset.goto;
  const dataList =
    state.showResults === "search"
      ? state.search
      : state.showResults === "own-recipes"
      ? state.ownRecipes
      : "";
  renderResultsAndPagination(dataList, goToPage);
});

//add recipe
addRecipeBtn.addEventListener("click", (e) => {
  toggleHidden(addRecipeOverlay, addRecipeWindow);
});
closeModalBtn.addEventListener("click", (e) => {
  toggleHidden(addRecipeOverlay, addRecipeWindow);
});
addRecipeOverlay.addEventListener("click", (e) => {
  toggleHidden(addRecipeOverlay, addRecipeWindow);
});

//show own recipes
ownRecipeBtn.addEventListener("click", function (event) {
  event.preventDefault();
  showOwnRecipeHandler();
});

//add recipe container element submit event
addRecipeContainerEl.addEventListener("submit", function (event) {
  event.preventDefault();
  const dataArray = [...new FormData(this)];
  const data = Object.fromEntries(dataArray);
  addNewRecipeHandler(data);
});

addRecipeContainerEl.addEventListener("click", function (event) {
  const btn = event.target.closest(".add-ingredient__btn");
  if (!btn) return;
  const lastIngredientLabel = addRecipeContainerEl.querySelector(
    ".upload__column__ingredients div:nth-last-child(2) label"
  ).textContent;
  let newFormNumber = +lastIngredientLabel.split(" ")[1] + 1;
  const html = ingredientFormHTML(newFormNumber);
  btn.insertAdjacentHTML("beforebegin", html);
});

//search button click
searchBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  state.search.query = searchInput.value;
  searchInput.value = "";
  if (!(state.search.query.length >= 2)) {
    renderMessage(
      "Write an ingredient or food name to search for it",
      recipeContainerEl
    );
    return;
  }
  state.showResults = "search";
  try {
    const {
      data: { recipes },
    } = await getRequest(
      `${API_URL}?search=${state.search.query}&key=${API_KEY}`
    );
    if (recipes.length === 0) {
      renderMessage(
        "No recipes found for your search, please try again with another keyword",
        recipeContainerEl
      );
    }
    state.search.data = recipes.map((recipe) => {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
      };
    });
    renderResultsAndPagination(state.search, 1);
  } catch (error) {}
});

//recipe container element click bookmark and servings change
recipeContainerEl.addEventListener("click", function (event) {
  const btn = event.target.closest(".btn--bookmark");
  if (!btn) return;

  addRemoveBookmarkHandler();
});
recipeContainerEl.addEventListener("click", function (event) {
  const btn = event.target.closest(".btn--update-servings");
  if (!btn) return;
  const updateTo = +btn.dataset.updateTo;
  if (updateTo > 0) {
    changeServings(updateTo);
  }
});

//hash change and load event
["hashchange", "load"].forEach((event) =>
  window.addEventListener(event, showRecipe)
);

bookmarkContainerEl.addEventListener("click", (event) => {
  const btn = event.target.closest(".clear-bookmarks-btn");
  if (!btn) return;
  const yes = confirm("are you sure you want to clear all bookmarks?");
  if (!yes) return;
  localStorage.clear("bookmarks");
  state.bookmarks = [];
  renderBookmarks(state.bookmarks);
  showRecipe();
});

previewContainerEl.addEventListener("click", (event) => {
  const btn = event.target.closest(".clear-recipes-btn");
  if (!btn) return;
  const yes = confirm("are you sure you want to clear all recipes?");
  if (!yes) return;
  localStorage.clear("own-recipes");
  state.ownRecipes.data = [];
  state.showResults = "search";
  const nonOwnRecipesBookmarks = state.bookmarks.filter(
    (bookmark) => !bookmark.id.match(/^\d+$/)
  );
  state.bookmarks = nonOwnRecipesBookmarks;
  renderBookmarks(state.bookmarks);
  showRecipe();
});

recipeContainerEl.addEventListener("click", (event) => {
  const btn = event.target.closest(".delete-recipe-btn");
  if (!btn) return;
  const yes = confirm("are you sure you want to delete this recipe?");
  if (!yes) return;
  window.history.pushState(null, "", `#1234567890`);
  const id = window.location.hash.slice(1);
  const index = state.ownRecipes.data.findIndex((recipe) => recipe.id === id);
  const bookmarkSearchIndex = state.bookmarks.findIndex(
    (bookmark) => bookmark.id === state.recipe.data[index].id
  );
  if (bookmarkSearchIndex !== -1) {
    state.bookmarks.splice(bookmarkSearchIndex, 1);
  }
  state.ownRecipes.data.splice(index, 1);
  renderBookmarks(state.bookmarks);
  storeData();
  showOwnRecipeHandler();
  showRecipe();
});

sortSelectionList?.addEventListener("change", (event) => {
  const value = event.target.value;
  if (!state.showResults === "own-recipes") return;
  if (!(state.ownRecipes.data.length > 1)) return;
  data = state.ownRecipes.data;
  console.log(data);
  if (value === "time-created") {
    data.sort((prev, next) => +next.id - +prev.id);
  }
  if (value === "cooking-time") {
    data.sort((prev, next) => prev.cookingTime - next.cookingTime);
  }
  if (value === "ingredients-number") {
    data.sort(
      (prev, next) => prev.ingredients.length - next.ingredients.length
    );
  }
  state.ownRecipes.data = data;
  renderResultsAndPagination(state.ownRecipes, 1);
});
//init function to get local storage
//init function to get local storage
//init function to get local storage
const init = function () {
  const bookmarks = localStorage.getItem("bookmarks");
  const ownRecipes = localStorage.getItem("own-recipes");
  if (bookmarks) state.bookmarks = JSON.parse(bookmarks);
  if (ownRecipes) state.ownRecipes = JSON.parse(ownRecipes);
};

init();

//features for improvements in the future
//6) shopping list of ingredients to display ingredients in the list
//7) weekly meal planning features , assign recipes for 7 days and show them in on a weekly calender
//8) get nutrition data for each ingredient from food API like (https://spoonacular.com/food-api)
