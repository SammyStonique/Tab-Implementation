import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    classificationList: [],
    classificationArr: [],
    classificationArray: [],
    classificationID: "",
    selectedClassification: null,
    isEditing: "",
    classification_name_search: '',
  };
  
  const mutations = {
    initializeStore(state){
      state.classificationList = [];
      state.classificationArr = [];
      state.classificationArray = [];
      state.classificationID = '';
      state.classification_name_search = '';
      state.selectedClassification = null;
      state.isEditing = false;
    },
    SET_SELECTED_CLASS(state, classification) {
      state.selectedClassification = classification;
      state.isEditing = true;
    },
    CLASSES_ARRAY(state, classifications){
      state.classificationArray = classifications;
    },
    LIST_RISK_CLASSES(state, classifications) {
      state.classificationList = classifications;
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
        if(key == 'classification_name_search'){
          state.classification_name_search = value;
        } 
      }
    },
    RESET_SEARCH_FILTERS(state){
      state.classification_name_search = '';
    }

  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },
    
    async createRiskClassification({ commit,state }, formData) {
      return axios.post('api/v1/create-loan-risk-classification/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },
  
    fetchRiskClassifications({ commit,state }, formData) {
      state.classificationArr = [];
      axios.post(`api/v1/get-loan-risk-classifications/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.classificationArr.push((response.data[i].classification_name));
        }
        commit('LIST_RISK_CLASSES', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    fetchRiskClassification({ commit,state }, formData) {
      axios.post(`api/v1/get-loan-risk-classifications/`,formData)
      .then((response)=>{
        state.selectedClassification = response.data;
        commit('SET_SELECTED_CLASS',response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    handleSelectedClassification({ commit, state }, option){
      state.classificationArray = [];
      const selectedClassification = state.classificationList.find(classification => (classification.classification_name) === option);
      if (selectedClassification) {
          state.classificationID = selectedClassification.risk_classification_id;
          state.classificationArray = [...state.classificationArray, selectedClassification];
      }
      commit('CLASSES_ARRAY', state.classificationArray);
        
    },
  
    async updateRiskClassification({ commit,state }, formData) {
      return axios.put(`api/v1/update-loan-risk-classification/`,formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })  
    },
  
    deleteRiskClassification({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Classification?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete Classification!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-loan-risk-classification/`,formData)
          .then((response)=>{
            if(response.status == 200){
                Swal.fire("Poof! Classification removed succesfully!", {
                  icon: "success",
                }); 
            }else{
              Swal.fire({
                title: "Error Deleting Classification",
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
          Swal.fire(`Classification has not been deleted!`);
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
  
  