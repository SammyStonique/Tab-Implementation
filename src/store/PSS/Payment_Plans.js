import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  plansList: [], 
  planArr: [],
  purchasePlanArr: [],
  salePlanArr: [],
  planArray: [],
  purchasePlanArray: [],
  salePlanArray: [],
  planID: '',
  planName: '',
  payMode: '',
  depositMode : '',
  depositValue : 0,
  installments : 1,
  interestMethod : '',
  interestValue : 0,
  interestMode : '',
  balanceMode : '',
  selectedPlan: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.plansList = [];
    state.planArr = [];
    state.planArray = [];
    state.isEditing = false;
    state.selectedPlan = null;
  },
  SET_SELECTED_PLAN(state, Plan) {
    state.selectedPlan = Plan;
    state.isEditing = true;
  },
  LIST_PLANS(state, Plans) {
    state.plansList = Plans;
  },
  PLANS_ARRAY(state, Plans){
    state.planArray = Plans;
  },
  PURCHASE_PLANS_ARRAY(state, Plans){
    state.purchasePlanArray = Plans;
  },
  SALE_PLANS_ARRAY(state, Plans){
    state.salePlanArray = Plans;
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
  
  async createPaymentPlan({ commit,state }, formData) {
    return axios.post('api/v1/create-payment-plan/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchPaymentPlans({ commit,state }, formData) {
    state.planArr = [];
    await axios.post(`api/v1/get-payment-plans/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.planArr.push((response.data[i].name + " - Pay. Mode: " + response.data[i].payment_mode + ", Instlmnts: "+ response.data[i].installments))
      }
      commit('LIST_PLANS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  async fetchSalePlans({ commit,state }, formData) {
    state.salePlanArr = [];
    await axios.post(`api/v1/get-payment-plans/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.salePlanArr.push((response.data[i].name + " - Pay. Mode: " + response.data[i].payment_mode + ", Instlmnts: "+ response.data[i].installments))
      }
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  async fetchAssetSalePlans({ commit,state }, formData) {
    state.salePlanArr = [];
    await axios.post(`api/v1/get-asset-sale-plans/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.salePlanArr.push((response.data[i].payment_plan.name + " - Pay. Mode: " + response.data[i].payment_plan.payment_mode + ", Instlmnts: "+ response.data[i].installments))
      }
      commit('LIST_PLANS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  async fetchPurchasePlans({ commit,state }, formData) {
    state.purchasePlanArr = [];
    await axios.post(`api/v1/get-payment-plans/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.purchasePlanArr.push((response.data[i].name + " - Pay. Mode: " + response.data[i].payment_mode + ", Instlmnts: "+ response.data[i].installments))
      }
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchPaymentPlan({ commit,state }, formData) {
    axios.post(`api/v1/get-payment-plans/`,formData)
    .then((response)=>{
      state.selectedPlan = response.data;
      commit('SET_SELECTED_PLAN',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedPaymentPlan({ commit, state }, option){
    state.planArray = [];
    const selectedPlan = state.plansList.find(plan => (plan.name + " - Pay. Mode: " + plan.payment_mode + ", Instlmnts: "+ plan.installments) === option);
    if (selectedPlan) {
        state.planID = selectedPlan.payment_plan_id;
        state.planName = selectedPlan.name;
        selectedPlan.options = [{ text: 'Percentage', value: 'Percentage' },{ text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'None', value: 'None' }];
        selectedPlan.asset_sale_plan_id = null;
        state.planArray = [...state.planArray, selectedPlan];
        const exists = state.planArray.some(plan => plan.payment_plan_id === selectedPlan.payment_plan_id);
        if (!exists) {
            state.planArray = [...state.planArray, selectedPlan];
        }
    }
    commit('PLANS_ARRAY', state.planArray);
      
  },
  handleSelectedPurchasePlan({ commit, state }, option){
    state.purchasePlanArray = [];
    const selectedPlan = state.plansList.find(plan => (plan.name + " - Pay. Mode: " + plan.payment_mode + ", Instlmnts: "+ plan.installments) === option);
    if (selectedPlan) {
        state.planID = selectedPlan.payment_plan_id;
        state.planName = selectedPlan.name;
        selectedPlan.options = [{ text: 'Percentage', value: 'Percentage' },{ text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'None', value: 'None' }];
        selectedPlan.asset_sale_plan_id = null;
        const exists = state.purchasePlanArray.some(plan => plan.payment_plan_id === selectedPlan.payment_plan_id);
        if (!exists) {
            state.purchasePlanArray = [...state.purchasePlanArray, selectedPlan];
        }
    }
    commit('PURCHASE_PLANS_ARRAY', state.purchasePlanArray);
      
  },
  handleSelectedSalePlan({ commit, state }, option){
    state.salePlanArray = [];
    const selectedPlan = state.plansList.find(plan => (plan.name + " - Pay. Mode: " + plan.payment_mode + ", Instlmnts: "+ plan.installments) === option);
    if (selectedPlan) {
        state.planID = selectedPlan.payment_plan_id;
        state.planName = selectedPlan.name;
        selectedPlan.options = [{ text: 'Percentage', value: 'Percentage' },{ text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'None', value: 'None' }];
        selectedPlan.asset_sale_plan_id = null;
        const exists = state.salePlanArray.some(plan => plan.payment_plan_id === selectedPlan.payment_plan_id);
        if (!exists) {
            state.salePlanArray = [...state.salePlanArray, selectedPlan];
        }
    }
    commit('SALE_PLANS_ARRAY', state.salePlanArray);
      
  },
  handleSelectedAssetSalePlan({ commit, state }, option){

    const selectedPlan = state.plansList.find(plan => (plan.payment_plan.name + " - Pay. Mode: " + plan.payment_plan.payment_mode + ", Instlmnts: "+ plan.installments) === option);
    if (selectedPlan) {
        state.planID = selectedPlan.asset_sale_plan_id;
        state.planName = selectedPlan.payment_plan.name;
        state.payMode = selectedPlan.payment_plan.payment_mode;
        state.depositMode = selectedPlan.deposit_mode;
        state.depositValue = selectedPlan.deposit_value;
        state.installments = selectedPlan.installments;
        state.interestMethod = selectedPlan.payment_plan.interest_method;
        state.interestValue = selectedPlan.payment_plan.interest_value;
        state.interestMode = selectedPlan.payment_plan.interest_mode;
        state.balanceMode = selectedPlan.payment_plan.balance_mode;
    }
      
  },

  async updatePaymentPlan({ commit,state }, formData) {
    return axios.put(`api/v1/update-payment-plan/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deletePaymentPlan({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Payment Plan?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Payment Plan!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-payment-plan/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Payment Plan removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Payment Plan",
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
        Swal.fire(`Payment Plan has not been deleted!`);
      }
    })
  },
  removePlan({commit, state}, index){
    state.planArray.splice(index, 1); 
    commit('PLANS_ARRAY', state.planArray);
  },
  removeSalePlan({commit, state}, index){
    state.salePlanArray.splice(index, 1); 
    commit('SALE_PLANS_ARRAY', state.salePlanArray);
  },
  removePurchasePlan({commit, state}, index){
    state.purchasePlanArray.splice(index, 1); 
    commit('PURCHASE_PLANS_ARRAY', state.purchasePlanArray);
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
  
  