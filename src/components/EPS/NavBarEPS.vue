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
                <button class="flex w-full" @click="openPage({'EPS':'Dashboard'})">
                    <i class="fa fa-tachometer pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Dashboard</p>
                </button>
            </div>
            <div class="web-links dropdown w-44">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex w-full" @click="showEmployeesDropdown">
                        <i class="fa fa-universal-access pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Employment Details</p>
                    </button>
                </div>
                <div class="dropdown-content w-44 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="employees_dropdown">       
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'EPS':'Employee_Details'})">
                            <i class="fa fa-universal-access pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">My Details</p>
                        </button>
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-24">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex w-full" @click="showPayrollDropdown">
                        <i class="fa fa-spinner pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Payroll</p>
                    </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="payroll_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'EPS':'Salary_Advances'})">
                            <i class="fa fa-coins pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Salary Advances</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'EPS':'Loan_Applications'})">
                            <i class="fa fa-handshake pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Applications</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'EPS':'Loan_Disbursements'})">
                            <i class="fa fa-credit-card pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Loan Disbursements</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'EPS':'Processed_Payrolls'})">
                            <i class="fa fa-spinner pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Processed Payrolls</p>
                        </button>
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-44">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex w-full" @click="showLeaveDropdown">
                    <i class="fa fa-calendar-alt pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Leave Management</p>
                </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="leave_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'EPS':'Leave_Applications'})">
                            <i class="fa fa-calendar pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Leave Applications</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'EPS':'Leave_Allocations'})">
                            <i class="fa fa-cubes pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Leave Allocations</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'EPS':'Leave_Ammendments'})">
                            <i class="fa fa-clipboard pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Leave Ammendments</p>
                        </button>
                    </div>
                </div>
            </div>

            <div class="web-links dropdown w-32">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex w-full" @click="showAttendanceDropdown">
                        <i class="fa fa-clock pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Attendance</p>
                    </button>
                </div>
                <div class="dropdown-content w-48 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="attendance_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'EPS':'Timesheet'})">
                            <i class="fa fa-clock pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Timesheet</p>
                        </button>
                    </div>
                </div>
            </div>

            <div class="web-links dropdown w-32">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex w-full" @click="showAppraisalDropdown">
                        <i class="fa fa-chart-line pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Appraisals</p>
                    </button>
                </div>
                <div class="dropdown-content w-44 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="appraisal_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'EPS':'Employee_Appraisals'})">
                            <i class="fa fa-chart-line pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">My Appraisals</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'EPS':'Skill_Ratings'})">
                            <i class="fa fa-trophy pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Skill Ratings</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'EPS':'Employee_Rewards'})">
                            <i class="fa fa-gift pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">My Rewards</p>
                        </button>
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-32">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex w-full" @click="showDisciplinaryDropdown">
                        <i class="fa fa-exclamation-triangle pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Disciplinary</p>
                    </button>
                </div>
                <div class="dropdown-content w-56 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="disciplinary_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'EPS':'Disciplinary_Cases'})">
                            <i class="fa fa-exclamation-triangle pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Disciplinary Cases</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'EPS':'Disciplinary_Meetings'})">
                            <i class="fa fa-chalkboard pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Disciplinary Meetings</p>
                        </button>
                    </div>  
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'EPS':'Disciplinary_Actions'})">
                            <i class="fa fa-gavel pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Disciplinary Actions</p>
                        </button>
                    </div>   
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'EPS':'Disciplinary_Appeals'})">
                            <i class="fa fa-balance-scale pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Disciplinary Appeals</p>
                        </button>
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-48">
                <div class="py-0.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="showAssetsDropdown">
                        <i class="fa fa-warehouse pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Asset Management</p>
                    </button>
                </div>
                <div class="dropdown-content w-56 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="assets_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'EPS':'Assets_List'})">
                            <i class="fa fa-warehouse pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Assets List</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'EPS':'Assigned_Assets'})">
                        <i class="fa fa-money-bill pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Assigned Assets</p>
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
        const payroll_dropdown = ref(false);
        const leave_dropdown = ref(false);
        const employees_dropdown = ref(false);
        const attendance_dropdown = ref(false);
        const appraisal_dropdown = ref(false);
        const assets_dropdown = ref(false);
        const disciplinary_dropdown = ref(false);
        const userDetails = ref([]);
        const dropdown = ref(false);

        const showPayrollDropdown = () =>{
            leave_dropdown.value = false;
            employees_dropdown.value  = false;
            attendance_dropdown.value = false;
            disciplinary_dropdown.value  = false;
            dropdown.value = true;
            assets_dropdown.value  = false;
            appraisal_dropdown.value  = false;
            payroll_dropdown.value  = !payroll_dropdown.value ;
        }
        const showEmployeesDropdown = () =>{
            leave_dropdown.value = false;
            payroll_dropdown.value  = false;
            attendance_dropdown.value = false;
            assets_dropdown.value  = false;
            appraisal_dropdown.value  = false;
            disciplinary_dropdown.value  = false;
            dropdown.value = true;
            employees_dropdown.value  = !employees_dropdown.value ;
        }
        const showLeaveDropdown = () =>{
            payroll_dropdown.value  = false;
            employees_dropdown.value = false;
            attendance_dropdown.value = false;
            assets_dropdown.value  = false;
            appraisal_dropdown.value  = false;
            disciplinary_dropdown.value  = false;
            dropdown.value = true;
            leave_dropdown.value  = !leave_dropdown.value ;
        }

        const showAttendanceDropdown = () =>{
            leave_dropdown.value = false;
            payroll_dropdown.value  = false;
            employees_dropdown.value  = false;
            assets_dropdown.value  = false;
            appraisal_dropdown.value  = false;
            disciplinary_dropdown.value  = false;
            dropdown.value = true;
            attendance_dropdown.value  = !attendance_dropdown.value ;
        }
        const showAssetsDropdown = () =>{
            leave_dropdown.value = false;
            payroll_dropdown.value  = false;
            employees_dropdown.value  = false;
            attendance_dropdown.value = false;
            appraisal_dropdown.value  = false;
            disciplinary_dropdown.value  = false;
            dropdown.value = true;
            assets_dropdown.value  = !assets_dropdown.value ;
        }
        const showAppraisalDropdown = () =>{
            leave_dropdown.value = false;
            payroll_dropdown.value  = false;
            employees_dropdown.value  = false;
            attendance_dropdown.value = false;
            assets_dropdown.value  = false;
            disciplinary_dropdown.value  = false;
            dropdown.value = true;
            appraisal_dropdown.value  = !appraisal_dropdown.value ;
        };
        const showDisciplinaryDropdown = () =>{
            leave_dropdown.value = false;
            payroll_dropdown.value  = false;
            employees_dropdown.value  = false;
            attendance_dropdown.value = false;
            assets_dropdown.value  = false;
            appraisal_dropdown.value = false;
            dropdown.value = true;
            disciplinary_dropdown.value  = !disciplinary_dropdown.value ;
        };
        const closeDropdown = () =>{
            leave_dropdown.value = false;
            payroll_dropdown.value  = false;
            employees_dropdown.value  = false;
            attendance_dropdown.value = false;
            assets_dropdown.value  = false;
            dropdown.value = false;
            appraisal_dropdown.value  = false;
            disciplinary_dropdown.value  = false;
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
            dropdown, leave_dropdown, payroll_dropdown, attendance_dropdown,employees_dropdown, assets_dropdown, appraisal_dropdown,
            disciplinary_dropdown,user_profile,userDetails, closeDropdown,showPayrollDropdown, showLeaveDropdown,showEmployeesDropdown, showAttendanceDropdown,
            showDisciplinaryDropdown, showAssetsDropdown, showAppraisalDropdown,openPage,showHomePage
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