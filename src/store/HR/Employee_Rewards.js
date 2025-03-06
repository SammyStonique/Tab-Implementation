import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  rewardsList: [], 
  rewardArr: [],
  rewardArray: [],
  rewardID: '',
  rewardDate: '',
  selectedReward: null,
  selectedEmployee: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.rewardsList = [];
    state.rewardArr = [];
    state.rewardArray = [];
    state.rewardID = "";
    state.rewardDate = "";
    state.selectedReward = null;
    state.selectedEmployee = null;
    state.isEditing = false;
  },
  SET_SELECTED_REWARD(state, rewards) {
    state.selectedReward = rewards;
    state.isEditing = true;
  },
  LIST_REWARDS(state, rewards) {
    state.rewardsList = rewards;
  },
  REWARDS_ARRAY(state, rewards){
    state.rewardArray = rewards;
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
  
  async createEmployeeReward({ commit,state }, formData) {
    return axios.post('api/v1/create-employee-reward/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchEmployeeRewards({ commit,state }, formData) {
    state.rewardArr = [];
    axios.post(`api/v1/get-employee-rewards/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.rewardArr.push((response.data[i].reward_type + " (" + response.data[i].date_awarded + ")" + " - " + response.data[i].employee.employee_name +" ("+ response.data[i].employee.staff_number +")"));
      }
      commit('LIST_REWARDS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchEmployeeReward({ commit,state }, formData) {
    axios.post(`api/v1/get-employee-rewards/`,formData)
    .then((response)=>{
      state.selectedReward = response.data;
      const selectedEmployee = response.data.employee.staff_number + " - " + response.data.employee.employee_name;
      commit('SET_SELECTED_Reward',response.data);
      commit('SET_SELECTED_EMPLOYEE', selectedEmployee);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedEmployeeReward({ commit, state }, option){
    const selectedReward = state.rewardsList.find(rewards => (rewards.reward_type + " (" + rewards.date_awarded + ")" + " - " + rewards.employee.employee_name +" ("+ rewards.employee.staff_number +")") === option);
    if (selectedReward) {
        state.rewardID = selectedReward.disciplinary_reward_id;
        state.rewardDate = selectedReward.date_awarded;
        state.rewardArray = [...state.rewardArray, selectedReward];
    }
    commit('REWARDS_ARRAY', state.rewardArray);
      
  },
  async updateEmployeeReward({ commit,state }, formData) {
    return axios.put(`api/v1/update-employee-reward/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteEmployeeReward({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Reward?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Reward!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-employee-reward/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Reward removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Reward",
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
        Swal.fire(`Disciplinary Reward has not been deleted!`);
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
  
  