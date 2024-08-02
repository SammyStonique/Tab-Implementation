<template>
    <div class="main-content z-10 bg-gray-100 px-4 py-4 text-sm">
        <!-- <Loader 
            :loader="loader"
            :showLoader="showLoader"
            :hideLoader="hideLoader"
        /> -->
        <div class="subsection fixed w-[97%] rounded bg-white">
            <div class="content px-8 w-full">
                <slot name="body"></slot>
            </div>
            <slot name="footer"></slot>
        </div>
    </div>

</template>

<script>
import { defineComponent, ref } from 'vue';
import Loader from '@/components/Loader.vue'

export default defineComponent({
    props:{
        // addButtonLabel:{
        //     type: String,
        //     required: true
        // },
    },
    setup(props, { emit }){

        return{

        }
    }
})
</script>

<style>
.main-content{
    z-index: -1;
    margin-left: 1px;
    margin-top: 90px;
    min-height: 100vh;
}
.subsection{
    max-height: 70vh;
}
.content{
    max-height: 75vh;
    overflow-y: scroll;
}

</style>