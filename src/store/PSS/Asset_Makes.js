import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    makeList: [],
    makeArr: [],
    makeArray: [],
    makeID: "",
    selectedMake: null,
    isEditing: "",
    make_name_search: '',
  };
  
  const mutations = {
    initializeStore(state){
      state.makeList = [];
      state.makeArr = [];
      state.makeArray = [];
      state.makeID = '';
      state.make_name_search = '';
      state.selectedMake = null;
      state.isEditing = false;
    },
    SET_SELECTED_MAKE(state, Make) {
      state.selectedMake = Make;
      state.isEditing = true;
    },
    MAKES_ARRAY(state, Makes){
      state.makeArray = Makes;
    },
    LIST_ASSET_MAKES(state, Makes) {
      state.makeList = Makes;
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
        if(key == 'make_name_search'){
          state.make_name_search = value;
        } 
      }
    },
    RESET_SEARCH_FILTERS(state){
      state.make_name_search = '';
    }

  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },
    
    async createAssetMake({ commit,state }, formData) {
      return axios.post('api/v1/create-asset-make/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },
  
    fetchAssetMakes({ commit,state }, formData) {
      state.makeArr = [];
      axios.post(`api/v1/get-asset-makes/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.makeArr.push((response.data[i].name));
        }
        commit('LIST_ASSET_MAKES', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    fetchAssetMake({ commit,state }, formData) {
      axios.post(`api/v1/get-asset-makes/`,formData)
      .then((response)=>{
        state.selectedMake = response.data;
        commit('SET_SELECTED_MAKE',response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },
    handleSelectedMake({ commit, state }, option){
      state.makeArray = [];
      const selectedMake = state.makeList.find(make => (make.name) === option);
      if (selectedMake) {
          state.makeID = selectedMake.asset_make_id;
          state.makeArray = [...state.makeArray, selectedMake];
      }
      commit('MAKES_ARRAY', state.makeArray);
        
    },
  
    async updateAssetMake({ commit,state }, formData) {
      return axios.put(`api/v1/update-asset-make/`,formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })  
    },
  
    deleteAssetMake({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Make?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete Make!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-asset-make/`,formData)
          .then((response)=>{
            if(response.status == 200){
                Swal.fire("Poof! Make removed succesfully!", {
                  icon: "success",
                }); 
            }else{
              Swal.fire({
                title: "Error Deleting Make",
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
          Swal.fire(`Make has not been deleted!`);
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
  
  