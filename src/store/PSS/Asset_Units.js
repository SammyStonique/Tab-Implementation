import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  unitsList: [], 
  unitArr: [],
  unitArray: [],
  unitID: '',
  itemsList: [],
  itemArr: [],
  itemArray: [],
  itemID: '',
  unitNumber: '',
  unitPrice: 0,
  selectedUnit: null,
  selectedAsset: null,
  selectedCategory: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.unitsList = [];
    state.unitArr = [];
    state.unitArray = [];
    state.unitID = "";
    state.itemsList = [];
    state.itemArr = [];
    state.itemArray = [];
    state.itemID = "";
    state.unitNumber = "";
    state.unitPrice = 0;
    state.selectedAsset = null;
    state.selectedCategory = null;
    state.isEditing = false;
  },
  SET_SELECTED_UNIT(state, unit) {
    state.selectedUnit = unit;
    state.isEditing = true;
  },
  LIST_UNITS(state, units) {
    state.unitsList = units;
  },
  LIST_SALE_ITEMS(state, units) {
    state.itemsList = units;
  },
  UNITS_ARRAY(state, units){
    state.unitArray = units;
  },
  SET_SELECTED_ASSET(state, asset) {
    state.selectedAsset = asset;
  },
  SET_SELECTED_CATEGORY(state, category) {
    state.selectedCategory = category;
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
  
  async createAssetUnit({ commit,state }, formData) {
    return axios.post('api/v1/create-asset-unit/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchAssetUnits({ commit,state }, formData) {
    state.unitArr = [];
    axios.post(`api/v1/get-asset-units/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.unitArr.push((response.data[i].unit_number));
      }
      commit('LIST_UNITS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchSaleItems({ commit,state }, formData) {
    state.itemArr = [];
    axios.post(`api/v1/get-asset-sale-items/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.itemArr.push((response.data[i].unit_number + " - " + response.data[i].asset_sale.asset.name + " (" + response.data[i].sale_total_amount+ ")"));
      }
      commit('LIST_SALE_ITEMS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchAssetUnit({ commit,state }, formData) {
    axios.post(`api/v1/get-asset-units/`,formData)
    .then((response)=>{
      state.selectedUnit = response.data;
      const selectedAsset = response.data.asset.asset_code + " - " + response.data.asset.name;
      commit('SET_SELECTED_CATEGORY',(response.data.unit_category != null) ? (response.data.unit_category.category_name) : "");
      commit('SET_SELECTED_UNIT',response.data);
      commit('SET_SELECTED_ASSET', selectedAsset);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedUnit({ commit, state }, option){
    const selectedUnit = state.unitsList.find(unit => (unit.unit_number) === option);
    if (selectedUnit) {
        state.unitID = selectedUnit.asset_unit_id;
        state.unitNumber = selectedUnit.unit_number;
        state.unitPrice = selectedUnit.unit_selling_price;
        selectedUnit.reserved_unit_id = null;
        selectedUnit.asset_sale_item_id = null;
        selectedUnit.discount = 0;
        selectedUnit.charges_amount = 0;
        selectedUnit.sale_total_amount = selectedUnit.unit_selling_price;
        selectedUnit.formatted_sale_total_amount = selectedUnit.unit_selling_price;
        const exists = state.unitArray.some(unit => unit.asset_unit_id === selectedUnit.asset_unit_id);
        if (!exists) {
            state.unitArray = [...state.unitArray, selectedUnit];
        }
    }
    commit('UNITS_ARRAY', state.unitArray);
      
  },

  handleSelectedItem({ commit, state }, option){
    state.itemArray = []
    const selectedItem = state.itemsList.find(unit => (unit.unit_number + " - " + unit.asset_sale.asset.name + " (" + unit.sale_total_amount+ ")") === option);
    if (selectedItem) {
        state.itemID = selectedItem.asset_sale_item_id;
    }
      
  },

  async updateAssetUnit({ commit,state }, formData) {
    return axios.put(`api/v1/update-asset-unit/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteAssetUnit({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Unit?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Unit!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-asset-unit/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Unit removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Unit",
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
        Swal.fire(`Unit has not been deleted!`);
      }
    })
  },
  removeAssetUnit({commit, state}, index){
    state.unitArray.splice(index, 1); 
    commit('UNITS_ARRAY', state.unitArray);
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
  
  