import axios from "axios";

const state = {
  patientList: [], 
  patientsArr: [],
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
    console.log("THE SELECTED PATIENT IS ",state.selectedPatient)
  },
  LIST_PATIENTS(state, patients) {
    state.patientList = patients;
    console.log("THE PATIENTS LIST IS ",state.patientList)
  },
  SET_STATE(state, payload) {
    console.log("HAPPENNNING")
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
  
  createPatient({ commit,state }, formData) {
    axios.post('api/v1/create-patient-with-visit/', formData)
    .then((response)=>{
      console.log("SUCCESS", response.data);
      window.alert('SUCCESS')
    })
    .catch((error)=>{
      console.log(error.message);
      window.alert(error.message)
    })
  },

  fetchPatients({ commit,state }, formData) {
    state.patientsArr = [];
    axios.post(`api/v1/get-patients/`,formData)
    .then((response)=>{
      // patients.value = response.data;
      for(let i=0; i< response.data.length; i++){
        state.patientsArr.push((response.data[i].first_name + ' ' + response.data[i].last_name))
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
  updatePatient({ commit,state }, formData) {
    axios.put(`api/v1/update-patient/`,formData)
    .then((response)=>{
      if(response.status === 200){
        window.alert("UPDATE SUCCESS")
      }else{
        window.alert("NOT SUCCESSFUL")
      }
      
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  deletePatient({ commit,state }, formData) {
    axios.post(`api/v1/delete-patient/`,formData)
    .then((response)=>{
      if(response.data.msg === 'Success'){
        window.alert("DELETE SUCCESS")
      }else{
        window.alert("NOT SUCCESSFUL")
      }
      
    })
    .catch((error)=>{
      console.log(error.message);
      window.alert(error.message)
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
  
  