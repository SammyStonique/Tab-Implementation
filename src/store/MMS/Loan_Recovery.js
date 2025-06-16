import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    recoveryList: [],
    recoveryArray: [],
    date_search: '',
    selectedRecovery: null,
  };
  
  const mutations = {
    LIST_LOAN_RECOVERIES(state, recoveries) {
      state.recoveryList = recoveries;
    },

    SET_SEARCH_FILTERS(state, search_filter){
      for(const [key, value] of Object.entries(search_filter)){

      }
    },

    SET_STATE(state, payload) {
      for (const key in payload) {
          if (payload.hasOwnProperty(key) && key in state) {
              state[key] = payload[key];
          }
      }
    },
    RESET_SEARCH_FILTERS(state){

    }
  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },

    fetchLoanRecoveries({ commit,state }, formData) {
        axios.post(`api/v1/loan-recoveries-search/`,formData)
        .then((response)=>{
            commit('LIST_LOAN_RECOVERIES',response.data);
        })
        .catch((error)=>{
          console.log(error.message);
        })
        
    },

  };
  
  const getters = {

  };
  
  export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
  };
  
  