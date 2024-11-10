<template>
        <Loader 
            :loader="loader"
            @showLoader="showLoader"
            @hideLoader="hideLoader"
        />
        <div v-show="hmsOpen && selectedModule =='Hospital Management'">
            <HMS />
        </div>
        <div v-show="hmsOpen && selectedModule =='Property Management'">
            <PMS />
        </div>
        <div v-show="hmsOpen && selectedModule =='Financial Accounts'">
            <FA />
        </div>
        <div v-show="hmsOpen && selectedModule =='Inventory Management'">
            <INV />
        </div>
        <!-- <div v-show="hmsOpen && selectedModule =='Human Resource'">
            <HR />
        </div> -->
        <div v-show="hmsOpen && selectedModule =='Settings'">
            <SET />
        </div>
        <div v-if="mainOpen" class="text-black h-screen bg-[url('@/assets/image1.jpg')] bg-cover bg-center px-12 w-full">
            <div class="border-b border-gray-300 py-2 w-full flex pl-6">
                <p class="text-left basis-3/6">Welcome, {{ username }}</p>
                <p class="text-left basis-2/6 uppercase font-semibold text-sm">{{ company_name}}</p>
                <div class="basis-1/6">
                    <div class="companies-dropdown">
                    <button type="button" @click="showDropdown">Switch Company<i class="fa fa-caret-down pl-2" aria-hidden="true"></i></button>
                    <button class="fixed inset-button inset-0 bg-gray-50 opacity-25 cursor-default w-full" v-if="showOptions" @click="showOptions = !showOptions"></button>
                    <button class="ml-6" title="Logout" @click="logout"><strong><i class="fa fa-power-off"></i></strong></button>
                    </div>
                    <div class="text-left options-container absolute right-25 mt-3 pt-2 pb-2 w-60 rounded border border-gray-200 bg-white shadow-slate-400 shadow-lg" v-if="showOptions">
                        <ul v-for="company,index in companyList" :key="index">
                            <li ><button class="pl-3 hover:bg-slate-500 hover:rounded hover:w-full" @click="switchCompany(index)">{{ company.company_name }}</button></li>
                        </ul>
                    </div>
                </div>
                </div>
            <div class="w-full grid grid-cols-4 gap-4 pt-8">
                <div class="text-left" v-for="mod,index in company_modules" :key="index">
                    <button @click="openModule(mod.module_name)">
                        <div class="rounded-full w-24 h-24 overflow-hidden mb-2">
                            <img :src="getImagePath(mod.module_logo)" alt="Module Icon" class="w-full h-full object-cover">
                        </div>
                        <div class="text-left">
                            <button class="underline"> {{ mod.module_name }} </button>
                        </div>
                    </button>          
                </div>
            </div>
        </div>
    <modules-tab />

</template>

<script>
import axios from 'axios';
import { useFetchSessionData } from '@/composables/SessionData';
import ModulesTab from '@/components/ModulesTab.vue'
import { useStore } from 'vuex';
import { ref, reactive, computed,onBeforeMount } from 'vue';
import HMS from '@/components/HMS/Main.vue';
import PMS from '@/components/PMS/Main.vue'
import FA from '@/components/FA/Main.vue';
import INV from '@/components/INV/Main.vue';
import SET from '@/components/SET/Main.vue';
import Loader from '@/components/Loader.vue';

export default{
    components:{
        ModulesTab, Loader,
        HMS, FA, INV, PMS, SET
    },
    setup(){
        const store = useStore();
        const loader = ref('none');
        const username = computed(() => store.state.userData.user_names);
        const company_name = computed(() => store.state.userData.company_name);
        const companyList = computed(() => store.state.userData.user_companies);
        const hmsOpen = computed(() =>{
            return store.state.modulesTab.modulePage
        })
        const mainOpen = computed(() =>{
            return store.state.modulesTab.homePage
        })
        const showOptions = ref(false);
        const company_modules = computed(()=> store.state.userData.company_modules);

        const selectedModule = computed(() =>{
            return store.state.modulesTab.selectedModule
        })

        const getImagePath = (imageName) => {
            try {
                return require(`@/assets/${imageName}`);
            } catch (error) {
                console.error(`Image not found: ${imageName}`);
                return '';
            }
        };

        const showDropdown = () =>{
            showOptions.value = !showOptions.value;
        }

        const openModule = (mod) =>{
            store.commit('modulesTab/ADD_TAB', mod),
            hmsOpen.value = true;
            selectedModule.value = mod;
            mainOpen.value = false;
        }

        const showLoader = () =>{
            loader.value = "block";
        }

        const hideLoader = () =>{
            loader.value = "none";
        }

        const switchCompany = async(selectedCompany) =>{
            showLoader();
            const company_data = {
                "company_id": companyList.value[selectedCompany].company_id,
                "company_name": companyList.value[selectedCompany].company_name
            }
            try{
                await axios.post("api/v1/update-session-data/", company_data);
            }
            catch(error){
                console.log(error)
            }finally{
                hideLoader();
                store.dispatch('userData/reloadPage');
            }
        }

        const logout = () =>{
            store.dispatch("userData/logout");
        }

        onBeforeMount(()=>{
            const { fetchSessionData } = useFetchSessionData()
            fetchSessionData();
        })
        return{
            openModule, hmsOpen, mainOpen, selectedModule, company_modules, getImagePath, username, company_name, logout,
            showOptions, showDropdown, companyList, switchCompany, loader, showLoader, hideLoader
        }
    }
}
</script>