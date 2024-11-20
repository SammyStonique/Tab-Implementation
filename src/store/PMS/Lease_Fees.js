import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    leaseList: [],
    leaseArray: [],
    tenant_name_search: '',
    tenant_code_search: '',
    from_date_search: '',
    to_date_search: '',
    selectedLeaseFee: null,
  };
  
  const mutations = {
    LIST_LEASE_FEES(state, arrears) {
      state.leaseList = arrears;
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

    async createLeaseFee({ commit,state }, formData) {
        return axios.post('api/v1/create-lease-fee/', formData)
        .then((response)=>{
          return response;
        })
        .catch((error)=>{
          console.log(error.message);
          throw error;
        })
      },

    fetchLeaseFees({ commit,state }, formData) {
        axios.post(`api/v1/get-lease-fees/`,formData)
        .then((response)=>{
            commit('LIST_LEASE_FEES',response.data);
        })
        .catch((error)=>{
          console.log(error.message);
        })
        
    },
    deleteLeaseFees({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Lease Fee(s)?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete Lease Fee(s)!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-lease-fee/`,formData)
          .then((response)=>{
            if(response.data.msg == "Success"){
                Swal.fire("Poof! Lease Fee(s) removed succesfully!", {
                  icon: "success",
                }); 
            }else if(response.data.msg == "Failed"){
              Swal.fire({
                title: "The Lease Fee(s) Has An Invoice",
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
          Swal.fire(`Lease Fee(s) has not been deleted!`);
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
  
  