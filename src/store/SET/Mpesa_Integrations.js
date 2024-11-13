import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    mpesaList: [],
    mpesaArr: [],
    mpesaArray: [],
    mpesaID: '',
    mpesaName: '',
    selectedMpesa: null,
    selectedCashbook: null,
    selectedKey: null,
    isEditing: false
  };
  
  const mutations = {
    initializeStore(state){
      state.mpesaList = [];
      state.mpesaArr = [];
      state.mpesaArray = [];
      state.mpesaID = '';
      state.mpesaName = '';
      state.isEditing = false;
      state.selectedMpesa = null;
      state.selectedCashbook = null;
      state.selectedKey = null;
  },
    LIST_MPESA(state, mpesa) {
      state.mpesaList = mpesa;
    },
    SET_SELECTED_MPESA(state, mpesa) {
      state.selectedMpesa = mpesa;
      state.isEditing = true;
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
    RESET_SEARCH_FILTERS(state){
      
    }
  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },

    async createMpesaAuthentication({ commit,state }, formData) {
      return axios.post('api/v1/create-mpesa-authentication/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },

    fetchMpesaAuthentications({ commit,state }, formData) {
      state.mpesaArr = [];
      axios.post(`api/v1/fetch-mpesa-authentication/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.mpesaArr.push((response.data[i].consumer_key))
        }
        commit('LIST_MPESA', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },

    fetchMpesaAuthentication({ commit,state }, formData) {
      axios.post(`api/v1/fetch-mpesa-authentication/`,formData)
      .then((response)=>{
        state.selectedMpesa = response.data;
        commit('SET_SELECTED_MPESA',response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },

    handleSelectedMpesa({ commit, state }, option){
      state.mpesaArray = [];
      const selectedMpesa = state.mpesaList.find(mpesa => (mpesa.consumer_key) === option);
      if (selectedMpesa) {
          state.smsID = selectedMpesa.bulk_sms_id;
          state.smsName = selectedMpesa.service_provider;
          state.mpesaArray = [...state.mpesaArray, selectedMpesa];
      }
      commit('MPESA_ARRAY', state.mpesaArray);
          
  },

    async updateMpesaAuthentication({ commit,state }, formData) {
      return axios.put(`api/v1/update-mpesa-authentication/`,formData)
      .then((response)=>{
        return response;  
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
      
    },

    deleteMpesaAuthentication({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Mpesa Authentication?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete Mpesa Authentication!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-mpesa-authentication/`,formData)
          .then((response)=>{
            if(response.status == 200){
              Swal.fire("Poof! Mpesa Authentication removed succesfully!", {
                  icon: "success",
              }); 
            }else{
              Swal.fire({
                title: "Error Deleting Mpesa Authentication",
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
          Swal.fire(`Mpesa Authentication has not been deleted!`);
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
  
  