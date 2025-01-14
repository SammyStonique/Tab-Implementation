import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    sponsorList: [],
    sponsorArr: [],
    sponsorArray: [],
    sponsorID: "",
    selectedSponsor: null,
    isEditing: "",
    sponsor_name_search: '',
  };
  
  const mutations = {
    initializeStore(state){
      state.sponsorList = [];
      state.sponsorArr = [];
      state.sponsorArray = [];
      state.sponsorID = '';
      state.sponsor_name_search = '';
      state.selectedSponsor = null;
      state.isEditing = false;
    },
    SET_SELECTED_SPONSOR(state, sponsor) {
      state.selectedSponsor = sponsor;
      state.isEditing = true;
    },
    SPONSORS_ARRAY(state, sponsors){
      state.sponsorArray = sponsors;
    },
    LIST_MEMBER_SPONSORS(state, sponsors) {
      state.sponsorList = sponsors;
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
        if(key == 'sponsor_name_search'){
          state.sponsor_name_search = value;
        } 
      }
    },
    RESET_SEARCH_FILTERS(state){
      state.sponsor_name_search = '';
    }

  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },
    
    async createMemberSponsor({ commit,state }, formData) {
      return axios.post('api/v1/create-member-sponsor/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },
  
    fetchMemberSponsors({ commit,state }, formData) {
      state.sponsorArr = [];
      axios.post(`api/v1/get-member-sponsors/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.sponsorArr.push((response.data[i].sponsor_name));
        }
        commit('LIST_MEMBER_SPONSORS', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    fetchMemberSponsor({ commit,state }, formData) {
      axios.post(`api/v1/get-member-sponsors/`,formData)
      .then((response)=>{
        state.selectedSponsor = response.data;
        commit('SET_SELECTED_SPONSOR',response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    handleSelectedSponsor({ commit, state }, option){
      state.sponsorArray = [];
      const selectedSponsor = state.sponsorList.find(sponsor => (sponsor.sponsor_name) === option);
      if (selectedSponsor) {
          state.sponsorID = selectedSponsor.member_sponsor_id;
          state.sponsorArray = [...state.sponsorArray, selectedSponsor];
      }
      commit('SPONSORS_ARRAY', state.sponsorArray);
        
    },
  
    async updateMemberSponsor({ commit,state }, formData) {
      return axios.put(`api/v1/update-member-sponsor/`,formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })  
    },
  
    deleteMemberSponsor({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Sponsor?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete Sponsor!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-member-sponsor/`,formData)
          .then((response)=>{
            if(response.status == 200){
                Swal.fire("Poof! Sponsor removed succesfully!", {
                  icon: "success",
                }); 
            }else{
              Swal.fire({
                title: "Error Deleting Sponsor",
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
          Swal.fire(`Sponsor has not been deleted!`);
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
  
  