import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  ratesList: [], 
  rateArr: [],
  rateArray: [],
  rateID: '',
  selectedRate: null,
  selectedBaseCurrency: null,
  selectedTargetCurrency: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.ratesList = [];
    state.rateArr = [];
    state.rateArray = [];
    state.rateID = '';
    state.selectedRate = null;
    state.selectedBaseCurrency = null;
    state.selectedTargetCurrency = null;
    state.isEditing = false;
  },
  SET_SELECTED_RATE(state, rate) {
    state.selectedRate = rate;
    state.isEditing = true;
  },
  SET_SELECTED_BASE_CURRENCY(state, currency) {
    state.selectedBaseCurrency = currency;
  },
  SET_SELECTED_TARGET_CURRENCY(state, currency) {
    state.selectedTargetCurrency = currency;
  },
  LIST_RATES(state, rates) {
    state.ratesList = rates;
  },
  RATES_ARRAY(state, rates){
    state.rateArray = rates;
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
  
  async createExchangeRate({ commit,state }, formData) {
    return axios.post('api/v1/create-exchange-rate/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchExchangeRates({ commit,state }, formData) {
    state.rateArr = [];
    axios.post(`api/v1/get-exchange-rates/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.rateArr.push((response.data[i].from_currency.name + " - " + response.data[i].to_currency.name));
      }
      commit('LIST_RATES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchExchangeRate({ commit,state }, formData) {
    axios.post(`api/v1/get-exchange-rates/`,formData)
    .then((response)=>{
      state.selectedRate = response.data;
      const selectedBase = (response.data.from_currency.code + " - " + response.data.from_currency.name);
      const selectedTarget = (response.data.to_currency.code + " - " + response.data.to_currency.name);
      commit('SET_SELECTED_BASE_CURRENCY',selectedBase);
      commit('SET_SELECTED_TARGET_CURRENCY',selectedTarget);
      commit('SET_SELECTED_RATE',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedRate({ commit, state }, option){
    state.rateArray = [];
    const selectedRate = state.ratesList.find(rate => (rate.from_currency.name + " - " +rate.to_currency.name) === option);
    if (selectedRate) {
        state.rateID = selectedRate.exchange_rate_id;
        state.rateArray = [...state.rateArray, selectedRate];
    }
    commit('RATES_ARRAY', state.rateArray);
      
  },

  async updateExchangeRate({ commit,state }, formData) {
    return axios.put(`api/v1/update-exchange-rate/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteExchangeRate({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Rate?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Rate!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-exchange-rate/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Rate removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Rate",
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
        Swal.fire(`Rate has not been deleted!`);
      }
    })
  },
};
  
const getters = {
  getFormatedRate: (state) =>{
    return state.ratesList.map((curr) => {
      return {
        text: curr.code + " - " +curr.name,
        value: curr,
      };
    });
  },
};
  
export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
  
  