import axios from "axios";
import Swal from 'sweetalert2';

const state = {
    templatesList: [],
    templateArr: [],
    templateArray: [],
    templateID: '',
    templateName: "",
    selectedTemplate: null,
    name_search: "",
    type_search: "",
    isEditing: false
  };
  
  const mutations = {
    LIST_TEMPLATES(state, templates) {
      state.templatesList = templates;
    },
    TEMPLATES_ARRAY(state, templates){
      state.templateArray = templates;
    },
    SET_SELECTED_TEMPLATE(state, template) {
      state.selectedTemplate = template;
      state.isEditing = true;
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
          }else if(key == 'type_search'){
            state.type_search = value;
          }
        }
      },
      RESET_SEARCH_FILTERS(state){
        state.name_search = '';
        state.type_search = '';
      }
  };
  
  const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },

    async createTemplate({ commit,state }, formData) {
      return axios.post('api/v1/create-sms-template/', formData)
      .then((response)=>{
        return response;
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
    },

    fetchTemplates({ commit,state }, formData) {
      state.templateArr = [];
      axios.post(`api/v1/get-sms-templates/`,formData)
      .then((response)=>{
        for(let i=0; i< response.data.length; i++){
          state.templateArr.push((response.data[i].template_name))
        }
        commit('LIST_TEMPLATES', response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },

    fetchTemplate({ commit,state }, formData) {
      axios.post(`api/v1/get-sms-templates/`,formData)
      .then((response)=>{
        commit('SET_SELECTED_TEMPLATE',response.data);
      })
      .catch((error)=>{
        console.log(error.message);
      })
      
    },

    handleSelectedTemplate({ commit, state }, option){
      state.templateArray = [];
      const selectedTemplate = state.templatesList.find(template => (template.template_name) === option);
      if (selectedTemplate) {
          state.templateID = selectedTemplate.property_template_id;
          state.templateName = selectedTemplate.template_name;
          state.templateArray = [...state.templateArray, selectedTemplate];
      }
      commit('TEMPLATES_ARRAY', state.templateArray);
        
    },

    async updateTemplate({ commit,state }, formData) {
      return axios.put(`api/v1/update-sms-template/`,formData)
      .then((response)=>{
         return response;   
      })
      .catch((error)=>{
        console.log(error.message);
        throw error;
      })
      
    },

    deleteTemplate({ commit,state }, formData) {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you wish to delete Template(s)?`,
        type: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes Delete!',
        cancelButtonText: 'Cancel!',
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom',
        },
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.value) {
          axios.post(`api/v1/delete-sms-template/`,formData)
          .then((response)=>{
            if(response.status == 200){
                Swal.fire("Poof! Template(s) removed succesfully!", {
                  icon: "success",
                }); 
            }else{
              Swal.fire({
                title: "Error Deleting Template(s)",
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
          Swal.fire(`Template(s) not deleted!`);
        }
      })
    },
  };
  
  const getters = {

  };
  
  export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
  };
  
  