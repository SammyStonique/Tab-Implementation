import { ref } from 'vue';

// Function to format date to YYYY-MM-DD
export function useDateFormatter() {
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const months = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

  const getMonth = (date) =>{
    const month = date.getMonth();
    const monthName = months[month];
    return monthName;
  };

  const getYear = (date) =>{
    const year = date.getFullYear();
    return year;
  };
  
  return {
    formatDate, getYear, getMonth
  };
}
