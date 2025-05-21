<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewInvoice"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchInvoices"
            @resetFilters="resetFilters"
            @removeItem="removeInvoice"
            @removeSelectedItems="removeInvoices"
            @printList="printInvoiceList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="invoicesList"
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
                :displayButtons="displayButtons" @handleSubmit="saveInvoice" @handleReset="handleReset"
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
import InvoiceLines from "@/components/InvoiceLines.vue";
import InvoicePayments from "@/components/InvoicePayments.vue";
import PrintJS from 'print-js';

export default{
    name: 'Sale_Invoices',
    components:{
        PageComponent, MovableModal,DynamicForm,JournalEntries,InvoiceLines,InvoicePayments
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const { getYear } = useDateFormatter();
        const { getMonth } = useDateFormatter();
        const addingRight = ref('Adding Client Invoice');
        const removingRight = ref('Deleting Client Invoice');
        const rightsModule = ref('PSS');
        const current_date = new Date();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'journal_id';
        const addButtonLabel = ref('New Invoice');
        const submitButtonLabel = ref('Add');
        const title = ref('Invoice Booking');
        const detailsTitle = ref('Item Details');
        const tabs = ref(['Journal Entries','Invoice Lines','Invoice Payments']);
        const activeTab = ref(0);
        const invoiceID = ref(null);
        const custComponentKey = ref(0);
        const invModalVisible = ref(false);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const selectedIds = ref([]);
        const invoicesList = ref([]);
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
        const customerID = ref('');
        const customerArray = computed(() => store.state.Customers.customerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Invoice#", key:"journal_no"},
            {label: "Date", key: "date"},
            {label: "Client Code", key:"code"},
            {label: "Client Name", key:"customer_name"},
            {label: "Description", key:"description"},
            {label: "Amount", key:"total_amount", type:"number"},
            {label: "Paid", key:"total_paid", type:"number"},
            {label: "Balance", key:"due_amount", type:"number"},
            {label: "Status", key:"status"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'print', icon: 'fa fa-print', title: 'Print Invoice', rightName: 'Print Client Invoice'},
            {name: 'download', icon: 'fa fa-download', title: 'Download Invoice', rightName: 'Print Client Invoice'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Invoice',rightName: 'Deleting Client Invoice'},
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
        }
        const journal_no_search = ref("");
        const client_name_search = ref("");
        const client_code_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const status_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Invoice#...", value: journal_no_search, width:36},
            {type:'text', placeholder:"Client No...", value: client_code_search, width:36},
            {type:'text', placeholder:"Client Name...", value: client_name_search, width:64},
            {
                type:'dropdown', placeholder:"Status..", value: status_search, width:32,
                options: [{text:'Open',value:'Open'},{text:'Closed',value:'Closed'}]
            },
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [

            ]
        };

        const handleReset = async() =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            custComponentKey.value += 1;
            customerID.value = '';
        }
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const addNewInvoice = () =>{
            store.commit('pageTab/ADD_PAGE', {'PSS':'Invoice_Details'});
            store.state.pageTab.pssActiveTab = 'Invoice_Details'; 
        }
        const removeInvoice = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    journal: selectedIds.value,
                    txn_type: "INV"
                }
                try{
                    const response = await store.dispatch('Journals/deleteInvoice',formData)
                    if(response && response.status == 200){
                        toast.success("Invoice Removed Succesfully");
                        searchInvoices();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove invoice: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    searchInvoices();
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Invoice") 
            }else{
                toast.error("Please Select An Invoice To Remove")
            }
        }
        const removeInvoices = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    journal: selectedIds.value,
                    txn_type: "INV"
                }

                try{
                    const response = await store.dispatch('Journals/deleteInvoice',formData)
                    if(response && response.msg == "Success"){
                        toast.success("Invoice(s) Removed Succesfully");
                        searchInvoices();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove invoices: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    searchInvoices();
                }
            }else{
                toast.error("Please Select An Invoice To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchInvoices = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                client_category: "Customers",
                txn_type: "INV",
                client_name: client_name_search.value,
                client_code: client_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                journal_no: journal_no_search.value,
                status: status_search.value,
                reversed: "No",
                property: customerID.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
   
            axios
            .post(`api/v1/clients-journals-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                invoicesList.value = response.data.results;
                store.commit('Journals/LIST_INVOICES', invoicesList.value)
                propResults.value = response.data;
                propArrLen.value = invoicesList.value.length;
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
            searchInvoices(selectedValue.value);
        };
        const resetFilters = () =>{
            client_name_search.value = "";
            client_code_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            journal_no_search.value= "";
            status_search.value = "";
            custComponentKey.value += 1;
            customerID.value = "";
            searchInvoices();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchInvoices();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchInvoices();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchInvoices();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchInvoices();
            // scrollToTop();
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const journalID = [row['journal_id']];
                let formData = {
                    company: companyID.value,
                    journal: journalID,
                    txn_type: "INV"
                }
                await store.dispatch('Journals/deleteInvoice',formData).
                then(()=>{
                    searchInvoices();
                })
            }else if(action == 'print'){
                showLoader();
                const journalID = row['journal_id'];
                let formData = {
                    invoice: journalID,
                    company: companyID.value
                }
                await store.dispatch('Journals/previewClientInvoice',formData).
                then(()=>{
                    hideLoader();
                })
            }else if(action == 'download'){
                showLoader();
                const journalID = row['journal_id'];
                let formData = {
                    invoice: journalID,
                    company: companyID.value
                }
                await store.dispatch('Journals/downloadClientInvoice',formData).
                then(()=>{
                    hideLoader();
                })
            }
        }
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
            handleReset();
        };
        

        const dropdownOptions = ref([
            {label: 'Withholding Tax', action: 'withholding-tax'},
        ]);
        const handleDynamicOption = (option) =>{
            if(option == 'batch-meter-reading'){
                store.commit('pageTab/ADD_PAGE', {'PMS':'Batch_Readings'})
                store.state.pageTab.faActiveTab = 'Batch_Readings';
            }
        };
        const printInvoiceList = () =>{
            showLoader();

            let formData = {
                journal_no: "",
                client_category: "Customers",
                txn_type: "INV",
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
            searchInvoices();
            
        })
        return{
            showTotals,title, searchInvoices,resetFilters, addButtonLabel, searchFilters, tableColumns, invoicesList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,invModalVisible,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeInvoice, removeInvoices, dropdownOptions, handleDynamicOption, addNewInvoice, printInvoiceList,
            addingRight,removingRight,rightsModule,selectSearchQuantity,selectedValue,showDetails,detailsTitle,hideDetails,handleShowDetails,journalEntries,
            invoiceLines,invoicePayments,tabs,selectTab,activeTab
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