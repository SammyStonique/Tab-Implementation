import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  zonesList: [], 
  zoneArr: [],
  zoneArray: [],
  zoneID: '',
  zoneName: '',
  company_id: '',
  name_search: '',
  selectedZone: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.zonesList = [];
    state.zoneArr = [];
    state.zoneArray = [];
    state.company_id = '';
    state.name_search = '';
    state.isEditing = false;
  },
  SET_SELECTED_ZONE(state, zone) {
    state.selectedZone = zone;
    state.isEditing = true;
  },
  LIST_ZONES(state, zones) {
    state.zonesList = zones;
  },
  ZONES_ARRAY(state, zones){
    state.zoneArray = zones;
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
  
  async createZone({ commit,state }, formData) {
    return axios.post('api/v1/create-zone/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchZones({ commit,state }, formData) {
    state.zoneArr = [];
    axios.post(`api/v1/get-zones/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.zoneArr.push((response.data[i].name))
      }
      commit('LIST_ZONES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchZone({ commit,state }, formData) {
    axios.post(`api/v1/get-zones/`,formData)
    .then((response)=>{
      state.selectedZone = response.data;
      commit('SET_SELECTED_ZONE',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedZone({ commit, state }, option){
    state.zoneArray = [];
    const selectedZone = state.zonesList.find(zone => (zone.name) === option);
    if (selectedZone) {
        state.zoneID = selectedZone.zone_id;
        state.zoneName = selectedZone.name;
        state.zoneArray = [...state.zoneArray, selectedZone];
    }
    commit('ZONES_ARRAY', state.zoneArray);
      
  },

  async updateZone({ commit,state }, formData) {
    return axios.put(`api/v1/update-zone/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteZone({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Zone?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Zone!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-zone/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Zone removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Zone",
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
        Swal.fire(`Zone has not been deleted!`);
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
  
  