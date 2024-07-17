const state = {
    appointmentsList: [],
    doctor_name_search: '',
    patient_name_search: ''
  };
  
  const mutations = {
    LIST_APPOINTMENTS(state, appointments) {
      state.appointmentsList = appointments;
      console.log("THE APPOINTMENTS LIST IS ",state.appointmentsList)
    },
    SET_SEARCH_FILTERS(state, search_filter){
      for(const [key, value] of Object.entries(search_filter)){
        if(key == 'doctor_name_search'){
          state.doctor_name_search = value;
          console.log("THE SEARCH IS ", state.doctor_name_search)
        }else if(key == 'patient_name_search'){
          state.patient_name_search = value;
        } 
      }
    }
  };
  
  const actions = {
    // fetchUsers({ commit }) {
    //   const users = []; // Fetch or define users
    //   commit('SET_USERS', users);
    // },
    // setCurrentUser({ commit }, user) {
    //   commit('SET_CURRENT_USER', user);
    // },
    // addUser({ commit }, user) {
    //   commit('ADD_USER', user);
    // },
    // updateUser({ commit }, user) {
    //   commit('UPDATE_USER', user);
    // },
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
  
  