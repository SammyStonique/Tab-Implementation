<template>
    <div class="main-container w-full min-h-[90vh] bottom-8">
        <div class="fixed top-0 w-full z-50">
            <div class="z-50 relative">
                <NavBar :title="title" @minimize="minimize" @close="close"/>
            </div> 
            <div class="z-40 relative">
                <NavBarMMS @openPage="selectTab"/>
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
import NavBarMMS from '@/components/MMS/NavBarMMS.vue';
import PagesTab from '@/components/MMS/PagesTab.vue';
import Dashboard from '@/components/MMS/Dashboard.vue';
import Member_Categories from '@/components/MMS/Member_Categories.vue';
import Member_Sponsors from '@/components/MMS/Member_Sponsors.vue';
import Members from '@/components/MMS/Members.vue';
import Import_Members from '@/components/MMS/Import_Members.vue';
import Member_Details from '@/components/MMS/Member_Details.vue';
import Membership_Fees from '@/components/MMS/Membership_Fees.vue';
import Member_Invoices from '@/components/MMS/Member_Invoices.vue';
import Member_Receipts from '@/components/MMS/Member_Receipts.vue';
import Savings_Products from '@/components/MMS/Savings_Products.vue';
import Saving_Product_Details from '@/components/MMS/Saving_Product_Details.vue';
import Shares_Products from '@/components/MMS/Shares_Products.vue';
import Share_Product_Details from '@/components/MMS/Share_Product_Details.vue';
import Saving_Accounts from '@/components/MMS/Saving_Accounts.vue';
import Saving_Account_Details from '@/components/MMS/Saving_Account_Details.vue';
import Import_Saving_Accounts from '@/components/MMS/Import_Saving_Accounts.vue';
import Saving_Transfers from '@/components/MMS/Saving_Transfers.vue';
import Interest_Rates from '@/components/MMS/Interest_Rates.vue';
import Interest_Processing from '@/components/MMS/Interest_Processing.vue';
import Share_Accounts from '@/components/MMS/Share_Accounts.vue';
import Share_Account_Details from '@/components/MMS/Share_Account_Details.vue';
import Import_Share_Accounts from '@/components/MMS/Import_Share_Accounts.vue';
import Saving_Deposits from '@/components/MMS/Saving_Deposits.vue';
import Import_Saving_Deposits from '@/components/MMS/Import_Saving_Deposits.vue';
import Share_Deposits from '@/components/MMS/Share_Deposits.vue';
import Import_Share_Deposits from '@/components/MMS/Import_Share_Deposits.vue';
import Share_Transfers from '@/components/MMS/Share_Transfers.vue';
import Dividend_Rates from '@/components/MMS/Dividend_Rates.vue';
import Dividend_Processing from '@/components/MMS/Dividend_Processing.vue';
import Loan_Products from '@/components/MMS/Loan_Products.vue';
import Loan_Product_Details from '@/components/MMS/Loan_Product_Details.vue';
import Loan_Fees from '@/components/MMS/Loan_Fees.vue';
import Loan_Applications from '@/components/MMS/Loan_Applications.vue';
import Historical_Loans from '@/components/MMS/Historical_Loans.vue';
import Import_Historical_Loans from '@/components/MMS/Import_Historical_Loans.vue';
import Loan_Application_Details from '@/components/MMS/Loan_Application_Details.vue';
import Loan_Guarantors from '@/components/MMS/Loan_Guarantors.vue';
import Loan_Statement from '@/components/MMS/Loan_Statement.vue';
import Hist_Loan_Statement from '@/components/MMS/Historical_Loan_Statement.vue';
import Receipt_Details from '@/components/MMS/Receipt_Details.vue';
import Loan_Disbursements from '@/components/MMS/Loan_Disbursements.vue';
import Security_Types from '@/components/MMS/Security_Types.vue';
import Loan_Securities from '@/components/MMS/Loan_Securities.vue';
import Loan_Schedules from '@/components/MMS/Loan_Schedules.vue';
import Penalty_Batches from '@/components/MMS/Penalty_Batches.vue';
import Loan_Penalties from '@/components/MMS/Loan_Penalties.vue';
import Loan_Documents from '@/components/MMS/Loan_Documents.vue';
import Application_Fees from '@/components/MMS/Application_Fees.vue';
import Loan_Arrears from '@/components/MMS/Loan_Arrears.vue';
import Loan_Prepayments from '@/components/MMS/Loan_Prepayments.vue';
import Prepayment_Allocations from '@/components/MMS/Prepayment_Allocations.vue';
import Templates from '@/components/MMS/Templates.vue';
import Design_Template from '@/components/MMS/Design_Template.vue';
import Risk_Classifications from '@/components/MMS/Risk_Classifications.vue';
import Loan_Classifications from '@/components/MMS/Loan_Classifications.vue';
import Loan_Recovery from '@/components/MMS/Loan_Recovery.vue';
import Loan_Balances from '@/components/MMS/Loan_Balances.vue';

import Default_Settings from '@/components/SET/Default_Settings.vue';

export default{
    components:{
        NavBar,
        NavBarMMS,
        PagesTab,
        Dashboard,
        Member_Categories,Member_Sponsors,Members,Import_Members,Member_Details,Membership_Fees,Receipt_Details,
        Member_Invoices,Member_Receipts,Savings_Products,Saving_Product_Details,Shares_Products,Share_Product_Details,Saving_Accounts,Share_Accounts,
        Saving_Deposits,Share_Deposits,Loan_Products,Loan_Product_Details,Loan_Fees,Loan_Applications,Loan_Application_Details,Loan_Guarantors,Loan_Statement,
        Loan_Disbursements,Import_Saving_Accounts,Import_Share_Accounts,Import_Saving_Deposits,Import_Share_Deposits,Security_Types,Loan_Securities,
        Loan_Schedules,Loan_Penalties,Penalty_Batches,Loan_Documents,Application_Fees,Historical_Loans,Import_Historical_Loans,Hist_Loan_Statement,
        Loan_Arrears,Saving_Transfers,Share_Transfers,Loan_Prepayments,Prepayment_Allocations,Interest_Rates,Dividend_Rates,Interest_Processing,Dividend_Processing,
        Templates,Design_Template,Share_Account_Details,Saving_Account_Details,Risk_Classifications,Loan_Classifications,Loan_Recovery,Loan_Balances,

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
        const title = ref('Membership Management');
        const cachedComponents = computed(() =>  Array.from(store.state.pageTab.mmsArray));
        const tabs = computed({
            get: ()=> store.state.pageTab.mmsArray,
        });

        const activeTab = computed(() => store.state.pageTab.mmsActiveTab);
    
        const activeComponent = computed(() => activeTab.value);
    
        const selectTab = (pageName) => {
            for(const [key, value] of Object.entries(pageName)){
                store.state.pageTab.mmsActiveTab = value;
            }
        };
        const selectedTab = (pageName) => {
            store.state.pageTab.mmsActiveTab = pageName;
        };
        const closeTab = (pageName) =>{
            let page = {"MMS":pageName};
            store.commit('pageTab/REMOVE_PAGE', page)
            store.commit(`${pageName}/RESET_SEARCH_FILTERS`)
            activeTab.value = store.state.pageTab.mmsActiveTab;
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
            store.commit('modulesTab/REMOVE_TAB', {'MMS':'Membership Management'}),
            store.commit('pageTab/CLEAR_PAGE_TAB', 'Membership Management');
            activeTab.value = store.state.pageTab.mmsActiveTab;
        }
        return{
            close,minimize,title,activeComponent,selectTab, selectedTab, closeTab,activeTab, cachedComponents
        }
    },
    mounted(){
        const store = useStore();
        this.activeTab = store.state.pageTab.mmsActiveTab;
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