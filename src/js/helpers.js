import { TIMEOUT_SECONDS } from "./config.js";
import icons from "../img/icons.svg"; // parcel 1

export const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export function existence(value) {
  return value ? value : "";
}

export const createRecipeObject = function (recipe) {
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
  };
};

export function showSpinner(container) {
  const spinnerHTML = `
      <div class="spinner">
              <svg>
                <use href="${icons}#icon-loader"></use>
              </svg>
            </div>
      `;
  container.innerHTML = "";
  container.insertAdjacentHTML("afterbegin", spinnerHTML);
}

export function renderError(message, containerElement) {
  const errorHTML = `
      <div class="error">
              <div>
                <svg>
                  <use href="${icons}#icon-alert-triangle"></use>
                </svg>
              </div>
              <p>${message}</p>
            </div>
      `;
  containerElement.innerHTML = "";
  containerElement.insertAdjacentHTML("afterbegin", errorHTML);
}

export function clearAllBtnHTML(option) {
  if (option !== "bookmarks" && option !== "recipes") return;
  return `
  <button class="btn--inline clear-${option}-btn">
  <svg class="icon-minus-circle">
    <use href="${icons}#icon-minus-circle"></use>
  </svg>
  <span>clear all ${option}</span>
  </button>
  `;
}
export function ingredientFormHTML(num) {
  return `<div>
<label>Ingredient ${num}</label>
<input
  type="number"
  name="ingredient-quantity-${num}"
  placeholder="Quantity"
/>
<input type="text" name="ingredient-unit-${num}" placeholder="Unit" />
<input
  type="text"
  name="ingredient-item-${num}"
  placeholder="Ingredient"
/>
</div>`;
}

export function renderMessage(message, containerElement) {
  const messageHTML = `
          <div class="message">
              <div>
              <svg>
                  <use href="${icons}#icon-smile"></use>
              </svg>
              </div>
              <p>${message}</p>
          </div>
        `;
  containerElement.innerHTML = "";
  containerElement.insertAdjacentHTML("afterbegin", messageHTML);
}

export function toggleHidden(el1, el2) {
  el1.classList.toggle("hidden");
  el2.classList.toggle("hidden");
}

export function getTenResultsPage(dataList, page) {
  if (!page) page = dataList.pageNumber;
  if (dataList.data.length < 11) return dataList.data;
  dataList.pageNumber = page;
  const start = (page - 1) * dataList.resultsPerPage; //0
  const end = page * dataList.resultsPerPage; // 9
  return dataList.data.slice(start, end);
}

export const sortHTML = `<div class="sort-div">
<label for="sort" class="sort-label">Sort</label>
<select id="sort">
  <option value="time-created">time created</option>
  <option value="cooking-time">cooking time</option>
  <option value="ingredients-number">ingredients No.</option>
</select>
</div>
`;
export const getRequest = async function (url) {
  try {
    const fetchData = fetch(url);
    const response = await Promise.race([fetchData, timeout(TIMEOUT_SECONDS)]);
    let data = await response.json();
    if (!response.ok)
      throw new Error(
        `Error has happened: ${response.statusText} - ${response.status}`
      );
    return data;
  } catch (err) {
    throw err;
  }
};
