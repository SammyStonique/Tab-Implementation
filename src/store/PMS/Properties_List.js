import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  propertyList: [], 
  propertyArr: [],
  propArray: [],
  propertyID: '',
  propertyName: '',
  company_id: '',
  name_search: '',
  property_code_search: '',
  status_search: '',
  vacancy_status_search: '',
  selectedProperty: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.propertyList = [];
    state.propertyArr = [];
    state.propArray = [];
    state.company_id = '';
    state.name_search = '';
    state.property_code_search = '';
    state.status_search = '';
    state.vacancy_status_search = '';
    state.isEditing = false;
  },
  SET_SELECTED_PROPERTY(state, property) {
    state.selectedProperty = property;
    state.isEditing = true;
  },
  LIST_PROPERTIES(state, properties) {
    state.propertyList = properties;
  },
  PROPERTIES_ARRAY(state, properties){
    state.propArray = properties;
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
      }else if(key == 'property_code_search'){
        state.property_code_search = value;
      }else if(key == 'status_search'){
          state.status_search = value;
      }else if(key == 'vacancy_status_search'){
          state.vacancy_status_search = value;
      }   
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.name_search = '';
    state.property_code_search = '';
    state.status_search = '';
    state.id_number_search = '';
    state.vacancy_status_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createProperty({ commit,state }, formData) {
    return axios.post('api/v1/create-property/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchProperties({ commit,state }, formData) {
    state.propertyArr = [];
    axios.post(`api/v1/get-properties/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.propertyArr.push((response.data[i].property_code + ' - ' + response.data[i].name))
      }
      commit('LIST_PROPERTIES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchProperty({ commit,state }, formData) {
    axios.post(`api/v1/get-properties/`,formData)
    .then((response)=>{
      state.selectedProperty = response.data;
      commit('SET_SELECTED_PROPERTY',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedProperty({ commit, state }, option){
    state.propArray = [];
    const selectedProp = state.propertyList.find(prop => (prop.property_code + ' - ' + prop.name) === option);
    if (selectedProp) {
        state.propertyID = selectedProp.property_id;
        state.propertyName = selectedProp.name;
        state.propArray = [...state.propArray, selectedProp];
    }
    commit('PROPERTIES_ARRAY', state.propArray);
      
  },

  async updateProperty({ commit,state }, formData) {
    return axios.put(`api/v1/update-property/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteProperty({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Property?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Property!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-property/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Property removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Property",
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
        Swal.fire(`Property has not been deleted!`);
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
  
  