<template>
    <div>
        <nav>
            <router-link to="/">Home</router-link> |
            <router-link to="/about">About</router-link> |
            <router-link to="/tabs">Tabs</router-link>
        </nav>
      <div class="tabs">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.name"
          :class="['tab', { active: activeTab === index }]"
          @click="selectTab(index)"
        >
          {{ tab.name }}
        </button>
      </div>
      <div class="tab-content">
        <component :is="activeComponent" />
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  import Tab1 from '@/components/Tab1.vue'
  import Tab2 from '@/components/Tab2.vue';
  
  export default {
    components: {
      Tab1,
      Tab2
    },
    setup() {
      const activeTab = ref(0);
      const tabs = [
        { name: 'Tab 1', component: 'Tab1' },
        { name: 'Tab 2', component: 'Tab2' },
        { name: 'Tab 3', component: 'AddPatient' },
      ];
  
      const activeComponent = computed(() => tabs[activeTab.value].component);
  
      const selectTab = (index) => {
        activeTab.value = index;
      };
  
      return {
        activeTab,
        tabs,
        activeComponent,
        selectTab,
      };
    },
  };
  </script>
  
  <style scoped>
  .tabs {
    display: flex;
    border-bottom: 1px solid #ccc;
  }
  
  .tab {
    padding: 10px 20px;
    cursor: pointer;
  }
  
  .tab.active {
    border-bottom: 2px solid #000;
  }
  
  .tab-content {
    padding: 20px;
  }
  </style>
  