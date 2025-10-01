import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  disbursementsList: [], 
  disbursementArr: [],
  disbursementArray: [],
  disbursementID: '',
  disbursementRef: '',
  selectedDisbursement: null,
  selectedApplication: null,
  selectedLedger: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.disbursementsList = [];
    state.disbursementArr = [];
    state.disbursementArray = [];
    state.disbursementID = "";
    state.disbursementRef = "";
    state.selectedDisbursement = null;
    state.selectedApplication = null;
    state.selectedLedger = null;
    state.isEditing = false;
  },
  SET_SELECTED_DISBURSEMENT(state, disbursement) {
    state.selectedDisbursement = disbursement;
    state.isEditing = true;
  },
  LIST_DISBURSEMENTS(state, disbursement) {
    state.disbursementList = disbursement;
  },
  DISBURSEMENTS_ARRAY(state, disbursements){
    state.disbursementArray = disbursements;
  },
  SET_SELECTED_APPLICATION(state, application) {
    state.selectedApplication = application;
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
  
  async createLoanDisbursement({ commit,state }, formData) {
    return axios.post('api/v1/create-loan-disbursement/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchLoanDisbursements({ commit,state }, formData) {
    state.disbursementArr = [];
    axios.post(`api/v1/get-loan-disbursements/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.disbursementArr.push((response.data[i].journal.journal_no + " - " + response.data[i].loan_application.loan_number));
      }
      commit('LIST_DISBURSEMENTS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLoanDisbursement({ commit,state }, formData) {
    axios.post(`api/v1/get-loan-disbursements/`,formData)
    .then((response)=>{
      state.selectedDisbursement = response.data;
      const selectedApplication = response.data.loan_application.loan_number + " - " + response.data.loan_application.loan_product.product_name + " - " + response.data.loan_application.member.member_name;
      const selectedLedger = response.data.posting_account.ledger_code + " - " + response.data.posting_account.ledger_name;
      commit('SET_SELECTED_Disbursement',response.data);
      commit('SET_SELECTED_APPLICATION', selectedApplication);
      commit('SET_SELECTED_LEDGER', selectedLedger);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedDisbursement({ commit, state }, option){
    const selectedDisbursement = state.disbursementsList.find(disbursement => (disbursement.journal.journal_no + " - " + disbursement.loan_application.loan_number) === option);
    if (selectedDisbursement) {
        state.disbursementID = selectedDisbursement.loan_disbursement_id;
        state.disbursementRef = selectedDisbursement.journal.journal_no;
        state.disbursementArray = [...state.disbursementArray, selectedDisbursement];
    }
    commit('DISBURSEMENTS_ARRAY', state.disbursementArray);
      
  },

  async updateLoanDisbursement({ commit,state }, formData) {
    return axios.put(`api/v1/update-loan-disbursement/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteLoanDisbursement({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Loan Disbursement?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Loan Disbursement!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-loan-disbursement/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Loan Disbursement removed succesfully!", {
                icon: "success",
              }); 
          }else if(response.data.msg == "Reconciled"){
            Swal.fire({
              title: "Voucher Already Reconciled!",
              icon: "warning",
            });
          } else{
            Swal.fire({
              title: "Error Deleting Loan Disbursement",
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
        Swal.fire(`Loan Disbursement has not been deleted!`);
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
  
  