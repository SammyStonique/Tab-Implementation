<template>
    <transition name="modal-fade">
      <div class="modal-backdrop bg-gray-100 bg-opacity-50">
          <div class="modal rounded-lg" role="dialog" aria-labelledby="modalTitle" aria-describedby="modalDescription">
          <header class="modal-header" id="modalTitle">
              <slot name="header">This is the default title!</slot>
              <button type="button" class="btn-close" @click="close" aria-label="Close modal">
              x
              </button>
          </header>
  
          <section class="modal-body" id="modalDescription">
              <slot name="body">This is the default body!</slot>
              <DynamicForm :fields="fields" :submitButtonLabel="submitButtonLabel"/>
          </section>
  
          <footer class="modal-footer">
              <slot name="footer">This is the default footer!</slot>
              <!-- <button type="button" class="btn-green" @click="close" aria-label="Close modal">
              Close
              </button> -->
          </footer>
          </div>
      </div>
    </transition>
  </template>
  
  <script>
  import DynamicForm from '@/components/DynamicForm.vue'
  export default {
    name: "Modal",
    props:{
      index: {
        type: Number,
      },
      fields:{
        type: Array,
        default: () => []
      },
      submitButtonLabel:{
        type: String,
      }
    },
    components:{
      DynamicForm
    },
    setup(props,{ emit }){
      const close = () =>{
        emit("close")
      }
      return{
        close
      }
    },
  };
  </script>
  
  <style scoped>
  .modal-backdrop {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* z-index: 1000; */
    }
  
  .modal {
    background: #ffffff;
    box-shadow: 2px 2px 12px 1px;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
    max-width: 100%;
    height: fit-content;
    max-height: 100vh;

  }
  
  .modal-header,
  .modal-footer {
    padding: 15px;
    display: flex;
    color: #4aae9b;
    text-align: center;
  }
  
  .modal-header {
    position: relative;
    border-bottom: 1px solid #eeeeee;
    color: #4aae9b;
    justify-content: space-between;
    text-align: center;
  }
  
  .modal-footer {
    border-top: 1px solid #eeeeee;
    flex-direction: column;
    justify-content: flex-end;
  }
  
  .modal-body {
    position: relative;
    padding: 20px 5px;
    color: black;
    max-height: calc(100vh - 210px);
    overflow-y: auto;
    padding-left: 30px;
  }
  
  .btn-close {
    position: absolute;
    top: 0;
    right: 0;
    border: none;
    font-size: 20px;
    padding: 10px;
    cursor: pointer;
    font-weight: bold;
    color: #4aae9b;
    background: transparent;
  }
  
  .btn-green {
    color: white;
    background: #4aae9b;
    border: 1px solid #4aae9b;
    border-radius: 2px;
    width: 70px;
    padding: 4px 10px 4px 10px;
  }
  .modal-fade-enter,
  .modal-fade-leave-to {
    opacity: 0;
  }
  
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 1s ease;
  }
  </style>