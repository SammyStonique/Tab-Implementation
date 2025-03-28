import axios from 'axios';
import Swal from 'sweetalert2';

const state = {
    userArr: [],
    userList: [],
    userArray: [],
    user_id: '',
    userID: '',
    departmentID: '',
    company_id: '',
    device_id: '',
    company_name: '',
    system_timeout: 0,
    user_names: '',
    user_profile: '',
    token: '',
    activeComponent: 'Main',
    userDetails: null,
    isAuthenticated: false,
    company_modules: [],
    user_companies: [],
    permissions: [],
    reloaded: false,
    name_search: '',
    status_search: '',
    id_number_search: '',
    profile_search: '',
    phone_number_search: '',
    selectedUser: null,
    selectedDepartment: null,
    isEditing: false
};

const mutations = {
    initializeStore(state){
        state.userList = [];
        state.userArr = [];
        state.userArray = [];
        state.name_search = '';
        state.profile_search = '';
        state.status_search = '';
        state.phone_number_search = '';
        state.id_number_search = '';
        state.isEditing = false;
        state.selectedUser = null;
        state.selectedDepartment = null;
    },

    reloadingPage(state){
        if (localStorage.getItem('reloaded')) {
          // The page was just reloaded. Clear the value from local storage
          // so that it will reload the next time this page is visited.
          localStorage.removeItem('reloaded', 'false');
        } else {
            // Set a flag so that we know not to reload the page twice.
            localStorage.setItem('reloaded', 'true');
            console.log(state.reloaded,'Reload')
            window.location.reload();
        }
    },

    SET_STATE(state, payload){
        for (const key in payload) {
            if (payload.hasOwnProperty(key) && key in state) {
                state[key] = payload[key];
            }
        }
    },
    SET_USER_DETAILS(state, user){
        state.userDetails = user;
    },
    LIST_USERS(state, users) {
        state.userList = users;
    },
    USERS_ARRAY(state, users){
        state.userArray = users;
    },
    SET_SELECTED_USER(state, user) {
        state.selectedUser = user;
        state.isEditing = true;
    },
    SET_SELECTED_DEPARTMENT(state, department) {
        state.selectedDepartment = department;
    },
    SET_SEARCH_FILTERS(state, search_filter){
        for(const [key, value] of Object.entries(search_filter)){
          if(key == 'name_search'){
            state.name_search = value;
          }else if(key == 'profile_search'){
            state.profile_search = value;
          }else if(key == 'status_search'){
              state.status_search = value;
          }else if(key == 'id_number_search'){
              state.id_number_search = value;
          }else if(key == 'phone_number_search'){
            state.phone_number_search = value;
            }   
        }
      },
      RESET_SEARCH_FILTERS(state){
        state.name_search = '';
        state.profile_search = '';
        state.status_search = '';
        state.id_number_search = '';
        state.phone_number_search = "";
      }
}

const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },
    reloadPage({ commit }){
        commit('reloadingPage');
    },
    async createUser({ commit,state }, formData) {
        return axios.post('api/v1/create-property/', formData)
        .then((response)=>{
          return response;
        })
        .catch((error)=>{
          console.log(error.message);
          throw error;
        })
    },
    fetchUsers({ commit, state}, formData) {
        state.userArr = [];
        axios.post(`api/v1/department-staff-list/`,formData)
        .then((response)=>{
          for(let i=0; i< response.data.stafflist.length; i++){
            state.userArr.push((response.data.stafflist[i].first_name  + ' ' + response.data.stafflist[i].last_name + ' - ' + response.data.stafflist[i].email))
          }
          commit('LIST_USERS', response.data.stafflist);
        })
        .catch((error)=>{
          console.log(error.message);
        })
        
    },
    fetchUser({ commit,state }, formData) {
        axios.post(`api/v1/department-staff-list/`,formData)
        .then((response)=>{
            const selectedDepartment = response.data.user_department.code + ' - ' + response.data.user_department.name;
            commit('SET_SELECTED_DEPARTMENT',selectedDepartment);
            state.selectedUser = response.data;
            commit('SET_SELECTED_USER',response.data);
        })
        .catch((error)=>{
          console.log(error.message);
        })
        
      },
    handleSelectedUser({ commit, state }, option){
        state.userArray = [];
        const selectedUser = state.userList.find(user => (user.first_name + ' ' + user.last_name + ' - ' + user.email) === option);
        if (selectedUser) {
            state.userID = selectedUser.user_id;
            state.departmentID = selectedUser.user_department;
            state.userName = selectedUser.first_name + ' ' + selectedUser.last_name;
            state.userArray = [...state.userArray, selectedUser];
        }
        commit('USERS_ARRAY', state.userArray);
            
    },
    async updateUser({ commit,state }, formData) {
        return axios.put(`api/v1/users/${state.selectedUser.user_id}/`,formData)
        .then((response)=>{
          return response;
        })
        .catch((error)=>{
          console.log(error.message);
          throw error;
        })  
      },
    lockUser({ commit,state }, formData) {
        Swal.fire({
            title: "Are you sure?",
            text: `Do you wish to lock User?`,
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes lock User!',
            cancelButtonText: 'Cancel!',
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            showLoaderOnConfirm: true,
        }).then((result) => {
            if (result.value) {
                axios.post(`api/v1/lock-user/`,formData)
                .then((response)=>{
                    if(response.data.msg == "Success"){
                        Swal.fire("Poof! User locked succesfully!", {
                            icon: "success",
                        }); 
                    }else{
                        Swal.fire({
                            title: "Error Locking User",
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
            Swal.fire(`User has not been locked!`);
            }
        })
    },

    unlockUser({ commit,state }, formData) {
        Swal.fire({
            title: "Are you sure?",
            text: `Do you wish to unlock User?`,
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes unlock User!',
            cancelButtonText: 'Cancel!',
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            showLoaderOnConfirm: true,
        }).then((result) => {
            if (result.value) {
                axios.post(`api/v1/unlock-user/`,formData)
                .then((response)=>{
                    if(response.data.msg == "Success"){
                        Swal.fire("Poof! User unlocked succesfully!", {
                            icon: "success",
                        }); 
                    }else{
                        Swal.fire({
                            title: "Error Unlocking User",
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
            Swal.fire(`User has not been unlocked!`);
            }
        })
    },

    deleteUser({ commit,state }, formData) {
        Swal.fire({
            title: "Are you sure?",
            text: `Do you wish to delete User?`,
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes Delete User!',
            cancelButtonText: 'Cancel!',
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            showLoaderOnConfirm: true,
        }).then((result) => {
            if (result.value) {
                axios.post(`api/v1/delete-user/`,formData)
                .then((response)=>{
                    if(response.data.msg == "Success"){
                        Swal.fire("Poof! User removed succesfully!", {
                            icon: "success",
                        }); 
                    }else{
                        Swal.fire({
                            title: "Error Deleting User",
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
            Swal.fire(`User has not been deleted!`);
            }
        })
    },
    deleteCookie({ commit }, name) {
        document.cookie = `${name}=; Max-Age=0; path=/;`;
    },

    // Action to delete CSRF and session cookies
    deleteCSRFAndSessionCookies({ dispatch }) {
        dispatch('deleteCookie', 'csrftoken');
        dispatch('deleteCookie', 'sessionid');
    },
    logout({ commit,dispatch }, formData){
        axios.post('api/v1/custom-logout/',formData)
        .then((response)=>{
            
        })
        .catch((error)=>{
            console.log(error.message);
            axios.get('api/v1/flush-request-session/')
            throw error;
        })
        .finally(()=>{
            const newState ={
                activeComponent:"Login",
                isAuthenticated: false,
                token: ""
            }
            commit('SET_STATE',newState); 
            commit('reloadingPage');
            dispatch('deleteCSRFAndSessionCookies');
        })
    }
}

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