import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  purchasesList: [], 
  purchaseOrderItems: [],
  purchasesArr: [],
  purchasesArray: [],
  purchasesID: '',
  vendorID: null,
  purchasesCode: '',
  purchase_code_search: '',
  done_by_search: '',
  date_from_search: '',
  date_to_search: '',
  min_amount_search: '',
  max_amount_search: "",
  vendor_search: '',
  selectedPurchase: null,
  selectedVendor: null,
  selectedOutlet: null,
  isEditing: false,
  isDelivering: false,
  defaultOutlet: null,
  defaultCounter: null,
  defaultChannel: null,
  defaultOutletID: null,
  defaultCounterID: null,
  defaultChannelID: null,
  defaultCashbookID: null,
  defaultStockType: null,
  saveButtonLabel: "Save"
};
  
const mutations = {
  initializeStore(state){
    state.purchasesList = [];
    state.purchasesArr = [];
    state.purchasesArray = [];
    state.purchase_code_search = '';;
    state.done_by_search = '';
    state.date_from_search = '';
    state.date_to_search = '';
    state.min_amount_search = '';
    state.max_amount_search = '';
    state.isEditing = false;
    state.isDelivering = false;
    state.saveButtonLabel = "Save";
    state.selectedPurchase = null;
    state.selectedVendor = null;
    state.selectedOutlet = null;
    state.defaultOutlet = null;
    state.defaultCounter = null;
    state.defaultChannel = null;
    state.defaultOutletID = null;
    state.defaultCounterID = null;
    state.defaultChannelID = null;
    state.defaultCashbookID = null;
    state.defaultStockType = null;
  },
  SET_SELECTED_PURCHASE(state, purchase) {
    state.selectedPurchase = purchase;
    state.isEditing = true;
    state.saveButtonLabel = "Save";
  },
  RECEIVE_SELECTED_PURCHASE(state, purchase) {
    state.selectedPurchase = purchase;
    state.isDelivering = true;
    state.saveButtonLabel = "Receive";
  },
  SET_SELECTED_VENDOR(state, vendor){
    state.selectedVendor = vendor;
  },
  SET_SELECTED_OUTLET(state, outlet){
    state.selectedOutlet = outlet;
  },
  LIST_PURCHASES(state, purchases) {
    state.purchasesList = purchases;
  },
  LIST_PURCHASE_ORDER_ITEMS(state, purchases) {
    state.purchaseOrderItems = purchases;
  },
  PURCHASES_ARRAY(state, purchases){
    state.purchasesArray = purchases;
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
      if(key == 'purchase_code_search'){
        state.purchase_code_search = value;
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
      }else if(key == 'vendor_search'){
        state.vendor_search = value;
      } 
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.purchase_code_search = '';
    state.purchase_type_search = '';
    state.date_from_search = '';
    state.date_to_search = '';
    state.min_amount_search = '';
    state.max_amount_search = '';
    state.vendor_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createPurchase({ commit,state }, formData) {
    return axios.post('api/v1/create-inventory-purchase/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async createPurchaseOrder({ commit,state }, formData) {
    return axios.post('api/v1/create-inventory-purchase-order/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },
  async receivePurchaseOrder({ commit,state }, formData) {
    return axios.post('api/v1/receive-inventory-purchase-order/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchPurchases({ commit,state }, formData) {
    state.purchasesArr = [];
    await axios.post(`api/v1/fetch-inventory-sales/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.purchasesArr.push((response.data[i].sale_code))
      }
      commit('LIST_PURCHASES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchPurchase({ commit,state }, formData) {
    axios.post(`api/v1/fetch-inventory-sales/`,formData)
    .then((response)=>{
      state.selectedPurchase = response.data;
      const selectedVendor = response.data.client;
      const selectedOutlet = response.data.outlet;
      commit('SET_SELECTED_VENDOR',selectedVendor);
      commit('SET_SELECTED_OUTLET',selectedOutlet);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchPurchaseOrderItems({ commit,state }, formData) {
    axios.post(`api/v1/inventory-sale-items-search/`,formData)
    .then((response)=>{
      const purchaseOrderItems = response.data.saleItems;
      commit('LIST_PURCHASE_ORDER_ITEMS',purchaseOrderItems);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedPurchase({ commit, state }, option){
    state.purchasesArray = [];
    const selectedPurchase = state.purchasesList.find(purchases => (purchases.sale_code) === option);
    if (selectedPurchase) {
        state.purchasesID = selectedPurchase.sale_id;
        state.purchasesCode = selectedPurchase.sale_code;
        state.purchasesArray = [...state.purchasesArray, selectedPurchase];
    }
    commit('PURCHASES_ARRAY', state.purchasesArray);
      
  },

  async updatePurchaseOrder({ commit,state }, formData) {
    return axios.put(`api/v1/update-inventory-purchase-order/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deletePurchase({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Purchase?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Purchase!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-inventory-purchase/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Purchase removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Purchase",
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
        Swal.fire(`Purchase has not been deleted!`);
      }
    })
  },
  deletePurchaseOrder({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Purchase Order?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Purchase Order!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-inventory-purchase-order/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Purchase Order removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Purchase Order",
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
        Swal.fire(`Purchase Order has not been deleted!`);
      }
    })
  },
  deleteReceivedOrder({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Received Order?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Received Order!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-inventory-purchase/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Received Order removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Received Order",
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
        Swal.fire(`Received Order has not been deleted!`);
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
  
  