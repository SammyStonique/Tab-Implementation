import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    depList: [],
    code_search: '',
    name_search: '',
    selectedDepartment: null,
    isEditing: false
  };
  
  const mutations = {
    LIST_DEPARTMENTS(state, departments) {
      state.depList = departments;
    },
    SET_SEARCH_FILTERS(state, search_filter){
      for(const [key, value] of Object.entries(search_filter)){
        if(key == 'code_search'){
          state.code_search = value;
        }else if(key == 'name_search'){
          state.name_search = value;
        } 
      }
    },
    SET_SELECTED_DEPARTMENT(state, department) {
      state.selectedDepartment = department;
      state.isEditing = true;
    },
    SET_STATE(state, payload) {
      for (const key in payload) {
          if (payload.hasOwnProperty(key) && key in state) {
              state[key] = payload[key];
          }
      }
    },
    RESET_SEARCH_FILTERS(state){
      state.code_search = '';
      state.name_search = '';
    }
  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },

    async createDepartment({ commit,state }, formData) {
      return axios.post('api/v1/create-department/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },

    fetchDepartment({ commit,state }, formData) {
      axios.post(`api/v1/fetch-departments/`,formData)
      .then((response)=>{
        state.selectedDepartment = response.data;
        commit('SET_SELECTED_DEPARTMENT',response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },

    async updateDepartment({ commit,state }, formData) {
      return axios.put(`api/v1/update-department/`,formData)
      .then((response)=>{
        return response;  
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
      
    },

    deleteDepartment({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Department?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete Department!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-department/`,formData)
          .then((response)=>{
            if(response.status == 200){
              Swal.fire("Poof! Department removed succesfully!", {
                  icon: "success",
              }); 
            }else{
              Swal.fire({
                title: "Error Deleting Appointment",
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
          Swal.fire(`Department has not been deleted!`);
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
  
  