<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        :showAddButton="showAddButton"
        :searchFilters="searchFilters"
        :dropdownOptions="dropdownOptions"
        @handleDynamicOption="handleDynamicOption"
        @searchPage="searchReconcilingItems"
        @resetFilters="resetFilters"
        @removeItem="removeAllocation"
        @removeSelectedItems="removeAllocations"
        @printList="printLoansList"
        v-model:printModalVisible="printModalVisible"
        :printTitle="printTitle"
        :pdfUrl="pdfUrl"
        :columns="tableColumns"
        :rows="interestList"
        :actions="actions"
        :showActions="showActions"
        :rightsModule="rightsModule"
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
        :groupingKey=true
    />
    <MovableModal v-model:visible="appModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
    >
        <div class="px-3 min-h-[50px] min-w-[300px] w-600px pt-12">
            <DynamicTable :key="tableKey" :columns="journalColumns" :rows="journalRows" :showActions="txnActions" :idField="jnlIdField" @selection-changed="handleSelectedJnlId"/>
        </div>
            <button @click="matchTransactions" class="rounded bg-green-400 cursor-pointer text-sm mr-2  text-white px-2 py-1"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Match</button>
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted,watch } from 'vue';
import { useStore } from "vuex";
import PageComponent from "../PageComponent.vue";
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import DynamicTable from '../DynamicTable.vue';
import { useToast } from "vue-toastification";
import Swal from 'sweetalert2';
import PrintJS from 'print-js';

export default{
    name: 'Reconciling_Items',
    components:{
        PageComponent,MovableModal,DynamicForm,DynamicTable
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const pageComponentKey = ref(0);
        const propComponentKey = ref(0);
        const riskComponentKey = ref(0);
        const showAddButton = ref(false);
        const title = ref('Match Transactions');
        const companyID = computed(()=> store.state.userData.company_id);
        const ledgerID = computed(()=> store.state.Ledgers.reconciliationLedgerID);
        const idField = 'reconciling_item_id';
        const jnlIdField = 'journal_entry_id';
        const rightsModule = ref('FA');
        const productID = ref('');
        const riskID = ref('');
        const selectedIds = ref([]);
        const selectedJnlIds = ref([]);
        const appModalVisible = ref(false);
        const printModalVisible = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Reconciling Items List');
        const interestList = ref([]);
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
        const itemID = ref('');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('60vw');
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date",type: "text"},
            {label: "Category", key:"category",type: "text"},
            {label: "Ref No", key:"reference_no",type: "text"},
            {label: "Description", key: "description", type: "text"},
            {label: "Amount", key: "formatted_amount", type: "number"},
            {label: "Reconciled?", key: "is_reconciled", type: "text"},
            {label: "Journal", key:"journal_no",type: "text"},
        ])
        const showTotals = ref(true);
        const showActions = ref(true);
        const txnActions = ref(false);
        const actions = ref([
            {name: 'find-transaction', icon: 'fa fa-search-plus', title: 'Find Txns', rightName: 'Accounts Reconciliation'},
            {name: 'match-transaction', icon: 'fa fa-link', title: 'Match Txns', rightName: 'Accounts Reconciliation'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Recon Item', rightName: 'Deleting Accounts Reconciliation'},
        ])
        const reconciled_search = ref("");
        const description_search = ref("");
        const category_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {type:'dropdown', placeholder:"Category...", value: category_search, width:32, options: [{text:'Deposit',value:'Deposit'},{text:'Withdrawal',value:'Withdrawal'}]},
            {type:'text', placeholder:"Description...", value: description_search, width:48},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:32, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:32, title: "Date To Search"},
            {type:'dropdown', placeholder:"Reconciled...", value: reconciled_search, width:32, options: [{text:'Yes',value:'Yes'},{text:'No',value:'No'}]},
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedJnlId = (ids) => {
            selectedJnlIds.value = ids;
        };
        const journalRows = computed(() => store.state.Ledgers.matchReconItemsArray);
        const journalColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date",type: "text"},
            {label: "Txn No", key:"journal_no",type: "text"},
            {label: "Ref No", key:"reference_no",type: "text"},
            {label: "Description", key: "description", type: "text"},
            {label: "Amount", key: "formatted_amount", type: "number"},
        ])
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'find-transaction'){
                if(row['is_reconciled'] == "Yes"){
                    toast.error("Item Already Reconciled");
                    return;
                };
                showLoader();
                const itemID = [row[idField]];
                
                let formData = {
                    company: companyID.value,
                    reconciling_item: itemID
                }
                const response = await store.dispatch('Ledgers/findMatchingReconcilingItems',formData)
                if(response.data.msg == "Success"){
                    Swal.fire(`${response.data.matched}`);
                }else{
                    Swal.fire("Failed to Match Reconciling Item");
                }
                searchReconcilingItems();
                hideLoader();
                
            }else if(action == 'match-transaction'){
                if(row['is_reconciled'] == "Yes"){
                    toast.error("Item Already Reconciled");
                    return;
                };
                itemID.value = row[idField];
                appModalVisible.value = true;
                const response = await store.dispatch('Ledgers/loadMatchingReconcilingItems', {company: companyID.value, reconciling_item: [row[idField]]});
                await store.dispatch('Ledgers/updateState', {matchReconItemsArray: response.data.transactions});
                
            }
            else if(action == 'delete'){
                const itemID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    reconciling_item: itemID
                }
                await store.dispatch('Ledgers/deleteReconcilingItem',formData).
                then(()=>{
                    searchReconcilingItems();
                })
            }
        
        };
        const matchTransactions = () =>{
            if(journalRows.value.length == 0){
                toast.error("No Transactions to Match");
                return;
            }
            if(selectedJnlIds.value.length == 0){
                toast.error("Select Transactions to Match");
                return;
            }
            showModalLoader();
            let formData = {
                company: companyID.value,
                reconciling_item: itemID.value,
                journals: selectedJnlIds.value
            }
            store.dispatch('Ledgers/matchReconcilingItems',formData).
            then((response)=>{
                if(response.data.msg == "Success"){
                    toast.success("Transactions Matched Successfully");
                    appModalVisible.value = false;
                    selectedJnlIds.value = [];
                    store.dispatch('Ledgers/updateState', {matchReconItemsArray: []});
                    searchReconcilingItems();
                }else{
                    toast.error("Failed to Match Transactions");
                }
            })
            .catch((error)=>{
                console.log(error);
                toast.error("An error occurred while matching transactions");
            })
            .finally(()=>{
                hideModalLoader();
                itemID.value = '';
            })
        }
        const dropdownOptions = ref([
            {label: 'Match Transactions', action: 'match-transaction', icon: 'fa-search', colorClass:'text-green-600', rightName: "Accounts Reconciliation"},

        ]);
        const handleDynamicOption = async(option) =>{

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
        const searchReconcilingItems = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                category: category_search.value,
                description: description_search.value,
                reconciled: reconciled_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                ledger: ledgerID.value,
                company: companyID.value,
                page_size: selectedValue.value
            }
 
            axios
            .post(`api/v1/reconciling-items-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                interestList.value = response.data.results;
                appResults.value = response.data;
                appArrLen.value = interestList.value.length;
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
            searchReconcilingItems(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchReconcilingItems();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchReconcilingItems();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchReconcilingItems();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchReconcilingItems();
        }
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            description_search.value = "";
            category_search.value = "";
            reconciled_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            searchReconcilingItems();
        };
        const printLoansList = () =>{
            showLoader();
            let formData = {
                category: category_search.value,
                description: description_search.value,
                reconciled: reconciled_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                product: productID.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 

            axios
            .post("api/v1/export-loan-guarantor-interests-pdf/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const blob1 = new Blob([response.data], { type: 'application/pdf' });
                        const url = URL.createObjectURL(blob1);
                        // PrintJS({printable: url, type: 'pdf'});
                        pdfUrl.value = url;
                        printModalVisible.value = true;
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
            searchReconcilingItems();
        })
        return{
            showAddButton,showActions,txnActions,title, searchReconcilingItems, idField,jnlIdField,selectedJnlIds, selectedIds, actions, interestList, appArrLen,appCount,appResults,appModalVisible,
            currentPage,searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,dropdownOptions,handleDynamicOption,
            showNextBtn,showPreviousBtn, handleActionClick,displayButtons,printModalVisible,pdfUrl, printTitle,journalColumns,journalRows,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,rightsModule,
            handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,showTotals,printLoansList,selectSearchQuantity,selectedValue,
            handleSelectedJnlId,matchTransactions
        }
    }
}
</script>
