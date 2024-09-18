import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    categoryList: [],
    categoryArr: [],
    categoryArray: [],
    categoryID: "",
    selectedCategory: null,
    isEditing: "",
    category_name_search: '',
  };
  
  const mutations = {
    initializeStore(state){
      state.categoryList = [];
      state.categoryArr = [];
      state.categoryArray = [];
      state.categoryID = '';
      state.category_name_search = '';
      state.selectedCategory = null;
      state.isEditing = false;
    },
    SET_SELECTED_CATEGORY(state, category) {
      state.selectedCategory = category;
      state.isEditing = true;
    },
    CATEGORIES_ARRAY(state, categories){
      state.categoryArray = categories;
    },
    LIST_CLIENT_CATEGORIES(state, categories) {
      state.categoryList = categories;
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
    
    async createClientCategory({ commit,state }, formData) {
      return axios.post('api/v1/create-client-category/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },
  
    fetchClientCategories({ commit,state }, formData) {
      state.categoryArr = [];
      axios.post(`api/v1/fetch-client-categories/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.categoryArr.push((response.data[i].name));
        }
        commit('LIST_CLIENT_CATEGORIES', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    fetchClientCategory({ commit,state }, formData) {
      axios.post(`api/v1/fetch-client-categories/`,formData)
      .then((response)=>{
        state.selectedCategory = response.data;
        commit('SET_SELECTED_CATEGORY',response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    handleSelectedCategory({ commit, state }, option){
      state.categoryArray = [];
      const selectedCategory = state.categoryList.find(category => (category.name) === option);
      if (selectedCategory) {
          state.categoryID = selectedCategory.category_id;
          state.categoryArray = [...state.categoryArray, selectedCategory];
      }
      commit('CATEGORIES_ARRAY', state.categoryArray);
        
    },
  
    async updateClientCategory({ commit,state }, formData) {
      return axios.put(`api/v1/update-client-category/`,formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })  
    },
  
    deleteClientCategory({ commit,state }, formData) {
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
          axios.post(`api/v1/delete-client-category/`,formData)
          .then((response)=>{
            if(response.status == 200){
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
  
  