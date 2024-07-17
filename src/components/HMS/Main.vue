<template>
    <div class=" w-full min-h-[98vh] bottom-8 overflow-y-hidden">
        <div class="fixed top-0 w-full z-50">
            <TopBar @minimize="minimize" @close="close" />
            <NavBar :title="title"/>
            <NavBarHMS @openPage="selectTab"/>
            <PagesTab @openPage="selectedTab" @closePage="closeTab"/>
        </div>
        <div class="tab-content z-10 overflow-y-hidden">
            <keep-alive>
                <component :is="activeComponent" />
            </keep-alive>
        </div>
        
    </div>
</template>

<script>
import TopBar from '@/components/TopBar.vue'
import NavBar from '@/components/NavBar.vue'
import NavBarHMS from '@/components/NavBarHMS.vue'
import PagesTab from '@/components/HMS/PagesTab.vue'
import Dashboard from '@/components/HMS/Dashboard.vue'
import Appointments from '@/components/HMS/Appointments.vue'
import Doctors from '@/components/HMS/Doctors.vue'
import Departments from '@/components/HMS/Departments.vue'
import Patients_List from '@/components/HMS/Patients_List.vue'
import Emergency_Contacts from '@/components/HMS/Emergency_Contacts.vue'
import { useStore } from 'vuex';
import { ref, computed } from 'vue';
export default{
    components:{
        TopBar,
        NavBar,
        NavBarHMS,
        PagesTab,
        Dashboard, Appointments, Departments, Doctors, Patients_List, Emergency_Contacts
    },
    props: {
        title: {
            type: String,
            required: true,
        },
    },
    setup(){
        const store = useStore();
        const title = ref('Hospital Management')
        const activeTab = ref('Dashboard');
        const tabs = computed({
            get: ()=> store.state.pageTab.hmsArray,
        });
    
        const activeComponent = computed(() => activeTab.value);
    
        const selectTab = (pageName) => {
            for(const [key, value] of Object.entries(pageName)){
                activeTab.value = value;
            }
        };
        const selectedTab = (pageName) => {
            activeTab.value = pageName;
            store.state.pageTab.hmsActiveTab = pageName;
        };
        const closeTab = (pageName) =>{
            let page = {"HMS":pageName};
            store.commit('pageTab/REMOVE_PAGE', page)
            store.commit(`${pageName}/RESET_SEARCH_FILTERS`)
            activeTab.value = store.state.pageTab.hmsActiveTab;
        }
        const minimize = () =>{
            store.commit('modulesTab/MINIMIZE_TAB')
        }
        const close = () =>{
            let myArray = Array.from(tabs.value);
            console.log("THE VALUE OF TAB IS ",myArray);
            for(let i=0; i<myArray.length; i++){
                store.commit(`${myArray[i]}/RESET_SEARCH_FILTERS`)
            }
            store.commit('modulesTab/REMOVE_TAB', {'HMS':'Hospital Management'}),
            store.commit('pageTab/CLEAR_PAGE_TAB', 'Hospital Management')
            activeTab.value = store.state.pageTab.hmsActiveTab;
        }
        return{
            close,
            minimize,
            title,
            activeComponent,
            selectTab, selectedTab, closeTab,
            activeTab
        }
    },
    mounted(){
        const store = useStore();
        this.activeTab = store.state.pageTab.hmsActiveTab;
        // console.log("HMS MOUNTED");
    }
}
</script>

<style>
.tab-content{
    margin-top: 40px;
}
</style>