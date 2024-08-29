<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewTenant"
            :searchFilters="searchFilters"
            @searchPage="searchTenants"
            @resetFilters="resetFilters"
            @importData="importTenants"
            @removeItem="removeTenant"
            @removeSelectedItems="removeTenants"
            @printList="printList"
            :columns="tableColumns"
            :rows="tenantList"
            :actions="actions"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            :count="propCount"
            :currentPage="currentPage"
            :result="propArrLen"
            @loadPrev="loadPrev"
            @loadNext="loadNext"
            @firstPage="firstPage"
            @lastPage="lastPage"
            :showNextBtn="showNextBtn"
            :showPreviousBtn="showPreviousBtn"
        />
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Active_Tenants',
    components:{
        PageComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const idField = 'tenant_id';
        const addButtonLabel = ref('New Tenant');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const tenantList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"tenant_code"},
            {label: "Tenant Name", key:"name"},
            {label: "Phone Number", key: "phone_number"},
            {label: "Property", key:"property_name"},
            {label: "Unit", key:"unit_number"},
            {label: "Rent Amnt", key:"current_rent"},
            {label: "Balance", key:"rent_balance"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Tenant'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Statement'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Tenant'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const propertyID = ref(null);
        const unitID = ref(null);
        const utilityID = ref(null);
        const depositID = ref(null);
        const currencyID = ref(null);
        const name_search = computed({
            get: () => store.state.Active_Tenants.name_search,
            set: (value) => store.commit('Active_Tenants/SET_SEARCH_FILTERS', {"name_search":value}),
        });
        const tenant_code_search = computed({
            get: () => store.state.Active_Tenants.tenant_code_search,
            set: (value) => store.commit('Active_Tenants/SET_SEARCH_FILTERS', {"tenant_code_search":value}),
        });
        const unit_number_search = computed({
            get: () => store.state.Active_Tenants.unit_number_search,
            set: (value) => store.commit('Active_Tenants/SET_SEARCH_FILTERS', {"unit_number_search":value}),
        });
        const phone_number_search = computed({
            get: () => store.state.Active_Tenants.phone_number_search,
            set: (value) => store.commit('Active_Tenants/SET_SEARCH_FILTERS', {"phone_number_search":value}),
        });
        const properties_array = computed({
            get: () => store.state.Properties_List.propertyArr,
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:48,},
            {type:'text', placeholder:"Code...", value: tenant_code_search, width:48,},
            {
                type:'search-dropdown', value: properties_array, width:48,
                selectOptions: properties_array,
                searchPlaceholder: 'Property...', dropdownWidth: '300px',
                fetchData: store.dispatch('Properties_List/fetchProperties', {company:companyID.value})
            },
            {type:'text', placeholder:"Unit No...", value: unit_number_search, width:48,},
            {type:'text', placeholder:"Phone No...", value: phone_number_search, width:48,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const importTenants = () =>{
            store.commit('pageTab/ADD_PAGE', {'PMS':'Import_Tenants'})
            store.state.pageTab.pmsActiveTab = 'Import_Tenants';
        }
        const removeTenant = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    tenant: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Active_Tenants/deleteTenant',formData)
                    if(response && response.status == 200){
                        toast.success("Tenant Removed Succesfully");
                        searchTenants();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove tenant: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 tenant") 
            }else{
                toast.error("Please Select A Tenant To Remove")
            }
        }
        const removeTenants = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    tenant: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Active_Tenants/deleteTenant',formData)
                    if(response && response.status == 200){
                        toast.success("Tenant(s) Removed Succesfully");
                        searchPropertys();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove tenant: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Tenant To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchTenants = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                tenant_name: name_search.value,
                tenant_code: tenant_code_search.value,
                unit_number: unit_number_search.value,
                property: propertyID.value,
                phone_number: phone_number_search.value,
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/tenants-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                tenantList.value = response.data.results;
                store.commit('Active_Tenants/LIST_TENANTS', tenantList.value)
                propResults.value = response.data;
                propArrLen.value = tenantList.value.length;
                propCount.value = propResults.value.count;
                pageCount.value = Math.ceil(propCount.value / 50);
                if(response.data.next){
                    showNextBtn.value = true;
                }
                if(response.data.previous){
                    showPreviousBtn.value = true;
                }
            })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        }
        const resetFilters = () =>{
            store.commit('Active_Tenants/RESET_SEARCH_FILTERS')
            searchTenants();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchTenants();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchTenants();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchTenants();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchTenants();
            // scrollToTop();
        }
        const addNewTenant = async() =>{
            store.commit('Active_Tenants/initializeStore');
            await store.dispatch('Active_Tenants/updateState', {currentTab: 'Tenant_Biodata',selectedTenant: null,selectedProperty: null,selectedUnit: null,selectedCurrency:null,selectedDeposit:null, isEditing: false});
            store.commit('pageTab/ADD_PAGE', {'PMS':'Tenant_Details'});
            store.state.pageTab.pmsActiveTab = 'Tenant_Details';          
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const tenantID = row[idField];
                let formData = {
                    company: companyID.value,
                    tenant: tenantID
                }
                await store.dispatch('Active_Tenants/fetchTenant',formData).
                then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'PMS':'Tenant_Details'})
                    store.state.pageTab.pmsActiveTab = 'Tenant_Details';
                })
            }else if(action == 'delete'){
                const tenantID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    tenant: tenantID
                }
                await store.dispatch('Active_Tenants/deleteTenant',formData).
                then(()=>{
                    searchTenants();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchTenants();
            
        })
        return{
            searchTenants,resetFilters, addButtonLabel, searchFilters, tableColumns, tenantList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewTenant, showLoader, loader, hideLoader, importTenants, removeTenant, removeTenants,
            handleSelectionChange
        }
    }
};
</script>