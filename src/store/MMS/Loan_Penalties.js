import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    penaltyList: [],
    penaltyArr: [],
    penaltyArray: [],
    penaltyID: "",
    selectedPenalty: null,
    isEditing: "",

  };
  
  const mutations = {
    initializeStore(state){
      state.penaltyList = [];
      state.penaltyArr = [];
      state.penaltyArray = [];
      state.penaltyID = '';
      state.selectedPenalty = null;
      state.isEditing = false;
    },
    SET_SELECTED_PENALTY(state, penalty) {
      state.selectedPenalty = penalty;
      state.isEditing = true;
    },
    PENALTIES_ARRAY(state, penalty){
      state.penaltyArray = penalty;
    },
    LIST_LOAN_PENALTIES(state, penalty) {
      state.penaltyList = penalty;
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
    
  
    fetchLoanPenalties({ commit,state }, formData) {
      state.penaltyArr = [];
      axios.post(`api/v1/get-loan-penalties/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.penaltyArr.push((response.data[i].amount));
        }
        commit('LIST_LOAN_PENALTIES', response.data);
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
  
  