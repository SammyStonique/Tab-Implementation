const state = () => ({
    visible: false,
    x: 0,
    y: 0,
    options: [],
    contextData: null,
    selectedAction: null
  });
  
  const mutations = {
    SHOW_CONTEXT_MENU(state, { x, y, options, contextData }) {
      state.visible = true;
      state.x = x;
      state.y = y;
      state.options = options;
      state.contextData = contextData;
    },
    HIDE_CONTEXT_MENU(state) {
      state.visible = false;
      state.contextData = null;
    },
    SET_SELECTED_ACTION(state, payload) {
        state.selectedAction = payload;
    },
    CLEAR_SELECTED_ACTION(state) {
        state.selectedAction = null;
    },
  };
  
  export default {
    namespaced: true,
    state,
    mutations,
  };
  