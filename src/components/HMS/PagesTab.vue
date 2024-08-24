<template>
    <div class="h-6 bg-gray-200 w-full flex">
        <div v-for="page,index in pageArray" :key="index" class="bg-white rounded text-sm w-44 border border-slate-300 pl-2">
            <button class="mr-2" @click="openPage(page)">{{ page }}</button>
            <button class="font-bold text-xs" @click="closePage(page)" v-if="page !='Dashboard'">x</button>
        </div>
        
    </div>
    
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { defineComponent } from 'vue';
export default defineComponent({
    setup(_, { emit }){
        const store = useStore();
        
        const pageArray = computed({
            get: () => store.state.pageTab.hmsArray,
            set: (value) => store.commit('pageTab/ADD_PAGE', value),
        });
        
        const openPage = (page) =>{
          emit('openPage', page)
        }
        const closePage = (page) =>{
          emit('closePage', page)
        }

        return{
            pageArray,
            closePage,
            openPage,
        }
    }
    
})
</script>