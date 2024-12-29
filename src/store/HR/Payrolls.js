import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  payrollsList: [], 
  payrollArr: [],
  payrollArray: [],
  payrollID: '',
  payrollMonth: '',
  name_search: '',
  selectedPayroll: null,
  leaveHolidaysArray: [],
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.payrollsList = [];
    state.payrollArr = [];
    state.payrollArray = [];
    state.name_search = '';
    state.isEditing = false;
    state.selectedPayroll = null;
    state.leaveHolidaysArray = [];
  },
  SET_SELECTED_PAYROLL(state, payroll) {
    state.selectedPayroll = payroll;
    state.isEditing = true;
  },
  LIST_PAYROLLS(state, payrolls) {
    state.payrollsList = payrolls;
  },
  PAYROLLS_ARRAY(state, payrolls){
    state.payrollArray = payrolls;
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
      }  
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.name_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createPayroll({ commit,state }, formData) {
    return axios.post('api/v1/create-payroll/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchPayrolls({ commit,state }, formData) {
    state.payrollArr = [];
    await axios.post(`api/v1/get-holidays/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.payrollArr.push((response.data[i].month + " " + response.data[i].year))
      }
      commit('LIST_PAYROLLS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchPayroll({ commit,state }, formData) {
    axios.post(`api/v1/get-payrolls/`,formData)
    .then((response)=>{
      state.selectedPayroll = response.data;
      commit('SET_SELECTED_PAYROLL',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedPayroll({ commit, state }, option){
    const selectedPayroll = state.payrollsList.find(payroll => (payroll.month + " " + payroll.year) === option);
    if (selectedPayroll) {
        state.payrollID = selectedPayroll.payroll_id;
        state.payrollMonth = selectedPayroll.month;
        state.payrollArray = [...state.payrollArray, selectedPayroll];
    }
    commit('PAYROLLS_ARRAY', state.payrollArray);
      
  },

  async updatePayroll({ commit,state }, formData) {
    return axios.put(`api/v1/update-payroll/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deletePayroll({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Payroll?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Payroll!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-payroll/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Payroll removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Payroll",
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
        Swal.fire(`Payroll has not been deleted!`);
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
  
  