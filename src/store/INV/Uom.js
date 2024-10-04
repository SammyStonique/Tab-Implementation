import axios from "axios";
import Swal from 'sweetalert2';

const state = {
  uomList: [], 
  uomArr: [],
  uomArray: [],
  uomID: '',
  uomName: '',
  name_search: '',
  uom_code_search: '',
  selectedUom: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.uomList = [];
    state.uomArr = [];
    state.uomArray = [];
    state.name_search = '';
    state.uom_code_search = '';
    state.isEditing = false;
    state.selectedUom = null;
  },
  SET_SELECTED_UOM(state, uom) {
    state.selectedUom = uom;
    state.isEditing = true;
  },
  LIST_UOMS(state, uoms) {
    state.uomList = uoms;
  },
  UOMS_ARRAY(state, uoms){
    state.uomArray = uoms;
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
      }else if(key == 'landlord_code_search'){
        state.landlord_code_search = value;
      }  
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.name_search = '';
    state.landlord_code_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createUom({ commit,state }, formData) {
    return axios.post('api/v1/create-unit-of-measure/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchUoms({ commit,state }, formData) {
    state.uomArr = [];
    await axios.post(`api/v1/fetch-unit-of-measures/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.uomArr.push((response.data[i].abbreviation + " - " +response.data[i].uom_name))
      }
      commit('LIST_UOMS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchUom({ commit,state }, formData) {
    axios.post(`api/v1/fetch-unit-of-measures/`,formData)
    .then((response)=>{
      state.selectedUom = response.data;
      commit('SET_SELECTED_UOM',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedUom({ commit, state }, option){
    state.uomArray = [];
    const selectedUom = state.uomList.find(uom => (uom.abbreviation + ' - ' + uom.uom_name) === option);
    if (selectedUom) {
        state.uomID = selectedUom.uom_id;
        state.uomName = selectedUom.uom_name;
        state.uomArray = [...state.uomArray, selectedUom];
    }
    commit('UOMS_ARRAY', state.uomArray);
      
  },

  async updateUom({ commit,state }, formData) {
    return axios.put(`api/v1/update-unit-of-measure/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteUom({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete U.O.M?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete U.O.M!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-unit-of-measure/`,formData)
        .then((response)=>{
          if(response.status == 200){
              Swal.fire("Poof! U.O.M removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Error Deleting U.O.M",
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
        Swal.fire(`U.O.M has not been deleted!`);
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
  
  