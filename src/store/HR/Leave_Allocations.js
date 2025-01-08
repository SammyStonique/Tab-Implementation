import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  allocationsList: [], 
  allocationArr: [],
  allocationArray: [],
  allocationID: '',
  allocationBalance: '',
  selectedAllocation: null,
  selectedEmployee: null,
  selectedLeave: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.allocationsList = [];
    state.allocationArr = [];
    state.allocationArray = [];
    state.allocationID = "";
    state.allocationBalance = "";
    state.selectedAllocation = null;
    state.selectedEmployee = null;
    state.selectedLeave = null;
    state.isEditing = false;
  },
  SET_SELECTED_ALLOCATION(state, allocation) {
    state.selectedAllocation = allocation;
    state.isEditing = true;
  },
  LIST_ALLOCATIONS(state, allocations) {
    state.allocationsList = allocations;
  },
  ALLOCATIONS_ARRAY(state, allocations){
    state.allocationArray = allocations;
  },
  SET_SELECTED_LEAVE(state, leave) {
    state.selectedLeave = leave;
  },
  SET_SELECTED_EMPLOYEE(state, employee) {
    state.selectedEmployee = employee;
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
  
  async createLeaveAllocation({ commit,state }, formData) {
    return axios.post('api/v1/create-leave-allocation/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchLeaveAllocations({ commit,state }, formData) {
    state.allocationArr = [];
    axios.post(`api/v1/get-leave-allocations/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.allocationArr.push((response.data[i].employee.employee_name + " - " + response.data[i].leave_type.leave_name));
      }
      commit('LIST_ALLOCATIONS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLeaveAllocation({ commit,state }, formData) {
    axios.post(`api/v1/get-leave-allocations/`,formData)
    .then((response)=>{
      state.selectedAllocation = response.data;
      const selectedEmployee = response.data.employee.staff_number + " - " + response.data.employee.employee_name;
      const selectedLeave = response.data.leave_type.leave_name;
      commit('SET_SELECTED_ALLOCATION',response.data);
      commit('SET_SELECTED_EMPLOYEE', selectedEmployee);
      commit('SET_SELECTED_LEAVE', selectedLeave);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedLeaveAllocation({ commit, state }, option){
    const selectedAllocation = state.allocationsList.find(allocation => (allocation.employee.employee_name + " - " + allocation.leave_type.leave_name) === option);
    if (selectedAllocation) {
        state.allocationID = selectedAllocation.leave_allocation_id;
        state.allocationBalance = selectedAllocation.remaining_leave_days();
        state.allocationArray = [...state.allocationArray, selectedAllocation];
    }
    commit('ALLOCATIONS_ARRAY', state.allocationArray);
      
  },

  async updateLeaveAllocation({ commit,state }, formData) {
    return axios.put(`api/v1/update-leave-allocation/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteLeaveAllocation({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Leave Allocation?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Leave Allocation!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-leave-allocation/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Leave Allocation removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Leave Allocation",
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
        Swal.fire(`Leave Allocation has not been deleted!`);
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
  
  