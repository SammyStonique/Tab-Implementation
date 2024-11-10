<template>
    <div class="tab-container h-6 bg-slate-300 w-full flex">
        <button @click="scrollLeft" class="absolute h-6 left-0 z-20 bg-gray-200 p-1">←</button>
        <div ref="tabsWrapper" class="tabs-wrapper flex-1 overflow-x-auto no-scrollbar relative">
            <div class="tabs flex pl-5">
                <div v-for="page,index in pageArray" :key="index" style="z-index: 10;" :class="{'relative text-left pl-1.5 bg-white rounded text-xs pt-1.5 w-40 border border-slate-300': true,'bg-gray-400 text-gray-400': page === activePage}">
                    <button class="text-left w-3/4 mr-2" @click="openPage(page)">{{ page }}</button>
                    <button class="close-tab left-2 font-bold text-xs" @click="closePage(page)" v-if="page !='Dashboard'">x</button>
                </div>
            </div>
        </div>
        <button @click="scrollRight" class="absolute right-0 h-6 z-20 bg-gray-200 p-1">→</button>
    </div>
    
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { defineComponent } from 'vue';
export default defineComponent({
    setup(_, { emit }){
        const store = useStore();

        const tabsWrapper = ref(null);

        const scrollLeft = () => {
            if (tabsWrapper.value) {
                tabsWrapper.value.scrollBy({ left: -400, behavior: 'smooth' });
            }
        };

        const scrollRight = () => {
            if (tabsWrapper.value) {
                tabsWrapper.value.scrollBy({ left: 400, behavior: 'smooth' });
            }
        };
        
        const pageArray = computed({
            get: () => store.state.pageTab.setArray,
            set: (value) => store.commit('pageTab/ADD_PAGE', value),
        });

        const activePage = computed(() => store.state.pageTab.setActiveTab);
        // const activePage = ref('Dashboard');
        
        const openPage = (page) =>{
            activePage.value = page;
            emit('openPage', page)
        }
        const closePage = (page) =>{
            activePage.value = computed(() => store.state.pageTab.setActiveTab);
            emit('closePage', page)
        }

        return{
            pageArray, activePage, tabsWrapper, scrollLeft, scrollRight,
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
.tabs-wrapper {
    overflow-x: auto;
    flex: 1;
    position: relative;
}

.tabs {
    display: flex;
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}
</style>