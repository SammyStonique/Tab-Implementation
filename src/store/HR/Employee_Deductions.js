import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  deductionsList: [], 
  deductionArr: [],
  deductionArray: [],
  deductionID: '',
  deductionDate: '',
  selectedDeduction: null,
  selectedEmployee: null,
  selectedDeductionType: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.deductionsList = [];
    state.deductionArr = [];
    state.deductionArray = [];
    state.deductionID = "";
    state.deductionDate = "";
    state.selectedDeduction = null;
    state.selectedEmployee = null;
    state.selectedDeductionType = null;
    state.isEditing = false;
  },
  SET_SELECTED_DEDUCTION(state, deductions) {
    state.selectedDeduction = deductions;
    state.isEditing = true;
  },
  LIST_DEDUCTIONS(state, deductions) {
    state.deductionsList = deductions;
  },
  DEDUCTIONS_ARRAY(state, deductions){
    state.deductionArray = deductions;
  },
  SET_SELECTED_DEDUCTION_TYPE(state, deductions) {
    state.selectedDeductionType = deductions;
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
  
  async createEmployeeDeduction({ commit,state }, formData) {
    return axios.post('api/v1/create-employee-deduction/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchEmployeeDeductions({ commit,state }, formData) {
    state.deductionArr = [];
    axios.post(`api/v1/get-employee-deductions/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.deductionArr.push((response.data[i].deduction.deduction_name + " - " + response.data[i].employee.employee_name +" ("+ response.data[i].employee.staff_number +")"));
      }
      commit('LIST_DEDUCTIONS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchEmployeeDeduction({ commit,state }, formData) {
    axios.post(`api/v1/get-employee-deductions/`,formData)
    .then((response)=>{
      state.selectedDeduction = response.data;
      const selectedEmployee = response.data.employee.staff_number + " - " + response.data.employee.employee_name;
      const selectedDeductionType = response.data.deduction.deduction_name;
      commit('SET_SELECTED_DEDUCTION',response.data);
      commit('SET_SELECTED_EMPLOYEE', selectedEmployee);
      commit('SET_SELECTED_DEDUCTION_TYPE', selectedDeductionType);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedEmployeeDeduction({ commit, state }, option){
    const selectedDeduction = state.deductionsList.find(deductions => (deductions.deduction.deduction_name + " - " + deductions.employee.employee_name +" ("+ deductions.employee.staff_number +")") === option);
    if (selectedDeduction) {
        state.deductionID = selectedDeduction.employee_deduction_id;
        state.deductionArray = [...state.deductionArray, selectedDeduction];
    }
    commit('DEDUCTIONS_ARRAY', state.deductionArray);
      
  },

  async updateEmployeeDeduction({ commit,state }, formData) {
    return axios.put(`api/v1/update-employee-deduction/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteEmployeeDeduction({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Employee Deduction?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Employee Deduction!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-employee-deduction/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Employee Deduction removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Employee Deduction",
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
        Swal.fire(`Employee Deduction has not been deleted!`);
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
  
  