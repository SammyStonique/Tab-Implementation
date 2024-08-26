import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  depositsList: [], 
  depositArr: [],
  depositArray: [],
  depositID: '',
  depositName: '',
  name_search: '',
  selectedDeposit: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.depositsList = [];
    state.depositArr = [];
    state.depositArray = [];
    state.name_search = '';
    state.selectedDeposit = null;
    state.isEditing = false;
  },
  SET_SELECTED_DEPOSIT(state, deposit) {
    state.selectedDeposit = deposit;
    state.isEditing = true;
  },
  LIST_DEPOSITS(state, deposits) {
    state.depositsList , deposits;
  },
  DEPOSITS_ARRAY(state, deposits){
    state.depositArray = deposits;
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
  
  async createDeposit({ commit,state }, formData) {
    return axios.post('api/v1/create-security-deposit/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchDeposits({ commit,state }, formData) {
    state.depositArr = [];
    axios.post(`api/v1/get-security-deposits/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.depositArr.push((response.data[i].name));
      }
      commit('LIST_DEPOSITS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchDeposit({ commit,state }, formData) {
    axios.post(`api/v1/get-security-deposits/`,formData)
    .then((response)=>{
        commit('SET_SELECTED_DEPOSIT',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedDeposit({ commit, state }, option){
    state.depositArray = [];
    const selectedDeposit = state.depositsList.find(deposit => (deposit.name) === option);
    if (selectedDeposit) {
        state.depositID = selectedDeposit.deposit_id;
        state.depositName = selectedDeposit.name;
        state.depositArray = [...state.depositArray, selectedDeposit];
    }
    commit('DEPOSITS_ARRAY', state.depositArray);
      
  },

  async updateDeposit({ commit,state }, formData) {
    return axios.put(`api/v1/update-security-deposit/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteDeposit({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Deposit?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Deposit!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-security-deposit/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Deposit removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Deposit",
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
        Swal.fire(`Deposit has not been deleted!`);
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
  
  