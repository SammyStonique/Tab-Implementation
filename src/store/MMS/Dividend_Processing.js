import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  processList: [], 
  processArr: [],
  processArray: [],
  processID: '',
  selectedProcess: null,
  selectedProduct: null,
  selectedPeriod: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.processList = [];
    state.processArr = [];
    state.processArray = [];
    state.processID = "";
    state.selectedProcess = null;
    state.selectedProduct = null;
    state.selectedPeriod = null;
    state.isEditing = false;
  },
  SET_SELECTED_PROCESS(state, process) {
    state.selectedProcess = process;
    state.isEditing = true;
  },
  LIST_PROCESSINGS(state, process) {
    state.processList = process;
  },
  PROCESS_ARRAY(state, process){
    state.processArray = process;
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
  
  async createDividendProcessing({ commit,state }, formData) {
    return axios.post('api/v1/create-dividend-processing/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchDividendProcessings({ commit,state }, formData) {
    state.processArr = [];
    axios.post(`api/v1/get-dividend-processings/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.processArr.push((response.data[i].share_product.product_name + " - " + response.data[i].fiscal_period.period_name + " (" + response.data[i].date + ")" ));
      }
      commit('LIST_PROCESSINGS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchDividendProcessing({ commit,state }, formData) {
    axios.post(`api/v1/get-dividend-processings/`,formData)
    .then((response)=>{
      state.selectedProcess = response.data;
      const selectedProduct = response.data.share_product.product_code + " - " + response.data.share_product.product_name;
      const selectedPeriod = response.data.fiscal_period.period_name;
      commit('SET_SELECTED_PROCESS',response.data);
      commit('SET_SELECTED_PRODUCT', selectedProduct);
      commit('SET_SELECTED_PERIOD', selectedPeriod);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedProcess({ commit, state }, option){
    const selectedProcess = state.processsList.find(process => (process.share_product.product_name + " - " + process.fiscal_period.period_name + " (" + process.date + ")" ) === option);
    if (selectedProcess) {
        state.processID = selectedProcess.dividend_processing_id;
        state.processArray = [...state.processArray, selectedProcess];
    }
    commit('PROCESS_ARRAY', state.ProcessArray);
      
  },

  async updateDividendProcessing({ commit,state }, formData) {
    return axios.put(`api/v1/update-dividend-processing/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteDividendProcessing({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Dividend Processing?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Dividend Processing!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-dividend-processing/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Dividend Processing removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Dividend Processing",
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
        Swal.fire(`Dividend Processing has not been deleted!`);
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
  
  