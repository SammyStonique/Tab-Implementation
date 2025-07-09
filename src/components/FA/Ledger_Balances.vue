<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewBalance"
            :searchFilters="searchFilters"
            @searchPage="searchLedgerBalances"
            @resetFilters="resetFilters"
            @removeItem="removeBalance"
            @removeSelectedItems="removeBalances"
            @printList="printList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="balancesList"
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
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="saveLedgerBalance" @handleReset="handleReset"
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
    name: 'Ledger_Balances',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'ledger_balance_id';
        const addButtonLabel = ref('New Balance');
        const addingRight = ref('Adding Ledger Balances');
        const removingRight = ref('Deleting Ledger Balances');
        const rightsModule = ref('Accounts');
        const title = ref('Ledger Balance Details');
        const submitButtonLabel = ref('Add');
        const ledComponentKey = ref(0);
        const selectedIds = ref([]);
        const balancesList = ref([]);
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
        const isEditing = computed(()=> store.state.Ledger_Balances.isEditing);
        const selectedBalance = computed(()=> store.state.Ledger_Balances.selectedBalance);
        const selectedLedger = computed(()=> store.state.Ledger_Balances.selectedLedger);
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Posting Account", key:"posting_account"},
            {label: "Debit", key:"debit_amount"},
            {label: "Credit", key:"credit_amount"},
        ])
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Balance', rightName: 'Deleting Ledger Balances'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:60,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option);
            ledgerID.value = store.state.Ledgers.ledgerID;
            if(selectedBalance.value){
                selectedBalance.value.posting_account.ledger_id = ledgerID.value;
                ledgerValue.value = ledgerID.value
            }
        }
        const formFields = ref([]);
        const ledgerValue = computed(() => {
           return (selectedBalance.value && selectedBalance.value.posting_account && !ledgerID.value) ? selectedBalance.value.posting_account.ledger_id : ledgerID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                { type: 'date', name: 'date',label: "Effective Date", value: selectedBalance.value?.date || '', placeholder: "", required: true},
                {  
                    type:'search-dropdown', label:"Posting Account", value: ledgerValue.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Posting Account...', dropdownWidth: '500px', updateValue: selectedLedger.value,
                    fetchData: store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
                },
                { type: 'number', name: 'debit_amount',label: "Debit Amount", value: selectedBalance.value?.debit_amount || 0, required: false },
                { type: 'number', name: 'credit_amount',label: "Credit Amount", value: selectedBalance.value?.credit_amount || 0, required: false },
                
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            ledgerID.value = '';
            formFields.value[2].value = 0;
            formFields.value[3].value = 0;
        }

        watch([selectedBalance, selectedLedger], () => {
            if (selectedBalance.value && selectedLedger.value) {
                ledComponentKey.value += 1;
                updateFormFields();
            }else{
                updateFormFields();
            }
            
        }, { immediate: true });
        
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
                        handleReset();
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Balance.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Balance: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchLedgerBalances();
                }
            }
        }

        const removeBalance = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    ledger_balance: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Ledger_Balances/deleteLedgerBalance',formData)
                    if(response && response.status == 200){
                        toast.success("Balance Removed Succesfully");
                        searchLedgerBalances();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Balance: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
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
                    ledger_balance: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Ledger_Balances/deleteLedgerBalance',formData)
                    if(response && response.status == 200){
                        toast.success("Balance(s) Removed Succesfully");
                        searchLedgerBalances();
                    }
                }
                catch(error){
                    toast.error('Failed to remove Balance: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Balance To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchLedgerBalances = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                name: name_search.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/ledger-balances-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                balancesList.value = response.data.results;
                store.commit('Ledger_Balances/LIST_LEDGER_BALANCES', balancesList.value)
                propResults.value = response.data;
                propArrLen.value = balancesList.value.length;
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
            searchLedgerBalances(selectedValue.value);
        };
        const resetFilters = () =>{
            selectedValue.value = 50;
            currentPage.value = 1;
            name_search.value = "";
            searchLedgerBalances();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchLedgerBalances();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchLedgerBalances();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchLedgerBalances();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchLedgerBalances();
            // scrollToTop();
        }
        const addNewBalance = () =>{
            store.dispatch("Ledger_Balances/updateState",{selectedBalance:null, selectedLedger:null, isEditing:false})
            ledgerID.value = "";
            ledComponentKey.value += 1;
            propModalVisible.value = true;
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const balanceID = row[idField];
                let formData = {
                    company: companyID.value,
                    ledger_balance: balanceID
                }
                await store.dispatch('Ledger_Balances/fetchLedgerBalance',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';

            }else if(action == 'delete'){
                const balanceID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    ledger_balance: balanceID
                }
                await store.dispatch('Ledger_Balances/deleteLedgerBalance',formData).
                then(()=>{
                    searchLedgerBalances();
                })
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
            handleReset();
        };
        
        onBeforeMount(()=>{
            searchLedgerBalances();
            
        })
        return{
            title, searchLedgerBalances,resetFilters, addButtonLabel, searchFilters, tableColumns, balancesList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,selectSearchQuantity,selectedValue,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewBalance, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveLedgerBalance, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeBalance, removeBalances,addingRight,removingRight,rightsModule,
        }
    }
};
</script>