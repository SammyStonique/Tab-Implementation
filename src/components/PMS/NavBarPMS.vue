<template>
    <div class="navbar flex top-0 w-full text-sm sticky-navbar bg-white border-b border-slate-300 shadow-sm shadow-slate-200 px-6 h-10">
        <div class="flex">
            <div class="web-links py-1.5 px-2.5 w-32 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex">
                    <i class="fa fa-home pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Home Page</p>
                </button>
            </div>
            <div class="web-links py-1.5 px-2.5 w-32 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex" @click="openPage({'PMS':'Dashboard'})">
                    <i class="fa fa-tachometer pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Dashboard</p>
                </button>
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex" @click="showPropertyDropdown">
                    <i class="fa fa-building pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Properties</p>
                </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-xl pt-2" v-if="property_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Properties_List'})">
                            <i class="fa fa-building pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Properties List</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Landlords_List'})">
                            <i class="fa fa-building pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Landlords List</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Zones'})">
                            <i class="fa fa-building pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Zones</p>
                        </button>
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex" @click="showUnitsDropdown">
                    <i class="fa fa-building pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Units</p>
                </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-xl pt-2" v-if="units_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Units_List'})">
                            <i class="fa fa-file-text pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Units List</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Utilities'})">
                            <i class="fa fa-id-badge pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Utilities</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Security_Deposits'})">
                            <i class="fa fa-cubes pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Security Deposits</p>
                        </button>
    
                    </div>
                </div>
            </div>
            <!-- <div class="web-links py-1.5 px-2.5 w-32 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="openPage({'PMS':'Doctors'})">
                        <i class="fa fa-user-md pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Doctors</p>
                    </button>
            </div> -->
            <div class="web-links dropdown w-32">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="showTenantsDropdown">
                        <i class="fa fa-universal-access pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Tenants</p>
                    </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-xl pt-2" v-if="tenants_dropdown">       
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Active_Tenants'})">
                            <i class="fa fa-universal-access pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Tenants List</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Tenant_Deposits'})">
                            <i class="fa fa-address-card pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Tenant Deposits</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Meter_Readings'})">
                            <i class="fa fa-address-book-o pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Meter Readings</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm">
                            <i class="fa fa-list-ul pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Patients Queue</p>
                        </button>
    
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="showFinancesDropdown">
                        <i class="fa fa-money pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Finances</p>
                    </button>
                </div>
                <div class="dropdown-content w-48 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-xl" v-if="finances_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Tenant_Invoices'})">
                            <i class="fa fa-money pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Invoices</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Tenant_Receipts'})">
                        <i class="fa fa-object-ungroup pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Receipts</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Debit_Notes'})">
                        <i class="fa fa-object-ungroup pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Debit Notes</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Credit_Notes'})">
                        <i class="fa fa-object-ungroup pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Credit Notes</p>
                        </button>
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="showSettingsDropdown">
                        <i class="fa fa-money pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Settings</p>
                    </button>
                </div>
                <div class="dropdown-content w-48 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-xl" v-if="settings_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Utilities'})">
                            <i class="fa fa-money pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Utilities</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Security_Deposits'})">
                        <i class="fa fa-object-ungroup pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Security Deposits</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Variation_Periods'})">
                        <i class="fa fa-object-ungroup pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Variation Period</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'PMS':'Meter_Setup'})">
                        <i class="fa fa-object-ungroup pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Meter Reading Setup</p>
                        </button>
                    </div>
                </div>
            </div>        
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { defineComponent } from 'vue';
export default defineComponent({
    setup(_, { emit }){
        const store = useStore();
        const settings_dropdown = ref(false);
        const property_dropdown = ref(false);
        const units_dropdown = ref(false);
        const tenants_dropdown = ref(false);
        const finances_dropdown = ref(false);
        const userDetails = ref([]);

        const showPropertyDropdown = () =>{
            units_dropdown.value = false;
            settings_dropdown.value = false;
            tenants_dropdown.value  = false;
            finances_dropdown.value = false;
            property_dropdown.value  = !property_dropdown.value ;
        }
        const showTenantsDropdown = () =>{
            units_dropdown.value = false;
            settings_dropdown.value = false;
            property_dropdown.value  = false;
            finances_dropdown.value = false;
            tenants_dropdown.value  = !tenants_dropdown.value ;
        }
        const showUnitsDropdown = () =>{
            settings_dropdown.value = false;
            property_dropdown.value  = false;
            tenants_dropdown.value = false;
            finances_dropdown.value = false;
            units_dropdown.value  = !units_dropdown.value ;
        }
        const showSettingsDropdown = () =>{
            units_dropdown.value = false;
            property_dropdown.value  = false;
            tenants_dropdown.value  = false;
            finances_dropdown.value = false;
            settings_dropdown.value  = !settings_dropdown.value ;
        }
        const showFinancesDropdown = () =>{
            units_dropdown.value = false;
            property_dropdown.value  = false;
            tenants_dropdown.value  = false;
            settings_dropdown.value = false;
            finances_dropdown.value  = !finances_dropdown.value ;
        }
        const openPage = (pageName) =>{
            store.commit('pageTab/ADD_PAGE', pageName);
            emit('openPage', pageName)
        }
        return{
            settings_dropdown, units_dropdown,
            property_dropdown, finances_dropdown,
            tenants_dropdown,
            userDetails,
            showPropertyDropdown, showUnitsDropdown,
            showTenantsDropdown, showFinancesDropdown,
            showSettingsDropdown,
            openPage
        }
    },

});
</script>

<style scoped>
.navbar{
  z-index: 4000;
}

</style>