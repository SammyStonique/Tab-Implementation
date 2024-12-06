import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  chargesList: [], 
  chargeArr: [],
  chargeArray: [],
  tenantCharges: [],
  chargeID: '',
  chargeName: '',
  name_search: '',
  selectedCharge: null,
  selectedLedger: null,
  exitChargesArray: [],
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.chargesList = [];
    state.chargeArr = [];
    state.chargeArray = [];
    state.tenantCharges = [];
    state.name_search = '';
    state.selectedCharge = null;
    state.selectedLedger = null;
    state.isEditing = false;
    state.exitChargesArray = [];
  },
  SET_SELECTED_CHARGE(state, charge) {
    state.selectedCharge = charge;
    state.isEditing = true;
  },
  SET_TENANT_CHARGES(state, charge) {
    state.tenantCharges = charge;
  },
  SET_SELECTED_LEDGER(state, ledger) {
    state.selectedLedger = ledger;
  },
  LIST_CHARGES(state, charges) {
    state.chargesList = charges;
  },
  CHARGES_ARRAY(state, charges){
    state.chargeArray = charges;
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
  
  async createExitCharge({ commit,state }, formData) {
    return axios.post('api/v1/create-exit-charge/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchExitCharges({ commit,state }, formData) {
    state.chargeArr = [];
    axios.post(`api/v1/get-exit-charges/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.chargeArr.push((response.data[i].name));
      }
      commit('LIST_CHARGES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchExitCharge({ commit,state }, formData) {
    axios.post(`api/v1/get-exit-charges/`,formData)
    .then((response)=>{
        const selectedLedger = response.data.posting_account.ledger_code + ' - '+ response.data.posting_account.ledger_name;
        commit('SET_SELECTED_LEDGER',selectedLedger);
        commit('SET_SELECTED_CHARGE',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchTenantCharges({ commit,state }, formData){
    axios.post(`api/v1/get-tenant-exit-charges/`,formData)
    .then((response)=>{
        commit('SET_TENANT_CHARGES',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
  },
  handleSelectedExitCharge({ commit, state }, option){
    const selectedCharge = state.chargesList.find(charge => (charge.name) === option);
    if (selectedCharge) {
        state.chargeID = selectedCharge.exit_charge_id;
        state.chargeName = selectedCharge.name;
        state.chargeArray = [...state.chargeArray, selectedCharge];
    }
    state.exitChargesArray.push(selectedCharge);
      
  },

  async updateExitCharge({ commit,state }, formData) {
    return axios.put(`api/v1/update-exit-charge/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteExitCharge({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Exit Charge?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Exit Charge!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-exit-charge/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Exit Charge removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Exit Charge",
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
        Swal.fire(`Exit Charge has not been deleted!`);
      }
    })
  },
  removeExitCharge({commit, state}, index){
    state.exitChargesArray.splice(index, 1); 
  },
};
  
const getters = {

};
  
export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
  
  