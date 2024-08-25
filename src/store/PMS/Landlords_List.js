import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  landlordsList: [], 
  landlordArr: [],
  landlordArray: [],
  landlordID: '',
  landlordName: '',
  company_id: '',
  name_search: '',
  landlord_code_search: '',
  selectedLandlord: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.landlordsList = [];
    state.landlordArr = [];
    state.landlordArray = [];
    state.company_id = '';
    state.name_search = '';
    state.landlord_code_search = '';
    state.isEditing = false;
  },
  SET_SELECTED_LANDLORD(state, landlord) {
    state.selectedLandlord = landlord;
    state.isEditing = true;
  },
  LIST_LANDLORDS(state, landlords) {
    state.landlordsList = landlords;
  },
  LANDLORDS_ARRAY(state, landlords){
    state.landlordArray = landlords;
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
      }else if(key == 'landlord_code_search'){
        state.landlord_code_search = value;
      }  
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.name_search = '';
    state.landlord_code_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createLandlord({ commit,state }, formData) {
    return axios.post('api/v1/create-landlord/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchLandlords({ commit,state }, formData) {
    state.landlordArr = [];
    axios.post(`api/v1/get-landlords/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.landlordArr.push((response.data[i].landlord_code + " - " +response.data[i].name))
      }
      commit('LIST_LANDLORDS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLandlord({ commit,state }, formData) {
    axios.post(`api/v1/get-landlords/`,formData)
    .then((response)=>{
      state.selectedLandlord = response.data;
      commit('SET_SELECTED_LANDLORD',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedLandlord({ commit, state }, option){
    state.landlordArray = [];
    const selectedLandlord = state.landlordsList.find(landlord => (landlord.landlord_code + ' - ' + landlord.name) === option);
    if (selectedLandlord) {
        state.landlordID = selectedLandlord.landlord_id;
        state.landlordName = selectedLandlord.name;
        state.landlordArray = [...state.landlordArray, selectedLandlord];
    }
    commit('LANDLORDS_ARRAY', state.landlordArray);
      
  },

  async updateLandlord({ commit,state }, formData) {
    return axios.put(`api/v1/update-landlord/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteLandlord({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Landlord?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Landlord!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-landlord/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Landlord removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Landlord",
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
        Swal.fire(`Landlord has not been deleted!`);
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
  
  