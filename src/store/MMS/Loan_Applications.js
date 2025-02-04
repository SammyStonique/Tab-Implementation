import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  applicationsList: [], 
  applicationArr: [],
  applicationArray: [],
  applicationID: '',
  applicationNumber: '',
  applicationMaxAmount: 0,
  loanCharges: [],
  loanGuarantors: [],
  loanSchedules: [],
  selectedApplication: null,
  selectedProduct: null,
  selectedMember: null,
  selectedRepayments: [],
  isEditing: false,
  loanDetails: [],
  selectedSchedules: [],
  selectedCharges: [],
  selectedGuarantors: [],
  selectedTransactions: [],
  loanMember: [],
  loanProduct: [],
  selectedApplicationID: null,
};
  
const mutations = {
  initializeStore(state){
    state.applicationsList = [];
    state.applicationArr = [];
    state.applicationArray = [];
    state.applicationID = "";
    state.applicationNumber = "";
    state.applicationMaxAmount = 0;
    state.selectedApplication = null;
    state.loanCharges = [];
    state.loanGuarantors = [];
    state.loanSchedules = [];
    state.selectedProduct = null;
    state.selectedMember = null;
    state.isEditing = false;
    state.loanDetails = [];
    state.selectedSchedules = [];
    state.selectedCharges = [];
    state.selectedGuarantors = [];
    state.selectedTransactions = [];
    state.loanMember = [];
    state.loanProduct = [];
    state.selectedApplicationID = null;
    state.selectedRepayments = [];
  },
  SET_SELECTED_APPLICATION(state, application) {
    state.selectedApplication = application;
    state.isEditing = true;
  },
  SET_SELECTED_REPAYMENTS(state, repayment) {
    state.selectedRepayments = repayment;
  },
  LIST_APPLICATIONS(state, applications) {
    state.applicationsList = applications;
  },
  APPLICATIONS_ARRAY(state, applications){
    state.applicationArray = applications;
  },

  SET_APPLICATION_CHARGES(state, charges){
    state.loanCharges = charges
  },
  SET_APPLICATION_GUARANTORS(state, guarantors){
    state.loanGuarantors = guarantors
  },
  SET_APPLICATION_SCHEDULES(state, schedules){
    state.loanSchedules = schedules
  },
  SET_LOAN_CHARGES(state, charges){
    state.selectedCharges = charges
  },
  SET_LOAN_DETAILS(state, details){
    state.loanDetails = details;
  },
  SET_LOAN_GUARANTORS(state, guarantors){
    state.selectedGuarantors = guarantors;
  },
  SET_LOAN_SCHEDULES(state, schedules){
    state.selectedSchedules = schedules;
  },
  SET_LOAN_TRANSACTIONS(state, transactions){
    state.selectedTransactions = transactions;
  },
  SET_SELECTED_MEMBER(state, member) {
    state.selectedMember = member;
  },
  SET_SELECTED_PRODUCT(state, product) {
    state.selectedProduct = product;
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
  
  async createLoanApplication({ commit,state }, formData) {
    return axios.post('api/v1/create-loan-application/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  generateArmotizationSchedules({ commit,state }, formData) {
    state.loanSchedules = [];
    axios.post(`api/v1/generate-armotization-schedules/`,formData)
    .then((response)=>{
      commit('SET_APPLICATION_SCHEDULES', response.data.armotization_schedule);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },

  fetchLoanApplications({ commit,state }, formData) {
    state.applicationArr = [];
    axios.post(`api/v1/get-loan-applications/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.applicationArr.push((response.data[i].loan_number + " - " + response.data[i].loan_product.product_name + " - " + response.data[i].member.member_name));
      }
      commit('LIST_APPLICATIONS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLoanApplication({ commit,state }, formData) {
    axios.post(`api/v1/get-loan-applications/`,formData)
    .then((response)=>{
        state.selectedApplication = response.data;
        const selectedMember = response.data.member.member_number + " - " + response.data.member.member_name;
        const selectedProduct = response.data.loan_product.product_code + " - " + response.data.loan_product.product_name;
        commit('SET_SELECTED_APPLICATION',response.data);
        commit('SET_SELECTED_MEMBER',selectedMember);
        commit('SET_SELECTED_PRODUCT',selectedProduct);
        commit('SET_APPLICATION_CHARGES',(response.data.loan_charges != null) ? (response.data.loan_charges) : []);
        commit('SET_APPLICATION_GUARANTORS',(response.data.loan_guarantors != null) ? (response.data.loan_guarantors) : []);
        commit('SET_APPLICATION_SCHEDULES',(response.data.loan_schedules != null) ? (response.data.loan_schedules) : []);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLoanDetails({ commit,state }, formData) {
    axios.post(`api/v1/get-loan-applications/`,formData)
    .then((response)=>{
        state.loanDetails = response.data;
        state.loanMember = response.data.member;
        state.loanProduct = response.data.loan_product;
        state.selectedApplicationID = response.data.loan_application_id;
        commit('SET_LOAN_DETAILS',response.data);
        commit('SET_LOAN_CHARGES',(response.data.loan_charges != null) ? (response.data.loan_charges) : []);
        commit('SET_LOAN_GUARANTORS',(response.data.loan_guarantors != null) ? (response.data.loan_guarantors) : []);
        commit('SET_LOAN_SCHEDULES',(response.data.loan_schedules != null) ? (response.data.loan_schedules) : []);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLoanTransactions({ commit,state }, formData){
    let txns = [];
    axios
    .post("api/v1/loan-ledger-transactions-search/", formData)
    .then((response)=>{
        state.selectedTransactions = [];
        let running_balance = 0;
        txns = response.data.results;

        for(let i=0; i<txns.length; i++){
            if(txns[i].debit_amount != 0){
                running_balance += txns[i].debit_amount;
                txns[i]['running_balance'] = Number(running_balance).toLocaleString();
                state.selectedTransactions.push(txns[i])
            }
            else if(txns[i].credit_amount != 0){
                running_balance -= txns[i].credit_amount;
                txns[i]['running_balance'] = Number(running_balance).toLocaleString();
                state.selectedTransactions.push(txns[i])
            }
        }
    })
    .catch((error)=>{
        console.log(error.message)
    })
    .finally(()=>{
    
    })
  },
  fetchLoanRepayments({ commit,state }, formData) {
    axios.post(`api/v1/get-loan-repayments/`,formData)
    .then((response)=>{
        state.selectedRepayments = response.data;
        commit('SET_SELECTED_REPAYMENTS',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  
  handleSelectedApplication({ commit, state }, option){
    const selectedApplication = state.applicationsList.find(application => (application.loan_number + " - " +application.loan_product.product_name + " - " + application.member.member_name) === option);
    if (selectedApplication) {
        state.applicationID = selectedApplication.loan_application_id;
        state.applicationNumber = selectedApplication.loan_number;
        state.applicationMaxAmount = selectedApplication.loan_product.max_amount;
        state.applicationArray = [...state.applicationArray, selectedApplication];
    }
    commit('APPLICATIONS_ARRAY', state.applicationArray);
      
  },

  async updateLoanApplication({ commit,state }, formData) {
    return axios.put(`api/v1/update-loan-application/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteLoanApplication({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Loans Application?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Loan Application(s)!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-loan-application/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Loan Application(s) removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Loan Application(s)",
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
        Swal.fire(`Loan Application(s) has not been deleted!`);
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
  
  