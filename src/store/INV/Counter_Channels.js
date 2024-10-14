import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  channelsList: [], 
  channelArr: [],
  channelArray: [],
  channelID: '',
  ledgerID: "",
  channelName: '',
  channel_name_search: '',
  selectedCounter: null,
  selectedLedger: null,
  selectedChannel: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.channelsList = [];
    state.channelArr = [];
    state.channelArray = [];
    state.channelID = "";
    state.ledgerID = "";
    state.channel_name_search = '';
    state.isEditing = false;
    state.selectedCounter = null;
    state.selectedChannel = null;
    state.selectedLedger = null;
  },
  SET_SELECTED_CHANNEL(state, channel) {
    state.selectedChannel = channel;
    state.isEditing = true;
  },
  LIST_CHANNELS(state, channels) {
    state.channelsList = channels;
  },
  CHANNELS_ARRAY(state, channels){
    state.channelArray = channels;
  },
  SET_SELECTED_COUNTER(state, counter) {
    state.selectedCounter = counter;
  },
  SET_SELECTED_LEDGER(state, ledger) {
    state.selectedLedger = ledger;
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
      if(key == 'channel_name_search'){
        state.channel_name_search = value;
      }  
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.channel_name_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createChannel({ commit,state }, formData) {
    return axios.post('api/v1/create-counter-channel/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchChannels({ commit,state }, formData) {
    state.channelArr = [];
    await axios.post(`api/v1/fetch-counter-channels/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.channelArr.push((response.data[i].channel_name))
      }
      commit('LIST_CHANNELS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchChannel({ commit,state }, formData) {
    axios.post(`api/v1/fetch-counter-channels/`,formData)
    .then((response)=>{
        state.selectedChannel = response.data;
        const selectedCounter = response.data.outlet_counter;
        const selectedLedger = response.data.posting_account.ledger_code + " - " + response.data.posting_account.ledger_name;
        commit('SET_SELECTED_CHANNEL',response.data);
        commit('SET_SELECTED_COUNTER', selectedCounter);
        commit('SET_SELECTED_LEDGER', selectedLedger);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedChannel({ commit, state }, option){
    state.channelArray = [];
    const selectedChannel = state.channelsList.find(channel => (channel.channel_name) === option);
    if (selectedChannel) {
        state.channelID = selectedChannel.counter_channel_id;
        state.ledgerID = selectedChannel.posting_account.ledger_id;
        state.channelName = selectedChannel.channel_name;
        state.channelArray = [...state.channelArray, selectedChannel];
    }
    commit('CHANNELS_ARRAY', state.channelArray);
      
  },

  async updateChannel({ commit,state }, formData) {
    return axios.put(`api/v1/update-counter-channel/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteChannel({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Channel?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Channel!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-counter-channel/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Channel removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Channel",
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
        Swal.fire(`Channel has not been deleted!`);
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
  
  