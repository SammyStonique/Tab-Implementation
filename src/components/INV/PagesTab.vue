<template>
    <div class="h-6 bg-gray-200 w-full flex">
        <div v-for="page,index in pageArray" :key="index" class="bg-white rounded text-sm border border-slate-300 px-2">
            <button class="mr-2" @click="openPage(page)">{{ page }}</button>
            <button class="font-bold text-xs" @click="removePage(page)" v-if="page !='Dashboard'">x</button>
        </div>
        
    </div>
    
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';


export default{
    setup(){
        const store = useStore();
        
        const pageArray = computed({
            get: () => store.state.pageTab.invArray,
            set: (value) => store.commit('pageTab/ADD_PAGE', value),
        });
        
        const openPage = (page) =>{
            store.commit('pageTab/MAXIMIZE_TAB', page)
        }
        const removePage = (page) =>{
            store.commit('pageTab/REMOVE_PAGE', page)
        }

        return{
            pageArray,
            removePage,
            openPage,
        }
    }
    
}
</script>