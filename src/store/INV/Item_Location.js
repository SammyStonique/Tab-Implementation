import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  locationList: [], 
  locationArr: [],
  locationArray: [],
  locationID: '',
  locationName: '',
  location_name_search: '',
  column_search: '',
  row_search: '',
  selectedLocation: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.locationList = [];
    state.locationArr = [];
    state.locationArray = [];
    state.location_name_search = '';
    state.column_search = '';
    state.row_search = '';
    state.isEditing = false;
    state.selectedLocation = null;
  },
  SET_SELECTED_LOCATION(state, location) {
    state.selectedLocation = location;
    state.isEditing = true;
  },
  LIST_LOCATIONS(state, locations) {
    state.locationList = locations;
  },
  LOCATIONS_ARRAY(state, locations){
    state.locationArray = locations;
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
      if(key == 'location_name_search'){
        state.location_name_search = value;
      }else if(key == 'column_search'){
        state.column_search = value;
      }else if(key == 'row_search'){
        state.row_search = value;
      } 
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.location_name_search = '';
    state.column_search = '';
    state.row_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createAreaLocation({ commit,state }, formData) {
    return axios.post('api/v1/create-item-location/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchAreaLocations({ commit,state }, formData) {
    state.locationArr = [];
    await axios.post(`api/v1/fetch-item-locations/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.locationArr.push((response.data[i].location_name))
      }
      commit('LIST_LOCATIONS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchAreaLocation({ commit,state }, formData) {
    axios.post(`api/v1/fetch-item-locations/`,formData)
    .then((response)=>{
      state.selectedLocation = response.data;
      commit('SET_SELECTED_LOCATION',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedLocation({ commit, state }, option){
    state.locationArr = [];
    const selectedLocation = state.locationList.find(location => (location.location_name) === option);
    if (selectedLocation) {
        state.locationID = selectedLocation.location_id;
        state.locationName = selectedLocation.location_name;
        state.locationArr = [...state.locationArr, selectedLocation];
    }
    commit('LOCATIONS_ARRAY', state.locationArr);
      
  },

  async updateAreaLocation({ commit,state }, formData) {
    return axios.put(`api/v1/update-item-location/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteAreaLocation({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Location?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Location!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-item-location/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Location removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Location",
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
        Swal.fire(`Location has not been deleted!`);
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
  
  