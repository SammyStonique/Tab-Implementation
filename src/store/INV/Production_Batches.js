import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  batchsList: [], 
  batchArr: [],
  batchArray: [],
  batchID: '',
  selectedBatch: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.batchsList = [];
    state.batchArr = [];
    state.batchArray = [];
    state.batchID = '';
    state.isEditing = false;
    state.selectedBatch = null;
  },
  SET_SELECTED_BATCH(state, Batch) {
    state.selectedBatch = Batch;
    state.isEditing = true;
  },
  LIST_BATCHES(state, Batchs) {
    state.batchsList = Batchs;
  },
  BATCHES_ARRAY(state, Batchs){
    state.batchArray = Batchs;
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
  
  async createProdutionBatch({ commit,state }, formData) {
    return axios.post('api/v1/create-production-batch/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchProdutionBatches({ commit,state }, formData) {
    state.batchArr = [];
    await axios.post(`api/v1/fetch-production-batchs/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.batchArr.push((response.data[i].batch_number + ' (' + response.data[i].recipe.inventory_item.item_code + ') - ' + response.data[i].inventory_item.item_name));
      }
      commit('LIST_BATCHES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchBatch({ commit,state }, formData) {
    axios.post(`api/v1/fetch-production-batchs/`,formData)
    .then((response)=>{
      state.selectedBatch = response.data;
      commit('SET_SELECTED_BATCH',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedBatch({ commit, state }, option){
    state.batchArray = [];
    const selectedBatch = state.batchsList.find(batch => (batch.batch_number + ' (' + batch.recipe.inventory_item.item_code + ') - ' + batch.inventory_item.item_name) === option);
    if (selectedBatch) {
        state.batchID = selectedBatch.production_batch_id;
        state.batchArray = [...state.batchArray, selectedBatch];
    }
    commit('BATCHES_ARRAY', state.batchArray);
      
  },

  deleteProductionBatch({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Batch?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Batch!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-production-batch/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Batch removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Batch",
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
        Swal.fire(`Batch has not been deleted!`);
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
  
  