import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    arrearsList: [],
    arrearsArray: [],
    tenant_name_search: '',
    tenant_code_search: '',
    date_search: '',
    selectedArrears: null,
  };
  
  const mutations = {
    LIST_TENANT_ARREARS(state, arrears) {
      state.arrearsList = arrears;
    },

    SET_SEARCH_FILTERS(state, search_filter){
      for(const [key, value] of Object.entries(search_filter)){
        if(key == 'tenant_name_search'){
          state.tenant_name_search = value;
        }else if(key == 'tenant_code_search'){
          state.tenant_code_search = value;
        }  
        else if(key == 'date_search'){
          state.date_search = value;
        } 
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
      state.tenant_name_search = '';
      state.date_search = '';
      state.tenant_code_search = ''
    }
  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },

    fetchTenantArrears({ commit,state }, formData) {
        axios.post(`api/v1/tenant-arrears-search/`,formData)
        .then((response)=>{
            commit('LIST_TENANT_ARREARS',response.data);
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
  
  