import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  groupsList: [], 
  groupArr: [],
  groupArray: [],
  groupID: '',
  groupName: '',
  group_name_search: '',
  selectedGroup: null,
  selectedCycle: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.groupsList = [];
    state.groupArr = [];
    state.groupArray = [];
    state.groupID = "";
    state.groupName = "";
    state.group_name_search = '';
    state.selectedGroup = null;
    state.selectedCycle = null;
    state.isEditing = false;
  },
  SET_SELECTED_GROUP(state, group) {
    state.selectedGroup = group;
    state.isEditing = true;
  },
  LIST_GROUPS(state, groups) {
    state.groupsList = groups;
  },
  GROUPS_ARRAY(state, groups){
    state.groupArray = groups;
  },
  SET_SELECTED_CYCLE(state, cycle) {
    state.selectedCycle = cycle;
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
      if(key == 'group_name_search'){
        state.group_name_search = value;
      }
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.group_name_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createPayGroup({ commit,state }, formData) {
    return axios.post('api/v1/create-pay-group/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchPayGroups({ commit,state }, formData) {
    state.groupArr = [];
    axios.post(`api/v1/get-pay-groups/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.groupArr.push((response.data[i].pay_group_name));
      }
      commit('LIST_GROUPS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchPayGroup({ commit,state }, formData) {
    axios.post(`api/v1/get-pay-groups/`,formData)
    .then((response)=>{
      state.selectedGroup = response.data;
      const selectedCycle = response.data.pay_cycle.pay_cycle_name;
      commit('SET_SELECTED_GROUP',response.data);
      commit('SET_SELECTED_CYCLE', selectedCycle);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedPayGroup({ commit, state }, option){
    state.groupArray = [];
    const selectedGroup = state.groupsList.find(group => (group.pay_group_name) === option);
    if (selectedGroup) {
        state.groupID = selectedGroup.pay_group_id;
        state.groupName = selectedGroup.pay_group_name;
        state.groupArray = [...state.groupArray, selectedGroup];
    }
    commit('GROUPS_ARRAY', state.groupArray);
      
  },

  async updatePayGroup({ commit,state }, formData) {
    return axios.put(`api/v1/update-pay-group/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deletePayGroup({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Pay Group?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Pay Group!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-pay-group/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Pay Group removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Pay Group",
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
        Swal.fire(`Pay Group has not been deleted!`);
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
  
  