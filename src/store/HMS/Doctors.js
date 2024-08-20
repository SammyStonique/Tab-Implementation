import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    doctList: [],
    doctArr: [],
    hospital_id: '',
    first_name_search: '',
    last_name_search: '',
    specialization_search: '',
    department_search: '',
    payroll_number_search: '',
    phone_number_search: '',
    selectedDoc: '',
    doctID: '', //When User ID is required
    doctorID: '',
    doctName: '',
    doctArray: [],
    isEditing: false
  };
  
  const mutations = {
    initializeStore(state){
      state.doctList = [];
      state.doctArr = [];
      state.doctArray = [];
      state.hospital_id = '';
      state.first_name = '';
      state.last_name = '';
      state.specialization = '';
      state.department = '';
      state.payroll_number = '';
      state.phone_number = '';
      state.selectedDoc = '';
      state.doctID = '';
      state.doctName = '';
    },
    LIST_DOCTORS(state, doctors) {
      state.doctList = doctors;
    },
    DOCTORS_ARRAY(state, doctors){
      state.doctArray = doctors;
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
        if(key == 'first_name_search'){
          state.first_name_search = value;
        }else if(key == 'last_name_search'){
          state.last_name_search = value;
        }
        else if(key == 'payroll_number_search'){
          state.payroll_number_search = value;
        }
        else if(key == 'payroll_number_search'){
          state.payroll_number_search = value;
        }
        else if(key == 'department_search'){
          state.department_search = value;
        }else if(key == 'specialization_search'){
          state.specialization_search = value;
        }
        
      }
    },
    RESET_SEARCH_FILTERS(state){
      state.first_name_search = '';
      state.last_name_search = '';
      state.department_search = '';
      state.payroll_number_search = '';
      state.specialization_search = '';
      state.phone_number_search = '';
    }
  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },
    async createDoctor({ commit,state }, formData) {
      return axios.post('api/v1/create-department-doctor/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },
    fetchDoctors({ commit, state}, formData) {
      state.doctArr = [];
      axios.post(`api/v1/get-department-doctors/`,formData)
      .then((response)=>{
        console.log("THE DOCTORS LIST IS ",response.data);
        for(let i=0; i< response.data.length; i++){
          state.doctArr.push((response.data[i].first_name  + ' ' + response.data[i].last_name + ' - ' + response.data[i].email))
        }
        commit('LIST_DOCTORS', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    handleSelectedDoctor({ commit, state }, option){
      state.doctArray = [];
      const selectedDoc = state.doctList.find(doc => (doc.first_name + ' ' + doc.last_name + ' - ' + doc.email) === option);
      if (selectedDoc) {
          state.doctID = selectedDoc.user;
          state.doctorID = selectedDoc.doctor_id;
          state.doctName = selectedDoc.first_name + ' ' + selectedDoc.last_name;
          state.doctArray = [...state.doctArray, selectedDoc];
      }
      commit('DOCTORS_ARRAY', state.doctArray);
        
    },
    async updateDoctor({ commit,state }, formData) {
      return axios.put(`api/v1/update-department-doctor/`,formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })  
    },

    deleteDoctor({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Doctor?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete Doctor!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-doctor/`,formData)
          .then((response)=>{
            if(response.status == 200){
              Swal.fire("Poof! Doctor removed succesfully!", {
                  icon: "success",
              }); 
            }else{
              Swal.fire({
                title: "Error Deleting Doctor",
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
          Swal.fire(`Doctor has not been deleted!`);
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
  
  