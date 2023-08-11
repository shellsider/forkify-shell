import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchViews.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //0)Update results view to mark selectedsearch result
    resultsView.update(model.getSearchResultsPage());

    //1)Updating Bokmarks view
    bookmarksView.update(model.state.bookmarks);

    //2) Loading Recipe
    await model.loadRecipe(id);

    //3) Rendering Recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    //1) Geting Search Query
    const query = searchView.getQuery();
    if (!query) return;

    //2) Load Search Results
    await model.loadSearchResults(query);

    //3) Render Result
    resultsView.render(model.getSearchResultsPage());

    //4) Render Initial Pagination Buttons
    paginationView.render(model.state.search);
  } catch (err) {}
};

const controlPagination = function (goToPage) {
  //1) Render NEW Result
  resultsView.render(model.getSearchResultsPage(goToPage));

  //2) Render NEW Pagination Buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //Update the recipe servings (in state)
  model.updateServings(newServings);
  //Update the recipe View
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1) Add/Remove Bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //2) Update Recipe view
  recipeView.update(model.state.recipe);

  //3) Render Bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //Loading Spinner
    addRecipeView.renderSpinner();

    //Upload new recipe
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //Render Recipe
    recipeView.render(model.state.recipe);

    //Success Message
    addRecipeView.renderMessage();

    //Render Bookmark View
    bookmarksView.render(model.state.bookmarks);

    //Change id in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //Close Form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const newFeature = function () {
  console.log('Welcome!');
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();
