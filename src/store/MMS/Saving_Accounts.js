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
  
  async createSavingAccount({ commit,state }, formData) {
    return axios.post('api/v1/create-saving-account/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchSavingAccounts({ commit,state }, formData) {
    state.accountArr = [];
    axios.post(`api/v1/get-saving-accounts/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.accountArr.push((response.data[i].account_number + " - " + response.data[i].member.member_name + " - " + response.data[i].saving_product.product_name + " - " + response.data[i].total_savings));
      }
      commit('LIST_ACCOUNTS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchSavingAccount({ commit,state }, formData) {
    axios.post(`api/v1/get-saving-accounts/`,formData)
    .then((response)=>{
      state.selectedAccount = response.data;
      const selectedMember = response.data.member.member_number + " - " + response.data.member.member_name;
      const selectedProduct = response.data.saving_product.product_code + " - " + response.data.saving_product.product_name;
      commit('SET_SELECTED_ACCOUNT',response.data);
      commit('SET_SELECTED_MEMBER', selectedMember);
      commit('SET_SELECTED_PRODUCT', selectedProduct);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedAccount({ commit, state }, option){
    const selectedAccount = state.accountsList.find(account => (account.account_number + " - " + account.member.member_name  + " - " + account.saving_product.product_name + " - " + account.total_savings) === option);
    if (selectedAccount) {
        state.accountID = selectedAccount.saving_account_id;
        state.accountNumber = selectedAccount.account_number;
        state.accountArray = [...state.accountArray, selectedAccount];
    }
    commit('ACCOUNTS_ARRAY', state.accountArray);
      
  },

  async updateSavingAccount({ commit,state }, formData) {
    return axios.put(`api/v1/update-saving-account/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteSavingAccount({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Saving Account?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Saving Account!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-saving-account/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Saving Account removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Saving Account",
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
        Swal.fire(`Saving Account has not been deleted!`);
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
  
  