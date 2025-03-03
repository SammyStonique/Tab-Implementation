import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  indicatorsList: [], 
  indicatorArr: [],
  indicatorArray: [],
  indicatorID: '',
  indicatorName: '',
  selectedIndicator: null,
  selectedCategory: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.indicatorsList = [];
    state.indicatorArr = [];
    state.indicatorArray = [];
    state.indicatorID = '';
    state.indicatorName = '';
    state.selectedIndicator = null;
    state.selectedCategory = null;
    state.isEditing = false;
  },
  SET_SELECTED_INDICATOR(state, indicator) {
    state.selectedIndicator = indicator;
    state.isEditing = true;
  },
  SET_SELECTED_CATEGORY(state, category) {
    state.selectedCategory = category;
  },
  LIST_INDICATORS(state, indicators) {
    state.indicatorsList = indicators;
  },
  INDICATORS_ARRAY(state, indicators){
    state.indicatorArray = indicators;
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
  
  async createPerformanceIndicator({ commit,state }, formData) {
    return axios.post('api/v1/create-performance-indicator/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchPerformanceIndicators({ commit,state }, formData) {
    state.indicatorArr = [];
    axios.post(`api/v1/get-performance-indicators/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.indicatorArr.push((response.data[i].indicator_name));
      }
      commit('LIST_INDICATORS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchPerformanceIndicator({ commit,state }, formData) {
    axios.post(`api/v1/get-performance-indicators/`,formData)
    .then((response)=>{
      state.selectedIndicator = response.data;
      const selectedCategory = response.data.category.category_name;
      commit('SET_SELECTED_CATEGORY',selectedCategory);
      commit('SET_SELECTED_INDICATOR',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedIndicator({ commit, state }, option){
    state.indicatorArray = [];
    const selectedIndicator = state.indicatorsList.find(indicator => (indicator.indicator_name) === option);
    if (selectedIndicator) {
        state.indicatorID = selectedIndicator.performance_indicator_id;
        state.indicatorName = selectedIndicator.indicator_name;
        state.indicatorArray = [...state.indicatorArray, selectedIndicator];
    }
    commit('IndicatorS_ARRAY', state.IndicatorArray);
      
  },

  async updatePerformanceIndicator({ commit,state }, formData) {
    return axios.put(`api/v1/update-performance-indicator/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deletePerformanceIndicator({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Indicator?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Indicator!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-performance-indicator/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Indicator removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Indicator",
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
        Swal.fire(`Indicator has not been deleted!`);
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
  
  