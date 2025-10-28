import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  currenciesList: [], 
  currencyArr: [],
  currencyArray: [],
  currencyID: '',
  currencyName: '',
  name_search: '',
  selectedCurrency: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.currenciesList = [];
    state.currencyArr = [];
    state.currencyArray = [];
    state.currencyID = '';
    state.currencyName = '';
    state.name_search = '';
    state.selectedCurrency = null;
    state.isEditing = false;
  },
  SET_SELECTED_CURRENCY(state, currency) {
    state.selectedCurrency = currency;
    state.isEditing = true;
  },
  LIST_CURRENCIES(state, currencies) {
    state.currenciesList = currencies;
  },
  CURRENCIES_ARRAY(state, currencies){
    state.currencyArray = currencies;
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
      if(key == 'name_search'){
        state.name_search = value;
      }
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.name_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createCurrency({ commit,state }, formData) {
    return axios.post('api/v1/create-currency/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchCurrencies({ commit,state }, formData) {
    state.currencyArr = [];
    axios.post(`api/v1/get-currencies/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.currencyArr.push((response.data[i].code + " - " + response.data[i].name));
      }
      commit('LIST_CURRENCIES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchCurrency({ commit,state }, formData) {
    axios.post(`api/v1/get-currencies/`,formData)
    .then((response)=>{
      state.selectedCurrency = response.data;
      commit('SET_SELECTED_CURRENCY',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedCurrency({ commit, state }, option){
    state.currencyArray = [];
    const selectedCurrency = state.currenciesList.find(currency => (currency.code + " - " +currency.name) === option);
    if (selectedCurrency) {
        state.currencyID = selectedCurrency.currency_id;
        state.currencyName = selectedCurrency.name;
        state.currencyArray = [...state.currencyArray, selectedCurrency];
    }
    commit('CURRENCIES_ARRAY', state.currencyArray);
      
  },

  async updateCurrency({ commit,state }, formData) {
    return axios.put(`api/v1/update-currency/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteCurrency({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Currency?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Currency!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-currency/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Currency removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Currency",
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
        Swal.fire(`Currency has not been deleted!`);
      }
    })
  },
};
  
const getters = {
  getFormatedCurrency: (state) =>{
    return state.currenciesList.map((curr) => {
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
  
  