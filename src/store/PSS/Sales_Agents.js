import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  agentsList: [], 
  agentArr: [],
  agentArray: [],
  agentDetails: [],
  agentID: '',
  selectedAgent: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.agentsList = [];
    state.agentArr = [];
    state.agentArray = [];
    state.agentDetails = [];
    state.agentID = '';
    state.selectedAgent = null;
    state.isEditing = false;
  },
  SET_SELECTED_AGENT(state, Agent) {
    state.selectedAgent = Agent;
    state.isEditing = true;
  },
  LIST_AGENTS(state, Agents) {
    state.agentsList = Agents;
  },
  AGENTS_ARRAY(state, Agents){
    state.agentArray = Agents;
  },
  SET_AGENT_DETAILS(state, details){
    state.agentDetails = details;
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
  
  async createSalesAgent({ commit,state }, formData) {
    return axios.post('api/v1/create-sales-agent/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchSalesAgents({ commit,state }, formData) {
    state.agentArr = [];
    axios.post(`api/v1/get-sales-agents/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.agentArr.push((response.data[i].name + " - Email: " + response.data[i].email));
      }
      commit('LIST_AGENTS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchSalesAgent({ commit,state }, formData) {
    axios.post(`api/v1/get-sales-agents/`,formData)
    .then((response)=>{
      state.selectedAgent = response.data;
      commit('SET_SELECTED_AGENT',response.data);
      commit('SET_AGENT_DETAILS',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedAgent({ commit, state }, option){
    state.agentArray = [];
    const selectedAgent = state.agentsList.find(agent => (agent.name + " - Email: " + agent.email) === option);
    if (selectedAgent) {
        state.agentID = selectedAgent.sales_agent_id;
        state.agentName = selectedAgent.name;
        state.agentArray = [...state.agentArray, selectedAgent];
    }
    commit('AGENTS_ARRAY', state.agentArray);
      
  },

  async updateSalesAgent({ commit,state }, formData) {
    return axios.put(`api/v1/update-sales-agent/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteSalesAgent({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Agent?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Agent!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-sales-agent/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Agent removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Agent",
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
        Swal.fire(`Agent has not been deleted!`);
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
  
  