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
                <button class="flex w-full" @click="openPage({'SAP':'Dashboard'})">
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
                        <button class="flex text-sm w-full" @click="openPage({'SAP':'Sale_Assets'})">
                            <i class="fa fa-universal-access pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Assets List</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'SAP':'Asset_Documents'})">
                            <i class="fa fa-file-image pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Asset Documents</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'SAP':'Payment_Plans'})">
                        <i class="fa fa-user-shield pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Payment Plans</p>
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
                        <button class="flex text-sm" @click="openPage({'SAP':'Asset_Units'})">
                            <i class="fa fa-bars pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Asset Units</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'SAP':'Unit_Reservations'})">
                            <i class="fa fa-arrow-circle-down pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Unit Reservations</p>
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
                        <button :class="{ 'disabled': isDisabled('Viewing Sale Clients') }" class="flex text-sm" @click="openPage({'SAP':'Clients'},'Viewing Sale Clients')">
                            <i class="fa fa-user pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Clients</p>
                        </button>
                    </div>
                </div>
            </div>

            <div class="web-links dropdown w-36">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex w-full" @click="showSalesDropdown">
                        <i class="fa fa-file-contract pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Sales</p>
                    </button>
                </div>
                <div class="dropdown-content w-56 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="sales_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button :class="{ 'disabled': isDisabled('Viewing Asset Sales') }" class="flex text-sm w-full" @click="openPage({'SAP':'Asset_Sales'},'Viewing Asset Sales')">
                            <i class="fa fa-file-contract pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">My Sales</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'SAP':'Agents_Commissions'})">
                            <i class="fa fa-coins pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">My Commissions</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'SAP':'Sale_Documents'})">
                            <i class="fa fa-file-image pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Sale Documents</p>
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
        const allowedRights = computed(()=> store.state.userData.permissions);
        const settings_dropdown = ref(false);
        const units_dropdown = ref(false);
        const clients_dropdown = ref(false);
        const projects_dropdown = ref(false);
        const sales_dropdown = ref(false);
        const finances_dropdown = ref(false);
        const userDetails = ref([]);
        const dropdown = ref(false);

        const showUnitsDropdown = () =>{
            clients_dropdown.value = false;
            settings_dropdown.value = false;
            projects_dropdown.value  = false;
            sales_dropdown.value = false;
            dropdown.value = true;
            finances_dropdown.value  = false;
            units_dropdown.value  = !units_dropdown.value ;
        }
        const showProjectsDropdown = () =>{
            clients_dropdown.value = false;
            settings_dropdown.value = false;
            units_dropdown.value  = false;
            sales_dropdown.value = false;
            finances_dropdown.value  = false;
            dropdown.value = true;
            projects_dropdown.value  = !projects_dropdown.value ;
        }
        const showClientsDropdown = () =>{
            settings_dropdown.value = false;
            units_dropdown.value  = false;
            projects_dropdown.value = false;
            sales_dropdown.value = false;
            finances_dropdown.value  = false;
            dropdown.value = true;
            clients_dropdown.value  = !clients_dropdown.value ;
        }
        const showSettingsDropdown = () =>{
            clients_dropdown.value = false;
            units_dropdown.value  = false;
            projects_dropdown.value  = false;
            sales_dropdown.value = false;
            finances_dropdown.value  = false;
            dropdown.value = true;
            settings_dropdown.value  = !settings_dropdown.value ;
        }
        const showSalesDropdown = () =>{
            clients_dropdown.value = false;
            units_dropdown.value  = false;
            projects_dropdown.value  = false;
            settings_dropdown.value = false;
            finances_dropdown.value  = false;
            dropdown.value = true;
            sales_dropdown.value  = !sales_dropdown.value ;
        }
        const showFinancesDropdown = () =>{
            clients_dropdown.value = false;
            units_dropdown.value  = false;
            projects_dropdown.value  = false;
            settings_dropdown.value = false;
            sales_dropdown.value = false;
            dropdown.value = true;
            finances_dropdown.value  = !finances_dropdown.value ;
        }
        const closeDropdown = () =>{
            clients_dropdown.value = false;
            units_dropdown.value  = false;
            projects_dropdown.value  = false;
            settings_dropdown.value = false;
            sales_dropdown.value = false;
            finances_dropdown.value  = false;
            dropdown.value = false;
        }
        const isDisabled =(permissionName) =>{
            const permission = allowedRights.value.find(p => p.rightName === permissionName);
            return permission ? !permission.right_status : true;
        };
        const openPage = (pageName,rightName) =>{
            if(rightName !== undefined){
                if(!isDisabled(rightName) ){  
                    closeDropdown();
                    store.commit('pageTab/ADD_PAGE', pageName);             
                    emit('openPage', pageName)
                }
            }
            else{
                closeDropdown();
                store.commit('pageTab/ADD_PAGE', pageName);
                emit('openPage', pageName)
            }
            
        };
        const showHomePage = () =>{
            store.commit('modulesTab/MINIMIZE_TAB')
        };
        
        return{
            dropdown, settings_dropdown, clients_dropdown, units_dropdown, sales_dropdown,projects_dropdown, finances_dropdown,
            user_profile,userDetails, closeDropdown,showUnitsDropdown, showClientsDropdown,showProjectsDropdown, showSalesDropdown,
            showSettingsDropdown, showFinancesDropdown,openPage,showHomePage,isDisabled
        }
    },

});
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.navbar{
  z-index: 1000;
}
.dropdown-content{
    position: absolute;
    z-index: 1000;
}

</style>