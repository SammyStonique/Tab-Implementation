<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        :searchFilters="searchFilters"
        @searchPage="searchJournalEntries"
        @resetFilters="resetFilters"
        @removeItem="removeAllocation"
        @removeSelectedItems="removeAllocations"
        @printList="printList"
        :columns="tableColumns"
        :rows="tableRows"
        :actions="actions"
        :idField="idField"
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

export default{
    name: 'Ledger_Details',
    props: ['scrollToTop','loader','showLoader','hideLoader',],
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const addButtonLabel = ref('');
        const pageComponentKey = ref(0);
        const invComponentKey = ref(0);
        const title = ref('Prepayment Allocation');
        const companyID = computed(()=> store.state.userData.company_id);
        const ledgerID = computed(()=> store.state.Ledgers.ledgerID);
        const prepaymentID = ref("");
        const prepaymentAmount = ref(0);
        const prepaymentAllocError = ref(false);
        const invoiceID = ref('');
        const invoiceDescription = ref('');
        const invoiceDueAmount = ref(0);
        const invoiceArray = computed(() => store.state.Journals.journalArr);
        const idField = 'tenant_prepayment_alloc_id';
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const prepaymentsList = ref([]);
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
        const tableRows = computed(()=> store.state.Ledgers.jnlArray);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date", type: "text", editable: false},
            {label: "Ref No", key:"reference_no", type: "text", editable: false},
            {label: "Txn No", key: "journal_no", type: "text", editable: false},
            {label: "Narration", key: "description", type: "text", editable: false, maxWidth:"700px"},
            {label: "Debit", key: "debit_amount", type: "text", editable: false},
            {label: "Credit", key: "credit_amount", type: "text", editable: false},
            {label: "Balance", key: "running_balance", type: "text", editable: false},
        ]);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Allocation'},
        ])
        const tenant_name_search = computed({
            get: () => store.state.Prepayment_Allocations.tenant_name_search,
            set: (value) => store.commit('Prepayment_Allocations/SET_SEARCH_FILTERS', {"tenant_name_search":value}),
        });
        const tenant_code_search = computed({
            get: () => store.state.Prepayment_Allocations.tenant_code_search,
            set: (value) => store.commit('Prepayment_Allocations/SET_SEARCH_FILTERS', {"tenant_code_search":value}),
        });
        const from_date_search = computed({
            get: () => store.state.Prepayment_Allocations.from_date_search,
            set: (value) => store.commit('Prepayment_Allocations/SET_SEARCH_FILTERS', {"from_date_search":value}),
        });
        const to_date_search = computed({
            get: () => store.state.Prepayment_Allocations.to_date_search,
            set: (value) => store.commit('Prepayment_Allocations/SET_SEARCH_FILTERS', {"to_date_search":value}),
        });
        const fetchInvoices = async(tenantID) =>{
            await store.dispatch('Journals/fetchJournals', {company:companyID.value, customer: tenantID, txn_type: "INV", status: "Open"})
        };
        const handleSelectedInvoice = async(option) =>{
            await store.dispatch('Journals/handleSelectedJournal', option)
            invoiceID.value = store.state.Journals.journalID;
            invoiceDescription.value = store.state.Journals.invoiceDescription;
            invoiceDueAmount.value = store.state.Journals.invoiceDueAmount;
        };
        const clearSelectedInvoice  = async() =>{
            await store.dispatch('Journals/updateState', {journalID: ''});
            invoiceID.value = ""
        }
        const searchFilters = ref([
            {type:'text', placeholder:"Min Amount...", value: tenant_code_search, width:36},
            {type:'text', placeholder:"Max Amount...", value: tenant_name_search, width:36},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const checkPrepaymentLimit = (value) =>{
            if(invoiceDueAmount.value < value){
                toast.error(`Invoice Balance is ${invoiceDueAmount.value}`)
                formFields.value[2].value = 0;
            }
            else if(prepaymentAmount.value < value){
                toast.error(`Cannot Allocate More Than ${prepaymentAmount.value}`)
                formFields.value[2].value = 0;
            }
        }
        const formFields = ref([
            {  
                type:'search-dropdown', label:"Invoice", value: invoiceID.value, componentKey: invComponentKey,
                selectOptions: invoiceArray, optionSelected: handleSelectedInvoice, required: true,
                searchPlaceholder: 'Select Deposit...', dropdownWidth: '450px', updateValue: "",
                fetchData: fetchInvoices(), clearSearch: clearSelectedInvoice() 
            },
            { type: 'date', name: 'date',label: "Date", value: '', required: true },
            { type: 'number', name: 'allocated_amount',label: "Amount", value: 0, required: true, method: checkPrepaymentLimit },
            
        ]);
        const handleReset = () =>{
            for(let i=1; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            invoiceID.value = '';
        }
        
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const allocationID = [row['tenant_prepayment_alloc_id']];
                let formData = {
                    company: companyID.value,
                    tenant_prepayment_allocs: allocationID
                }
                await store.dispatch('Prepayment_Allocations/deleteAllocation',formData)
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
        const searchJournalEntries = () =>{
            showLoader();
            let formData = {
                posting_account: ledgerID.value,
                company: companyID.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
            }
 
            axios
            .post(`api/v1/ledger-journals-entries-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                prepaymentsList.value = response.data.results;
                store.commit('Ledgers/updateState', { jnlArray: response.data.results})
                appResults.value = response.data;
                appArrLen.value = prepaymentsList.value.length;
                appCount.value = appResults.value.count;
                pageCount.value = Math.ceil(appCount.value / 10000);
                
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
            store.commit('Prepayment_Allocations/RESET_SEARCH_FILTERS')
            searchJournalEntries();
        }
        const closeModal = () =>{
            appModalVisible.value = false;
            invoiceID.value = "";
            store.dispatch('Journals/updateState',{journalID:''})
        }
        onMounted(() =>{
            searchJournalEntries();
        })
        return{
            title, searchJournalEntries, idField, selectedIds, actions, tableRows, appArrLen,appCount,appResults,appModalVisible,formFields,
            addButtonLabel, searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,
            showNextBtn,showPreviousBtn, handleActionClick,displayButtons,handleReset,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            closeModal, handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage
        }
    }
}
</script>
