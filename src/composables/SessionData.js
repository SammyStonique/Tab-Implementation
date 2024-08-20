import { ref } from 'vue';
import axios from "axios";

// Function to fetch session data
export function useFetchSessionData() {
  const fetchSessionData = async() => {
    await axios.get('api/v1/get-session-data')
    .then((response)=>{
        console.log("THE SESSION DATA IS ",response.data);
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