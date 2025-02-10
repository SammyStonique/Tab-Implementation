import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    penaltyList: [],
    penaltyArray: [],
    tenant_name_search: '',
    tenant_code_search: '',
    from_date_search: '',
    to_date_search: '',
    selectedLatePaymentFee: null,
  };
  
  const mutations = {
    LIST_LATE_PAYMENT_FEES(state, penalties) {
      state.penaltyList = penalties;
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

    async createLatePaymentFee({ commit,state }, formData) {
        return axios.post('api/v1/create-late-payment-fee/', formData)
        .then((response)=>{
          return response;
        })
        .catch((error)=>{
          console.log(error.message);
          throw error;
        })
      },

    fetchLatePaymentFees({ commit,state }, formData) {
        axios.post(`api/v1/get-late-payment-fees/`,formData)
        .then((response)=>{
            commit('LIST_LATE_PAYMENT_FEES',response.data);
        })
        .catch((error)=>{
          console.log(error.message);
        })
        
    },
    deleteLatePaymentFees({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Late Payment Fee(s)?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete Late Payment Fee(s)!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-late-payment-fee/`,formData)
          .then((response)=>{
            if(response.data.msg == "Success"){
                Swal.fire("Poof! Late Payment Fee(s) removed succesfully!", {
                  icon: "success",
                }); 
            }else if(response.data.msg == "Failed"){
              Swal.fire({
                title: "The Late Payment Fee(s) Has An Invoice",
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
          Swal.fire(`Late Payment Fee(s) has not been deleted!`);
        }
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
  
  