<template>
    <div class="main-container w-full min-h-[90vh] bottom-8">
        <div class="fixed top-0 w-full z-50">
            <div class="z-50 relative">
                <NavBar :title="title" @minimize="minimize" @close="close"/>
            </div> 
            <div class="z-40 relative">
                <NavBarINV @openPage="selectTab"/>
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
import NavBarINV from '@/components/INV/NavBarINV.vue';
import PagesTab from '@/components/INV/PagesTab.vue';
import Dashboard from '@/components/INV/Dashboard.vue';
import Item_Categories from '@/components/INV/Item_Categories.vue';
import Items_Catalog from '@/components/INV/Items_Catalog.vue';
import Item_Details from '@/components/INV/Item_Details.vue';
import Retail_Outlets from '@/components/INV/Retail_Outlets.vue';
import Catalog_By_Outlet from '@/components/INV/Catalog_By_Outlet.vue';
import Fast_Moving_Items from '@/components/INV/Fast_Moving_Items.vue';
import Item_Location from '@/components/INV/Item_Location.vue';

import Default_Settings from '@/components/SET/Default_Settings.vue';

export default{
    components:{
        NavBar,
        NavBarINV,
        PagesTab,
        Dashboard,Item_Categories,Items_Catalog,Item_Details,Retail_Outlets,Catalog_By_Outlet,Fast_Moving_Items,Item_Location,

        Default_Settings
    },
    props: {
        title: {
            type: String,
            required: true,
        },
    },
    setup(){
        const store = useStore();
        const title = ref('Inventory Management');
        const cachedComponents = computed(() =>  Array.from(store.state.pageTab.invArray));
        const tabs = computed({
            get: ()=> store.state.pageTab.invArray,
        });

        const activeTab = computed(() => store.state.pageTab.invActiveTab);
    
        const activeComponent = computed(() => activeTab.value);
    
        const selectTab = (pageName) => {
            for(const [key, value] of Object.entries(pageName)){
                store.state.pageTab.invActiveTab = value;
            }
        };
        const selectedTab = (pageName) => {
            store.state.pageTab.invActiveTab = pageName;
        };
        const closeTab = (pageName) =>{
            let page = {"INV":pageName};
            store.commit('pageTab/REMOVE_PAGE', page)
            store.commit(`${pageName}/RESET_SEARCH_FILTERS`)
            activeTab.value = store.state.pageTab.invActiveTab;
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
            store.commit('modulesTab/REMOVE_TAB', {'INV':'Inventory Management'}),
            store.commit('pageTab/CLEAR_PAGE_TAB', 'Inventory Management');
            activeTab.value = store.state.pageTab.invActiveTab;
        }
        return{
            close,
            minimize,
            title,
            activeComponent,
            selectTab, selectedTab, closeTab,
            activeTab, cachedComponents
        }
    },
    mounted(){
        const store = useStore();
        this.activeTab = store.state.pageTab.invActiveTab;
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