import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  banksList: [], 
  bankArr: [],
  bankArray: [],
  bankID: '',
  bankName: '',
  name_search: '',
  selectedBank: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.banksList = [];
    state.bankArr = [];
    state.bankArray = [];
    state.bankID = '';
    state.bankName = '';
    state.name_search = '';
    state.selectedBank = null;
    state.isEditing = false;
  },
  SET_SELECTED_BANK(state, bank) {
    state.selectedBank = bank;
    state.isEditing = true;
  },
  LIST_BANKS(state, banks) {
    state.banksList = banks;
  },
  BANKS_ARRAY(state, banks){
    state.bankArray = banks;
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
  
  async createBank({ commit,state }, formData) {
    return axios.post('api/v1/create-bank/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchBanks({ commit,state }, formData) {
    state.bankArr = [];
    axios.post(`api/v1/get-banks/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.bankArr.push((response.data[i].bank_code + " - " + response.data[i].bank_name));
      }
      commit('LIST_BANKS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchBank({ commit,state }, formData) {
    axios.post(`api/v1/get-banks/`,formData)
    .then((response)=>{
      state.selectedBank = response.data;
      commit('SET_SELECTED_BANK',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedBank({ commit, state }, option){
    state.bankArray = [];
    const selectedBank = state.banksList.find(bank => (bank.bank_code + " - " +bank.bank_name) === option);
    if (selectedBank) {
        state.bankID = selectedBank.bank_id;
        state.bankName = selectedBank.bank_name;
        state.bankArray = [...state.bankArray, selectedBank];
    }
    commit('BANKS_ARRAY', state.bankArray);
      
  },

  async updateBank({ commit,state }, formData) {
    return axios.put(`api/v1/update-bank/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteBank({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Bank?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Bank!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-bank/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Bank removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Bank",
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
        Swal.fire(`Bank has not been deleted!`);
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
  
  