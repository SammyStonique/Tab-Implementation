import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  voucherList: [], 
  voucherArr: [],
  voucherArray: [],
  voucherID: '',
  voucherNo: '',
  selectedVoucher: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.voucherList = [];
    state.voucherArr = [];
    state.voucherArray = [];
    state.voucherID = '';
    state.voucherNo = '';
    state.selectedVoucher = null;
    state.isEditing = false;
  },
  SET_SELECTED_VOUCHER(state, Voucher) {
    state.selectedVoucher = Voucher;
    state.isEditing = true;
  },
  LIST_VOUCHERS(state, Vouchers) {
    state.voucherList = Vouchers;
  },
  VOUCHERS_ARRAY(state, Vouchers){
    state.voucherArray = Vouchers;
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
  
  async createPettyCashVoucher({ commit,state }, formData) {
    return axios.post('api/v1/create-petty-cash-voucher/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchPettyCashVouchers({ commit,state }, formData) {
    state.voucherArr = [];
    axios.post(`api/v1/get-petty-cash-vouchers/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.voucherArr.push((response.data[i].voucher_no + " - " + response.data[i].description + " - " + response.data[i].amount));
      }
      commit('LIST_VOUCHERS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchPettyCashVoucher({ commit,state }, formData) {
    axios.post(`api/v1/get-petty-cash-vouchers/`,formData)
    .then((response)=>{
      state.selectedVoucher = response.data;
      commit('SET_SELECTED_VOUCHER',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedVoucher({ commit, state }, option){
    state.voucherArray = [];
    const selectedVoucher = state.voucherList.find(voucher => (voucher.voucher_no + " - " + voucher.description + " - " + voucher.amount) === option);
    if (selectedVoucher) {
        state.voucherID = selectedVoucher.petty_cash_voucher_id;
        state.voucherNo = selectedVoucher.voucher_no;
        state.voucherArray = [...state.voucherArray, selectedVoucher];
    }
    commit('VOUCHERS_ARRAY', state.voucherArray);
      
  },

  deletePettyCashVoucher({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Voucher?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Voucher!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-petty-cash-voucher/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Voucher removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Voucher",
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
        Swal.fire(`Voucher has not been deleted!`);
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
  
  