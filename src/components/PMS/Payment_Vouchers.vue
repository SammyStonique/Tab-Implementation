<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewPaymentVoucher"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchPaymentVouchers"
            @resetFilters="resetFilters"
            @removeItem="removePaymentVoucher"
            @removeSelectedItems="removePaymentVouchers"
            @printList="printVouchersList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="vouchersList"
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
                :displayButtons="displayButtons" @handleSubmit="savePaymentVoucher" @handleReset="handleReset"
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
    name: 'Payment_Vouchers',
    components:{
        PageComponent, MovableModal,DynamicForm,JournalEntries,ReceiptLines,
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const { getYear } = useDateFormatter();
        const { getMonth } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'journal_id';
        const addButtonLabel = ref('New Payment Voucher');
        const addingRight = ref('Adding Payment Voucher');
        const removingRight = ref('Deleting Payment Vouchers');
        const rightsModule = ref('Accounts');
        const submitButtonLabel = ref('Add');
        const title = ref('Receipt Booking');
        const detailsTitle = ref('Item Details');
        const tabs = ref(['Journal Entries','Receipt Lines']);
        const activeTab = ref(0);
        const invoiceID = ref(null);
        const vendComponentKey = ref(0);
        const invModalVisible = ref(false);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const selectedIds = ref([]);
        const vouchersList = ref([]);
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
        const vendorID = ref('');
        const vendorArray = computed(() => store.state.Vendors.vendorArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Voucher#", key:"journal_no"},
            {label: "Date", key: "date"},
            {label: "Bank. Date", key: "banking_date"},
            {label: "Vendor Name", key:"customer_name"},
            {label: "Cashbook", key:"cashbook"},
            {label: "Pay. Method", key:"payment_method"},
            {label: "Ref No", key:"reference_no"},
            {label: "Amount", key:"total_amount", type:"number"},
            {label: "Done By", key:"done_by"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'print', icon: 'fa fa-print', title: 'Print Voucher', rightName: 'Print Payment Voucher'},
            {name: 'download', icon: 'fa fa-download', title: 'Download Voucher', rightName: 'Print Payment Voucher'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Voucher', rightName: 'Deleting Payment Vouchers'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const fetchVendors = async() =>{
            await store.dispatch('Vendors/fetchVendors', {company:companyID.value})
        };
        const handleSearchVendors = async(option) =>{
            await store.dispatch('Vendors/handleSelectedVendor', option)
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
        const reversal_status_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"PV#...", value: journal_no_search, width:24},
            {type:'text', placeholder:"Client Code...", value: client_code_search, width:36},
            {type:'text', placeholder:"Client Name...", value: client_name_search, width:64},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            {
                type:'search-dropdown', value: vendorID.value, width:64, componentKey: vendComponentKey,
                selectOptions: vendorArray, optionSelected: handleSearchVendors,
                searchPlaceholder: 'Vendor Search...', dropdownWidth: '400px',
                fetchData: fetchVendors(), clearSearch: clearSearchVendor           
            },
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
        const addNewPaymentVoucher = () =>{
            store.commit('pageTab/ADD_PAGE', {'PMS':'Payment_Details'});
            store.state.pageTab.pmsActiveTab = 'Payment_Details'; 
        }
        const removePaymentVoucher = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    journal: selectedIds.value,
                    txn_type: "PMT"
                }
                try{
                    const response = await store.dispatch('Journals/deletePaymentVoucher',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Payment Voucher Removed Succesfully");
                        searchPaymentVouchers();
                    }else if(response && response.data.msg == "Failed"){
                        toast.error("Failed to remove Payment Voucher");
                        searchPaymentVouchers();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove payment voucher: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    searchPaymentVouchers();
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Payment Voucher") 
            }else{
                toast.error("Please Select A Payment Voucher To Remove")
            }
        }
        const removePaymentVouchers = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    journal: selectedIds.value,
                    txn_type: "PMT"
                }

                try{
                    const response = await store.dispatch('Journals/deletePaymentVoucher',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Payment Voucher(s) Removed Succesfully");
                        searchPaymentVouchers();
                    }else if(response && response.data.msg == "Failed"){
                        toast.error("Failed to remove Payment Voucher");
                        searchPaymentVouchers();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Payment Voucher: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    searchPaymentVouchers();
                }
            }else{
                toast.error("Please Select A Payment Voucher To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchPaymentVouchers = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                client_category: "Customers",
                txn_type: "PMT",
                client_name: client_name_search.value,
                client_code: client_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                journal_no: journal_no_search.value,
                status: "",
                reversed: reversal_status_search.value,
                property: vendorID.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
   
            axios
            .post(`api/v1/clients-journals-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                vouchersList.value = response.data.results;
                store.commit('Journals/LIST_RECEIPTS', vouchersList.value)
                propResults.value = response.data;
                propArrLen.value = vouchersList.value.length;
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
            searchPaymentVouchers(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            client_name_search.value = "";
            client_code_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            reversal_status_search.value = "";
            journal_no_search.value= "";
            vendComponentKey.value += 1;
            vendorID.value = "";
            searchPaymentVouchers();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchPaymentVouchers();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchPaymentVouchers();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchPaymentVouchers();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchPaymentVouchers();
            // scrollToTop();
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const journalID = [row['journal_id']];
                let formData = {
                    company: companyID.value,
                    journal: journalID,
                    txn_type: "PMT"
                }
                await store.dispatch('Journals/deletePaymentVoucher',formData).
                then(()=>{
                    searchPaymentVouchers();
                })
            }else if(action == 'print'){
                showLoader();
                const journalID = row['journal_id'];
                let formData = {
                    receipt: journalID,
                    client: row['customer_id'],
                    type: 'PMT',
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
                    type: 'PMT',
                    company: companyID.value
                }
                await store.dispatch('Journals/downloadPaymentVoucher',formData).
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
            // {label: 'Direct Voucher', action: 'direct-voucher'},
        ]);
        const handleDynamicOption = (option) =>{
            if(option == 'direct-voucher'){
                store.commit('pageTab/ADD_PAGE', {'PMS':'Direct_Voucher'});
                store.state.pageTab.pmsActiveTab = 'Direct_Voucher';
            }
        };
        const printVouchersList = () =>{
            showLoader();

            let formData = {
                journal_no: "",
                reference_no: "",
                client: "",
                client_category: "Customers",
                payment_method: "",
                txn_type: "PMT",
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
            searchPaymentVouchers();
            
        })
        return{
            showTotals, title, searchPaymentVouchers,resetFilters, addButtonLabel, searchFilters, tableColumns, vouchersList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,invModalVisible,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, handleSelectionChange, flex_basis,flex_basis_percentage,
            removePaymentVoucher, removePaymentVouchers, dropdownOptions, handleDynamicOption, addNewPaymentVoucher, printVouchersList,
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