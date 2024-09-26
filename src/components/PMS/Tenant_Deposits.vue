<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewDeposit"
        :searchFilters="searchFilters"
        @searchPage="searchDeposits"
        @resetFilters="resetFilters"
        @removeItem="removeDeposit"
        @removeSelectedItems="removeDeposits"
        @printList="printList"
        :addingRight="addingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="depositsList"
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
    />
    <MovableModal v-model:visible="appModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
    >
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="createTenantDeposit" @handleReset="handleReset"
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
import { useDateFormatter } from '@/composables/DateFormatter';
import { useToast } from "vue-toastification";

export default{
    name: 'Tenant_Deposits',
    props: ['scrollToTop','loader','showLoader','hideLoader',],
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const addButtonLabel = ref('New Deposit');
        const addingRight = ref('Adding Tenant Deposit');
        const rightsModule = ref('PMS');
        const pageComponentKey = ref(0);
        const depComponentKey = ref(0);
        const tntComponentKey = ref(0);
        const title = ref('Deposit Details');
        const companyID = computed(()=> store.state.userData.company_id);
        const depositID = ref('');
        const depositArray = computed(() => store.state.Security_Deposits.depositArr);
        const tenantID = ref('');
        const propertyID = ref('');
        const tenantArray = computed(() => store.state.Tenant_Deposits.tenantLeaseArr);
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);;
        const idField = 'tenant_deposit_id';
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const depositsList = ref([]);
        const appResults = ref([]);
        const appArrLen = ref(0);
        const appCount = ref(0);
        const pageCount = ref(0);
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
            {label: "Date", key:"date",type: "text", editable: false},
            {label: "Tenant", key:"tenant_name",type: "text", editable: false},
            {label: "Property", key:"property_name",type: "text", editable: false},
            {label: "Deposit", key: "security_deposit", type: "text", editable: false},
            {label: "Charge Mode", key: "deposit_charge_mode", type: "text", editable: false},
            {label: "Value", key: "deposit_value", type: "text", editable: false},
            {label: "Amount", key: "deposit_amount", type: "number", editable: false},
            {label: "Posted", key: "posted", type: "text", editable: false},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Deposit', rightName: 'Deleting Tenant Deposit'},
        ])
        const tenant_name_search = computed({
            get: () => store.state.Tenant_Deposits.tenant_name_search,
            set: (value) => store.commit('Tenant_Deposits/SET_SEARCH_FILTERS', {"tenant_name_search":value}),
        });
        const tenant_code_search = computed({
            get: () => store.state.Tenant_Deposits.tenant_code_search,
            set: (value) => store.commit('Tenant_Deposits/SET_SEARCH_FILTERS', {"tenant_code_search":value}),
        });
        const posted_search = computed({
            get: () => store.state.Tenant_Deposits.posted_search,
            set: (value) => store.commit('Tenant_Deposits/SET_SEARCH_FILTERS', {"posted_search":value}),
        });
        const from_date_search = computed({
            get: () => store.state.Tenant_Deposits.from_date_search,
            set: (value) => store.commit('Tenant_Deposits/SET_SEARCH_FILTERS', {"from_date_search":value}),
        });
        const to_date_search = computed({
            get: () => store.state.Tenant_Deposits.to_date_search,
            set: (value) => store.commit('Tenant_Deposits/SET_SEARCH_FILTERS', {"to_date_search":value}),
        });
        const fetchProperties = async() =>{
            await store.dispatch('Properties_List/fetchProperties', {company:companyID.value})
        };
        const handleSelectedProperty = async(option) =>{
            await store.dispatch('Properties_List/handleSelectedProperty', option)
            propertyID.value = store.state.Properties_List.propertyID;
        };
        const clearSelectedProperty = async() =>{
            await store.dispatch('Properties_List/updateState', {propertyID: ''});
            propertyID.value = ""
        }
        const searchFilters = ref([
            {type:'text', placeholder:"Tenant Code...", value: tenant_code_search, width:36},
            {type:'text', placeholder:"Tenant Name...", value: tenant_name_search, width:64},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            {
                type:'dropdown', placeholder:"Posted", value: posted_search, width:48,
                options: [{text:'Yes',value:'Yes'},{text:'No',value:'No'}]
            },
            {
                type:'search-dropdown', value: propertyArray, width:72,
                selectOptions: propertyArray, optionSelected: handleSelectedProperty,
                searchPlaceholder: 'Property...', dropdownWidth: '350px',
                fetchData: fetchProperties(), clearSearch: clearSelectedProperty()             
            },
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedDeposit = async(option) =>{
            await store.dispatch('Security_Deposits/handleSelectedDeposit', option);
            depositID.value = store.state.Security_Deposits.depositID;
        }
        const handleSelectedTenant = async(option) =>{
            await store.dispatch('Tenant_Deposits/handleSelectedTenantLease', option)
            tenantID.value = store.state.Tenant_Deposits.tenantLeaseID;
        }
        const fetchDeposits = async() =>{
            await store.dispatch('Security_Deposits/fetchDeposits', {company:companyID.value})
        };
        const clearSelectedDeposit = async() =>{
            await store.dispatch('Security_Deposits/updateState', {depositID: ''});
            depositID.value = ""
        };
        const fetchTenants = async() =>{
            await store.dispatch('Tenant_Deposits/fetchTenantLease', {company:companyID.value})
        };
        const clearSelectedTenant = async() =>{
            await store.dispatch('Tenant_Deposits/updateState', {tenantLeaseID: ''});
            tenantID.value = ""
        };
        const formFields = ref([
            {  
                type:'search-dropdown', label:"Tenant", value: tenantID.value, componentKey: tntComponentKey,
                selectOptions: tenantArray, optionSelected: handleSelectedTenant, required: true,
                searchPlaceholder: 'Select Tenant...', dropdownWidth: '450px', updateValue: "",
                fetchData: fetchTenants(), clearSearch: clearSelectedTenant() 
            },
            {  
                type:'search-dropdown', label:"Security Deposit", value: depositID.value, componentKey: depComponentKey,
                selectOptions: depositArray, optionSelected: handleSelectedDeposit, required: true,
                searchPlaceholder: 'Select Deposit...', dropdownWidth: '450px', updateValue: "",
                fetchData: fetchDeposits(), clearSearch: clearSelectedDeposit() 
            },
            { type: 'date', name: 'date',label: "Date", value: '', required: true },
            { type: 'dropdown', name: 'default_mode',label: "Charge Mode", value: '', placeholder: "", required: true, options: [{ text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'Rent Percentage', value: 'Rent Percentage' }] },
            { type: 'number', name: 'default_value',label: "Default Value", value: 0, required: true },
            
        ]);
        const handleReset = () =>{
            for(let i=2; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            tenantID.value = '';
            depositID.value = '';
        }
        
        const addNewDeposit = () =>{
            tenantID.value = "";
            depositID.value = "";
            appModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const depositID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    tenant_deposit: depositID
                }

                await store.dispatch('Tenant_Deposits/deleteTenantDeposit',formData)
                searchDeposits();         
            }
        } 
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createTenantDeposit = async() =>{
            showModalLoader();
            let formData = {
                security_deposit: depositID.value,
                security_deposit_id: depositID.value,
                date: formFields.value[2].value,
                tenant: tenantID.value,
                tenant_id: tenantID.value,
                deposit_charge_mode: formFields.value[3].value,
                deposit_value: formFields.value[4].value,
                posted: 'No',
                company: companyID.value
            }

            errors.value = [];
            for(let i=2; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(tenantID.value == '' || depositID.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Tenant_Deposits/createTenantDeposit', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Tenant Deposit created successfully!');
                        handleReset();
                        tntComponentKey.value += 1;
                        depComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the deposit.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create deposit: ' + error.message);
                } finally {
                    hideModalLoader();
                    store.dispatch('Tenant_Deposits/updateState',{tenantLeaseID:''})
                    store.dispatch('Security_Deposits/updateState',{depositID:''})
                    searchDeposits();
                }
            }
        }
        const removeDeposit = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    tenant_deposit: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Tenant_Deposits/deleteTenantDeposit',formData)
                    if(response && response.status == 200){
                        toast.success("Tenant Deposit Removed Succesfully");
                        searchDeposits();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove deposit: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    pageComponentKey.value += 1;
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 deposit") 
            }else{
                toast.error("Please Select A Deposit To Remove")
            }
        }
        const removeDeposits = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    tenant_deposit: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Tenant_Deposits/deleteTenantDeposit',formData)
                    if(response && response.status == 200){
                        toast.success("Deposits Removed Succesfully");
                        searchDeposits();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove deposit(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    pageComponentKey.value += 1;
                }
            }else{
                toast.error("Please Select Deposit(s) To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchDeposits = () =>{
            showLoader();
            let formData = {
                tenant_code: tenant_code_search.value,
                tenant_name: tenant_name_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                property: propertyID.value,
                deposit: depositID.value,
                posted: posted_search.value,
                company_id: companyID.value
            }
 
            axios
            .post(`api/v1/tenant-deposits-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                depositsList.value = response.data.results;
                store.commit('Tenant_Deposits/LIST_TENANT_DEPOSITS', depositsList.value)
                appResults.value = response.data;
                appArrLen.value = depositsList.value.length;
                appCount.value = appResults.value.count;
                pageCount.value = Math.ceil(appCount.value / 50);
                
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
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchDeposits();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchDeposits();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchDeposits();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchDeposits();
        }
        const resetFilters = () =>{
            store.commit('Tenant_Deposits/RESET_SEARCH_FILTERS')
            searchDeposits();
        }
        const closeModal = () =>{
            appModalVisible.value = false;
            depositID.value = "";
            tenantID.value = "";
            store.dispatch('Tenant_Deposits/updateState',{tenantLeaseID:''})
            store.dispatch('Security_Deposits/updateState',{depositID:''})
        }
        onMounted(() =>{
            searchDeposits();
        })
        return{
            showTotals,title, searchDeposits, idField, selectedIds, actions, depositsList, appArrLen,appCount,appResults,appModalVisible,formFields,
            addButtonLabel, searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,
            showNextBtn,showPreviousBtn,addNewDeposit, handleActionClick,createTenantDeposit,displayButtons,handleReset,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            closeModal, handleSelectionChange, removeDeposit, removeDeposits, pageComponentKey, flex_basis, flex_basis_percentage,
            addingRight,rightsModule
        }
    }
}
</script>
