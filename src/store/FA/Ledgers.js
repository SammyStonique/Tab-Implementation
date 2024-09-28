import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  ledgersList: [], 
  ledgerArr: [],
  incomeLedgerArr: [],
  expenseLedgerArr: [],
  cashbookLedgerArr: [],
  liabilityLedgerArr: [],
  ledgerDetails: [],
  ledgerArray: [],
  ledgerID: '',
  ledgerName: '',
  ledgerTitle: "",
  name_search: '',
  ledger_code_search: "",
  ledger_name_search: "",
  financial_statement_search: "",
  selectedCategory: null,
  selectedLedger: null,
  isEditing: false,
  journalsArray: [],
  jnlSortedArr: [],
  jnlArray: [],
  invoiceItemsArray: [],
  journalItemsArray: [],
};
  
const mutations = {
  initializeStore(state){
    state.ledgersList = [];
    state.ledgerArr = [];
    state.ledgerArray = [];
    state.ledgerDetails = [];
    state.invoiceItemsArray = [];
    state.journalItemsArray = [];
    state.ledgerID = '';
    state.ledgerName = '';
    state.ledgerTitle = '';
    state.name_search = '';
    state.selectedCategory = null;
    state.selectedLedger = null;
    state.isEditing = false;
    state.journalsArray = [];
    state.jnlSortedArr = [];
    state.jnlArray = [];
  },
  SET_SELECTED_LEDGER(state, ledger) {
    state.selectedLedger = ledger;
    state.isEditing = true;
  },
  LIST_LEDGERS(state, ledgers) {
    state.ledgersList = ledgers;
  },
  LEDGERS_ARRAY(state, ledgers){
    state.ledgerArray = ledgers;
  },
  SET_LEDGER_DETAILS(state, details){
    state.ledgerDetails = details;
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
      if(key == 'name_search'){
        state.name_search = value;
      }else if(key == 'ledger_code_search'){
        state.ledger_code_search = value;
      }else if(key == 'ledger_name_search'){
        state.ledger_name_search = value;
      }else if(key == 'financial_statement_search'){
        state.financial_statement_search = value;
      }
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.name_search = '';
    state.ledger_code_search = '';
    state.ledger_name_search = '';
    state.financial_statement_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createLedger({ commit,state }, formData) {
    return axios.post('api/v1/create-ledger/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },
  fetchClientJournals({ commit,state }, formData){
    state.journalsArray = [];
    axios
    .post("api/v1/ledger-journals-entries-search/", formData)
    .then((response)=>{
        state.jnlArray = [];
        let running_balance = 0;
        state.journalsArray = response.data.results;
        // state.ledgerTitle = response.data.result.ledger_code + " - " + response.data.result.ledger_name;
        state.jnlSortedArr = state.journalsArray.sort(function(a, b){
            // Convert the date strings to Date objects
            let dateA = new Date(a.date);
            let dateB = new Date(b.date);

            // Subtract the dates to get a value that is either negative, positive, or zero
            return dateA - dateB;
        })

        for(let i=0; i<state.journalsArray.length; i++){
            if(state.journalsArray[i].debit_amount != 0){
                running_balance += state.journalsArray[i].debit_amount;
                state.journalsArray[i]['running_balance'] = Number(running_balance).toLocaleString();
                state.jnlArray.push(state.journalsArray[i])
            }
            else if(state.journalsArray[i].credit_amount != 0){
                running_balance -= state.journalsArray[i].credit_amount;
                state.journalsArray[i]['running_balance'] = Number(running_balance).toLocaleString();
                state.jnlArray.push(state.journalsArray[i])
            }
        }
    })
    .catch((error)=>{
        console.log(error.message)
    })
    .finally(()=>{
    
    })
  },

  fetchLedgers({ commit,state }, formData) {
    state.ledgerArr = [];
    axios.post(`api/v1/fetch-ledgers/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.ledgerArr.push((response.data[i].ledger_code + " - " + response.data[i].ledger_name));
      }
      commit('LIST_LEDGERS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchIncomeLedgers({ commit,state }, formData) {
    state.incomeLedgerArr = [];
    axios.post(`api/v1/fetch-ledgers/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.incomeLedgerArr.push((response.data[i].ledger_code + " - " + response.data[i].ledger_name));
      }
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchExpenseLedgers({ commit,state }, formData) {
    state.expenseLedgerArr = [];
    axios.post(`api/v1/fetch-ledgers/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.expenseLedgerArr.push((response.data[i].ledger_code + " - " + response.data[i].ledger_name));
      }

    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchCashbookLedgers({ commit,state }, formData) {
    state.cashbookLedgerArr = [];
    axios.post(`api/v1/fetch-ledgers/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.cashbookLedgerArr.push((response.data[i].ledger_code + " - " + response.data[i].ledger_name));
      }
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLiabilityLedgers({ commit,state }, formData) {
    state.liabilityLedgerArr = [];
    axios.post(`api/v1/fetch-ledgers/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.liabilityLedgerArr.push((response.data[i].ledger_code + " - " + response.data[i].ledger_name));
      }
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLedger({ commit,state }, formData) {
    axios.post(`api/v1/fetch-ledgers/`,formData)
    .then((response)=>{
      state.selectedLedger = response.data;
      commit('SET_SELECTED_LEDGER',response.data);
      commit('SET_LEDGER_DETAILS',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },


  handleSelectedLedger({ commit, state }, option){
    state.ledgerArray = [];
    const selectedLedger = state.ledgersList.find(ledger => (ledger.ledger_code + " - " +ledger.ledger_name) === option);
    if (selectedLedger) {
        state.ledgerID = selectedLedger.ledger_id;
        state.ledgerName = selectedLedger.ledger_code + " - " + selectedLedger.ledger_name;
        selectedLedger.posting_account = selectedLedger.ledger_code + " - " + selectedLedger.ledger_name;
        selectedLedger.charge_type = "";
        selectedLedger.description = "";
        selectedLedger.cost = 0;
        selectedLedger.quantity = 1;
        selectedLedger.vat_rate = null;
        selectedLedger.vat_inclusivity = "Inclusive";
        selectedLedger.vat_amount = 0;
        selectedLedger.sub_total = 0;
        selectedLedger.total_amount = 0;
        state.ledgerArray = [...state.ledgerArray, selectedLedger];
    }
    state.invoiceItemsArray.push(selectedLedger);
    commit('LEDGERS_ARRAY', state.ledgerArray);
      
  },

  handleJournalLedger({ commit, state }, option){
    state.ledgerArray = [];
    const selectedLedger = state.ledgersList.find(ledger => (ledger.ledger_code + " - " +ledger.ledger_name) === option);
    if (selectedLedger) {
      state.ledgerID = selectedLedger.ledger_id;
      state.ledgerName = selectedLedger.ledger_code + " - " + selectedLedger.ledger_name;
      selectedLedger.posting_account = selectedLedger.ledger_code + " - " + selectedLedger.ledger_name;
      selectedLedger.debit_amount = 0;
      selectedLedger.credit_amount = 0;
      state.ledgerArray = [...state.ledgerArray, selectedLedger];
    }
    state.journalItemsArray.push(selectedLedger);
    commit('LEDGERS_ARRAY', state.ledgerArray);
      
  },

  async updateLedger({ commit,state }, formData) {
    return axios.put(`api/v1/update-ledger/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteLedger({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Ledger?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Ledger!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-ledger/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Ledger removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Ledger",
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
        Swal.fire(`Ledger has not been deleted!`);
      }
    })
  },
  removeInvoiceLine({commit, state}, index){
    state.invoiceItemsArray.splice(index, 1); 
  },
  removeJournalLine({commit, state}, index){
    state.journalItemsArray.splice(index, 1); 
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
  
  