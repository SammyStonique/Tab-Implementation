<template>
    <div class="main-container w-full min-h-[90vh] bottom-8">
        <div class="fixed top-0 w-full z-50">
            <div class="z-50 relative">
                <NavBar :title="title" @minimize="minimize" @close="close"/>
            </div> 
            <div class="z-40 relative">
                <NavBarHMS @openPage="selectTab"/>
            </div>
            <div class="z-30">
                <PagesTab @openPage="selectedTab" @closePage="closeTab"/>
            </div>
        </div>
        <div class="tab-content z-10 overflow-y-hidden">
            <keep-alive :include="cachedComponents">
                <component 
                    :is="activeComponent"
                 />
            </keep-alive>
        </div>
        
    </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import NavBarHMS from '@/components/HMS/NavBarHMS.vue'
import PagesTab from '@/components/HMS/PagesTab.vue'
import Dashboard from '@/components/HMS/Dashboard.vue'
import Appointments from '@/components/HMS/Appointments.vue'
import Doctors from '@/components/HMS/Doctors.vue'
import Departments from '@/components/HMS/Departments.vue'
import Patients_List from '@/components/HMS/Patients_List.vue'
import Patient_Details from '@/components/HMS/Patient_Details.vue'
import Import_Appointments from '@/components/HMS/Import_Appointments.vue'
import Emergency_Contacts from '@/components/HMS/Emergency_Contacts.vue'
import { useStore } from 'vuex';
import { ref, computed, watch } from 'vue';
export default{
    components:{
        NavBar,
        NavBarHMS,
        PagesTab,
        Dashboard, Appointments, Departments, Doctors, Patients_List, Emergency_Contacts, Patient_Details, Import_Appointments
    },
    props: {
        title: {
            type: String,
            required: true,
        },
    },
    setup(){
        const store = useStore();
        const title = ref('Hospital Management');
        // const cachedComponents = ref([]);
        const cachedComponents = computed(() =>  Array.from(store.state.pageTab.hmsArray));
        const tabs = computed({
            get: ()=> store.state.pageTab.hmsArray,
        });

        const activeTab = computed(() => store.state.pageTab.hmsActiveTab);
    
        const activeComponent = computed(() => activeTab.value);
    
        const selectTab = (pageName) => {
            for(const [key, value] of Object.entries(pageName)){
                store.state.pageTab.hmsActiveTab = value;
                // if (!cachedComponents.value.includes(value)) {
                //     cachedComponents.value.push(value);
                // }
            }
            console.log("THE CACHED COMPONENTS VALUE IS ",cachedComponents.value);
        };
        const selectedTab = (pageName) => {
            store.state.pageTab.hmsActiveTab = pageName;
        };
        const closeTab = (pageName) =>{
            let page = {"HMS":pageName};
            store.commit('pageTab/REMOVE_PAGE', page)
            store.commit(`${pageName}/RESET_SEARCH_FILTERS`)
            activeTab.value = store.state.pageTab.hmsActiveTab;
            store.commit(`${pageName}/initializeStore`);
            // cachedComponents.value = cachedComponents.value.filter(c => c !== pageName);
            console.log("THE CACHED COMPONENTS VALUE IS ",cachedComponents.value);
        }
        const minimize = () =>{
            store.commit('modulesTab/MINIMIZE_TAB')
        }
        const close = () =>{
            let myArray = Array.from(tabs.value);
            console.log("THE VALUE OF TAB IS ",myArray);
            for(let i=0; i<myArray.length; i++){
                store.commit(`${myArray[i]}/RESET_SEARCH_FILTERS`)
                store.commit(`${myArray[i]}/initializeStore`)
            }
            store.commit('modulesTab/REMOVE_TAB', {'HMS':'Hospital Management'}),
            store.commit('pageTab/CLEAR_PAGE_TAB', 'Hospital Management');
            activeTab.value = store.state.pageTab.hmsActiveTab;
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
        this.activeTab = store.state.pageTab.hmsActiveTab;
    }
}
</script>

<style>
.tab-content{
    margin-top: 20px;
}
.main-container{
    max-height: 100vh;
    overflow: hidden;
}
</style>