import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    securityList: [],
    securityArr: [],
    securityArray: [],
    securityID: "",
    selectedSecurity: null,
    selectedSecurityType: null,
    selectedApplication: null,
    isEditing: "",
  };
  
  const mutations = {
    initializeStore(state){
      state.securityList = [];
      state.securityArr = [];
      state.securityArray = [];
      state.securityID = '';
      state.selectedSecurity = null;
      state.selectedSecurityType = null;
      state.selectedApplication = null;
      state.isEditing = false;
    },
    SET_SELECTED_SECURITY(state, security) {
      state.selectedSecurity = security;
      state.isEditing = true;
    },
    SECURITIES_ARRAY(state, securities){
      state.securityArray = securities;
    },
    LIST_LOAN_SECURITIES(state, securities) {
      state.securityList = securities;
    },
    SET_SELECTED_APPLICATION(state, application) {
        state.selectedApplication = application;
    },
    SET_SELECTED_SECURITY_TYPE(state, security) {
        state.selectedSecurityType = security;
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

      }
    },
    RESET_SEARCH_FILTERS(state){

    }

  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },
    
    async createLoanSecurity({ commit,state }, formData) {
      return axios.post('api/v1/create-loan-security/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },
  
    fetchLoanSecurities({ commit,state }, formData) {
      state.securityArr = [];
      axios.post(`api/v1/get-loan-securities/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.securityArr.push((response.data[i].loan_application.loan_number + " - " + response.data[i].security_type.security_name + " - " + response.data[i].loan_application.member.member_name + "(" + response.data[i].loan_application.member.member_number + ")"));
        }
        commit('LIST_LOAN_SECURITIES', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    fetchLoanSecurity({ commit,state }, formData) {
      axios.post(`api/v1/get-loan-securities/`,formData)
      .then((response)=>{
        state.selectedSecurity = response.data;
        const selectedApplication = response.data[i].loan_application.loan_number + " - " + response.data[i].loan_application.loan_product.product_name + " - " + response.data[i].loan_application.member.member_name;
        const selectedSecurityType = response.data[i].security_name;
        commit('SET_SELECTED_SECURITY',response.data);
        commit('SET_SELECTED_APPLICATION', selectedApplication);
        commit('SET_SELECTED_SECURITY_TYPE', selectedSecurityType);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    handleSelectedSecurity({ commit, state }, option){
      state.securityArray = [];
      const selectedSecurity = state.securityList.find(security => (security.loan_application.loan_number + " - " + security.security_type.security_name + " - " + security.loan_application.member.member_name + "(" + security.loan_application.member.member_number + ")") === option);
      if (selectedSecurity) {
          state.securityID = selectedSecurity.loan_security_id;
          state.securityArray = [...state.securityArray, selectedSecurity];
      }
      commit('SECURITIES_ARRAY', state.securityArray);
        
    },
  
    async updateLoanSecurity({ commit,state }, formData) {
      return axios.put(`api/v1/update-loan-security/`,formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })  
    },
  
    deleteLoanSecurity({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Security?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete Security!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-loan-security/`,formData)
          .then((response)=>{
            if(response.status == 200){
                Swal.fire("Poof! Security removed succesfully!", {
                  icon: "success",
                }); 
            }else{
              Swal.fire({
                title: "Error Deleting Security",
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
          Swal.fire(`Security has not been deleted!`);
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
  
  