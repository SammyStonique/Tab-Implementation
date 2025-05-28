import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    documentList: [],
    documentArr: [],
    documentArray: [],
    documentID: "",
    selectedDocument: null,
    selectedSale: null,
    isEditing: "",
  };
  
  const mutations = {
    initializeStore(state){
      state.documentList = [];
      state.documentArr = [];
      state.documentArray = [];
      state.documentID = '';
      state.selectedDocument = null;
      state.selectedSale = null;
      state.isEditing = false;
    },
    SET_SELECTED_DOCUMENT(state, document) {
      state.selectedDocument = document;
      state.isEditing = true;
    },
    DOCUMENTS_ARRAY(state, documents){
      state.documentArray = documents;
    },
    LIST_SALE_DOCUMENTS(state, documents) {
      state.documentList = documents;
    },
    SET_SELECTED_SALE(state, application) {
        state.selectedSale = application;
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
    
    async createSaleDocument({ commit,state }, formData) {
      return axios.post('api/v1/create-asset-sale-document/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },
    attachSaleDocument({commit, state}, formData){
      state.documentArray.push(formData); 
      commit('DOCUMENTS_ARRAY', state.documentArray);
    },
  
    fetchSaleDocuments({ commit,state }, formData) {
      state.documentArr = [];
      axios.post(`api/v1/get-asset-sale-documents/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.documentArr.push((response.data[i].asset_sale.sale_code + " - " + response.data[i].document_name + " - " + response.data[i].asset_sale.customer.client_name + "(" + response.data[i].asset_sale.customer.client_code + ")"));
        }
        commit('LIST_SALE_DOCUMENTS', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    fetchSaleDocument({ commit,state }, formData) {
      axios.post(`api/v1/get-asset-sale-documents/`,formData)
      .then((response)=>{
        state.selectedDocument = response.data;
        const selectedSale = response.data[i].asset_sale.sale_code + " - " + response.data[i].asset_sale.customer.client_name + " - " + response.data[i].asset_sale.asset.name;
        commit('SET_SELECTED_DOCUMENT',response.data);
        commit('SET_SELECTED_SALE', selectedSale);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    handleSelectedDocument({ commit, state }, option){
      state.documentArray = [];
      const selectedDocument = state.documentList.find(document => (document.asset_sale.sale_code + " - " + document.document_name + " - " + document.asset_sale.customer.client_name + "(" + document.asset_sale.customer.client_code + ")") === option);
      if (selectedDocument) {
          state.documentID = selectedDocument.sale_document_id;
          state.documentArray = [...state.documentArray, selectedDocument];
      }
      commit('DOCUMENTS_ARRAY', state.documentArray);
        
    },
  
    deleteSaleDocument({ commit,state }, formData) {
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
          axios.post(`api/v1/delete-asset-sale-document/`,formData)
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
    removeSaleDocument({commit, state}, index){
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
  
  