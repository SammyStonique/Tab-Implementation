import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  countersList: [], 
  counterArr: [],
  counterArray: [],
  counterID: '',
  counterName: '',
  counter_name_search: '',
  selectedCounter: null,
  selectedOutlet: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.countersList = [];
    state.counterArr = [];
    state.counterArray = [];
    state.counter_name_search = '';
    state.isEditing = false;
    state.selectedCounter = null;
    state.selectedOutlet = null;
  },
  SET_SELECTED_COUNTER(state, counter) {
    state.selectedCounter = counter;
    state.isEditing = true;
  },
  LIST_COUNTERS(state, counters) {
    state.countersList = counters;
  },
  COUNTERS_ARRAY(state, counters){
    state.counterArray = counters;
  },
  SET_SELECTED_OUTLET(state, outlet) {
    state.selectedOutlet = outlet;
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
      if(key == 'counter_name_search'){
        state.counter_name_search = value;
      }  
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.counter_name_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createCounter({ commit,state }, formData) {
    return axios.post('api/v1/create-outlet-counter/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchCounters({ commit,state }, formData) {
    state.counterArr = [];
    await axios.post(`api/v1/fetch-outlet-counters/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.counterArr.push((response.data[i].counter_name))
      }
      commit('LIST_COUNTERS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchCounter({ commit,state }, formData) {
    axios.post(`api/v1/fetch-outlet-counters/`,formData)
    .then((response)=>{
      state.selectedCounter = response.data;
      const selectedOutlet = response.data.warehouse.warehouse_name;
      commit('SET_SELECTED_COUNTER',response.data);
      commit('SET_SELECTED_OUTLET', selectedOutlet);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedCounter({ commit, state }, option){
    state.counterArray = [];
    const selectedCounter = state.countersList.find(counter => (counter.counter_name) === option);
    if (selectedCounter) {
        state.counterID = selectedCounter.outlet_counter_id;
        state.counterName = selectedCounter.counter_name;
        state.counterArray = [...state.counterArray, selectedCounter];
    }
    commit('COUNTERS_ARRAY', state.counterArray);
      
  },

  async updateCounter({ commit,state }, formData) {
    return axios.put(`api/v1/update-outlet-counter/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteCounter({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Counter?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Counter!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-outlet-counter/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Counter removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Counter",
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
        Swal.fire(`Counter has not been deleted!`);
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
  
  