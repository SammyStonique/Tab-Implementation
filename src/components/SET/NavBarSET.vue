<template>
    <div class="navbar flex top-0 w-full text-sm sticky-navbar bg-white border-b border-slate-300 shadow-sm shadow-slate-200 px-6 h-10">
        <button class="fixed inset-0 bg-gray-50 opacity-15 cursor-default w-full" v-if="dropdown" @click="closeDropdown"></button>
        <div class="flex">
            <div class="web-links py-1.5 px-2.5 w-32 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex">
                    <i class="fa fa-home pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Home Page</p>
                </button>
            </div>
            <div class="web-links py-1.5 px-2.5 w-32 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex w-full" @click="openPage({'INV':'Dashboard'})">
                    <i class="fa fa-tachometer pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Dashboard</p>
                </button>
            </div>
            <div class="web-links dropdown w-48">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex w-full" @click="showCompanyDropdown">
                    <i class="fa fa-file-text pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Company Settings</p>
                </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="company_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'SET':'Companies'})">
                            <i class="fa fa-newspaper-o pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Companies</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'SET':'Company_Info'})">
                            <i class="fa fa-bars pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Company Details</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'SET':'Branches'})">
                            <i class="fa fa-sitemap pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Branches</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'SET':'Departments'})">
                            <i class="fa fa-microchip pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Departments</p>
                        </button>
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex w-full" @click="showIntegrationsDropdown">
                    <i class="fa fa-plug pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Integrations</p>
                </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="integrations_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'SET':'Mpesa_Authentication'})">
                            <i class="fa fa-money pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Mpesa Authentication</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'SET':'Mpesa_Endpoints'})">
                            <i class="fa fa-money pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Mpesa EndPoints</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'SET':'SMS_Integrations'})">
                            <i class="fa fa-comment pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">SMS Integration</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'SET':'Email_Integrations'})">
                            <i class="fa fa-envelope pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Email Integration</p>
                        </button>
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-48">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex w-full" @click="showUsersDropdown">
                        <i class="fa fa-database pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">User Management</p>
                    </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="users_dropdown">       
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'SET':'Users'})">
                            <i class="fa fa-cogs pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Users</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'SET':'User_Rights'})">
                            <i class="fa fa-archive pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">User Rights</p>
                        </button>
                    </div>
                </div>
            </div> 
            <div class="web-links dropdown w-48">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="showSettingsDropdown">
                        <i class="fa fa-cogs pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">General Settings</p>
                    </button>
                </div>
                <div class="dropdown-content w-48 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="settings_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'SET':'Default_Settings'})">
                        <i class="fa fa-link pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Default_Settings</p>
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
        const company_dropdown = ref(false);
        const integrations_dropdown = ref(false);
        const users_dropdown = ref(false);
        const userDetails = ref([]);
        const dropdown = ref(false);

        const showCompanyDropdown = () =>{
            integrations_dropdown.value = false;
            settings_dropdown.value = false;
            users_dropdown.value  = false;
            dropdown.value = true;
            company_dropdown.value  = !company_dropdown.value ;
        }
        const showUsersDropdown = () =>{
            integrations_dropdown.value = false;
            settings_dropdown.value = false;
            company_dropdown.value  = false;
            dropdown.value = true;
            users_dropdown.value  = !users_dropdown.value ;
        }
        const showIntegrationsDropdown = () =>{
            settings_dropdown.value = false;
            company_dropdown.value  = false;
            users_dropdown.value = false;
            dropdown.value = true;
            integrations_dropdown.value  = !integrations_dropdown.value ;
        }
        const showSettingsDropdown = () =>{
            integrations_dropdown.value = false;
            company_dropdown.value  = false;
            users_dropdown.value  = false;
            dropdown.value = true;
            settings_dropdown.value  = !settings_dropdown.value ;
        }
        const closeDropdown = () =>{
            integrations_dropdown.value = false;
            company_dropdown.value  = false;
            users_dropdown.value  = false;
            settings_dropdown.value = false;
            dropdown.value = false;
        }
        const openPage = (pageName) =>{
            closeDropdown();
            store.commit('pageTab/ADD_PAGE', pageName);
            emit('openPage', pageName)
        }
        return{
            dropdown, settings_dropdown, integrations_dropdown,
            company_dropdown,users_dropdown, 
            userDetails, closeDropdown,
            showCompanyDropdown, showIntegrationsDropdown,
            showUsersDropdown,
            showSettingsDropdown,
            openPage
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