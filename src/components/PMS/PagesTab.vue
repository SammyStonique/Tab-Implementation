<template>
    <div class="tab-container h-6 bg-gray-200 w-full flex">
        <div v-for="page,index in pageArray" :key="index" :class="{'relative text-left pl-1.5 bg-white rounded text-xs pt-1.5 w-36 border border-slate-300': true,'text-slate-400': page === activePage}">
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
            get: () => store.state.pageTab.pmsArray,
            set: (value) => store.commit('pageTab/ADD_PAGE', value),
        });

        const activePage = ref('Dashboard');
        
        const openPage = (page) =>{
            activePage.value = page;
            emit('openPage', page)
        }
        const closePage = (page) =>{
            activePage.value = computed(() => store.state.pageTab.pmsActiveTab);
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
<style>
.tab-container{
    z-index: 1000;
}
.close-tab{
    float: right;
    margin-left: 125px;
    position: absolute;
    border:0px;
    background-color: inherit;
}
</style>