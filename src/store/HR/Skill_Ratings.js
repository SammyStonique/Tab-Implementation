import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  ratingsList: [], 
  ratingArr: [],
  ratingArray: [],
  ratingID: '',
  selectedRating: null,
  selectedAppraisal: null,
  selectedIndicator: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.ratingsList = [];
    state.ratingArr = [];
    state.ratingArray = [];
    state.ratingID = '';
    state.selectedRating = null;
    state.selectedAppraisal = null;
    state.selectedIndicator = null;
    state.isEditing = false;
  },
  SET_SELECTED_RATING(state, rating) {
    state.selectedRating = rating;
    state.isEditing = true;
  },
  SET_SELECTED_APPRAISAL(state, appraisal) {
    state.selectedAppraisal = appraisal;
  },
  SET_SELECTED_INDICATOR(state, indicator) {
    state.selectedIndicator = indicator;
  },
  LIST_RATINGS(state, ratings) {
    state.ratingsList = ratings;
  },
  RATINGS_ARRAY(state, ratings){
    state.ratingArray = ratings;
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
  
  async createSkillRating({ commit,state }, formData) {
    return axios.post('api/v1/create-skill-rating/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchSkillRatings({ commit,state }, formData) {
    state.ratingArr = [];
    axios.post(`api/v1/get-skill-ratings/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.ratingArr.push((response.data[i].employee.employee_name + " (" + response.data[i].employee.staff_number + ") -" + response.data[i].performance_indicator.indicator_name + " - (" + response.data[i].appraisal.appraisal_date + ")"));
      }
      commit('LIST_RATINGS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchSkillRating({ commit,state }, formData) {
    axios.post(`api/v1/get-skill-ratings/`,formData)
    .then((response)=>{
      state.selectedRating = response.data;
      const selectedAppraisal = response.data.appraisal.employee.employee_name + " (" + response.data.appraisal.employee.staff_number + ") -" + response.data.appraisal.category.category_name + " - (" + response.data.appraisal.appraisal_date + ")";
      const selectedIndicator = response.data.performance_indicator.indicator_name;
      commit('SET_SELECTED_APPRAISAL',selectedAppraisal);
      commit('SET_SELECTED_INDICATOR',selectedIndicator);
      commit('SET_SELECTED_RATING',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedRating({ commit, state }, option){
    state.ratingArray = [];
    const selectedRating = state.ratingsList.find(rating => (rating.employee.employee_name + " (" + rating.employee.staff_number + ") -" + rating.performance_indicator.indicator_name + " - (" + rating.appraisal.appraisal_date  + ")") === option);
    if (selectedRating) {
        state.ratingID = selectedRating.skill_rating_id;
        state.ratingArray = [...state.ratingArray, selectedRating];
    }
    commit('RATINGS_ARRAY', state.ratingArray);
      
  },

  async updateSkillRating({ commit,state }, formData) {
    return axios.put(`api/v1/update-skill-rating/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteSkillRating({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Rating?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Rating!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-skill-rating/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Rating removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Rating",
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
        Swal.fire(`Rating has not been deleted!`);
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
  
  