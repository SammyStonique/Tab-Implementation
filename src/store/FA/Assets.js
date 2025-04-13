import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    assetsList: [], 
    assetArr: [],
    assetArray: [],
    assetID: null,
    assetName: '',
    assetCategoryID: "",
    selectedAsset: null,
    selectedCategory: null,
    isEditing: false,
};
  
const mutations = {
  initializeStore(state){
    state.assetsList = [];
    state.assetArr = [];
    state.assetArray = [];
    state.assetID = "";
    state.selectedAsset = null;
    state.selectedCategory = null;
    state.isEditing = false;
    state.assetCategoryID = "";
  },
  SET_SELECTED_ASSET(state, asset) {
    state.selectedAsset = asset;
    state.isEditing = true;
  },
  SET_SELECTED_CATEGORY(state, category) {
    state.selectedCategory = category;
  },
  LIST_ASSETS(state, assets) {
    state.assetsList = assets;
  },
  ASSETS_ARRAY(state, assets){
    state.assetArray = assets;
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
  
  async createAsset({ commit,state }, formData) {
    return axios.post('api/v1/create-asset/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async updateAsset({ commit,state }, formData) {
    return axios.post('api/v1/update-asset/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchAssets({ commit,state }, formData) {
    state.assetArr = [];
    axios.post(`api/v1/get-assets/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.assetArr.push((response.data[i].asset_name))
      }
      commit('LIST_ASSETS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchAsset({ commit,state }, formData) {
    axios.post(`api/v1/get-assets/`,formData)
    .then((response)=>{
        state.selectedAsset = response.data;
        commit('SET_SELECTED_ASSET',response.data);
        commit('SET_SELECTED_CATEGORY',(response.data.asset_category != null) ? (response.data.asset_category.category_name) : "");
    })   
    .catch((error)=>{
      console.log(error.message);
    })
    
  },

  handleSelectedAsset({ commit, state }, option){
    state.assetArray = [];
    const selectedAsset = state.assetsList.find(asset => ( asset.asset_name) === option);
    if (selectedAsset) {
        state.assetID = selectedAsset.asset_id;
        state.assetName = selectedAsset.asset_name;
        state.assetCategoryID = (selectedAsset.asset_category != null) ? (selectedAsset.asset_category.asset_category_id) : "";
        state.assetArray = [...state.assetArray, selectedAsset];
    }

    commit('ASSETS_ARRAY', state.assetArray);
      
  },

  async updateAsset({ commit,state }, formData) {
    return axios.put(`api/v1/update-asset/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteAsset({ commit,state }, formData) {
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
        axios.post(`api/v1/delete-asset/`,formData)
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
  
  