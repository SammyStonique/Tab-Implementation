import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    securityList: [],
    securityArr: [],
    securityArray: [],
    securityID: "",
    selectedSecurity: null,
    isEditing: "",
    security_name_search: '',
  };
  
  const mutations = {
    initializeStore(state){
      state.securityList = [];
      state.securityArr = [];
      state.securityArray = [];
      state.securityID = '';
      state.security_name_search = '';
      state.selectedSecurity = null;
      state.isEditing = false;
    },
    SET_SELECTED_SECURITY(state, security) {
      state.selectedSecurity = security;
      state.isEditing = true;
    },
    SECURITIES_ARRAY(state, securities){
      state.securityArray = securities;
    },
    LIST_SECURITY_TYPES(state, securities) {
      state.securityList = securities;
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
        if(key == 'security_name_search'){
          state.security_name_search = value;
        } 
      }
    },
    RESET_SEARCH_FILTERS(state){
      state.security_name_search = '';
    }

  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },
    
    async createSecurityType({ commit,state }, formData) {
      return axios.post('api/v1/create-security-type/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },
  
    fetchSecurityTypes({ commit,state }, formData) {
      state.securityArr = [];
      axios.post(`api/v1/get-security-types/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.securityArr.push((response.data[i].security_name));
        }
        commit('LIST_SECURITY_TYPES', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    fetchSecurityType({ commit,state }, formData) {
      axios.post(`api/v1/get-security-types/`,formData)
      .then((response)=>{
        state.selectedSecurity = response.data;
        commit('SET_SELECTED_SECURITY',response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    handleSelectedSecurity({ commit, state }, option){
      const selectedSecurity = state.securityList.find(security => (security.security_name) === option);
      if (selectedSecurity) {
          state.securityID = selectedSecurity.security_type_id;
          selectedSecurity.name = "";
          selectedSecurity.phone_number = "0";
          selectedSecurity.registration_number = "";
          selectedSecurity.description = "";
          selectedSecurity.loan_security_id = null;
          state.securityArray = [...state.securityArray, selectedSecurity];
      }
      commit('SECURITIES_ARRAY', state.securityArray);
        
    },
  
    async updateSecurityType({ commit,state }, formData) {
      return axios.put(`api/v1/update-security-type/`,formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })  
    },
  
    deleteSecurityType({ commit,state }, formData) {
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
          axios.post(`api/v1/delete-security-type/`,formData)
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
    removeSecurityType({commit, state}, index){
      state.securityArray.splice(index, 1); 
      commit('SECURITIES_ARRAY', state.securityArray);
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
  
  