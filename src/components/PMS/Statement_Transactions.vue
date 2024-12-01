<template>
    <div class="z-10">
        <PageComponent
            :key="mainComponentKey" 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewTransaction"
            :searchFilters="searchFilters"
            @searchPage="searchStatementTransactions"
            @resetFilters="resetFilters"
            @removeItem="removeStatementTransaction"
            @removeSelectedItems="removeStatementTransactions"
            @printList="printList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="transactionsList"
            :actions="actions"
            :idField="idField"
            :showTotals="showTotals"
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
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="saveTransaction" @handleReset="handleReset"
            />
        </MovableModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Statement_Transactions',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'statement_transaction_id';
        const addButtonLabel = ref('New Transaction');
        const addingRight = ref('Adding Statement Transactions');
        const rightsModule = ref('PMS');
        const title = ref('Transaction Details');
        const submitButtonLabel = ref('Add');
        const mainComponentKey = ref(0);
        const utilComponentKey = ref(0);
        const propComponentKey = ref(0);
        const tntComponentKey = ref(0);
        const selectedIds = ref([]);
        const transactionsList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('80px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const isEditing = computed(()=> store.state.Statement_Transactions.isEditing);
        const selectedTransaction = computed(()=> store.state.Statement_Transactions.selectedTransaction);
        const selectedUtility = computed(()=> store.state.Statement_Transactions.selectedUtility);
        const propertySearchID = ref('');
        const tenantID = ref(null);
        const utilityID = ref(null);
        const utilitySearchID = ref(null);
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);
        const tenantArray = computed(() => store.state.Active_Tenants.tenantUnitsArr);
        const utilityArray = computed(() => store.state.Utilities.utilityArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Type", key:"transaction_type"},
            {label: "Schedule", key:"schedule"},
            {label: "Utility", key:"utility_name"},
            {label: "Date", key: "date"},
            {label: "Bank. Date", key: "banking_date"},
            {label: "Description", key: "description", maxWidth:"450px"},
            {label: "Txn", key: "journal_no"},
            {label: "Bill", key: "bill", type: "number"},
            {label: "Tax", key: "bill_tax", type: "number"},
            {label: "Paid", key: "paid", type: "number"},
            {label: "Tax", key: "paid_tax", type: "number"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Transaction', rightName: 'Editing Statement Transactions'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Transaction', rightName: 'Deleting Statement Transactions'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const fetchProperties = async() =>{
            await store.dispatch('Properties_List/fetchProperties', {company:companyID.value})
        };
        const handleSearchProperty = async(option) =>{
            await store.dispatch('Properties_List/handleSelectedProperty', option)
            propertySearchID.value = store.state.Properties_List.propertyID;
        };
        const clearSearchProperty = async() =>{
            await store.dispatch('Properties_List/updateState', {propertyID: ''});
            propertySearchID.value = ""
        };
        const fetchSearchUtilities = async() =>{
            await store.dispatch('Utilities/fetchUtilities', {company:companyID.value})    
        };
        const handleSearchUtility = async(option) =>{
            await store.dispatch('Utilities/handleSelectedUtility', option)
            utilitySearchID.value = store.state.Utilities.utilityID;
        };
        const clearSearchUtility = async() =>{
            await store.dispatch('Utilities/updateState', {utilityID: ''});
            utilitySearchID.value = ""
        };
        const fetchTenants = async() =>{
            if(propertySearchID.value){
                await store.dispatch('Active_Tenants/fetchTenantUnits', {company:companyID.value, property: propertySearchID.value})
            }       
        };
        const handleSelectedTenant = async(option) =>{
            await store.dispatch('Active_Tenants/handleSelectedTenantUnit', option)
            tenantID.value = store.state.Active_Tenants.tenantUnitID;
        };
        const clearSelectedTenant = async() =>{
            await store.dispatch('Active_Tenants/updateState', {tenantUnitID: ''});
            tenantID.value = ""
        }
        const from_date_search = computed({
            get: () => store.state.Statement_Transactions.from_date_search,
            set: (value) => store.commit('Statement_Transactions/SET_SEARCH_FILTERS', {"from_date_search":value}),
        });
        const to_date_search = computed({
            get: () => store.state.Statement_Transactions.to_date_search,
            set: (value) => store.commit('Statement_Transactions/SET_SEARCH_FILTERS', {"to_date_search":value}),
        });
        const searchFilters = ref([
            {
                type:'search-dropdown', value: propertySearchID.value, width:64, componentKey: propComponentKey,
                selectOptions: propertyArray, optionSelected: handleSearchProperty,
                searchPlaceholder: 'Property Search...', dropdownWidth: '320px',
                fetchData: fetchProperties(), clearSearch: clearSearchProperty()             
            },
            {
                type:'search-dropdown', label:"Tenant", value: tenantID.value, width:64, componentKey: tntComponentKey,
                selectOptions: tenantArray, optionSelected: handleSelectedTenant,
                searchPlaceholder: 'Select Tenant...', dropdownWidth: '320px',
                fetchData: fetchTenants(), clearSearch: clearSelectedTenant()            
            },
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            {
                type:'search-dropdown', label:"Utility", value: utilitySearchID.value, width:36,
                selectOptions: utilityArray, optionSelected: handleSearchUtility,
                searchPlaceholder: 'Select Utility...', dropdownWidth: '200px',
                fetchData: fetchSearchUtilities(), clearSearch: clearSearchUtility()            
            },
        ]);
        watch([propertySearchID], ()=>{
            if(propertySearchID.value){
                fetchTenants();
            }
        }, {immediate: true})
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const fetchUtilities = async() =>{
            await store.dispatch('Utilities/fetchUtilities', {company:companyID.value})    
        };
        const handleSelectedUtility = async(option) =>{
            await store.dispatch('Utilities/handleSelectedUtility', option)
            utilityID.value = store.state.Utilities.utilityID;
        };
        const clearSelectedUtility = async() =>{
            await store.dispatch('Utilities/updateState', {utilityID: ''});
            utilityID.value = ""
        }
        const formFields = ref([]);
        const utilityValue = computed(() => {
           return (selectedTransaction.value && selectedTransaction.value.utility && !utilityID.value) ? selectedTransaction.value.utility.utility_id : utilityID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                { type: 'dropdown', name: 'transaction_type',label: "Type", value: selectedTransaction.value?.transaction_type || '', placeholder: "", required: true, options: [{ text: 'Rent', value: 'Rent' }, { text: 'Rent Prep Alloc', value: 'Rent Prep Alloc' },{ text: 'Prepayment', value: 'Prepayment' },{ text: 'Deposit', value: 'Deposit' }, { text: 'Deposit Prep Alloc', value: 'Deposit Prep Alloc' },{ text: 'Utility', value: 'Utility' }, { text: 'Utility Prep Alloc', value: 'Utility Prep Alloc' },
                        { text: 'Penalty', value: 'Penalty' }, { text: 'Penalty Prep Alloc', value: 'Penalty Prep Alloc' },{ text: 'Other', value: 'Other' }, { text: 'Other Prep Alloc', value: 'Other Prep Alloc' }] },
                {
                    type:'search-dropdown', label:"Utility", value: utilityValue.value, componentKey: utilComponentKey,
                    selectOptions: utilityArray, optionSelected: handleSelectedUtility, required: false,
                    searchPlaceholder: 'Select Utility...', dropdownWidth: '400px', updateValue: selectedUtility.value,
                    fetchData: fetchUtilities(), clearSearch: clearSelectedUtility()            
                },
                { type: 'date', name: 'date',label: "Date", value: selectedTransaction.value?.date || "", required: true },
                {type:'text-area', label:"Description", value: selectedTransaction.value?.description || "" , textarea_rows: '2', textarea_cols: '44', required: true},
                { type: 'number', name: 'bill',label: "Bill", value: selectedTransaction.value?.bill || 0, required: true },
                { type: 'number', name: 'bill_tax',label: "Bill Tax", value: selectedTransaction.value?.bill_tax || 0, required: false },
                { type: 'number', name: 'paid',label: "Paid", value: selectedTransaction.value?.paid || 0, required: true },
                { type: 'number', name: 'paid_tax',label: "Paid Tax", value: selectedTransaction.value?.paid_tax || 0, required: false },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            utilityValue.value = "";
            utilComponentKey.value += 1;
        }

        watch([selectedTransaction, selectedUtility], () => {
            if (selectedTransaction.value && selectedUtility.value) {
                utilComponentKey.value += 1;
                updateFormFields();
            }else if(selectedTransaction.value){
                updateFormFields();
            }        
        }, { immediate: true });
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createTransaction = async() =>{
            showModalLoader();
            let formData = {
                tenant: selectedTransaction.value.tenant.tenant_unit_id,
                tenant_id: selectedTransaction.value.tenant.tenant_unit_id,
                date: formFields.value[2].value,
                banking_date: selectedTransaction.value.banking_date,
                transaction_type: formFields.value[0].value,
                description: formFields.value[3].value,
                schedule: selectedTransaction.value.schedule,
                journal: selectedTransaction.value.journal,
                utility: utilityValue.value,
                utility_id: utilityValue.value,
                client_id: selectedTransaction.value.client_id,
                bill: formFields.value[4].value,
                bill_tax: formFields.value[5].value,
                paid: formFields.value[6].value,
                paid_tax: formFields.value[7].value,
                processed: selectedTransaction.value.processed,
                company: companyID.value
            }

            errors.value = [];
            for(let i=2; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(formFields.value[0].value == ""){
                errors.value.push("Error")
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Statement_Transactions/createStatementTransaction', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Transaction created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the transaction.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create transaction: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchStatementTransactions();
                }
            }
        }
        const updateTransaction = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                statement_transaction: selectedTransaction.value.statement_transaction_id,
                tenant: tenantID.value,
                tenant_id: tenantID.value,
                date: formFields.value[2].value,
                banking_date: formFields.value[2].value,
                transaction_type: formFields.value[0].value,
                description: formFields.value[3].value,
                schedule: null,
                journal: null,
                utility: utilityValue.value,
                utility_id: utilityValue.value,
                client_id: tenantID.value,
                bill: formFields.value[4].value,
                bill_tax: formFields.value[5].value,
                paid: formFields.value[6].value,
                paid_tax: formFields.value[7].value,
                processed: "False",
                company: companyID.value
            }

            for(let i=2; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label );
                }
            }

            if(formFields.value[0].value == ""){
                errors.value.push("Error")
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Statement_Transactions/updateStatementTransaction', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Transaction updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the transaction.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update transaction: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Statement_Transactions/updateState",{selectedTransaction:null})
                    searchStatementTransactions();
                }             
            }
        }
        const saveTransaction = () =>{
            if(isEditing.value == true){
                updateTransaction();
            }else{
                createTransaction();
            }
        }
        const removeStatementTransaction = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    deposit: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Statement_Transactions/deleteStatementTransaction',formData)
                    if(response && response.status == 200){
                        toast.success("Transaction Removed Succesfully");
                        searchStatementTransactions();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove transaction: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 transaction") 
            }else{
                toast.error("Please Select A Transaction To Remove")
            }
        }
        const removeStatementTransactions = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    deposit: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Statement_Transactions/deleteStatementTransaction',formData)
                    if(response && response.status == 200){
                        toast.success("Transaction(s) Removed Succesfully");
                        searchStatementTransactions();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove transaction(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Transaction To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchStatementTransactions = () =>{
            if(propertySearchID.value || tenantID.value){
                showLoader();
                showNextBtn.value = false;
                showPreviousBtn.value = false;
                let formData = {
                    from_date: from_date_search.value,
                    to_date: to_date_search.value,
                    property: propertySearchID.value,
                    utility: utilitySearchID.value,
                    tenant: tenantID.value,
                    company: companyID.value,
                    page_size: selectedValue.value
                } 
                axios
                .post(`api/v1/tenant-statement-transactions-search/?page=${currentPage.value}`,formData)
                .then((response)=>{
                    transactionsList.value = response.data.results;
                    store.commit('Statement_Transactions/LIST_STATEMENT_TRANSACTIONS', transactionsList.value)
                    propResults.value = response.data;
                    propArrLen.value = transactionsList.value.length;
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
            }
            
        };
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchStatementTransactions(selectedValue.value);
        };
        const resetFilters = () =>{
            transactionsList.value = [];
            store.commit('Statement_Transactions/RESET_SEARCH_FILTERS')
            propertySearchID.value = null;
            tenantID.value = null;
            utilitySearchID.value = null;
            mainComponentKey.value += 1;
            searchStatementTransactions();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchStatementTransactions();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchStatementTransactions();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchStatementTransactions();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchStatementTransactions();
            // scrollToTop();
        }
        const addNewTransaction = () =>{
            updateFormFields();
            store.dispatch("Statement_Transactions/updateState",{selectedTransaction:null, selectedUtility:null, isEditing:false})
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const transactionID = row['statement_transaction_id'];
                let formData = {
                    company: companyID.value,
                    statement_transaction: transactionID
                }
                await store.dispatch('Statement_Transactions/fetchStatementTransaction',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const transactionID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    statement_transaction: transactionID
                }
                await store.dispatch('Statement_Transactions/deleteStatementTransaction',formData).
                then(()=>{
                    searchStatementTransactions();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            // searchStatementTransactions();
            
        })
        return{
            showTotals,title, searchStatementTransactions,resetFilters, addButtonLabel, searchFilters, tableColumns, transactionsList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewTransaction, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveTransaction, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeStatementTransaction, removeStatementTransactions, mainComponentKey, propComponentKey, tntComponentKey,addingRight,rightsModule,
            selectSearchQuantity,selectedValue
        }
    }
};
</script>