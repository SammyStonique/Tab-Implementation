import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  nssfsList: [], 
  nssfArr: [],
  nssfArray: [],
  nssfID: '',
  nssfRegime: '',
  nssf_regime_search: '',
  selectedNssf: null,
  selectedLedger: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.nssfsList = [];
    state.nssfArr = [];
    state.nssfArray = [];
    state.nssfID = "";
    state.nssfRegime = "";
    state.nssf_regime_search = '';
    state.selectedNssf = null;
    state.selectedLedger = null;
    state.isEditing = false;
  },
  SET_SELECTED_NSSF(state, nssf) {
    state.selectedNssf = nssf;
    state.isEditing = true;
  },
  LIST_NSSFS(state, nssfs) {
    state.nssfsList = nssfs;
  },
  NSSFS_ARRAY(state, nssfs){
    state.nssfArray = nssfs;
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
    state.nssf_regime_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createNssf({ commit,state }, formData) {
    return axios.post('api/v1/create-nssf/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchNssfs({ commit,state }, formData) {
    state.nssfArr = [];
    axios.post(`api/v1/get-nssfs/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.nssfArr.push((response.data[i].regime + " - " + response.data[i].date));
      }
      commit('LIST_NSSFS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchNssf({ commit,state }, formData) {
    axios.post(`api/v1/get-nssfs/`,formData)
    .then((response)=>{
      state.selectedNssf = response.data;
      const selectedLedger = response.data.posting_account.ledger_code + " - " + response.data.posting_account.ledger_name;
      commit('SET_SELECTED_NSSF',response.data);
      commit('SET_SELECTED_LEDGER', selectedLedger);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedNssf({ commit, state }, option){
    state.nssfArray = [];
    const selectedNssf = state.nssfsList.find(nssf => (nssf.regime + " - " + nssf.date) === option);
    if (selectedNssf) {
        state.nssfID = selectedNssf.nssf_id;
        state.nssfRegime = selectedNssf.regime;
        state.nssfArray = [...state.nssfArray, selectedNssf];
    }
    commit('NSSFS_ARRAY', state.nssfArray);
      
  },

  async updateNssf({ commit,state }, formData) {
    return axios.put(`api/v1/update-nssf/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteNssf({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Nssf?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Nssf!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-nssf/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Nssf removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Nssf",
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
        Swal.fire(`Nssf has not been deleted!`);
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
  
  