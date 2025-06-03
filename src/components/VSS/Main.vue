<template>
    <div class="main-container w-full min-h-[90vh] bottom-8">
        <div class="fixed top-0 w-full z-50">
            <div class="z-50 relative">
                <NavBar :title="title" @minimize="minimize" @close="close"/>
            </div> 
            <div class="z-40 relative">
                <NavBarVSS @openPage="selectTab"/>
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
import NavBarVSS from '@/components/VSS/NavBarVSS.vue';
import PagesTab from '@/components/VSS/PagesTab.vue';
import Dashboard from '@/components/VSS/Dashboard.vue';
import Vehicle_Makes from '@/components/VSS/Vehicle_Makes.vue';
import Vehicle_Models from '@/components/VSS/Vehicle_Models.vue';
import Payment_Plans from '@/components/VSS/Payment_Plans.vue';
import Asset_Fees from '@/components/VSS/Asset_Fees.vue';
import Sale_Assets from '@/components/VSS/Sale_Assets.vue';
import Asset_Details from '@/components/VSS/Asset_Details.vue';
import Asset_Profile from '@/components/VSS/Asset_Profile.vue';
import Asset_Units from '@/components/VSS/Asset_Units.vue';
import Unit_Categories from '@/components/VSS/Unit_Categories.vue';
import Clients from '@/components/VSS/Clients.vue';
import Vendors from '@/components/VSS/Vendors.vue';
import Sales_Agents from '@/components/VSS/Sales_Agents.vue';
import Unit_Reservations from '@/components/VSS/Unit_Reservations.vue';
import Reservation_Details from '@/components/VSS/Reservation_Details.vue';


import Sale_Invoices from '@/components/VSS/Sale_Invoices.vue';
import Sale_Receipts from '@/components/VSS/Sale_Receipts.vue';

import Asset_Sales from '@/components/VSS/Asset_Sales.vue';
import Sale_Details from '@/components/VSS/Sale_Details.vue';
import Historical_Sales from '@/components/VSS/Historical_Sales.vue';
import Import_Historical_Sales from '@/components/VSS/Import_Historical_Sales.vue';
import Sale_Profile from '@/components/VSS/Sale_Profile.vue';
import Receipt_Details from '@/components/VSS/Receipt_Details.vue';

import Sales_Commissions from '@/components/VSS/Sales_Commissions.vue';
import Agents_Commissions from '@/components/VSS/Agents_Commissions.vue';
import Penalty_Batches from '@/components/VSS/Penalty_Batches.vue';
import Sale_Penalties from '@/components/VSS/Sale_Penalties.vue';
import Sale_Documents from '@/components/VSS/Sale_Documents.vue';
import Sale_Fees from '@/components/VSS/Sale_Fees.vue';
import Sale_Arrears from '@/components/VSS/Sale_Arrears.vue';
import Sale_Prepayments from '@/components/VSS/Sale_Prepayments.vue';
import Prepayment_Allocations from '@/components/VSS/Prepayment_Allocations.vue';
import Templates from '@/components/MMS/Templates.vue';
import Design_Template from '@/components/MMS/Design_Template.vue';
import Sale_Transfers from '@/components/VSS/Sale_Transfers.vue';
import Sale_Refunds from '@/components/VSS/Sale_Refunds.vue';


import Default_Settings from '@/components/SET/Default_Settings.vue';

export default{
    components:{
        NavBar,
        NavBarVSS,
        PagesTab,
        Dashboard,
        Sale_Assets,Asset_Details,Asset_Profile,Vehicle_Makes,Receipt_Details,Vehicle_Models,Asset_Units,Unit_Categories,Clients,Vendors,Sales_Agents,Unit_Reservations,Reservation_Details,
        Sale_Invoices,Sale_Receipts,Asset_Sales,Sale_Details,Sale_Profile,Payment_Plans,Sales_Commissions,Agents_Commissions,Sale_Penalties,Penalty_Batches,Sale_Documents,Sale_Fees,Historical_Sales,Import_Historical_Sales,
        Sale_Arrears,Sale_Prepayments,Prepayment_Allocations,Templates,Design_Template,Sale_Transfers,Asset_Fees,Sale_Refunds,

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
        const title = ref('Vehicle Sales');
        const cachedComponents = computed(() =>  Array.from(store.state.pageTab.vssArray));
        const tabs = computed(()=> store.state.pageTab.vssArray);

        const activeTab = computed(() => store.state.pageTab.vssActiveTab);
    
        const activeComponent = computed(() => activeTab.value);
    
        const selectTab = (pageName) => {
            for(const [key, value] of Object.entries(pageName)){
                store.state.pageTab.vssActiveTab = value;
            }
        };
        const selectedTab = (pageName) => {
            store.state.pageTab.vssActiveTab = pageName;
        };
        const closeTab = (pageName) =>{
            let page = {"VSS":pageName};
            store.commit('pageTab/REMOVE_PAGE', page)
            store.commit(`${pageName}/RESET_SEARCH_FILTERS`)
            activeTab.value = store.state.pageTab.vssActiveTab;
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
            store.commit('modulesTab/REMOVE_TAB', {'VSS':'Vehicle Sales'}),
            store.commit('pageTab/CLEAR_PAGE_TAB', 'Vehicle Sales');
            activeTab.value = store.state.pageTab.vssActiveTab;
        }
        return{
            close,minimize,title,activeComponent,selectTab, selectedTab, closeTab,activeTab, cachedComponents
        }
    },
    mounted(){
        const store = useStore();
        this.activeTab = store.state.pageTab.vssActiveTab;
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