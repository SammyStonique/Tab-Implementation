import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    appointmentsList: [],
    doctor_name_search: '',
    patient_name_search: '',
    selectedAppointment: null,
    selectedDoctor: null,
    selectedPatient: null,
    isEditing: false
  };
  
  const mutations = {
    LIST_APPOINTMENTS(state, appointments) {
      state.appointmentsList = appointments;
    },
    SET_SEARCH_FILTERS(state, search_filter){
      for(const [key, value] of Object.entries(search_filter)){
        if(key == 'doctor_name_search'){
          state.doctor_name_search = value;
        }else if(key == 'patient_name_search'){
          state.patient_name_search = value;
        } 
      }
    },
    SET_SELECTED_APPOINTMENT(state, appointment) {
      state.selectedAppointment = appointment;
      state.isEditing = true;
    },
    SET_SELECTED_PATIENT(state, patient) {
      state.selectedPatient = patient;
    },
    SET_SELECTED_DOCTOR(state, doctor) {
      state.selectedDoctor = doctor;
    },
    SET_STATE(state, payload) {
      for (const key in payload) {
          if (payload.hasOwnProperty(key) && key in state) {
              state[key] = payload[key];
          }
      }
    },
    RESET_SEARCH_FILTERS(state){
      state.doctor_name_search = '';
      state.patient_name_search = '';
    }
  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },

    async createAppointment({ commit,state }, formData) {
      return axios.post('api/v1/create-appointment/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },

    fetchAppointment({ commit,state }, formData) {
      axios.post(`api/v1/get-appointments/`,formData)
      .then((response)=>{
        const selectedDoctor = response.data.doctor.first_name + ' '+ response.data.doctor.last_name + ' - ' + response.data.doctor.email;
        const selectedPatient = response.data.patient.first_name + ' '+ response.data.patient.last_name + ' - (' + response.data.patient.patient_code + ')';
        commit('SET_SELECTED_DOCTOR',selectedDoctor);
        commit('SET_SELECTED_PATIENT',selectedPatient);
        commit('SET_SELECTED_APPOINTMENT',response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },

    async updateAppointment({ commit,state }, formData) {
      return axios.put(`api/v1/update-appointment/`,formData)
      .then((response)=>{
         return response;   
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
      
    },

    deleteAppointment({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Appointment?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete Appointment!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-appointment/`,formData)
          .then((response)=>{
            if(response.status == 200){
                Swal.fire("Poof! Appointment removed succesfully!", {
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
          Swal.fire(`Appointment has not been deleted!`);
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
  
  