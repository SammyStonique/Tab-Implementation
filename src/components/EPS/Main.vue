<template>
    <div class="main-container w-full min-h-[90vh] bottom-8">
        <div class="fixed top-0 w-full z-50">
            <div class="z-50 relative">
                <NavBar :title="title" @minimize="minimize" @close="close"/>
            </div> 
            <div class="z-40 relative">
                <NavBarEPS @openPage="selectTab"/>
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
import NavBarEPS from '@/components/EPS/NavBarEPS.vue';
import PagesTab from '@/components/EPS/PagesTab.vue';
import Dashboard from '@/components/EPS/Dashboard.vue';
import Leave_Applications from '@/components/EPS/Leave_Applications.vue';
import Leave_Ammendments from '@/components/EPS/Leave_Ammendments.vue';
import Leave_Allocations from '@/components/EPS/Leave_Allocations.vue';
import Employees from '@/components/EPS/Employees.vue';
import Employee_Biodata from '@/components/EPS/Employee_Biodata.vue';
import Deduction_Details from '@/components/EPS/Deduction_Details.vue';
import Employee_Details from '@/components/EPS/Employee_Details.vue';
import Payrolls from '@/components/EPS/Payrolls.vue';
import Payroll_Employees from '@/components/EPS/Payroll_Employees.vue';
import Salary_Advances from '@/components/EPS/Salary_Advances.vue';
import Loan_Applications from '@/components/EPS/Loan_Applications.vue';
import Loan_Application_Details from '@/components/EPS/Loan_Application_Details.vue';
import Loan_Disbursements from '@/components/EPS/Loan_Disbursements.vue';
import Employee_Appraisals from '@/components/EPS/Employee_Appraisals.vue';
import Appraisal_Details from '@/components/EPS/Appraisal_Details.vue';
import Skill_Ratings from '@/components/EPS/Skill_Ratings.vue';
import Disciplinary_Cases from '@/components/EPS/Disciplinary_Cases.vue';
import Disciplinary_Meetings from '@/components/EPS/Disciplinary_Meetings.vue';
import Disciplinary_Actions from '@/components/EPS/Disciplinary_Actions.vue';
import Disciplinary_Appeals from '@/components/EPS/Disciplinary_Appeals.vue';
import Employee_Rewards from '@/components/EPS/Employee_Rewards.vue';


export default{
    components:{
        NavBar,
        NavBarEPS,
        PagesTab,
        Dashboard,
        Employees,Employee_Biodata,Employee_Details,Payrolls,Payroll_Employees,Deduction_Details,Leave_Applications,Leave_Allocations,
        Salary_Advances,Loan_Applications,Loan_Application_Details,Loan_Disbursements,Leave_Ammendments,
        Employee_Appraisals,Appraisal_Details,Skill_Ratings,Disciplinary_Cases,Disciplinary_Meetings,
        Disciplinary_Actions,Disciplinary_Appeals,Employee_Rewards,

    },
    props: {
        title: {
            type: String,
            required: true,
        },
    },
    setup(){
        const store = useStore();
        const title = ref('Employee Portal');
        const cachedComponents = computed(() =>  Array.from(store.state.pageTab.epsArray));
        const tabs = computed({
            get: ()=> store.state.pageTab.epsArray,
        });

        const activeTab = computed(() => store.state.pageTab.epsActiveTab);
    
        const activeComponent = computed(() => activeTab.value);
    
        const selectTab = (pageName) => {
            for(const [key, value] of Object.entries(pageName)){
                store.state.pageTab.epsActiveTab = value;
            }
        };
        const selectedTab = (pageName) => {
            store.state.pageTab.epsActiveTab = pageName;
        };
        const closeTab = (pageName) =>{
            let page = {"EPS":pageName};
            store.commit('pageTab/REMOVE_PAGE', page)
            store.commit(`${pageName}/RESET_SEARCH_FILTERS`)
            activeTab.value = store.state.pageTab.epsActiveTab;
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
            store.commit('modulesTab/REMOVE_TAB', {'EPS':'Employee Portal'}),
            store.commit('pageTab/CLEAR_PAGE_TAB', 'Employee Portal');
            activeTab.value = store.state.pageTab.epsActiveTab;
        }
        return{
            close,minimize,title,activeComponent,selectTab, selectedTab, closeTab,activeTab, cachedComponents
        }
    },
    mounted(){
        const store = useStore();
        this.activeTab = store.state.pageTab.epsActiveTab;
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