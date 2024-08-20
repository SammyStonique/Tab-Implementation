<template>
    <div v-show="hmsOpen && selectedModule =='Hospital Management'">
        <HMS />
    </div>
    <div v-show="hmsOpen && selectedModule =='Financial Accounts'">
        <FA />
    </div>
    <div v-show="hmsOpen && selectedModule =='Inventory Management'">
        <INV />
    </div>
    <div v-show="mainOpen">
        <nav>
            <router-link to="/">Home</router-link> |
            <router-link to="/about">About</router-link> |
            <router-link to="/tabs">Tabs</router-link>
        </nav>
        <div class="w-1/2 flex">
            <div class="basis-1/3" v-for="mod,index in modules" :key="index">
                <button class="rounded bg-green-300 w-48 h-20 mr-4 px-2" @click="openModule(mod)"> {{ mod }} </button>
            </div>
        </div>
    </div>

    <modules-tab />

</template>

<script>
import { useFetchSessionData } from '@/composables/SessionData';
import ModulesTab from '@/components/ModulesTab.vue'
import { useStore } from 'vuex';
import { ref, computed,onBeforeMount } from 'vue';
import HMS from '@/components/HMS/Main.vue'
import FA from '@/components/FA/Main.vue'
import INV from '@/components/INV/Main.vue'
export default{
    components:{
        ModulesTab,
        HMS, FA, INV
    },
    setup(){
        const store = useStore();
        const hmsOpen = computed(() =>{
            return store.state.modulesTab.modulePage
        })
        const mainOpen = computed(() =>{
            return store.state.modulesTab.homePage
        })

        const modules = ref([
            "Hospital Management","Financial Accounts","Inventory Management"
        ])
        const selectedModule = computed(() =>{
            return store.state.modulesTab.selectedModule
        })

        const openModule = (mod) =>{
            store.commit('modulesTab/ADD_TAB', mod),
            hmsOpen.value = true;
            selectedModule.value = mod;
            mainOpen.value = false;
        }
        onBeforeMount(()=>{
            const { fetchSessionData } = useFetchSessionData()
            fetchSessionData();
        })
        return{
            openModule,
            hmsOpen,
            mainOpen,
            modules,
            selectedModule
        }
    }
}
</script>