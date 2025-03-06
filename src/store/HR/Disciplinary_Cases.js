import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  casesList: [], 
  caseArr: [],
  caseArray: [],
  caseID: '',
  caseDate: '',
  selectedCase: null,
  selectedEmployee: null,
  selectedCategory: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.casesList = [];
    state.caseArr = [];
    state.caseArray = [];
    state.caseID = "";
    state.caseDate = "";
    state.selectedCase = null;
    state.selectedEmployee = null;
    state.selectedCategory = null;
    state.isEditing = false;
  },
  SET_SELECTED_CASE(state, cases) {
    state.selectedCase = cases;
    state.isEditing = true;
  },
  LIST_CASES(state, cases) {
    state.casesList = cases;
  },
  CASES_ARRAY(state, cases){
    state.caseArray = cases;
  },
  SET_SELECTED_CATEGORY(state, categories) {
    state.selectedCategory = categories;
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
  
  async createDisciplinaryCase({ commit,state }, formData) {
    return axios.post('api/v1/create-disciplinary-case/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchDisciplinaryCases({ commit,state }, formData) {
    state.caseArr = [];
    axios.post(`api/v1/get-disciplinary-cases/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.caseArr.push((response.data[i].case_number + " - " + response.data[i].employee.employee_name +" ("+ response.data[i].employee.staff_number +")"));
      }
      commit('LIST_CASES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchDisciplinaryCase({ commit,state }, formData) {
    axios.post(`api/v1/get-disciplinary-cases/`,formData)
    .then((response)=>{
      state.selectedCase = response.data;
      const selectedEmployee = response.data.employee.staff_number + " - " + response.data.employee.employee_name;
      const selectedCategory = response.data.category.category_name;
      commit('SET_SELECTED_CASE',response.data);
      commit('SET_SELECTED_EMPLOYEE', selectedEmployee);
      commit('SET_SELECTED_CATEGORY', selectedCategory);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedDisciplinaryCase({ commit, state }, option){
    const selectedCase = state.casesList.find(cases => (cases.case_number + " - " + cases.employee.employee_name +" ("+ cases.employee.staff_number +")") === option);
    if (selectedCase) {
        state.caseID = selectedCase.disciplinary_case_id;
        state.caseDate = selectedCase.date_reported;
        state.caseArray = [...state.caseArray, selectedCase];
    }
    commit('CASES_ARRAY', state.caseArray);
      
  },
  async ammendDisciplinaryCase({ commit,state }, formData) {
    return axios.put(`api/v1/ammend-disciplinary-case/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  async updateDisciplinaryCase({ commit,state }, formData) {
    return axios.put(`api/v1/update-disciplinary-case/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteDisciplinaryCase({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Disciplinary Case?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Disciplinary Case!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-disciplinary-case/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Disciplinary Case removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Disciplinary Case",
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
        Swal.fire(`Disciplinary Case has not been deleted!`);
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
  
  