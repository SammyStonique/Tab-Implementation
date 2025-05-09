import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  feesList: [], 
  feeArr: [],
  saleFeeArr: [],
  purchaseFeeArr: [],
  feeArray: [],
  saleFeeArray: [],
  purchaseFeeArray: [],
  feeID: '',
  feeName: '',
  selectedFee: null,
  selectedLedger: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.feesList = [];
    state.feeArr = [];
    state.feeArray = [];
    state.feeID = "";
    state.feeName = "";
    state.selectedFee = null;
    state.selectedLedger = null;
    state.isEditing = false;
  },
  SET_SELECTED_FEE(state, fee) {
    state.selectedFee = fee;
    state.isEditing = true;
  },
  LIST_FEES(state, fees) {
    state.feesList = fees;
  },
  FEES_ARRAY(state, fees){
    state.feeArray = fees;
  },
  SALE_FEES_ARRAY(state, fees){
    state.saleFeeArray = fees;
  },
  PURCHASE_FEES_ARRAY(state, fees){
    state.purchaseFeeArray = fees;
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

  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createAssetFee({ commit,state }, formData) {
    return axios.post('api/v1/create-asset-fee/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchAssetFees({ commit,state }, formData) {
    state.feeArr = [];
    axios.post(`api/v1/get-asset-fees/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.feeArr.push((response.data[i].fee_name));
      }
      commit('LIST_FEES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchAssetSaleFees({ commit,state }, formData) {
    state.saleFeeArr = [];
    axios.post(`api/v1/get-asset-fees/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.saleFeeArr.push((response.data[i].fee_name));
      }
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchAssetPurchaseFees({ commit,state }, formData) {
    state.purchaseFeeArr = [];
    axios.post(`api/v1/get-asset-fees/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.purchaseFeeArr.push((response.data[i].fee_name));
      }
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchAssetFee({ commit,state }, formData) {
    axios.post(`api/v1/get-asset-fees/`,formData)
    .then((response)=>{
      state.selectedFee = response.data;
      const selectedLedger = response.data.posting_account.ledger_code + " - " + response.data.posting_account.ledger_name;
      commit('SET_SELECTED_FEE',response.data);
      commit('SET_SELECTED_LEDGER', selectedLedger);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedFee({ commit, state }, option){
    const selectedFee = state.feesList.find(fee => (fee.fee_name) === option);
    if (selectedFee) {
        state.feeID = selectedFee.asset_fee_id;
        state.feeName = selectedFee.fee_name;
        selectedFee.asset_fee_id = null;
        selectedFee.asset_asset_fee_id = null;
        state.feeArray = [...state.feeArray, selectedFee];
    }
    commit('FEES_ARRAY', state.feeArray);
      
  },
  handleSelectedSaleFee({ commit, state }, option){
    const selectedFee = state.feesList.find(fee => (fee.fee_name) === option);
    if (selectedFee) {
        state.feeID = selectedFee.asset_fee_id;
        state.feeName = selectedFee.fee_name;
        selectedFee.asset_asset_fee_id = null;
        state.saleFeeArray = [...state.saleFeeArray, selectedFee];
    }
    commit('SALE_FEES_ARRAY', state.saleFeeArray);
      
  },
  handleSelectedPurchaseFee({ commit, state }, option){
    const selectedFee = state.feesList.find(fee => (fee.fee_name) === option);
    if (selectedFee) {
        state.feeID = selectedFee.asset_fee_id;
        state.feeName = selectedFee.fee_name;
        selectedFee.asset_asset_fee_id = null;
        state.purchaseFeeArray = [...state.purchaseFeeArray, selectedFee];
    }
    commit('PURCHASE_FEES_ARRAY', state.purchaseFeeArray);
      
  },

  async updateAssetFee({ commit,state }, formData) {
    return axios.put(`api/v1/update-asset-fee/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteAssetFee({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Asset Fee?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Asset Fee!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-asset-fee/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Asset Fee removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Asset Fee",
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
        Swal.fire(`Asset Fee has not been deleted!`);
      }
    })
  },
  removeAssetFee({commit, state}, index){
    state.feeArray.splice(index, 1); 
    commit('FEES_ARRAY', state.feeArray);
  },
  removeAssetSaleFee({commit, state}, index){
    state.saleFeeArray.splice(index, 1); 
    commit('SALE_FEES_ARRAY', state.saleFeeArray);
  },
  removeAssetPurchaseFee({commit, state}, index){
    state.purchaseFeeArray.splice(index, 1); 
    commit('PURCHASE_FEES_ARRAY', state.purchaseFeeArray);
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
  
  