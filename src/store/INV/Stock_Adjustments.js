import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  adjustmentsList: [], 
  adjustmentArr: [],
  adjustmentArray: [],
  adjustmentID: '',
  adjustmentCode: '',
  warehouse_search: '',
  adjustment_code_search: '',
  date_from_search: '',
  date_to_search: '',
  done_by_search: '',
  selectedAdjustment: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.adjustmentsList = [];
    state.adjustmentArr = [];
    state.adjustmentArray = [];
    state.adjustmentID = '';
    state.adjustmentCode = '';
    state.warehouse_search = '';
    state.adjustment_code_search = '';
    state.date_from_search = '';
    state.date_to_search = '';
    state.done_by_search = '';
    state.isEditing = false;
    state.selectedAdjustment = null;
  },
  SET_SELECTED_ADJUSTMENT(state, adjustment) {
    state.selectedAdjustment = adjustment;
    state.isEditing = true;
  },
  LIST_ADJUSTMENTS(state, adjustments) {
    state.adjustmentsList = adjustments;
  },
  ADJUSTMENTS_ARRAY(state, adjustments){
    state.adjustmentArray = adjustments;
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
      if(key == 'warehouse_search'){
        state.warehouse_search = value;
      }else if(key == 'adjustment_code_search'){
        state.adjustment_code_search = value;
      }else if(key == 'date_from_search'){
        state.date_from_search = value;
      }else if(key == 'date_to_search'){
        state.date_to_search = value;
      }else if(key == 'done_by_search'){
        state.done_by_search = value;
      }
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.warehouse_search = '';
    state.adjustment_code_search = '';
    state.date_from_search = '';
    state.date_to_search = '';
    state.done_by_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createStockAdjustment({ commit,state }, formData) {
    return axios.post('api/v1/create-stock-adjustment/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchStockAdjustments({ commit,state }, formData) {
    state.adjustmentArr = [];
    await axios.post(`api/v1/fetch-stock-adjustments/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.adjustmentArr.push((response.data[i].adjustment_code))
      }
      commit('LIST_ADJUSTMENTS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchStockAdjustment({ commit,state }, formData) {
    axios.post(`api/v1/fetch-stock-adjustments/`,formData)
    .then((response)=>{
      state.selectedAdjustment = response.data;
      commit('SET_SELECTED_ADJUSTMENT',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedAdjustment({ commit, state }, option){
    state.adjustmentArray = [];
    const selectedAdjustment = state.adjustmentsList.find(adjustment => (adjustment.adjustment_code) === option);
    if (selectedAdjustment) {
        state.adjustmentID = selectedAdjustment.adjustment_id;
        state.adjustmentCode = selectedAdjustment.adjustment_code;
        state.adjustmentArray = [...state.adjustmentArray, selectedAdjustment];
    }
    commit('ADJUSTMENTS_ARRAY', state.adjustmentArray);
      
  },

  async updateStockAdjustment({ commit,state }, formData) {
    return axios.put(`api/v1/update-stock-adjustment/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteStockAdjustment({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Stock Adjustment?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Stock Adjustment!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-stock-adjustment/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Stock Adjustment removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Recent Stock Adjustment Detected",
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
        Swal.fire(`Stock Adjustment has not been deleted!`);
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
  
  