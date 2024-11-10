import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  companiesList: [], 
  companyArr: [],
  companyArray: [],
  companyID: '',
  companyName: '',
  company_id: '',
  name_search: '',
  status_search: '',
  selectedCompany: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.companiesList = [];
    state.companyArr = [];
    state.companyArray = [];
    state.company_id = '';
    state.name_search = '';
    state.status_search = '';
    state.isEditing = false;
    state.selectedCompany = null;
  },
  SET_SELECTED_COMPANY(state, company) {
    state.selectedCompany = company;
    state.isEditing = true;
  },
  LIST_COMPANIES(state, company) {
    state.companiesList = company;
  },
  COMPANIES_ARRAY(state, company){
    state.companyArray = company;
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
      }else if(key == 'status_search'){
        state.status_search = value;
      }
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.name_search = '';
    state.status_search = "";
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createCompany({ commit,state }, formData) {
    return axios.post('api/v1/company-list/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchCompanies({ commit,state }, formData) {
    state.companyArr = [];
    await axios.post(`api/v1/companies-search/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.results.length; i++){
        state.companyArr.push((response.data.results[i].name))
      }
      commit('LIST_COMPANIES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },

  fetchCompany({ commit,state }, formData) {
    axios.post(`api/v1/companies-search/`,formData)
    .then((response)=>{
      state.selectedCompany = response.data.results[0];
      state.companyID = String(response.data.results[0].company_id);
      commit('SET_SELECTED_COMPANY',response.data.results[0]);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedCompany({ commit, state }, option){
    state.companyArray = [];
    const selectedCompany = state.companiesList.find(company => (company.name) === option);
    if (selectedCompany) {
        state.companyID = selectedCompany.company_id;
        state.companyName = selectedCompany.name;
        state.companyArray = [...state.companyArray, selectedCompany];
    }
    commit('COMPANIES_ARRAY', state.companyArray);
      
  },

  async updateCompany({ commit,state }, formData) {
    return axios.put("api/v1/update-company/",formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  lockCompany({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to lock Company?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Lock Company!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.put(`api/v1/update-company/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Company Locked succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Locking Company",
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
        Swal.fire(`Company has not been locked!`);
      }
    })
  },

  unlockCompany({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to unlock Company?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Unlock Company!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.put(`api/v1/update-company/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Company Unlocked succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Unlocking Company",
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
        Swal.fire(`Company has not been Unlocked!`);
      }
    })
  },

  deleteCompany({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Company?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Company!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-company/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Company removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Company",
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
        Swal.fire(`Company has not been deleted!`);
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
  
  