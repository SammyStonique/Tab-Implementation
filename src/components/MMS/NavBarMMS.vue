<template>
    <div class="navbar flex top-0 w-full text-sm sticky-navbar bg-orange-400 border-b border-slate-300 shadow-sm shadow-slate-200 px-6 h-8">
        <button class="fixed inset-0 bg-gray-50 opacity-15 cursor-default w-full" v-if="dropdown" @click="closeDropdown"></button>
        <div class="flex">
            <div class="web-links py-0.5 px-2.5 w-32 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex" @click="showHomePage">
                    <i class="fa fa-home pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Home Page</p>
                </button>
            </div>
            <div class="web-links py-0.5 px-2.5 w-32 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex w-full" @click="openPage({'MMS':'Dashboard'})">
                    <i class="fa fa-tachometer pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Dashboard</p>
                </button>
            </div>
            <div class="web-links dropdown w-32">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex w-full" @click="showMembersDropdown">
                        <i class="fa fa-universal-access pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Members</p>
                    </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="members_dropdown">       
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Members'})">
                            <i class="fa fa-universal-access pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Members List</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Member_Categories'})">
                            <i class="fa fa-bars pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Member Categories</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Member_Sponsors'})">
                            <i class="fa fa-hands-helping pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Member Sponsors</p>
                        </button>
    
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex w-full" @click="showSavingsDropdown">
                    <i class="fa fa-piggy-bank pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Savings</p>
                </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="savings_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Savings_Products'})">
                            <i class="fa fa-piggy-bank pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Savings Products</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Saving_Accounts'})">
                            <i class="fa fa-coins pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Savings Accounts</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Saving_Deposits'})">
                            <i class="fa fa-arrow-circle-down pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Savings Deposits</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Saving_Withdrawals'})">
                            <i class="fa fa-wallet pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Savings Withdrawals</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Saving_Transfers'})">
                            <i class="fa fa-exchange pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Savings Transfers</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Interest_Rates'})">
                            <i class="fa fa-percent pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Interest Rates</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Interest_Processing'})">
                            <i class="fa fa-cog pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Interest Processing</p>
                        </button>
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex w-full" @click="showSharesDropdown">
                    <i class="fa fa-chart-line pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Shares</p>
                </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="shares_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Shares_Products'})">
                            <i class="fa fa-chart-line pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Shares Products</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Share_Accounts'})">
                            <i class="fa fa-coins pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Shares Accounts</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Share_Deposits'})">
                            <i class="fa fa-arrow-circle-down pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Shares Deposits</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Share_Transfers'})">
                            <i class="fa fa-exchange pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Shares Transfers</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Dividend_Rates'})">
                            <i class="fa fa-percent pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Dividend Rates</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Dividend_Processing'})">
                            <i class="fa fa-cog pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Dividend Processing</p>
                        </button>
                    </div>
                </div>
            </div>

            <div class="web-links dropdown w-36">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex w-full" @click="showLoansDropdown">
                        <i class="fa fa-file-contract pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Loans</p>
                    </button>
                </div>
                <div class="dropdown-content w-56 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="loans_dropdowns">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Loan_Products'})">
                            <i class="fa fa-file-contract pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Products</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Loan_Applications'})">
                            <i class="fa fa-handshake pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Applications</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Loan_Guarantors'})">
                            <i class="fa fa-users pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Guarantors</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Loan_Securities'})">
                            <i class="fa fa-user-shield pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Securities</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Loan_Documents'})">
                            <i class="fa fa-file-image pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Documents</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Loan_Disbursements'})">
                            <i class="fa fa-credit-card pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Disbursements</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Loan_Arrears'})">
                            <i class="fa fa-coins pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Arrears</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Loan_Schedules'})">
                            <i class="fa fa-calendar-check pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Schedules</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Historical_Loans'})">
                            <i class="fa fa-handshake pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Historical Loans</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Loan_Prepayments'})">
                            <i class="fa fa-list-ul pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Prepayments</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'MMS':'Loan_Classifications'})">
                        <i class="fa fa-user-shield pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Loan Risk Classifications</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'MMS':'Loan_Recovery'})">
                        <i class="fa fa-hand-holding-usd pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Loan Recoveries</p>
                        </button>
                    </div>
                    
                </div>
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex w-full" @click="showFinancesDropdown">
                        <i class="fa fa-money pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Finances</p>
                    </button>
                </div>
                <div class="dropdown-content w-56 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="finances_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Member_Invoices'})">
                            <i class="fa fa-file-invoice pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Invoices</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Member_Receipts'})">
                        <i class="fa fa-receipt pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Receipts</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Penalty_Batches'})">
                            <i class="fa fa-coins pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Processed Penalties</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Loan_Penalties'})">
                            <i class="fa fa-coins pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Penalties</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'MMS':'Application_Fees'})">
                            <i class="fa fa-money-bill-wave pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Application Fees</p>
                        </button>
                    </div>
                </div>
            </div> 
            <div class="web-links dropdown w-36">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="showSettingsDropdown">
                        <i class="fa fa-cogs pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Settings</p>
                    </button>
                </div>
                <div class="dropdown-content w-56 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="settings_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'MMS':'Membership_Fees'})">
                            <i class="fa fa-money-bill-wave pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Membership Fees</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'MMS':'Loan_Fees'})">
                        <i class="fa fa-money-bill-wave pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Loan Fees Setup</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'MMS':'Security_Types'})">
                        <i class="fa fa-user-shield pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Security Types</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'MMS':'Risk_Classifications'})">
                        <i class="fa fa-user-shield pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Loan Risk Classes</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex" @click="openPage({'MMS':'Templates'})">
                        <i class="fa fa-image mr-2" aria-hidden="true"></i>
                        <p class="">User Defined Templates</p>
                        </button>
                    </div>

                </div>
            </div>        
        </div>
    </div>
</template>

<script>
import { ref,computed } from 'vue';
import { useStore } from 'vuex';
import { defineComponent } from 'vue';
export default defineComponent({
    setup(_, { emit }){
        const store = useStore();
        const user_profile = computed(()=> store.state.userData.user_profile);
        const settings_dropdown = ref(false);
        const savings_dropdown = ref(false);
        const shares_dropdown = ref(false);
        const members_dropdown = ref(false);
        const loans_dropdowns = ref(false);
        const finances_dropdown = ref(false);
        const userDetails = ref([]);
        const dropdown = ref(false);

        const showSavingsDropdown = () =>{
            shares_dropdown.value = false;
            settings_dropdown.value = false;
            members_dropdown.value  = false;
            loans_dropdowns.value = false;
            dropdown.value = true;
            finances_dropdown.value  = false;
            savings_dropdown.value  = !savings_dropdown.value ;
        }
        const showMembersDropdown = () =>{
            shares_dropdown.value = false;
            settings_dropdown.value = false;
            savings_dropdown.value  = false;
            loans_dropdowns.value = false;
            finances_dropdown.value  = false;
            dropdown.value = true;
            members_dropdown.value  = !members_dropdown.value ;
        }
        const showSharesDropdown = () =>{
            settings_dropdown.value = false;
            savings_dropdown.value  = false;
            members_dropdown.value = false;
            loans_dropdowns.value = false;
            finances_dropdown.value  = false;
            dropdown.value = true;
            shares_dropdown.value  = !shares_dropdown.value ;
        }
        const showSettingsDropdown = () =>{
            shares_dropdown.value = false;
            savings_dropdown.value  = false;
            members_dropdown.value  = false;
            loans_dropdowns.value = false;
            finances_dropdown.value  = false;
            dropdown.value = true;
            settings_dropdown.value  = !settings_dropdown.value ;
        }
        const showLoansDropdown = () =>{
            shares_dropdown.value = false;
            savings_dropdown.value  = false;
            members_dropdown.value  = false;
            settings_dropdown.value = false;
            finances_dropdown.value  = false;
            dropdown.value = true;
            loans_dropdowns.value  = !loans_dropdowns.value ;
        }
        const showFinancesDropdown = () =>{
            shares_dropdown.value = false;
            savings_dropdown.value  = false;
            members_dropdown.value  = false;
            settings_dropdown.value = false;
            loans_dropdowns.value = false;
            dropdown.value = true;
            finances_dropdown.value  = !finances_dropdown.value ;
        }
        const closeDropdown = () =>{
            shares_dropdown.value = false;
            savings_dropdown.value  = false;
            members_dropdown.value  = false;
            settings_dropdown.value = false;
            loans_dropdowns.value = false;
            finances_dropdown.value  = false;
            dropdown.value = false;
        }
        const openPage = (pageName) =>{
            closeDropdown();
            store.commit('pageTab/ADD_PAGE', pageName);
            emit('openPage', pageName)
        };
        const showHomePage = () =>{
            store.commit('modulesTab/MINIMIZE_TAB')
        };
        return{
            dropdown, settings_dropdown, shares_dropdown, savings_dropdown, loans_dropdowns,members_dropdown, finances_dropdown,
            user_profile,userDetails, closeDropdown,showSavingsDropdown, showSharesDropdown,showMembersDropdown, showLoansDropdown,
            showSettingsDropdown, showFinancesDropdown,openPage,showHomePage
        }
    },

});
</script>

<style scoped>
.navbar{
  z-index: 1000;
}
.dropdown-content{
    position: absolute;
    z-index: 1000;
}

</style>