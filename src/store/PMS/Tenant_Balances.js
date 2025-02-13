import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  balancesList: [], 
  balanceArr: [],
  balanceArray: [],
  tenantBalances: [],
  balanceID: '',
  balanceDescription: '',
  selectedBalance: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.balancesList = [];
    state.tenantBalances = [];
    state.balanceArr = [];
    state.balanceArray = [];
    state.name_search = '';
    state.selectedBalance = null;
    state.isEditing = false;
  },
  SET_SELECTED_BALANCE(state, balance) {
    state.selectedBalance = balance;
    state.isEditing = true;
  },
  SET_TENANT_BALANCES(state, balance) {
    state.tenantBalances = balance;
  },
  LIST_BALANCES(state, balances) {
    state.balancesList = balances;
  },
  BALANCES_ARRAY(state, balances){
    state.balanceArray = balances;
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
  
  async createTenantBalance({ commit,state }, formData) {
    return axios.post('api/v1/create-tenant-balance/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchBalances({ commit,state }, formData) {
    state.balanceArr = [];
    axios.post(`api/v1/get-tenant-Balances/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.balanceArr.push((response.data[i].description));
      }
      commit('LIST_BALANCES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchBalance({ commit,state }, formData) {
    axios.post(`api/v1/get-tenant-balances/`,formData)
    .then((response)=>{
        commit('SET_SELECTED_BALANCE',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchTenantBalances({ commit,state }, formData){
    axios.post(`api/v1/get-tenant-balances/`,formData)
    .then((response)=>{
        commit('SET_TENANT_BALANCES',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
  },
  handleSelectedBalance({ commit, state }, option){
    const selectedBalance = state.balancesList.find(balance => (balance.description) === option);
    if (selectedBalance) {
        state.balanceID = selectedBalance.tenant_balance_id;
        state.balanceDescription = selectedBalance.description;
        state.balanceArray = [...state.balanceArray, selectedBalance];
    }
    commit('BALANCES_ARRAY', state.balanceArray);
  },

  async updateBalance({ commit,state }, formData) {
    return axios.put(`api/v1/update-tenant-balance/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteBalance({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Balance?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Balance!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-tenant-Balance/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Balance removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Balance",
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
        Swal.fire(`Balance has not been deleted!`);
      }
    })
  },
  removeBalance({commit, state}, index){
    state.balanceArray.splice(index, 1); 
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
  
  