import axios from 'axios';

const state = {
    userArr: [],
    userList: [],
    userArray: [],
    user_id: '',
    userID: '',
    departmentID: '',
    company_id: '',
    company_name: '',
    user_names: '',
    user_profile: '',
    token: '',
    activeComponent: 'Main',
    userDetails: null,
    isAuthenticated: false,
    company_modules: [],
    user_companies: [],
    reloaded: false,
};

const mutations = {
    reloadingPage(state){
        if (localStorage.getItem('reloaded')) {
          localStorage.removeItem('reloaded', 'false');
          console.log('Value of reload in store set to false')
        }else {
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
        console.log("THE USER IN STORE IS ",state.user_id)
        console.log("THE VALUE OF IS AUTHENTICATED IS ",state.isAuthenticated)
        console.log("THE VALUE OF IS COMPANY MODULES IS ",state.company_modules)
        console.log("THE VALUE OF ALLOWED COMPANIES  IS ",state.user_companies)
    },
    SET_USER_DETAILS(state, user){
        state.userDetails = user;
        console.log("THE USER DETAILS IS ",state.userDetails)
    },
    LIST_USERS(state, users) {
        state.userList = users;
    },
    USERS_ARRAY(state, users){
        state.userArray = users;
    },
}

const actions = {
    updateState({ commit }, newState) {
      commit('SET_STATE', newState);
    },
    reloadPage({ commit }){
        commit('reloadingPage');
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
    handleSelectedUser({ commit, state }, option){
        state.userArray = [];
        const selectedUser = state.userList.find(user => (user.first_name + ' ' + user.last_name + ' - ' + user.email) === option);
        if (selectedUser) {
            state.userID = selectedUser.user_id;
            console.log("THE USER ID VALUE IS ",state.userID);
            state.departmentID = selectedUser.user_department;
            state.userName = selectedUser.first_name + ' ' + selectedUser.last_name;
            state.userArray = [...state.userArray, selectedUser];
        }
        commit('USERS_ARRAY', state.userArray);
            
    },
    async updateUser({ commit,state }, formData, userID) {
        return axios.put(`api/v1/users/${userID}/`,formData)
        .then((response)=>{
            return response;
          })
          .catch((error)=>{
            console.log(error.message);
            throw error;
          })     
    },

    deleteUser({ commit,state }, formData, userID) {
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
                axios.delete(`api/v1/user-details/${userID}/`,formData)
                .then((response)=>{
                    if(response.status == 200){
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
    logout({ commit,state }){
        axios.post('api/v1/auth-token/logout/',{headers: {'Authorization': `Token ${state.token}`}})
        .then((response)=>{
            const newState ={
                activeComponent:"Login",
                isAuthenticated: false,
            }
            commit('SET_STATE',newState); 
        })
        .catch((error)=>{
            console.log(error.message)
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