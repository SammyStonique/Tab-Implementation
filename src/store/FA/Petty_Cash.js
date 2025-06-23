import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  cashList: [], 
  cashArr: [],
  cashArray: [],
  cashDetails: [],
  cashID: '',
  cashName: '',
  cashLedger: '',
  availAmount: 0,
  selectedCash: null,
  selectedPettyCashID: "",
  selectedLedger: null,
  isEditing: false,
  subHeaders: [],
  tableData: [],
  itemCategoryTotals: [],
  debitTotals: 0,
  creditTotals: 0,
};
  
const mutations = {
  initializeStore(state){
    state.cashList = [];
    state.cashArr = [];
    state.cashArray = [];
    state.cashDetails = [];
    state.cashID = '';
    state.selectedPettyCashID = '';
    state.cashName = '';
    state.cashLedger = '';
    state.selectedCash = null;
    state.selectedLedger = null;
    state.availAmount = 0;
    state.isEditing = false;
    state.subHeaders = [];
    state.tableData = [];
    state.itemCategoryTotals = [];
    state.debitTotals = 0;
    state.creditTotals = 0;

  },
  SET_SELECTED_PETTY_CASH(state, Cash) {
    state.selectedCash = Cash;
    state.isEditing = true;
  },
  SET_SELECTED_LEDGER(state, ledger) {
    state.selectedLedger = ledger;
  },
  LIST_PETTY_CASH(state, cashs) {
    state.cashList = cashs;
  },
  PETTY_CASH_ARRAY(state, cashs){
    state.cashArray = cashs;
  },
  SET_PETTY_CASH_DETAILS(state, details){
    state.cashDetails = details;
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
  
  async createPettyCash({ commit,state }, formData) {
    return axios.post('api/v1/create-petty-cash/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchPettyCashes({ commit,state }, formData) {
    state.cashArr = [];
    axios.post(`api/v1/get-petty-cashs/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.cashArr.push((response.data[i].name + " - Available: " + response.data[i].formatted_available_amount));
      }
      commit('LIST_PETTY_CASH', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchPettyCash({ commit,state }, formData) {
    axios.post(`api/v1/get-petty-cashs/`,formData)
    .then((response)=>{
      state.selectedCash = response.data;
      const selectedLedger = (response.data.posting_account != null) ? (response.data.posting_account.ledger_code + " - " + response.data.posting_account.ledger_name) : "";
      commit('SET_SELECTED_LEDGER',selectedLedger);
      commit('SET_SELECTED_PETTY_CASH',response.data);
      commit('SET_PETTY_CASH_DETAILS',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchStatementData({ commit,state }, formData) {
      state.subHeaders = [];
      state.tableData = [];
      state.itemCategoryTotals = [];
      state.debitTotals = 0;
      state.creditTotals = 0;

      axios.post(`api/v1/petty-cash-statement-search/`,formData)
      .then((response)=>{
          let running_balance = 0;
          for(let i=0; i<response.data.tableData.length; i++){
              if(parseFloat(response.data.tableData[i].cash_in) > 0){
                running_balance += response.data.tableData[i].cash_in;
                response.data.tableData[i]['running_balance'] = Number(running_balance).toLocaleString();
                state.tableData.push(response.data.tableData[i])
              }else if(parseFloat(response.data.tableData[i].cash_out) > 0){
                running_balance -= response.data.tableData[i].cash_out;
                response.data.tableData[i]['running_balance'] = Number(running_balance).toLocaleString();
                state.tableData.push(response.data.tableData[i])
              }
          } 
          state.subHeaders = response.data.items;
          state.itemCategoryTotals = response.data.itemCategoryTotals;
          state.debitTotals = response.data.debitTotals;
          state.creditTotals = response.data.creditTotals;
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
  handleSelectedPettyCash({ commit, state }, option){
    state.cashArray = [];
    const selectedCash = state.cashList.find(cash => (cash.name + " - Available: " + cash.formatted_available_amount) === option);
    if (selectedCash) {
        state.cashID = selectedCash.petty_cash_id;
        state.cashName = selectedCash.name;
        state.availAmount = selectedCash.available_amount;
        state.cashLedger = selectedCash.posting_account;
        state.cashArray = [...state.cashArray, selectedCash];
    }
    commit('PETTY_CASH_ARRAY', state.CashArray);
      
  },

  async updatePettyCash({ commit,state }, formData) {
    return axios.put(`api/v1/update-petty-cash/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deletePettyCash({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Petty Cash?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Petty Cash!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-petty-cash/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Petty Cash removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Petty Cash",
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
        Swal.fire(`Petty Cash has not been deleted!`);
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
  
  