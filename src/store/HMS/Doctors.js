import axios from "axios";

const state = {
    doctList: [],
    doctArr: [],
    hospital_id: '',
    first_name: '',
    last_name: '',
    specialization: '',
    department: '',
    payroll_number: '',
    phone_number: '',
    selectedDoc: '',
    doctID: '',
    doctName: '',
    doctArray: []
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
      console.log("The doctors array is ",state.doctArray);
    },
    SET_SEARCH_FILTERS(state, search_filter){
      for(const [key, value] of Object.entries(search_filter)){
        if(key == 'first_name_search'){
          state.first_name = value;
        }
        
      }
    },
    RESET_SEARCH_FILTERS(state){
      state.first_name = '';
    }
  };
  
  const actions = {
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
          state.doctName = selectedDoc.first_name + ' ' + selectedDoc.last_name;
          state.doctArray = [...state.doctArray, selectedDoc];
      }
      commit('DOCTORS_ARRAY', state.doctArray);
        
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
  
  