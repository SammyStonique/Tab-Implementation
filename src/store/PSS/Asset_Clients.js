import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  customersList: [], 
  customerArr: [],
  customerArray: [],
  customerDetails: [],
  customerID: '',
  customerName: '',
  customerPhoneNo: '',
  customerEmail: '',
  customerIdNo: '',
  selectedCustomer: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.customersList = [];
    state.customerArr = [];
    state.customerArray = [];
    state.customerDetails = [];
    state.customerID = '';
    state.customerName = '';
    state.customerPhoneNo = '';
    state.customerEmail = '';
    state.customerIdNo = '';
    state.selectedCustomer = null;
    state.isEditing = false;
  },
  SET_SELECTED_CUSTOMER(state, customer) {
    state.selectedCustomer = customer;
    state.isEditing = true;
  },
  LIST_CUSTOMERS(state, customers) {
    state.customersList = customers;
  },
  CUSTOMERS_ARRAY(state, customers){
    state.customerArray = customers;
  },
  SET_CUSTOMER_DETAILS(state, details){
    state.customerDetails = details;
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
  
  async createAssetClient({ commit,state }, formData) {
    return axios.post('api/v1/create-asset-sale-client/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchAssetClients({ commit,state }, formData) {
    state.customerArr = [];
    axios.post(`api/v1/get-asset-sale-clients/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.customerArr.push((response.data[i].client_code + " - " + response.data[i].client_name));
      }
      commit('LIST_CUSTOMERS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchAssetClient({ commit,state }, formData) {
    axios.post(`api/v1/get-asset-sale-clients/`,formData)
    .then((response)=>{
      state.selectedCustomer = response.data;
      commit('SET_SELECTED_CUSTOMER',response.data);
      commit('SET_CUSTOMER_DETAILS',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedCustomer({ commit, state }, option){
    state.customerArray = [];
    const selectedCustomer = state.customersList.find(customer => (customer.client_code + " - " +customer.client_name) === option);
    if (selectedCustomer) {
        state.customerID = selectedCustomer.client_id;
        state.customerName = selectedCustomer.client_name;
        state.customerEmail = selectedCustomer.email;
        state.customerPhoneNo = selectedCustomer.phone_number;
        state.customerIdNo = selectedCustomer.pin_no;
        state.customerArray = [...state.customerArray, selectedCustomer];
    }
    commit('CUSTOMERS_ARRAY', state.customerArray);
      
  },

  async updateAssetClient({ commit,state }, formData) {
    return axios.put(`api/v1/update-asset-sale-client/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteAssetClient({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Client?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Client!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-asset-sale-client/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Client removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Client",
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
        Swal.fire(`Client has not been deleted!`);
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
  
  