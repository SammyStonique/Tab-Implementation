import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  batchList: [], 
  batchArr: [],
  batchArray: [],
  batchID: '',
  batchMonth: '',
  selectedBatch: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.batchList = [];
    state.batchArr = [];
    state.batchArray = [];
    state.isEditing = false;
    state.selectedBatch = null;

  },
  SET_SELECTED_BATCH(state, batch) {
    state.selectedBatch = batch;
    state.isEditing = true;
  },
  LIST_BATCHES(state, batch) {
    state.batchsList = batch;
  },
  BATCHES_ARRAY(state, batch){
    state.batchArray = batch;
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
  
  async createPenaltyBatch({ commit,state }, formData) {
    return axios.post('api/v1/process-loan-penalty-batch/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchPenaltyBatches({ commit,state }, formData) {
    state.batchArr = [];
    await axios.post(`api/v1/get-penalty-batches/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.batchArr.push((response.data[i].month + " " + response.data[i].year))
      }
      commit('LIST_BATCHES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchPenaltyBatch({ commit,state }, formData) {
    axios.post(`api/v1/get-penalty-batches/`,formData)
    .then((response)=>{
      state.selectedBatch = response.data;
      commit('SET_SELECTED_BATCH',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedBatch({ commit, state }, option){
    const selectedBatch = state.batchList.find(batch => (batch.month + " " + batch.year) === option);
    if (selectedBatch) {
        state.batchID = selectedBatch.penalty_batch_id;
        state.batchMonth = selectedBatch.month;
        state.batchArray = [...state.batchArray, selectedBatch];
    }
    commit('BATCHES_ARRAY', state.batchArray);
      
  },


  deletePenaltyBatch({ commit,state }, formData) {
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
        axios.post(`api/v1/delete-penalty-batch/`,formData)
        .then((response)=>{
          if(response.status == 200){
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
  
  