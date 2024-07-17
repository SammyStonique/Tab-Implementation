<template>
    <div>
      <h2>Tab 2 Content</h2>
      <p>This is the content of Tab 2.</p>
      <div>
            <label for="inputAge">Age: </label>
            <input type="number" name="" id="inputAge" class="border-2 bg-green-300" v-model="age">
        </div>
    </div>
  </template>
  
  <script>
  import { useStore } from 'vuex';
  import { computed } from 'vue';
  export default {
    name: 'Tab2',
    setup(){
        const store = useStore();
        const age = computed({
            get: () => store.state.tab2.age,
            set: (value) => store.commit('tab2/SET_AGE', value),
        });
        return {
            age
        };
    }
  };
  </script>
  