import { useStore } from 'vuex';

const state = {
    hmsArray: new Set(["Dashboard"]),
    faArray: new Set(["Dashboard"]),
    invArray: new Set(["Dashboard"]),
    hmsActiveTab: 'Dashboard',
    faActiveTab: 'Dashboard',
    invActiveTab: 'Dashboard',
  };
  
  const mutations = {
    ADD_PAGE(state, page) {
      for(const [key, value] of Object.entries(page)){
        if(key == 'HMS'){
          state.hmsArray.add(value);
          state.hmsActiveTab = value;
          console.log("THE hmsArray IS ",state.hmsArray)
        }else if(key == 'INV'){
          state.invArray.add(value);
          state.invActiveTab = value;
        }else if(key == 'FA'){
          state.faArray.add(value);
          state.faActiveTab = value;
        }
      } 
    },
    MAXIMIZE_PAGE(state, page) {
      for(const [key, value] of Object.entries(page)){

      }
      state.homePage = false;
      state.modulePage = true;
    },
    REMOVE_PAGE(state, page) {
      for(const [key, value] of Object.entries(page)){
        if(key == 'HMS'){
          state.hmsArray.delete(value);
          let myArray = Array.from(state.hmsArray);
          state.hmsActiveTab = myArray[myArray.length - 1];
        }else if(key == 'INV'){
          state.invArray.delete(value);
          let myArray = Array.from(state.invArray);
          state.invActiveTab = myArray[myArray.length - 1];
        }else if(key == 'FA'){
          state.faArray.delete(value);
          let myArray = Array.from(state.faArray);
          state.faActiveTab = myArray[myArray.length - 1];
        }
      } 
    },
    CLEAR_PAGE_TAB(state, module){
      if(module == 'Hospital Management'){
        state.hmsArray = new Set(["Dashboard"]);
        state.hmsActiveTab = "Dashboard"; 
        // console.log("I SHOULD BE RUNNING");
      }else if(module == 'Inventory Management'){
        state.invArray = new Set(["Dashboard"]);
        state.invActiveTab = "Dashboard"; 
      }else if(module == 'Financial Accounts'){
        state.faArray = new Set(["Dashboard"]);
        state.faActiveTab = "Dashboard"; 
      } 
    }

  };
  
  const actions = {

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
  
  