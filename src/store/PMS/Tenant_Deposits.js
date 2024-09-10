import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    depositsList: [],
    tenantLeaseArr: [],
    tenantArray: [],
    tenantLease: [],
    tenantLeaseID: '',
    tenant_name_search: '',
    tenant_code_search: '',
    posted_search: '',
    from_date_search: '',
    to_date_search: '',
    selectedDeposit: null,
    isEditing: false
  };
  
  const mutations = {
    LIST_TENANT_DEPOSITS(state, deposits) {
      state.depositsList = deposits;
    },
    TENANTS_ARRAY(state, tenants){
        state.tenantArray = tenants;
    },
    SET_TENANT_LEASE(state, tenant){
        state.tenantLease = tenant;
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
      state.posted_search = '';
      state.from_date_search = '';
      state.to_date_search = '';
      state.tenant_code_search = ''
    }
  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },

    fetchTenantLease({ commit,state }, formData) {
        state.tenantLeaseArr = [];
        axios.post(`api/v1/get-tenant-leases/`,formData)
        .then((response)=>{
            commit('SET_TENANT_LEASE',response.data);
            for(let i=0; i< response.data.length; i++){
                state.tenantLeaseArr.push((response.data[i].tenant.tenant_code + ' - ' + response.data[i].tenant.tenant_name))
            }
        })
        .catch((error)=>{
          console.log(error.message);
        })
        
    },
    handleSelectedTenantLease({ commit, state }, option){
        state.tenantArray = [];
        const selectedTnt = state.tenantLease.find(tenant => (tenant.tenant.tenant_code + ' - ' + tenant.tenant.tenant_name) === option);
        if (selectedTnt) {
            state.tenantLeaseID = selectedTnt.tenant_lease_id;
            state.tenantArray = [...state.tenantArray, selectedTnt];
        }
        commit('TENANTS_ARRAY', state.tenantArray);
          
    },
    async createTenantDeposit({ commit,state }, formData) {
        return axios.post('api/v1/create-tenant-deposit/', formData)
        .then((response)=>{
          return response;
        })
        .catch((error)=>{
          console.log(error.message);
          throw error;
        })
    },
    deleteTenantDeposit({ commit,state }, formData) {
        Swal.fire({
          title: "Are you sure?",
          text: `Do you wish to delete Deposit?`,
          type: 'warning',
          showCloseButton: true,
          showCancelButton: true,
          confirmButtonText: 'Yes Delete Deposit!',
          cancelButtonText: 'Cancel!',
          customClass: {
              confirmButton: 'swal2-confirm-custom',
              cancelButton: 'swal2-cancel-custom',
          },
          showLoaderOnConfirm: true,
        }).then((result) => {
          if (result.value) {
            axios.post(`api/v1/delete-tenant-deposit/`,formData)
            .then((response)=>{
              if(response.data.msg == "Success"){
                  Swal.fire("Poof! Deposit removed succesfully!", {
                    icon: "success",
                  }); 
              }else if(response.data.msg == "Failed"){
                Swal.fire({
                  title: "The Deposit Has An Invoice",
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
            Swal.fire(`Deposit has not been deleted!`);
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
  
  