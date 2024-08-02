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
    first_name: '', last_name: '', email: '', birth_date: '', id_number: '', phone_number: '', city: '', gender: '',
    address: '', country: '', contact_person_first_name: '', contact_person_last_name: '', contact_person_email: '', contact_person_phone_number: '',
    visit_notes: ''
  };
  
  const mutations = {
    LIST_PATIENTS(state, patients) {
      state.patientList = patients;
      console.log("THE PATIENTS LIST IS ",state.patientList)
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
    }
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
  
  