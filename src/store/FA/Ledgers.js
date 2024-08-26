import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  ledgersList: [], 
  ledgerArr: [],
  ledgerArray: [],
  ledgerID: '',
  ledgerName: '',
  name_search: '',
  selectedCategory: null,
  selectedLedger: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.ledgersList = [];
    state.ledgerArr = [];
    state.ledgerArray = [];
    state.ledgerID = '';
    state.ledgerName = '';
    state.name_search = '';
    state.selectedCategory = null;
    state.selectedLedger = null;
    state.isEditing = false;
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
      }
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.name_search = '';
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
  fetchLedger({ commit,state }, formData) {
    axios.post(`api/v1/fetch-ledgers/`,formData)
    .then((response)=>{
      state.selectedLedger = response.data;
      commit('SET_SELECTED_LEDGER',response.data);
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
        state.ledgerName = selectedLedger.ledger_name;
        state.ledgerArray = [...state.ledgerArray, selectedLedger];
    }
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
          if(response.status == 200){
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
  
  