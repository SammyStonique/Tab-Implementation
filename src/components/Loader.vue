<template> 
    <div class="container fixed h-screen w-full bg-gray-200" :style="{display: this.loader}">
        <div class="loader"></div>
    </div>
</template>


<script>
export default{

    props:['loader','showLoader','hideLoader'],
    
}
</script>


<style scoped>
.container{
    opacity: 50%;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    /* z-index: 1020; */
    min-width: 100vw;
    min-height: 100vh;
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