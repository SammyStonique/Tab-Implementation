import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  transfersList: [], 
  transferArr: [],
  transferArray: [],
  transferID: '',
  transferCode: '',
  from_location_search: '',
  to_location_search: '',
  transfer_code_search: '',
  done_by_search: '',
  date_from_search: '',
  date_to_search: '',
  selectedTransfer: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.transfersList = [];
    state.transferArr = [];
    state.transferArray = [];
    state.transferID = '';
    state.transferCode = '';
    state.from_location_search = '';
    state.to_location_search = '';
    state.transfer_code_search = '';
    state.done_by_search = '';
    state.date_from_search = '';
    state.date_to_search = '';
    state.isEditing = false;
    state.selectedTransfer = null;
  },
  SET_SELECTED_TRANSFER(state, transfer) {
    state.selectedTransfer = transfer;
    state.isEditing = true;
  },
  LIST_TRANSFERS(state, transfers) {
    state.transfersList = transfers;
  },
  TRANSFERS_ARRAY(state, transfers){
    state.transferArray = transfers;
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
      if(key == 'from_location_search'){
        state.from_location_search = value;
      }else if(key == 'to_location_search'){
        state.to_location_search = value;
      }else if(key == 'transfer_code_search'){
        state.transfer_code_search = value;
      }else if(key == 'date_from_search'){
        state.date_from_search = value;
      }else if(key == 'date_to_search'){
        state.date_to_search = value;
      }else if(key == 'done_by_search'){
        state.done_by_search = value;
      }
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.from_location_search = '';
    state.to_location_search = '';
    state.transfer_code_search = '';
    state.date_from_search = '';
    state.date_to_search = '';
    state.done_by_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createStockTransfer({ commit,state }, formData) {
    return axios.post('api/v1/create-stock-transfer/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchStockTransfers({ commit,state }, formData) {
    state.transferArr = [];
    await axios.post(`api/v1/fetch-stock-transfers/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.transferArr.push((response.data[i].transfer_code))
      }
      commit('LIST_TRANSFERS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchStockTransfer({ commit,state }, formData) {
    axios.post(`api/v1/fetch-stock-transfers/`,formData)
    .then((response)=>{
      state.selectedTransfer = response.data;
      commit('SET_SELECTED_TRANSFER',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedTransfer({ commit, state }, option){
    state.transferArray = [];
    const selectedTransfer = state.transfersList.find(transfer => (transfer.transfer_code) === option);
    if (selectedTransfer) {
        state.transferID = selectedTransfer.transfer_id;
        state.transferCode = selectedTransfer.transfer_code;
        state.transferArray = [...state.transferArray, selectedTransfer];
    }
    commit('TRANSFERS_ARRAY', state.transferArray);
      
  },

  async updateStockTransfer({ commit,state }, formData) {
    return axios.put(`api/v1/update-stock-transfer/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteStockTransfer({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Stock Transfer?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Stock Transfer!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-stock-transfer/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Stock Transfer removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Recent Stock Transfer Detected",
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
        Swal.fire(`Stock Transfer has not been deleted!`);
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
  
  