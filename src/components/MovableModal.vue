<template>
    <teleport to="body">
        <div v-if="visible" class="modal-overlay" >
        <div class="modal" :style="modalStyle">
            <header class="modal-header cursor-move" @mousedown="startDrag" @mousemove="onDrag" @mouseup="stopDrag">
            <div class="flex justify-end gap-3 text-sm">
                <button @click="minimize"><i class="fa fa-window-minimize" aria-hidden="true"></i>
                </button>
                <button @click="close"><i class="fa fa-window-close" aria-hidden="true"></i>
                </button>
            </div>
            </header>
            <div class="modal-content" v-show="!isMinimized">
            <slot></slot>
            </div>
        </div>
        </div>
    </teleport>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['update:visible']);
  
  const isMinimized = ref(false);
  const isDragging = ref(false);
  const startX = ref(0);
  const startY = ref(0);
  const startLeft = ref(0);
  const startTop = ref(0);
  
  const close = () => {
    emit('update:visible', false);
  };
  
  const minimize = () => {
    isMinimized.value = !isMinimized.value;
  };
  
  const modalStyle = computed(() => ({
    top: `${startTop.value}px`,
    left: `${startLeft.value}px`,
    position: 'absolute',
  }));
  
  const startDrag = (event) => {
    isDragging.value = true;
    startX.value = event.clientX;
    startY.value = event.clientY;
    startLeft.value = parseInt(modalStyle.value.left, 10) || 0;
    startTop.value = parseInt(modalStyle.value.top, 10) || 0;
  };
  
  const onDrag = (event) => {
    if (!isDragging.value) return;
    const dx = event.clientX - startX.value;
    const dy = event.clientY - startY.value;
    startLeft.value += dx;
    startTop.value += dy;
    startX.value = event.clientX;
    startY.value = event.clientY;
  };
  
  const stopDrag = () => {
    isDragging.value = false;
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 280px;
    left: 400px;
    min-width: 15vw;
    min-height: 20vh;
    /* background: rgba(0, 0, 0, 0.5); */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001;
  }
  
  .modal {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    min-width: 15vw;
    z-index: 1000;
  }
  
  .modal-header {
    justify-content: space-between;
    padding: 10px;
    /* background: #1F2937; */
    background: #384659;
    border-bottom: 1px solid #ddd;
  }
  
  .modal-content {
    padding: 20px;
    color: #1f2b37;
  }
  </style>
  