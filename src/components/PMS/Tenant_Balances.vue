<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewBalance"
        :searchFilters="searchFilters"
        @searchPage="searchBalances"
        @resetFilters="resetFilters"
        @removeItem="removeBalance"
        @removeSelectedItems="removeBalances"
        @printList="printBalancesList"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="balancesList"
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
            :displayButtons="displayButtons" @handleSubmit="createTenantBalance" @handleReset="handleReset"
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
import PrintJS from 'print-js';

export default{
    name: 'Tenant_Balances',
    props: ['scrollToTop','loader','showLoader','hideLoader',],
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const addButtonLabel = ref('New Balance');
        const addingRight = ref('Adding Tenant Take-On Balance');
        const removingRight = ref('Deleting Tenant Take-On Balance');
        const rightsModule = ref('PMS');
        const pageComponentKey = ref(0);
        const depComponentKey = ref(0);
        const tntComponentKey = ref(0);
        const propComponentKey = ref(0);
        const title = ref('Balance Details');
        const companyID = computed(()=> store.state.userData.company_id);
        const utilityID = ref('');
        const utilityArray = computed(() => store.state.Utilities.utilityArr);
        const tenantID = ref('');
        const propertyID = ref('');
        const tenantArray = computed(() => store.state.Active_Tenants.tenantUnitsArr);
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);;
        const idField = 'tenant_balance_id';
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const balancesList = ref([]);
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
            {label: "Date", key:"date",type: "text", editable: false},
            {label: "Tenant", key:"tenant_name",type: "text", editable: false},
            {label: "Property", key:"property_name",type: "text", editable: false},
            {label: "Category", key: "category", type: "text", editable: false},
            {label: "Type", key: "transaction_type", type: "text", editable: false},
            {label: "Utility", key: "utility", type: "text", editable: false},
            {label: "Description", key: "description", type: "text", editable: false},
            {label: "Amount", key: "amount", type: "number", editable: false},
            {label: "Vat", key: "tax_amount", type: "number", editable: false},
            {label: "Txn#", key: "journal_no", type: "text", editable: false},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Balance', rightName: 'Deleting Tenant Take-On Balance'},
        ])
        const tenant_name_search = ref("");
        const tenant_code_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
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
                type:'search-dropdown', value: propertyID.value, width:72, componentKey: propComponentKey,
                selectOptions: propertyArray, optionSelected: handleSelectedProperty,
                searchPlaceholder: 'Property...', dropdownWidth: '350px',
                fetchData: fetchProperties(), clearSearch: clearSelectedProperty           
            },
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedUtility = async(option) =>{
            await store.dispatch('Utilities/handleSelectedUtility', option);
            utilityID.value = store.state.Utilities.utilityID;
        }
        const handleSelectedTenant = async(option) =>{
            await store.dispatch('Active_Tenants/handleSelectedTenantUnit', option)
            tenantID.value = store.state.Active_Tenants.tenantUnitID;
        }
        const fetchUtilities = async() =>{
            await store.dispatch('Utilities/fetchUtilities', {company:companyID.value})
        };
        const clearSelectedDeposit = async() =>{
            await store.dispatch('Utilities/updateState', {utilityID: ''});
            utilityID.value = ""
        };
        const fetchTenants = async() =>{
            await store.dispatch('Active_Tenants/fetchTenantUnits', {company:companyID.value})
        };
        const clearSelectedTenant = async() =>{
            await store.dispatch('Active_Tenants/updateState', {tenantUnitID: ''});
            tenantID.value = ""
        };
        const formFields = ref([
            {  
                type:'search-dropdown', label:"Tenant", value: tenantID.value, componentKey: tntComponentKey,
                selectOptions: tenantArray, optionSelected: handleSelectedTenant, required: true,
                searchPlaceholder: 'Select Tenant...', dropdownWidth: '450px', updateValue: "",
                fetchData: fetchTenants(), clearSearch: clearSelectedTenant 
            },
            {  
                type:'search-dropdown', label:"Utility", value: utilityID.value, componentKey: depComponentKey,
                selectOptions: utilityArray, optionSelected: handleSelectedUtility, required: false,
                searchPlaceholder: 'Select Utility...', dropdownWidth: '450px', updateValue: "",
                fetchData: fetchUtilities(), clearSearch: clearSelectedDeposit
            },
            { type: 'date', name: 'date',label: "Date", value: '', required: true },
            { type: 'dropdown', name: 'transaction_type',label: "Type", value: 'Rent', placeholder: "", required: true, options: [{ text: 'Rent', value: 'Rent' }, { text: 'Utility', value: 'Utility' }, { text: 'Penalty', value: 'Penalty' }] },
            { type: 'dropdown', name: 'category',label: "Category", value: 'Debit', placeholder: "", required: true, options: [{ text: 'Debit', value: 'Debit' }, { text: 'Credit', value: 'Credit' }] },
            { type: 'text', name: 'amount',label: "Amount", value: '0', required: true },
            { type: 'text', name: 'tax_amount',label: "Tax Amount", value: '0', required: true },
            {required:false}
            
        ]);
        const handleReset = () =>{
            for(let i=2; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            tenantID.value = '';
            utilityID.value = '';
        }
        
        const addNewBalance = () =>{
            tenantID.value = "";
            utilityID.value = "";
            appModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const utilityID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    tenant_balance: utilityID
                }

                await store.dispatch('Tenant_Balances/deleteBalance',formData)
                searchBalances();         
            }
        } 
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createTenantBalance = async() =>{
            showModalLoader();
            let formData = {
                utility: utilityID.value,
                utility_id: utilityID.value,
                date: formFields.value[2].value,
                tenant: tenantID.value,
                tenant_id: tenantID.value,
                amount: parseFloat(formFields.value[5].value),
                tax_amount: parseFloat(formFields.value[6].value),
                transaction_type: formFields.value[3].value,
                category: formFields.value[4].value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=2; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(tenantID.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Tenant_Balances/createTenantBalance', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Balance added successfully!');
                        handleReset();
                        tntComponentKey.value += 1;
                        depComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while adding the Balance.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to add Balance: ' + error.message);
                } finally {
                    hideModalLoader();
                    store.dispatch('Active_Tenants/updateState',{tenantUnitID:''})
                    store.dispatch('Utilities/updateState',{utilityID:''})
                    searchBalances();
                }
            }
        }
        const removeBalance = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    tenant_balance: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Tenant_Balances/deleteBalance',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Balance Removed Succesfully");
                        searchBalances();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Balance: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    pageComponentKey.value += 1;
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Balance") 
            }else{
                toast.error("Please Select A Balance To Remove")
            }
        }
        const removeBalances = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    tenant_balance: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Tenant_Balances/deleteBalance',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Balance(s) Removed Succesfully");
                        searchBalances();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Balance(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    pageComponentKey.value += 1;
                }
            }else{
                toast.error("Please Select Balances(s) To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchBalances = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                tenant_code: tenant_code_search.value,
                tenant_name: tenant_name_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                property: propertyID.value,
                company: companyID.value,
                page_size: selectedValue.value
            }
 
            axios
            .post(`api/v1/tenant-balances-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                balancesList.value = response.data.results;
                store.commit('Tenant_Balances/LIST_BALANCES', balancesList.value)
                appResults.value = response.data;
                appArrLen.value = balancesList.value.length;
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
            searchBalances(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchBalances();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchBalances();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchBalances();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchBalances();
        }
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            propComponentKey.value += 1;
            propertyID.value = "";
            store.commit('Tenant_Deposits/RESET_SEARCH_FILTERS')
            searchBalances();
        }
        const closeModal = () =>{
            appModalVisible.value = false;
            utilityID.value = "";
            tenantID.value = "";
            store.dispatch('Active_Tenants/updateState',{tenantUnitID:''})
            store.dispatch('Utilities/updateState',{utilityID:''})
        };
        const printBalancesList = () =>{
            showLoader();
            let formData = {
                tenant_code: tenant_code_search.value,
                tenant_name: tenant_name_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                property: propertyID.value,
                company_id: companyID.value,
            } 

            axios
            .post("api/v1/export-tenant-balances-pdf/", formData, { responseType: 'blob' })
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
            searchBalances();
        })
        return{
            showTotals,title, searchBalances, idField, selectedIds, actions, balancesList, appArrLen,appCount,appResults,appModalVisible,formFields,
            addButtonLabel, searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,currentPage,
            showNextBtn,showPreviousBtn,addNewBalance, handleActionClick,createTenantBalance,displayButtons,handleReset,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            closeModal, handleSelectionChange, removeBalance, removeBalances, pageComponentKey, flex_basis, flex_basis_percentage,
            addingRight,removingRight,rightsModule,printBalancesList,selectSearchQuantity,selectedValue
        }
    }
}
</script>
