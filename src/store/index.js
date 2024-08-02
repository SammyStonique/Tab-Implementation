import { createStore } from 'vuex';
import tab1 from './modules/tab1Store';
import tab2 from './modules/tab2Store';
import modulesTab from './modules/modulesTab';
import pageTab from './modules/pageTab';
import Appointments from './HMS/Appointments';
import Client_Categories from './FA/Client_Categories';
import Departments from './HMS/Departments';
import Patients_List from './HMS/Patients_List';
import Medical_Fees from './HMS/Medical_Fees';
import Doctors from './HMS/Doctors';

export default createStore({
  modules: {
    tab1,
    tab2,
    modulesTab,
    pageTab,
    Appointments,Client_Categories,Departments,Patients_List,Medical_Fees,Doctors

  },
});
