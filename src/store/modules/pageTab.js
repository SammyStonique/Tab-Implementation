import { useStore } from 'vuex';

const state = {
    hmsArray: new Set(["Dashboard"]),
    pmsArray: new Set(["Dashboard"]),
    faArray: new Set(["Dashboard"]),
    hrArray: new Set(["Dashboard"]),
    invArray: new Set(["Dashboard"]),
    mmsArray: new Set(["Dashboard"]),
    hhsArray: new Set(["Dashboard"]),
    epsArray: new Set(["Dashboard"]),
    setArray: new Set(["Dashboard"]),
    accArray: new Set(["Dashboard"]),
    pssArray: new Set(["Dashboard"]),
    vssArray: new Set(["Dashboard"]),
    sapArray: new Set(["Dashboard"]),
    hmsActiveTab: 'Dashboard',
    pmsActiveTab: 'Dashboard',
    hrActiveTab: 'Dashboard',
    faActiveTab: 'Dashboard',
    invActiveTab: 'Dashboard',
    mmsActiveTab: 'Dashboard',
    hhsActiveTab: 'Dashboard',
    epsActiveTab: 'Dashboard',
    setActiveTab: 'Dashboard',
    accActiveTab: 'Dashboard',
    pssActiveTab: 'Dashboard',
    vssActiveTab: 'Dashboard',
    sapActiveTab: 'Dashboard',
  };
  
  const mutations = {
    ADD_PAGE(state, page) {
      for(const [key, value] of Object.entries(page)){
        const pageObject = {
          moduleName: key,     
          pageName: value.name,  
          pageComponent: value.component,
        };
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
        }else if(key == 'EPS'){
          state.epsArray.add(value);
          state.epsActiveTab = value;
        }else if(key == 'HHS'){
          state.hhsArray.add(value);
          state.hhsActiveTab = value;
        }else if(key == 'MMS'){
          state.mmsArray.add(value);
          state.mmsActiveTab = value;
        }else if(key == 'SET'){
          state.setArray.add(value);
          state.setActiveTab = value;
        }else if(key == 'ACC'){
          state.accArray.add(value);
          state.accActiveTab = value;
        }else if(key == 'PSS'){
          state.pssArray.add(value);
          state.pssActiveTab = value;
        }else if(key == 'VSS'){
          state.vssArray.add(value);
          state.vssActiveTab = value;
        }else if(key == 'SAP'){
          state.sapArray.add(value);
          state.sapActiveTab = value;
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
        else if(key == 'EPS'){
          state.epsArray.delete(value);
          let myArray = Array.from(state.epsArray);
          state.epsActiveTab = myArray[myArray.length - 1];
        }
        else if(key == 'HHS'){
          state.hhsArray.delete(value);
          let myArray = Array.from(state.hhsArray);
          state.hhsActiveTab = myArray[myArray.length - 1];
        }
        else if(key == 'MMS'){
          state.mmsArray.delete(value);
          let myArray = Array.from(state.mmsArray);
          state.mmsActiveTab = myArray[myArray.length - 1];
        }
        else if(key == 'SET'){
          state.setArray.delete(value);
          let myArray = Array.from(state.setArray);
          state.setActiveTab = myArray[myArray.length - 1];
        }
        else if(key == 'ACC'){
          state.accArray.delete(value);
          let myArray = Array.from(state.accArray);
          state.accActiveTab = myArray[myArray.length - 1];
        }else if(key == 'PSS'){
          state.pssArray.delete(value);
          let myArray = Array.from(state.pssArray);
          state.pssActiveTab = myArray[myArray.length - 1];
        }else if(key == 'VSS'){
          state.pssArray.delete(value);
          let myArray = Array.from(state.pssArray);
          state.pssActiveTab = myArray[myArray.length - 1];
        }else if(key == 'SAP'){
          state.sapArray.delete(value);
          let myArray = Array.from(state.sapArray);
          state.sapActiveTab = myArray[myArray.length - 1];
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
      }else if(module == 'Employee Portal'){
        state.epsArray = new Set(["Dashboard"]);
        state.epsActiveTab = "Dashboard"; 
      }else if(module == 'Hotel Management'){
        state.hhsArray = new Set(["Dashboard"]);
        state.hhsActiveTab = "Dashboard"; 
      }else if(module == 'Membership Management'){
        state.mmsArray = new Set(["Dashboard"]);
        state.mmsActiveTab = "Dashboard"; 
      }else if(module == 'Settings'){
        state.setArray = new Set(["Dashboard"]);
        state.setActiveTab = "Dashboard"; 
      }else if(module == 'My Account'){
        state.accArray = new Set(["Dashboard"]);
        state.accActiveTab = "Dashboard"; 
      }else if(module == 'Property Sales'){
        state.pssArray = new Set(["Dashboard"]);
        state.pssActiveTab = "Dashboard"; 
      }else if(module == 'Vehicle Sales'){
        state.vssArray = new Set(["Dashboard"]);
        state.vssActiveTab = "Dashboard"; 
      }else if(module == 'Sales Agent Portal'){
        state.sapArray = new Set(["Dashboard"]);
        state.sapActiveTab = "Dashboard"; 
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
  
  