import { ref } from 'vue';
import axios from "axios";
import { useStore } from 'vuex';
import { useToast } from "vue-toastification";

// Function to fetch session data
export function useFetchSessionData() {
  const store = useStore();
  const toast = useToast();
  const fetchSessionData = async() => {
    await axios.get('api/v1/get-session-data')
    .then((response)=>{
        if(response.data.msg == "Unauthorized"){
          toast.error("Session Expired")
          const newState ={
            activeComponent:"Login",
            isAuthenticated: false,
          }
          store.dispatch('userData/updateState',newState);
        }else{
          const company_modules = {
            "company_modules": response.data.modules
          }
          const user_companies = {
            "user_companies": response.data.companies
          }
          store.dispatch('userData/updateState',company_modules)
          store.dispatch('userData/updateState',user_companies)
        }
        
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