<template>
    <div class="sticky-navbar bg-white border-b border-slate-300 flex justify-end">
        <div class="flex w-12 py-0.5">
            <div class="flex-1 flex items-center"><button class="text-sm rounded bg-slate-700 text-white w-4 h-4" @click="minimize">-</button></div>
            <div class="flex-1 flex items-center"><button class="text-sm rounded bg-slate-700 text-white w-4 h-4" @click="close">x</button></div>
        </div>
    </div>
    

</template>

<script>
import { defineComponent } from 'vue';
export default defineComponent({
    setup(_, { emit }){
        const minimize = () =>{
            emit('minimize')
        }
        const close = () =>{
            emit('close')
        }
        return{
            close,
            minimize
        }
    }
})
</script>