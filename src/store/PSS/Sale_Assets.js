import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    assetsList: [], 
    assetArr: [],
    assetArray: [],
    assetID: null,
    selectedAssetID: null,
    assetName: '',
    assetNumber: '',
    assetCategoryID: "",
    name_search: '',
    asset_number_search: '',
    phone_number_search: '',
    gender_search: '',
    selectedAsset: null,
    selectedMake: null,
    selectedModel: null,
    selectedCurrency: null,
    selectedVendor: null,
    isEditing: false,
    assetDetails: [],
    saleCharges: [],
    purchaseCharges: [],
    salePlans: [],
};
  
const mutations = {
  initializeStore(state){
    state.assetsList = [];
    state.assetArr = [];
    state.assetArray = [];
    state.assetID = "";
    state.selectedAssetID = null;
    state.assetNumber = "";
    state.name_search = '';
    state.asset_number_search = '';
    state.phone_number_search = '';
    state.gender_search = '';
    state.selectedAsset = null;
    state.selectedCurrency = null;
    state.selectedVendor = null;
    state.selectedMake = null;
    state.selectedModel = null;
    state.isEditing = false;
    state.assetDetails = [];
    state.saleCharges = [];
    state.purchaseCharges = [];
    state.salePlans = [];
    state.assetCategoryID = "";
  },
  SET_SELECTED_ASSET(state, Asset) {
    state.selectedAsset = Asset;
    state.isEditing = true;
  },
  SET_SELECTED_MODEL(state, category) {
    state.selectedModel = category;
  },
  SET_SELECTED_MAKE(state, sponsor) {
    state.selectedMake = sponsor;
  },
  SET_SELECTED_CURRENCY(state, currency) {
    state.selectedCurrency = currency;
  },
  SET_SELECTED_VENDOR(state, vendor) {
    state.selectedVendor = vendor;
  },
  SET_ASSET_DETAILS(state, details){
    state.assetDetails = details;
  },
  SET_SALE_CHARGES(state, charges){
    state.saleCharges = charges;
  },
  SET_PURCHASE_CHARGES(state, charges){
    state.purchaseCharges = charges;
  },
  SET_SALE_PLANS(state, plans){
    state.salePlans = plans;
  },

  LIST_ASSETS(state, Assets) {
    state.assetsList = Assets;
  },
  ASSETS_ARRAY(state, Assets){
    state.assetArray = Assets;
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
  
  async createSaleAsset({ commit,state }, formData) {
    return axios.post('api/v1/create-sale-asset/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async updateSaleAsset({ commit,state }, formData) {
    return axios.put('api/v1/update-sale-asset/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchSaleAssets({ commit,state }, formData) {
    state.assetArr = [];
    axios.post(`api/v1/get-sale-assets/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.assetArr.push((response.data[i].asset_code + ' - ' + response.data[i].name))
      }
      commit('LIST_ASSETS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchSaleAsset({ commit,state }, formData) {
    axios.post(`api/v1/get-sale-assets/`,formData)
    .then((response)=>{
        state.selectedAsset = response.data;
        state.selectedAssetID = response.data.sale_asset_id;
        commit('SET_SELECTED_ASSET',response.data);
        commit('SET_SELECTED_MODEL',(response.data.asset_model != null) ? (response.data.asset_model.name) : "");
        commit('SET_SELECTED_MAKE',(response.data.asset_make != null) ? (response.data.asset_make.name) : "");
        commit('SET_SELECTED_VENDOR',(response.data.vendor != null) ? (response.data.vendor.vendor_code + " - "+ response.data.vendor.vendor_name) : "");
        commit('SET_SELECTED_CURRENCY',response.data.asset_currency.code + " - " + response.data.asset_currency.name);
        commit('SET_SALE_CHARGES',response.data.sale_charges);
        commit('SET_PURCHASE_CHARGES',response.data.purchase_charges);
        commit('SET_SALE_PLANS',response.data.sale_plans);
    })   
    .catch((error)=>{
      console.log(error.message);
    })
    
  },

  handleSelectedAsset({ commit, state }, option){
    state.assetArray = [];
    const selectedAsset = state.assetsList.find(asset => (asset.asset_code + ' - ' + asset.name) === option);
    if (selectedAsset) {
        state.assetID = selectedAsset.sale_asset_id;
        state.assetName = selectedAsset.name;
        commit('SET_SALE_CHARGES',selectedAsset.sale_charges);
        state.assetArray = [...state.assetArray, selectedAsset];
    }

    commit('ASSETS_ARRAY', state.assetArray);
      
  },

  deleteSaleAsset({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Asset?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Asset!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-sale-asset/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Asset removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Asset",
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
        Swal.fire(`Asset has not been deleted!`);
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
  
  