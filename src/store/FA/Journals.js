import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  journalsList: [], 
  journalArr: [],
  journalArray: [],
  journalsArray: [],
  jnlArray: [],
  jnlSortedArr: [],
  journalID: '',
  journalNo: '',
  journal_no_search: '',
  selectedLedger: null,
  selectedJournal: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.journalsList = [];
    state.journalArr = [];
    state.journalArray = [];
    state.journalsArray = [];
    state.jnlArray = [];
    state.jnlSortedArr = [];
    state.journalID = '';
    state.journalNo = '';
    state.journal_no_search = '';
    state.selectedJournal = null;
    state.selectedLedger = null;
    state.isEditing = false;
  },
  SET_SELECTED_JOURNAL(state, journal) {
    state.selectedJournal = journal;
    state.isEditing = true;
  },
  LIST_JOURNALS(state, journals) {
    state.journalsList = journals;
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
      if(key == 'journal_no_search'){
        state.journal_no_search = value;
      }
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.journal_no_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createJournal({ commit,state }, formData) {
    return axios.post('api/v1/create-journal/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchJournals({ commit,state }, formData) {
    state.journalArr = [];
    axios.post(`api/v1/fetch-journals/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.journalArr.push((response.data[i].journal_no + " - " + response.data[i].description + " - " + response.data[i].amount));
      }
      commit('LIST_JOURNALS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchJournal({ commit,state }, formData) {
    axios.post(`api/v1/fetch-journals/`,formData)
    .then((response)=>{
      state.selectedJournal = response.data;
      commit('SET_SELECTED_JOURNAL',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchClientJournals({ commit,state }, formData){
    state.journalsArray = [];
    axios
    .post("api/v1/clients-journals-search/", formData)
    .then((response)=>{
        state.jnlArray = [];
        let running_balance = 0;
        state.journalsArray = response.data.results;
        state.jnlSortedArr = state.journalsArray.sort(function(a, b){
            // Convert the date strings to Date objects
            let dateA = new Date(a.date);
            let dateB = new Date(b.date);

            // Subtract the dates to get a value that is either negative, positive, or zero
            return dateA - dateB;
        })
        console.log("The sorted array is ",state.jnlSortedArr );
        for(let i=0; i<state.journalsArray.length; i++){
            if(state.journalsArray[i].debit_amount != 0){
                running_balance += state.journalsArray[i].debit_amount;
                state.journalsArray[i]['running_balance'] = Number(running_balance).toLocaleString();
                state.jnlArray.push(state.journalsArray[i])
            }
            else if(state.journalsArray[i].credit_amount != 0){
                running_balance -= state.journalsArray[i].credit_amount;
                state.journalsArray[i]['running_balance'] = Number(running_balance).toLocaleString();
                state.jnlArray.push(state.journalsArray[i])
            }
        }
    })
    .catch((error)=>{
        console.log(error.message)
    })
    .finally(()=>{
    
    })
    },
  handleSelectedJournal({ commit, state }, option){
    state.journalArray = [];
    const selectedJournal = state.journalsList.find(journal => (journal.journal_no + " - " +journal.description + " - " +journal.amount) === option);
    if (selectedJournal) {
        state.journalID = selectedJournal.journal_id;
        state.journalNo = selectedJournal.journal_no;
        state.journalArray = [...state.journalArray, selectedJournal];
    }
    commit('JOURNALS_ARRAY', state.journalArray);
      
  },

  async updateJournal({ commit,state }, formData) {
    return axios.put(`api/v1/update-journal/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteJournal({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Journal?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Journal!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-journal/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Journal removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Journal",
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
        Swal.fire(`Journal has not been deleted!`);
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
  
  