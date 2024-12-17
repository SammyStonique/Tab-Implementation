import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  cyclesList: [], 
  cycleArr: [],
  cycleArray: [],
  cycleID: '',
  cycleName: '',
  name_search: '',
  selectedCycle: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.cyclesList = [];
    state.cycleArr = [];
    state.cycleArray = [];
    state.name_search = '';
    state.isEditing = false;
    state.selectedCycle = null;
  },
  SET_SELECTED_CYCLE(state, cycle) {
    state.selectedCycle = cycle;
    state.isEditing = true;
  },
  LIST_CYCLES(state, cycles) {
    state.cyclesList = cycles;
  },
  CYCLESS_ARRAY(state, cycles){
    state.cycleArray = cycles;
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
      }  
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.name_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createPayCycle({ commit,state }, formData) {
    return axios.post('api/v1/create-pay-cycle/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchPayCycles({ commit,state }, formData) {
    state.cycleArr = [];
    await axios.post(`api/v1/get-pay-cycles/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.cycleArr.push((response.data[i].pay_cycle_name))
      }
      commit('LIST_CYCLES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchPayCycle({ commit,state }, formData) {
    axios.post(`api/v1/get-pay-cycles/`,formData)
    .then((response)=>{
      state.selectedCycle = response.data;
      commit('SET_SELECTED_CYCLE',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedPayCycle({ commit, state }, option){
    state.cycleArray = [];
    const selectedCycle = state.cyclesList.find(cycle => (cycle.pay_cycle_name) === option);
    if (selectedCycle) {
        state.cycleID = selectedCycle.pay_cycle_id;
        state.cycleName = selectedCycle.pay_cycle_name;
        state.cycleArray = [...state.cycleArray, selectedCycle];
    }
    commit('CYCLES_ARRAY', state.cycleArray);
      
  },

  async updatePayCycle({ commit,state }, formData) {
    return axios.put(`api/v1/update-pay-cycle/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deletePayCycle({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Pay Cycle?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Pay Cycle!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-pay-cycle/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Pay Cycle removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Pay Cycle",
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
        Swal.fire(`Pay Cycle has not been deleted!`);
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
  
  