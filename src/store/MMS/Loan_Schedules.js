import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    scheduleList: [],
    scheduleArr: [],
    scheduleArray: [],
    scheduleID: "",
    selectedSchedule: null,
    isEditing: "",

  };
  
  const mutations = {
    initializeStore(state){
      state.scheduleList = [];
      state.scheduleArr = [];
      state.scheduleArray = [];
      state.scheduleID = '';
      state.selectedSchedule = null;
      state.isEditing = false;
    },
    SET_SELECTED_SCHEDULE(state, schedule) {
      state.selectedSchedule = schedule;
      state.isEditing = true;
    },
    SCHEDULES_ARRAY(state, schedules){
      state.scheduleArray = schedules;
    },
    LIST_LOAN_SCHEDULES(state, schedules) {
      state.scheduleList = schedules;
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
    
  
    fetchArmotizationSchedules({ commit,state }, formData) {
      state.scheduleArr = [];
      axios.post(`api/v1/get-armotization-schedules/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.scheduleArr.push((response.data[i].schedule_name));
        }
        commit('LIST_LOAN_SCHEDULES', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
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
  
  