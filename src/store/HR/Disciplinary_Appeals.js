import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  appealsList: [], 
  appealArr: [],
  appealArray: [],
  appealID: '',
  appealDate: '',
  selectedAppeal: null,
  selectedCase: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.appealsList = [];
    state.appealArr = [];
    state.appealArray = [];
    state.appealID = '';
    state.appealDate = '';
    state.selectedAppeal = null;
    state.selectedCase = null;
    state.isEditing = false;
  },
  SET_SELECTED_APPEAL(state, appeal) {
    state.selectedAppeal = appeal;
    state.isEditing = true;
  },
  SET_SELECTED_CASE(state, cases) {
    state.selectedCase = cases;
  },
  LIST_APPEALS(state, appeals) {
    state.appealsList = appeals;
  },
  APPEALS_ARRAY(state, appeals){
    state.appealArray = appeals;
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
  
  async createDisciplinaryAppeal({ commit,state }, formData) {
    return axios.post('api/v1/create-disciplinary-appeal/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchDisciplinaryAppeals({ commit,state }, formData) {
    state.appealArr = [];
    axios.post(`api/v1/get-disciplinary-appeals/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.appealArr.push((response.data[i].disciplinary_case.case_number + " - "+ response.data[i].decision + " - " + response.data[i].appeal_date));
      }
      commit('LIST_APPEALS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchDisciplinaryAppeal({ commit,state }, formData) {
    axios.post(`api/v1/get-disciplinary-appeals/`,formData)
    .then((response)=>{
      state.selectedAppeal = response.data;
      const selectedCase = response.data.disciplinary_case.case_number + " - " + response.data.disciplinary_case.employee.employee_name +" ("+ response.data.disciplinary_case.employee.staff_number +")";
      commit('SET_SELECTED_CASE',selectedCase);
      commit('SET_SELECTED_APPEAL',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedAppeal({ commit, state }, option){
    state.appealArray = [];
    const selectedAppeal = state.appealsList.find(appeal => (appeal.disciplinary_case.case_number + " - " + appeal.decision + " - " +  appeal.appeal_date) === option);
    if (selectedAppeal) {
        state.appealID = selectedAppeal.disciplinary_appeal_id;
        state.appealDate = selectedAppeal.appeal_date;
        state.appealArray = [...state.appealArray, selectedAppeal];
    }
    commit('APPEALS_ARRAY', state.appealArray);
      
  },

  async updateDisciplinaryAppeal({ commit,state }, formData) {
    return axios.put(`api/v1/update-disciplinary-appeal/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteDisciplinaryAppeal({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Appeal?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Appeal!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-disciplinary-appeal/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Appeal removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Appeal",
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
        Swal.fire(`Appeal has not been deleted!`);
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
  
  