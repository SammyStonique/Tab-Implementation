import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  advancesList: [], 
  advanceArr: [],
  advanceArray: [],
  advanceID: '',
  advanceBalance: '',
  selectedAdvance: null,
  selectedEmployee: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.advancesList = [];
    state.advanceArr = [];
    state.advanceArray = [];
    state.advanceID = "";
    state.advanceBalance = "";
    state.selectedAdvance = null;
    state.selectedEmployee = null;
    state.isEditing = false;
  },
  SET_SELECTED_ADVANCE(state, advance) {
    state.selectedAdvance = advance;
    state.isEditing = true;
    console.log("EDISTING STATE IS ",state.isEditing)
  },
  LIST_ADVANCES(state, advances) {
    state.advancesList = advances;
  },
  ADVANCES_ARRAY(state, advances){
    state.advanceArray = advances;
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
  
  async createSalaryAdvance({ commit,state }, formData) {
    return axios.post('api/v1/create-salary-advance/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchSalaryAdvances({ commit,state }, formData) {
    state.advanceArr = [];
    axios.post(`api/v1/get-salary-advances/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.advanceArr.push((response.data[i].employee.employee_name + " - " + response.data[i].month + "/" + response.data[i].year));
      }
      commit('LIST_ADVANCES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchSalaryAdvance({ commit,state }, formData) {
    axios.post(`api/v1/get-salary-advances/`,formData)
    .then((response)=>{
      state.selectedAdvance = response.data;
      const selectedEmployee = response.data.employee.staff_number + " - " + response.data.employee.employee_name;
      commit('SET_SELECTED_ADVANCE',response.data);
      commit('SET_SELECTED_EMPLOYEE', selectedEmployee);

    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedSalaryAdvance({ commit, state }, option){
    const selectedadvance = state.advancesList.find(advance => (advance.employee.employee_name + " - " + advance.month + "/" + advance.year) === option);
    if (selectedadvance) {
        state.advanceID = selectedadvance.salary_advance_id;
        state.advanceArray = [...state.advanceArray, selectedadvance];
    }
    commit('ADVANCES_ARRAY', state.advanceArray);
      
  },

  async updateSalaryAdvance({ commit,state }, formData) {
    return axios.put(`api/v1/update-salary-advance/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteSalaryAdvance({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Salary Advance?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Salary Advance!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-salary-advance/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Salary Advance removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Salary Advance",
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
        Swal.fire(`Salary Advance has not been deleted!`);
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
  
  