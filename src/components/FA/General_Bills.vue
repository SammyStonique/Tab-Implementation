<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewBill"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchBills"
            @resetFilters="resetFilters"
            @removeItem="removeBill"
            @removeSelectedItems="removeBills"
            @printList="printBillList"
            v-model:printModalVisible="printModalVisible"
            :printTitle="printTitle"
            :pdfUrl="pdfUrl"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="billsList"
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
                        <InvoiceLines 
                            :invLinesRows="invoiceLines"
                        />
                    </div>
                    <div v-if="activeTab == 2">
                        <InvoicePayments 
                            :invPayRows="invoicePayments"
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
                :displayButtons="displayButtons" @handleSubmit="createRecurringBill" @handleReset="handleReset"
            />
        </MovableModal>
        <MovableModal v-model:visible="refModalVisible" :title="refTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="ref_modal_loader" @showLoader="showRefModalLoader" @hideLoader="hideRefModalLoader" @closeModal="closeRefModal">
        <DynamicForm 
            :fields="refFormFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="payBill" @handleReset="handleRefReset"
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
import InvoiceLines from "@/components/InvoiceLines.vue";
import InvoicePayments from "@/components/InvoicePayments.vue";
import PrintJS from 'print-js';
import PrintModal from '@/components/PrintModal.vue';


export default{
    name: 'General_Bills',
    components:{
        PageComponent, MovableModal,DynamicForm,JournalEntries,InvoiceLines,InvoicePayments,PrintModal,
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const { getYear } = useDateFormatter();
        const { getMonth } = useDateFormatter();
        const addingRight = ref('Adding Bills');
        const removingRight = ref('Deleting Bills');
        const rightsModule = ref('Accounts');
        const loader = ref('none');
        const modal_loader = ref('none');
        const ref_modal_loader = ref('none');
        const refModalVisible = ref(false);
        const refTitle = ref('Bill Payment Details');
        const cashbookID = ref('');
        const idField = 'journal_id';
        const addButtonLabel = ref('New Bill');
        const submitButtonLabel = ref('Add');
        const title = ref('Recurring Bill Details');
        const detailsTitle = ref('Item Details');
        const tabs = ref(['Journal Entries','Bill Lines','Bill Payments']);
        const activeTab = ref(0);
        const invoiceID = ref(null);
        const vendComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const invModalVisible = ref(false);
        const printModalVisible = ref(false);
        const printModalVisible1 = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Bill');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const selectedIds = ref([]);
        const billsList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const showDetails = ref(false);
        const journalEntries = ref([]);
        const invoiceLines = ref([]);
        const invoicePayments = ref([]);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const vendorID = ref('');
        const billID = ref(null);
        const vendorArray = computed(() => store.state.Vendors.vendorArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Bill#", key:"journal_no"},
            {label: "Date", key: "date"},
            {label: "Code", key:"code"},
            {label: "Vendor Name", key:"customer_name"},
            {label: "Description", key:"description"},
            {label: "Amount", key:"total_amount", type:"number"},
            {label: "Paid", key:"total_paid", type:"number"},
            {label: "Balance", key:"due_amount", type:"number"},
            {label: "Status", key:"status"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'pay', icon: 'fa fa-money', title: 'Pay Bill', rightName: 'Adding Payment Voucher'},
            {name: 'print', icon: 'fa fa-print', title: 'Print Bill', rightName: 'Print Bill'},
            {name: 'download', icon: 'fa fa-download', title: 'Download Bill', rightName: 'Print Bill'},
            {name: 'reccur', icon: 'fa fa-repeat', title: 'Recurring Bill', rightName: 'Adding Bills'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Bill', rightName: 'Deleting Bills'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const cashbookArr = computed(() => store.state.Ledgers.cashbookLedgerArr);
        const dueAmount = ref(0);
        const billDueAmnt = ref(0);
        const computedDueAmount = computed(() => {return dueAmount});
        const fetchVendors = async() =>{
            await store.dispatch('Vendors/fetchVendors', {company:companyID.value})
        };
        const handleSearchVendors = async(option) =>{
            await store.dispatch('Vendors/handleSelectedCustomer', option)
            vendorID.value = store.state.Vendors.vendorID;
        };
        const clearSearchVendor = async() =>{
            await store.dispatch('Vendors/updateState', {vendorID: ''});
            vendorID.value = ""
        }
        const journal_no_search = ref("");
        const client_name_search = ref("");
        const client_code_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const status_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Bill#...", value: journal_no_search, width:36},
            {type:'text', placeholder:"Client Code...", value: client_code_search, width:36},
            {type:'text', placeholder:"Client Name...", value: client_name_search, width:64},
            {
                type:'dropdown', placeholder:"Status..", value: status_search, width:32,
                options: [{text:'Open',value:'Open'},{text:'Closed',value:'Closed'}]
            },
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            {
                type:'search-dropdown', value: vendorID.value, width:64, componentKey: vendComponentKey,
                selectOptions: vendorArray, optionSelected: handleSearchVendors,
                searchPlaceholder: 'Vendor Search...', dropdownWidth: '400px',
                fetchData: fetchVendors(), clearSearch: clearSearchVendor           
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                { type: 'dropdown', name: 'frequency',label: "Frequency", value: '', placeholder: "", required: true, options: [{ text: 'Daily', value: 'Daily' }, { text: 'Weekly', value: 'Weekly' }, { text: 'Monthly', value: 'Monthly' }, { text: 'Quarterly', value: 'Quarterly' }] },
                { type: 'date', name: 'start_date',label: "Start Date", value: '', placeholder: "", required: true,},
                { type: 'date', name: 'end_date',label: "End Date", value: '', placeholder: "", required: false},
            ]
        };

        const handleReset = async() =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            vendComponentKey.value += 1;
            vendorID.value = '';
            
        }
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const addNewBill = () =>{
            store.dispatch('Ledgers/updateState', {billItemsArray: []})
            store.commit('pageTab/ADD_PAGE', {'FA':'Bill_Details'});
            store.state.pageTab.faActiveTab = 'Bill_Details'; 
        }
        const removeBill = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    journal: selectedIds.value,
                    txn_type: "BIL"
                }
                try{
                    const response = await store.dispatch('Journals/deleteInvoice',formData)
                    if(response && response.status == 200){
                        toast.success("Bill Removed Succesfully");
                        searchBills();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Bill: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    searchBills();
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Bill") 
            }else{
                toast.error("Please Select A Bill To Remove")
            }
        }
        const removeBills = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    journal: selectedIds.value,
                    txn_type: "BIL"
                }

                try{
                    const response = await store.dispatch('Journals/deleteInvoice',formData)
                    if(response && response.msg == "Success"){
                        toast.success("Bill(s) Removed Succesfully");
                        searchBills();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove bill: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    searchBills();
                }
            }else{
                toast.error("Please Select A Bill To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchBills = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                client_category: "Customers",
                txn_type: "BIL",
                client_name: client_name_search.value,
                client_code: client_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                journal_no: journal_no_search.value,
                status: status_search.value,
                reversed: "No",
                property: vendorID.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
   
            axios
            .post(`api/v1/clients-journals-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                billsList.value = response.data.results;
                store.commit('Journals/LIST_INVOICES', billsList.value)
                propResults.value = response.data;
                propArrLen.value = billsList.value.length;
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
            searchBills(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            client_name_search.value = "";
            client_code_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            journal_no_search.value= "";
            status_search.value = "";
            vendComponentKey.value += 1;
            vendorID.value = "";
            searchBills();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchBills();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchBills();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchBills();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchBills();
            // scrollToTop();
        };
        const createRecurringBill = ()=>{
            showModalLoader();
            let formData = {
                bill: billID.value,
                frequency: formFields.value[0].value,
                start_date: formFields.value[1].value,
                end_date: formFields.value[2].value,
            }
            axios.post('api/v1/create-recurring-bill/', formData)
            .then((response)=>{
                if(response.data.msg == "Success"){
                    toast.success("Success");
                    closeModal();
                }else{
                    toast.error("Failed")
                }
            })
            .catch((error)=>{
                toast.error(error.message)
            })
            .finally(()=>{
                hideModalLoader();
            })
        };
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const journalID = [row['journal_id']];
                let formData = {
                    company: companyID.value,
                    journal: journalID,
                    txn_type: "BIL"
                }
                await store.dispatch('Journals/deleteBill',formData).
                then(()=>{
                    searchBills();
                })
            }else if(action == 'print'){
                showLoader();
                const journalID = row['journal_id'];
                let formData = {
                    invoice: journalID,
                    company: companyID.value
                }
                const response = await store.dispatch('Journals/previewClientInvoice',formData)
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
                    invoice: journalID,
                    company: companyID.value
                }
                await store.dispatch('Journals/downloadVendorBill',formData).
                then(()=>{
                    hideLoader();
                })
            }else if(action == 'reccur'){
                updateFormFields();
                billID.value= row['journal_id'];
                invModalVisible.value = true;
                handleReset();
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';
                
            }else if(action == 'pay'){
                dueAmount.value = row['unformatted_due_amount'];
                billDueAmnt.value = row['unformatted_due_amount'];
                billID.value = row['journal_id'];
                if(parseFloat(dueAmount.value) > 0){
                    dueAmount.value = row['unformatted_due_amount'];
                    refModalVisible.value = true;
                    flex_basis.value = '1/3';
                    flex_basis_percentage.value = '33.333';
                }else{
                    toast.error("Bill Is Already Paid") 
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
                await axios.post('api/v1/invoice-lines-search/',formData)
                .then((response)=>{
                    invoiceLines.value = response.data.invoice_lines;
                })
                .catch((error)=>{
                    console.log(error.message)
                })
            }else if( index == 2){
                activeTab.value = index;
                await axios.post('api/v1/invoice-payments-search/',formData)
                .then((response)=>{
                    invoicePayments.value = response.data.invoice_payments;
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
            billID.value = null;
            handleReset();
        }

        const dropdownOptions = ref([
            {label: 'Withholding Tax', action: 'withholding-tax'},
            {label: 'Recurring Bills', action: 'recurring', icon: 'fa-repeat', colorClass: 'text-yellow-600', rightName: 'Adding Bills'},
        ]);
        const handleDynamicOption = (option) =>{
            if(option == 'recurring'){
                store.commit('pageTab/ADD_PAGE', {'FA':'Recurring_Bills'})
                store.state.pageTab.faActiveTab = 'Recurring_Bills';
            }
        };
        const printBillList = () =>{
            showLoader();

            let formData = {
                journal_no: "",
                client_category: "Customers",
                txn_type: "BIL",
                client: client_name_search.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                status: "",
                company_id: companyID.value
            } 
   
            axios
            .post("api/v1/export-clients-invoices-pdf/", formData, { responseType: 'blob' })
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
        };
        const fetchLedgers = async() =>{
            await store.dispatch('Ledgers/fetchCashbookLedgers', {company:companyID.value, ledger_type: 'Cashbook'})
        };
        const fetchAllLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            cashbookID.value = store.state.Ledgers.ledgerID;
        };
        const clearSelectedLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            cashbookID.value = ""
        };
        const checkDueLimit = (value) =>{
            if(parseFloat(billDueAmnt.value) < parseFloat(value)){
                toast.error(`Due Amount is ${billDueAmnt.value}`)
                refFormFields.value[5].value = billDueAmnt.value;
            }
        };
        
        const refFormFields = ref([
            {  
                type:'search-dropdown', label:"Cashbook", value: cashbookID.value, componentKey: ledComponentKey,
                selectOptions: cashbookArr, optionSelected: handleSelectedLedger, required: true,
                searchPlaceholder: 'Select Cashbook...', dropdownWidth: '550px', updateValue: "",
                clearSearch: clearSelectedLedger
            },
            { type: 'date', name: 'issue_date',label: "Recording Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
            { type: 'date', name: 'banking_date',label: "Banking Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
            { type: 'dropdown', name: 'payment_method',label: "Payment Method", value: '', placeholder: "", required: true, options: [{ text: 'Cash', value: 'Cash' }, { text: 'Mpesa', value: 'Mpesa' },{ text: 'Bank Deposit', value: 'Bank Deposit' }, { text: 'Cheque', value: 'Cheque' },{ text: 'Check-off', value: 'Check-off' }, { text: 'RTGS', value: 'RTGS' },{ text: 'EFT', value: 'EFT' }, { text: 'Not Applicable', value: 'Not Applicable' }] },
            { type: 'text', name: 'reference_no',label: "Reference No", value: '', required: true,},
            { type: 'number', name: 'total_amount',label: "Amount", value: computedDueAmount.value, required: true , method: checkDueLimit},
        ]);
        const handleRefReset = () =>{
            for(let i=0; i < refFormFields.value.length; i++){
                refFormFields.value[i].value = '';
            }
            billID.value = null;
            cashbookID.value = null;
            ledComponentKey.value +=1;
            refFormFields.value[1].value = formatDate(current_date);
            refFormFields.value[2].value = formatDate(current_date);
        }
        const showRefModalLoader = () =>{
            ref_modal_loader.value = "block";
        }
        const hideRefModalLoader = () =>{
            ref_modal_loader.value = "none";
        }
        const payBill = async() =>{
            showRefModalLoader();
            let formData = {
                cashbook: cashbookID.value,
                issue_date: refFormFields.value[1].value,
                bill: billID.value,
                banking_date: refFormFields.value[2].value,
                amount: refFormFields.value[5].value,
                payment_method: refFormFields.value[3].value,
                reference_no: refFormFields.value[4].value,
                user: userID.value,
                company: companyID.value
            }
            axios.post(`api/v1/pay-general-bill/`,formData)
            .then((response)=>{
                if(response.data.msg == "Success"){
                    toast.success("Success")
                    closeRefModal();
                    searchBills();
                }else if(response.data.msg == "Excess"){
                    toast.error("Due Amount Exceeded")
                }else if(response.data.msg == "Exists"){
                    toast.error("Duplicate Payment Reference No")
                }else{
                    toast.error("Error Paying Bill")
                }                   
            })
            .catch((error)=>{
                console.log(error.message);
                toast.error(error.message)
                hideRefModalLoader();
            })
            .finally(()=>{
                hideRefModalLoader();
            })
        
        };
        const closeRefModal = () =>{
            refModalVisible.value = false;
            billID.value = null;
            cashbookID.value = null;
            handleRefReset();
            hideRefModalLoader();
        };
        onBeforeMount(()=>{
            searchBills();
            fetchAllLedgers();
            fetchLedgers();
            
        })
        return{
            showTotals,title, searchBills,resetFilters, addButtonLabel, searchFilters, tableColumns, billsList,printModalVisible,pdfUrl, printTitle,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,invModalVisible,printModalVisible1,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeBill, removeBills, dropdownOptions, handleDynamicOption, addNewBill, printBillList, addingRight,removingRight,rightsModule,
            createRecurringBill,selectSearchQuantity,selectedValue,showDetails,detailsTitle,hideDetails,handleShowDetails,journalEntries,
            invoiceLines,invoicePayments,tabs,selectTab,activeTab,
            refTitle,refFormFields,refModalVisible,ref_modal_loader,handleRefReset,showRefModalLoader,hideRefModalLoader,closeRefModal,payBill
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