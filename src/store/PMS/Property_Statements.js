import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  statementsList: [], 
  statementArr: [],
  statementArray: [],
  statementID: '',
  month_search: '',
  year_search: '',
  approval_status_search: '',
  statement_type_search: '',
  selectedStatement: null,
  isEditing: false,
  newSubHeaders: [],
  subHeaders: [],
  tableData: [],
  statementTransactions: [],
  statementInvoicedTotals: [],
  statementPaidTotals: [],
  statementBalanceTotals: 0,
  statementBfTotals: 0,
  invoicedSum: 0,
  paidSum: 0
};
  
const mutations = {
  initializeStore(state){
    state.statementsList = [];
    state.statementArr = [];
    state.statementArray = [];
    state.statementID = '';
    state.month_search = '';
    state.year_search = '';
    state.approval_status_search = '';
    state.statement_type_search = '';
    state.selectedStatement = null;
    state.isEditing = false;
    state.subHeaders = [];
    state.newSubHeaders = [];
    state.tableData = [];
    state.statementTransactions = [];
    state.statementInvoicedTotals = [];
    state.statementPaidTotals = [];
    state.statementBalanceTotals = 0;
    state.statementBfTotals = 0;
    state.invoicedSum = 0;
    state.paidSum = 0;
  },
  SET_SELECTED_STATEMENT(state, statement) {
    state.selectedStatement = statement;
    state.isEditing = true;
  },
  LIST_PROPERTY_STATEMENTS(state, statements) {
    state.statementsList = statements;
  },
  STATEMENTS_ARRAY(state, statements){
    state.statementArray = statements;
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
      if(key == 'month_search'){
        state.month_search = value;
      }else if(key == 'year_search'){
        state.year_search = value;
      }else if(key == 'approval_status_search'){
        state.approval_status_search = value;
      }else if(key == 'statement_type_search'){
        state.statement_type_search = value;
      } 
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.month_search = '';
    state.year_search = '';
    state.approval_status_search = '';
    state.statement_type_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createPropertyStatement({ commit,state }, formData) {
    return axios.post('api/v1/create-landlord-statement/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async processPropertyStatementPDF({ commit,state }, formData) {
    return axios.post('api/v1/process-landlord-statement-pdf/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async approvePropertyStatementPDF({ commit,state }, formData) {
    return axios.post('api/v1/approve-landlord-statement/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchPropertyStatements({ commit,state }, formData) {
    state.statementArr = [];
    await axios.post(`api/v1/get-landlord-statements/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.statementArr.push((response.data[i].property.name + " - " + response.data[i].statement_type + " - " +response.data[i].month + "/" + response.data[i].year))
      }
      commit('LIST_PROPERTY_STATEMENTS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchPropertyStatement({ commit,state }, formData) {
    axios.post(`api/v1/get-landlord-statements/`,formData)
    .then((response)=>{
      state.selectedStatement = response.data;
      commit('SET_SELECTED_STATEMENT',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchStatementData({ commit,state }, formData) {
    state.subHeaders = [];
    state.tableData = [];
    state.statementTransactions = [];
    state.statementInvoicedTotals = [];
    state.statementPaidTotals = [];
    state.statementBalanceTotals = 0;
    state.statementBfTotals = 0;
    state.invoicedSum = 0;
    state.paidSum = 0;
    axios.post(`api/v1/statement-processing-search/`,formData)
    .then((response)=>{
        let newArr = []
        for(let i=0; i<response.data.items.length; i++){
            if(response.data.items[i] == "Prepayment"){
              response.data.items[i] = "Prepymt"
            }else{
              newArr.push(response.data.items[i] )
            }
        }
        for(let i=0; i<response.data.invoicedTotals.length; i++){
            state.invoicedSum += response.data.invoicedTotals[i];
        }
        for(let i=0; i<response.data.paidTotals.length; i++){
            state.paidSum += response.data.paidTotals[i];
        }

        state.newSubHeaders = newArr;
        state.subHeaders = response.data.items;
        state.tableData = response.data.tableData;
        state.statementTransactions = response.data.statementTransactions;
        state.statementInvoicedTotals = response.data.invoicedTotals;
        state.statementPaidTotals = response.data.paidTotals;
        state.statementBalanceTotals = response.data.balanceTotals;
        state.statementBfTotals = response.data.balanceBF_totals;
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedStatement({ commit, state }, option){
    state.statementArray = [];
    const selectedStatement = state.landlordsList.find(landlord => (landlord.landlord_code + ' - ' + landlord.name) === option);
    if (selectedStatement) {
        state.statementID = selectedStatement.landlord_statement_id;
        state.statementArray = [...state.statementArray, selectedStatement];
    }
    commit('STATEMENTS_ARRAY', state.statementArray);
      
  },

  async updatePropertyStatement({ commit,state }, formData) {
    return axios.put(`api/v1/update-landlord-statement/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },
  approvePropertyStatement({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to approve Statement?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Approve Statement!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.put(`api/v1/update-landlord-statement/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Statement approved succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Approving Statement",
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
        Swal.fire(`Statement has not been approved!`);
      }
    })
  },

  deletePropertyStatement({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Statement(s)?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Statement(s)!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-landlord-statement/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Statement(s) removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Statement(s)",
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
        Swal.fire(`Statement(s) has not been deleted!`);
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
  
  