import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    salesList: [], 
    saleArr: [],
    saleArray: [],
    saleID: null,
    saleCode: null,
    selectedSaleID: null,
    selectedSale: null,
    selectedReservation: null,
    selectedAsset: null,
    selectedClient: null,
    selectedPlan: null,
    selectedAgent: null,
    isEditing: false,
    saleDetails: [],
    saleCharges: [],
    saleUnits: [],
    assetSchedules: [],
    selectedSchedules: [],
    selectedCharges: [],
    selectedDocuments: [],
    selectedRepayments: [],
    selectedStatement: [],
    saleClient: [],
    saleAsset: [],
};
  
const mutations = {
  initializeStore(state){
    state.salesList = [];
    state.saleArr = [];
    state.saleArray = [];
    state.saleID = "";
    state.saleCode = "";
    state.selectedSaleID = null;
    state.selectedSale = null;
    state.selectedReservation = null;
    state.selectedTransfer = null;
    state.selectedPlan = null;
    state.selectedAgent = null;
    state.selectedAsset = null;
    state.selectedClient = null;
    state.isEditing = false;
    state.saleDetails = [];
    state.saleCharges = [];
    state.saleUnits = [];
    state.assetSchedules = [];
    state.saleClient = [];
    state.saleAsset = [];
    state.selectedSchedules = [];
    state.selectedCharges = [];
    state.selectedDocuments = [];
    state.selectedRepayments = [];
    state.selectedStatement = [];
  },
  SET_SELECTED_SALE(state, Sale) {
    state.selectedSale = Sale;
    state.isEditing = true;
  },
  SET_SELECTED_CLIENT(state, client) {
    state.selectedClient = client;
  },
  SET_SELECTED_ASSET(state, asset) {
    state.selectedAsset = asset;
  },
  SET_SELECTED_REPAYMENTS(state, repayment) {
    state.selectedRepayments = repayment;
  },
  SET_SELECTED_SCHEDULES(state, schedules) {
    state.selectedSchedules = schedules;
  },
  SET_SELECTED_DOCUMENTS(state, documents) {
    state.selectedDocuments = documents;
  },
  SET_SELECTED_PLAN(state, plan) {
    state.selectedPlan = plan;
  },
  SET_SELECTED_AGENT(state, agent) {
    state.selectedAgent = agent;
  },
  SET_SALE_DETAILS(state, details){
    state.saleDetails = details;
  },
  SET_SALE_CHARGES(state, charges){
    state.saleCharges = charges;
  },
  SET_SALE_SCHEDULES(state, schedules){
    state.assetSchedules = schedules
  },

  LIST_SALES(state, Sales) {
    state.salesList = Sales;
  },
  SALES_ARRAY(state, Sales){
    state.saleArray = Sales;
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
  
  async createAssetSale({ commit,state }, formData) {
    return axios.post('api/v1/create-asset-sale/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async updateAssetSale({ commit,state }, formData) {
    return axios.put('api/v1/update-asset-sale/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  generateArmotizationSchedules({ commit,state }, formData) {
      state.loanSchedules = [];
      axios.post(`api/v1/generate-asset-sale-schedules/`,formData)
      .then((response)=>{
        commit('SET_SALE_SCHEDULES', response.data.armotization_schedule);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },

  fetchAssetSales({ commit,state }, formData) {
    state.saleArr = [];
    axios.post(`api/v1/get-asset-sales/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.saleArr.push((response.data[i].sale_code + ' - ' + response.data[i].customer.client_name + ' - ' + response.data[i].asset.name))
      }
      commit('LIST_SALES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchAssetSale({ commit,state }, formData) {
    axios.post(`api/v1/get-asset-sales/`,formData)
    .then((response)=>{
        state.selectedSale = response.data;
        state.saleUnits = response.data.sale_units;
        commit('SET_SELECTED_SALE',response.data);
        commit('SET_SELECTED_ASSET',response.data.asset.asset_code + " - " + response.data.asset.name);
        commit('SET_SELECTED_CLIENT',response.data.customer.client_code + " - " + response.data.customer.client_name);
        commit('SET_SELECTED_PLAN',response.data.payment_plan.payment_plan.name + " - Pay. Mode: " + response.data.payment_plan.payment_plan.payment_mode + ", Instlmnts: "+ response.data.payment_plan.installments);
        commit('SET_SELECTED_AGENT',(response.data.sales_agent != null) ? (response.data.sales_agent.name) : "");
        commit('SET_SALE_CHARGES',response.data.sale_charges);
    })   
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchUnitReservation({ commit,state }, formData) {
    axios.post(`api/v1/get-unit-reservations/`,formData)
    .then((response)=>{
      state.selectedReservation = response.data;
      state.saleUnits  = response.data.reserved_units;
      commit('SET_SELECTED_ASSET',response.data.asset.asset_code + " - " + response.data.asset.name);
      commit('SET_SELECTED_CLIENT',(response.data.customer != null) ? (response.data.customer.client_code + " - "+ response.data.customer.client_name) : "");
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchUnitTransfer({ commit,state }, formData) {
    axios.post(`api/v1/get-unit-sale-transfers/`,formData)
    .then((response)=>{
      state.selectedTransfer = response.data;
      state.saleUnits  = response.data.unit_sale_item;
      commit('SET_SELECTED_ASSET',response.data.sale_item.asset_sale.asset.asset_code + " - " + response.data.sale_item.asset_sale.asset.name);
      commit('SET_SELECTED_CLIENT',(response.data.customer_to != null) ? (response.data.customer_to.client_code + " - "+ response.data.customer_to.client_name) : "");
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchSaleDetails({ commit,state }, formData) {
    axios.post(`api/v1/get-asset-sales/`,formData)
    .then((response)=>{
        state.saleDetails = response.data;
        state.saleClient = response.data.customer;
        state.saleAsset = response.data.asset;
        state.selectedSaleID = response.data.asset_sale_id;
        commit('SET_SALE_DETAILS',response.data);
        commit('SET_SALE_CHARGES',(response.data.sale_charges != null) ? (response.data.sale_charges) : []);
        commit('SET_SELECTED_SCHEDULES',(response.data.sale_schedules != null) ? (response.data.sale_schedules) : []);
        commit('SET_SELECTED_REPAYMENTS',(response.data.sale_repayments != null) ? (response.data.sale_repayments) : []);
        commit('SET_SALE_DOCUMENTS',(response.data.sale_documents != null) ? (response.data.sale_documents) : []);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchSaleStatement({ commit,state }, formData){
    let txns = [];
    axios
    .post("api/v1/asset-sale-statement-search/", formData)
    .then((response)=>{
        state.selectedStatement = response.data.results;
        let running_balance = 0;
        txns = response.data.results;

    })
    .catch((error)=>{
        console.log(error.message)
    })
    .finally(()=>{
    
    })
  },
  fetchSaleRepayments({ commit,state }, formData) {
    axios.post(`api/v1/get-sale-repayments/`,formData)
    .then((response)=>{
        state.selectedRepayments = response.data;
        commit('SET_SELECTED_REPAYMENTS',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },

  handleSelectedSale({ commit, state }, option){
    state.saleArray = [];
    const selectedSale = state.salesList.find(sale => (sale.sale_code + ' - ' + sale.customer.client_name + ' - ' + sale.asset.name) === option);
    if (selectedSale) {
        state.saleID = selectedSale.asset_sale_id;
        state.saleCode = selectedSale.sale_code;
        state.saleArray = [...state.saleArray, selectedSale];
    }

    commit('SALES_ARRAY', state.saleArray);
      
  },

  async updateAssetSale({ commit,state }, formData) {
      return axios.put('api/v1/update-asset-sale/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },

  deleteAssetSale({ commit,state }, formData) {
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
        axios.post(`api/v1/delete-asset-sale/`,formData)
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
  
  