<template>
    <div class="main-container w-full min-h-[90vh] bottom-8">
        <div class="fixed top-0 w-full z-50">
            <div class="z-50 relative">
                <NavBar :title="title" @minimize="minimize" @close="close"/>
            </div> 
            <div class="z-40 relative">
                <NavBarACC @openPage="selectTab"/>
            </div>
            <div class="z-30">
                <PagesTab @openPage="selectedTab" @closePage="closeTab"/>
            </div>
        </div>

        <div class="tab-content z-20 overflow-y-hidden">
            <keep-alive :include="cachedComponents">
                <component 
                    :is="activeComponent"
                 />
            </keep-alive>
        </div>
        
    </div>
</template>

<script>
import { useStore } from 'vuex';
import { ref, computed, watch } from 'vue';
import NavBar from '@/components/NavBar.vue'
import NavBarACC from '@/components/ACC/NavBarACC.vue';
import PagesTab from '@/components/ACC/PagesTab.vue';
import Dashboard from '@/components/ACC/Dashboard.vue';
import Reset_Password from '@/components/ACC/Reset_Password.vue';


export default{
    components:{
        NavBar,
        NavBarACC,
        PagesTab,
        Dashboard,Reset_Password
    },
    props: {
        title: {
            type: String,
            required: true,
        },
    },
    setup(){
        const store = useStore();
        const title = ref('My Account');
        const cachedComponents = computed(() =>  Array.from(store.state.pageTab.accArray));
        const tabs = computed({
            get: ()=> store.state.pageTab.accArray,
        });

        const activeTab = computed(() => store.state.pageTab.accActiveTab);
    
        const activeComponent = computed(() => activeTab.value);
    
        const selectTab = (pageName) => {
            for(const [key, value] of Object.entries(pageName)){
                store.state.pageTab.accActiveTab = value;
            }
        };
        const selectedTab = (pageName) => {
            store.state.pageTab.accActiveTab = pageName;
        };
        const closeTab = (pageName) =>{
            let page = {"ACC":pageName};
            store.commit('pageTab/REMOVE_PAGE', page)
            store.commit(`${pageName}/RESET_SEARCH_FILTERS`)
            activeTab.value = store.state.pageTab.accActiveTab;
            store.commit(`${pageName}/initializeStore`);
        }
        const minimize = () =>{
            store.commit('modulesTab/MINIMIZE_TAB')
        }
        const close = () =>{
            let myArray = Array.from(tabs.value);
            for(let i=0; i<myArray.length; i++){
                store.commit(`${myArray[i]}/RESET_SEARCH_FILTERS`)
                store.commit(`${myArray[i]}/initializeStore`)
            }
            store.commit('modulesTab/REMOVE_TAB', {'ACC':'My Account'}),
            store.commit('pageTab/CLEAR_PAGE_TAB', 'My Account');
            activeTab.value = store.state.pageTab.accActiveTab;
        }
        return{
            close,minimize,title,activeComponent,selectTab, selectedTab, closeTab,activeTab, cachedComponents
        }
    },
    mounted(){
        const store = useStore();
        this.activeTab = store.state.pageTab.accActiveTab;
    }
}
</script>

<style>
.tab-content{
    margin-top: 35px;
}
.main-container{
    max-height: 100vh;
    overflow: hidden;
}

</style>