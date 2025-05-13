import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  reservationsList: [], 
  reservationArr: [],
  reservationArray: [],
  reservationDetails: [],
  reservationID: '',
  selectedReservation: null,
  selectedAsset: null,
  selectedClient: null,
  reservedUnits: [],
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.reservationsList = [];
    state.reservationArr = [];
    state.reservationArray = [];
    state.reservationDetails = [];
    state.reservationID = '';
    state.selectedReservation = null;
    state.selectedAsset = null;
    state.selectedClient = null;
    state.reservedUnits = [];
    state.isEditing = false;
  },
  SET_SELECTED_RESERVATION(state, reservation) {
    state.selectedReservation = reservation;
    state.isEditing = true;
  },
  SET_SELECTED_ASSET(state, asset) {
    state.selectedAsset = asset;
  },
  SET_SELECTED_CLIENT(state, client) {
    state.selectedClient = client;
  },
  SET_SELECTED_UNITS(state, units) {
    state.reservedUnits = units;
  },
  LIST_RESERVATIONS(state, reservations) {
    state.reservationsList = reservations;
  },
  RESERVATIONS_ARRAY(state, reservations){
    state.reservationArray = reservations;
  },
  SET_RESERVATION_DETAILS(state, details){
    state.reservationDetails = details;
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
  
  async createUnitReservation({ commit,state }, formData) {
    return axios.post('api/v1/create-unit-reservation/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchUnitReservations({ commit,state }, formData) {
    state.reservationArr = [];
    axios.post(`api/v1/get-unit-reservations/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.reservationArr.push((response.data[i].asset.name + " - " + response.data[i].client_name + " (" + response.data[i].date + ")"));
      }
      commit('LIST_RESERVATIONS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchUnitReservation({ commit,state }, formData) {
    axios.post(`api/v1/get-unit-reservations/`,formData)
    .then((response)=>{
      state.selectedReservation = response.data;
      state.reservedUnits = response.data.reserved_units;
      commit('SET_SELECTED_RESERVATION',response.data);
      commit('SET_SELECTED_UNITS',response.data.reserved_units);
      commit('SET_SELECTED_ASSET',response.data.asset.asset_code + " - " + response.data.asset.name);
      commit('SET_SELECTED_CLIENT',(response.data.customer != null) ? (response.data.customer.client_code + " - "+ response.data.customer.client_name) : "");
      commit('SET_RESERVATION_DETAILS',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedReservation({ commit, state }, option){
    state.reservationArray = [];
    const selectedReservation = state.reservationsList.find(reservation => (reservation.asset.name + " - " + reservation.client_name + " (" + reservation.date + ")") === option);
    if (selectedReservation) {
        state.reservationID = selectedReservation.unit_reservation_id;
        state.reservationArray = [...state.reservationArray, selectedReservation];
    }
    commit('RESERVATIONS_ARRAY', state.reservationArray);
      
  },

  async updateUnitReservation({ commit,state }, formData) {
    return axios.put(`api/v1/update-unit-reservation/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteUnitReservation({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Reservation?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Reservation!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-unit-reservation/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Reservation removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Reservation",
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
        Swal.fire(`Reservation has not been deleted!`);
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
  
  