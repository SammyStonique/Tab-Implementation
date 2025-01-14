
const state = {
    tabArray: new Set(),
    homePage: true,
    modulePage: false,
    selectedModule: ''
  };
  
  const mutations = {
    ADD_TAB(state, tab) {
      state.tabArray.add(tab);
      state.homePage = false;
      state.modulePage = true;
      state.selectedModule = tab;
    },
    MAXIMIZE_TAB(state, tab) {
      state.homePage = false;
      state.modulePage = true;
      state.selectedModule = tab;
    },
    MINIMIZE_TAB(state) {
      state.homePage = true;
      state.modulePage = false;
      state.selectedModule = '';
    },
    REMOVE_TAB(state, tab) {
      for(const [key, value] of Object.entries(tab)){
        if(key == 'HMS'){
          state.tabArray.delete(value);
          let myArray = Array.from(state.tabArray);
          if(myArray.length >= 1){
            state.selectedModule = myArray[myArray.length - 1];
          }else if(myArray.length < 1){
            state.homePage = true;
            state.modulePage = false;
            state.selectedModule = '';
          }
          
        }else if(key == 'INV'){
          state.tabArray.delete(value);
          let myArray = Array.from(state.tabArray);
          if(myArray.length >= 1){
            state.selectedModule = myArray[myArray.length - 1];
          }else if(myArray.length < 1){
            state.homePage = true;
            state.modulePage = false;
            state.selectedModule = '';
          }
        }else if(key == 'FA'){
          state.tabArray.delete(value);
          let myArray = Array.from(state.tabArray);
          if(myArray.length >= 1){
            state.selectedModule = myArray[myArray.length - 1];
          }else if(myArray.length < 1){
            state.homePage = true;
            state.modulePage = false;
            state.selectedModule = '';
          }
        }else if(key == 'PMS'){
          state.tabArray.delete(value);
          let myArray = Array.from(state.tabArray);
          if(myArray.length >= 1){
            state.selectedModule = myArray[myArray.length - 1];
          }else if(myArray.length < 1){
            state.homePage = true;
            state.modulePage = false;
            state.selectedModule = '';
          }
        }
        else if(key == 'HR'){
          state.tabArray.delete(value);
          let myArray = Array.from(state.tabArray);
          if(myArray.length >= 1){
            state.selectedModule = myArray[myArray.length - 1];
          }else if(myArray.length < 1){
            state.homePage = true;
            state.modulePage = false;
            state.selectedModule = '';
          }
        }else if(key == 'MMS'){
          state.tabArray.delete(value);
          let myArray = Array.from(state.tabArray);
          if(myArray.length >= 1){
            state.selectedModule = myArray[myArray.length - 1];
          }else if(myArray.length < 1){
            state.homePage = true;
            state.modulePage = false;
            state.selectedModule = '';
          }
        }else if(key == 'SET'){
          state.tabArray.delete(value);
          let myArray = Array.from(state.tabArray);
          if(myArray.length >= 1){
            state.selectedModule = myArray[myArray.length - 1];
          }else if(myArray.length < 1){
            state.homePage = true;
            state.modulePage = false;
            state.selectedModule = '';
          }
        }
        
      }
    },

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
  
  