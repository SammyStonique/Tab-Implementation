import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  appraisalsList: [], 
  appraisalArr: [],
  appraisalArray: [],
  appraisalID: '',
  appraisalDate: '',
  performanceIndicators: [],
  selectedAppraisal: null,
  selectedEmployee: null,
  selectedPeriod: null,
  selectedCategory: null,
  selectedIndicators: [],
  isEditing: false,
  categoryMethod: "Supervisor Only",
};
  
const mutations = {
  initializeStore(state){
    state.appraisalsList = [];
    state.appraisalArr = [];
    state.appraisalArray = [];
    state.appraisalID = '';
    state.appraisalDate = '';
    state.performanceIndicators = [];
    state.selectedAppraisal = null;
    state.selectedEmployee = null;
    state.selectedPeriod = null;
    state.selectedCategory = null;
    state.selectedIndicators = [];
    state.isEditing = false;
    state.categoryMethod = "Supervisor Only";
  },
  SET_SELECTED_APPRAISAL(state, appraisal) {
    state.selectedAppraisal = appraisal;
    state.isEditing = true;
  },
  SET_SELECTED_EMPLOYEE(state, employee) {
    state.selectedEmployee = employee;
  },
  SET_SELECTED_PERIOD(state, period) {
    state.selectedPeriod = period;
  },
  SET_SELECTED_CATEGORY(state, category) {
    state.selectedCategory = category;
  },
  SET_SELECTED_INDICATORS(state, indicators){
    state.performanceIndicators = indicators;
  },
  SET_APPRAISAL_INDICATORS(state, indicators){
    state.performanceIndicators = indicators
  },
  LIST_APPRAISALS(state, appraisals) {
    state.appraisalsList = appraisals;
  },
  APPRAISALS_ARRAY(state, appraisals){
    state.appraisalArray = appraisals;
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
  
  async createAppraisal({ commit,state }, formData) {
    return axios.post('api/v1/create-appraisal/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  generateKPIs({ commit,state }, formData) {
    state.performanceIndicators = [];
    axios.post(`api/v1/get-performance-indicators/`,formData)
    .then((response)=>{
      commit('SET_APPRAISAL_INDICATORS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },

  fetchAppraisals({ commit,state }, formData) {
    state.appraisalArr = [];
    axios.post(`api/v1/get-appraisals/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.appraisalArr.push((response.data[i].employee.employee_name + " (" + response.data[i].employee.staff_number + ") -" + response.data[i].category.category_name + " - (" + response.data[i].appraisal_date + ")"));
      }
      commit('LIST_APPRAISALS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchAppraisal({ commit,state }, formData) {
    axios.post(`api/v1/get-appraisals/`,formData)
    .then((response)=>{
      state.selectedAppraisal = response.data;
      const selectedCategory = response.data.category.category_name;
      const selectedEmployee = response.data.employee.staff_number + ' - ' + response.data.employee.employee_name;
      const selectedPeriod = response.data.period.period_name;
      state.categoryMethod = response.data.category.appraisal_method;

      commit('SET_SELECTED_CATEGORY',selectedCategory);
      commit('SET_SELECTED_EMPLOYEE',selectedEmployee);
      commit('SET_SELECTED_PERIOD',selectedPeriod);
      commit('SET_SELECTED_APPRAISAL',response.data);
      commit('SET_SELECTED_INDICATORS',(response.data.performance_indicators != null) ? (response.data.performance_indicators) : []);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedAppraisal({ commit, state }, option){
    state.appraisalArray = [];
    const selectedAppraisal = state.appraisalsList.find(appraisal => (appraisal.employee.employee_name + " (" + appraisal.employee.staff_number + ") -" + appraisal.category.category_name + " - (" + appraisal.appraisal_date + ")") === option);
    if (selectedAppraisal) {
        state.appraisalID = selectedAppraisal.employee_appraisal_id;
        state.appraisalDate = selectedAppraisal.appraisal_date;
        state.appraisalArray = [...state.appraisalArray, selectedAppraisal];
    }
    commit('APPRAISALS_ARRAY', state.appraisalArray);
      
  },

  async updateAppraisal({ commit,state }, formData) {
    return axios.put(`api/v1/update-appraisal/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteAppraisal({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Appraisal?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Appraisal!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-appraisal/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Appraisal removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Appraisal",
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
        Swal.fire(`Appraisal has not been deleted!`);
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
  
  