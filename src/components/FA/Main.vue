<template>
    <div class="bg-blue-200 w-full min-h-[98vh] bottom-8">
        <div class="fixed top-0 w-full z-50">
            <NavBar :title="title" @minimize="minimize" @close="close"/>
            <NavBarFA  @openPage="selectTab"/>
            <PagesTab @openPage="selectedTab" @closePage="closeTab"/>
        </div>
        <div class="tab-content z-10 overflow-y-hidden">
            <keep-alive>
                <component :is="activeComponent" />
            </keep-alive>
        </div>
    </div>
    
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import NavBarFA from '@/components/FA/NavBarFA.vue';
import PagesTab from '@/components/FA/PagesTab.vue';
import Dashboard from '@/components/FA/Dashboard.vue';
import Client_Categories from '@/components/FA/Client_Categories.vue';
import { useStore } from 'vuex';
import { ref, computed } from 'vue';
export default{
    components:{
        NavBar, Dashboard,
        NavBarFA, PagesTab, Client_Categories
    },
    props: {
        title: {
            type: String,
            required: true,
        },
    },
    setup(){
        const store = useStore();
        const title = ref('Financial Accounts')
        const activeTab = ref('');
        const tabs = computed(()=> store.state.pageTab.faArray);
    
        const activeComponent = computed(() => activeTab.value);
    
        const selectTab = (pageName) => {
            for(const [key, value] of Object.entries(pageName)){
                activeTab.value = value;
                console.log("THE SELECTED TAB IS ",activeTab.value);
            }
        };
        const selectedTab = (pageName) => {
            activeTab.value = pageName;
            store.state.pageTab.faActiveTab = pageName;
        };
        const closeTab = (pageName) =>{
            let page = {"FA":pageName};
            store.commit('pageTab/REMOVE_PAGE', page);
            store.commit(`${pageName}/RESET_SEARCH_FILTERS`);12
            activeTab.value = store.state.pageTab.faActiveTab;
        }
        const minimize = () =>{
            store.commit('modulesTab/MINIMIZE_TAB')
        }
        const close = () =>{
            let myArray = Array.from(tabs.value);
            console.log("THE VALUE OF TAB IS ",myArray);
            for(let i=0; i<myArray.length; i++){
                store.commit(`${myArray[i]}/RESET_SEARCH_FILTERS`)
            }
            store.commit('modulesTab/REMOVE_TAB', {'FA':'Financial Accounts'}),
            store.commit('pageTab/CLEAR_PAGE_TAB', 'Financial Accounts')
            activeTab.value = store.state.pageTab.faActiveTab;
        }
        return{
            close,
            minimize,
            title,
            activeComponent,
            selectTab, selectedTab, closeTab,
            activeTab
        }
    },
    mounted(){
        const store = useStore();
        this.activeTab = store.state.pageTab.faActiveTab;
    }
}
</script>

<style>
.tab-content{
    margin-top: 40px;
}
</style>