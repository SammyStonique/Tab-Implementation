import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  refundsList: [], 
  refundArr: [],
  refundArray: [],
  refundID: '',
  selectedRefund: null,
  selectedSale: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.refundsList = [];
    state.refundArr = [];
    state.refundArray = [];
    state.refundID = "";
    state.selectedRefund = null;
    state.selectedSale = null;
    state.isEditing = false;
  },
  SET_SELECTED_REFUND(state, refund) {
    state.selectedRefund = refund;
    state.isEditing = true;
  },
  LIST_REFUNDS(state, refund) {
    state.refundList = refund;
  },
  REFUNDS_ARRAY(state, refunds){
    state.refundArray = refunds;
  },
  SET_SELECTED_SALE(state, sale) {
    state.selectedSale = sale;
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
  
  async createSaleRefund({ commit,state }, formData) {
    return axios.post('api/v1/create-unit-sale-refund/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchSaleRefunds({ commit,state }, formData) {
    state.refundArr = [];
    axios.post(`api/v1/get-unit-sale-refunds/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.refundArr.push((response.data[i].asset_sale.customer.client_name + " (" + response.data[i].customer_from.client_code + ") - " + response.data[i].date));
      }
      commit('LIST_REFUNDS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchSaleRefund({ commit,state }, formData) {
    axios.post(`api/v1/get-unit-sale-refunds/`,formData)
    .then((response)=>{
      state.selectedRefund = response.data;
      const selectedSale = response.data.asset_sale.sale_code + ' - ' + response.data.asset_sale.customer.client_name + ' - ' + response.data.asset_sale.asset.name;
      commit('SET_SELECTED_REFUND',response.data);
      commit('SET_SELECTED_SALE', selectedSale);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedRefund({ commit, state }, option){
    const selectedRefund = state.refundsList.find(refund => (refund.customer_from.client_name + " (" + refund.customer_from.client_code + ") - " + refund.date) === option);
    if (selectedRefund) {
        state.refundID = selectedRefund.unit_sale_refund_id;
        state.refundArray = [...state.refundArray, selectedRefund];
    }
    commit('REFUNDS_ARRAY', state.refundArray);
      
  },

  async updateSaleRefund({ commit,state }, formData) {
    return axios.put(`api/v1/update-unit-sale-refund/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteSaleRefund({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Sale Refund?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Sale Refund!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-unit-sale-refund/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Sale Refund removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Sale Refund",
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
        Swal.fire(`Sale Refund has not been deleted!`);
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
  
  