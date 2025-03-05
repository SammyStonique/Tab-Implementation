import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  actionsList: [], 
  actionArr: [],
  actionArray: [],
  actionID: '',
  actionDate: '',
  selectedAction: null,
  selectedCase: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.actionsList = [];
    state.actionArr = [];
    state.actionArray = [];
    state.actionID = '';
    state.actionDate = '';
    state.selectedAction = null;
    state.selectedCase = null;
    state.isEditing = false;
  },
  SET_SELECTED_ACTION(state, action) {
    state.selectedAction = action;
    state.isEditing = true;
  },
  SET_SELECTED_CASE(state, cases) {
    state.selectedCase = cases;
  },
  LIST_ACTIONS(state, actions) {
    state.actionsList = actions;
  },
  ACTIONS_ARRAY(state, actions){
    state.actionArray = actions;
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
  
  async createDisciplinaryAction({ commit,state }, formData) {
    return axios.post('api/v1/create-disciplinary-action/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchDisciplinaryActions({ commit,state }, formData) {
    state.actionArr = [];
    axios.post(`api/v1/get-disciplinary-actions/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.actionArr.push((response.data[i].disciplinary_case.case_number + " - "+ response.data[i].action_taken + " - " + response.data[i].action_date));
      }
      commit('LIST_ACTIONS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchDisciplinaryAction({ commit,state }, formData) {
    axios.post(`api/v1/get-disciplinary-actions/`,formData)
    .then((response)=>{
      state.selectedAction = response.data;
      const selectedCase = response.data.disciplinary_case.case_number + " - " + response.data.disciplinary_case.employee.employee_name +" ("+ response.data.disciplinary_case.employee.staff_number +")";
      commit('SET_SELECTED_CASE',selectedCase);
      commit('SET_SELECTED_Action',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedAction({ commit, state }, option){
    state.actionArray = [];
    const selectedAction = state.actionsList.find(action => (action.disciplinary_case.case_number + " - " + action.action_taken + " - " +  action.action_date) === option);
    if (selectedAction) {
        state.actionID = selectedAction.disciplinary_action_id;
        state.actionDate = selectedAction.action_date;
        state.actionArray = [...state.actionArray, selectedAction];
    }
    commit('ACTIONS_ARRAY', state.actionArray);
      
  },

  async updateDisciplinaryAction({ commit,state }, formData) {
    return axios.put(`api/v1/update-disciplinary-action/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteDisciplinaryAction({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Action?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Action!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-disciplinary-action/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Action removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Action",
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
        Swal.fire(`Action has not been deleted!`);
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
  
  