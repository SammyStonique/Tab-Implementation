import { useStore } from 'vuex';

const state = {
    modulesTabs: {
      HMS: { pages: new Set(["Dashboard"]), activeTab: "Dashboard" },
      INV: { pages: new Set(["Dashboard"]), activeTab: "Dashboard" },
      FA: { pages: new Set(["Dashboard"]), activeTab: "Dashboard" },
      PMS: { pages: new Set(["Dashboard"]), activeTab: "Dashboard" },
      HR: { pages: new Set(["Dashboard"]), activeTab: "Dashboard" },
      EPS: { pages: new Set(["Dashboard"]), activeTab: "Dashboard" },
      HHS: { pages: new Set(["Dashboard"]), activeTab: "Dashboard" },
      MMS: { pages: new Set(["Dashboard"]), activeTab: "Dashboard" },
      SET: { pages: new Set(["Dashboard"]), activeTab: "Dashboard" },
      ACC: { pages: new Set(["Dashboard"]), activeTab: "Dashboard" },
      PSS: { pages: new Set(["Dashboard"]), activeTab: "Dashboard" },
      VSS: { pages: new Set(["Dashboard"]), activeTab: "Dashboard" },
    },
  };

  const mutations = {
    ADD_PAGE(state, { moduleCode, page }) {
      if (!state.modulesTabs[moduleCode]) {
        // Initialize if not present
        state.modulesTabs[moduleCode] = { pages: new Set(["Dashboard"]), activeTab: "Dashboard" };
      }
  
      state.modulesTabs[moduleCode].pages.add(page);
      state.modulesTabs[moduleCode].activeTab = page;
    },
  
    REMOVE_PAGE(state, { moduleCode, page }) {
      if (state.modulesTabs[moduleCode]) {
        state.modulesTabs[moduleCode].pages.delete(page);
  
        let myArray = Array.from(state.modulesTabs[moduleCode].pages);
        state.modulesTabs[moduleCode].activeTab = myArray[myArray.length - 1] || "Dashboard";
      }
    },
  
    CLEAR_PAGE_TAB(state, moduleCode) {
      if (state.modulesTabs[moduleCode]) {
        state.modulesTabs[moduleCode].pages = new Set(["Dashboard"]);
        state.modulesTabs[moduleCode].activeTab = "Dashboard";
      }
    },
  
    MAXIMIZE_PAGE(state, { moduleCode, page }) {
      // Optional logic if you want to maximize a page
      if (state.modulesTabs[moduleCode]) {
        state.modulesTabs[moduleCode].activeTab = page;
      }
      state.homePage = false;
      state.modulePage = true;
    }
  };
 
  
  const actions = {
    addPage({ commit }, payload) {
      commit('ADD_PAGE', payload);
    },
    removePage({ commit }, payload) {
      commit('REMOVE_PAGE', payload);
    },
    clearPageTab({ commit }, moduleCode) {
      commit('CLEAR_PAGE_TAB', moduleCode);
    },
    maximizePage({ commit }, payload) {
      commit('MAXIMIZE_PAGE', payload);
    }
  };

  const getters = {
    getModuleTabs: (state) => (moduleCode) => {
      return state.modulesTabs[moduleCode] || { pages: new Set(["Dashboard"]), activeTab: "Dashboard" };
    },
  };
  

  export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
  };
  