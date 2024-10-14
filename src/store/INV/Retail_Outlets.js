import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  outletsList: [], 
  outletArr: [],
  outletArray: [],
  outletID: '',
  outletName: '',
  warehouse_name_search: '',
  area_location_search: '',
  retail_type_search: '',
  selectedOutlet: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.outletsList = [];
    state.outletArr = [];
    state.outletArray = [];
    state.outletID = '';
    state.outletName = '';
    state.warehouse_name_search = '';
    state.area_location_search = '';
    state.retail_type_search = '';
    state.isEditing = false;
    state.selectedOutlet = null;
  },
  SET_SELECTED_OUTLET(state, outlet) {
    state.selectedOutlet = outlet;
    state.isEditing = true;
  },
  LIST_OUTLETS(state, outlets) {
    state.outletsList = outlets;
  },
  OUTLETS_ARRAY(state, outlets){
    state.outletArray = outlets;
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
      if(key == 'warehouse_name_search'){
        state.warehouse_name_search = value;
      }else if(key == 'area_location_search'){
        state.area_location_search = value;
      }else if(key == 'retail_type_search'){
        state.retail_type_search = value;
      }
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.warehouse_name_search = '';
    state.area_location_search = '';
    state.retail_type_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createOutlet({ commit,state }, formData) {
    return axios.post('api/v1/create-warehouse/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchOutlets({ commit,state }, formData) {
    state.outletArr = [];
    await axios.post(`api/v1/fetch-warehouses/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.outletArr.push((response.data[i].warehouse_name))
      }
      commit('LIST_OUTLETS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchOutlet({ commit,state }, formData) {
    axios.post(`api/v1/fetch-warehouses/`,formData)
    .then((response)=>{
      state.selectedOutlet = response.data;
      commit('SET_SELECTED_OUTLET',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedOutlet({ commit, state }, option){
    state.outletArray = [];
    const selectedOutlet = state.outletsList.find(outlet => (outlet.warehouse_name) === option);
    if (selectedOutlet) {
        state.outletID = selectedOutlet.warehouse_id;
        state.outletName = selectedOutlet.warehouse_name;
        state.outletArray = [...state.outletArray, selectedOutlet];
    }
    commit('OUTLETS_ARRAY', state.outletArray);
      
  },

  async updateOutlet({ commit,state }, formData) {
    return axios.put(`api/v1/update-warehouse/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteOutlet({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Outlet?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Outlet!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-warehouse/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Outlet removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Outlet Has A Counter",
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
        Swal.fire(`Outlet has not been deleted!`);
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
  
  