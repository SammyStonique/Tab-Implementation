import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  feesList: [], 
  feeArr: [],
  feeArray: [],
  feeID: '',
  feeName: '',
  selectedFee: null,
  selectedLedger: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.feesList = [];
    state.feeArr = [];
    state.feeArray = [];
    state.feeID = "";
    state.feeName = "";
    state.selectedFee = null;
    state.selectedLedger = null;
    state.isEditing = false;
  },
  SET_SELECTED_FEE(state, fee) {
    state.selectedFee = fee;
    state.isEditing = true;
  },
  LIST_FEES(state, fees) {
    state.feesList = fees;
  },
  FEES_ARRAY(state, fees){
    state.feeArray = fees;
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
    
    }
  },
  RESET_SEARCH_FILTERS(state){

  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createLoanFee({ commit,state }, formData) {
    return axios.post('api/v1/create-loan-fee/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchLoanFees({ commit,state }, formData) {
    state.feeArr = [];
    axios.post(`api/v1/get-loan-fees/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.feeArr.push((response.data[i].fee_name));
      }
      commit('LIST_FEES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLoanFee({ commit,state }, formData) {
    axios.post(`api/v1/get-loan-fees/`,formData)
    .then((response)=>{
      state.selectedFee = response.data;
      const selectedLedger = response.data.posting_account.ledger_code + " - " + response.data.posting_account.ledger_name;
      commit('SET_SELECTED_FEE',response.data);
      commit('SET_SELECTED_LEDGER', selectedLedger);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedFee({ commit, state }, option){
    const selectedFee = state.feesList.find(fee => (fee.fee_name) === option);
    if (selectedFee) {
        state.feeID = selectedFee.loan_fee_id;
        state.feeName = selectedFee.fee_name;
        selectedFee.member_loan_fee_id = null;
        selectedFee.loan_loan_fee_id = null;
        state.feeArray = [...state.feeArray, selectedFee];
    }
    commit('FEES_ARRAY', state.feeArray);
      
  },

  async updateLoanFee({ commit,state }, formData) {
    return axios.put(`api/v1/update-loan-fee/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteLoanFee({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Loan Fee?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Loan Fee!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-loan-fee/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Loan Fee removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Loan Fee",
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
        Swal.fire(`Loan Fee has not been deleted!`);
      }
    })
  },
  removeLoanFee({commit, state}, index){
    state.feeArray.splice(index, 1); 
    commit('FEES_ARRAY', state.feeArray);
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
  
  