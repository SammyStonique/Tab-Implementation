import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  levyList: [], 
  levyArr: [],
  levyArray: [],
  levyID: '',
  levyRegime: '',
  levy_regime_search: '',
  selectedLevy: null,
  selectedLedger: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.levyList = [];
    state.levyArr = [];
    state.levyArray = [];
    state.levyID = "";
    state.levyRegime = "";
    state.levy_regime_search = '';
    state.selectedLevy = null;
    state.selectedLedger = null;
    state.isEditing = false;
  },
  SET_SELECTED_LEVY(state, levy) {
    state.selectedLevy = levy;
    state.isEditing = true;
  },
  LIST_LEVIES(state, levies) {
    state.levyList = levies;
  },
  LEVIES_ARRAY(state, levies){
    state.levyArray = levies;
  },
  SET_SELECTED_LEDGER(state, ledger) {
    state.selectedLedger = ledger;
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
    state.levy_regime_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createHousingLevy({ commit,state }, formData) {
    return axios.post('api/v1/create-housing-levy/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchHousingLevies({ commit,state }, formData) {
    state.levyArr = [];
    axios.post(`api/v1/get-housing-levies/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.levyArr.push((response.data[i].regime + " - " + response.data[i].date));
      }
      commit('LIST_LEVIES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchHousingLevy({ commit,state }, formData) {
    axios.post(`api/v1/get-housing-levies/`,formData)
    .then((response)=>{
      state.selectedLevy = response.data;
      const selectedLedger = response.data.posting_account.ledger_code + " - " + response.data.posting_account.ledger_name;
      commit('SET_SELECTED_LEVY',response.data);
      commit('SET_SELECTED_LEDGER', selectedLedger);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedLevy({ commit, state }, option){
    state.levyArray = [];
    const selectedLevy = state.levyList.find(levy => (levy.regime + " - " + levy.date) === option);
    if (selectedLevy) {
        state.levyID = selectedLevy.housing_levy_id;
        state.levyRegime = selectedLevy.regime;
        state.levyArray = [...state.levyArray, selectedLevy];
    }
    commit('LEVIES_ARRAY', state.levyArray);
      
  },

  async updateHousingLevy({ commit,state }, formData) {
    return axios.put(`api/v1/update-housing-levy/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteHousingLevy({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Housing Levy?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Housing Levy!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-housing-levy/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Housing Levy removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Housing Levy",
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
        Swal.fire(`Housing Levy has not been deleted!`);
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
  
  