import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  tenantList: [], 
  tenantArr: [],
  tenantArray: [],
  tenantID: '',
  tenantName: '',
  name_search: '',
  tenant_code_search: '',
  phone_number_search: '',
  unit_number_search: '',
  selectedTenant: null,
  selectedUnit: null,
  selectedProperty: null,
  selectedUtility: null,
  selectedDeposit: null,
  selectedCurrency: null,
  selectedVat: null,
  isEditing: false,
  rentSchedules: [],
  currentTab: "Tenant_Biodata"
};
  
const mutations = {
  initializeStore(state){
    state.tenantList = [];
    state.tenantArr = [];
    state.tenantArray = [];
    state.name_search = '';
    state.tenant_code_search = '';
    state.phone_number_search = '';
    state.unit_number_search = '';
    state.selectedTenant = null;
    state.selectedUnit = null;
    state.selectedProperty = null;
    state.selectedUtility = null;
    state.selectedDeposit = null;
    state.selectedCurrency = null;
    state.selectedVat = null;
    state.isEditing = false;
    state.rentSchedules = [];
  },
  SET_SELECTED_TENANT(state, tenant) {
    state.selectedTenant = tenant;
    state.isEditing = true;
  },
  SET_RENT_SCHEDULES(state, schedules) {
    state.rentSchedules = schedules;
  },
  LIST_TENANTS(state, tenants) {
    state.tenantList = tenants;
  },
  TENANTS_ARRAY(state, tenants){
    state.tenantArray = tenants;
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
      }else if(key == 'tenant_code_search'){
        state.tenant_code_search = value;
      }else if(key == 'unit_number_search'){
          state.unit_number_search = value;
      }else if(key == 'phone_number_search'){
          state.phone_number_search = value;
      }   
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.name_search = '';
    state.tenant_code_search = '';
    state.unit_number_search = '';
    state.phone_number_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createTenant({ commit,state }, formData) {
    return axios.post('api/v1/create-tenant/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchTenants({ commit,state }, formData) {
    state.tenantArr = [];
    axios.post(`api/v1/get-tenants/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.tenantArr.push((response.data[i].tenant_code + ' - ' + response.data[i].tenant_name))
      }
      commit('LIST_TENANTS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchTenant({ commit,state }, formData) {
    axios.post(`api/v1/get-tenants/`,formData)
    .then((response)=>{
      state.selectedTenant = response.data;
      commit('SET_SELECTED_TENANT',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedTenant({ commit, state }, option){
    state.tenantArray = [];
    const selectedTnt = state.tenantList.find(tenant => (tenant.tenant_code + ' - ' + tenant.tenant_name) === option);
    if (selectedTnt) {
        state.tenantID = selectedTnt.tenant_id;
        state.tenantName = selectedTnt.tenant_name;
        state.tenantArray = [...state.tenantArray, selectedTnt];
    }
    commit('TENANTS_ARRAY', state.tenantArray);
      
  },
  fetchRentSchedules({ commit,state }, formData){
    axios.post(`api/v1/get-rent-schedules/`,formData)
    .then((response)=>{
        commit('SET_RENT_SCHEDULES',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
  },

  async updateTenant({ commit,state }, formData) {
    return axios.put(`api/v1/update-tenant/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteTenant({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Tenant?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Tenant!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-tenant/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Tenant removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Tenant",
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
        Swal.fire(`Tenant has not been deleted!`);
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
  
  