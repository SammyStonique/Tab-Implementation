import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  utilitiesList: [], 
  utilityArr: [],
  utilityArray: [],
  tenantUtilities: [],
  utilityID: '',
  utilityNumber: '',
  company_id: '',
  name_search: '',
  selectedUtility: null,
  selectedLedger: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.utilitiesList = [];
    state.utilityArr = [];
    state.utilityArray = [];
    state.tenantUtilities = [];
    state.company_id = '';
    state.name_search = '';
    state.selectedUtility = null;
    state.selectedLedger = null;
    state.isEditing = false;
  },
  SET_SELECTED_UTILITY(state, utility) {
    state.selectedUtility = utility;
    state.isEditing = true;
  },
  SET_TENANT_UTILITIES(state, utility) {
    state.tenantUtilities = utility;
  },
  SET_SELECTED_LEDGER(state, ledger) {
    state.selectedLedger = ledger;
  },
  LIST_UTILITIES(state, utilities) {
    state.utilitiesList = utilities;
  },
  UTILITIES_ARRAY(state, utilities){
    state.utilityArray = utilities;
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
  
  async createUtility({ commit,state }, formData) {
    return axios.post('api/v1/create-utility/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchUtilities({ commit,state }, formData) {
    state.utilityArr = [];
    axios.post(`api/v1/get-utilities/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.utilityArr.push((response.data[i].name));
      }
      commit('LIST_UTILITIES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchUtility({ commit,state }, formData) {
    axios.post(`api/v1/get-utilities/`,formData)
    .then((response)=>{
        const selectedLedger = response.data.posting_account.ledger_code + ' - '+ response.data.posting_account.ledger_name;
        commit('SET_SELECTED_LEDGER',selectedLedger);
        commit('SET_SELECTED_UTILITY',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchTenantUtilities({ commit,state }, formData){
    axios.post(`api/v1/get-tenant-utilities/`,formData)
    .then((response)=>{
        commit('SET_TENANT_UTILITIES',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
  },
  handleSelectedUtility({ commit, state }, option){
    const selectedUtility = state.utilitiesList.find(utility => (utility.name) === option);
    if (selectedUtility) {
        state.utilityID = selectedUtility.utility_id;
        state.utilityName = selectedUtility.name;
        selectedUtility.options = [{ text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'Rent Percentage', value: 'Rent Percentage' }, { text: 'Billed On Use', value: 'Billed On Use' }];
        state.utilityArray = [...state.utilityArray, selectedUtility];
    }
    commit('UTILITIES_ARRAY', state.utilityArray);
      
  },

  async updateUtility({ commit,state }, formData) {
    return axios.put(`api/v1/update-utility/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteUtility({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Utility?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Utility!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-utility/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Utility removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Utility",
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
        Swal.fire(`Utility has not been deleted!`);
      }
    })
  },
  removeUtility({commit, state}, index){
    state.utilityArray.splice(index, 1); 
  },
};
  
const getters = {
  getFormatedUtilities: (state) =>{
    const formattedUtilities = state.utilitiesList.map((utility) => {
      return {
        text: utility.name,
        value: utility.utility_id,
      };
    });
    const additionalOptions = [
      { text: "Rent", value: "Rent" },
      { text: "Deposit", value: "Deposit" },
      { text: "Penalty", value: "Penalty" },
      { text: "Other", value: "Other" },
    ]
    return [...additionalOptions , ...formattedUtilities];
  },
};
  
export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
  
  