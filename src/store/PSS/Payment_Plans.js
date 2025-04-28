import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  plansList: [], 
  planArr: [],
  planArray: [],
  planID: '',
  planName: '',
  selectedPlan: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.plansList = [];
    state.planArr = [];
    state.planArray = [];
    state.isEditing = false;
    state.selectedPlan = null;
  },
  SET_SELECTED_PLAN(state, Plan) {
    state.selectedPlan = Plan;
    state.isEditing = true;
  },
  LIST_PLANS(state, Plans) {
    state.plansList = Plans;
  },
  PLANS_ARRAY(state, Plans){
    state.planArray = Plans;
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
  
  async createPaymentPlan({ commit,state }, formData) {
    return axios.post('api/v1/create-payment-plan/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchPaymentPlans({ commit,state }, formData) {
    state.planArr = [];
    await axios.post(`api/v1/get-payment-plans/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.planArr.push((response.data[i].name))
      }
      commit('LIST_PLANS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchPaymentPlan({ commit,state }, formData) {
    axios.post(`api/v1/get-payment-plans/`,formData)
    .then((response)=>{
      state.selectedPlan = response.data;
      commit('SET_SELECTED_PLAN',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedPaymentPlan({ commit, state }, option){
    state.planArray = [];
    const selectedPlan = state.plansList.find(plan => (plan.name) === option);
    if (selectedPlan) {
        state.planID = selectedPlan.payment_plan_id;
        state.planName = selectedPlan.name;
        state.planArray = [...state.planArray, selectedPlan];
    }
    commit('PLANS_ARRAY', state.planArray);
      
  },

  async updatePaymentPlan({ commit,state }, formData) {
    return axios.put(`api/v1/update-payment-plan/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deletePaymentPlan({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Payment Plan?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Payment Plan!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-payment-plan/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Payment Plan removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Payment Plan",
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
        Swal.fire(`Payment Plan has not been deleted!`);
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
  
  