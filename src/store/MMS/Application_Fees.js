import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  feesList: [], 
  feeArr: [],
  feeArray: [],
  feeID: '',
  feeName: "",
  loanNumber: "",
  memberName: "",
  selectedFee: null,
  selectedApplication: null,
  selectedLoanFee: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.feesList = [];
    state.feeArr = [];
    state.feeArray = [];
    state.feeID = "";
    state.feeName = "";
    state.loanNumber = "";
    state.memberName = "";
    state.selectedFee = null;
    state.selectedApplication = null;
    state.selectedLoanFee = null;
    state.isEditing = false;
  },
  SET_SELECTED_FEES(state, fee) {
    state.selectedFee = fee;
    state.isEditing = true;
  },
  LIST_FEES(state, fees) {
    state.feesList = fees;
  },
  FEES_ARRAY(state, fees){
    state.feeArray = fees;
  },
  SET_SELECTED_APPLICATION(state, application) {
    state.selectedApplication = application;
  },
  SET_SELECTED_LOAN_FEES(state, fee) {
    state.selectedLoanFee = fee;
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
  
  async createApplicationFee({ commit,state }, formData) {
    return axios.post('api/v1/create-loan-application-fee/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchApplicationFees({ commit,state }, formData) {
    state.feeArr = [];
    axios.post(`api/v1/get-loan-application-fees/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.feeArr.push((response.data[i].loan_application.loan_number + " - " + response.data[i].loan_fee.fee_name + " - " + response.data[i].amount));
      }
      commit('LIST_FEES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchApplicationFee({ commit,state }, formData) {
    axios.post(`api/v1/get-loan-application-fees/`,formData)
    .then((response)=>{
      state.selectedFee = response.data;
      const selectedApplication = response.data.loan_application.loan_number + " - " + response.data[i].loan_application.loan_product.product_name + " - " + response.data[i].loan_application.member.member_name;
      const selectedLoanFee = response.data.loan_fee.fee_name;
      commit('SET_SELECTED_FEE',response.data);
      commit('SET_SELECTED_APPLICATION', selectedApplication);
      commit('SET_SELECTED_LOAN_FEES', selectedLoanFee);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedFee({ commit, state }, option){
    const selectedFee = state.feesList.find(fee => (fee.loan_application.loan_number + " - " + fee.loan_fee.fee_name + " - " + fee.amount) === option);
    if (selectedFee) {
        state.feeID = selectedFee.loan_application_fee_id;
        state.feeName = selectedFee.loan_fee.fee_name;
        state.loanNumber = selectedFee.loan_application.loan_number;
        state.memberName = selectedFee.loan_application.member.member_name;
        state.feeArray = [...state.feeArray, selectedFee];
    }
    commit('FEES_ARRAY', state.feeArray);
      
  },

  async updateApplicationFee({ commit,state }, formData) {
    return axios.put(`api/v1/update-loan-application-fee/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteApplicationFee({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Application Fee?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Application Fee!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-loan-application-fee/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Application Fee removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Application Fee",
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
        Swal.fire(`Application Fee has not been deleted!`);
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
  
  