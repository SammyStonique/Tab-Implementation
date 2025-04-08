<template>
    <div class="main-content z-10 bg-orange-100 px-2 py-2 text-sm">
        <div class="subsection fixed w-[99%] rounded bg-white">
            <div class="">
                <Loader 
                    :loader="loader"
                    :containerWidth="containerWidth"
                    :containerHeight="containerHeight"
                    @showLoader="showLoader"
                    @hideLoader="hideLoader"
                />
            </div>
            <div class="content px-2 w-full">
                <slot name="body"></slot>
            </div>
            <slot name="footer"></slot>
        </div>
    </div>

</template>

<script>
import { defineComponent, ref, onMounted, computed} from 'vue';
import Loader from '@/components/Loader.vue';

export default defineComponent({
    props:{
        loader:{
            type: String,
            default: 'none'
        }
    },
    components: {
        Loader
    },
    setup(props, { emit }){
        const containerWidth = computed(()=>{ `${window.innerWidth}px` });
        const containerHeight = computed(()=>{ `${window.innerHeight}px` });
        const showLoader = () =>{
            emit('showLoader');
        }
        const hideLoader = () =>{
            emit('hideLoader');
        }
        onMounted(()=>{
            containerWidth.value = `${window.innerWidth}px`;
            containerHeight.value = `${window.innerHeight}px`;
        })
        return{
            containerWidth, containerHeight, showLoader, hideLoader
        }
    }
})
</script>

<style>
.main-content{
    z-index: -1;
    margin-left: 1px;
    margin-top: 46px;
    min-height: 90vh;
}
.subsection{
    /* max-height: 70vh; */
    height: 92%;
}
.content{
    /* max-height: 75vh; */
    min-height: 80%;
    max-height: 90%;
    overflow-y: scroll;
}

</style>