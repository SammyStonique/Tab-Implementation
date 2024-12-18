<template>
    <div class="z-10">
        <PageComponent 
            :key="mainComponentKey"
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
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="reverseTenantReceipt" @handleReset="handleReset"
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
import JournalEntries from "@/components/JournalEntries.vue";
import ReceiptLines from "@/components/ReceiptLines.vue";
import PrintJS from 'print-js';
import Swal from 'sweetalert2';

export default{
    name: 'Tenant_Receipts',
    components:{
        PageComponent, MovableModal,DynamicForm,JournalEntries,ReceiptLines,
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const mainComponentKey = ref(0);
        const idField = 'journal_id';
        const addButtonLabel = ref('New Receipt');
        const addingRight = ref('Adding Tenant Receipt');
        const rightsModule = ref('PMS');
        const submitButtonLabel = ref('Add');
        const title = ref('Receipt Reversal');
        const detailsTitle = ref('Item Details');
        const tabs = ref(['Journal Entries','Receipt Lines']);
        const activeTab = ref(0);
        const invoiceID = ref(null);
        const receiptID = ref(null);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const tntComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const propComponentKey = ref(0);
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
        const propertySearchID = ref('');
        const ledgerSearchID = ref('');
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Rcpt#", key:"journal_no"},
            {label: "Date", key: "date"},
            {label: "B.Date", key: "banking_date"},
            {label: "Tenant Name", key:"tenant_name"},
            {label: "Property Name", key:"property_name"},
            {label: "Unit", key:"unit_number"},
            {label: "Cashbook", key:"cashbook"},
            {label: "P.Mthd", key:"payment_method"},
            {label: "Ref No", key:"reference_no"},
            {label: "Amnt", key:"total_amount", type:"number"},
            {label: "Done By", key:"done_by"},
            {label: "Reversed", key:"reversed"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'print', icon: 'fa fa-print', title: 'Print Receipt', rightName: 'Print Tenant Receipt'},
            {name: 'download', icon: 'fa fa-download', title: 'Download Receipt', rightName: 'Print Tenant Receipt'},
            {name: 'reverse', icon: 'fa fa-undo', title: 'Reverse Receipt', rightName: 'Reversing Tenant Receipt'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Receipt', rightName: 'Deleting Tenant Receipt'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const fetchProperties = async() =>{
            await store.dispatch('Properties_List/fetchProperties', {company:companyID.value})
        };
        const handleSearchProperty = async(option) =>{
            await store.dispatch('Properties_List/handleSelectedProperty', option)
            propertySearchID.value = store.state.Properties_List.propertyID;
        };
        const clearSearchProperty = async() =>{
            await store.dispatch('Properties_List/updateState', {propertyID: ''});
            propertySearchID.value = ""
        }
        const fetchLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value, ledger_type: 'Cashbook'})
        };
        const handleSearchLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            ledgerSearchID.value = store.state.Ledgers.ledgerID;
        };
        const clearSearchLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            ledgerSearchID.value = ""
        }
        const tenant_name_search = ref("");
        const tenant_code_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Tenant Code...", value: tenant_code_search, width:36},
            {type:'text', placeholder:"Tenant Name...", value: tenant_name_search, width:64},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            {
                type:'search-dropdown', value: propertySearchID.value, width:64,
                selectOptions: propertyArray, optionSelected: handleSearchProperty,
                searchPlaceholder: 'Property Search...', dropdownWidth: '200px',
                fetchData: fetchProperties(), clearSearch: clearSearchProperty()             
            },
            {
                type:'search-dropdown', value: ledgerSearchID.value, width:48,
                selectOptions: ledgerArray, optionSelected: handleSearchLedger,
                searchPlaceholder: 'Cashbook Search...', dropdownWidth: '250px',
                fetchData: fetchLedgers(), clearSearch: clearSearchLedger()   
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        const formFields = ref([]);

        const updateFormFields = () => {
            formFields.value = [
                
                { type: 'date', name: 'date',label: "Date.", value: '', required: true },
                {type:'text-area', label:"Reversal Reason", value: '', textarea_rows: '3', textarea_cols: '56', required: true},
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }

        const removeReceipt = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    journal: selectedIds.value,
                    txn_type: "RCPT"
                }
                Swal.fire({
                    title: "Are you sure?",
                    text: `Do you wish to delete Receipt?`,
                    type: 'warning',
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Yes Delete Receipt!',
                    cancelButtonText: 'Cancel!',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom',
                    },
                    showLoaderOnConfirm: true,
                    }).then((result) => {
                    if (result.value) {
                        axios.post(`api/v1/delete-journal/`,formData)
                        .then((response)=>{
                        if(response.data.msg == "Success"){
                            Swal.fire("Poof! Receipt(s) removed succesfully!", {
                                icon: "success",
                            }); 
                            toast.success("Receipt(s) removed succesfully");
                            searchReceipts();
                        }else if(response.data.msg == "Reversed"){
                            Swal.fire({
                                title: "Cannot Delete Reversed Receipt",
                                icon: "warning",
                            });
                        }                  
                        })
                        .catch((error)=>{
                            console.log(error.message);
                            Swal.fire({
                                title: error.message,
                                icon: "warning",
                            });
                        })
                        .finally(()=>{
                            searchReceipts();
                            selectedIds.value = [];
                        })
                    }else{
                        Swal.fire(`Receipt has not been deleted!`);
                    }
                })
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
                Swal.fire({
                    title: "Are you sure?",
                    text: `Do you wish to delete Receipt?`,
                    type: 'warning',
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Yes Delete Receipt!',
                    cancelButtonText: 'Cancel!',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom',
                    },
                    showLoaderOnConfirm: true,
                    }).then((result) => {
                    if (result.value) {
                        axios.post(`api/v1/delete-journal/`,formData)
                        .then((response)=>{
                        if(response.data.msg == "Success"){
                            Swal.fire("Poof! Receipt(s) removed succesfully!", {
                                icon: "success",
                            }); 
                            toast.success("Receipt(s) removed succesfully");
                            searchReceipts();
                        }else if(response.data.msg == "Reversed"){
                            Swal.fire({
                                title: "Cannot Delete Reversed Receipt",
                                icon: "warning",
                            });
                        }                  
                        })
                        .catch((error)=>{
                            console.log(error.message);
                            Swal.fire({
                                title: error.message,
                                icon: "warning",
                            });
                        })
                        .finally(()=>{
                            searchReceipts();
                            selectedIds.value = [];
                        })
                    }else{
                        Swal.fire(`Receipt has not been deleted!`);
                    }
                }) 
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
                client_category: "Tenants",
                txn_type: "RCPT",
                client_name: tenant_name_search.value,
                client_code: tenant_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                property: propertySearchID.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
   
            axios
            .post(`api/v1/clients-journals-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                receiptsList.value = response.data.results;
                store.commit('Journals/LIST_TENANTS_RECEIPTS', receiptsList.value)
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
            tenant_name_search.value = "";
            tenant_code_search.value = "";
            from_date_search.value= "";
            to_date_search.value = "";
            searchReceipts();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchReceipts();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchReceipts(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchReceipts();

        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchReceipts();

        }
        const addNewReceipt = async() =>{
            store.dispatch('Journals/updateState', {journalsClientList: [], outstandingBalance:0})
            store.commit('pageTab/ADD_PAGE', {'PMS':'Receipt_Details'});
            store.state.pageTab.pmsActiveTab = 'Receipt_Details'; 
        };
        const reverseTenantReceipt = async() =>{
            if(formFields.value[0].value == '' || formFields.value[1].value == ''){
                toast.error('Fill In Required Fields')
            }else{
                showModalLoader();
                let formData = {
                    receipt: receiptID.value,
                    date: formFields.value[0].value,
                    reversal_reason: formFields.value[1].value,
                    user: userID.value,
                    company: companyID.value
                }
                await axios.post('api/v1/reverse-tenant-receipt/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Receipt Reversal Successful")
                        receiptID.value = null;
                        handleReset();
                    }else{
                        toast.error("Error Reversing Receipt")
                    }
                    
                })
                .catch((error)=>{
                    console.log(error.message)
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideModalLoader();
                })
            }
            
        };
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const journalID = [row['journal_id']];
                let formData = {
                    company: companyID.value,
                    journal: journalID,
                    txn_type: "RCPT",
                }
                Swal.fire({
                    title: "Are you sure?",
                    text: `Do you wish to delete Receipt?`,
                    type: 'warning',
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Yes Delete Receipt!',
                    cancelButtonText: 'Cancel!',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom',
                    },
                    showLoaderOnConfirm: true,
                    }).then((result) => {
                    if (result.value) {
                        axios.post(`api/v1/delete-journal/`,formData)
                        .then((response)=>{
                        if(response.data.msg == "Success"){
                            Swal.fire("Poof! Receipt(s) removed succesfully!", {
                                icon: "success",
                            }); 
                            toast.success("Receipt(s) removed succesfully");
                            searchReceipts();
                        }else if(response.data.msg == "Reversed"){
                            Swal.fire({
                                title: "Cannot Delete Reversed Receipt",
                                icon: "warning",
                            });
                        }                  
                        })
                        .catch((error)=>{
                            console.log(error.message);
                            Swal.fire({
                                title: error.message,
                                icon: "warning",
                            });
                        })
                        .finally(()=>{
                            searchReceipts();
                        })
                    }else{
                        Swal.fire(`Receipt has not been deleted!`);
                    }
                })     
            }else if(action == 'print'){
                showLoader();
                const journalID = row['journal_id'];
                let formData = {
                    receipt: journalID,
                    client: row['customer_id'],
                    type: "RCPT",
                    company: companyID.value
                }
                await store.dispatch('Journals/previewTenantReceipt',formData).
                then(()=>{
                    hideLoader();
                })
            }else if(action == 'download'){
                showLoader();
                const journalID = row['journal_id'];
                let formData = {
                    receipt: journalID,
                    client: row['customer_id'],
                    type: "RCPT",
                    company: companyID.value
                }
                await store.dispatch('Journals/downloadTenantReceipt',formData).
                then(()=>{
                    hideLoader();
                })
            }else if(action == 'reverse'){
                const reversalStatus = row['reversed'];

                if (reversalStatus == "Yes"){
                    toast.error("Receipt Already Reversed")
                }else{
                    updateFormFields();
                    receiptID.value = row['journal_id'];
                    handleReset();
                    flex_basis.value = '1/3';
                    flex_basis_percentage.value = '33.333';
                    propModalVisible.value = true;
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
            
        }

        const dropdownOptions = ref([
            {label: 'Cancel Reversal', action: 'cancel-receipt-reversal'},
        ]);
        const handleDynamicOption = (option) =>{
            
            if(option == 'cancel-receipt-reversal'){
                if(selectedIds.value.length > 1){
                    toast.error('You Have Selected More Than 1 Receipt')
                }else if(selectedIds.value.length == 0){
                    toast.error('Please Select A Receipt')
                }else{
                    let formData = {
                        receipt: selectedIds.value,
                        company: companyID.value
                    }
                    Swal.fire({
                        title: "Are you sure?",
                        text: `Do you wish to Cancel Reversal?`,
                        type: 'warning',
                        showCloseButton: true,
                        showCancelButton: true,
                        confirmButtonText: 'Yes Cancel Reversal!',
                        cancelButtonText: 'Cancel!',
                        customClass: {
                            confirmButton: 'swal2-confirm-custom',
                            cancelButton: 'swal2-cancel-custom',
                        },
                        showLoaderOnConfirm: true,
                        }).then((result) => {
                        if (result.value) {
                            axios.post(`api/v1/cancel-tenant-receipt-reversal/`,formData)
                            .then((response)=>{
                                if(response.data.msg == "Success"){
                                    Swal.fire("Poof! Reversal canceled succesfully!", {
                                        icon: "success",
                                    }); 
                                }else if(response.data.msg == "Failed"){
                                    Swal.fire({
                                        title: "Cannot Cancel Non Reversed Receipt",
                                        icon: "warning",
                                    });
                                } else if(response.data.msg == "Error"){
                                    Swal.fire({
                                        title: "Invoice(s) Have Payment Allocation",
                                        icon: "warning",
                                    });
                                }                   
                            })
                            .catch((error)=>{
                            console.log(error.message);
                            Swal.fire({
                                title: error.message,
                                icon: "warning",
                            });
                            })
                        }else{
                            Swal.fire(`Reversal has not been canceled!`);
                        }
                    })  
                }
                
            }
        };
        const printReceiptsList = () =>{
            showLoader();

            let formData = {
                journal_no: "",
                reference_no: "",
                client: "",
                client_category: "Tenants",
                payment_method: "",
                txn_type: "RCPT",
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                company_id: companyID.value,
            }
            axios
            .post("api/v1/export-rental-receipts-pdf/", formData, { responseType: 'blob' })
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
            showTotals,mainComponentKey, title, searchReceipts,resetFilters, addButtonLabel, searchFilters, tableColumns, receiptsList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,formFields,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,handleReset,
            submitButtonLabel, showModal, addNewReceipt, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, handleSelectionChange, flex_basis,flex_basis_percentage,reverseTenantReceipt,
            removeReceipt, removeReceipts, dropdownOptions, handleDynamicOption,addingRight,rightsModule,printReceiptsList,selectSearchQuantity,selectedValue,
            showDetails,detailsTitle,hideDetails,handleShowDetails,journalEntries,receiptLines,tabs,selectTab,activeTab
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