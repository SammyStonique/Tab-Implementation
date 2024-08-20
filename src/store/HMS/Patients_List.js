import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  patientList: [], 
  patientsArr: [],
  patArray: [],
  patientID: '',
  patientName: '',
  hospital_id: '',
  first_name_search: '',
  last_name_search: '',
  phone_number_search: '',
  id_number_search: '',
  gender_search: '',
  birth_date_search: '',
  selectedPatient: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.patientList = [];
    state.patientsArr = [];
    state.feesArray = [];
    state.hospital_id = '';
    state.first_name = '';
    state.last_name_search = '';
    state.phone_number_search = '';
    state.id_number_search = '';
    state.isEditing = false;
  },
  SET_SELECTED_PATIENT(state, patient) {
    state.selectedPatient = patient;
    state.isEditing = true;
  },
  LIST_PATIENTS(state, patients) {
    state.patientList = patients;
  },
  PATIENTS_ARRAY(state, patients){
    state.patArray = patients;
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
      }else if(key == 'phone_number_search'){
          state.phone_number_search = value;
      }else if(key == 'id_number_search'){
          state.id_number_search = value;
      }else if(key == 'gender_search'){
          state.gender_search = value;
      }else if(key == 'birth_date_search'){
          state.birth_date_search = value;
      }
      
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.first_name_search = '';
    state.last_name_search = '';
    state.phone_number_search = '';
    state.id_number_search = '';
    state.gender_search = '';
    state.birth_date_search = '';
    console.log("THE STATE IS ",state.first_name_search);
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createPatient({ commit,state }, formData) {
    return axios.post('api/v1/create-patient-with-visit/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchPatients({ commit,state }, formData) {
    state.patientsArr = [];
    axios.post(`api/v1/get-patients/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.patientsArr.push((response.data[i].first_name + ' ' + response.data[i].last_name+ ' - (' + response.data[i].patient_code + ')'))
      }
      commit('LIST_PATIENTS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchPatient({ commit,state }, formData) {
    axios.post(`api/v1/get-patients/`,formData)
    .then((response)=>{
      state.selectedPatient = response.data;
      commit('SET_SELECTED_PATIENT',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedPatient({ commit, state }, option){
    state.patArray = [];
    const selectedPat = state.patientList.find(pat => (pat.first_name + ' ' + pat.last_name + ' - (' + pat.patient_code + ')') === option);
    if (selectedPat) {
        state.patientID = selectedPat.patient_id;
        state.patientName = selectedPat.first_name + ' ' + selectedPat.last_name;
        state.patArray = [...state.patArray, selectedPat];
    }
    commit('PATIENTS_ARRAY', state.patArray);
      
  },

  async updatePatient({ commit,state }, formData) {
    return axios.put(`api/v1/update-patient/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deletePatient({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Patient?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Patient!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-patient/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Patient removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Patient",
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
        Swal.fire(`Patient has not been deleted!`);
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
  
  