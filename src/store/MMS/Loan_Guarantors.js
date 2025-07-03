import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  guarantorsList: [], 
  guarantorArr: [],
  guarantorArray: [],
  guarantorID: '',
  guarantorName: '',
  applicationNumber: '',
  loanGuarantors: [],
  membersList: [], 
  memberArr: [],
  memberArray: [],
  memberID: '',
  memberName: '',
  selectedGuarantor: null,
  selectedApplication: null,
  selectedMember: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.guarantorsList = [];
    state.guarantorArr = [];
    state.guarantorArray = [];
    state.guarantorID = "";
    state.guarantorName = "";
    state.applicationNumber = "";
    state.selectedGuarantor = null;
    state.selectedApplication = null;
    state.selectedMember = null;
    state.isEditing = false;
    state.membersList = [];
    state.memberArr = [];
    state.memberArray = [];
    state.memberID = "";
    state.memberName = "";
  },
  SET_SELECTED_GUARANTOR(state, guarantor) {
    state.selectedGuarantor = guarantor;
    state.isEditing = true;
  },
  LIST_GUARANTORS(state, guarantors) {
    state.guarantorsList = guarantors;
  },
  LIST_MEMBERS(state, members) {
    state.membersList = members;
  },
  GUARANTORS_ARRAY(state, guarantors){
    state.GuarantorArray = guarantors;
  },
  MEMBERS_ARRAY(state, members){
    state.memberArray = members;
  },
  SET_SELECTED_MEMBER(state, member) {
    state.selectedMember = member;
  },
  SET_SELECTED_APPLICATION(state, application) {
    state.selectedApplication = application;
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
  
  async createLoanGuarantor({ commit,state }, formData) {
    return axios.post('api/v1/create-loan-guarantor/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchLoanGuarantors({ commit,state }, formData) {
    state.guarantorArr = [];
    axios.post(`api/v1/get-loan-guarantors/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.guarantorArr.push((response.data[i].loan_application.loan_number + " - " + response.data[i].member.member_name + "(" + response.data[i].member.member_number + ")"));
      }
      commit('LIST_GUARANTORS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchLoanGuarantor({ commit,state }, formData) {
    axios.post(`api/v1/get-loan-guarantors/`,formData)
    .then((response)=>{
      state.selectedGuarantor = response.data; 
      const selectedMember = response.data.member.member_number + " - " + response.data.member.member_name;
      const selectedApplication = response.data[i].loan_application.loan_number + " - " + response.data[i].loan_application.loan_product.product_name + " - " + response.data[i].loan_application.member.member_name;
      commit('SET_SELECTED_GUARANTOR',response.data);
      commit('SET_SELECTED_MEMBER', selectedMember);
      commit('SET_SELECTED_APPLICATION', selectedApplication);
    })
    .catch((error)=>{
      console.log(error.message);
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
  handleSelectedGuarantor({ commit, state }, option){
    const selectedGuarantor = state.guarantorsList.find(guarantor => (guarantor.loan_application.loan_number + " - " + guarantor.member.member_name + "(" + guarantor.member.member_number + ")") === option);
    if (selectedGuarantor) {
        state.guarantorID = selectedGuarantor.loan_guarantor_id;
        state.guarantorName = selectedGuarantor.member.member_name;
        state.applicationNumber = selectedGuarantor.loan_application.loan_number;
        selectedGuarantor.member_loan_guarantor_id = null;
        state.guarantorArray = [...state.guarantorArray, selectedGuarantor];

    }
    commit('GUARANTORS_ARRAY', state.guarantorArray);
      
  },

  handleSelectedMemberGuarantor({ commit, state }, option){
    const selectedMember = state.membersList.find(member => (member.member_number + ' - ' + member.member_name) === option);
    if (selectedMember) {
        state.memberID = selectedMember.member_id;
        state.memberName = selectedMember.member_name;
        selectedMember.loan_guarantor_id = null;
        const exists = state.memberArray.some(member => member.member_id === selectedMember.member_id);
        if (!exists) {
            state.memberArray = [...state.memberArray, selectedMember];
        }
    }
    commit('MEMBERS_ARRAY', state.memberArray);
      
  },

  async updateLoanGuarantor({ commit,state }, formData) {
    return axios.put(`api/v1/update-loan-guarantor/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteLoanGuarantor({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Loan Guarantor?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Loan Guarantor!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-loan-guarantor/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Loan Guarantor removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Loan Guarantor",
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
        Swal.fire(`Loan Guarantor has not been deleted!`);
      }
    })
  },
  removeLoanGuarantor({commit, state}, index){
    state.guarantorArray.splice(index, 1); 
    commit('GUARANTORS_ARRAY', state.guarantorArray);
  },
  removeMemberGuarantor({commit, state}, index){
    state.memberArray.splice(index, 1); 
    commit('MEMBERS_ARRAY', state.memberArray);
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
  
  