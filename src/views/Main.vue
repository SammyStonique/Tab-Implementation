<template>
    <Loader 
        :loader="loader"
        @showLoader="showLoader"
        @hideLoader="hideLoader"
    />
    <div v-show="hmsOpen && selectedModule === 'Hospital Management'">
        <HMS />
    </div>
    <div v-show="hmsOpen && selectedModule === 'Property Management'">
        <PMS />
    </div>
    <div v-show="hmsOpen && selectedModule === 'Financial Accounts'">
        <FA />
    </div>
    <div v-show="hmsOpen && selectedModule === 'Inventory Management'">
        <INV />
    </div>
    <div v-show="hmsOpen && selectedModule === 'Human Resource'">
        <HR />
    </div>
    <div v-show="hmsOpen && selectedModule === 'Membership Management'">
        <MMS />
    </div>
    <div v-show="hmsOpen && selectedModule === 'Hotel Management'">
        <HHS />
    </div>
    <div v-show="hmsOpen && selectedModule === 'Employee Portal'">
        <EPS />
    </div>
    <div v-show="hmsOpen && selectedModule === 'Settings'">
        <SET />
    </div>

    <div v-if="mainOpen" class="text-black h-screen bg-[url('@/assets/image2.jpg')] bg-cover bg-center px-4 sm:px-12 w-full">
        <div class="border-b border-gray-300 py-2 w-full flex pl-6 sm:pl-8">
            <p class="text-left basis-1/3 sm:basis-3/6 text-sm sm:text-base">Welcome, <strong class="uppercase">{{ username }}</strong></p>
            <p class="text-left basis-1/3 sm:basis-2/6 uppercase font-semibold text-sm sm:text-base"><strong>{{ company_name }}</strong></p>
            <div class="basis-1/2 sm:basis-1/6 flex items-center justify-end space-x-4">
                <button type="button" @click="showDropdown" class="text-sm sm:text-base">
                    Switch Company <i class="fa fa-caret-down pl-2" aria-hidden="true"></i>
                </button>
                <button class="ml-6 text-sm sm:text-base" title="Logout" @click="logout">
                    <strong><i class="fa fa-power-off"></i></strong>
                </button>
                <div class="relative">
                    <button class="fixed inset-0 bg-gray-50 opacity-25 cursor-default w-full" v-if="showOptions" @click="showOptions = !showOptions"></button>
                    <div class="text-left options-container absolute right-0 mt-3 pt-2 pb-2 w-80 rounded border border-gray-200 bg-white shadow-slate-400 shadow-lg" v-if="showOptions">
                        <ul v-for="(company, index) in companyList" :key="index">
                            <li><button class="pl-3 hover:bg-slate-500 hover:rounded hover:w-full" @click="switchCompany(index)">{{ company.company_name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }}
                            </button></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
            <div class="text-left" v-for="(mod, index) in company_modules" :key="index">
                <button @click="openModule(mod.module_name)" class="w-full text-center">
                    <div class="text-center rounded-full w-24 h-24 overflow-hidden mb-2 mx-auto">
                        <img :src="getImagePath(mod.module_logo)" alt="Module Icon" class="w-full h-full object-cover">
                    </div>
                    <div class="text-center">
                        <button class="underline text-sm sm:text-base"> {{ mod.module_name }} </button>
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
import ModulesTab from '@/components/ModulesTab.vue';
import { useStore } from 'vuex';
import { ref, computed, onBeforeMount, onMounted, watch } from 'vue';
import HMS from '@/components/HMS/Main.vue';
import PMS from '@/components/PMS/Main.vue';
import FA from '@/components/FA/Main.vue';
import INV from '@/components/INV/Main.vue';
import HR from '@/components/HR/Main.vue';
import SET from '@/components/SET/Main.vue';
import HHS from '@/components/HHS/Main.vue';
import MMS from '@/components/MMS/Main.vue';
import EPS from '@/components/EPS/Main.vue';
import Loader from '@/components/Loader.vue';

export default {
    components: {
        ModulesTab, Loader, HMS, FA, INV, PMS, HR, HHS, MMS, SET, EPS
    },
    setup() {
        const store = useStore();
        const loader = ref('none');
        const username = computed(() => store.state.userData.user_names);
        const companyID = computed(() => store.state.userData.company_id);
        const deviceID = computed(() => store.state.userData.device_id);
        const userID = computed(() => store.state.userData.user_id);
        const company_name = computed(() => store.state.userData.company_name);
        const companyList = computed(() => store.state.userData.user_companies);
        const hmsOpen = computed(() => store.state.modulesTab.modulePage);
        const mainOpen = computed(() => store.state.modulesTab.homePage);
        const showOptions = ref(false);
        const company_modules = computed(() => store.state.userData.company_modules);

        const selectedModule = computed(() => store.state.modulesTab.selectedModule);


        const getImagePath = (imageName) => {
            try {
                return require(`@/assets/${imageName}`);
            } catch (error) {
                console.error(`Image not found: ${imageName}`);
                return '';
            }
        };

        const showDropdown = () => {
            showOptions.value = !showOptions.value;
        };

        const openModule = (mod) => {
            store.commit('modulesTab/ADD_TAB', mod);
            hmsOpen.value = true;
            selectedModule.value = mod;
            mainOpen.value = false;
        };

        const showLoader = () => {
            loader.value = 'block';
        };

        const hideLoader = () => {
            loader.value = 'none';
        };

        const switchCompany = async (selectedCompany) => {
            showLoader();
            const company_data = {
                "company_id": companyList.value[selectedCompany].company_id,
                "company_name": companyList.value[selectedCompany].company_name
            };
            try {
                await axios.post("api/v1/update-session-data/", company_data).
                then(()=>{
                    store.dispatch('userData/reloadPage');
                })
            } catch (error) {
                console.log(error);
            } finally {
                hideLoader();
                
            }
        };

        const logout = async () => {
            let formData = {
                user_id: userID.value,
                device_id: deviceID.value,
            }
            await store.dispatch("userData/logout", formData);
        };

        onBeforeMount(() => {
            store.state.idleVue.isIdle = false;
            const { fetchSessionData } = useFetchSessionData();
            fetchSessionData();
        });

        onMounted(() => {
            // store.dispatch('userData/reloadPage');
        });

        return {
            openModule, hmsOpen, mainOpen, selectedModule, company_modules, getImagePath, username, company_name, logout,
            showOptions, showDropdown, companyList, switchCompany, loader, showLoader, hideLoader
        };
    }
};
</script>
