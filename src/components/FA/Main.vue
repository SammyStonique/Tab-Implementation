<template>
    <div class="main-container w-full min-h-[90vh] bottom-8">
        <div class="fixed top-0 w-full z-50">
            <div class="z-50 relative">
                <NavBar :title="title" @minimize="minimize" @close="close"/>
            </div> 
            <div class="z-40 relative">
                <NavBarFA @openPage="selectTab"/>
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
import { ref, computed } from 'vue';
import NavBar from '@/components/NavBar.vue';
import NavBarFA from '@/components/FA/NavBarFA.vue';
import PagesTab from '@/components/FA/PagesTab.vue';
import Dashboard from '@/components/FA/Dashboard.vue';
import Client_Categories from '@/components/FA/Client_Categories.vue';
import Chart_Of_Accounts from '@/components/FA/Chart_Of_Accounts.vue';
import Ledger_Details from '@/components/FA/Ledger_Details.vue';
import General_Invoices from '@/components/FA/General_Invoices.vue';
import Invoice_Details from '@/components/FA/Invoice_Details.vue';
import General_Receipts from '@/components/FA/General_Receipts.vue';
import Receipt_Details from '@/components/FA/Receipt_Details.vue';
import General_Bills from '@/components/FA/General_Bills.vue';
import Bill_Details from '@/components/FA/Bill_Details.vue';
import Payment_Vouchers from '@/components/FA/Payment_Vouchers.vue';
import Payment_Details from '@/components/FA/Payment_Details.vue';
import Customers from '@/components/FA/Customers.vue';
import Vendors from '@/components/FA/Vendors.vue';
import Debtor_Statement from '@/components/FA/Debtor_Statement.vue';
import Vendor_Statement from '@/components/FA/Vendor_Statement.vue';
import Journals from '@/components/FA/Journals.vue';
import Journal_Details from '@/components/FA/Journal_Details.vue';
import Vat_Transactions from '@/components/FA/Vat_Transactions.vue';
import Tax_Mapping from '@/components/FA/Tax_Mapping.vue';
import Withholding_Tax from '@/components/FA/Withholding_Tax.vue';
import Withholding_Vat from '@/components/FA/Withholding_Vat.vue';
import Fiscal_Periods from '@/components/FA/Fiscal_Periods.vue';
import Income_Statement from '@/components/FA/Income_Statement.vue';
import Balance_Sheet from '@/components/FA/Balance_Sheet.vue';
import Trial_Balance from '@/components/FA/Trial_Balance.vue';
import Currencies from '@/components/FA/Currencies.vue';

import Default_Settings from '@/components/SET/Default_Settings.vue';

export default{
    components:{
        NavBar,
        NavBarFA,
        PagesTab,
        Dashboard, Client_Categories,Chart_Of_Accounts,Ledger_Details,General_Invoices,Invoice_Details,General_Receipts,
        Receipt_Details,General_Bills, Bill_Details,Payment_Vouchers,Payment_Details,Customers,Vendors,Debtor_Statement,Vendor_Statement,
        Journals,Journal_Details,Vat_Transactions, Tax_Mapping,Withholding_Tax,Withholding_Vat,Fiscal_Periods,Income_Statement,Balance_Sheet,
        Trial_Balance,Currencies,

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
        const title = ref('Financial Accounts');
        const cachedComponents = computed(() =>  Array.from(store.state.pageTab.faArray));
        const tabs = computed({
            get: ()=> store.state.pageTab.faArray,
        });

        const activeTab = computed(() => store.state.pageTab.faActiveTab);
    
        const activeComponent = computed(() => activeTab.value);

    
        const selectTab = (pageName) => {
            for(const [key, value] of Object.entries(pageName)){
                store.state.pageTab.faActiveTab = value;
            }
        };
        const selectedTab = (pageName) => {
            store.state.pageTab.faActiveTab = pageName;
        };
        const closeTab = (pageName) =>{
            let page = {"FA":pageName};
            store.commit('pageTab/REMOVE_PAGE', page)
            store.commit(`${pageName}/RESET_SEARCH_FILTERS`)
            activeTab.value = store.state.pageTab.faActiveTab;
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
            store.commit('modulesTab/REMOVE_TAB', {'FA':'Financial Accounts'}),
            store.commit('pageTab/CLEAR_PAGE_TAB', 'Financial Accounts');
            activeTab.value = store.state.pageTab.faActiveTab;
        }
        return{
            close,minimize,title,activeComponent,selectTab, selectedTab, closeTab,activeTab, cachedComponents
        }
    },
    mounted(){
        const store = useStore();
        this.activeTab = store.state.pageTab.faActiveTab;
    }
}
</script>

<style scoped>
.tab-content{
    margin-top: 35px;
}
.main-container{
    max-height: 100vh;
    overflow: hidden;
}
.navbar-pms{
    z-index: 100 !important;
}
.pages-tab{
    z-index: 50 !important;
}
</style>


