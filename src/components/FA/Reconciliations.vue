<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            :showAddButton="showAddButton"
            :searchFilters="searchFilters"
            @searchPage="searchReconciliations"
            @resetFilters="resetFilters"
            @removeItem="removeReconciliation"
            @removeSelectedItems="removeReconciliations"
            @printList="printList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="reconList"
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
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Reconciliations',
    components:{
        PageComponent,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'bank_reconciliation_id';
        const addButtonLabel = ref('New Reconciliation');
        const showAddButton = ref(false);
        const addingRight = ref('Accounts Reconciliation');
        const removingRight = ref('Deleting Accounts Reconciliation');
        const rightsModule = ref('Accounts');
        const title = ref('Accounts Reconciliation');
        const submitButtonLabel = ref('Add');
        const ledComponentKey = ref(0);
        const selectedIds = ref([]);
        const reconList = ref([]);
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
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const ledgerID = ref('');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Cashbook", key:"cashbook"},
            {label: "Statement Bal.", key:"statement_balance"},
            {label: "Cashbook Bal.", key:"cashbook_balance"},
            {label: "Variance", key:"variance"},
            {label: "Status", key:"status", textColor:"textColor"},
            {label: "Done By", key:"done_by"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Reconciliation', rightName: 'Accounts Reconciliation'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Balance', rightName: 'Deleting Accounts Reconciliation'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = ref('');
        const status_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Cashbook...", value: name_search, width:60,},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:32, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:32, title: "Date To Search"},
            {
                type:'dropdown', placeholder:"Status..", value: status_search, width:36,
                options: [{text:'Complete',value:'Complete'},{text:'Incomplete',value:'Incomplete'}]
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const saveLedgerBalance = async() =>{
            showModalLoader();
            let formData = {
                date: formFields.value[0].value,
                debit_amount: formFields.value[2].value || 0,
                credit_amount: formFields.value[3].value || 0,
                posting_account: ledgerID.value,
                posting_account_id: ledgerID.value,
                journal: null,
                journal_id: null,
                company: companyID.value
            }

            errors.value = [];
            for(let i=0; i < (formFields.value.length); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != "search-dropdown"){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(ledgerValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                if(formFields.value[2].value == 0 && formFields.value[3].value == 0){
                    toast.error('Debit and Credit Amounts cannot be both 0');
                    hideModalLoader();
                    return;
                }else if(formFields.value[2].value > 0 && formFields.value[3].value > 0){
                    toast.error('Invalid Amounts');
                    hideModalLoader();
                    return;
                }
                try {
                    const response = await store.dispatch('Ledger_Balances/createLedgerBalance', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Success!');
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Balance.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Balance: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchReconciliations();
                }
            }
        }

        const removeReconciliation = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    bank_reconciliation: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Ledgers/deleteBankReconciliation',formData)
                    if(response && response.status == 200){
                        toast.success("Reconciliation Removed Succesfully");
                        searchReconciliations();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Reconciliation: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Reconciliation") 
            }else{
                toast.error("Please Select A Reconciliation To Remove")
            }
        }
        const removeReconciliations = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    bank_reconciliation: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Ledgers/deleteBankReconciliation',formData)
                    if(response && response.status == 200){
                        toast.success("Reconciliation(s) Removed Succesfully");
                        searchReconciliations();
                    }
                }
                catch(error){
                    toast.error('Failed to remove Reconciliation: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Reconciliation To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchReconciliations = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                ledger_name: name_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                status: status_search.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/bank-reconciliations-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                reconList.value = response.data.results;
                propResults.value = response.data;
                propArrLen.value = reconList.value.length;
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
            searchReconciliations(selectedValue.value);
        };
        const resetFilters = () =>{
            selectedValue.value = 50;
            currentPage.value = 1;
            name_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            status_search.value = "";
            searchReconciliations();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchReconciliations();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchReconciliations();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchReconciliations();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchReconciliations();
            // scrollToTop();
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const balanceID = row[idField];
                const reconStatus = row.status;
                if(reconStatus == 'Complete'){
                    toast.error("Cannot Edit Completed Reconciliation");
                    return;
                }
                let formData = {
                    company: companyID.value,
                    bank_reconciliation: balanceID
                }
                await store.dispatch('Ledgers/fetchBankReconciliation',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';

            }else if(action == 'delete'){
                const balanceID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    bank_reconciliation: balanceID
                }
                await store.dispatch('Ledgers/deleteBankReconciliation',formData).
                then(()=>{
                    searchReconciliations();
                })
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        
        onBeforeMount(()=>{
            searchReconciliations();
            
        })
        return{
            showAddButton,title, searchReconciliations,resetFilters, addButtonLabel, searchFilters, tableColumns, reconList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,selectSearchQuantity,selectedValue,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveLedgerBalance, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeReconciliation, removeReconciliations,addingRight,removingRight,rightsModule,
        }
    }
};
</script>