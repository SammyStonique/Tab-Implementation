import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  unitsList: [], 
  unitArr: [],
  unitArray: [],
  unitID: '',
  unitNumber: '',
  unitPrice: 0,
  unit_number_search: '',
  status_search: '',
  vacancy_status_search: '',
  owner_occupied_search: '',
  selectedUnit: null,
  selectedProperty: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.unitsList = [];
    state.unitArr = [];
    state.unitArray = [];
    state.unitID = "";
    state.unitNumber = "";
    state.unitPrice = 0;
    state.unit_number_search = '';
    state.status_search = '';
    state.vacancy_status_search = '';
    state.owner_occupied_search = '';
    state.selectedProperty = null;
    state.isEditing = false;
  },
  SET_SELECTED_UNIT(state, unit) {
    state.selectedUnit = unit;
    state.isEditing = true;
  },
  LIST_UNITS(state, units) {
    state.unitsList = units;
  },
  UNITS_ARRAY(state, units){
    state.unitArray = units;
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
      if(key == 'unit_number_search'){
        state.unit_number_search = value;
      }else if(key == 'status_search'){
        state.status_search = value;
      }
      else if(key == 'vacancy_status_search'){
        state.vacancy_status_search = value;
      } 
      else if(key == 'owner_occupied_search'){
        state.owner_occupied_search = value;
      } 
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.unit_number_search = '';
    state.status_search = '';
    state.vacancy_status_search = '';
    state.owner_occupied_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createUnit({ commit,state }, formData) {
    return axios.post('api/v1/create-property-unit/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchUnits({ commit,state }, formData) {
    state.unitArr = [];
    axios.post(`api/v1/get-property-units/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.unitArr.push((response.data[i].unit_number));
      }
      commit('LIST_UNITS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchUnit({ commit,state }, formData) {
    axios.post(`api/v1/get-property-units/`,formData)
    .then((response)=>{
      state.selectedUnit = response.data;
      commit('SET_SELECTED_UNIT',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedUnit({ commit, state }, option){
    state.unitArray = [];
    const selectedUnit = state.unitsList.find(unit => (unit.unit_number) === option);
    if (selectedUnit) {
        state.unitID = selectedUnit.property_unit_id;
        state.unitNumber = selectedUnit.unit_number;
        state.unitPrice = selectedUnit.market_rent;
        state.unitArray = [...state.unitArray, selectedUnit];
    }
    commit('UNITS_ARRAY', state.unitArray);
      
  },

  async updateUnit({ commit,state }, formData) {
    return axios.put(`api/v1/update-property-unit/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteUnit({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Unit?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Unit!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-property-unit/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Unit removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Unit",
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
        Swal.fire(`Unit has not been deleted!`);
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
  
  