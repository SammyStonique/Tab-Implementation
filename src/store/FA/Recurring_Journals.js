import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  journalList: [], 
  journalArr: [],
  journalArray: [],
  journalID: '',
  selectedJournal: null,
  selectedRecurringJournal: null,
  isEditing: false,
};
  
const mutations = {
  initializeStore(state){
    state.journalList = [];
    state.journalArr = [];
    state.journalArray = [];
    state.journalID = '';
    state.selectedJournal = null;
    state.selectedRecurringJournal = null;
    state.isEditing = false;

  },
  SET_SELECTED_JOURNAL(state, journal) {
    state.selectedJournal = journal;
    state.isEditing = true;
  },
  SET_SELECTED_RECURRING_JOURNAL(state, journal) {
    state.selectedRecurringJournal = journal;
  },
  LIST_JOURNALS(state, journals) {
    state.journalList = journals;
  },
  JOURNALS_ARRAY(state, journals){
    state.journalArray = journals;
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
  
  async createRecurringJournal({ commit,state }, formData) {
    return axios.post('api/v1/create-recurring-journal/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchRecurringJournals({ commit,state }, formData) {
    state.journalArr = [];
    axios.post(`api/v1/get-recurring-journals/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.journalArr.push((response.data[i].journal.journal_no + " - " + response.data[i].journal.description + " - " + response.data[i].journal.total_amount));
      }
      commit('LIST_JOURNALS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchRecurringJournal({ commit,state }, formData) {
    axios.post(`api/v1/get-recurring-journals/`,formData)
    .then((response)=>{
      state.selectedRecurringJournal = response.data;
      const selectedJournal = (response.data.journal.journal_no + " - " + response.data.journal.description + " - " + response.data.journal.due_amount);
      commit('SET_SELECTED_JOURNAL',selectedJournal);
      commit('SET_SELECTED_RECURRING_JOURNAL',response.data);

    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },

  handleSelectedJournal({ commit, state }, option){
    state.journalArray = [];
    const selectedJournal = state.journalList.find(journal => (journal.journal.journal_no + " - " + journal.journal.description + " - " + journal.journal.total_amount) === option);
    if (selectedJournal) {
        state.journalID = selectedJournal.recurring_journal_id;
        state.journalArray = [...state.journalArray, selectedJournal];
    }
    commit('JOURNALS_ARRAY', state.journalArray);
      
  },

  async updateRecurringJournal({ commit,state }, formData) {
    return axios.put(`api/v1/update-recurring-journal/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteRecurringJournal({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Item?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Item!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-recurring-journal/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Item removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Item",
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
        Swal.fire(`Item has not been deleted!`);
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
  
  