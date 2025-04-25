import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    modelList: [],
    modelArr: [],
    modelArray: [],
    modelID: "",
    selectedModel: null,
    selectedMake: null,
    isEditing: "",
    model_name_search: '',
  };
  
  const mutations = {
    initializeStore(state){
      state.modelList = [];
      state.modelArr = [];
      state.modelArray = [];
      state.modelID = '';
      state.model_name_search = '';
      state.selectedModel = null;
      state.selectedMake = null;
      state.isEditing = false;
    },
    SET_SELECTED_MODEL(state, Model) {
      state.selectedModel = Model;
      state.isEditing = true;
    },
    MODELS_ARRAY(state, Models){
      state.modelArray = Models;
    },
    LIST_ASSET_MODELS(state, Models) {
      state.modelList = Models;
    },
    SET_SELECTED_MAKE(state, make) {
      state.selectedMake = make;
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
        if(key == 'model_name_search'){
          state.model_name_search = value;
        } 
      }
    },
    RESET_SEARCH_FILTERS(state){
      state.model_name_search = '';
    }

  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },
    
    async createAssetModel({ commit,state }, formData) {
      return axios.post('api/v1/create-asset-model/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },
  
    fetchAssetModels({ commit,state }, formData) {
      state.modelArr = [];
      axios.post(`api/v1/get-asset-models/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.modelArr.push((response.data[i].name));
        }
        commit('LIST_ASSET_MODELS', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    fetchAssetModel({ commit,state }, formData) {
      axios.post(`api/v1/get-asset-models/`,formData)
      .then((response)=>{
        state.selectedModel = response.data;
        const selectedMake = response.data.asset_make.name;
        commit('SET_SELECTED_MODEL',response.data);
        commit('SET_SELECTED_MAKE',selectedMake);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    handleSelectedModel({ commit, state }, option){
      state.modelArray = [];
      const selectedModel = state.modelList.find(model => (model.name) === option);
      if (selectedModel) {
          state.modelID = selectedModel.asset_model_id;
          state.modelArray = [...state.modelArray, selectedModel];
      }
      commit('MODELS_ARRAY', state.modelArray);
        
    },
  
    async updateAssetModel({ commit,state }, formData) {
      return axios.put(`api/v1/update-asset-model/`,formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })  
    },
  
    deleteAssetModel({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Model?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete Model!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-asset-model/`,formData)
          .then((response)=>{
            if(response.status == 200){
                Swal.fire("Poof! Model removed succesfully!", {
                  icon: "success",
                }); 
            }else{
              Swal.fire({
                title: "Error Deleting Model",
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
          Swal.fire(`Model has not been deleted!`);
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
  
  