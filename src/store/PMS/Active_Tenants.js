import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  tenantList: [], 
  tenantArr: [],
  tenantArray: [],
  tenantID: null,
  tenantUnitID: null,
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
  tenantLease: [],
  tenantDetails: [],
  tenantCurrency: [],
  tenantProperty: [],
  tenantVariations: [],
  tenantUnitsArr: [],
  tenantUnitsList: [],
  tenantUnitsArray: [],
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
    state.tenantLease = [];
    state.tenantDetails = [];
    state.tenantVariations = [];
    state.tenantUnitsList = [];
    state.tenantUnitsArr = [];
    state.tenantUnitsArray = [];
  },
  SET_SELECTED_TENANT(state, tenant) {
    state.selectedTenant = tenant;
    state.isEditing = true;
  },
  SET_RENT_SCHEDULES(state, schedules) {
    state.rentSchedules = schedules;
  },
  SET_TENANT_LEASE(state, tenant){
    state.tenantLease = tenant;
  },
  LIST_TENANT_UNITS(state, units){
    state.tenantUnitsList = units;
  },
  SET_TENANT_DETAILS(state, details){
    state.tenantDetails = details;
  },
  SET_TENANT_CURRENCY(state, currency){
    state.tenantCurrency = tenant;
  },
  SET_TENANT_PROPERTY(state, property){
    state.tenanatProperty = property;
  },
  SET_TENANT_VARIATIONS(state, variations){
    state.tenantVariations = variations
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

  async createTenantDeposit({ commit,state }, formData) {
    return axios.post('api/v1/create-tenant-deposit/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async createTenantUtility({ commit,state }, formData) {
    return axios.post('api/v1/create-tenant-utility/', formData)
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
  fetchTenantLease({ commit,state }, formData) {
    axios.post(`api/v1/get-tenant-leases/`,formData)
    .then((response)=>{
      commit('SET_TENANT_LEASE',response.data);
      commit('SET_TENANT_DETAILS',response.data.tenant);
      commit('SET_TENANT_CURRENCY',response.data.lease_currency);
      commit('SET_TENANT_PROPERTY',response.data.property);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchTenantUnits({ commit,state }, formData) {
    state.tenantUnitsArr = [];
    axios.post(`api/v1/get-tenant-units/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.tenantUnitsArr.push((response.data[i].unit.unit_number + ' - ' + response.data[i].tenant.tenant.tenant_name))
      }
      commit('LIST_TENANT_UNITS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchTenantVariations({ commit,state }, formData) {
    axios.post(`api/v1/get-rent-variations/`,formData)
    .then((response)=>{
      state.tenantVariations = response.data;
      commit('SET_TENANT_VARIATIONS',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  resetSchedules({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to Reset Schedules?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Reset Schedules!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/regenerate-rent-schedules/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Schedules Have Been Reset!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Resetting Schedules",
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
        Swal.fire(`Schedules have not been reset!`);
      }
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
  handleSelectedTenantUnit({ commit, state }, option){

    const selectedUnit = state.tenantUnitsList.find(unit => (unit.unit.unit_number + ' - ' + unit.tenant.tenant.tenant_name) === option);
    if (selectedUnit) {
        state.tenantUnitID = selectedUnit.tenant_unit_id;
        state.tenantID = selectedUnit.tenant.tenant.tenant_id;
        state.tenantUnitsArray = [...state.tenantUnitsArray, selectedUnit];
    }
      
  },
  fetchRentSchedules({ commit,state }, formData){
    state.rentSchedules = [];
    axios.post(`api/v1/get-rent-schedules/`,formData)
    .then((response)=>{
        commit('SET_RENT_SCHEDULES',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
  },
  bookRentInvoice({ commit,state }, formData){
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to book the rental invoice?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Book Invoice!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/book-rental-invoice/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Invoice Booked!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Booking Invoice",
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
        Swal.fire(`Invoice has not been booked!`);
      }
    })
  },
  cancelInvoiceBooking({ commit,state }, formData){
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to cancel the rental invoice?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Cancel Booking!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/cancel-rental-invoice/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Booking Canceled!", {
                icon: "success",
              }); 
          }else if(response.data.msg == "Paid"){
            Swal.fire({
              title: "Cannot Cancel Booking For Paid Invoice(s)",
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
        Swal.fire(`Invoice Booking has not been canceled!`);
      }
    })
  },
  bookDepositInvoice({ commit,state }, formData){
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to book the deposit invoice?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Book Invoice!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/book-tenant-deposit-invoice/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Invoice Booked!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Booking Invoice",
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
        Swal.fire(`Invoice has not been booked!`);
      }
    })
  },
  cancelDepositBooking({ commit,state }, formData){
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to cancel the deposit invoice?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Cancel Booking!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/cancel-tenant-deposit-invoice/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Booking Canceled!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Canceling Invoice",
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
        Swal.fire(`Deposit Invoice has not been canceled!`);
      }
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
  deleteTenantDeposit({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Deposit?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Deposit!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-tenant-deposit/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
            Swal.fire("Poof! Deposit removed succesfully!", {
              icon: "success",
            }); 
          }else if(response.data.msg == "Failed"){
            Swal.fire({
              title: "The Deposit Has An Invoice",
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
        Swal.fire(`Deposit has not been deleted!`);
      }
    })
  },
  deleteTenantUtility({ commit,state }, formData) {
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
        axios.post(`api/v1/delete-tenant-utility/`,formData)
        .then((response)=>{
            if(response.data.msg == "Success"){
              Swal.fire("Poof! Utility removed succesfully!", {
                icon: "success",
              }); 
          }else if(response.data.msg == "Failed"){
            Swal.fire({
              title: "The Utility Has An Invoice",
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
  async voidTenantUtility({ commit,state }, formData) {
    return axios.put(`api/v1/update-tenant-utility/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },
  activateTenantUtility({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to Activate Utility?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Activate Utility!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.put(`api/v1/update-tenant-utility/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Utility activated succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Activating Utility",
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
        Swal.fire(`Utility has not been activated!`);
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
  
  