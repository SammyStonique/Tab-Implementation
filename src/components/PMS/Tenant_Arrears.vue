<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        :showAddButton="showAddButton"
        :searchFilters="searchFilters"
        @searchPage="searchTenantArrears"
        @resetFilters="resetFilters"
        @removeItem="removeAllocation"
        @removeSelectedItems="removeAllocations"
        @printList="printArrearsList"
        :columns="tableColumns"
        :rows="arrearsList"
        :actions="actions"
        :idField="idField"
        :showTotals="showTotals"
        @handleSelectionChange="handleSelectionChange"
        @handleActionClick="handleActionClick"
        :count="appCount"
        :currentPage="currentPage"
        :result="appArrLen"
        @loadPrev="loadPrev"
        @loadNext="loadNext"
        @firstPage="firstPage"
        @lastPage="lastPage"
        :showNextBtn="showNextBtn"
        :showPreviousBtn="showPreviousBtn"
        :selectedValue="selectedValue"
        @selectSearchQuantity="selectSearchQuantity"
    />
    <MovableModal v-model:visible="appModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
    >
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="allocatePrepayment" @handleReset="handleReset"
        />
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted,watch } from 'vue';
import { useStore } from "vuex";
import PageComponent from "../PageComponent.vue";
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';

export default{
    name: 'Tenant_Arrears',
    props: ['scrollToTop','loader','showLoader','hideLoader',],
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const pageComponentKey = ref(0);
        const propComponentKey = ref(0);
        const showAddButton = ref(false);
        const title = ref('Prepayment Allocation');
        const companyID = computed(()=> store.state.userData.company_id);
        const idField = '';
        const propertyID = ref('');
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const arrearsList = ref([]);
        const appResults = ref([]);
        const appArrLen = ref(0);
        const appCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('35vw');
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"tenant_code",type: "text", editable: false},
            {label: "Tenant Name", key:"tenant_name",type: "text", editable: false},
            {label: "Unit", key:"unit_number",type: "text", editable: false},
            {label: "Phone No", key:"phone_number",type: "text", editable: false},
            {label: "Email", key:"tenant_email",type: "text", editable: false},
            {label: "Property Name", key:"property_name",type: "text", editable: false},
            {label: "Amount", key: "arrears_amount", type: "number", editable: false},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'sms', icon: 'fa fa-envelope', title: 'SMS Balance'},
        ])
        const tenant_name_search = computed({
            get: () => store.state.Tenant_Arrears.tenant_name_search,
            set: (value) => store.commit('Tenant_Arrears/SET_SEARCH_FILTERS', {"tenant_name_search":value}),
        });
        const tenant_code_search = computed({
            get: () => store.state.Tenant_Arrears.tenant_code_search,
            set: (value) => store.commit('Tenant_Arrears/SET_SEARCH_FILTERS', {"tenant_code_search":value}),
        });
        const date_search = computed({
            get: () => store.state.Tenant_Arrears.date_search,
            set: (value) => store.commit('Tenant_Arrears/SET_SEARCH_FILTERS', {"date_search":value}),
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
        };
        const searchFilters = ref([
            {
                type:'search-dropdown', value: propertyID.value, width:48, componentKey: propComponentKey,
                selectOptions: properties_array, optionSelected: handleSelectedProperty,
                searchPlaceholder: 'Property...', dropdownWidth: '250px',
                fetchData: store.dispatch('Properties_List/fetchProperties', {company:companyID.value}),
                clearSearch: clearSelectedProperty
            },
            {type:'text', placeholder:"Tenant Code...", value: tenant_code_search, width:32},
            {type:'text', placeholder:"Tenant Name...", value: tenant_name_search, width:64},
            {type:'date', placeholder:"Date...", value: date_search, width:36, title: "As At Date Search"},
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        const handleActionClick = async(rowIndex, action, row) =>{
            
        } 
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchTenantArrears = () =>{
            showLoader();
            let formData = {
                client_code: tenant_code_search.value,
                client_name: tenant_name_search.value,
                date: date_search.value,
                property: propertyID.value,
                company: companyID.value,
                page_size: selectedValue.value
            }
 
            axios
            .post(`api/v1/tenant-arrears-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                arrearsList.value = response.data.results;
                store.commit('Tenant_Arrears/LIST_TENANT_ARREARS', arrearsList.value)
                appResults.value = response.data;
                appArrLen.value = arrearsList.value.length;
                appCount.value = appResults.value.count;
                pageCount.value = Math.ceil(appCount.value / selectedValue.value);
                
                if(response.data.next){
                    showNextBtn.value = true;
                }
                if(response.data.previous){
                    showPreviousBtn.value = true;
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchTenantArrears(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchTenantArrears();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchTenantArrears();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchTenantArrears();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchTenantArrears();
        }
        const resetFilters = () =>{
            selectedValue.value = 50;
            propComponentKey.value += 1;
            propertyID.value = ""
            store.commit('Tenant_Arrears/RESET_SEARCH_FILTERS')
            searchTenantArrears();
        };
        const printArrearsList = () =>{
            showLoader();
            let formData = {
                client_code: tenant_code_search.value,
                client_name: tenant_name_search.value,
                date: date_search.value,
                company: companyID.value
            } 

            axios
            .post("api/v1/export-tenant-arrears-pdf/", formData, { responseType: 'blob' })
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

        onMounted(() =>{
            searchTenantArrears();
        })
        return{
            showAddButton,title, searchTenantArrears, idField, selectedIds, actions, arrearsList, appArrLen,appCount,appResults,appModalVisible,
            searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,
            showNextBtn,showPreviousBtn, handleActionClick,displayButtons,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,showTotals,printArrearsList,selectSearchQuantity,selectedValue
        }
    }
}
</script>
