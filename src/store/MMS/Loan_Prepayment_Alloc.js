import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    allocationsList: [],
    allocationArray: [],
    allocationID: '',
    selectedAllocation: null,
  };
  
  const mutations = {
    LIST_PREPAYMENT_ALLOCATIONS(state, allocations) {
      state.allocationsList = allocations;
    },
    ALLOCATIONS_ARRAY(state, allocations){
        state.allocationArray = allocations;
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
    async createAllocation({ commit,state }, formData) {
        return axios.post('api/v1/create-loan-prepayment-allocation/', formData)
        .then((response)=>{
          return response;
        })
        .catch((error)=>{
          console.log(error.message);
          throw error;
        })
      },
    fetchPrepaymentAllocations({ commit,state }, formData) {
        axios.post(`api/v1/get-loan-prepayment-allocations/`,formData)
        .then((response)=>{
            commit('LIST_PREPAYMENT_ALLOCATIONS',response.data);
        })
        .catch((error)=>{
          console.log(error.message);
        })
        
    },
    handleSelectedAllocation({ commit, state }, option){
        state.allocationArray = [];
        const selectedAlloc = state.allocationsList.find(allocation => (allocation.tenant.tenant_code + ' - ' + allocation.tenant.tenant_name + " - " + allocation.receipt.journal_no + " - " + allocation.due_amount) === option);
        if (selectedAlloc) {
            state.allocationID = selectedAlloc.tenant_prepayment_alloc_id;
            state.allocationArray = [...state.allocationArray, selectedAlloc];
        }
        commit('PREPAYMENTS_ARRAY', state.allocationArray);
          
    },
    deleteAllocation({ commit,state }, formData) {
        Swal.fire({
          title: "Are you sure?",
          text: `Do you wish to delete Allocation(s)?`,
          type: 'warning',
          showCloseButton: true,
          showCancelButton: true,
          confirmButtonText: 'Yes Delete Allocation(s)!',
          cancelButtonText: 'Cancel!',
          customClass: {
              confirmButton: 'swal2-confirm-custom',
              cancelButton: 'swal2-cancel-custom',
          },
          showLoaderOnConfirm: true,
        }).then((result) => {
          if (result.value) {
            axios.post(`api/v1/delete-loan-prepayment-allocation/`,formData)
            .then((response)=>{
              if(response.status == 200){
                  Swal.fire("Poof! Allocation(s) removed succesfully!", {
                    icon: "success",
                  }); 
              }else{
                Swal.fire({
                  title: "Error Deleting Allocation(s)",
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
            Swal.fire(`Allocation(s) has not been deleted!`);
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
  
  