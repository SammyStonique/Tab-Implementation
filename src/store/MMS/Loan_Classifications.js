import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    classList: [],
    classArray: [],
    date_search: '',
    selectedClass: null,
  };
  
  const mutations = {
    LIST_LOAN_CLASSES(state, classes) {
      state.classList = classes;
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

    fetchLoanArrears({ commit,state }, formData) {
        axios.post(`api/v1/loan-classifications-search/`,formData)
        .then((response)=>{
            commit('LIST_LOAN_CLASSES',response.data);
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
  
  