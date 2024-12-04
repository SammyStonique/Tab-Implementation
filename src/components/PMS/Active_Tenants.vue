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
            @printList="printTenantsList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
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
            :selectedValue="selectedValue"
            @selectSearchQuantity="selectSearchQuantity"
        />
    </div>
    <MovableModal v-model:visible="transModalVisible" :title="transTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="trans_modal_loader" @showLoader="showTransModalLoader" @hideLoader="hideTransModalLoader" @closeModal="closeModal">
        <div class="mt-4 mb-3">
            <label for="">Unit:</label><br />
            <SearchableDropdown
                :key="unitComponentKey"
                :options="tenantUnitsArr"
                :dropdownWidth="dropdownWidth"
                @option-selected="handleSelectedTenantUnit"
                @clearSearch="clearSelectedTenantUnit"                             
            />
        </div>
        <div class="flex-1 basis-full px-2">
            <button @click="transferUnit" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Transfer</button>
        </div>
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';
import MovableModal from '@/components/MovableModal.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import Swal from 'sweetalert2';

export default{
    name: 'Active_Tenants',
    components:{
        PageComponent,MovableModal,SearchableDropdown
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const unitComponentKey = ref(0);
        const trans_modal_loader = ref('none');
        const idField = 'tenant_id';
        const addButtonLabel = ref('New Tenant');
        const addingRight = ref('Adding Tenants');
        const rightsModule = ref('PMS');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const tenantList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const transTitle = ref('Transfer Unit');
        const tenantUnitsArr = computed(() => store.state.Units_List.unitArr);
        const transModalVisible = ref(false);
        const dropdownWidth = ref("320px")
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('50vw');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"tenant_code"},
            {label: "Tenant Name", key:"tenant_name"},
            {label: "Phone Number", key: "phone_number"},
            {label: "Property", key:"property_name"},
            {label: "Unit", key:"unit_number"},
            {label: "Rent Amnt", key:"current_rent"},
            {label: "Balance", key:"running_balance", type: "number", textColor: "black"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Tenant', rightName: 'Editing Tenants'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Statement', rightName: 'Viewing Tenant Statement'},
            {name: 'transfer', icon: 'fa fa-exchange', title: 'Transfer Unit', rightName: 'Editing Tenants'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Tenant', rightName: 'Deleting Tenants'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const propertyID = ref(null);
        const unitID = ref(null);
        const tenantID = ref(null);
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
        const handleSelectedProperty = async(option) =>{
            await store.dispatch('Properties_List/handleSelectedProperty', option)
            propertyID.value = store.state.Properties_List.propertyID;
        };
        const clearSelectedProperty = async() =>{
            await store.dispatch('Properties_List/updateState', {propertyID: ''});
            propertyID.value = store.state.Properties_List.propertyID;
        }
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:48,},
            {type:'text', placeholder:"Code...", value: tenant_code_search, width:48,},
            {
                type:'search-dropdown', value: properties_array, width:48,
                selectOptions: properties_array, optionSelected: handleSelectedProperty,
                searchPlaceholder: 'Property...', dropdownWidth: '300px',
                fetchData: store.dispatch('Properties_List/fetchProperties', {company:companyID.value}),
                clearSearch: clearSelectedProperty
            },
            {type:'text', placeholder:"Unit No...", value: unit_number_search, width:48,},
            {type:'text', placeholder:"Phone No...", value: phone_number_search, width:48,},
        ]);
        const fetchTenantUnits = async(propertyID) =>{
            await store.dispatch('Units_List/fetchUnits', {company:companyID.value, property: propertyID, vacancy_status: "Vacant", owner_occupied:"False"});
        };
        const handleSelectedTenantUnit = async(option) =>{
            await store.dispatch('Units_List/handleSelectedUnit', option)
            unitID.value = store.state.Units_List.unitID;
        }
        const clearSelectedTenantUnit = async() =>{
            await store.dispatch('Units_List/updateState', {unitID: ''});
            unitID.value = store.state.Units_List.unitID;
        }
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
        };
        const showTransModalLoader = () =>{
            trans_modal_loader.value = "block";
        }
        const hideTransModalLoader = () =>{
            trans_modal_loader.value = "none";
        }
        const transferUnit = async() =>{
            showTransModalLoader();
            let formData = {
                tenant_unit: unitID.value,
                tenant: tenantID.value,
                company: companyID.value
            }
            Swal.fire({
            title: "Are you sure?",
            text: `Do you wish to Transfer Unit?`,
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes Transfer Unit!',
            cancelButtonText: 'Cancel!',
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            showLoaderOnConfirm: true,
            }).then((result) => {
            if (result.value) {
                axios.post(`api/v1/transfer-tenant-unit/`,formData)
                .then((response)=>{
                if(response.data.msg == "Success"){
                    Swal.fire("Tenant transferred succesfully!", {
                        icon: "success",
                    }); 
                    unitComponentKey.value += 1;
                    closeTransModal();
                    searchTenants();
                }else{
                    Swal.fire({
                    title: "Error Transferring Unit",
                    icon: "warning",
                    });
                }                   
                })
                .catch((error)=>{
                    console.log(error.message);
                    Swal.fire({
                        title: error.message,
                        icon: "warning",
                    });
                    hideTransModalLoader();
                })
            }else{
                Swal.fire(`Tenant has not been transferred!`);
                hideTransModalLoader();
            }
            })     
        };
        const closeTransModal = () =>{
            transModalVisible.value = false;
            tenantID.value = null;
            hideTransModalLoader();
        };
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
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/tenants-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                tenantList.value = response.data.results;
                store.commit('Active_Tenants/LIST_TENANTS', tenantList.value)
                propResults.value = response.data;
                propArrLen.value = tenantList.value.length;
                propCount.value = propResults.value.count;
                pageCount.value = Math.ceil(propCount.value / selectedValue.value);
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
        };
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchTenants(selectedValue.value);
        };
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
            await store.dispatch('Active_Tenants/updateState', {currentTab: 'Tenant_Biodata',selectedTenant: null,selectedTenantProperty: null,selectedTenantUnit: null,selectedTenantCurrency:null,selectedTenantVat:null,selectedDeposit:null, isEditing: false});
            store.commit('pageTab/ADD_PAGE', {'PMS':'Tenant_Details'});
            store.state.pageTab.pmsActiveTab = 'Tenant_Details';          
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                await store.dispatch('Active_Tenants/updateState', {currentTab: 'Tenant_Biodata',selectedTenant: null,selectedTenantProperty: null,selectedTenantUnit: null,selectedTenantCurrency:null,selectedTenantVat:null,selectedDeposit:null, isEditing: false});
                store.dispatch('Active_Tenants/updateState', {tenantCompanyID: companyID.value})
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
                await store.dispatch('Active_Tenants/updateState', {currentTab: 'Tenant_Biodata',selectedTenant: null,selectedTenantProperty: null,selectedTenantUnit: null,selectedTenantCurrency:null,selectedTenantVat:null,selectedDeposit:null, isEditing: false});
                const tenantID = row[idField];
                let formData = {
                    company: companyID.value,
                    tenant: tenantID
                }
                await store.dispatch('Active_Tenants/fetchTenantLease',formData)
                store.commit('pageTab/ADD_PAGE', {'PMS':'Tenant_Statement'})
                store.state.pageTab.pmsActiveTab = 'Tenant_Statement';
            }else if(action == 'transfer'){
                hideTransModalLoader();
                const propID = row['property_id'];
                tenantID.value = row['tenant_id'];
                await fetchTenantUnits(propID).
                then(()=>{
                    transModalVisible.value = true;
                })
            }
        }
        
        const printTenantsList = () =>{
            showLoader();
            let formData = {
                tenant_name: name_search.value,
                tenant_code: tenant_code_search.value,
                unit_number: unit_number_search.value,
                property: propertyID.value,
                phone_number: phone_number_search.value,
                company_id: companyID.value
            } 

            axios
            .post("api/v1/export-tenant-leases-pdf/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const blob1 = new Blob([response.data]);
                        // Convert blob to URL
                        const url = URL.createObjectURL(blob1);
                        PrintJS({printable: url, type: 'pdf'});
                    }
                })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        }
        onBeforeMount(()=>{
            searchTenants();
            
        })
        return{
            searchTenants,resetFilters, addButtonLabel, searchFilters, tableColumns, tenantList,dropdownWidth,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,
            submitButtonLabel, showModal, addNewTenant, showLoader, loader, hideLoader, importTenants, removeTenant, removeTenants,
            handleSelectionChange,addingRight,rightsModule,printTenantsList,selectSearchQuantity,selectedValue,
            modal_left,modal_top,modal_width,trans_modal_loader,transModalVisible,transTitle,showTransModalLoader,hideTransModalLoader,transferUnit,closeTransModal,
            fetchTenantUnits, handleSelectedTenantUnit, clearSelectedTenantUnit,tenantUnitsArr,unitComponentKey
        }
    }
};
</script>