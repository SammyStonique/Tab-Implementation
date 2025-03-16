import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    documentList: [],
    documentArr: [],
    documentArray: [],
    documentID: "",
    selectedDocument: null,
    selectedApplication: null,
    isEditing: "",
  };
  
  const mutations = {
    initializeStore(state){
      state.documentList = [];
      state.documentArr = [];
      state.documentArray = [];
      state.documentID = '';
      state.selectedDocument = null;
      state.selectedApplication = null;
      state.isEditing = false;
    },
    SET_SELECTED_DOCUMENT(state, document) {
      state.selectedDocument = document;
      state.isEditing = true;
    },
    DOCUMENTS_ARRAY(state, documents){
      state.documentArray = documents;
    },
    LIST_LOAN_DOCUMENTS(state, documents) {
      state.documentList = documents;
    },
    SET_SELECTED_APPLICATION(state, application) {
        state.selectedApplication = application;
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
    
    async createLoanDocument({ commit,state }, formData) {
      return axios.post('api/v1/create-loan-document/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },
    attachLoanDocument({commit, state}, formData){
      state.documentArray.push(formData); 
      commit('DOCUMENTS_ARRAY', state.documentArray);
    },
  
    fetchLoanDocuments({ commit,state }, formData) {
      state.documentArr = [];
      axios.post(`api/v1/get-loan-documents/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.documentArr.push((response.data[i].loan_application.loan_number + " - " + response.data[i].document_name + " - " + response.data[i].loan_application.member.member_name + "(" + response.data[i].loan_application.member.member_number + ")"));
        }
        commit('LIST_LOAN_DOCUMENTS', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    fetchLoanDocument({ commit,state }, formData) {
      axios.post(`api/v1/get-loan-documents/`,formData)
      .then((response)=>{
        state.selectedDocument = response.data;
        const selectedApplication = response.data[i].loan_application.loan_number + " - " + response.data[i].loan_application.loan_product.product_name + " - " + response.data[i].loan_application.member.member_name;
        commit('SET_SELECTED_DOCUMENT',response.data);
        commit('SET_SELECTED_APPLICATION', selectedApplication);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    handleSelectedDocument({ commit, state }, option){
      state.documentArray = [];
      const selectedDocument = state.documentList.find(document => (document.loan_application.loan_number + " - " + document.document_name + " - " + document.loan_application.member.member_name + "(" + document.loan_application.member.member_number + ")") === option);
      if (selectedDocument) {
          state.documentID = selectedDocument.loan_document_id;
          state.documentArray = [...state.documentArray, selectedDocument];
      }
      commit('DOCUMENTS_ARRAY', state.documentArray);
        
    },
  
    deleteLoanDocument({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Document?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete Document!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-loan-document/`,formData)
          .then((response)=>{
            if(response.status == 200){
                Swal.fire("Poof! Document removed succesfully!", {
                  icon: "success",
                }); 
            }else{
              Swal.fire({
                title: "Error Deleting Document",
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
          Swal.fire(`Document has not been deleted!`);
        }
      })
    },
    removeLoanDocument({commit, state}, index){
      state.documentArray.splice(index, 1); 
      commit('DOCUMENTS_ARRAY', state.documentArray);
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
  
  