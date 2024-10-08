import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  vendorsList: [], 
  vendorArr: [],
  vendorArray: [],
  vendorDetails: [],
  vendorID: '',
  vendorName: '',
  vendorLedger: '',
  vendor_name_search: '',
  vendor_code_search: '',
  selectedVendor: null,
  selectedCategory: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.vendorsList = [];
    state.vendorArr = [];
    state.vendorArray = [];
    state.vendorDetails = [];
    state.vendorID = '';
    state.vendorName = '';
    state.vendorLedger = '';
    state.vendor_name_search = '';
    state.vendor_code_search = '';
    state.selectedVendor = null;
    state.selectedCategory = null;
    state.isEditing = false;
  },
  SET_SELECTED_VENDOR(state, vendor) {
    state.selectedVendor = vendor;
    state.isEditing = true;
  },
  SET_SELECTED_CATEGORY(state, category) {
    state.selectedCategory = category;
  },
  LIST_VENDORS(state, vendors) {
    state.vendorsList = vendors;
  },
  VENDORS_ARRAY(state, vendors){
    state.vendorArray = vendors;
  },
  SET_VENDOR_DETAILS(state, details){
    state.vendorDetails = details;
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
      if(key == 'vendor_code_search'){
        state.vendor_code_search = value;
      }else if(key == 'vendor_name_search'){
        state.vendor_name_search = value;
      }
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.vendor_code_search = '';
    state.vendor_name_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createVendor({ commit,state }, formData) {
    return axios.post('api/v1/create-vendor/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchVendors({ commit,state }, formData) {
    state.vendorArr = [];
    axios.post(`api/v1/fetch-vendors/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.vendorArr.push((response.data[i].vendor_code + " - " + response.data[i].vendor_name));
      }
      commit('LIST_VENDORS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchVendor({ commit,state }, formData) {
    axios.post(`api/v1/fetch-vendors/`,formData)
    .then((response)=>{
      state.selectedVendor = response.data;
      const selectedCategory = response.data.category.name;
      commit('SET_SELECTED_CATEGORY',selectedCategory);
      commit('SET_SELECTED_VENDOR',response.data);
      commit('SET_VENDOR_DETAILS',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedVendor({ commit, state }, option){
    state.vendorArray = [];
    const selectedVendor = state.vendorsList.find(vendor => (vendor.vendor_code + " - " +vendor.vendor_name) === option);
    if (selectedVendor) {
        state.vendorID = selectedVendor.vendor_id;
        state.vendorName = selectedVendor.vendor_name;
        state.vendorLedger = selectedVendor.ledger_id;
        state.vendorArray = [...state.vendorArray, selectedVendor];
    }
    commit('VENDORS_ARRAY', state.vendorArray);
      
  },

  async updateVendor({ commit,state }, formData) {
    return axios.put(`api/v1/update-vendor/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteVendor({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Vendor?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Vendor!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-vendor/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Vendor removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Vendor",
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
        Swal.fire(`Vendor has not been deleted!`);
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
  
  