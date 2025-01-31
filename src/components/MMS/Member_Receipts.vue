<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewReceipt"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchReceipts"
            @resetFilters="resetFilters"
            @removeItem="removeReceipt"
            @removeSelectedItems="removeReceipts"
            @printList="printReceiptsList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="receiptsList"
            :actions="actions"
            :showTotals="showTotals"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            @handleShowDetails="handleShowDetails"
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
            :showDetails="showDetails"
            :detailsTitle="detailsTitle"
            @hideDetails="hideDetails"
            >
            <div>
                <div class="tabs pt-2">
                    <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                        {{ tab }}
                    </button>
                </div>
                <div class="tab-content mt-3">
                    <div v-if="activeTab == 0">
                        <JournalEntries 
                            :detailRows="journalEntries"
                        />
                    </div>
                    <div v-if="activeTab == 1">
                        <ReceiptLines 
                            :rcptLinesRows="receiptLines"
                        />
                    </div>
                </div>
                
            </div>
        </PageComponent>
        <MovableModal v-model:visible="invModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
        >
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="saveReceipt" @handleReset="handleReset"
            />
        </MovableModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue';
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import JournalEntries from "@/components/JournalEntries.vue";
import ReceiptLines from "@/components/ReceiptLines.vue";
import PrintJS from 'print-js';

export default{
    name: 'Member_Receipts',
    components:{
        PageComponent, MovableModal,DynamicForm,JournalEntries,ReceiptLines,
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const { getYear } = useDateFormatter();
        const { getMonth } = useDateFormatter();
        const addingRight = ref('Adding Member Receipt');
        const rightsModule = ref('MMS');
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'journal_id';
        const addButtonLabel = ref('New Receipt');
        const submitButtonLabel = ref('Add');
        const title = ref('Receipt Booking');
        const detailsTitle = ref('Item Details');
        const tabs = ref(['Journal Entries','Receipt Lines']);
        const activeTab = ref(0);
        const invoiceID = ref(null);
        const custComponentKey = ref(0);
        const invModalVisible = ref(false);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const selectedIds = ref([]);
        const receiptsList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const showDetails = ref(false);
        const journalEntries = ref([]);
        const receiptLines = ref([]);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const customerID = ref('');
        const customerArray = computed(() => store.state.Customers.customerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Receipt#", key:"journal_no"},
            {label: "Date", key: "date"},
            {label: "Bank. Date", key: "banking_date"},
            {label: "Member Name", key:"member_name"},
            {label: "Cashbook", key:"cashbook"},
            {label: "Pay. Method", key:"payment_method"},
            {label: "Ref No", key:"reference_no"},
            {label: "Amount", key:"total_amount", type:"number"},
            {label: "Done By", key:"done_by"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'print', icon: 'fa fa-print', title: 'Print Receipt', rightName: 'Print Member Receipt'},
            {name: 'download', icon: 'fa fa-download', title: 'Download Receipt', rightName: 'Print Member Receipt'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Receipt', rightName: 'Deleting Member Receipt'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const fetchCustomers = async() =>{
            await store.dispatch('Customers/fetchCustomers', {company:companyID.value})
        };
        const handleSearchCustomers = async(option) =>{
            await store.dispatch('Customers/handleSelectedCustomer', option)
            customerID.value = store.state.Customers.customerID;
        };
        const clearSearchCustomer = async() =>{
            await store.dispatch('Customers/updateState', {customerID: ''});
            customerID.value = ""
        };
        const journal_no_search = ref("");
        const client_name_search = ref("");
        const client_code_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const reversal_status_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Receipt#...", value: journal_no_search, width:24},
            {type:'text', placeholder:"Member No...", value: client_code_search, width:36},
            {type:'text', placeholder:"Member Name...", value: client_name_search, width:64},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            {
                type:'dropdown', placeholder:"Reversed..", value: reversal_status_search, width:32,
                options: [{text:'Yes',value:'Yes'},{text:'No',value:'No'}]
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
        const addNewReceipt = () =>{
            store.dispatch('Members/updateState', {receiptItems: [], outstandingBalance: 0})
            store.commit('pageTab/ADD_PAGE', {'MMS':'Receipt_Details'});
            store.state.pageTab.mmsActiveTab = 'Receipt_Details'; 
        }
        const removeReceipt = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    journal: selectedIds.value,
                    txn_type: "RCPT"
                }
                try{
                    const response = await store.dispatch('Journals/deleteReceipt',formData)
                    if(response && response.status == 200){
                        toast.success("Receipt Removed Succesfully");
                        searchReceipts();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove receipt: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    searchReceipts();
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Receipt") 
            }else{
                toast.error("Please Select A Receipt To Remove")
            }
        }
        const removeReceipts = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    journal: selectedIds.value,
                    txn_type: "RCPT"
                }

                try{
                    const response = await store.dispatch('Journals/deleteReceipt',formData)
                    if(response && response.msg == "Success"){
                        toast.success("Receipt(s) Removed Succesfully");
                        searchReceipts();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove receipts: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    searchReceipts();
                }
            }else{
                toast.error("Please Select A Receipt To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchReceipts = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                client_category: "Members",
                txn_type: "RCPT",
                client_name: client_name_search.value,
                client_code: client_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                journal_no: journal_no_search.value,
                status: "",
                reversed: reversal_status_search.value,
                property: customerID.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
   
            axios
            .post(`api/v1/clients-journals-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                receiptsList.value = response.data.results;
                store.commit('Journals/LIST_RECEIPTS', receiptsList.value)
                propResults.value = response.data;
                propArrLen.value = receiptsList.value.length;
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
            searchReceipts(selectedValue.value);
        };
        const resetFilters = () =>{
            client_name_search.value = "";
            client_code_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            reversal_status_search.value = "";
            journal_no_search.value= "";
            custComponentKey.value += 1;
            customerID.value = "";
            searchReceipts();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchReceipts();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchReceipts();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchReceipts();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchReceipts();
            // scrollToTop();
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const journalID = [row['journal_id']];
                let formData = {
                    company: companyID.value,
                    journal: journalID,
                    txn_type: "RCPT"
                }
                await store.dispatch('Journals/deleteReceipt',formData).
                then(()=>{
                    searchReceipts();
                })
            }else if(action == 'print'){
                showLoader();
                const journalID = row['journal_id'];
                let formData = {
                    receipt: journalID,
                    client: row['customer_id'],
                    type: 'RCPT',
                    company: companyID.value
                }
                await store.dispatch('Journals/previewClientReceipt',formData).
                then(()=>{
                    hideLoader();
                })
            }else if(action == 'download'){
                showLoader();
                const journalID = row['journal_id'];
                let formData = {
                    receipt: journalID,
                    client: row['customer_id'],
                    type: 'RCPT',
                    company: companyID.value
                }
                await store.dispatch('Journals/downloadClientReceipt',formData).
                then(()=>{
                    hideLoader();
                })
            }
        };
        const handleShowDetails = async(row) =>{
            activeTab.value = 0;
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
        const selectTab = async(index) => {
            let formData = {
                company: companyID.value,
                journal: invoiceID.value,
            }
            if(index == 1){
                activeTab.value = index;
                await axios.post('api/v1/receipt-lines-search/',formData)
                .then((response)=>{
                    receiptLines.value = response.data.receipt_lines;
                })
                .catch((error)=>{
                    console.log(error.message)
                })
            }else{
                activeTab.value = index;
                hideLoader();
            }

        };
        const hideDetails = async() =>{
            showDetails.value = false;
        };
        const closeModal = async() =>{
            invModalVisible.value = false;
            handleReset();
        }

        const dropdownOptions = ref([
            {label: 'Withholding Tax', action: 'withholding-tax'},
        ]);
        const handleDynamicOption = (option) =>{
            if(option == 'batch-meter-reading'){
                store.commit('pageTab/ADD_PAGE', {'PMS':'Batch_Readings'})
                store.state.pageTab.faActiveTab = 'Batch_Readings';
            }
        };
        const printReceiptsList = () =>{
            showLoader();

            let formData = {
                journal_no: "",
                reference_no: "",
                client: "",
                client_category: "Members",
                payment_method: "",
                txn_type: "RCPT",
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                company_id: companyID.value,
            }
            axios
            .post("api/v1/export-clients-receipts-pdf/", formData, { responseType: 'blob' })
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
        onBeforeMount(()=>{
            searchReceipts();
            
        })
        return{
            showTotals,title, searchReceipts,resetFilters, addButtonLabel, searchFilters, tableColumns, receiptsList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,invModalVisible,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeReceipt, removeReceipts, dropdownOptions, handleDynamicOption, addNewReceipt, printReceiptsList,
            addingRight,rightsModule,selectSearchQuantity,selectedValue,showDetails,detailsTitle,hideDetails,handleShowDetails,journalEntries,
            receiptLines,tabs,selectTab,activeTab
        }
    }
};
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
}</style>