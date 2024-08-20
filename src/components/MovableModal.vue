<template>
    <teleport to="body">
        <div v-if="visible" class="modal-overlay" :style="{top: modal_top, left: modal_left, width: modal_width}">
          <div class="modal" :style="modalStyle">
              <header class="modal-header cursor-move" @mousedown="startDrag" @mousemove="onDrag" @mouseup="stopDrag">
                <div class="flex">
                  <div class="basis-3/4 flex justify-start gap-3 text-sm">
                    <p class="text-white">{{ title }}</p>
                  </div>
                  <div class="basis-1/4 flex justify-end gap-3 text-sm">
                    <div class="basis-1/2"></div>
                    <div class="basis-1/2 flex justify-end gap-3">
                      <button @click="minimize"><i class="fa fa-window-minimize" aria-hidden="true"></i>
                      </button>
                      <button @click="close"><i class="fa fa-window-close" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </header>
              <div class="modal-content" v-show="!isMinimized">
                <div ref="modalRef" class="modal-body">
                  <Loader 
                    :loader="loader"
                    :containerWidth="modalWidth"
                    :containerHeight="modalHeight"
                    @showLoader="showLoader"
                    @hideLoader="hideLoader"
                  />
                  <slot></slot>
                </div>
              </div>
          </div>
        </div>
    </teleport>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
  import Loader from '@/components/Loader.vue';
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    title:{
      type: String,
      required: true
    },
    modal_top:{
      type: String,
      required: true
    },
    modal_left:{
      type: String,
      required: true
    },
    modal_width:{
      type: String,
      required: true
    },
    loader:{
      type: String,
      default: 'none'
    },
  });
  
  const emit = defineEmits(['update:visible','showLoader','hideLoader']);
  
  const isMinimized = ref(false);
  const isDragging = ref(false);
  const startX = ref(0);
  const startY = ref(0);
  const startLeft = ref(0);
  const startTop = ref(0);

  const modalRef = ref(null);
  const modalWidth = ref('0px');
  const modalHeight = ref('0px');

  const showLoader = () => {
    emit('showLoader');
  };

  const hideLoader = () => {
    emit('hideLoader');
  };
  
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

  const updateModalDimensions = () => {
    if (modalRef.value) {
      modalWidth.value = `${modalRef.value.clientWidth}px`;
      modalHeight.value = `${modalRef.value.clientHeight}px`;
    }
  };

  onMounted(() => {
    nextTick(() => {
      updateModalDimensions();
      window.addEventListener('resize', updateModalDimensions);
    });
  });

  watch(() => props.visible, (newVal) => {
    if (newVal) {
      nextTick(updateModalDimensions);
    }
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateModalDimensions);
  });

  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    min-width: 30vw;
    min-height: 20vh;
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
    position: relative;
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

  .modal-body {
    position: relative;
    height: 100%;
    width: 100%;
  }
  </style>
  