<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[700px]">
                <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Ledger Details</h1>
                <div class="tabs pt-2">
                    <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                        {{ tab }}
                    </button>
                </div>
                <div class="tab-content mt-3">
                    <div v-if="activeTab == 0">
                        <div class="flex">
                            <div class="basis-1/2 border-left border-gray-400">
                                <h1 class="font-bold mb-10">Ledger Details</h1>
                                <table class="w-full">
                                    <tr class="text-left">
                                        <td class="font-bold ">Ledger Code:</td>
                                        <td> {{ ledgerDetails.ledger_code }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold">Ledger Name:</td>
                                        <td class="font-bold text-green-500 uppercase">{{ ledgerDetails.ledger_name }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Ledger Type:</td>
                                        <td>{{ ledgerDetails.ledger_type }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Ledger Category:</td>
                                        <td>{{ ledgerDetails.ledger_category }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Financial Statement:</td>
                                        <td>{{ ledgerDetails.financial_statement }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Running Balance:</td>
                                        <td class="font-bold text-red-500">{{ Number(ledgerRunningBalance).toLocaleString() }}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div v-if="activeTab == 1">
                        <div class="relative w-[99%] bg-white z-50">
                            <FilterBar 
                                :showAddButton="showAddButton"
                                :filters="searchFilters" 
                                @search="searchJournalEntries"
                                @reset="resetFilters"
                                @printList="printList"
                                @printExcel="printExcel"
                                @printCSV="printCSV"
                                :dropdownOptions="dropdownOptions"
                                @handleDynamicOption="handleDynamicOption"
                            />
                        </div>
                        <div class="table w-[99%] top-[17.1rem] z-30">
                            <DynamicTable :key="statementTableKey" :columns="statementColumns" :rows="statementRows" :idField="idField" :showActions="showActions" :actions="actionsStatement" 
                            @selection-changed="handleSelectionChange" @row-db-click="handleShowDetails" @right-click="handleRightClick"/>
                        </div>
                    </div>             
                </div>
                <div class="fixed w-[95%] z-30 bottom-5 pb-2 bg-white">
                    <ShowDetails v-model:visible="showDetails" :detailsTitle="detailsTitle" @hideDetails="hideDetails">
                        <template v-slot:detailSlot>
                            <div>
                            <div class="tabs pt-2">
                                <button v-for="(tab, index) in tabs1" :key="tab" :class="['tab', { active: activeTab1 === index }]"@click="selectTab1(index)">
                                    {{ tab }}
                                </button>
                            </div>
                            <div class="tab-content mt-3">
                                <div v-if="activeTab1 == 0">
                                    <JournalEntries 
                                        :detailRows="journalEntries"
                                    />
                                </div>
                            </div>
                            
                        </div>
                        </template>
                    </ShowDetails>
                </div>
            </div>

        </template>
    </PageStyleComponent>
    <MovableModal v-model:visible="appModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
    >
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="moveTransaction" @handleReset="handleReset"
        />
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted,watch } from 'vue';
import { useStore } from "vuex";
import PageStyleComponent from "../PageStyleComponent.vue";
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import DynamicTable from '@/components/DynamicTable.vue';
import FilterBar from "@/components/FilterBar.vue";
import ShowDetails from '@/components/ShowDetails.vue';
import JournalEntries from "@/components/JournalEntries.vue";
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';

export default{
    name: 'Ledger_Details',
    components:{
        PageStyleComponent,MovableModal,DynamicForm,DynamicTable,FilterBar,ShowDetails,JournalEntries
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const activeTab = ref(0);
        const pageComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const title = ref('Move Transaction');
        const detailsTitle = ref('Item Details');
        const tabs1 = ref(['Journal Entries']);
        const activeTab1 = ref(0);
        const invoiceID = ref(null);
        const journalEntries = ref([]);
        const showDetails = ref(false);
        const companyID = computed(()=> store.state.userData.company_id);
        const ledgerID = computed(()=> store.state.Ledgers.ledgerID);
        const ledgerToID = ref("");
        const jnlEntryID = ref("");
        const ledgerArr = computed(() => store.state.Ledgers.ledgerArr);
        const ledgerDetails = computed(()=> store.state.Ledgers.ledgerDetails);
        const ledgerRunningBalance = computed(()=> store.state.Ledgers.ledgerRunningBalance);
        const tabs = ref(['Ledger Details','Ledger Statement']);
        const idField = 'journal_entry_id';
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
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
        const showAddButton = ref(false);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('35vw');
        const showActions = ref(false);
        const statementRows = computed(()=> store.state.Ledgers.jnlArray);
        const statementColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date", type: "text", editable: false},
            {label: "Ref No", key:"reference_no", type: "text", editable: false},
            {label: "Txn No", key: "journal_no", type: "text", editable: false},
            {label: "Narration", key: "description", type: "text", editable: false, maxWidth:"700px"},
            {label: "Debit", key: "formatted_debit_amount", type: "text", editable: false},
            {label: "Credit", key: "formatted_credit_amount", type: "text", editable: false},
            {label: "Balance", key: "running_balance", type: "text", editable: false},
        ]);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Allocation'},
        ])
        const min_amount_search = ref("");
        const max_amount_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Min Amount...", value: min_amount_search, width:36},
            {type:'text', placeholder:"Max Amount...", value: max_amount_search, width:36},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const selectTab = async(index) => {
            showLoader();
            let formData1 = {
                posting_account: ledgerDetails.value.ledger_id,
                company: companyID.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                min_amount: min_amount_search.value == "" ? 0 : min_amount_search.value,
                max_amount: max_amount_search.value == "" ? 0 : max_amount_search.value,
            }
            if(index == 1){
                if(ledgerDetails.value.ledger_type == "Cashbook"){
                    dropdownOptions.value[1].hidden = false;
                }
                activeTab.value = index;
                await store.dispatch('Ledgers/fetchClientJournals',formData1)
                .then(()=>{
                    hideLoader();
                })

            }else{
                activeTab.value = index;
                hideLoader();
            }

        };
        watch([ledgerRunningBalance], () => {
            if (ledgerRunningBalance.value) {
                pageComponentKey.value += 1;
            }
            
        }, { immediate: true });
        const fetchLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            ledgerToID.value = store.state.Ledgers.ledgerID;
        };
        const clearSelectedLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            ledgerToID.value = ""
        };
        const formFields = ref([
            {  
                type:'search-dropdown', label:"Ledger", value: ledgerToID.value, componentKey: ledComponentKey,
                selectOptions: ledgerArr, optionSelected: handleSelectedLedger, required: true,
                searchPlaceholder: 'Select Ledger...', dropdownWidth: '550px', updateValue: "",
                fetchData: fetchLedgers(), clearSearch: clearSelectedLedger
            },
         ]);
        const handleReset = () =>{
            ledgerToID.value = "";
            ledComponentKey.value += 1;
            jnlEntryID.value = "";
        }
        const moveTransaction = async() =>{
            if(ledgerToID.value != ""){
                showModalLoader();
                let formData = {
                    company: companyID.value,
                    journal_entry: jnlEntryID.value,
                    ledger: ledgerToID.value
                }
                try {
                    const response = await store.dispatch('Journals/moveJournalEntry',formData)
                    if (response && response.data.msg === "Success") {
                        hideModalLoader();
                        toast.success("Success!");
                        handleReset();
                        searchJournalEntries();
                    } else {
                        toast.error('An error occurred while moving Transaction.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to move Transaction: ' + error.message);
                } finally {
                    hideModalLoader();
                }              
            }
            else{
                toast.error('No Ledger Selected')
            }
        };
        
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const journalID = [row['journal_id']];
                let formData = {
                    company: companyID.value,
                    journal: journalID
                }
                await store.dispatch('Journals/deleteJournal',formData)
                searchJournalEntries();     
            }else if(action == 'move-transaction'){
                jnlEntryID.value = [row['journal_entry_id']];

                appModalVisible.value = true;
                flex_basis.value = "1/2";
                flex_basis_percentage.value = '50';
                
                searchJournalEntries();     
            }
        } 
        const dropdownOptions = ref([
            {label: 'Move Transactions', action: 'move-transaction', icon: 'fa-arrows-alt', colorClass:'text-green-600', rightName: "Moving Ledger Transactions"},
            {label: 'Reconcile', action: 'reconcile', icon: 'fa-balance-scale', colorClass:'text-blue-600', rightName: "Accounts Reconciliation", hidden: true},
        ]);
        const handleDynamicOption = async(option) =>{
            if( option == 'move-transaction'){
                jnlEntryID.value = selectedIds.value;
                appModalVisible.value = true;
                flex_basis.value = "1/2";
                flex_basis_percentage.value = '50';
            }else if(option == 'reconcile'){
                await store.dispatch('Ledgers/updateState',{reconciliationLedgerID: ledgerDetails.value.ledger_id, reconciliationLedgerName: ledgerDetails.value.ledger_name, cashbookArray: [], cbkArray:[], cbkRunningBalance:0, bnkArray:[], cbkDebitTotal: 0, cbkCreditTotal: 0, cbkDebitCount: 0, cbkCreditCount: 0});
                store.commit('pageTab/ADD_PAGE', {'FA':'Bank_Reconciliation'});
                store.state.pageTab.faActiveTab = 'Bank_Reconciliation'; 
            }
        };
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
        const searchJournalEntries = async() =>{
            showLoader();
            selectedIds.value = [];
            let formData = {
                posting_account: ledgerDetails.value.ledger_id,
                company: companyID.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                min_amount: min_amount_search.value == "" ? 0 : min_amount_search.value,
                max_amount: max_amount_search.value == "" ? 0 : max_amount_search.value,
            }
            try{
                const response = await store.dispatch('Ledgers/fetchClientJournals', formData)
            }
            catch(error){

            }finally{
                hideLoader();
            }
            
            
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchJournalEntries();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchJournalEntries();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchJournalEntries();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchJournalEntries();
        }
        const resetFilters = () =>{
            min_amount_search.value = "";
            max_amount_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            searchJournalEntries();
        }
        const closeModal = () =>{
            appModalVisible.value = false;
            store.dispatch('Journals/updateState',{journalID:''})
        };
        const handleShowDetails = async(row) =>{
            activeTab1.value = 0;
            invoiceID.value = row['journal_id'];
            detailsTitle.value = row['journal_no'] + ' Details';
            showDetails.value = true;
            let formData = {
                journal: row['journal_id'],
                company: companyID.value
            }
            axios.post('api/v1/journal-entries-search/',formData)
            .then((response)=>{
                journalEntries.value = response.data.journal_entries;
            })
            .catch((error)=>{
                console.log(error.message)
            })
        };
        const selectTab1 = async(index) => {
            let formData = {
                company: companyID.value,
                journal: invoiceID.value,
            }
                activeTab1.value = index;
                hideLoader();
        };
        const hideDetails = async() =>{
            showDetails.value = false;
        };
  
        watch(() => store.state.contextMenu.selectedAction, (actionPayload) => {
            if (!actionPayload) return;

            const { rowIndex, action, data } = actionPayload;

            handleActionClick(rowIndex, action, data);

            store.commit('contextMenu/CLEAR_SELECTED_ACTION');
        });
        const handleRightClick = (row, rowIndex, event) => {

            const menuOptions = [
                { label: 'Move Transaction', action: 'move-transaction', rowIndex: rowIndex , icon: 'fa fa-arrows-alt', rightName: 'Moving Ledger Transactions'},
            ];

            store.commit('contextMenu/SHOW_CONTEXT_MENU', {
                x: event.clientX,
                y: event.clientY,
                options: menuOptions,
                contextData: row,
            });
        };
        const printExcel = () =>{
            showLoader();
            let formData = {
                posting_account: ledgerDetails.value.ledger_id,
                company: companyID.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                min_amount: min_amount_search.value == "" ? 0 : min_amount_search.value,
                max_amount: max_amount_search.value == "" ? 0 : max_amount_search.value,
            } 

            axios
            .post("api/v1/export-ledger-transactions-excel/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Ledger Transactions.xls');
                        document.body.appendChild(link);
                        link.click();
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
            
        })
        return{
            tabs,title, searchJournalEntries, idField, selectedIds, actions, statementRows, appArrLen,appCount,appResults,appModalVisible,formFields,
            showAddButton, searchFilters,statementColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,
            showNextBtn,showPreviousBtn, handleActionClick,displayButtons,handleReset,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            closeModal, handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage, ledgerDetails,ledgerRunningBalance,
            selectTab, activeTab,showActions,showDetails,detailsTitle,hideDetails,handleShowDetails,journalEntries,tabs1,selectTab1,activeTab1,
            handleRightClick,moveTransaction,dropdownOptions,handleDynamicOption,printExcel
        }
    }
}
</script>

<style scoped>
.tabs {
    display: flex;
    border-bottom: 1px solid #ccc;
}
.tab {
    padding: 2px 20px 2px 20px;
    cursor: pointer;
}

.tab.active {
    border-bottom: 2px solid #000;
}

.tab-content {
    padding: 1px;
}

.table{
    min-height: 15vh;
    max-height: 15vh;
    overflow-y: scroll;
    overflow-x: scroll;
}

</style>
