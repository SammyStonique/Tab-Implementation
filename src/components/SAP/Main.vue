<template>
    <div class="main-container w-full min-h-[90vh] bottom-8">
        <div class="fixed top-0 w-full z-50">
            <div class="z-50 relative">
                <NavBar :title="title" @minimize="minimize" @close="close"/>
            </div> 
            <div class="z-40 relative">
                <NavBarSAP @openPage="selectTab"/>
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
import NavBar from '@/components/NavBar.vue';
import NavBarSAP from '@/components/SAP/NavBarSAP.vue';
import PagesTab from '@/components/SAP/PagesTab.vue';
import Dashboard from '@/components/SAP/Dashboard.vue';
import Payment_Plans from '@/components/SAP/Payment_Plans.vue';
import Sale_Assets from '@/components/SAP/Sale_Assets.vue';
import Asset_Units from '@/components/SAP/Asset_Units.vue';
import Unit_Categories from '@/components/SAP/Unit_Categories.vue';
import Clients from '@/components/SAP/Clients.vue';
import Unit_Reservations from '@/components/SAP/Unit_Reservations.vue';
import Reservation_Details from '@/components/SAP/Reservation_Details.vue';

import Asset_Sales from '@/components/SAP/Asset_Sales.vue';
import Sale_Details from '@/components/SAP/Sale_Details.vue';
import Sale_Profile from '@/components/SAP/Sale_Profile.vue';

import Agents_Commissions from '@/components/SAP/Agents_Commissions.vue';
import Sale_Documents from '@/components/SAP/Sale_Documents.vue';

export default{
    components:{
        NavBar,
        NavBarSAP,
        PagesTab,
        Dashboard,
        Sale_Assets,Asset_Units,Unit_Categories,Clients,Unit_Reservations,Reservation_Details,Asset_Sales,Sale_Details,Sale_Profile,
        Payment_Plans,Agents_Commissions,Sale_Documents,

    },
    props: {
        title: {
            type: String,
            required: true,
        },
    },
    setup(){
        const store = useStore();
        const title = ref('Sales Agent Portal');
        const cachedComponents = computed(() =>  Array.from(store.state.pageTab.sapArray));
        const tabs = computed(()=> store.state.pageTab.sapArray);

        const activeTab = computed(() => store.state.pageTab.sapActiveTab);
    
        const activeComponent = computed(() => activeTab.value);
    
        const selectTab = (pageName) => {
            for(const [key, value] of Object.entries(pageName)){
                store.state.pageTab.sapActiveTab = value;
            }
        };
        const selectedTab = (pageName) => {
            store.state.pageTab.sapActiveTab = pageName;
        };
        const closeTab = (pageName) =>{
            let page = {"SAP":pageName};
            store.commit('pageTab/REMOVE_PAGE', page)
            store.commit(`${pageName}/RESET_SEARCH_FILTERS`)
            activeTab.value = store.state.pageTab.sapActiveTab;
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
            store.commit('modulesTab/REMOVE_TAB', {'SAP':'Sales Agent Portal'}),
            store.commit('pageTab/CLEAR_PAGE_TAB', 'Sales Agent Portal');
            activeTab.value = store.state.pageTab.sapActiveTab;
        }
        return{
            close,minimize,title,activeComponent,selectTab, selectedTab, closeTab,activeTab, cachedComponents
        }
    },
    mounted(){
        const store = useStore();
        this.activeTab = store.state.pageTab.sapActiveTab;
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