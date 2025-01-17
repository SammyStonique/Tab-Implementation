import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  depositsList: [], 
  depositArr: [],
  depositArray: [],
  depositID: '',
  depositRef: '',
  selectedDeposit: null,
  selectedAccount: null,
  selectedLedger: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.depositsList = [];
    state.depositArr = [];
    state.depositArray = [];
    state.depositID = "";
    state.depositRef = "";
    state.selectedDeposit = null;
    state.selectedAccount = null;
    state.selectedLedger = null;
    state.isEditing = false;
  },
  SET_SELECTED_DEPOSIT(state, deposit) {
    state.selectedDeposit = deposit;
    state.isEditing = true;
  },
  LIST_DEPOSITS(state, deposit) {
    state.depositList = deposit;
  },
  DEPOSITS_ARRAY(state, deposits){
    state.depositArray = deposits;
  },
  SET_SELECTED_ACCOUNT(state, account) {
    state.selectedAccount = account;
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
  
  async createSavingDeposit({ commit,state }, formData) {
    return axios.post('api/v1/create-saving-deposit/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchSavingDeposits({ commit,state }, formData) {
    state.depositArr = [];
    axios.post(`api/v1/get-saving-deposits/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.depositArr.push((response.data[i].reference_no + " - " + response.data[i].saving_account.member.member_name));
      }
      commit('LIST_DEPOSITS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchSavingDeposit({ commit,state }, formData) {
    axios.post(`api/v1/get-saving-deposits/`,formData)
    .then((response)=>{
      state.selectedDeposit = response.data;
      const selectedAccount = response.data.saving_account.account_number + " - " + response.data.saving_account.saving_product.product_name;
      const selectedLedger = response.data.posting_account.ledger_code + " - " + response.data.posting_account.ledger_name;
      commit('SET_SELECTED_DEPOSIT',response.data);
      commit('SET_SELECTED_ACCOUNT', selectedAccount);
      commit('SET_SELECTED_LEDGER', selectedLedger);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedDeposit({ commit, state }, option){
    const selectedDeposit = state.depositsList.find(deposit => (deposit.reference_no + " - " +deposit.saving_account.member.member_name) === option);
    if (selectedDeposit) {
        state.depositID = selectedDeposit.saving_deposit_id;
        state.depositRef = selectedDeposit.reference_no;
        state.depositArray = [...state.depositArray, selectedDeposit];
    }
    commit('DEPOSITS_ARRAY', state.depositArray);
      
  },

  async updateSavingDeposit({ commit,state }, formData) {
    return axios.put(`api/v1/update-saving-deposit/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteSavingDeposit({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Saving Deposit?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Saving Deposit!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-saving-deposit/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Saving Deposit removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Saving Deposit",
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
        Swal.fire(`Saving Deposit has not been deleted!`);
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
  
  