<template> 
    <div class="container bg-gray-200" :style="{display: loader, width: containerWidth, height: containerHeight }">
        <div class="loader"></div>
    </div>
</template>


<script>
import { defineComponent, ref } from 'vue';
export default defineComponent({
    props:{
        loader:{
            type: String,
            default: "none"
        },
        containerWidth: {
            type: String,
            default: '100vw' 
        },
        containerHeight: {
            type: String,
            default: '100vh' 
        }
    },
    setup(props, {emit}){
        const loaderIndex = ref(1);
        const showLoader = () =>{
            props.loader = "block";
            loaderIndex.value = -1;
            emit('showLoader');
        }
        const hideLoader = () =>{
            props.loader = "none";
            loaderIndex.value = 1;
            emit('hideLoader');
        }
        return{
            showLoader, hideLoader
        }
    }
    
})
</script>


<style scoped>
.container{
    opacity: 50%;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    overflow: hidden;
}
 .loader {
    position: absolute;
    display: block;
    z-index: 2000;
    left: 45%;
    top: 40%;
    border: 16px solid #f3f3f3;
    border-radius: 50%;
    border-top: 16px solid #1f2937;
    width: 120px;
    height: 120px;
    -webkit-animation: spin 2s linear infinite; /* Safari */
    animation: spin 2s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>