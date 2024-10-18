import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  salesList: [], 
  salesArr: [],
  salesArray: [],
  salesID: '',
  salesCode: '',
  sale_code_search: '',
  done_by_search: '',
  date_from_search: '',
  date_to_search: '',
  min_amount_search: '',
  max_amount_search: "",
  customer_search: '',
  selectedSale: null,
  isEditing: false,
  defaultOutlet: null,
  defaultCounter: null,
  defaultChannel: null,
  defaultOutletID: null,
  defaultCounterID: null,
  defaultChannelID: null,
  defaultCashbookID: null,
  defaultStockType: null,
};
  
const mutations = {
  initializeStore(state){
    state.salesList = [];
    state.salesArr = [];
    state.salesArray = [];
    state.sale_code_search = '';;
    state.done_by_search = '';
    state.date_from_search = '';
    state.date_to_search = '';
    state.min_amount_search = '';
    state.max_amount_search = '';
    state.isEditing = false;
    state.selectedSale = null;
    state.defaultOutlet = null;
    state.defaultCounter = null;
    state.defaultChannel = null;
    state.defaultOutletID = null;
    state.defaultCounterID = null;
    state.defaultChannelID = null;
    state.defaultCashbookID = null;
    state.defaultStockType = null;
  },
  SET_SELECTED_SALE(state, sale) {
    state.selectedSale = sale;
    state.isEditing = true;
  },
  LIST_SALES(state, sales) {
    state.salesList = sales;
  },
  SALES_ARRAY(state, sales){
    state.salesArray = sales;
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
      if(key == 'sale_code_search'){
        state.sale_code_search = value;
      }else if(key == 'done_by_search'){
        state.done_by_search = value;
      }else if(key == 'date_from_search'){
        state.date_from_search = value;
      }else if(key == 'date_to_search'){
        state.date_to_search = value;
      }else if(key == 'min_amount_search'){
        state.min_amount_search = value;
      }else if(key == 'max_amount_search'){
        state.max_amount_search = value;
      }else if(key == 'customer_search'){
        state.customer_search = value;
      } 
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.sale_code_search = '';
    state.sale_type_search = '';
    state.date_from_search = '';
    state.date_to_search = '';
    state.min_amount_search = '';
    state.max_amount_search = '';
    state.customer_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createSale({ commit,state }, formData) {
    return axios.post('api/v1/create-inventory-sale/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchSales({ commit,state }, formData) {
    state.salesArr = [];
    await axios.post(`api/v1/fetch-inventory-sales/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.salesArr.push((response.data[i].sale_code))
      }
      commit('LIST_SALES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchSale({ commit,state }, formData) {
    axios.post(`api/v1/fetch-inventory-sales/`,formData)
    .then((response)=>{
      state.selectedSale = response.data;
      commit('SET_SELECTED_SALE',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedSale({ commit, state }, option){
    state.salesArray = [];
    const selectedSale = state.salesList.find(sales => (sales.sale_code) === option);
    if (selectedSale) {
        state.salesID = selectedSale.sale_id;
        state.salesCode = selectedSale.sale_code;
        state.salesArray = [...state.salesArray, selectedSale];
    }
    commit('SALES_ARRAY', state.salesArray);
      
  },

  async updateSale({ commit,state }, formData) {
    return axios.put(`api/v1/update-inventory-sale/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteSale({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Sale?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Sale!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-inventory-sale/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Sale removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Sale",
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
        Swal.fire(`Sale has not been deleted!`);
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
  
  