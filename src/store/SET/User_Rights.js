import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  rightsList: [], 
  rightArr: [],
  rightArray: [],
  rightID: '',
  rightName: '',
  company_id: '',
  name_search: '',
  module_search: '',
  selectedRight: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.rightsList = [];
    state.rightArr = [];
    state.rightArray = [];
    state.company_id = '';
    state.name_search = '';
    state.module_search = '';
    state.selectedRight = null;
    state.isEditing = false;
  },
  SET_SELECTED_RIGHT(state, right) {
    state.selectedRight = right;
    state.isEditing = true;
  },
  LIST_RIGHTS(state, rights) {
    state.rightsList = rights;
  },
  RIGHTS_ARRAY(state, rights){
    state.rightArray = rights;
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
      if(key == 'name_search'){
        state.name_search = value;
      }else if(key == 'module_search'){
        state.module_search = value;
      }  
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.name_search = '';
    state.module_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createRight({ commit,state }, formData) {
    return axios.post('api/v1/permissions-list/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchRights({ commit,state }, formData) {
    state.rightArr = [];
    await axios.post(`api/v1/get-permissions/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.rightArr.push((response.data[i].permission_name))
      }
      commit('LIST_RIGHTS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchRight({ commit,state }, formData) {
    axios.post(`api/v1/permissions-search/`,formData)
    .then((response)=>{
      state.selectedRight = response.data.results[0];
      commit('SET_SELECTED_RIGHT',response.data.results[0]);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedRight({ commit, state }, option){
    state.rightArray = [];
    const selectedRight = state.rightsList.find(right => (right.permission_name) === option);
    if (selectedRight) {
        state.rightID = selectedRight.permission_id;
        state.rightName = selectedRight.permission_name;
        state.rightArray = [...state.rightArray, selectedRight];
    }
    commit('RIGHTS_ARRAY', state.rightArray);
      
  },

  async updateRight({ commit,state }, formData) {
    return axios.put(`api/v1/permissions-details/${state.rightID}/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteRight({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Right?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Right!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.delete(`api/v1/permissions-details/${state.rightID}/`,formData)
        .then((response)=>{
              Swal.fire("Poof! Right removed succesfully!", {
                icon: "success",
              }); 
              state.rightID = "";                
        })
        .catch((error)=>{
          console.log(error.message);
          Swal.fire({
            title: error.message,
            icon: "warning",
          });
        })
      }else{
        Swal.fire(`Right has not been deleted!`);
        state.rightID = ""; 
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
  
  