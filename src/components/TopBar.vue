<template>
    <div class="sticky-navbar bg-orange-400 flex justify-end p-2">
      <!-- Container for the buttons, keeping them horizontally aligned -->
      <div class="flex space-x-2">
        <!-- Minimize Button -->
        <button class="text-xs sm:text-sm rounded bg-slate-700 text-white w-4 h-4 sm:w-4 sm:h-4"@click="minimize" aria-label="Minimize">-</button>
  
        <!-- Close Button -->
        <button class="text-xs sm:text-sm rounded bg-slate-700 text-white w-4 h-4 sm:w-4 sm:h-4"@click="close" aria-label="Close">x</button>
      </div>
    </div>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    setup(_, { emit }) {
      const minimize = () => {
        emit('minimize');
      };
      const close = () => {
        emit('close');
      };
  
      return {
        close,
        minimize,
      };
    },
  });
  </script>
  
  <style scoped>
  .sticky-navbar {
    position: sticky;
    top: 0;
    z-index: 1000;
  }
  </style>
  