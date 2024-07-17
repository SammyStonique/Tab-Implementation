import { ref } from 'vue';
import axios from 'axios';

export default function patientsData() {
  const data = ref([]);

  const fetchData = async (formData) => {
    try {
      const response = await axios.post(`api/v1/get-patients/`, formData)
      data.value = await response.data;
      console.log("THE FETCHED DATA IS ",data.value)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return {
    data,
    fetchData,
  };
}
