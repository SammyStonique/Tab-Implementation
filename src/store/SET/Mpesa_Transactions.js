import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    mpesaList: [],
    mpesaArr: [],
    mpesaArray: [],
    mpesaID: '',
    mpesaRef: '',
    date_from_search: '',
    date_to_search: '',
    posted_status_search: '',
    reference_no_search: '',
    amount_search: '',
    phone_number_search: '',
  };
  
  const mutations = {
    initializeStore(state){
        state.mpesaList = [];
        state.mpesaArr = [];
        state.mpesaArray = [];
        state.mpesaID = '';
        state.mpesaRef = '';
        state.date_from_search = '';
        state.date_to_search = '';
        state.posted_status_search = '';
        state.reference_no_search = '';
        state.amount_search = '';
        state.phone_number_search = '';
    },
    LIST_MPESA(state, mpesa) {
      state.mpesaList = mpesa;
    },
    MPESA_ARRAY(state, mpesa){
      state.mpesaArray = mpesa;
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
          if(key == 'date_from_search'){
            state.date_from_search = value;
          }else if(key == 'date_to_search'){
            state.date_to_search = value;
          }else if(key == 'posted_status_search'){
              state.posted_status_search = value;
          }else if(key == 'reference_no_search'){
            state.reference_no_search = value;
            }else if(key == 'amount_search'){
                state.amount_search = value;
            }else if(key == 'phone_number_search'){
                state.phone_number_search = value;
            }   
        }
      },
    RESET_SEARCH_FILTERS(state){
        state.date_from_search = "";
        state.date_to_search = "";
        state.posted_status_search = "";
        state.reference_no_search = "";
        state.amount_search = "";
        state.phone_number_search = "";
    }
  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },

    fetchMpesaTransactions({ commit,state }, formData) {
      state.mpesaArr = [];
      axios.post(`api/v1/fetch-mpesa-transactions/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.mpesaArr.push((response.data[i].reference + " - " + response.data[i].phone_number))
        }
        commit('LIST_MPESA', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },

    handleSelectedMpesaTransaction({ commit, state }, option){
      state.mpesaArray = [];
      const selectedMpesa = state.mpesaList.find(mpesa => (mpesa.reference + " - " + mpesa.phone_number) === option);
      if (selectedMpesa) {
          state.mpesaID = selectedMpesa.mpesa_transaction_id;
          state.mpesaRef = selectedMpesa.reference;
          state.mpesaArray = [...state.mpesaArray, selectedMpesa];
      }
      commit('MPESA_ARRAY', state.mpesaArray);
          
  },

    async updateMpesaTransaction({ commit,state }, formData) {
      return axios.put(`api/v1/update-mpesa-transaction/`,formData)
      .then((response)=>{
        return response;  
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
      
    },

    deleteMpesaTransaction({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Mpesa Transaction?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete Mpesa Transaction!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-mpesa-transaction/`,formData)
          .then((response)=>{
            if(response.data.msg == "Success"){
              Swal.fire("Poof! Mpesa Transaction removed succesfully!", {
                  icon: "success",
              }); 
            }else{
              Swal.fire({
                title: "Error Deleting Mpesa Transaction",
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
          Swal.fire(`Mpesa Transaction has not been deleted!`);
        }
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
  
  