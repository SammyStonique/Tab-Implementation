<template>
    <div class="fixed bottom-0 h-6 bg-orange-200 w-full flex">
        <div v-for="tab,index in tabArray" :key="index" :class="{'bg-white text-sm pt-1 rounded border border-slate-300 px-2': true,'bg-gray-400': tab === activeModule}">
            <button class="mr-2" @click="openTab(tab)">{{ tab }}</button>
        </div>
    </div>
    
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';


export default{
    setup(){
        const store = useStore();
        const activeModule = computed(() => store.state.modulesTab.selectedModule);
        const tabArray = computed({

            get: () => store.state.modulesTab.tabArray,
            set: (value) => store.commit('modulesTab/ADD_TAB', value),
        });
        const openTab = (tab) =>{
            activeModule.value = tab;
            store.commit('modulesTab/MAXIMIZE_TAB', tab)
        }

        return{
            tabArray,activeModule,
            openTab
        }
    }
    
}
</script>