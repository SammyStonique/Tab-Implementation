import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  ammendmentsList: [], 
  ammendmentArr: [],
  ammendmentArray: [],
  ammendmentID: '',
  ammendmentDate: '',
  selectedAmmendment: null,
  selectedEmployee: null,
  selectedLeave: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.ammendmentsList = [];
    state.ammendmentArr = [];
    state.ammendmentArray = [];
    state.ammendmentID = "";
    state.ammendmentDate = "";
    state.selectedAmmendment = null;
    state.selectedEmployee = null;
    state.selectedLeave = null;
    state.isEditing = false;
  },
  SET_SELECTED_AMMENDMENT(state, ammendment) {
    state.selectedAmmendment = ammendment;
    state.isEditing = true;
  },
  LIST_AMMENDMENTS(state, ammendments) {
    state.ammendmentsList = ammendments;
  },
  AMMENDMENTS_ARRAY(state, ammendments){
    state.ammendmentArray = ammendments;
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
  
  async createLeaveAmmendment({ commit,state }, formData) {
    return axios.post('api/v1/create-leave-ammendment/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchLeaveAmmendments({ commit,state }, formData) {
    state.ammendmentArr = [];
    axios.post(`api/v1/get-leave-ammendments/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.ammendmentArr.push((response.data[i].leave_application.employee.employee_name + " - " + response.data[i].leave_application.leave_type.leave_name));
      }
      commit('LIST_AMMENDMENTS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLeaveAmmendment({ commit,state }, formData) {
    axios.post(`api/v1/get-leave-ammendments/`,formData)
    .then((response)=>{
      state.selectedAmmendment = response.data;
      const selectedEmployee = response.data.leave_application.employee.staff_number + " - " + response.data.leave_application.employee.employee_name;
      const selectedLeave = response.data.leave_application.leave_type.leave_name;
      commit('SET_SELECTED_AMMENDMENT',response.data);
      commit('SET_SELECTED_EMPLOYEE', selectedEmployee);
      commit('SET_SELECTED_LEAVE', selectedLeave);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedLeaveAmmendment({ commit, state }, option){
    const selectedAmmendment = state.ammendmentsList.find(ammendment => (ammendment.leave_application.employee.employee_name + " - " + ammendment.leave_application.leave_type.leave_name) === option);
    if (selectedAmmendment) {
        state.ammendmentID = selectedAmmendment.leave_ammendment_id;
        state.ammendmentDate = selectedAmmendment.date;
        state.ammendmentArray = [...state.ammendmentArray, selectedAmmendment];
    }
    commit('AMMENDMENTS_ARRAY', state.ammendmentArray);
      
  },
  async approveLeaveAmmendment({ commit,state }, formData) {
    return axios.put(`api/v1/approve-leave-ammendment/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  async updateLeaveAmmendment({ commit,state }, formData) {
    return axios.put(`api/v1/update-leave-ammendment/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteLeaveAmmendment({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Leave Ammendment?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Leave Ammendment!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-leave-ammendment/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Leave Ammendment removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Leave Ammendment",
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
        Swal.fire(`Leave Ammendment has not been deleted!`);
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
  
  