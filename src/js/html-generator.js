import icons from "../img/icons.svg"; // parcel 1
import { existence } from "./helpers.js";
//generate ingredients html template that is not exported but used here
//generate ingredients html template that is not exported but used here
//generate ingredients html template that is not exported but used here
function generateIgredientHTML(ing) {
  return `
      <li class="recipe__ingredient">
      <svg class="recipe__icon">
        <use href="${icons}#icon-check"></use>
      </svg>
      <div class="recipe__quantity">${
        typeof existence(ing.quantity) === "number"
          ? new Fraction(existence(ing.quantity)).toString()
          : existence(ing.quantity)
      }</div>
      <div class="recipe__description">
        <span class="recipe__unit">${existence(ing.unit)}</span>
        ${existence(ing.description)}
      </div>
    </li>
      `;
}

//HTML generator that is exported can generate 3 types of html templates according to options, that is preview, pagination, recipe
//HTML generator that is exported can generate 3 types of html templates according to options, that is preview, pagination, recipe
//HTML generator that is exported can generate 3 types of html templates according to options, that is preview, pagination, recipe
export function HTMLGenerator(option, data = "") {
  //if option is preview and data is available
  //if option is preview and data is available
  //if option is preview and data is available
  if (option === "preview" && data) {
    const singleData = data;
    const id = window.location.hash.slice(1);
    return `
          <li class="preview">
          <a class="preview__link ${
            singleData.id === id ? "preview__link--active" : ""
          }" href="#${singleData.id}">
            <figure class="preview__fig">
              <img src="${singleData.image}" alt="${singleData.title}" />
            </figure>
            <div class="preview__data">
              <h4 class="preview__name">
                ${singleData.title}
              </h4>
              <p class="preview__publisher">${singleData.publisher}</p>
              <div class="preview__user-generated ${
                singleData.id.match(/^\d+$/) ? "" : "hidden"
              }">
              <svg>
                <use href="${icons}#icon-user"></use>
              </svg>
            </div>
            </div>
          </a>
        </li>`;
  }

  //if option is pagination and data is available
  //if option is pagination and data is available
  //if option is pagination and data is available
  if (option === "pagination" && data) {
    const state = data;
    let currentPage, totalPagesNumber;

    //if show results variable is assigned to search results
    //if show results variable is assigned to search results
    if (state.showResults === "search") {
      currentPage = state.search.pageNumber;
      totalPagesNumber = Math.ceil(
        state.search.data.length / state.search.resultsPerPage
      );
    }
    //if show results variable is assigned to own recipes results
    //if show results variable is assigned to own recipes results
    if (state.showResults === "own-recipes") {
      currentPage = state.ownRecipes.pageNumber;
      totalPagesNumber = Math.ceil(
        state.ownRecipes.data.length / state.ownRecipes.resultsPerPage
      );
    }
    //previous page button html template
    //previous page button html template
    const prevBtnHTML = `
        <button data-goto="${currentPage - 1}" class="btn--inline">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Page ${currentPage - 1}</span>
        </button>
        `;
    //total pages button html template
    //total pages button html template
    const totalPages = `
    <button class="btn--inline">
    <span>${totalPagesNumber} Pages</span>
    </button>
    `;
    //next page button html template
    //next page button html template
    const nextBtnHTML = `
        <button data-goto="${currentPage + 1}" class="btn--inline">
        <span>Page ${currentPage + 1}</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
        </button>
        `;
    // page 1, and there are other pages
    // page 1, and there are other pages
    if (currentPage === 1 && totalPagesNumber > 1) {
      return totalPages + nextBtnHTML;
    }
    //last page
    //last page
    if (currentPage === totalPagesNumber && totalPagesNumber > 1) {
      return prevBtnHTML + totalPages;
    }
    // other page in the middle
    // other page in the middle
    if (currentPage < totalPagesNumber && currentPage !== 1) {
      return prevBtnHTML + totalPages + nextBtnHTML;
    }
    // page 1, no other pages
    // page 1, no other pages
    if (totalPagesNumber === 1) {
      return "";
    }
  }

  //if option is recipe and data is available
  //if option is recipe and data is available
  //if option is recipe and data is available
  if (option === "recipe" && data) {
    const recipe = data;
    return `
    <figure class="recipe__fig">
    <img src="${recipe.image}" alt="${recipe.title}" class="recipe__img" />
    <h1 class="recipe__title">
      <span>${recipe.title}</span>
    </h1>
  </figure>

  <div class="recipe__details">
    <div class="recipe__info">
      <svg class="recipe__info-icon">
        <use href="${icons}#icon-clock"></use>
      </svg>
      <span class="recipe__info-data recipe__info-data--minutes">${
        recipe.cookingTime
      }</span>
      <span class="recipe__info-text">minutes</span>
    </div>
    <div class="recipe__info">
      <svg class="recipe__info-icon">
        <use href="${icons}#icon-users"></use>
      </svg>
      <span class="recipe__info-data recipe__info-data--people">${
        recipe.servings
      }</span>
      <span class="recipe__info-text">servings</span>

      <div class="recipe__info-buttons">
        <button class="btn--tiny btn--update-servings" data-update-to="${
          recipe.servings - 1
        }">
          <svg>
            <use href="${icons}#icon-minus-circle"></use>
          </svg>
        </button>
        <button class="btn--tiny btn--update-servings" data-update-to="${
          recipe.servings + 1
        }">
          <svg>
            <use href="${icons}#icon-plus-circle"></use>
          </svg>
        </button>
      </div>
    </div>
    <button class="${
      recipe.id.match(/^\d+$/) ? "" : "hidden"
    } btn--inline delete-recipe-btn">
    <span style="font-size:13px">delete</span>
    <svg class="icon-minus-circle">
    <use href="${icons}#icon-minus-circle"></use>
    </svg>
    </button>
    <div class="recipe__user-generated">
      <svg class="${recipe.id.match(/^\d+$/) ? "" : "hidden"}">
        <use href="${icons}#icon-user"></use>
      </svg>
    </div>
    <button class="btn--round btn--bookmark">
      <svg class="">
        <use href="${icons}#icon-bookmark${
      recipe.bookmarked ? "-fill" : ""
    }"></use>
      </svg>
    </button>
  </div>

  <div class="recipe__ingredients">
    <h2 class="heading--2">Recipe ingredients</h2>
    <ul class="recipe__ingredient-list">
    ${recipe.ingredients
      .map((ing) => {
        return generateIgredientHTML(ing);
      })
      .join("")}
    </ul>
  </div>

  <div class="recipe__directions">
    <h2 class="heading--2">How to cook it</h2>
    <p class="recipe__directions-text">
      This recipe was carefully designed and tested by
      <span class="recipe__publisher">${
        recipe.publisher
      }</span>. Please check out
      directions at their website.
    </p>
    <a
      class="btn--small recipe__btn"
      href="${recipe.sourceUrl}"
      target="_blank"
    >
      <span>Directions</span>
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-right"></use>
      </svg>
    </a>
  </div>
    `;
  }
  //if no condition was fulfilled, return an empty string
  return "";
}
