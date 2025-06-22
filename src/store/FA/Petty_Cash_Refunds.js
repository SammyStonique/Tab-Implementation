import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  refundList: [], 
  refundArr: [],
  refundArray: [],
  refundID: '',
  selectedRefund: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.refundList = [];
    state.refundArr = [];
    state.refundArray = [];
    state.refundID = '';
    state.selectedRefund = null;
    state.isEditing = false;
  },
  SET_SELECTED_REFUND(state, Refund) {
    state.selectedRefund = Refund;
    state.isEditing = true;
  },
  LIST_REFUNDS(state, Refunds) {
    state.refundList = Refunds;
  },
  REFUNDS_ARRAY(state, Refunds){
    state.refundArray = Refunds;
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
  
  async createPettyCashRefund({ commit,state }, formData) {
    return axios.post('api/v1/create-petty-cash-refund/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchPettyCashRefunds({ commit,state }, formData) {
    state.refundArr = [];
    axios.post(`api/v1/fetch-petty-cash-refunds/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.refundArr.push((response.data[i].voucher.voucher_no + " - " + response.data[i].amount));
      }
      commit('LIST_REFUNDS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchPettyCashRefund({ commit,state }, formData) {
    axios.post(`api/v1/get-petty-cash-refunds/`,formData)
    .then((response)=>{
      state.selectedRefund = response.data;
      commit('SET_SELECTED_REFUND',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedRefund({ commit, state }, option){
    state.refundArray = [];
    const selectedRefund = state.refundList.find(refund => (refund.voucher.voucher_no + " - " + refund.amount) === option);
    if (selectedRefund) {
        state.refundID = selectedRefund.petty_cash_refund_id;
        state.refundArray = [...state.refundArray, selectedRefund];
    }
    commit('REFUNDS_ARRAY', state.refundArray);
      
  },

  deletePettyCashRefund({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Refund?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Refund!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-petty-cash-refund/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Refund removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Refund",
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
        Swal.fire(`Refund has not been deleted!`);
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
  
  