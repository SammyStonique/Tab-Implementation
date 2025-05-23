<template>
    <div class="main-container w-full min-h-[90vh] bottom-8">
        <div class="fixed top-0 w-full z-50">
            <div class="z-50 relative">
                <NavBar :title="title" @minimize="minimize" @close="close"/>
            </div> 
            <div class="z-40 relative">
                <NavBarPSS @openPage="selectTab"/>
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
import NavBarPSS from '@/components/PSS/NavBarPSS.vue';
import PagesTab from '@/components/PSS/PagesTab.vue';
import Dashboard from '@/components/PSS/Dashboard.vue';
import Asset_Makes from '@/components/PSS/Asset_Makes.vue';
import Asset_Models from '@/components/PSS/Asset_Models.vue';
import Payment_Plans from '@/components/PSS/Payment_Plans.vue';
import Asset_Fees from '@/components/PSS/Asset_Fees.vue';
import Sale_Assets from '@/components/PSS/Sale_Assets.vue';
import Asset_Details from '@/components/PSS/Asset_Details.vue';
import Asset_Profile from '@/components/PSS/Asset_Profile.vue';
import Asset_Units from '@/components/PSS/Asset_Units.vue';
import Unit_Categories from '@/components/PSS/Unit_Categories.vue';
import Clients from '@/components/PSS/Clients.vue';
import Vendors from '@/components/PSS/Vendors.vue';
import Sales_Agents from '@/components/PSS/Sales_Agents.vue';
import Unit_Reservations from '@/components/PSS/Unit_Reservations.vue';
import Reservation_Details from '@/components/PSS/Reservation_Details.vue';


import Sale_Invoices from '@/components/PSS/Sale_Invoices.vue';
import Sale_Receipts from '@/components/PSS/Sale_Receipts.vue';
import Loan_Products from '@/components/MMS/Loan_Products.vue';
import Loan_Product_Details from '@/components/MMS/Loan_Product_Details.vue';

import Asset_Sales from '@/components/PSS/Asset_Sales.vue';
import Sale_Details from '@/components/PSS/Sale_Details.vue';
import Historical_Loans from '@/components/MMS/Historical_Loans.vue';
import Import_Historical_Loans from '@/components/MMS/Import_Historical_Loans.vue';
import Loan_Guarantors from '@/components/MMS/Loan_Guarantors.vue';
import Sale_Profile from '@/components/PSS/Sale_Profile.vue';
import Historical_Loan_Ledger from '@/components/MMS/Historical_Loan_Ledger.vue';
import Receipt_Details from '@/components/PSS/Receipt_Details.vue';

import Loan_Schedules from '@/components/MMS/Loan_Schedules.vue';
import Penalty_Batches from '@/components/MMS/Penalty_Batches.vue';
import Loan_Penalties from '@/components/MMS/Loan_Penalties.vue';
import Loan_Documents from '@/components/MMS/Loan_Documents.vue';
import Sale_Fees from '@/components/PSS/Sale_Fees.vue';
import Loan_Arrears from '@/components/MMS/Loan_Arrears.vue';
import Sale_Prepayments from '@/components/PSS/Sale_Prepayments.vue';
import Prepayment_Allocations from '@/components/PSS/Prepayment_Allocations.vue';
import Templates from '@/components/MMS/Templates.vue';
import Design_Template from '@/components/MMS/Design_Template.vue';
import Risk_Classifications from '@/components/MMS/Risk_Classifications.vue';


import Default_Settings from '@/components/SET/Default_Settings.vue';

export default{
    components:{
        NavBar,
        NavBarPSS,
        PagesTab,
        Dashboard,
        Sale_Assets,Asset_Details,Asset_Profile,Asset_Makes,Receipt_Details,Asset_Models,Asset_Units,Unit_Categories,Clients,Vendors,Sales_Agents,Unit_Reservations,Reservation_Details,
        Sale_Invoices,Sale_Receipts,Loan_Products,Loan_Product_Details,Asset_Sales,Sale_Details,Loan_Guarantors,Sale_Profile,
        Payment_Plans,Loan_Schedules,Loan_Penalties,Penalty_Batches,Loan_Documents,Sale_Fees,Historical_Loans,Import_Historical_Loans,Historical_Loan_Ledger,
        Loan_Arrears,Sale_Prepayments,Prepayment_Allocations,Templates,Design_Template,Risk_Classifications,Asset_Fees,

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
        const title = ref('Property Sales');
        const cachedComponents = computed(() =>  Array.from(store.state.pageTab.pssArray));
        const tabs = computed(()=> store.state.pageTab.pssArray);

        const activeTab = computed(() => store.state.pageTab.pssActiveTab);
    
        const activeComponent = computed(() => activeTab.value);
    
        const selectTab = (pageName) => {
            for(const [key, value] of Object.entries(pageName)){
                store.state.pageTab.pssActiveTab = value;
            }
        };
        const selectedTab = (pageName) => {
            store.state.pageTab.pssActiveTab = pageName;
        };
        const closeTab = (pageName) =>{
            let page = {"PSS":pageName};
            store.commit('pageTab/REMOVE_PAGE', page)
            store.commit(`${pageName}/RESET_SEARCH_FILTERS`)
            activeTab.value = store.state.pageTab.pssActiveTab;
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
            store.commit('modulesTab/REMOVE_TAB', {'PSS':'Property Sales'}),
            store.commit('pageTab/CLEAR_PAGE_TAB', 'Property Sales');
            activeTab.value = store.state.pageTab.pssActiveTab;
        }
        return{
            close,minimize,title,activeComponent,selectTab, selectedTab, closeTab,activeTab, cachedComponents
        }
    },
    mounted(){
        const store = useStore();
        this.activeTab = store.state.pageTab.pssActiveTab;
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