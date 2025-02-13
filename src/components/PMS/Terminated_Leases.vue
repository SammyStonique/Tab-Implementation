<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :showAddButton="showAddButton"
            :searchFilters="searchFilters"
            @searchPage="searchTenants"
            @resetFilters="resetFilters"
            @removeItem="removeItem"
            @removeSelectedItems="removeItem"
            @printList="printTenantsList"
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
    name: 'Terminated_Leases',
    components:{
        PageComponent,MovableModal,SearchableDropdown
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const propComponentKey = ref(0);
        const unitComponentKey = ref(0);
        const trans_modal_loader = ref('none');
        const idField = 'tenant_id';
        const showAddButton = ref(false);
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
            {label: "Term. Date", key:"termination_date"},
            {label: "Code", key:"tenant_code"},
            {label: "Tenant Name", key:"tenant_name"},
            {label: "Phone Number", key: "phone_number"},
            {label: "Property", key:"property_name"},
            {label: "Unit", key:"unit_number"},
            {label: "Rent Amnt", key:"current_rent"},
            {label: "Balance", key:"running_balance", type: "number", textColor: "black"},
        ])
        const actions = ref([
            {name: 'restore', icon: 'fa fa-redo', title: 'Restore Tenant', rightName: 'Terminate Lease'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Statement', rightName: 'Viewing Tenant Statement'},

        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const propertyID = ref("");
        const unitID = ref(null);
        const tenantID = ref(null);
        const name_search = ref('');
        const tenant_code_search = ref('');
        const unit_number_search = ref('');
        const phone_number_search = ref('');
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
                type:'search-dropdown', value: propertyID.value, width:48, componentKey: propComponentKey,
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
        const showTransModalLoader = () =>{
            trans_modal_loader.value = "block";
        }
        const hideTransModalLoader = () =>{
            trans_modal_loader.value = "none";
        }
        const restoreTerminatedLease = async(tenantID) =>{

            let formData = {
                tenant: tenantID,
                company: companyID.value
            }
            Swal.fire({
            title: "Are you sure?",
            text: `Do you wish to Restore Lease?`,
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes Restore Lease!',
            cancelButtonText: 'Cancel!',
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            showLoaderOnConfirm: true,
            }).then((result) => {
            if (result.value) {
                axios.post(`api/v1/restore-terminated-lease/`,formData)
                .then((response)=>{
                if(response.data.msg == "Success"){
                    Swal.fire("Lease restored succesfully!", {
                        icon: "success",
                    }); 
                    searchTenants();
                }else if(response.data.msg == "Failed"){
                    Swal.fire({
                        title: "Unit Already Occupied",
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
                })
            }else{
                Swal.fire(`Lease has not been restored!`);
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
                active_status: "Terminated",
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/tenants-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                tenantList.value = response.data.results;
                // store.commit('Terminated_Leases/LIST_TENANTS', tenantList.value)
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
            currentPage.value = 1;
            selectedValue.value = 50;
            name_search.value = "";
            tenant_code_search.value = "";
            unit_number_search.value = "";
            phone_number_search.value = "";
            propComponentKey.value += 1;
            propertyID.value = "";
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
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'restore'){
                const tenantID = row[idField];
                restoreTerminatedLease(tenantID)

            }else if(action == 'view'){
                await store.dispatch('Terminated_Leases/updateState', {currentTab: 'Tenant_Biodata',selectedTenant: null,selectedTenantProperty: null,selectedTenantUnit: null,selectedTenantCurrency:null,selectedTenantVat:null,selectedDeposit:null, isEditing: false});
                const tenantID = row[idField];
                let formData = {
                    company: companyID.value,
                    tenant: tenantID
                }
                await store.dispatch('Terminated_Leases/fetchTenantLease',formData)
                store.commit('pageTab/ADD_PAGE', {'PMS':'Term_Lease_Statement'})
                store.state.pageTab.pmsActiveTab = 'Term_Lease_Statement';
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
            searchTenants,resetFilters, searchFilters, tableColumns, tenantList,dropdownWidth,showAddButton,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,
            submitButtonLabel, showModal, showLoader, loader, hideLoader,
            handleSelectionChange,rightsModule,printTenantsList,selectSearchQuantity,selectedValue,
            modal_left,modal_top,modal_width,trans_modal_loader,transModalVisible,transTitle,showTransModalLoader,hideTransModalLoader,closeTransModal,
            fetchTenantUnits, handleSelectedTenantUnit, clearSelectedTenantUnit,tenantUnitsArr,unitComponentKey
        }
    }
};
</script>