import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    emailList: [],
    emailArr: [],
    emailArray: [],
    emailID: '',
    emailName: '',
    selectedEmail: null,
    isEditing: false
  };
  
  const mutations = {
    initializeStore(state){
      state.emailList = [];
      state.emailArr = [];
      state.emailArray = [];
      state.emailID = '';
      state.emailName = '';
      state.isEditing = false;
      state.selectedEmail = null;
  },
    LIST_EMAILS(state, emails) {
      state.emailList = emails;
    },
    SET_SELECTED_EMAIL(state, email) {
      state.selectedEmail = email;
      state.isEditing = true;
    },
    EMAILS_ARRAY(state, emails){
      state.emailArray = emails;
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

    async createEmailProvider({ commit,state }, formData) {
      return axios.post('api/v1/create-email-integration/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },

    fetchEmailProviders({ commit,state }, formData) {
      state.emailArr = [];
      axios.post(`api/v1/fetch-email-integration/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.emailArr.push((response.data[i].username))
        }
        commit('LIST_EMAILS', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },

    fetchEmailProvider({ commit,state }, formData) {
      axios.post(`api/v1/fetch-email-integration/`,formData)
      .then((response)=>{
        state.selectedEmail = response.data;
        commit('SET_SELECTED_EMAIL',response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },

    handleSelectedEmail({ commit, state }, option){
      state.emailArray = [];
      const selectedEmail = state.emailList.find(email => (email.username) === option);
      if (selectedEmail) {
          state.smsID = selectedEmail.bulk_sms_id;
          state.smsName = selectedEmail.service_provider;
          state.emailArray = [...state.emailArray, selectedEmail];
      }
      commit('EMAILS_ARRAY', state.emailArray);
          
  },

    async updateEmailProvider({ commit,state }, formData) {
      return axios.put(`api/v1/update-email-integration/`,formData)
      .then((response)=>{
        return response;  
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
      
    },

    deleteEmailProvider({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Email Provider?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete Email Provider!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-email-integration/`,formData)
          .then((response)=>{
            if(response.status == 200){
              Swal.fire("Poof! Email Provider removed succesfully!", {
                  icon: "success",
              }); 
            }else{
              Swal.fire({
                title: "Error Deleting Email Provider",
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
          Swal.fire(`Email Provider has not been deleted!`);
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
  
  