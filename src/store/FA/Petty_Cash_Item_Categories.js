import axios from "axios";
import Swal from 'sweetalert2';
import { generateRandomNumber } from '@/composables/RandomNumberGen';

const state = {
    categoryList: [],
    categoryArr: [],
    categoryArray: [],
    categoryID: "",
    subCategoryID: "",
    subCategoryArr: [],
    subCategoryList: [],
    selectedCategory: null,
    selectedSubCategory: null,
    selectedLedger: null,
    paymentItemsArray: [],
    isEditing: "",
    category_name_search: '',
  };
  
  const mutations = {
    initializeStore(state){
      state.categoryList = [];
      state.categoryArr = [];
      state.categoryArray = [];
      state.categoryID = '';
      state.subCategoryID = '';
      state.subCategoryList = [];
      state.subCategoryArr = [];
      state.category_name_search = '';
      state.selectedCategory = null;
      state.selectedSubCategory = null;
      state.selectedLedger = null;
      state.isEditing = false;
      state.paymentItemsArray = [];
    },
    SET_SELECTED_CATEGORY(state, category) {
      state.selectedCategory = category;
      state.isEditing = true;
    },
    SET_SELECTED_SUBCATEGORY(state, category) {
      state.selectedSubCategory = category;
      state.isEditing = true;
    },
    CATEGORIES_ARRAY(state, categories){
      state.categoryArray = categories;
    },
    LIST_ITEM_CATEGORIES(state, categories) {
      state.categoryList = categories;
    },
    LIST_ITEM_SUBCATEGORIES(state, categories) {
      state.subCategoryList = categories;
    },
    SET_SELECTED_LEDGER(state, ledger) {
        state.selectedLedger = ledger;
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
        if(key == 'category_name_search'){
          state.category_name_search = value;
        } 
      }
    },
    RESET_SEARCH_FILTERS(state){
      state.category_name_search = '';
    }

  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },
    
    async createItemCategory({ commit,state }, formData) {
      return axios.post('api/v1/create-petty-cash-item-category/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },
  
    fetchItemCategories({ commit,state }, formData) {
      state.categoryArr = [];
      axios.post(`api/v1/get-petty-cash-item-categories/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.categoryArr.push((response.data[i].category_name));
        }
        commit('LIST_ITEM_CATEGORIES', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    fetchItemCategory({ commit,state }, formData) {
      axios.post(`api/v1/get-petty-cash-item-categories/`,formData)
      .then((response)=>{
        state.selectedCategory = response.data;
        const selectedLedger = (response.data.posting_account != null) ? (response.data.posting_account.ledger_code + " - " + response.data.posting_account.ledger_name) : "";
        commit('SET_SELECTED_LEDGER',selectedLedger);
        commit('SET_SELECTED_CATEGORY',response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    fetchItemSubCategories({ commit,state }, formData) {
      state.subCategoryArr = [];
      axios.post(`api/v1/get-petty-cash-item-subcategories/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.subCategoryArr.push((response.data[i].category_name));
        }
        commit('LIST_ITEM_SUBCATEGORIES', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    fetchItemSubCategory({ commit,state }, formData) {
      axios.post(`api/v1/get-petty-cash-item-subcategories/`,formData)
      .then((response)=>{
        state.selectedSubCategory = response.data;
        commit('SET_SELECTED_SUBCATEGORY',response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    handleSelectedCategory({ commit, state }, option){
      state.categoryArray = [];
      const selectedCategory = state.categoryList.find(category => (category.category_name) === option);
      if (selectedCategory) {
        const categoryCopy = JSON.parse(JSON.stringify(selectedCategory));
        state.categoryArray = [...state.categoryArray, categoryCopy];
        state.categoryID = categoryCopy.petty_cash_item_category_id;
        categoryCopy.description = "";
        categoryCopy.total_amount = 0;
        categoryCopy.options = categoryCopy.sub_categories;
        categoryCopy.sub_category = [];
        state.paymentItemsArray.push(categoryCopy);
      }   
    },
    handleSelectedSubCategory({ commit, state }, option){
      const selectedCategory = state.subCategoryList.find(category => (category.category_name) === option);
      if (selectedCategory) {
        const categoryCopy = JSON.parse(JSON.stringify(selectedCategory));
        state.subCategoryID = categoryCopy.petty_cash_item_subcategory_id;

      }   
    },
  
    async updateItemCategory({ commit,state }, formData) {
      return axios.put(`api/v1/update-petty-cash-item-category/`,formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })  
    },
  
    deleteItemCategory({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Category?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete Category!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-petty-cash-item-category/`,formData)
          .then((response)=>{
            if(response.data.msg == "Success"){
                Swal.fire("Poof! Category removed succesfully!", {
                  icon: "success",
                }); 
            }else{
              Swal.fire({
                title: "Error Deleting Category",
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
          Swal.fire(`Category has not been deleted!`);
        }
      })
    },
    removeVoucherLine({commit, state}, index){
      state.paymentItemsArray.splice(index, 1); 
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
  
  