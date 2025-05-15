import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  feesList: [], 
  feeArr: [],
  feeArray: [],
  feeID: '',
  feeName: "",
  saleCode: "",
  clientName: "",
  selectedFee: null,
  selectedSale: null,
  selectedSaleFee: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.feesList = [];
    state.feeArr = [];
    state.feeArray = [];
    state.feeID = "";
    state.feeName = "";
    state.saleCode = "";
    state.clientName = "";
    state.selectedFee = null;
    state.selectedSale = null;
    state.selectedSaleFee = null;
    state.isEditing = false;
  },
  SET_SELECTED_FEES(state, fee) {
    state.selectedFee = fee;
    state.isEditing = true;
  },
  LIST_FEES(state, fees) {
    state.feesList = fees;
  },
  FEES_ARRAY(state, fees){
    state.feeArray = fees;
  },
  SET_SELECTED_SALE(state, sale) {
    state.selectedSale = sale;
  },
  SET_SELECTED_SALE_FEES(state, fee) {
    state.selectedSaleFee = fee;
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
  
  async createSaleFee({ commit,state }, formData) {
    return axios.post('api/v1/create-asset-sale-fee/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchSaleFees({ commit,state }, formData) {
    state.feeArr = [];
    axios.post(`api/v1/get-asset-sale-fees/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.feeArr.push((response.data[i].asset_sale.sale_code + " - " + response.data[i].asset_fee.fee_name + " - " + response.data[i].amount));
      }
      commit('LIST_FEES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchSaleFee({ commit,state }, formData) {
    axios.post(`api/v1/get-asset-sale-fees/`,formData)
    .then((response)=>{
      state.selectedFee = response.data;
      const selectedSale = response.data.asset_sale.sale_code + " - " + response.data[i].customer.client_name + " - " + response.data[i].asset.name;
      const selectedSaleFee = response.data.asset_fee.fee_name;
      commit('SET_SELECTED_FEE',response.data);
      commit('SET_SELECTED_SALE', selectedSale);
      commit('SET_SELECTED_SALE_FEES', selectedSaleFee);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedFee({ commit, state }, option){
    const selectedFee = state.feesList.find(fee => (fee.asset_sale.sale_code + " - " + fee.asset_fee.fee_name + " - " + fee.amount) === option);
    if (selectedFee) {
        state.feeID = selectedFee.asset_sale_fee_id;
        state.feeName = selectedFee.asset_fee.fee_name;
        state.saleCode = selectedFee.asset_sale.sale_code;
        state.clientName = selectedFee.asset_sale.customer.client_name;
        state.feeArray = [...state.feeArray, selectedFee];
    }
    commit('FEES_ARRAY', state.feeArray);
      
  },

  async updateSaleFee({ commit,state }, formData) {
    return axios.put(`api/v1/update-asset-sale-fee/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteSaleFee({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Sale Fee?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Sale Fee!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-asset-sale-fee/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Sale Fee removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Sale Fee",
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
        Swal.fire(`Sale Fee has not been deleted!`);
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
  
  