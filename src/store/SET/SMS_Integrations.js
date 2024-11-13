import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    smsList: [],
    smsArr: [],
    smsArray: [],
    smsID: '',
    smsName: '',
    selectedBulkSMS: null,
    isEditing: false
  };
  
  const mutations = {
    initializeStore(state){
      state.smsList = [];
      state.smsArr = [];
      state.smsArray = [];
      state.smsID = '';
      state.smsName = '';
      state.isEditing = false;
      state.selectedBulkSMS = null;
  },
    LIST_SMS(state, sms) {
      state.smsList = sms;
    },
    SET_SELECTED_SMS(state, sms) {
      state.selectedBulkSMS = sms;
      state.isEditing = true;
    },
    SMS_ARRAY(state, sms){
      state.smsArray = sms;
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

    async createBulkSMS({ commit,state }, formData) {
      return axios.post('api/v1/create-bulk-sms/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },

    fetchBulkSMS({ commit,state }, formData) {
      state.smsArr = [];
      axios.post(`api/v1/fetch-bulk-sms/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.smsArr.push((response.data[i].service_provider))
        }
        commit('LIST_SMS', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },

    fetchSMS({ commit,state }, formData) {
      axios.post(`api/v1/fetch-bulk-sms/`,formData)
      .then((response)=>{
        state.selectedBulkSMS = response.data;
        commit('SET_SELECTED_SMS',response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },

    handleSelectedBulkSMS({ commit, state }, option){
      state.smsArray = [];
      const selectedBulkSMS = state.smsList.find(sms => (sms.service_provider) === option);
      if (selectedBulkSMS) {
          state.smsID = selectedBulkSMS.bulk_sms_id;
          state.smsName = selectedBulkSMS.service_provider;
          state.smsArray = [...state.smsArray, selectedBulkSMS];
      }
      commit('SMS_ARRAY', state.smsArray);
          
  },

    async updateBulkSMS({ commit,state }, formData) {
      return axios.put(`api/v1/update-bulk-sms/`,formData)
      .then((response)=>{
        return response;  
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
      
    },

    deleteBulkSMS({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete SMS Provider?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete SMS Provider!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-bulk-sms/`,formData)
          .then((response)=>{
            if(response.status == 200){
              Swal.fire("Poof! SMS Provider removed succesfully!", {
                  icon: "success",
              }); 
            }else{
              Swal.fire({
                title: "Error Deleting SMS Provider",
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
          Swal.fire(`SMS Provider has not been deleted!`);
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
  
  