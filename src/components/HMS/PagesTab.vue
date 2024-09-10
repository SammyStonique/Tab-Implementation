<template>
    <div class="tab-container h-6 bg-slate-300 w-full flex">
        <div v-for="page,index in pageArray" :key="index" style="z-index: 10;" :class="{'relative text-left pl-1.5 bg-white rounded text-xs pt-1.5 w-40 border border-slate-300': true,'bg-gray-400': page === activePage}">
            <button class="text-left w-3/4 mr-2" @click="openPage(page)">{{ page }}</button>
            <button class="close-tab left-2 font-bold text-xs" @click="closePage(page)" v-if="page !='Dashboard'">x</button>
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

        const activePage = computed(() => store.state.pageTab.hmsActiveTab);
        
        const openPage = (page) =>{
            activePage.value = page;
            emit('openPage', page)
        }
        const closePage = (page) =>{
            activePage.value = computed(() => store.state.pageTab.hmsActiveTab);
            emit('closePage', page)
        }

        return{
            pageArray, activePage,
            closePage,
            openPage,
        }
    }
    
})
</script>

<style scoped>

.close-tab{
    float: right;
    margin-left: 140px;
    position: absolute;
    border:0px;
    background-color: inherit;
}
</style>