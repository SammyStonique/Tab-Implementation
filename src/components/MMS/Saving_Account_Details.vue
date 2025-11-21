<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[700px]">
                <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Saving Account Details</h1>
                <div class="tabs pt-2">
                    <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                        {{ tab }}
                    </button>
                </div>
                <div class="tab-content mt-3">
                    <div v-if="activeTab == 0">
                        <div class="flex">
                            <div class="basis-1/2 border-left border-gray-400">
                                <h1 class="font-bold mb-10">Account Details</h1>
                                <table class="w-full">
                                    <tr class="text-left">
                                        <td class="font-bold ">Account Number:</td>
                                        <td> {{ ledgerDetails.ledger_code }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold">Member Name:</td>
                                        <td class="font-bold text-green-500 uppercase">{{ ledgerDetails.ledger_name }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Category:</td>
                                        <td>{{ ledgerDetails.ledger_category }}</td>
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
                            />
                        </div>
                        <div class="table w-[99%] top-[17.1rem] z-30">
                            <DynamicTable :key="statementTableKey" :columns="statementColumns" :rows="statementRows" :idField="idFieldStatement" :showActions="showActions" :actions="actionsStatement"/>
                        </div>
                    </div>             
                </div>
            </div>
        </template>
    </PageStyleComponent>
    <MovableModal v-model:visible="appModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
    >
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="" @handleReset="handleReset"
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
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';

export default{
    name: 'Saving_Account_Details',
    components:{
        PageStyleComponent,MovableModal,DynamicForm,DynamicTable,FilterBar
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const activeTab = ref(0);
        const pageComponentKey = ref(0);
        const invComponentKey = ref(0);
        const title = ref('Move Transaction');
        const companyID = computed(()=> store.state.userData.company_id);
        const ledgerID = computed(()=> store.state.Ledgers.ledgerID);
        const ledgerDetails = computed(()=> store.state.Ledgers.ledgerDetails);
        const ledgerRunningBalance = computed(()=> store.state.Ledgers.ledgerRunningBalance);
        const tabs = ref(['Account Details','Account Statement']);
        const idField = 'journal_id';
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
            {label: "Date", key:"date", type: "text"},
            {label: "Ref No", key:"reference_no", type: "text"},
            {label: "Txn No", key: "journal_no", type: "text"},
            {label: "Narration", key: "description", type: "text", maxWidth:"700px"},
            {label: "Debit", key: "formatted_debit_amount", type: "text"},
            {label: "Credit", key: "formatted_credit_amount", type: "text"},
            {label: "Balance", key: "running_balance", type: "text"},
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

        const formFields = ref([]);
        const handleReset = () =>{
            for(let i=1; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }
        
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const journalID = [row['journal_id']];
                let formData = {
                    company: companyID.value,
                    journal: journalID
                }
                await store.dispatch('Journals/deleteJournal',formData)
                searchJournalEntries();     
            }
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
        const searchJournalEntries = async() =>{
            showLoader();
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
        }
        onMounted(() =>{
            
        })
        return{
            tabs,title, searchJournalEntries, idField, selectedIds, actions, statementRows, appArrLen,appCount,appResults,appModalVisible,formFields,
            showAddButton, searchFilters,statementColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,
            showNextBtn,showPreviousBtn, handleActionClick,displayButtons,handleReset,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            closeModal, handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage, ledgerDetails,ledgerRunningBalance,
            selectTab, activeTab,showActions
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
