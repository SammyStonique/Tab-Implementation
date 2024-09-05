import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    readingsList: [],
    readingArr: [],
    readingArray: [],
    tenantReadings: [],
    readingID: '',
    tenant_name_search: '',
    tenant_code_search: '',
    from_date_search: '',
    to_date_search: '',
    selectedReading: null,
    isEditing: false
  };
  
  const mutations = {
    LIST_METER_READINGS(state, readings) {
      state.readingsList = readings;
    },
    READINGS_ARRAY(state, readings){
        state.readingArray = readings;
    },
    SET_SELECTED_READING(state, reading){
      state.selectedReading = reading;
    },
    SET_TENANT_READINGS(state, readings){
      state.tenantReadings = readings;
    },
    SET_SEARCH_FILTERS(state, search_filter){
      for(const [key, value] of Object.entries(search_filter)){
        if(key == 'tenant_name_search'){
          state.tenant_name_search = value;
        }else if(key == 'tenant_code_search'){
          state.tenant_code_search = value;
        } 
        else if(key == 'posted_search'){
            state.posted_search = value;
        } 
        else if(key == 'from_date_search'){
          state.from_date_search = value;
        } 
        else if(key == 'to_date_search'){
          state.to_date_search = value;
        } 
      }
    },

    SET_STATE(state, payload) {
      for (const key in payload) {
          if (payload.hasOwnProperty(key) && key in state) {
              state[key] = payload[key];
          }
      }
    },
    RESET_SEARCH_FILTERS(state){
      state.tenant_name_search = '';
      state.from_date_search = '';
      state.to_date_search = '';
      state.tenant_code_search = ''
    }
  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },
    async createMeterReading({ commit,state }, formData) {
      return axios.post('api/v1/create-meter-reading/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },
    async createBatchMeterReading({ commit,state }, formData) {
      return axios.post('api/v1/create-batch-meter-reading/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },
    fetchMeterReadings({ commit,state }, formData) {
      state.readingArr = [];
      axios.post(`api/v1/get-meter-readings/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.readingArr.push((response.data[i].meter_costing.utility.name + ' Meter Reading for ' + response.data[i].unit.unit.unit_number + ' - '+ response.data[i].unit.tenant.tenant.tenant_name ))
        }
        commit('LIST_METER_READINGS', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    fetchMeterReading({ commit,state }, formData) {
      axios.post(`api/v1/get-meter-readings/`,formData)
      .then((response)=>{
        commit('SET_SELECTED_READING',response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    fetchTenantReadings({ commit,state }, formData) {
      axios.post(`api/v1/tenants-meter-readings-search/`,formData)
      .then((response)=>{
        commit('SET_TENANT_READINGS',response.data.results);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    handleSelectedReading({ commit, state }, option){
        state.readingArray = [];
        const selectedReading = state.readingsList.find(reading => (reading.meter_costing.utility.name + ' Meter Reading for ' + reading.unit.unit.unit_number + ' - '+ reading.unit.tenant.tenant.tenant_name ) === option);
        if (selectedReading) {
            state.readingID = selectedReading.meter_reading_id;
            state.readingArray = [...state.tenantArray, selectedReading];
        }
        commit('READINGS_ARRAY', state.tenantArray);
          
    },

    deleteMeterReading({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Meter Reading?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete Meter Reading!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-meter-reading/`,formData)
          .then((response)=>{
            if(response.status == 200){
                Swal.fire("Poof! Meter Reading removed succesfully!", {
                  icon: "success",
                }); 
            }else{
              Swal.fire({
                title: "Error Deleting Meter Reading",
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
          Swal.fire(`Meter Reading has not been deleted!`);
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
  
  