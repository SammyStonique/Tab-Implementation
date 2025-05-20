import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    prepaymentsList: [],
    prepaymentArray: [],
    prepaymentID: '',
    scheduleID: '',
    itemAmount: 0,
    scheduleDescription: "",
    itemType: "",
    scheduleInstallment: "",
    selectedPrepayment: null,
    saleItems: [],
    saleItemsList: [],
  };
  
  const mutations = {
    LIST_SALE_PREPAYMENTS(state, prepayments) {
      state.prepaymentsList = prepayments;
    },
    PREPAYMENTS_ARRAY(state, prepayments){
        state.prepaymentArray = prepayments;
    },
    LIST_SALE_ITEMS(state, items) {
      state.saleItems = items;
    },
    SET_SEARCH_FILTERS(state, search_filter){
      for(const [key, value] of Object.entries(search_filter)){

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
 
    }
  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },
    async allocatePrepayment({ commit,state }, formData) {
        return axios.post('api/v1/create-asset-sale-prepayment-allocation/', formData)
        .then((response)=>{
          return response;
        })
        .catch((error)=>{
          console.log(error.message);
          throw error;
        })
      },
    async fetchSaleItems({ commit,state }, formData) {
      await axios.post(`api/v1/asset-sale-prepayments-items-search/`,formData)
      .then((response)=>{
        let receiptItems = [];
        state.saleItemsList = response.data.items;
        for(let i=0; i < response.data.items.length ; i++){
          receiptItems.push(response.data.items[i]['description'] + " (" + response.data.items[i]['due_amount'] + ")")
        }
        commit('LIST_SALE_ITEMS', receiptItems);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    handleSelectedSaleItem({ commit, state }, option){
      const selectedPrep = state.saleItemsList.find(item => (item['description'] + " (" +  item['due_amount'] + ")") === option);
      if (selectedPrep) {
          state.scheduleID = selectedPrep.journal_id;
          state.itemAmount = selectedPrep.due_amount;
          state.scheduleDescription = selectedPrep.description;
          state.itemType = selectedPrep.type;
          state.scheduleInstallment = selectedPrep.installment;
      }
          
    },

    handleSelectedPrepayment({ commit, state }, option){
        state.prepaymentArray = [];
        const selectedPrep = state.prepaymentsList.find(prepayment => (prepayment.loan_application.loan_number + " - " + prepayment.receipt.journal_no + " - " + prepayment.due_amount) === option);
        if (selectedPrep) {
            state.prepaymentID = selectedPrep.loan_prepayment_id;
            state.prepaymentArray = [...state.prepaymentArray, selectedPrep];
        }
        commit('PREPAYMENTS_ARRAY', state.prepaymentArray);
          
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
  
  