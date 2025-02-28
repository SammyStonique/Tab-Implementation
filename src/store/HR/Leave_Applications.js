import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  applicationsList: [], 
  applicationArr: [],
  applicationArray: [],
  applicationID: '',
  leaveID: '',
  employeeID: '',
  applicationDate: '',
  approvedDays: 0,
  selectedApplication: null,
  selectedEmployee: null,
  selectedLeave: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.applicationsList = [];
    state.applicationArr = [];
    state.applicationArray = [];
    state.applicationID = "";
    state.leaveID = "";
    state.employeeID = "";
    state.applicationDate = "";
    state.selectedApplication = null;
    state.selectedEmployee = null;
    state.selectedLeave = null;
    state.isEditing = false;
    state.approvedDays = 0;
  },
  SET_SELECTED_APPLICATION(state, application) {
    state.selectedApplication = application;
    state.isEditing = true;
  },
  LIST_APPLICATIONS(state, applications) {
    state.applicationsList = applications;
  },
  APPLICATIONS_ARRAY(state, applications){
    state.applicationArray = applications;
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
  
  async createLeaveApplication({ commit,state }, formData) {
    return axios.post('api/v1/create-leave-application/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchLeaveApplications({ commit,state }, formData) {
    state.applicationArr = [];
    axios.post(`api/v1/get-leave-applications/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.applicationArr.push((response.data[i].employee.employee_name + " - " + response.data[i].leave_type.leave_name + " (" +response.data[i].start_date +")"));
      }
      commit('LIST_APPLICATIONS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLeaveApplication({ commit,state }, formData) {
    axios.post(`api/v1/get-leave-applications/`,formData)
    .then((response)=>{
      state.selectedApplication = response.data;
      const selectedEmployee = response.data.employee.staff_number + " - " + response.data.employee.employee_name;
      const selectedLeave = response.data.leave_type.leave_name;
      commit('SET_SELECTED_APPLICATION',response.data);
      commit('SET_SELECTED_EMPLOYEE', selectedEmployee);
      commit('SET_SELECTED_LEAVE', selectedLeave);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedLeaveApplication({ commit, state }, option){
    const selectedApplication = state.applicationsList.find(application => (application.employee.employee_name + " - " + application.leave_type.leave_name + " (" + application.start_date + ")") === option);
    if (selectedApplication) {
        state.applicationID = selectedApplication.leave_application_id;
        state.leaveID = selectedApplication.leave_type.leave_type_id;
        state.employeeID = selectedApplication.employee.employee_id;
        state.applicationDate = selectedApplication.date;
        state.approvedDays = selectedApplication.days_approved;
        state.applicationArray = [...state.applicationArray, selectedApplication];
    }
    commit('APPLICATIONS_ARRAY', state.applicationArray);
      
  },
  async approveLeaveApplication({ commit,state }, formData) {
    return axios.put(`api/v1/approve-leave-application/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  async updateLeaveApplication({ commit,state }, formData) {
    return axios.put(`api/v1/update-leave-application/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteLeaveApplication({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Leave Application?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Leave Application!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-leave-application/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Leave Application removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Leave Application",
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
        Swal.fire(`Leave Application has not been deleted!`);
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
  
  