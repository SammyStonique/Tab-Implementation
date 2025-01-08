import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  leavesList: [], 
  leaveArr: [],
  leaveArray: [],
  leaveID: '',
  leaveName: '',
  leaveMaxDays: 0,
  name_search: '',
  selectedLeave: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.leavesList = [];
    state.leaveArr = [];
    state.leaveArray = [];
    state.name_search = '';
    state.isEditing = false;
    state.leaveMaxDays = 0;
    state.selectedLeave = null;
  },
  SET_SELECTED_LEAVE(state, leave) {
    state.selectedLeave = leave;
    state.isEditing = true;
  },
  LIST_LEAVES(state, leaves) {
    state.leavesList = leaves;
  },
  LEAVES_ARRAY(state, leaves){
    state.leaveArray = leaves;
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
      }  
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.name_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createLeaveType({ commit,state }, formData) {
    return axios.post('api/v1/create-leave-type/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchLeaveTypes({ commit,state }, formData) {
    state.leaveArr = [];
    await axios.post(`api/v1/get-leave-types/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.leaveArr.push((response.data[i].leave_name))
      }
      commit('LIST_LEAVES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLeaveType({ commit,state }, formData) {
    axios.post(`api/v1/get-leave-types/`,formData)
    .then((response)=>{
      state.selectedLeave = response.data;
      commit('SET_SELECTED_LEAVE',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedLeaveType({ commit, state }, option){
    state.leaveArray = [];
    const selectedLeave = state.leavesList.find(leave => (leave.leave_name) === option);
    if (selectedLeave) {
        state.leaveID = selectedLeave.leave_type_id;
        state.leaveName = selectedLeave.leave_name;
        state.leaveMaxDays = selectedLeave.max_days_per_year;
        state.leaveArray = [...state.leaveArray, selectedLeave];
    }
    commit('LEAVES_ARRAY', state.leaveArray);
      
  },

  async updateLeaveType({ commit,state }, formData) {
    return axios.put(`api/v1/update-leave-type/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteLeaveType({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Leave Type?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Leave Type!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-leave-type/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Leave Type removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Leave Type",
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
        Swal.fire(`Leave Type has not been deleted!`);
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
  
  