import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    membersList: [], 
    memberArr: [],
    memberArray: [],
    memberID: null,
    selectedMemberID: null,
    memberName: '',
    memberNumber: '',
    name_search: '',
    member_number_search: '',
    phone_number_search: '',
    gender_search: '',
    memberSavings: 0,
    memberShares: 0,
    selectedMember: null,
    selectedSponsor: null,
    selectedCategory: null,
    selectedCurrency: null,
    isEditing: false,
    memberDetails: [],
};
  
const mutations = {
  initializeStore(state){
    state.membersList = [];
    state.memberArr = [];
    state.memberArray = [];
    state.memberID = "";
    state.selectedMemberID = null;
    state.memberNumber = "";
    state.name_search = '';
    state.member_number_search = '';
    state.phone_number_search = '';
    state.gender_search = '';
    state.selectedMember = null;
    state.selectedCurrency = null;
    state.selectedSponsor = null;
    state.selectedCategory = null;
    state.memberSavings = 0;
    state.memberShares = 0;
    state.isEditing = false;
    state.memberDetails = [];
  },
  SET_SELECTED_MEMBER(state, member) {
    state.selectedMember = member;
    state.isEditing = true;
  },
  SET_SELECTED_CATEGORY(state, category) {
    state.selectedCategory = category;
  },
  SET_SELECTED_SPONSOR(state, sponsor) {
    state.selectedSponsor = sponsor;
  },
  SET_SELECTED_CURRENCY(state, currency) {
    state.selectedCurrency = currency;
  },
  SET_MEMBER_DETAILS(state, details){
    state.memberDetails = details;
  },

  LIST_MEMBERS(state, members) {
    state.membersList = members;
  },
  MEMBERS_ARRAY(state, members){
    state.memberArray = members;
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
      }else if(key == 'member_number_search'){
        state.member_number_search = value;
      }else if(key == 'gender_search'){
          state.gender_search = value;
      }else if(key == 'phone_number_search'){
          state.phone_number_search = value;
      }   
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.name_search = '';
    state.member_number_search = '';
    state.gender_search = '';
    state.phone_number_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createMember({ commit,state }, formData) {
    return axios.post('api/v1/create-member/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async updateMember({ commit,state }, formData) {
    return axios.post('api/v1/update-member/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchMembers({ commit,state }, formData) {
    state.memberArr = [];
    axios.post(`api/v1/get-members/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.memberArr.push((response.data[i].member_number + ' - ' + response.data[i].member_name))
      }
      commit('LIST_MEMBERS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchMember({ commit,state }, formData) {
    axios.post(`api/v1/get-members/`,formData)
    .then((response)=>{
        state.selectedMember = response.data;
        state.selectedMemberID = response.data.member_id;
        state.memberSavings = response.data.total_savings;
        state.memberShares = response.data.total_shares;
        commit('SET_SELECTED_MEMBER',response.data);
        commit('SET_SELECTED_CATEGORY',(response.data.member_category != null) ? (response.data.member_category.category_name) : "");
        commit('SET_SELECTED_SPONSOR',(response.data.member_sponsor != null) ? (response.data.member_sponsor.sponsor_name) : "");
        commit('SET_SELECTED_CURRENCY',response.data.member_currency.code + " - " + response.data.member_currency.name);
    })   
    .catch((error)=>{
      console.log(error.message);
    })
    
  },

  async changeMemberStatus({ commit,state }, formData) {
    return axios.post('api/v1/change-member-status/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  handleSelectedMember({ commit, state }, option){
    state.memberArray = [];
    const selectedMember = state.membersList.find(member => (member.member_number + ' - ' + member.member_name) === option);
    if (selectedMember) {
        state.memberID = selectedMember.member_id;
        state.memberName = selectedMember.member_name;
        
        state.memberArray = [...state.memberArray, selectedMember];
    }

    commit('MEMBERS_ARRAY', state.memberArray);
      
  },

  async updateMember({ commit,state }, formData) {
    return axios.put(`api/v1/update-member/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteMember({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Member?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Member!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-member/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Member removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Member",
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
        Swal.fire(`Member has not been deleted!`);
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
  
  