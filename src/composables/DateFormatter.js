// src/composables/useDateFormatter.js

import { ref } from 'vue';

// Function to format date to YYYY-MM-DD
export function useDateFormatter() {
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // You can return the function or any other reactive state if needed
  return {
    formatDate,
  };
}
