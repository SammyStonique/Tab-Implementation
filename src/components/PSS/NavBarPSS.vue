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
                <button class="flex w-full" @click="openPage({'PSS':'Dashboard'})">
                    <i class="fa fa-tachometer pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Dashboard</p>
                </button>
            </div>
            <div class="web-links dropdown w-32">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex w-full" @click="showProjectsDropdown">
                        <i class="fa fa-universal-access pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Assets</p>
                    </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="projects_dropdown">       
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Sale_Assets'})">
                            <i class="fa fa-universal-access pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Assets List</p>
                        </button>
    
                    </div>
                    
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PSS':'Asset_Makes'})">
                            <i class="fa fa-box pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Asset Makes</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PSS':'Asset_Models'})">
                        <i class="fa fa-cogs pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Asset Models</p>
                        </button>
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex w-full" @click="showUnitsDropdown">
                        <i class="fa fa-bars pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Asset Units</p>
                    </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="units_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PSS':'Asset_Units'})">
                            <i class="fa fa-bars pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Asset Units</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Unit_Reservations'})">
                            <i class="fa fa-arrow-circle-down pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Unit Reservations</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PSS':'Unit_Categories'})">
                            <i class="fa fa-bars pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Unit Categories</p>
                        </button>
                    </div>
                </div>   
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex w-full" @click="showClientsDropdown">
                    <i class="fa fa-chart-line pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Clients</p>
                </button>
                </div>
                <div class="dropdown-content w-44 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="clients_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PSS':'Clients'})">
                            <i class="fa fa-user pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Clients</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PSS':'Vendors'})">
                            <i class="fa fa-truck pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Vendors</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PSS':'Sales_Agents'})">
                            <i class="fa fa-user pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Sales Agents</p>
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
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Loan_Products'})">
                            <i class="fa fa-file-contract pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Products</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Loan_Applications'})">
                            <i class="fa fa-handshake pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Applications</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Loan_Guarantors'})">
                            <i class="fa fa-users pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Guarantors</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Loan_Securities'})">
                            <i class="fa fa-user-shield pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Securities</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Loan_Documents'})">
                            <i class="fa fa-file-image pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Documents</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Loan_Disbursements'})">
                            <i class="fa fa-credit-card pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Disbursements</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Loan_Arrears'})">
                            <i class="fa fa-coins pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Arrears</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Loan_Schedules'})">
                            <i class="fa fa-calendar-check pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Schedules</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Historical_Loans'})">
                            <i class="fa fa-handshake pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Historical Loans</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Loan_Prepayments'})">
                            <i class="fa fa-list-ul pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Prepayments</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PSS':'Loan_Classifications'})">
                        <i class="fa fa-user-shield pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Loan Risk Classifications</p>
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
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Member_Invoices'})">
                            <i class="fa fa-file-invoice pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Invoices</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Member_Receipts'})">
                        <i class="fa fa-receipt pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Receipts</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Penalty_Batches'})">
                            <i class="fa fa-coins pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Processed_Penalties</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Loan_Penalties'})">
                            <i class="fa fa-coins pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Penalties</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PSS':'Application_Fees'})">
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
                        <button class="flex text-sm" @click="openPage({'PSS':'Asset_Makes'})">
                            <i class="fa fa-box pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Asset Makes</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PSS':'Asset_Models'})">
                        <i class="fa fa-cogs pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Asset Models</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PSS':'Payment_Plans'})">
                        <i class="fa fa-user-shield pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Payment Plans</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PSS':'Asset_Fees'})">
                        <i class="fa fa-coins pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Fees & Charges</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex" @click="openPage({'PSS':'Templates'})">
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
        const units_dropdown = ref(false);
        const clients_dropdown = ref(false);
        const projects_dropdown = ref(false);
        const loans_dropdowns = ref(false);
        const finances_dropdown = ref(false);
        const userDetails = ref([]);
        const dropdown = ref(false);

        const showUnitsDropdown = () =>{
            clients_dropdown.value = false;
            settings_dropdown.value = false;
            projects_dropdown.value  = false;
            loans_dropdowns.value = false;
            dropdown.value = true;
            finances_dropdown.value  = false;
            units_dropdown.value  = !units_dropdown.value ;
        }
        const showProjectsDropdown = () =>{
            clients_dropdown.value = false;
            settings_dropdown.value = false;
            units_dropdown.value  = false;
            loans_dropdowns.value = false;
            finances_dropdown.value  = false;
            dropdown.value = true;
            projects_dropdown.value  = !projects_dropdown.value ;
        }
        const showClientsDropdown = () =>{
            settings_dropdown.value = false;
            units_dropdown.value  = false;
            projects_dropdown.value = false;
            loans_dropdowns.value = false;
            finances_dropdown.value  = false;
            dropdown.value = true;
            clients_dropdown.value  = !clients_dropdown.value ;
        }
        const showSettingsDropdown = () =>{
            clients_dropdown.value = false;
            units_dropdown.value  = false;
            projects_dropdown.value  = false;
            loans_dropdowns.value = false;
            finances_dropdown.value  = false;
            dropdown.value = true;
            settings_dropdown.value  = !settings_dropdown.value ;
        }
        const showLoansDropdown = () =>{
            clients_dropdown.value = false;
            units_dropdown.value  = false;
            projects_dropdown.value  = false;
            settings_dropdown.value = false;
            finances_dropdown.value  = false;
            dropdown.value = true;
            loans_dropdowns.value  = !loans_dropdowns.value ;
        }
        const showFinancesDropdown = () =>{
            clients_dropdown.value = false;
            units_dropdown.value  = false;
            projects_dropdown.value  = false;
            settings_dropdown.value = false;
            loans_dropdowns.value = false;
            dropdown.value = true;
            finances_dropdown.value  = !finances_dropdown.value ;
        }
        const closeDropdown = () =>{
            clients_dropdown.value = false;
            units_dropdown.value  = false;
            projects_dropdown.value  = false;
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
            dropdown, settings_dropdown, clients_dropdown, units_dropdown, loans_dropdowns,projects_dropdown, finances_dropdown,
            user_profile,userDetails, closeDropdown,showUnitsDropdown, showClientsDropdown,showProjectsDropdown, showLoansDropdown,
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