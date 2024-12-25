import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  payesList: [], 
  payeArr: [],
  payeArray: [],
  payeID: '',
  payeRegime: '',
  paye_regime_search: '',
  selectedPaye: null,
  selectedLedger: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.payesList = [];
    state.payeArr = [];
    state.payeArray = [];
    state.payeID = "";
    state.payeRegime = "";
    state.paye_regime_search = '';
    state.selectedPaye = null;
    state.selectedLedger = null;
    state.isEditing = false;
  },
  SET_SELECTED_PAYE(state, paye) {
    state.selectedPaye = paye;
    state.isEditing = true;
  },
  LIST_PAYES(state, payes) {
    state.payesList = payes;
  },
  PAYES_ARRAY(state, payes){
    state.payeArray = payes;
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
    state.paye_name_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createPaye({ commit,state }, formData) {
    return axios.post('api/v1/create-paye/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },
  async createPayeBand({ commit,state }, formData) {
    return axios.post('api/v1/create-paye-band/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchPayes({ commit,state }, formData) {
    state.payeArr = [];
    axios.post(`api/v1/get-payes/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.payeArr.push((response.data[i].regime + " - " + response.data[i].date));
      }
      commit('LIST_PAYES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchPaye({ commit,state }, formData) {
    axios.post(`api/v1/get-payes/`,formData)
    .then((response)=>{
      state.selectedPaye = response.data;
      const selectedLedger = response.data.posting_account.ledger_code + " - " + response.data.posting_account.ledger_name;
      commit('SET_SELECTED_PAYE',response.data);
      commit('SET_SELECTED_LEDGER', selectedLedger);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedPaye({ commit, state }, option){
    state.payeArray = [];
    const selectedPaye = state.payesList.find(paye => (paye.regime + " - " + paye.date) === option);
    if (selectedPaye) {
        state.payeID = selectedPaye.paye_id;
        state.payeRegime = selectedPaye.regime;
        state.payeArray = [...state.payeArray, selectedPaye];
    }
    commit('PAYES_ARRAY', state.payeArray);
      
  },

  async updatePaye({ commit,state }, formData) {
    return axios.put(`api/v1/update-paye/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },
  async updatePayeBand({ commit,state }, formData) {
    return axios.put(`api/v1/update-paye-band/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deletePaye({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Paye?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Paye!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-paye/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Paye removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Paye",
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
        Swal.fire(`Paye has not been deleted!`);
      }
    })
  },
  deletePayeBand({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Paye Band?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Paye Band!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-paye-band/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Paye Band removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Paye Band",
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
        Swal.fire(`Paye Band has not been deleted!`);
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
  
  