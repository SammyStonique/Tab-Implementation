import { useStore } from 'vuex';

const state = {
    hmsArray: new Set(["Dashboard"]),
    pmsArray: new Set(["Dashboard"]),
    faArray: new Set(["Dashboard"]),
    hrArray: new Set(["Dashboard"]),
    invArray: new Set(["Dashboard"]),
    setArray: new Set(["Dashboard"]),
    hmsActiveTab: 'Dashboard',
    pmsActiveTab: 'Dashboard',
    hrActiveTab: 'Dashboard',
    faActiveTab: 'Dashboard',
    invActiveTab: 'Dashboard',
    setActiveTab: 'Dashboard',
  };
  
  const mutations = {
    ADD_PAGE(state, page) {
      for(const [key, value] of Object.entries(page)){
        if(key == 'HMS'){
          state.hmsArray.add(value);
          state.hmsActiveTab = value;
        }else if(key == 'INV'){
          state.invArray.add(value);
          state.invActiveTab = value;
        }else if(key == 'FA'){
          state.faArray.add(value);
          state.faActiveTab = value;
        }else if(key == 'PMS'){
          state.pmsArray.add(value);
          state.pmsActiveTab = value;
        }else if(key == 'HR'){
          state.hrArray.add(value);
          state.hrActiveTab = value;
        }else if(key == 'SET'){
          state.setArray.add(value);
          state.setActiveTab = value;
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
        else if(key == 'PMS'){
          state.pmsArray.delete(value);
          let myArray = Array.from(state.pmsArray);
          state.pmsActiveTab = myArray[myArray.length - 1];
        }
        else if(key == 'HR'){
          state.hrArray.delete(value);
          let myArray = Array.from(state.hrArray);
          state.hrActiveTab = myArray[myArray.length - 1];
        }
        else if(key == 'SET'){
          state.setArray.delete(value);
          let myArray = Array.from(state.setArray);
          state.setActiveTab = myArray[myArray.length - 1];
        }
      } 
    },
    CLEAR_PAGE_TAB(state, module){
      if(module == 'Hospital Management'){
        state.hmsArray = new Set(["Dashboard"]);
        state.hmsActiveTab = "Dashboard"; 
      }else if(module == 'Inventory Management'){
        state.invArray = new Set(["Dashboard"]);
        state.invActiveTab = "Dashboard"; 
      }else if(module == 'Financial Accounts'){
        state.faArray = new Set(["Dashboard"]);
        state.faActiveTab = "Dashboard"; 
      }else if(module == 'Property Management'){
        state.pmsArray = new Set(["Dashboard"]);
        state.pmsActiveTab = "Dashboard"; 
      }else if(module == 'Human Resource'){
        state.hrArray = new Set(["Dashboard"]);
        state.hrActiveTab = "Dashboard"; 
      }else if(module == 'Settings'){
        state.setArray = new Set(["Dashboard"]);
        state.setActiveTab = "Dashboard"; 
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
  
  