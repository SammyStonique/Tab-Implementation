import { ref } from 'vue';
import axios from "axios";
import { useStore } from 'vuex';

// Function to fetch session data
export function useFetchSessionData() {
  const store = useStore();
  const fetchSessionData = async() => {
    await axios.get('api/v1/get-session-data')
    .then((response)=>{
        console.log("THE SESSION DATA IS ",response.data);
        const company_modules = {
          "company_modules": response.data.modules
        }
        const user_companies = {
          "user_companies": response.data.companies
        }
        store.dispatch('userData/updateState',company_modules)
        store.dispatch('userData/updateState',user_companies)
    })
    .catch((error)=>{
        console.log(error.message)
    })
  };

  // You can return the function or any other reactive state if needed
  return {
    fetchSessionData,
  };
}