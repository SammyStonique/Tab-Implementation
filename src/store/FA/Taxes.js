import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  taxesList: [], 
  taxArr: [],
  taxArray: [],
  taxID: '',
  taxName: '',
  name_search: '',
  selectedTax: null,
  selectedOutput: null,
  selectedInput: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.taxesList = [];
    state.taxArr = [];
    state.taxArray = [];
    state.taxID = '';
    state.taxName = '';
    state.name_search = '';
    state.selectedTax = null;
    state.selectedOutput = null;
    state.selectedInput = null;
    state.isEditing = false;
  },
  SET_SELECTED_TAX(state, tax) {
    state.selectedTax = tax;
    state.isEditing = true;
  },
  LIST_TAXES(state, taxes) {
    state.taxesList = taxes;
  },
  TAXES_ARRAY(state, taxes){
    state.taxArray = taxes;
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
  
  async createTax({ commit,state }, formData) {
    return axios.post('api/v1/create-tax/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchTaxes({ commit,state }, formData) {
    state.taxArr = [];
    axios.post(`api/v1/fetch-taxes/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.taxArr.push((response.data[i].tax_name + " - (" + response.data[i].tax_rate + ")"));
      }
      commit('LIST_TAXES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchTax({ commit,state }, formData) {
    axios.post(`api/v1/fetch-taxes/`,formData)
    .then((response)=>{
      state.selectedTax = response.data;
      commit('SET_SELECTED_TAX',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedTax({ commit, state }, option){
    state.taxArray = [];
    const selectedTax = state.taxesList.find(tax => (tax.tax_name + " - (" +tax.tax_rate + ")") === option);
    if (selectedTax) {
        state.taxID = selectedTax.tax_id;
        state.taxName = selectedTax.tax_name;
        state.taxArray = [...state.taxArray, selectedTax];
    }
    commit('TAXES_ARRAY', state.taxArray);
      
  },

  async updateTax({ commit,state }, formData) {
    return axios.put(`api/v1/update-tax/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteTax({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Tax?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Tax!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-tax/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Tax removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Tax",
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
        Swal.fire(`Tax has not been deleted!`);
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
  
  