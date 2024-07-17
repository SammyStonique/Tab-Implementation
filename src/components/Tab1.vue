<template>
    <div>
      <h2>Tab 1 Content</h2>
      <p>This is the content of Tab 1.</p>
        <div>
            <label for="nameInput">Name: </label>
            <input type="text" name="" id="nameInput" class="border-2 bg-red-300" v-model="name">
        </div>
    </div>
  </template>
  
  <script>
  import { useStore } from 'vuex';
  import { computed } from 'vue';
  export default {
    name: 'Tab1',
    setup(){
        const store = useStore();
        const name = computed({
            get: () => store.state.tab1.name,
            set: (value) => store.commit('tab1/SET_NAME', value),
        });
        return {
            name
        };
    }
  };
  </script>
  