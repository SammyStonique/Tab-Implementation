<template>
    <div class="main-container w-full min-h-[90vh] bottom-8">
        <div class="fixed top-0 w-full z-50">
            <div class="z-50 relative">
                <NavBar :title="title" @minimize="minimize" @close="close"/>
            </div> 
            <div class="z-40 relative">
                <NavBarPMS @openPage="selectTab"/>
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
import NavBarPMS from '@/components/PMS/NavBarPMS.vue'
import PagesTab from '@/components/PMS/PagesTab.vue'
import Dashboard from '@/components/PMS/Dashboard.vue'
import Properties_List from '@/components/PMS/Properties_List.vue';
import Property_Details from '@/components/PMS/Property_Details.vue';
import Import_Properties from '@/components/PMS/Import_Properties.vue';
import Zones from '@/components/PMS/Zones.vue';
import Landlords_List from '@/components/PMS/Landlords_List.vue'
import Units_List from '@/components/PMS/Units_List.vue';
import Import_Property_Units from '@/components/PMS/Import_Property_Units.vue';
import Utilities from '@/components/PMS/Utilities.vue';
import Security_Deposits from '@/components/PMS/Security_Deposits.vue';
import Active_Tenants from '@/components/PMS/Active_Tenants.vue';
import Import_Tenants from '@/components/PMS/Import_Tenants.vue';
import Terminated_Leases from '@/components/PMS/Terminated_Leases.vue';
import Tenant_Details from '@/components/PMS/Tenant_Details.vue';
import Variation_Periods from '@/components/PMS/Variation_Periods.vue';
import Tenant_Statement from '@/components/PMS/Tenant_Statement.vue';
import Term_Lease_Statement from '@/components/PMS/Term_Lease_Statement.vue';
import Tenant_Deposits from '@/components/PMS/Tenant_Deposits.vue';
import Meter_Setup from '@/components/PMS/Meter_Setup.vue';
import Meter_Readings from '@/components/PMS/Meter_Readings.vue';
import Batch_Readings from '@/components/PMS/Batch_Readings.vue';
import Tenant_Invoices from '@/components/PMS/Tenant_Invoices.vue';
import Tenant_Receipts from '@/components/PMS/Tenant_Receipts.vue';
import Receipt_Details from '@/components/PMS/Receipt_Details.vue';
import Tenant_Prepayments from '@/components/PMS/Tenant_Prepayments.vue';
import Prepayment_Allocations from '@/components/PMS/Prepayment_Allocations.vue';
import Statement_Transactions from '@/components/PMS/Statement_Transactions.vue';
import Property_Statements from '@/components/PMS/Property_Statements.vue';
import Statement_Processing from '@/components/PMS/Statement_Processing.vue';
import Tenant_Arrears from '@/components/PMS/Tenant_Arrears.vue';
import Lease_Fees from '@/components/PMS/Lease_Fees.vue';
import Debit_Notes from '@/components/PMS/Debit_Notes.vue';
import Debit_Note_Details from '@/components/PMS/Debit_Note_Details.vue';
import Credit_Notes from '@/components/PMS/Credit_Notes.vue';
import Credit_Note_Details from '@/components/PMS/Credit_Note_Details.vue';
import Exit_Charges from '@/components/PMS/Exit_Charges.vue';
import Tenant_Move_Out from '@/components/PMS/Tenant_Move_Out.vue';
import Late_Payment_Fees from '@/components/PMS/Late_Payment_Fees.vue';
import Tenant_Balances from '@/components/PMS/Tenant_Balances.vue';
import Payment_Vouchers from '@/components/PMS/Payment_Vouchers.vue';
import Payment_Details from '@/components/PMS/Payment_Details.vue';

import Default_Settings from '@/components/SET/Default_Settings.vue';
import Templates from '@/components/PMS/Templates.vue';
import Design_Template from '@/components/PMS/Design_Template.vue';

export default{
    components:{
        NavBar,
        NavBarPMS,
        PagesTab,
        Dashboard, Properties_List, Zones, Landlords_List, Units_List, Property_Details, Utilities, Security_Deposits, Active_Tenants,
        Meter_Setup, Meter_Readings,Batch_Readings,Tenant_Invoices,Tenant_Receipts,Receipt_Details, Tenant_Prepayments, Prepayment_Allocations,
        Tenant_Details, Variation_Periods, Tenant_Statement, Tenant_Deposits, Statement_Transactions, Property_Statements, Statement_Processing,
        Tenant_Arrears,Lease_Fees,Debit_Notes,Credit_Notes,Debit_Note_Details,Credit_Note_Details,Terminated_Leases,Term_Lease_Statement,
        Exit_Charges,Tenant_Move_Out,Import_Property_Units,Import_Properties,Import_Tenants,Late_Payment_Fees,Tenant_Balances,Payment_Vouchers,
        Payment_Details,
        
        Default_Settings,Templates,Design_Template
    },
    props: {
        title: {
            type: String,
            required: true,
        },
    },
    setup(){
        const store = useStore();
        const title = ref('Property Management');
        const cachedComponents = computed(() =>  Array.from(store.state.pageTab.pmsArray));
        const tabs = computed({
            get: ()=> store.state.pageTab.pmsArray,
        });

        const activeTab = computed(() => store.state.pageTab.pmsActiveTab);
    
        const activeComponent = computed(() => activeTab.value);
    
        const selectTab = (pageName) => {
            for(const [key, value] of Object.entries(pageName)){
                store.state.pageTab.pmsActiveTab = value;
            }
        };
        const selectedTab = (pageName) => {
            store.state.pageTab.pmsActiveTab = pageName;
        };
        const closeTab = (pageName) =>{
            let page = {"PMS":pageName};
            store.commit('pageTab/REMOVE_PAGE', page)
            store.commit(`${pageName}/RESET_SEARCH_FILTERS`)
            activeTab.value = store.state.pageTab.pmsActiveTab;
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
            store.commit('modulesTab/REMOVE_TAB', {'PMS':'Property Management'}),
            store.commit('pageTab/CLEAR_PAGE_TAB', 'Property Management');
            activeTab.value = store.state.pageTab.pmsActiveTab;
        }
        return{
            close,minimize,title,activeComponent,selectTab, selectedTab, closeTab,activeTab, cachedComponents
        }
    },
    mounted(){
        const store = useStore();
        this.activeTab = store.state.pageTab.pmsActiveTab;
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