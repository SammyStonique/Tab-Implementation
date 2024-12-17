<template>
    <div v-if="visible" class="min-h-[150px] w-full border border-gray-200">
        <header class="modal-header">
            <div class="flex">
            <div class="basis-3/4 flex justify-start gap-3 text-sm">
                <p class="text-white">{{ detailsTitle }}</p>
            </div>
            <div class="basis-1/4 flex justify-end gap-3 text-sm">
                <div class="basis-1/2"></div>
                <div class="basis-1/2 flex justify-end gap-3">
                <button @click="hideDetails"><i class="fa fa-window-close" aria-hidden="true"></i>
                </button>
                </div>
            </div>
            </div>
        </header>
        <div class="modal-body">
            <slot name="detailSlot"></slot>
        </div>
    </div>
</template>

<script setup>

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  detailsTitle:{
    type: String,
    required: false
  },
})

const emit = defineEmits(['update:visible','hideDetails']);

const hideDetails = () =>{
  emit('hideDetails');
};


</script>

<style scoped>
.modal-header {
  justify-content: space-between;
  padding: 2px;
  /* background: #1F2937; */
  background: #6A7C8F;
  border-bottom: 1px solid #ddd;
}
.modal-body {
  position: relative;
  height: 100%;
  width: 100%;
}

</style>