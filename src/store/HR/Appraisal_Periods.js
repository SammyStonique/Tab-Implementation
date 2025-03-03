import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  periodsList: [], 
  periodArr: [],
  periodArray: [],
  periodID: '',
  periodName: '',
  selectedPeriod: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.periodsList = [];
    state.periodArr = [];
    state.periodArray = [];
    state.periodID = "";
    state.periodName = "";
    state.isEditing = false;
    state.selectedPeriod = null;
  },
  SET_SELECTED_PERIOD(state, period) {
    state.selectedPeriod = period;
    state.isEditing = true;
  },
  LIST_PERIODS(state, periods) {
    state.periodsList = periods;
  },
  PERIODS_ARRAY(state, periods){
    state.periodArray = periods;
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
  
  async createAppraisalPeriod({ commit,state }, formData) {
    return axios.post('api/v1/create-appraisal-period/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchAppraisalPeriods({ commit,state }, formData) {
    state.periodArr = [];
    await axios.post(`api/v1/get-appraisal-periods/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.periodArr.push((response.data[i].period_name))
      }
      commit('LIST_PERIODS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchAppraisalPeriod({ commit,state }, formData) {
    axios.post(`api/v1/get-appraisal-periods/`,formData)
    .then((response)=>{
      state.selectedPeriod = response.data;
      commit('SET_SELECTED_PERIOD',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedPeriod({ commit, state }, option){
    state.periodArray = [];
    const selectedPeriod = state.periodsList.find(period => (period.period_name) === option);
    if (selectedPeriod) {
        state.periodID = selectedPeriod.appraisal_period_id;
        state.periodName = selectedPeriod.period_name;
        state.periodArray = [...state.periodArray, selectedPeriod];
    }
    commit('PERIODS_ARRAY', state.periodArray);
      
  },

  deleteAppraisalPeriod({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Appraisal Period?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Appraisal Period!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-appraisal-period/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Appraisal Period removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Appraisal Period",
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
        Swal.fire(`Appraisal Period has not been deleted!`);
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
  
  