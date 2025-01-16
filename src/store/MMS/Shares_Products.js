import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  productsList: [], 
  productArr: [],
  productArray: [],
  productID: '',
  productName: '',
  selectedProduct: null,
  selectedDeclarationLedger: null,
  selectedWithholdingLedger: null,
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
    state.selectedProduct = null;
    state.selectedDeclarationLedger = null;
    state.selectedWithholdingLedger = null;
    state.selectedCategory = null;
    state.isEditing = false;
  },
  SET_SELECTED_PRODUCT(state, product) {
    state.selectedProduct = product;
    state.isEditing = true;
  },
  LIST_PRODUCTS(state, products) {
    state.productsList = products;
  },
  PRODUCTS_ARRAY(state, products){
    state.productArray = products;
  },
  SET_SELECTED_DECLARATION_LEDGER(state, ledger) {
    state.selectedDeclarationLedger = ledger;
  },
  SET_SELECTED_WITHHOLDING_LEDGER(state, ledger) {
    state.selectedWithholdingLedger = ledger;
  },
  SET_SELECTED_CATEGORY(state, category) {
    state.selectedCategory = category;
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
  
  async createSharesProduct({ commit,state }, formData) {
    return axios.post('api/v1/create-share-product/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchSharesProducts({ commit,state }, formData) {
    state.productArr = [];
    axios.post(`api/v1/get-share-products/`,formData)
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
  fetchSharesProduct({ commit,state }, formData) {
    axios.post(`api/v1/get-share-products/`,formData)
    .then((response)=>{
      state.selectedProduct = response.data;
      const selectedDeclarationLedger = response.data.declaration_posting_account.ledger_code + " - " + response.data.declaration_posting_account.ledger_name;
      const selectedWithholdingLedger = response.data.withholding_posting_account.ledger_code + " - " + response.data.withholding_posting_account.ledger_name;
      const selectedCategory = response.data.member_category.category_name;
      commit('SET_SELECTED_PRODUCT',response.data);
      commit('SET_SELECTED_CATEGORY',selectedCategory);
      commit('SET_SELECTED_DECLARATION_LEDGER', selectedDeclarationLedger);
      commit('SET_SELECTED_WITHHOLDING_LEDGER', selectedWithholdingLedger);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedProduct({ commit, state }, option){
    const selectedProduct = state.productsList.find(product => (product.product_code + " - " +product.product_name) === option);
    if (selectedProduct) {
        state.productID = selectedProduct.shares_product_id;
        state.productName = selectedProduct.product_name;
        state.productArray = [...state.productArray, selectedProduct];
    }
    commit('PRODUCTS_ARRAY', state.productArray);
      
  },

  async updateSharesProduct({ commit,state }, formData) {
    return axios.put(`api/v1/update-share-product/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteSharesProduct({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Shares Product?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Shares Product!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-share-product/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Shares Product removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Shares Product",
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
        Swal.fire(`Shares Product has not been deleted!`);
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
  
  