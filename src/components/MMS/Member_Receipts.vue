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
            v-model:printModalVisible="printModalVisible"
            :printTitle="printTitle"
            :pdfUrl="pdfUrl"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="receiptsList"
            :actions="actions"
            :showTotals="showTotals"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            @handleShowDetails="handleShowDetails"
            :groupingKey=true
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
        <PrintModal v-model:visible="printModalVisible1" :title="printTitle" >
            <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="100%" type="application/pdf" style="border: none;"></iframe>
        </PrintModal>
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
import PrintModal from '@/components/PrintModal.vue';

export default{
    name: 'Member_Receipts',
    components:{
        PageComponent, MovableModal,DynamicForm,JournalEntries,ReceiptLines,PrintModal
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const { getYear } = useDateFormatter();
        const { getMonth } = useDateFormatter();
        const addingRight = ref('Adding Member Receipt');
        const removingRight = ref('Deleting Member Receipt');
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
        const printModalVisible = ref(false);
        const printModalVisible1 = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Client Receipts');
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
            {name: 'send-sms', icon: 'fas fa-comment', title: 'Send SMS', rightName: 'Sending MMS SMS'},
            {name: 'send-email', icon: 'fas fa-envelope', title: 'Send Email', rightName: 'Sending MMS Emails'},
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
        const resetFilters = async() =>{
            await store.dispatch('Journals/updateState', {journal_no_search:''});
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
                    client: row['member_id'],
                    type: 'RCPT',
                    client_type: "Member",
                    company: companyID.value
                }
                const response = await store.dispatch('Journals/previewClientReceipt',formData)
                if (response && response.status === 200) {
                    const blob1 = new Blob([response.data], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob1);
                    // PrintJS({printable: url, type: 'pdf'});
                    pdfUrl.value = url;
                    printModalVisible1.value = true;
                }
                hideLoader();
            }else if(action == 'download'){
                showLoader();
                const journalID = row['journal_id'];
                let formData = {
                    receipt: journalID,
                    client: row['member_id'],
                    type: 'RCPT',
                    client_type: "Member",
                    company: companyID.value
                }
                await store.dispatch('Journals/downloadClientReceipt',formData).
                then(()=>{
                    hideLoader();
                })
            }else if(action == 'send-sms'){
                const reversalStatus = row['reversed'];
                if(reversalStatus == "No"){
                    showLoader();
                    const memberID = [row['member_id']];
                    const particulars = [row['description']];
                    const particularsAmnt = [row['total_amount']];
                    const txnNo = [row['journal_no']];
                    const jnlID = row['journal_id'];
                    let formData = {
                        member: memberID,
                        particulars: particulars,
                        transaction_numbers: txnNo,
                        particulars_amount: particularsAmnt,
                        journal: null,
                        receipt_id: jnlID,
                        company: companyID.value
                    }
                    await axios.post('api/v1/member-receipt-sms/',formData).
                    then((response)=>{
                        if(response.data.msg == "Success"){
                            toast.success("SMS Sent!")
                        }else if(response.data.msg == "Missing Template"){
                            toast.error("Member Receipt Template Not Set!")
                        }else{
                            toast.error(response.data.msg)
                        }
                    })
                    .catch((error)=>{
                        toast.error(error.message)
                    })
                    .finally(()=>{
                        hideLoader();
                    })
                }else{
                    toast.error("Cannot SMS Reversed Receipt")
                }
                
            }else if(action == 'send-email'){
                const reversalStatus = row['reversed'];
                if(reversalStatus == "No"){
                    showLoader();
                    const memberID = [row['member_id']];
                    const receiptID = row['journal_id'];
                    const particulars = [row['description']];
                    const particularsAmnt = [row['total_amount']];
                    const txnNo = [row['journal_no']];
                    let formData = {
                        member: memberID,
                        receipt: receiptID,
                        particulars: particulars,
                        transaction_numbers: txnNo,
                        particulars_amount: particularsAmnt,
                        journal: null,
                        company: companyID.value
                    }
                    await axios.post('api/v1/member-receipt-email/',formData).
                    then((response)=>{
                        if(response.data.msg == "Success"){
                            toast.success("Email Sent!")
                        }else if(response.data.msg == "Missing Template"){
                            toast.error("Member Receipt Template Not Set!")
                        }else{
                            toast.error(response.data.msg)
                        }
                    })
                    .catch((error)=>{
                        toast.error(error.message)
                    })
                    .finally(()=>{
                        hideLoader();
                    })
                }else{
                    toast.error("Cannot Email Reversed Receipt")
                }
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
            {label: 'SMS Member Receipts', action: 'send-sms', icon: 'fa-sms', colorClass: 'text-blue-500', rightName: 'Sending MMS SMS'},
            {label: 'Email Member Receipts', action: 'send-email', icon: 'fa-envelope', colorClass: 'text-indigo-500', rightName: 'Sending MMS Emails'},
        ]);
        const handleDynamicOption = async(option) =>{
            if(option == 'send-sms'){
                showLoader();
                const memberID = [];
                const particulars = "";
                const particularsAmnt = "";
                const txnNo = "";
                const journalID = selectedIds.value
                let formData = {
                    member: memberID,
                    particulars: particulars,
                    transaction_numbers: txnNo,
                    particulars_amount: particularsAmnt,
                    journal: journalID,
                    receipt_id: "",
                    company: companyID.value
                }
                await axios.post('api/v1/member-receipt-sms/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("SMS Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Member Receipt Template Not Set!")
                    }else{
                        toast.error(response.data.msg)
                    }
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideLoader();
                })
            }else if(option == 'send-email'){
                showLoader();
                const memberID = [];
                const receiptID = "";
                const particulars = "";
                const particularsAmnt = "";
                const txnNo = "";
                const journalID = selectedIds.value
                let formData = {
                    member: memberID,
                    receipt: receiptID,
                    particulars: particulars,
                    transaction_numbers: txnNo,
                    particulars_amount: particularsAmnt,
                    journal: journalID,
                    company: companyID.value
                }
                await axios.post('api/v1/member-receipt-email/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Email Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Member Receipt Template Not Set!")
                    }else{
                        toast.error(response.data.msg)
                    }
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideLoader();
                })
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
        onBeforeMount(()=>{
            journal_no_search.value = store.state.Journals.journal_no_search;
            searchReceipts();     
        })
        return{
            showTotals,title, searchReceipts,resetFilters, addButtonLabel, searchFilters, tableColumns, receiptsList,printModalVisible1,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,invModalVisible,printModalVisible,pdfUrl, printTitle,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeReceipt, removeReceipts, dropdownOptions, handleDynamicOption, addNewReceipt, printReceiptsList,
            addingRight,removingRight,rightsModule,selectSearchQuantity,selectedValue,showDetails,detailsTitle,hideDetails,handleShowDetails,journalEntries,
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