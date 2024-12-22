import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  holidaysList: [], 
  holidayArr: [],
  holidayArray: [],
  holidayID: '',
  holidayName: '',
  name_search: '',
  selectedHoliday: null,
  leaveHolidaysArray: [],
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.holidaysList = [];
    state.holidayArr = [];
    state.holidayArray = [];
    state.name_search = '';
    state.isEditing = false;
    state.selectedHoliday = null;
    state.leaveHolidaysArray = [];
  },
  SET_SELECTED_HOLIDAY(state, holiday) {
    state.selectedHoliday = holiday;
    state.isEditing = true;
  },
  LIST_HOLIDAYS(state, holidays) {
    state.holidaysList = holidays;
  },
  HOLIDAYS_ARRAY(state, holidays){
    state.holidayArray = holidays;
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
      if(key == 'name_search'){
        state.name_search = value;
      }  
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.name_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createHoliday({ commit,state }, formData) {
    return axios.post('api/v1/create-holiday/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchHolidays({ commit,state }, formData) {
    state.holidayArr = [];
    await axios.post(`api/v1/get-holidays/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.holidayArr.push((response.data[i].holiday_name))
      }
      commit('LIST_HOLIDAYS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchHoliday({ commit,state }, formData) {
    axios.post(`api/v1/get-holidays/`,formData)
    .then((response)=>{
      state.selectedHoliday = response.data;
      commit('SET_SELECTED_HOLIDAY',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedHoliday({ commit, state }, option){
    const selectedHoliday = state.holidaysList.find(holiday => (holiday.holiday_name) === option);
    if (selectedHoliday) {
        state.holidayID = selectedHoliday.holiday_id;
        state.holidayName = selectedHoliday.holiday_name;
        state.holidayArray = [...state.holidayArray, selectedHoliday];
    }
    state.leaveHolidaysArray.push(selectedHoliday);
      
  },

  async updateHoliday({ commit,state }, formData) {
    return axios.put(`api/v1/update-holiday/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteHoliday({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Holiday?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Holiday!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-holiday/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Holiday removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Holiday",
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
        Swal.fire(`Holiday has not been deleted!`);
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
  
  