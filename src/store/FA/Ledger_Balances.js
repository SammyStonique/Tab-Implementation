import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  balanceList: [], 
  balanceArr: [],
  balanceArray: [],
  balanceID: '',
  selectedBalance: null,
  selectedLedger: null,
  isEditing: false,
};
  
const mutations = {
  initializeStore(state){
    state.balanceList = [];
    state.balanceArr = [];
    state.balanceArray = [];
    state.balanceID = '';
    state.selectedBalance = null;
    state.selectedLedger = null;
    state.isEditing = false;

  },
  SET_SELECTED_BALANCE(state, balance) {
    state.selectedBalance = balance;
    state.isEditing = true;
  },
  SET_SELECTED_LEDGER(state, ledger) {
    state.selectedLedger = ledger;
  },
  LIST_LEDGER_BALANCES(state, balances) {
    state.balanceList = balances;
  },
  LEDGER_BALANCE_ARRAY(state, balances){
    state.balanceArray = balances;
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
  
  async createLedgerBalance({ commit,state }, formData) {
    return axios.post('api/v1/create-ledger-balance/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  deleteLedgerBalance({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Balance?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Balance!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-ledger-balance/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Balance removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Balance",
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
        Swal.fire(`Balance has not been deleted!`);
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
  
  