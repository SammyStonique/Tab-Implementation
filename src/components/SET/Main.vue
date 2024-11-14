<template>
    <div class="main-container w-full min-h-[90vh] bottom-8">
        <div class="fixed top-0 w-full z-50">
            <div class="z-50 relative">
                <NavBar :title="title" @minimize="minimize" @close="close"/>
            </div> 
            <div class="z-40 relative">
                <NavBarSET @openPage="selectTab"/>
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
import NavBar from '@/components/NavBar.vue'
import NavBarSET from '@/components/SET/NavBarSET.vue';
import PagesTab from '@/components/SET/PagesTab.vue';
import Dashboard from '@/components/SET/Dashboard.vue';
import Companies from '@/components/SET/Companies.vue';
import Company_Details from '@/components/SET/Company_Details.vue';
import Company_Info from '@/components/SET/Company_Info.vue';
import Departments from '@/components/SET/Departments.vue';
import Default_Settings from '@/components/SET/Default_Settings.vue';
import Branches from '@/components/SET/Branches.vue';
import Users from '@/components/SET/Users.vue';
import User_Details from '@/components/SET/User_Details.vue';
import User_Rights from '@/components/SET/User_Rights.vue';
import SMS_Integrations from '@/components/SET/SMS_Integrations.vue';
import Email_Integrations from '@/components/SET/Email_Integrations.vue';
import Mpesa_Authentication from '@/components/SET/Mpesa_Authentication.vue';
import Mpesa_Endpoints from '@/components/SET/Mpesa_Endpoints.vue';
import Mpesa_Setup_Details from '@/components/SET/Mpesa_Setup_Details.vue';
import Mpesa_Transactions from '@/components/SET/Mpesa_Transactions.vue';

export default{
    components:{
        NavBar,
        NavBarSET,
        PagesTab,
        Dashboard,Companies,Company_Details,Default_Settings,Company_Info,Departments,Branches,Users,
        User_Details,User_Rights,SMS_Integrations,Email_Integrations,Mpesa_Authentication,Mpesa_Endpoints,Mpesa_Setup_Details,Mpesa_Transactions
    },
    props: {
        title: {
            type: String,
            required: true,
        },
    },
    setup(){
        const store = useStore();
        const title = ref('Settings');
        const cachedComponents = computed(() =>  Array.from(store.state.pageTab.setArray));
        const tabs = computed({
            get: ()=> store.state.pageTab.setArray,
        });

        const activeTab = computed(() => store.state.pageTab.setActiveTab);
    
        const activeComponent = computed(() => activeTab.value);
    
        const selectTab = (pageName) => {
            for(const [key, value] of Object.entries(pageName)){
                store.state.pageTab.setActiveTab = value;
            }
        };
        const selectedTab = (pageName) => {
            store.state.pageTab.setActiveTab = pageName;
        };
        const closeTab = (pageName) =>{
            let page = {"SET":pageName};
            store.commit('pageTab/REMOVE_PAGE', page)
            store.commit(`${pageName}/RESET_SEARCH_FILTERS`)
            activeTab.value = store.state.pageTab.setActiveTab;
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
            store.commit('modulesTab/REMOVE_TAB', {'SET':'Settings'}),
            store.commit('pageTab/CLEAR_PAGE_TAB', 'Settings');
            activeTab.value = store.state.pageTab.setActiveTab;
        }
        return{
            close,
            minimize,
            title,
            activeComponent,
            selectTab, selectedTab, closeTab,
            activeTab, cachedComponents
        }
    },
    mounted(){
        const store = useStore();
        this.activeTab = store.state.pageTab.setActiveTab;
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