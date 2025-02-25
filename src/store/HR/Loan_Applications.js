import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  applicationsList: [], 
  applicationArr: [],
  applicationArray: [],
  applicationID: '',
  applicationNumber: '',
  loanSchedules: [],
  selectedApplication: null,
  selectedEmployee: null,
  selectedInterestLedger: null,
  selectedRepayments: [],
  isEditing: false,
  loanDetails: [],
  selectedSchedules: [],
  selectedTransactions: [],
  loanEmployee: [],
  selectedApplicationID: null,
};
  
const mutations = {
  initializeStore(state){
    state.applicationsList = [];
    state.applicationArr = [];
    state.applicationArray = [];
    state.applicationID = "";
    state.applicationNumber = "";
    state.selectedApplication = null;
    state.loanSchedules = [];
    state.selectedProduct = null;
    state.selectedEmployee = null;
    state.selectedInterestLedger = null;
    state.isEditing = false;
    state.loanDetails = [];
    state.selectedSchedules = [];
    state.selectedTransactions = [];
    state.loanEmployee = [];
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

  SET_APPLICATION_SCHEDULES(state, schedules){
    state.loanSchedules = schedules
  },
  SET_LOAN_DETAILS(state, details){
    state.loanDetails = details;
  },
  SET_LOAN_SCHEDULES(state, schedules){
    state.selectedSchedules = schedules;
  },
  SET_LOAN_TRANSACTIONS(state, transactions){
    state.selectedTransactions = transactions;
  },
  SET_SELECTED_EMPLOYEE(state, member) {
    state.selectedEmployee = member;
  },
  SET_SELECTED_INTEREST_LEDGER(state, ledger) {
    state.selectedInterestLedger = ledger;
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
    return axios.post('api/v1/create-employee-loan-application/', formData)
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
    axios.post(`api/v1/generate-employee-armotization-schedules/`,formData)
    .then((response)=>{
      commit('SET_APPLICATION_SCHEDULES', response.data.armotization_schedule);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },

  fetchLoanApplications({ commit,state }, formData) {
    state.applicationArr = [];
    axios.post(`api/v1/get-employee-loan-applications/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.applicationArr.push((response.data[i].loan_number + " - " + response.data[i].employee.staff_number + " - " + response.data[i].employee.employee_name));
      }
      commit('LIST_APPLICATIONS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLoanApplication({ commit,state }, formData) {
    axios.post(`api/v1/get-employee-loan-applications/`,formData)
    .then((response)=>{
        state.selectedApplication = response.data;
        const selectedEmployee = response.data.employee.staff_number + " - " + response.data.employee.employee_name;
        commit('SET_SELECTED_APPLICATION',response.data);
        commit('SET_SELECTED_EMPLOYEE',selectedEmployee);
        commit('SET_SELECTED_INTEREST_LEDGER', (response.data.interest_posting_account != null) ? (response.data.interest_posting_account.ledger_code + " - " + response.data.interest_posting_account.ledger_name) : "");
        commit('SET_APPLICATION_SCHEDULES',(response.data.loan_schedules != null) ? (response.data.loan_schedules) : []);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLoanDetails({ commit,state }, formData) {
    axios.post(`api/v1/get-employee-loan-applications/`,formData)
    .then((response)=>{
        state.loanDetails = response.data;
        state.loanEmployee = response.data.employee;
        state.selectedApplicationID = response.data.loan_application_id;
        commit('SET_LOAN_DETAILS',response.data);
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
    const selectedApplication = state.applicationsList.find(application => (application.loan_number + " - " +application.employee.staff_number + " - " + application.employee.employee_name) === option);
    if (selectedApplication) {
        state.applicationID = selectedApplication.employee_loan_application_id;
        state.applicationNumber = selectedApplication.loan_number;
        state.applicationArray = [...state.applicationArray, selectedApplication];

    }
    commit('APPLICATIONS_ARRAY', state.applicationArray);
      
  },

  async updateLoanApplication({ commit,state }, formData) {
    return axios.put(`api/v1/update-employee-loan-application/`,formData)
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
        axios.post(`api/v1/delete-employee-loan-application/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
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
  
  