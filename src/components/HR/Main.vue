<template>
    <div class="main-container w-full min-h-[90vh] bottom-8">
        <div class="fixed top-0 w-full z-50">
            <div class="z-50 relative">
                <NavBar :title="title" @minimize="minimize" @close="close"/>
            </div> 
            <div class="z-40 relative">
                <NavBarHR @openPage="selectTab"/>
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
import NavBarHR from '@/components/HR/NavBarHR.vue';
import PagesTab from '@/components/HR/PagesTab.vue';
import Dashboard from '@/components/HR/Dashboard.vue';
import Pay_Cycles from '@/components/HR/Pay_Cycles.vue';
import Pay_Groups from '@/components/HR/Pay_Groups.vue';
import Deductions from '@/components/HR/Deductions.vue';
import Leave_Types from '@/components/HR/Leave_Types.vue';
import Leave_Applications from '@/components/HR/Leave_Applications.vue';
import Leave_Ammendments from '@/components/HR/Leave_Ammendments.vue';
import Leave_Allocations from '@/components/HR/Leave_Allocations.vue';
import Holidays from '@/components/HR/Holidays.vue';
import Paye from '@/components/HR/Paye.vue';
import Nssf from '@/components/HR/Nssf.vue';
import Shif from '@/components/HR/Shif.vue';
import Housing_Levy from '@/components/HR/Housing_Levy.vue';
import Employees from '@/components/HR/Employees.vue';
import Employee_Biodata from '@/components/HR/Employee_Biodata.vue';
import Deduction_Details from '@/components/HR/Deduction_Details.vue';
import Employee_Details from '@/components/HR/Employee_Details.vue';
import Import_Employees from '@/components/HR/Import_Employees.vue';
import Payrolls from '@/components/HR/Payrolls.vue';
import Payroll_Employees from '@/components/HR/Payroll_Employees.vue';
import HR_Templates from '@/components/HR/HR_Templates.vue';
import Design_HR_Template from '@/components/HR/Design_HR_Template.vue';
import Salary_Advances from '@/components/HR/Salary_Advances.vue';
import Loan_Applications from '@/components/HR/Loan_Applications.vue';
import Loan_Application_Details from '@/components/HR/Loan_Application_Details.vue';
import Loan_Disbursements from '@/components/HR/Loan_Disbursements.vue';
import Appraisal_Categories from '@/components/HR/Appraisal_Categories.vue';
import Appraisal_Periods from '@/components/HR/Appraisal_Periods.vue';
import Performance_Indicators from '@/components/HR/Performance_Indicators.vue';
import Employee_Appraisals from '@/components/HR/Employee_Appraisals.vue';
import Appraisal_Details from '@/components/HR/Appraisal_Details.vue';
import Skill_Ratings from '@/components/HR/Skill_Ratings.vue';

import Default_Settings from '@/components/SET/Default_Settings.vue';

export default{
    components:{
        NavBar,
        NavBarHR,
        PagesTab,
        Dashboard,
        Pay_Cycles,Pay_Groups,Deductions,Leave_Types,Holidays,Paye,Nssf,Shif,Housing_Levy,
        Employees,Employee_Biodata,Deduction_Details,Employee_Details,Import_Employees,Payrolls,Payroll_Employees,
        HR_Templates,Design_HR_Template,Leave_Applications,Leave_Allocations,Salary_Advances,Loan_Applications,
        Loan_Application_Details,Loan_Disbursements,Leave_Ammendments,Appraisal_Categories,Appraisal_Periods,Performance_Indicators,
        Employee_Appraisals,Appraisal_Details,Skill_Ratings,

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
        const title = ref('Human Resource');
        const cachedComponents = computed(() =>  Array.from(store.state.pageTab.hrArray));
        const tabs = computed({
            get: ()=> store.state.pageTab.hrArray,
        });

        const activeTab = computed(() => store.state.pageTab.hrActiveTab);
    
        const activeComponent = computed(() => activeTab.value);
    
        const selectTab = (pageName) => {
            for(const [key, value] of Object.entries(pageName)){
                store.state.pageTab.hrActiveTab = value;
            }
        };
        const selectedTab = (pageName) => {
            store.state.pageTab.hrActiveTab = pageName;
        };
        const closeTab = (pageName) =>{
            let page = {"HR":pageName};
            store.commit('pageTab/REMOVE_PAGE', page)
            store.commit(`${pageName}/RESET_SEARCH_FILTERS`)
            activeTab.value = store.state.pageTab.hrActiveTab;
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
            store.commit('modulesTab/REMOVE_TAB', {'HR':'Human Resource'}),
            store.commit('pageTab/CLEAR_PAGE_TAB', 'Human Resource');
            activeTab.value = store.state.pageTab.hrActiveTab;
        }
        return{
            close,minimize,title,activeComponent,selectTab, selectedTab, closeTab,activeTab, cachedComponents
        }
    },
    mounted(){
        const store = useStore();
        this.activeTab = store.state.pageTab.hrActiveTab;
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