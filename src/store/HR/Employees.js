import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  employeesList: [], 
  employeeArr: [],
  employeeArray: [],
  employeeID: null,
  selectedEmployeeID: null,
  employeeName: '',
  employeeNumber: '',
  name_search: '',
  staff_number_search: '',
  phone_number_search: '',
  gender_search: '',
  selectedEmployee: null,
  selectedSupervisor: null,
  selectedDepartment: null,
  selectedEmployeeSupervisor: null,
  selectedEmployeeDepartment: null,
  selectedEmployeeCurrency: null,
  selectedCurrency: null,
  selectedBank: null,
  selectedPayGroup: null,
  isEditing: false,
  employeeDeductions: [],
  employeeDetails: [],
  currentTab: "Employee_Biodata",
};
  
const mutations = {
  initializeStore(state){
    state.employeesList = [];
    state.employeeArr = [];
    state.employeeArray = [];
    state.employeeID = "";
    state.selectedEmployeeID = null;
    state.employeeNumber = "";
    state.name_search = '';
    state.staff_number_search = '';
    state.phone_number_search = '';
    state.gender_search = '';
    state.selectedEmployee = null;
    state.selectedEmployeeCurrency = null;
    state.selectedEmployeeSupervisor = null;
    state.selectedCurrency = null;
    state.selectedSupervisor = null;
    state.selectedDepartment = null;
    state.selectedPayGroup = null;
    state.selectedBank = null;
    state.isEditing = false;
    state.employeeDeductions = [];
    state.employeeDetails = [];
  },
  SET_SELECTED_EMPLOYEE(state, employee) {
    state.selectedEmployee = employee;
    state.isEditing = true;
  },
  SET_SELECTED_DEPARTMENT(state, department) {
    state.selectedDepartment = department;
  },
  SET_SELECTED_SUPERVISOR(state, supervisor) {
    state.selectedSupervisor = supervisor;
  },
  SET_SELECTED_CURRENCY(state, currency) {
    state.selectedCurrency = currency;
  },
  SET_SELECTED_BANK(state, bank) {
    state.selectedBank = bank;
  },
  SET_SELECTED_PAY_GROUP(state, paygroup) {
    state.selectedPayGroup = paygroup;
  },
  SET_EMPLOYEE_DETAILS(state, details){
    state.employeeDetails = details;
  },

  SET_EMPLOYEE_DEDUCTIONS(state, deductions){
    state.employeeDeductions = deductions
  },
  LIST_EMPLOYEES(state, employees) {
    state.employeesList = employees;
  },
  EMPLOYEES_ARRAY(state, employees){
    state.employeeArray = employees;
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
      }else if(key == 'staff_number_search'){
        state.staff_number_search = value;
      }else if(key == 'gender_search'){
          state.gender_search = value;
      }else if(key == 'phone_number_search'){
          state.phone_number_search = value;
      }   
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.name_search = '';
    state.staff_number_search = '';
    state.gender_search = '';
    state.phone_number_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createEmployee({ commit,state }, formData) {
    return axios.post('api/v1/create-employee/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async updateEmployee({ commit,state }, formData) {
    return axios.post('api/v1/update-employee/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async createEmployeeBank({ commit,state }, formData) {
    return axios.post('api/v1/create-employee-bank/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
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

  async createEmployeePayGroup({ commit,state }, formData) {
    return axios.post('api/v1/create-employee-pay-group/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },
  fetchEmployees({ commit,state }, formData) {
    state.employeeArr = [];
    axios.post(`api/v1/get-employees/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.employeeArr.push((response.data[i].staff_number + ' - ' + response.data[i].employee_name))
      }
      commit('LIST_EMPLOYEES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchEmployee({ commit,state }, formData) {
    axios.post(`api/v1/get-employees/`,formData)
    .then((response)=>{
        state.selectedEmployee = response.data;
        state.selectedEmployeeID = response.data.employee_id;
        commit('SET_SELECTED_EMPLOYEE',response.data);
        commit('SET_SELECTED_DEPARTMENT',(response.data.employee_department != null) ? (response.data.employee_department.code + " - " +response.data.employee_department.name) : "");
        commit('SET_SELECTED_SUPERVISOR',(response.data.supervisor != null) ? (response.data.supervisor.first_name + " "+ response.data.supervisor.last_name + " - " + response.data.supervisor.email) : "");
        commit('SET_SELECTED_CURRENCY',response.data.employee_currency.code + " - " + response.data.employee_currency.name);
        commit('SET_SELECTED_BANK',(response.data.employee_bank != null) ? (response.data.employee_bank[0].bank_name) : "");
        commit('SET_SELECTED_PAY_GROUP',(response.data.employee_pay_group != null) ? (response.data.employee_pay_group[0].pay_group_name) : "");
        commit('SET_EMPLOYEE_DEDUCTIONS',(response.data.employee_deductions != null) ? (response.data.employee_deductions) : []);
    })   
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchEmployeeDeductions({ commit,state }, formData) {
    axios.post(`api/v1/get-employee-deductions/`,formData)
    .then((response)=>{
      commit('SET_EMPLOYEE_DEDUCTIONS',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },

  async exitEmployee({ commit,state }, formData) {
    return axios.post('api/v1/terminate-employee/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  handleSelectedEmployee({ commit, state }, option){
    state.employeeArray = [];
    const selectedEmployee = state.employeesList.find(employee => (employee.staff_number + ' - ' + employee.employee_name) === option);
    if (selectedEmployee) {
        state.employeeID = selectedEmployee.employee_id;
        state.employeeName = selectedEmployee.employee_name;
        state.employeeArray = [...state.employeeArray, selectedEmployee];
    }
    commit('EMPLOYEES_ARRAY', state.employeeArray);
      
  },

  async updateEmployee({ commit,state }, formData) {
    return axios.put(`api/v1/update-employee/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteEmployee({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Employee?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Employee!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-employee/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Employee removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Employee",
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
        Swal.fire(`Employee has not been deleted!`);
      }
    })
  },
  deleteEmployeeBank({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Bank?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Bank!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-employee-bank/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
            Swal.fire("Poof! Bank removed succesfully!", {
              icon: "success",
            }); 
          }else{
            Swal.fire({
              title: "Error Deleting Bank",
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
        Swal.fire(`Employee Bank has not been deleted!`);
      }
    })
  },
  deleteEmployeeDeduction({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Deduction?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Deduction!',
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
            if(response.data.msg == "Success"){
              Swal.fire("Poof! Deduction removed succesfully!", {
                icon: "success",
              }); 
          }else if(response.data.msg == "Failed"){
            Swal.fire({
              title: "The Deduction Is In An Active Payroll",
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
        Swal.fire(`Deduction has not been deleted!`);
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
  
  