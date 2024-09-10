import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    transactionsList: [],
    from_date_search: '',
    to_date_search: '',
    selectedTransaction: null,
    selectedUtility: null,
    isEditing: false
  };
  
  const mutations = {
    LIST_STATEMENT_TRANSACTIONS(state, transactions) {
      state.transactionsList = transactions;
    },
    SET_SEARCH_FILTERS(state, search_filter){
      for(const [key, value] of Object.entries(search_filter)){
        if(key == 'from_date_search'){
          state.from_date_search = value;
        } 
        else if(key == 'to_date_search'){
          state.to_date_search = value;
        } 
      }
    },
    SET_SELECTED_TRANSACTION(state, transaction) {
      state.selectedTransaction = transaction;
      state.isEditing = true;
    },
    SET_SELECTED_UTILITY(state, utility) {
      state.selectedUtility = utility;
    },
    SET_STATE(state, payload) {
      for (const key in payload) {
          if (payload.hasOwnProperty(key) && key in state) {
              state[key] = payload[key];
          }
      }
    },
    RESET_SEARCH_FILTERS(state){
      state.from_date_search = '';
      state.to_date_search = '';
    }
  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },

    async createStatementTransaction({ commit,state }, formData) {
      return axios.post('api/v1/create-tenant-statement-transaction/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },

    fetchStatementTransaction({ commit,state }, formData) {
      axios.post(`api/v1/get-tenant-statement-transactions/`,formData)
      .then((response)=>{
        if (response.data.utility){
            const selectedUtility = response.data.utility.name;
            commit('SET_SELECTED_UTILITY',selectedUtility);
        } else{
            const selectedUtility = null;
            commit('SET_SELECTED_UTILITY',selectedUtility);
        } 
        commit('SET_SELECTED_TRANSACTION',response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },

    async updateStatementTransaction({ commit,state }, formData) {
      return axios.put(`api/v1/update-tenant-statement-transaction/`,formData)
      .then((response)=>{
         return response;   
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
      
    },

    deleteStatementTransaction({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Transaction(s)?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-tenant-statement-transaction/`,formData)
          .then((response)=>{
            if(response.status == 200){
                Swal.fire("Poof! Transaction(s) removed succesfully!", {
                  icon: "success",
                }); 
            }else{
              Swal.fire({
                title: "Error Deleting Transaction(s)",
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
          Swal.fire(`Transaction(s) not deleted!`);
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
  
  