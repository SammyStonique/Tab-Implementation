const state = {
    depList: [],
    code_search: '',
    name_search: ''
  };
  
  const mutations = {
    LIST_DEPARTMENTS(state, departments) {
      state.depList = departments;
      console.log("THE DEPARTMENTS LIST IS ",state.depList)
    },
    SET_SEARCH_FILTERS(state, search_filter){
      for(const [key, value] of Object.entries(search_filter)){
        if(key == 'code_search'){
          state.code_search = value;
          console.log("THE SEARCH IS ", state.code_search)
        }else if(key == 'name_search'){
          state.name_search = value;
        } 
      }
    },
    RESET_SEARCH_FILTERS(state){
      state.code_search = '';
      state.name_search = '';
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
  
  