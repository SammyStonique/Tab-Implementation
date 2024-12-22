import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  deductionsList: [], 
  deductionArr: [],
  deductionArray: [],
  deductionID: '',
  deductionName: '',
  deduction_name_search: '',
  deduction_type_search: '',
  selectedDeduction: null,
  selectedLedger: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.deductionsList = [];
    state.deductionArr = [];
    state.deductionArray = [];
    state.deductionID = "";
    state.deductionName = "";
    state.deduction_name_search = '';
    state.deduction_type_search = '';
    state.selectedDeduction = null;
    state.selectedLedger = null;
    state.isEditing = false;
  },
  SET_SELECTED_DEDUCTION(state, deduction) {
    state.selectedDeduction = deduction;
    state.isEditing = true;
  },
  LIST_DEDUCTIONS(state, deductions) {
    state.deductionsList = deductions;
  },
  DEDUCTIONS_ARRAY(state, deductions){
    state.deductionArray = deductions;
  },
  SET_SELECTED_LEDGER(state, ledger) {
    state.selectedLedger = ledger;
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
      if(key == 'deduction_name_search'){
        state.deduction_name_search = value;
      }else if(key == 'deduction_type_search'){
        state.deduction_type_search = value;
      }
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.deduction_name_search = '';
    state.deduction_type_search = value;
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createDeduction({ commit,state }, formData) {
    return axios.post('api/v1/create-deduction/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchDeductions({ commit,state }, formData) {
    state.deductionArr = [];
    axios.post(`api/v1/get-deductions/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.deductionArr.push((response.data[i].deduction_name));
      }
      commit('LIST_DEDUCTIONS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchDeduction({ commit,state }, formData) {
    axios.post(`api/v1/get-deductions/`,formData)
    .then((response)=>{
      state.selectedDeduction = response.data;
      const selectedLedger = response.data.posting_account.ledger_code + " - " + response.data.posting_account.ledger_name;
      commit('SET_SELECTED_DEDUCTION',response.data);
      commit('SET_SELECTED_LEDGER', selectedLedger);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedDeduction({ commit, state }, option){
    state.deductionArray = [];
    const selectedDeduction = state.deductionsList.find(deduction => (deduction.deduction_name) === option);
    if (selectedDeduction) {
        state.deductionID = selectedDeduction.deduction_id;
        state.deductionName = selectedDeduction.deduction_name;
        state.deductionArray = [...state.deductionArray, selectedDeduction];
    }
    commit('DEDUCTIONS_ARRAY', state.deductionArray);
      
  },

  async updateDeduction({ commit,state }, formData) {
    return axios.put(`api/v1/update-deduction/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteDeduction({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Earning/Deduction?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Earning/Deduction!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-deduction/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Earning/Deduction removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Earning/Deduction",
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
        Swal.fire(`Earning/Deduction has not been deleted!`);
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
  
  