import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  productsList: [], 
  productArr: [],
  productArray: [],
  productID: '',
  productName: '',
  productMaxAmount: 0,
  installments: 0,
  loanCharges: [],
  chargesList: [], 
  chargeArr: [],
  chargeID: '',
  chargeName: '',
  selectedProduct: null,
  selectedInterestLedger: null,
  selectedCategory: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.productsList = [];
    state.productArr = [];
    state.productArray = [];
    state.productID = "";
    state.productName = "";
    state.productMaxAmount = 0;
    state.installments = 0;
    state.selectedProduct = null;
    state.selectedInterestLedger = null;
    state.selectedCategory = null;
    state.loanCharges = [];
    state.isEditing = false;
    state.chargeID = "";
    state.chargesList = [];
    state.chargeArr = [];
    state.chargeName = "";
  },
  SET_SELECTED_PRODUCT(state, product) {
    state.selectedProduct = product;
    state.isEditing = true;
  },
  LIST_PRODUCTS(state, products) {
    state.productsList = products;
  },
  LIST_CHARGES(state, charges) {
    state.chargesList = charges;
  },
  PRODUCTS_ARRAY(state, products){
    state.productArray = products;
  },
  SET_SELECTED_INTEREST_LEDGER(state, ledger) {
    state.selectedInterestLedger = ledger;
  },
  SET_SELECTED_CATEGORY(state, category) {
    state.selectedCategory = category;
  },
  SET_PRODUCT_CHARGES(state, charges){
    state.loanCharges = charges
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
  
  async createLoanProduct({ commit,state }, formData) {
    return axios.post('api/v1/create-loan-product/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchLoanProducts({ commit,state }, formData) {
    state.productArr = [];
    axios.post(`api/v1/get-loan-products/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.productArr.push((response.data[i].product_code + " - " + response.data[i].product_name));
      }
      commit('LIST_PRODUCTS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLoanProduct({ commit,state }, formData) {
    axios.post(`api/v1/get-loan-products/`,formData)
    .then((response)=>{
        state.selectedProduct = response.data;
        const selectedInterestLedger = response.data.interest_posting_account.ledger_code + " - " + response.data.interest_posting_account.ledger_name;
        const selectedCategory = (response.data.member_category != null) ? (response.data.member_category.category_name) : "";
        commit('SET_SELECTED_PRODUCT',response.data);
        commit('SET_SELECTED_CATEGORY',selectedCategory);
        commit('SET_SELECTED_INTEREST_LEDGER', selectedInterestLedger);
        commit('SET_PRODUCT_CHARGES',(response.data.loan_charges != null) ? (response.data.loan_charges) : []);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLoansCharges({ commit,state }, formData) {
    state.chargeArr = [];
    axios.post(`api/v1/get-loan-fees/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.chargeArr.push((response.data[i].fee_name));
      }
      commit('LIST_CHARGES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },

  fetchLoanProductCharges({ commit,state }, formData) {
    axios.post(`api/v1/get-loan-products/`,formData)
    .then((response)=>{
        commit('SET_PRODUCT_CHARGES',(response.data.loan_charges != null) ? (response.data.loan_charges) : []);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedProduct({ commit, state }, option){
    const selectedProduct = state.productsList.find(product => (product.product_code + " - " +product.product_name) === option);
    if (selectedProduct) {
        state.productID = selectedProduct.loan_product_id;
        state.productName = selectedProduct.product_name;
        state.productMaxAmount = selectedProduct.max_amount;
        state.installments = selectedProduct.max_repayment;
        state.productArray = [...state.productArray, selectedProduct];
    }
    commit('PRODUCTS_ARRAY', state.productArray);
      
  },
  
  handleSelectedCharge({ commit, state }, option){
    const selectedFee = state.chargesList.find(fee => (fee.fee_name) === option);
    if (selectedFee) {
        state.chargeID = selectedFee.loan_fee_id;
        state.chargeName = selectedFee.fee_name;
        selectedFee.member_loan_fee_id = null;
        state.loanCharges = [...state.loanCharges, selectedFee];
    }
    commit('SET_PRODUCT_CHARGES', state.loanCharges);
      
  },

  async updateLoanProduct({ commit,state }, formData) {
    return axios.put(`api/v1/update-loan-product/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteLoanProduct({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Loans Product?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Loans Product!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-loan-product/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Loans Product removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Loans Product",
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
        Swal.fire(`Loans Product has not been deleted!`);
      }
    })
  },
  removeLoanCharge({commit, state}, index){
    state.loanCharges.splice(index, 1); 
    commit('SET_PRODUCT_CHARGES', state.loanCharges);
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
  
  