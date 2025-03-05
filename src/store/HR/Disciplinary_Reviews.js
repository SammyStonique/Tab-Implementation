import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  reviewsList: [], 
  reviewArr: [],
  reviewArray: [],
  reviewID: '',
  reviewDate: '',
  selectedReview: null,
  selectedCase: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.reviewsList = [];
    state.reviewArr = [];
    state.reviewArray = [];
    state.reviewID = '';
    state.reviewDate = '';
    state.selectedReview = null;
    state.selectedCase = null;
    state.isEditing = false;
  },
  SET_SELECTED_REVIEW(state, review) {
    state.selectedReview = review;
    state.isEditing = true;
  },
  SET_SELECTED_CASE(state, cases) {
    state.selectedCase = cases;
  },
  LIST_REVIEWS(state, reviews) {
    state.reviewsList = reviews;
  },
  REVIEWS_ARRAY(state, reviews){
    state.reviewArray = reviews;
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
  
  async createDisciplinaryReview({ commit,state }, formData) {
    return axios.post('api/v1/create-disciplinary-review/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchDisciplinaryReviews({ commit,state }, formData) {
    state.reviewArr = [];
    axios.post(`api/v1/get-disciplinary-reviews/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.reviewArr.push((response.data[i].disciplinary_case.case_number + " - " + response.data[i].review_date));
      }
      commit('LIST_REVIEWS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchDisciplinaryReview({ commit,state }, formData) {
    axios.post(`api/v1/get-disciplinary-reviews/`,formData)
    .then((response)=>{
      state.selectedReview = response.data;
      const selectedCase = response.data.disciplinary_case.case_number + " - " + response.data.disciplinary_case.employee.employee_name +" ("+ response.data.disciplinary_case.employee.staff_number +")";
      commit('SET_SELECTED_CASE',selectedCase);
      commit('SET_SELECTED_REVIEW',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedReview({ commit, state }, option){
    state.reviewArray = [];
    const selectedReview = state.reviewsList.find(review => (review.disciplinary_case.case_number + " - " + review.review_date) === option);
    if (selectedReview) {
        state.reviewID = selectedReview.disciplinary_review_id;
        state.reviewDate = selectedReview.review_date;
        state.reviewArray = [...state.reviewArray, selectedReview];
    }
    commit('REVIEWS_ARRAY', state.reviewArray);
      
  },

  async updateDisciplinaryReview({ commit,state }, formData) {
    return axios.put(`api/v1/update-disciplinary-review/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteDisciplinaryReview({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Review?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Review!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-disciplinary-review/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Review removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Review",
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
        Swal.fire(`Review has not been deleted!`);
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
  
  