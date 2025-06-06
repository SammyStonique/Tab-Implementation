import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  accountsList: [], 
  accountArr: [],
  accountArray: [],
  accountID: '',
  accountNumber: '',
  selectedAccount: null,
  selectedMember: null,
  selectedProduct: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.accountsList = [];
    state.accountArr = [];
    state.accountArray = [];
    state.accountID = "";
    state.accountNumber = "";
    state.selectedAccount = null;
    state.selectedMember = null;
    state.selectedProduct = null;
    state.isEditing = false;
  },
  SET_SELECTED_ACCOUNT(state, account) {
    state.selectedAccount = account;
    state.isEditing = true;
  },
  LIST_ACCOUNTS(state, accounts) {
    state.accountsList = accounts;
  },
  ACCOUNTS_ARRAY(state, accounts){
    state.accountArray = accounts;
  },
  SET_SELECTED_MEMBER(state, member) {
    state.selectedMember = member;
  },
  SET_SELECTED_PRODUCT(state, product) {
    state.selectedProduct = product;
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
  
  async createShareAccount({ commit,state }, formData) {
    return axios.post('api/v1/create-share-account/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchShareAccounts({ commit,state }, formData) {
    state.accountArr = [];
    axios.post(`api/v1/get-share-accounts/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.accountArr.push((response.data[i].account_number + " - " + response.data[i].member.member_name + " - " + response.data[i].share_product.product_name + " - " + response.data[i].total_shares));
      }
      commit('LIST_ACCOUNTS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchShareAccount({ commit,state }, formData) {
    axios.post(`api/v1/get-share-accounts/`,formData)
    .then((response)=>{
      state.selectedAccount = response.data;
      const selectedMember = response.data.member.member_number + " - " + response.data.member.member_name;
      const selectedProduct = response.data.share_product.product_code + " - " + response.data.share_product.product_name;
      commit('SET_SELECTED_ACCOUNT',response.data);
      commit('SET_SELECTED_MEMBER', selectedMember);
      commit('SET_SELECTED_PRODUCT', selectedProduct);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedAccount({ commit, state }, option){
    const selectedAccount = state.accountsList.find(account => (account.account_number + " - " +account.member.member_name+ " - " + account.share_product.product_name + " - " + account.total_shares) === option);
    if (selectedAccount) {
        state.accountID = selectedAccount.share_account_id;
        state.accountNumber = selectedAccount.account_number;
        state.accountArray = [...state.accountArray, selectedAccount];
    }
    commit('ACCOUNTS_ARRAY', state.accountArray);
      
  },

  async updateShareAccount({ commit,state }, formData) {
    return axios.put(`api/v1/update-share-account/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteShareAccount({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Share Account?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Share Account!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-share-account/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Share Account removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Share Account",
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
        Swal.fire(`Share Account has not been deleted!`);
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
  
  