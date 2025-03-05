import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  meetingsList: [], 
  meetingArr: [],
  meetingArray: [],
  meetingID: '',
  meetingDate: '',
  selectedMeeting: null,
  selectedCase: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.meetingsList = [];
    state.meetingArr = [];
    state.meetingArray = [];
    state.meetingID = '';
    state.meetingDate = '';
    state.selectedMeeting = null;
    state.selectedCase = null;
    state.isEditing = false;
  },
  SET_SELECTED_MEETING(state, meeting) {
    state.selectedMeeting = meeting;
    state.isEditing = true;
  },
  SET_SELECTED_CASE(state, cases) {
    state.selectedCase = cases;
  },
  LIST_MEETINGS(state, meetings) {
    state.meetingsList = meetings;
  },
  MEETINGS_ARRAY(state, meetings){
    state.meetingArray = meetings;
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
  
  async createDisciplinaryMeeting({ commit,state }, formData) {
    return axios.post('api/v1/create-disciplinary-meeting/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchDisciplinaryMeetings({ commit,state }, formData) {
    state.meetingArr = [];
    axios.post(`api/v1/get-disciplinary-meetings/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.meetingArr.push((response.data[i].disciplinary_case.case_number + " - " + response.data[i].meeting_location + " - " + response.data[i].meeting_date));
      }
      commit('LIST_MEETINGS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchDisciplinaryMeeting({ commit,state }, formData) {
    axios.post(`api/v1/get-disciplinary-meetings/`,formData)
    .then((response)=>{
      state.selectedMeeting = response.data;
      const selectedCase = response.data.disciplinary_case.case_number + " - " + response.data.disciplinary_case.employee.employee_name +" ("+ response.data.disciplinary_case.employee.staff_number +")";
      commit('SET_SELECTED_CASE',selectedCase);
      commit('SET_SELECTED_MEETING',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedMeeting({ commit, state }, option){
    state.meetingArray = [];
    const selectedMeeting = state.meetingsList.find(meeting => (meeting.disciplinary_case.case_number + " - " + meeting.meeting_location + " - " + meeting.meeting_date) === option);
    if (selectedMeeting) {
        state.meetingID = selectedMeeting.disciplinary_meeting_id;
        state.meetingDate = selectedMeeting.meeting_date;
        state.meetingArray = [...state.meetingArray, selectedMeeting];
    }
    commit('MEETINGS_ARRAY', state.meetingArray);
      
  },

  async updateDisciplinaryMeeting({ commit,state }, formData) {
    return axios.put(`api/v1/update-disciplinary-meeting/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteDisciplinaryMeeting({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Meeting?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Meeting!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-disciplinary-meeting/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Meeting removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Meeting",
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
        Swal.fire(`Meeting has not been deleted!`);
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
  
  