import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    setupsList: [],
    setupArr: [],
    setupArray: [],
    unitCost: 0,
    meterRent: 0,
    selectedSetup: null,
    selectedUtility: null,
    selectedProperty: null,
    isEditing: false
  };
  
  const mutations = {
    LIST_SETUPS(state, setups) {
      state.setupsList = setups;
    },
    SETUPS_ARRAY(state, setups){
      state.setupArray = setups;
    },
    SET_SELECTED_SETUP(state, setup) {
      state.selectedSetup = setup;
      state.isEditing = true;
      console.log("THE SELECTED SETUP IS ",state.selectedSetup)
    },
    SET_SELECTED_PROPERTY(state, property) {
      state.selectedProperty = property;
    },
    SET_SELECTED_UTILITY(state, utility) {
      state.selectedUtility = utility;
    },
    SET_STATE(state, payload) {
      for (const key in payload) {
          if (payload.hasOwnProperty(key) && key in state) {
              state[key] = payload[key];
          }
      }
    },
    RESET_SEARCH_FILTERS(state){
    
    }
  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },

    async createSetup({ commit,state }, formData) {
      return axios.post('api/v1/create-meter-costing/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },

    fetchSetups({ commit,state }, formData) {
      state.setupArr = [];
      axios.post(`api/v1/get-meter-costings/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.setupArr.push((response.data[i].property.name + ' - ' + response.data[i].unit_cost))
        }
        commit('LIST_SETUPS', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },

    fetchSetup({ commit,state }, formData) {
      axios.post(`api/v1/get-meter-costings/`,formData)
      .then((response)=>{
        const selectedUtility = response.data.utility.name;
        const selectedProperty = response.data.property.property_code + ' - '+ response.data.property.name;
        commit('SET_SELECTED_PROPERTY',selectedProperty);
        commit('SET_SELECTED_UTILITY',selectedUtility);
        commit('SET_SELECTED_SETUP',response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },

    handleSelectedSetup({ commit, state }, option){
      state.setupArray = [];
      const selectedSetup = state.setupsList.find(setup => (setup.property.name + ' - ' + setup.unit_cost) === option);
      if (selectedSetup) {
          state.setupID = selectedSetup.meter_costing_id;
          state.unitCost = selectedSetup.unit_cost;
          state.meterRent = selectedSetup.meter_rent;
          state.setupArray = [...state.setupArray, selectedSetup];
      }
      commit('SETUPS_ARRAY', state.setupArray);
        
    },

    async updateSetup({ commit,state }, formData) {
      return axios.put(`api/v1/update-meter-costing/`,formData)
      .then((response)=>{
         return response;   
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
      
    },

    deleteSetup({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Setup(s)?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-meter-costing/`,formData)
          .then((response)=>{
            if(response.status == 200){
                Swal.fire("Poof! Setup(s) removed succesfully!", {
                  icon: "success",
                }); 
            }else{
              Swal.fire({
                title: "Error Deleting Setup(s)",
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
          Swal.fire(`Setup(s) not deleted!`);
        }
      })
    },
  };
  
  const getters = {

  };
  
  export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
  };
  
  