import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  replenishList: [], 
  replenishArr: [],
  replenishArray: [],
  replenishID: '',
  replenishLedger: '',
  selectedReplenishment: null,
  selectedLedger: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.replenishList = [];
    state.replenishArr = [];
    state.replenishArray = [];
    state.replenishID = '';
    state.replenishLedger = '';
    state.selectedReplenishment = null;
    state.selectedLedger = null;
    state.isEditing = false;
  },
  SET_SELECTED_REPLENISHMENT(state, Replenishment) {
    state.selectedReplenishment = Replenishment;
    state.isEditing = true;
  },
  SET_SELECTED_LEDGER(state, ledger) {
    state.selectedLedger = ledger;
  },
  LIST_REPLENISHMENTS(state, Replenishments) {
    state.replenishList = Replenishments;
  },
  REPLENISHMENTS_ARRAY(state, Replenishments){
    state.replenishArray = Replenishments;
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
  
  async createReplenishment({ commit,state }, formData) {
    return axios.post('api/v1/create-petty-cash-replenishment/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchReplenishments({ commit,state }, formData) {
    state.replenishArr = [];
    axios.post(`api/v1/fetch-petty-cash-replenishments/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.replenishArr.push((response.data[i].petty_cash.name + " - " + response.data[i].date + "(" + response.data[i].amount + ")"));
      }
      commit('LIST_REPLENISHMENTS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchReplenishment({ commit,state }, formData) {
    axios.post(`api/v1/get-petty-cash-replenishments/`,formData)
    .then((response)=>{
      state.selectedReplenishment = response.data;
      const selectedLedger = (response.data.posting_account != null) ? (response.data.posting_account.ledger_code + " - " + response.data.posting_account.ledger_name) : "";
      commit('SET_SELECTED_LEDGER',selectedLedger);
      commit('SET_SELECTED_REPLENISHMENT',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedReplenishment({ commit, state }, option){
    state.replenishArray = [];
    const selectedReplenishment = state.replenishList.find(replenish => (replenish.petty_cash.name + " - " + replenish.date + "(" + replenish.amount + ")") === option);
    if (selectedReplenishment) {
        state.replenishID = selectedReplenishment.petty_cash_replenishment_id;
        state.replenishLedger = selectedReplenishment.posting_account;
        state.replenishArray = [...state.replenishtArray, selectedReplenishment];
    }
    commit('REPLENISHMENTS_ARRAY', state.ReplenishmentArray);
      
  },

  deleteReplenishment({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Replenishment?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Replenishment!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-petty-cash-replenishment/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Replenishment removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Replenishment",
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
        Swal.fire(`Replenishment has not been deleted!`);
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
  
  