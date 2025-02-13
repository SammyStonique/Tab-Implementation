<template>
    <div class="navbar flex top-0 w-full text-sm sticky-navbar bg-orange-400 border-b border-slate-300 shadow-sm shadow-slate-200 px-6 h-10">
        <button class="fixed inset-0 bg-gray-50 opacity-15 cursor-default w-full" v-if="dropdown" @click="closeDropdown"></button>
        <div class="flex">
            <div class="web-links py-1.5 px-2.5 w-32 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex" @click="showHomePage">
                    <i class="fa fa-home pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Home Page</p>
                </button>
            </div>
            <div class="web-links py-1.5 px-2.5 w-32 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex w-full" @click="openPage({'PMS':'Dashboard'})">
                    <i class="fa fa-tachometer pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Dashboard</p>
                </button>
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex w-full" @click="showPropertyDropdown">
                    <i class="fa fa-building pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Properties</p>
                </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="property_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Properties_List'})">
                            <i class="fa fa-building pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Properties List</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Landlords_List'})">
                            <i class="fa fa-users pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Landlords List</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Zones'})">
                            <i class="fa fa-map-marker-alt pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Zones</p>
                        </button>
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex w-full" @click="showUnitsDropdown">
                    <i class="fa fa-cube pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Units</p>
                </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="units_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Units_List'})">
                            <i class="fa fa-cubes pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Units List</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Utilities'})">
                            <i class="fa fa-water pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Utilities</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Security_Deposits'})">
                            <i class="fa fa-money-bill pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Security Deposits</p>
                        </button>
    
                    </div>
                </div>
            </div>

            <div class="web-links dropdown w-32">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex w-full" @click="showTenantsDropdown">
                        <i class="fa fa-universal-access pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Tenants</p>
                    </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="tenants_dropdown">       
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Active_Tenants'})">
                            <i class="fa fa-universal-access pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Tenants List</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Terminated_Leases'})">
                            <i class="fa fa-times pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Terminated Leases</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Tenant_Move_Out'})">
                            <i class="fa fa-door-open pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Tenant Move Out</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Tenant_Arrears'})">
                            <i class="fa fa-dollar-sign pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Tenant Arrears</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Tenant_Deposits'})">
                            <i class="fa fa-address-card pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Tenant Deposits</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Lease_Fees'})">
                            <i class="fa fa-address-card pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Lease Fees</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Meter_Readings'})">
                            <i class="fa fa-chart-line pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Meter Readings</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Tenant_Balances'})">
                            <i class="fa fa-list-ul pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Take-On Balances</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Tenant_Prepayments'})">
                            <i class="fa fa-list-ul pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Tenant Prepayments</p>
                        </button>
    
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex w-full" @click="showFinancesDropdown">
                        <i class="fa fa-money pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Finances</p>
                    </button>
                </div>
                <div class="dropdown-content w-48 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="finances_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Tenant_Invoices'})">
                            <i class="fa fa-file-invoice pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Invoices</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Tenant_Receipts'})">
                        <i class="fa fa-receipt pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Receipts</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Debit_Notes'})">
                        <i class="fa fa-credit-card pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Debit Notes</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Credit_Notes'})">
                        <i class="fa fa-credit-card pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Credit Notes</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'PMS':'Late_Payment_Fees'})">
                        <i class="fa fa-coins pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Late Payment Fees</p>
                        </button>
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-48">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="showStatementDropdown">
                        <i class="fa fa-file-alt pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Landlord Statement</p>
                    </button>
                </div>
                <div class="dropdown-content w-56 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="statement_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Property_Statements'})">
                            <i class="fa fa-file-alt pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Property Statements</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full" v-if="user_profile == 'Super Admin'">
                        <button class="flex text-sm" @click="openPage({'PMS':'Statement_Transactions'})">
                        <i class="fa fa-money-bill pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Statement Transactions</p>
                        </button>
                    </div>
                </div>
            </div>  
            <div class="web-links dropdown w-36">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="showSettingsDropdown">
                        <i class="fa fa-cogs pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Settings</p>
                    </button>
                </div>
                <div class="dropdown-content w-56 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="settings_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Utilities'})">
                            <i class="fa fa-water pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Utilities</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Security_Deposits'})">
                        <i class="fa fa-money-bill pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Security Deposits</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Variation_Periods'})">
                        <i class="fa fa-layer-group pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Variation Period</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Meter_Setup'})">
                        <i class="fa fa-sliders-h pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Meter Reading Setup</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Exit_Charges'})">
                        <i class="fa fa-door-open pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Exit Charges</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Default_Settings'})">
                        <i class="fa fa-link pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Posting Acc. Mapping</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Templates'})">
                        <i class="fa fa-image pt-2 mr-2" aria-hidden="true"></i>
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
        const property_dropdown = ref(false);
        const units_dropdown = ref(false);
        const tenants_dropdown = ref(false);
        const finances_dropdown = ref(false);
        const statement_dropdown = ref(false);
        const userDetails = ref([]);
        const dropdown = ref(false);

        const showPropertyDropdown = () =>{
            units_dropdown.value = false;
            settings_dropdown.value = false;
            tenants_dropdown.value  = false;
            finances_dropdown.value = false;
            dropdown.value = true;
            statement_dropdown.value  = false;
            property_dropdown.value  = !property_dropdown.value ;
        }
        const showTenantsDropdown = () =>{
            units_dropdown.value = false;
            settings_dropdown.value = false;
            property_dropdown.value  = false;
            finances_dropdown.value = false;
            statement_dropdown.value  = false;
            dropdown.value = true;
            tenants_dropdown.value  = !tenants_dropdown.value ;
        }
        const showUnitsDropdown = () =>{
            settings_dropdown.value = false;
            property_dropdown.value  = false;
            tenants_dropdown.value = false;
            finances_dropdown.value = false;
            statement_dropdown.value  = false;
            dropdown.value = true;
            units_dropdown.value  = !units_dropdown.value ;
        }
        const showSettingsDropdown = () =>{
            units_dropdown.value = false;
            property_dropdown.value  = false;
            tenants_dropdown.value  = false;
            finances_dropdown.value = false;
            statement_dropdown.value  = false;
            dropdown.value = true;
            settings_dropdown.value  = !settings_dropdown.value ;
        }
        const showFinancesDropdown = () =>{
            units_dropdown.value = false;
            property_dropdown.value  = false;
            tenants_dropdown.value  = false;
            settings_dropdown.value = false;
            statement_dropdown.value  = false;
            dropdown.value = true;
            finances_dropdown.value  = !finances_dropdown.value ;
        }
        const showStatementDropdown = () =>{
            units_dropdown.value = false;
            property_dropdown.value  = false;
            tenants_dropdown.value  = false;
            settings_dropdown.value = false;
            finances_dropdown.value = false;
            dropdown.value = true;
            statement_dropdown.value  = !statement_dropdown.value ;
        }
        const closeDropdown = () =>{
            units_dropdown.value = false;
            property_dropdown.value  = false;
            tenants_dropdown.value  = false;
            settings_dropdown.value = false;
            finances_dropdown.value = false;
            statement_dropdown.value  = false;
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
            dropdown, settings_dropdown, units_dropdown, property_dropdown, finances_dropdown,tenants_dropdown, statement_dropdown,
            user_profile,userDetails, closeDropdown,showPropertyDropdown, showUnitsDropdown,showTenantsDropdown, showFinancesDropdown,
            showSettingsDropdown, showStatementDropdown,openPage,showHomePage
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