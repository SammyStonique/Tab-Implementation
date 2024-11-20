<template>
    <div class="navbar flex top-0 w-full text-sm sticky-navbar bg-white border-b border-slate-300 shadow-sm shadow-slate-200 px-6 h-10">
        <button class="fixed inset-0 bg-gray-50 opacity-15 cursor-default w-full" v-if="dropdown" @click="closeDropdown"></button>
        <div class="flex">
            <div class="web-links py-1.5 px-2.5 w-32 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex" @click="showHomePage">
                    <i class="fa fa-home pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Home Page</p>
                </button>
            </div>
            <div class="web-links py-1.5 px-2.5 w-32 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex" @click="openPage({'HMS':'Dashboard'})">
                    <i class="fa fa-tachometer pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Dashboard</p>
                </button>
            </div>
            <div class="web-links py-1.5 px-2.5 w-36 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex" @click="openPage({'HMS':'Appointments'})">
                    <i class="fa fa-calendar pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Appointments</p>
                </button>
            </div> 
            <div class="web-links dropdown w-36">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex" @click="showDepartmentDropdown">
                    <i class="fa fa-building pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Departments</p>
                </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-xl pt-2" v-if="department_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'HMS':'Departments'})">
                            <i class="fa fa-file-text pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Departments List</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm">
                            <i class="fa fa-id-badge pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Department Managers</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm">
                            <i class="fa fa-cubes pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Staff Rooms</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm">
                            <i class="fa fa-university pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Wards</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm">
                            <i class="fa fa-bed pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Beds</p>
                        </button>
    
                    </div>
                </div>
            </div>
            <div class="web-links py-1.5 px-2.5 w-32 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="openPage({'HMS':'Doctors'})">
                        <i class="fa fa-user-md pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Doctors</p>
                    </button>

            </div>
            <div class="web-links dropdown w-32">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="showPatientsDropdown">
                        <i class="fa fa-universal-access pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Patients</p>
                    </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-xl pt-2" v-if="patients_dropdown">       
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'HMS':'Patients_List'})">
                            <i class="fa fa-universal-access pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Patients List</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'HMS':'Emergency_Contacts'})">
                            <i class="fa fa-address-card pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Emergency Contacts</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'HMS':'AddPatient'})">
                            <i class="fa fa-address-book-o pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Patient Visits</p>
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
            <div class="web-links py-1.5 px-2.5 w-32 h-full hover:bg-slate-500 hover:rounded" v-if="userDetails.profile == 'Super Admin'">>
                <button class="flex">
                    <i class="fa fa-user-plus pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Our Staff</p>
                </button>
            </div>
            <div class="web-links py-1.5 px-2.5 w-32 h-full hover:bg-slate-500 hover:rounded" v-else-if="userDetails.profile == 'Admin'">
                <button class="flex">
                    <i class="fa fa-user-plus pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Our Staff</p>
                </button>
            </div>
            <div class="web-links py-1.5 px-2.5 w-40 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex">
                        <i class="fa fa-flask pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Lab Management</p>
                    </button>
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="showFinancialsDropdown">
                        <i class="fa fa-money pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Financials</p>
                    </button>
                </div>
                <div class="dropdown-content w-48 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-xl" v-if="financials_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                            <button class="flex text-sm">
                                <i class="fa fa-money pt-2 mr-2" aria-hidden="true"></i>
                                <p class="">Fees & Charges</p>
                            </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                            <button class="flex text-sm">
                            <i class="fa fa-object-ungroup pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Invoices</p>
                            </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                            <button class="flex text-sm">
                            <i class="fa fa-pencil-square-o pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Receipts</p>
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
        const financials_dropdown = ref(false);
        const department_dropdown = ref(false);
        const patients_dropdown = ref(false);
        const dropdown = ref(false);

        const userDetails = ref([]);

        const showDepartmentDropdown = () =>{
            financials_dropdown.value = false;
            patients_dropdown.value  = false;
            dropdown.value = true;
            department_dropdown.value  = !department_dropdown.value ;
        }
        const showPatientsDropdown = () =>{
            financials_dropdown.value = false;
            department_dropdown.value  = false;
            dropdown.value = true;
            patients_dropdown.value  = !patients_dropdown.value ;
        }
        const showFinancialsDropdown = () =>{
            department_dropdown.value  = false;
            patients_dropdown.value  = false;
            dropdown.value = true;
            financials_dropdown.value  = !financials_dropdown.value ;
        };
        const closeDropdown = () =>{
            financials_dropdown.value = false;
            department_dropdown.value  = false;
            patients_dropdown.value  = false;
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
            dropdown,financials_dropdown,closeDropdown,
            department_dropdown,
            patients_dropdown,
            userDetails,
            showDepartmentDropdown,
            showPatientsDropdown,
            showFinancialsDropdown,
            openPage,showHomePage
        }
    },

});
</script>

<style>
.navbar{
  z-index: 4000;
}

</style>