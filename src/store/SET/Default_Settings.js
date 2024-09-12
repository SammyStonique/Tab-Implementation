import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  settingsList: [], 
  settingArr: [],
  settingArray: [],
  settingID: '',
  settingName: "",
  selectedSetting: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.settingsList = [];
    state.settingArr = [];
    state.settingArray = [];
    state.selectedSetting = null;
    state.settingName = "";
    state.isEditing = false;
  },
  SET_SELECTED_SETTING(state, setting) {
    state.selectedSetting = setting;
    state.isEditing = true;
  },
  LIST_SETTINGS(state, settings) {
    state.settingsList = settings;
  },
  SETTINGS_ARRAY(state, settings){
    state.settingArray = settings;
  },
  SET_STATE(state, payload) {
    for (const key in payload) {
        if (payload.hasOwnProperty(key) && key in state) {
            state[key] = payload[key];
        }
    }
  },

};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createDefaultSetting({ commit,state }, formData) {
    return axios.post('api/v1/create-default-setting/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchDefaultSettings({ commit,state }, formData) {
    state.settingArr = [];
    await axios.post(`api/v1/fetch-default-settings/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.settingArr.push((response.data[i].setting_name))
      }
      commit('LIST_SETTINGS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchDefaultSetting({ commit,state }, formData) {
    axios.post(`api/v1/fetch-default-settings/`,formData)
    .then((response)=>{
      state.selectedSetting = response.data;
      commit('SET_SELECTED_SETTING',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedSetting({ commit, state }, option){
    state.settingArray = [];
    const selectedSetting = state.settingsList.find(landlord => (landlord.setting_name) === option);
    if (selectedSetting) {
        state.settingID = selectedSetting.setting_id;
        state.settingName = selectedSetting.setting_name;
        state.settingArray = [...state.settingArray, selectedSetting];
    }
    commit('SETTINGS_ARRAY', state.settingArray);
      
  },

  async updateDefaultSetting({ commit,state }, formData) {
    return axios.put(`api/v1/update-default-setting/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteDefaultSetting({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Setting?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Setting!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-default-setting/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! Setting removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting Setting",
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
        Swal.fire(`Setting has not been deleted!`);
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
  
  