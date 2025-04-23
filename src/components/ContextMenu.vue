<!-- ContextMenu.vue -->
<template>
    <div v-if="visible" class="absolute bg-white border border-gray-300 min-w-['50px'] rounded shadow-md z-50 text-xs" :style="{ top: `${y}px`, left: `${x}px` }"@click.stop>
      <ul>
        <li
          v-for="(option, index) in options" :key="index" class="border border-gray-100 px-3 py-1 text-left hover:bg-gray-100 cursor-pointer" @click="selectOption(option)"
        >
        <i :class="option.icon"></i> {{ option.label }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { computed } from 'vue';
  import { useStore } from 'vuex';
  
  export default {
    name: 'ContextMenu',
    setup() {
      const store = useStore();
      const visible = computed(() => store.state.contextMenu.visible);
      const x = computed(() => store.state.contextMenu.x);
      const y = computed(() => store.state.contextMenu.y);
      const options = computed(() => store.state.contextMenu.options);
      const contextData = computed(() => store.state.contextMenu.contextData);
  
      const selectOption = (option) => {
        store.commit('contextMenu/SET_SELECTED_ACTION', {
            rowIndex: option.rowIndex,
            action: option.action,
            data: contextData.value,
        });
        store.commit('contextMenu/HIDE_CONTEXT_MENU');
      };
  
      return { visible, x, y, options, selectOption };
    },
  };
  </script>
  