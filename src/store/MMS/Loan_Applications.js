import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  applicationsList: [], 
  grntApplicationsList: [],
  applicationArr: [],
  applicationArray: [],
  applicationID: '',
  applicationNumber: '',
  applicationMaxAmount: 0,
  loanCharges: [],
  loanGuarantors: [],
  loanSecurities: [],
  loanSchedules: [],
  loanDocuments: [],
  selectedApplication: null,
  selectedProduct: null,
  selectedMember: null,
  selectedRepayments: [],
  isEditing: false,
  loanDetails: [],
  selectedSchedules: [],
  selectedCharges: [],
  selectedGuarantors: [],
  selectedSecurities: [],
  selectedDocuments: [],
  selectedTransactions: [],
  selectedStatement: [],
  loanMember: [],
  loanProduct: [],
  grntLoansArr: [],
  selectedApplicationID: null,
};
  
const mutations = {
  initializeStore(state){
    state.applicationsList = [];
    state.grntApplicationsList = [];
    state.applicationArr = [];
    state.applicationArray = [];
    state.applicationID = "";
    state.applicationNumber = "";
    state.applicationMaxAmount = 0;
    state.selectedApplication = null;
    state.loanCharges = [];
    state.loanGuarantors = [];
    state.loanSecurities = [];
    state.loanDocuments = [];
    state.loanSchedules = [];
    state.selectedProduct = null;
    state.selectedMember = null;
    state.isEditing = false;
    state.loanDetails = [];
    state.selectedSchedules = [];
    state.selectedCharges = [];
    state.selectedGuarantors = [];
    state.selectedSecurities = [];
    state.selectedDocuments = [];
    state.selectedTransactions = [];
    state.selectedStatement = [];
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
  SET_SELECTED_GUARANTORS(state, guarantors) {
    state.selectedGuarantors = guarantors;
  },
  SET_SELECTED_SECURITIES(state, securities) {
    state.selectedSecurities = securities;
  },
  SET_SELECTED_DOCUMENTS(state, documents) {
    state.selectedDocuments = documents;
  },
  LIST_APPLICATIONS(state, applications) {
    state.applicationsList = applications;
  },
  LIST__GUARANTEED_APPLICATIONS(state, applications) {
    state.grntApplicationsList = applications;
  },
  LIST_GUARANTEED_LOANS(state, applications) {
    state.grntLoansArr = applications;
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
  SET_APPLICATION_SECURITIES(state, securities){
    state.loanSecurities = securities
  },
  SET_APPLICATION_SCHEDULES(state, schedules){
    state.loanSchedules = schedules
  },
  SET_APPLICATION_DOCUMENTS(state, documents){
    state.loanDocuments = documents
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
  SET_LOAN_SECURITIES(state, securities){
    state.selectedSecurities = securities;
  },
  SET_LOAN_SCHEDULES(state, schedules){
    state.selectedSchedules = schedules;
  },
  SET_LOAN_DOCUMENTS(state, documents){
    state.selectedDocuments = documents;
  },
  SET_LOAN_TRANSACTIONS(state, transactions){
    state.selectedTransactions = transactions;
  },
  SET_LOAN_STATEMENT(state, statement){
    state.selectedStatement = statement;
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
  fetchGuaranteedLoans({ commit,state }, formData) {
    state.grntLoansArr = [];
    axios.post(`api/v1/get-loan-applications/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.grntLoansArr.push((response.data[i].loan_number + " - " + response.data[i].loan_product.product_name + " - " + response.data[i].member.member_name));
      }
      commit('LIST__GUARANTEED_APPLICATIONS', response.data);
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
        commit('SET_APPLICATION_SECURITIES',(response.data.loan_securities != null) ? (response.data.loan_securities) : []);
        commit('SET_APPLICATION_SCHEDULES',(response.data.loan_schedules != null) ? (response.data.loan_schedules) : []);
        commit('SET_APPLICATION_DOCUMENTS',(response.data.loan_documents != null) ? (response.data.loan_documents) : []);
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
        commit('SET_LOAN_SECURITIES',(response.data.loan_securities != null) ? (response.data.loan_securities) : []);
        commit('SET_LOAN_SCHEDULES',(response.data.loan_schedules != null) ? (response.data.loan_schedules) : []);
        commit('SET_LOAN_DOCUMENTS',(response.data.loan_documents != null) ? (response.data.loan_documents) : []);
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
  fetchLoanStatement({ commit,state }, formData){
    let txns = [];
    axios
    .post("api/v1/loan-statement-search/", formData)
    .then((response)=>{
        state.selectedStatement = response.data.results;
        let running_balance = 0;
        txns = response.data.results;

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
  fetchLoanGuarantors({ commit,state }, formData) {
    axios.post(`api/v1/get-loan-guarantors/`,formData)
    .then((response)=>{
        state.selectedGuarantors = response.data;
        commit('SET_SELECTED_GUARANTORS',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLoanSecurities({ commit,state }, formData) {
    axios.post(`api/v1/get-loan-securities/`,formData)
    .then((response)=>{
        state.selectedSecurities = response.data;
        commit('SET_SELECTED_SECURITIES',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLoanDocuments({ commit,state }, formData) {
    axios.post(`api/v1/get-loan-documents/`,formData)
    .then((response)=>{
        state.selectedDocuments = response.data;
        commit('SET_SELECTED_DOCUMENTS',response.data);
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
  async handleSelectedGuaranteedLoan({ commit, state }, option){
    const selectedApplication = state.grntApplicationsList.find(application => (application.loan_number + " - " +application.loan_product.product_name + " - " + application.member.member_name) === option);
    if (selectedApplication) {
      let formData = {
        loan_application_id: selectedApplication.loan_application_id,
        historical_loan_id: null,
      }
      return axios.post(`api/v1/fetch-guaranteed-loan-schedules/`,formData)
        .then((response)=>{
          return response;
        })
        .catch((error)=>{
          console.log(error.message);
          throw error;
        })
    }
    
      
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
      text: `Do you wish to delete Loan Application?`,
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
  
  