import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  recipesList: [], 
  recipeArr: [],
  recipeArray: [],
  recipeID: '',
  ingredientsArray: [],
  selectedRecipe: null,
  selectedItem: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.recipesList = [];
    state.recipeArr = [];
    state.recipeArray = [];
    state.recipeID = '';
    state.ingredientsArray = [];
    state.isEditing = false;
    state.selectedRecipe = null;
    state.selectedItem = null;
  },
  SET_SELECTED_RECIPE(state, recipe) {
    state.selectedRecipe = recipe;
    state.isEditing = true;
  },
  SET_SELECTED_ITEM(state, item) {
    state.selectedItem = item;
  },
  SET_INGREDIENTS_ARRAY(state, ingredients){
    state.ingredientsArray = ingredients;
  },
  LIST_RECIPES(state, recipes) {
    state.recipesList = recipes;
  },
  RECIPES_ARRAY(state, recipes){
    state.recipeArray = recipes;
  },
  SET_STATE(state, payload) {
    for (const key in payload) {
        if (payload.hasOwnProperty(key) && key in state) {
            state[key] = payload[key];
        }
    }
  },
  SET_SEARCH_FILTERS(state, search_filter){
    for(const [key, value] of Object.entries(search_filter)){
    }
  },
  RESET_SEARCH_FILTERS(state){
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createRecipe({ commit,state }, formData) {
    return axios.post('api/v1/create-product-recipe/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchRecipes({ commit,state }, formData) {
    state.recipeArr = [];
    await axios.post(`api/v1/get-product-recipes/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.recipeArr.push((response.data[i].inventory_item.item_code + ' - ' + response.data[i].inventory_item.item_name));
      }
      commit('LIST_RECIPES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchRecipe({ commit,state }, formData) {
    axios.post(`api/v1/get-product-recipes/`,formData)
    .then((response)=>{
      state.selectedRecipe = response.data;
      commit('SET_SELECTED_ITEM', response.data.inventory_item_name);
      commit('SET_INGREDIENTS_ARRAY', response.data.ingredients);
      commit('SET_SELECTED_RECIPE',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedRecipe({ commit, state }, option){
    state.recipeArray = [];
    const selectedRecipe = state.recipesList.find(recipe => (recipe.inventory_item.item_code + ' - ' + recipe.inventory_item.item_name) === option);
    if (selectedRecipe) {
        state.recipeID = selectedRecipe.recipe_id;
        state.recipeArray = [...state.recipeArray, selectedRecipe];
    }
    commit('RECIPES_ARRAY', state.recipeArray);
      
  },

  async updateRecipe({ commit,state }, formData) {
    return axios.put(`api/v1/update-product-recipe/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteRecipe({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Recipe?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Recipe!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-product-recipe/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Recipe removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Recipe",
              icon: "warning",
            });
          }                   
        })
        .catch((error)=>{
          console.log(error.message);
          Swal.fire({
            title: error.message,
            icon: "warning",
          });
        })
      }else{
        Swal.fire(`Recipe has not been deleted!`);
      }
    })
  },
};
  
const getters = {
  // users: (state) => state.users,
  // currentUser: (state) => state.currentUser,
};
  
export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
  
  