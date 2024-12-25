import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  shifsList: [], 
  shifArr: [],
  shifArray: [],
  shifID: '',
  shifRegime: '',
  shif_regime_search: '',
  selectedShif: null,
  selectedLedger: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.shifsList = [];
    state.shifArr = [];
    state.shifArray = [];
    state.shifID = "";
    state.shifRegime = "";
    state.shif_regime_search = '';
    state.selectedShif = null;
    state.selectedLedger = null;
    state.isEditing = false;
  },
  SET_SELECTED_SHIF(state, shif) {
    state.selectedShif = shif;
    state.isEditing = true;
  },
  LIST_SHIFS(state, shifs) {
    state.shifsList = shifs;
  },
  SHIFS_ARRAY(state, shifs){
    state.shifArray = shifs;
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
    state.shif_regime_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createShif({ commit,state }, formData) {
    return axios.post('api/v1/create-shif/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchShifs({ commit,state }, formData) {
    state.shifArr = [];
    axios.post(`api/v1/get-shifs/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.shifArr.push((response.data[i].regime + " - " + response.data[i].date));
      }
      commit('LIST_SHIFS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchShif({ commit,state }, formData) {
    axios.post(`api/v1/get-shifs/`,formData)
    .then((response)=>{
      state.selectedShif = response.data;
      const selectedLedger = response.data.posting_account.ledger_code + " - " + response.data.posting_account.ledger_name;
      commit('SET_SELECTED_SHIf',response.data);
      commit('SET_SELECTED_LEDGER', selectedLedger);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedShif({ commit, state }, option){
    state.shifArray = [];
    const selectedShif = state.shifsList.find(shif => (shif.regime + " - " + shif.date) === option);
    if (selectedShif) {
        state.shifID = selectedShif.shif_id;
        state.shifRegime = selectedShif.regime;
        state.shifArray = [...state.shifArray, selectedShif];
    }
    commit('SHIFS_ARRAY', state.shifArray);
      
  },

  async updateShif({ commit,state }, formData) {
    return axios.put(`api/v1/update-shif/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteShif({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Shif?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Shif!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-shif/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Shif removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Shif",
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
        Swal.fire(`Shif has not been deleted!`);
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
  
  