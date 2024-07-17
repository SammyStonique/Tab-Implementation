const state = {
  name: '',
};

const mutations = {
  SET_NAME(state, name) {
    state.name = name;
  },
  // SET_CURRENT_USER(state, user) {
  //   state.currentUser = user;
  // },
  // ADD_USER(state, user) {
  //   state.users.push(user);
  // },
  // UPDATE_USER(state, updatedUser) {
  //   const index = state.users.findIndex((u) => u.id === updatedUser.id);
  //   if (index !== -1) {
  //     state.users.splice(index, 1, updatedUser);
  //   }
  // },
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

