import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  customersList: [], 
  customerArr: [],
  customerArray: [],
  customerDetails: [],
  customerID: '',
  customerName: '',
  customerLedger: '',
  customer_name_search: '',
  customer_code_search: '',
  selectedCustomer: null,
  selectedCategory: null,
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
    state.customerLedger = '';
    state.customer_name_search = '';
    state.customer_code_search = '';
    state.selectedCustomer = null;
    state.selectedCategory = null;
    state.isEditing = false;
  },
  SET_SELECTED_CUSTOMER(state, customer) {
    state.selectedCustomer = customer;
    state.isEditing = true;
  },
  SET_SELECTED_CATEGORY(state, category) {
    state.selectedCategory = category;
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
      if(key == 'customer_code_search'){
        state.customer_code_search = value;
      }else if(key == 'customer_name_search'){
        state.customer_name_search = value;
      }
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.customer_code_search = '';
    state.customer_name_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createCustomer({ commit,state }, formData) {
    return axios.post('api/v1/create-customer/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchCustomers({ commit,state }, formData) {
    state.customerArr = [];
    axios.post(`api/v1/fetch-customers/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.customerArr.push((response.data[i].customer_code + " - " + response.data[i].customer_name));
      }
      commit('LIST_CUSTOMERS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchCustomer({ commit,state }, formData) {
    axios.post(`api/v1/fetch-customers/`,formData)
    .then((response)=>{
      state.selectedCustomer = response.data;
      const selectedCategory = response.data.category.name;
      commit('SET_SELECTED_CATEGORY',selectedCategory);
      commit('SET_SELECTED_CUSTOMER',response.data);
      commit('SET_CUSTOMER_DETAILS',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedCustomer({ commit, state }, option){
    state.customerArray = [];
    const selectedCustomer = state.customersList.find(customer => (customer.customer_code + " - " +customer.customer_name) === option);
    if (selectedCustomer) {
        state.customerID = selectedCustomer.customer_id;
        state.customerName = selectedCustomer.customer_name;
        state.customerLedger = selectedCustomer.ledger_id;
        state.customerArray = [...state.customerArray, selectedCustomer];
    }
    commit('CUSTOMERS_ARRAY', state.customerArray);
      
  },

  async updateCustomer({ commit,state }, formData) {
    return axios.put(`api/v1/update-customer/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteCustomer({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Customer?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Customer!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-customer/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Customer removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Customer",
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
        Swal.fire(`Customer has not been deleted!`);
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
  
  