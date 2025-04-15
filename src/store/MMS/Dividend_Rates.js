import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  ratesList: [], 
  rateArr: [],
  rateArray: [],
  rateID: '',
  selectedRate: null,
  selectedProduct: null,
  selectedPeriod: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.ratesList = [];
    state.rateArr = [];
    state.rateArray = [];
    state.rateID = "";
    state.selectedRate = null;
    state.selectedProduct = null;
    state.selectedPeriod = null;
    state.isEditing = false;
  },
  SET_SELECTED_RATE(state, rate) {
    state.selectedRate = rate;
    state.isEditing = true;
  },
  LIST_RATES(state, rate) {
    state.ratesList = rate;
  },
  RATES_ARRAY(state, rates){
    state.rateArray = rates;
  },
  SET_SELECTED_PRODUCT(state, product) {
    state.selectedProduct = product;
  },
  SET_SELECTED_PERIOD(state, period) {
    state.selectedPeriod = period;
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
  
  async createDividendRate({ commit,state }, formData) {
    return axios.post('api/v1/create-dividend-rate/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchDividendRates({ commit,state }, formData) {
    state.rateArr = [];
    axios.post(`api/v1/get-dividend-rates/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.rateArr.push((response.data[i].share_product.product_name + " - " + response.data[i].fiscal_period.period_name + " (" + response.data[i].dividend_rate + ")" ));
      }
      commit('LIST_RATES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchDividendRate({ commit,state }, formData) {
    axios.post(`api/v1/get-dividend-rates/`,formData)
    .then((response)=>{
      state.selectedRate = response.data;
      const selectedProduct = response.data.share_product.product_code + " - " + response.data.share_product.product_name;
      const selectedPeriod = response.data.fiscal_period.period_name;
      commit('SET_SELECTED_RATE',response.data);
      commit('SET_SELECTED_PRODUCT', selectedProduct);
      commit('SET_SELECTED_PERIOD', selectedPeriod);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedRate({ commit, state }, option){
    const selectedRate = state.ratesList.find(rate => (rate.share_product.product_name + " - " + rate.fiscal_period.period_name + " (" + rate.dividend_rate + ")" ) === option);
    if (selectedRate) {
        state.rateID = selectedRate.dividend_rate_id;
        state.rateArray = [...state.rateArray, selectedRate];
    }
    commit('RATES_ARRAY', state.rateArray);
      
  },

  async updateDividendRate({ commit,state }, formData) {
    return axios.put(`api/v1/update-dividend-rate/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteDividendRate({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Dividend Rate?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Dividend Rate!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-dividend-rate/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Dividend Rate removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Dividend Rate",
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
        Swal.fire(`Dividend Rate has not been deleted!`);
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
  
  