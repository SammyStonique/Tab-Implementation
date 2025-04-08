import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  transfersList: [], 
  transferArr: [],
  transferArray: [],
  transferID: '',
  selectedTransfer: null,
  selectedAccountFrom: null,
  selectedAccountTo: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.transfersList = [];
    state.transferArr = [];
    state.transferArray = [];
    state.transferID = "";
    state.selectedTransfer = null;
    state.selectedAccountFrom = null;
    state.selectedAccountTo = null;
    state.isEditing = false;
  },
  SET_SELECTED_TRANSFER(state, transfer) {
    state.selectedTransfer = transfer;
    state.isEditing = true;
  },
  LIST_TRANSFERS(state, transfer) {
    state.transferList = transfer;
  },
  TRANSFERS_ARRAY(state, transfers){
    state.transferArray = transfers;
  },
  SET_SELECTED_ACCOUNT_FROM(state, account) {
    state.selectedAccountFrom = account;
  },
  SET_SELECTED_ACCOUNT_TO(state, account) {
    state.selectedAccountTo = account;
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
  
  async createSavingTransfer({ commit,state }, formData) {
    return axios.post('api/v1/create-saving-transfer/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchSavingTransfers({ commit,state }, formData) {
    state.transferArr = [];
    axios.post(`api/v1/get-saving-transfers/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.transferArr.push((response.data[i].saving_account_from.saving_account.account_number + "(" + response.data[i].saving_account_from.member.member_name + ") To" + response.data[i].saving_account_to.saving_account.account_number + "(" + response.data[i].saving_account_to.member.member_name + ")" ));
      }
      commit('LIST_TRANSFERS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchSavingTransfer({ commit,state }, formData) {
    axios.post(`api/v1/get-saving-transfers/`,formData)
    .then((response)=>{
      state.selectedTransfer = response.data;
      const selectedAccountFrom = response.data.saving_account_from.account_number + " - " + response.data.saving_account_from.saving_product.product_name;
      const selectedAccountTo = response.data.saving_account_to.account_number + " - " + response.data.saving_account_to.saving_product.product_name;
      commit('SET_SELECTED_TRANSFER',response.data);
      commit('SET_SELECTED_ACCOUNT_FROM', selectedAccountFrom);
      commit('SET_SELECTED_ACCOUNT_TO', selectedAccountTo);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedTransfer({ commit, state }, option){
    const selectedTransfer = state.transfersList.find(transfer => (transfer.saving_account_from.saving_account.account_number + "(" + transfer.saving_account_from.member.member_name + ") To" + transfer.saving_account_to.saving_account.account_number + "(" + transfer.saving_account_to.member.member_name + ")" ) === option);
    if (selectedTransfer) {
        state.transferID = selectedTransfer.saving_transfer_id;
        state.transferArray = [...state.transferArray, selectedTransfer];
    }
    commit('TRANSFERS_ARRAY', state.transferArray);
      
  },

  async updateSavingTransfer({ commit,state }, formData) {
    return axios.put(`api/v1/update-saving-transfer/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteSavingTransfer({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Saving Transfer?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Saving Transfer!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-saving-transfer/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Saving Transfer removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Saving Transfer",
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
        Swal.fire(`Saving Transfer has not been deleted!`);
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
  
  