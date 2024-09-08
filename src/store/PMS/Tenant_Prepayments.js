import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    prepaymentsList: [],
    prepaymentArray: [],
    tenantLease: [],
    prepaymentID: '',
    tenant_name_search: '',
    tenant_code_search: '',
    from_date_search: '',
    to_date_search: '',
    selectedPrepayment: null,
  };
  
  const mutations = {
    LIST_TENANT_PREPAYMENTS(state, prepayments) {
      state.prepaymentsList = prepayments;
    },
    PREPAYMENTS_ARRAY(state, prepayments){
        state.prepaymentArray = prepayments;
    },
    SET_SEARCH_FILTERS(state, search_filter){
      for(const [key, value] of Object.entries(search_filter)){
        if(key == 'tenant_name_search'){
          state.tenant_name_search = value;
        }else if(key == 'tenant_code_search'){
          state.tenant_code_search = value;
        }  
        else if(key == 'from_date_search'){
          state.from_date_search = value;
        } 
        else if(key == 'to_date_search'){
          state.to_date_search = value;
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
      state.from_date_search = '';
      state.to_date_search = '';
      state.tenant_code_search = ''
    }
  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },
    async allocatePrepayment({ commit,state }, formData) {
        return axios.post('api/v1/create-tenant-prepayment-allocation/', formData)
        .then((response)=>{
          return response;
        })
        .catch((error)=>{
          console.log(error.message);
          throw error;
        })
      },
    fetchTenantPrepayment({ commit,state }, formData) {
        state.tenantLeaseArr = [];
        axios.post(`api/v1/get-tenant-leases/`,formData)
        .then((response)=>{
            commit('SET_TENANT_LEASE',response.data);
            for(let i=0; i< response.data.length; i++){
                state.tenantLeaseArr.push((response.data[i].tenant.tenant_code + ' - ' + response.data[i].tenant.tenant_name))
            }
        })
        .catch((error)=>{
          console.log(error.message);
        })
        
    },
    handleSelectedPrepayment({ commit, state }, option){
        state.prepaymentArray = [];
        const selectedPrep = state.prepaymentsList.find(prepayment => (prepayment.tenant.tenant_code + ' - ' + prepayment.tenant.tenant_name + " - " + prepayment.receipt.journal_no + " - " + prepayment.due_amount) === option);
        if (selectedPrep) {
            state.prepaymentID = selectedPrep.tenant_prepayment_id;
            state.prepaymentArray = [...state.prepaymentArray, selectedPrep];
        }
        commit('PREPAYMENTS_ARRAY', state.prepaymentArray);
          
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
  
  