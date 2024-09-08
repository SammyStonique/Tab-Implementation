<template>
    <div class="main-container w-full min-h-[90vh] bottom-8">
        <div class="fixed top-0 w-full z-50">
            <NavBar :title="title" @minimize="minimize" @close="close"/>
            <NavBarPMS @openPage="selectTab"/>
            <PagesTab @openPage="selectedTab" @closePage="closeTab"/>
        </div>
        <div class="tab-content z-10 overflow-y-hidden">
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
import Zones from '@/components/PMS/Zones.vue';
import Landlords_List from '@/components/PMS/Landlords_List.vue'
import Units_List from '@/components/PMS/Units_List.vue';
import Utilities from '@/components/PMS/Utilities.vue';
import Security_Deposits from '@/components/PMS/Security_Deposits.vue';
import Active_Tenants from '@/components/PMS/Active_Tenants.vue';
import Tenant_Details from '@/components/PMS/Tenant_Details.vue';
import Variation_Periods from '@/components/PMS/Variation_Periods.vue';
import Tenant_Statement from '@/components/PMS/Tenant_Statement.vue';
import Tenant_Deposits from '@/components/PMS/Tenant_Deposits.vue';
import Meter_Setup from '@/components/PMS/Meter_Setup.vue';
import Meter_Readings from '@/components/PMS/Meter_Readings.vue';
import Batch_Readings from '@/components/PMS/Batch_Readings.vue';
import Tenant_Invoices from '@/components/PMS/Tenant_Invoices.vue';
import Tenant_Receipts from '@/components/PMS/Tenant_Receipts.vue';
import Receipt_Details from '@/components/PMS/Receipt_Details.vue';
import Tenant_Prepayments from '@/components/PMS/Tenant_Prepayments.vue';
import Prepayment_Allocations from '@/components/PMS/Prepayment_Allocations.vue';

export default{
    components:{
        NavBar,
        NavBarPMS,
        PagesTab,
        Dashboard, Properties_List, Zones, Landlords_List, Units_List, Property_Details, Utilities, Security_Deposits, Active_Tenants,
        Meter_Setup, Meter_Readings,Batch_Readings,Tenant_Invoices,Tenant_Receipts,Receipt_Details, Tenant_Prepayments, Prepayment_Allocations,
        Tenant_Details, Variation_Periods, Tenant_Statement, Tenant_Deposits
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
        this.activeTab = store.state.pageTab.pmsActiveTab;
    }
}
</script>

<style>
.tab-content{
    margin-top: 20px;
}
.main-container{
    max-height: 100vh;
    overflow: hidden;
}
</style>