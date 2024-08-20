import axios from "axios";

const state = {
    feesList: [],
    feesArr: [],
    hospital_id: '',
    fees_name_search: '',
    selectedFees: '',
    feesID: '',
    feesName: '',
    feesArray: []
  };
  
  const mutations = {
    initializeStore(state){
      state.feesList = [];
      state.feesArr = [];
      state.feesArray = [];
      state.hospital_id = '';
      state.fees_name_search = '';
      state.selectedFees = '';
      state.feesID = '';
      state.feesName = '';
    },
    LIST_MEDICAL_FEES(state, fees) {
      state.feesList = fees;
    },
    MEDICAL_FEES_ARRAY(state, fees){
      state.feesArray = fees;
      console.log("The fees array is ",state.feesArray);
    },
    SET_SEARCH_FILTERS(state, search_filter){
      for(const [key, value] of Object.entries(search_filter)){
        if(key == 'fees_name_search'){
          state.fees_name_search = value;
        }
        
      }
    },
    RESET_SEARCH_FILTERS(state){
      state.fees_name_search = '';
    }
  };
  
  const actions = {
    fetchFees({ commit }, formData) {
      state.feesArr = [];
      axios.post(`api/v1/medical-fees-search/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.results.length; i++){
          state.feesArr.push((response.data.results[i].posting_account_code  + ' - ' + response.data.results[i].fees_name))
        }
        commit('LIST_MEDICAL_FEES', response.data.results);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    handleSelectedFees({ commit, state }, option){
        const selectedFee = state.feesList.find(fee => (fee.posting_account_code + ' - ' + fee.fees_name) === option);
        if (selectedFee) {
          state.feesID = selectedFee.fees_id;
          state.feesName = selectedFee.fees_name;
          state.feesArray = [...state.feesArray, selectedFee];
      }
      commit('MEDICAL_FEES_ARRAY', state.feesArray); 
    },
    deleteFee({commit, state}, index){
      state.feesArray.splice(index, 1); 
    },
    resetFees({ commit }){
      const feesArray = [];
      commit('MEDICAL_FEES_ARRAY', feesArray)
    }
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
  
  