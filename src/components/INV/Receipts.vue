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
            :count="propCount"
            :currentPage="currentPage"
            :result="propArrLen"
            @loadPrev="loadPrev"
            @loadNext="loadNext"
            @firstPage="firstPage"
            @lastPage="lastPage"
            :showNextBtn="showNextBtn"
            :showPreviousBtn="showPreviousBtn"
        />
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
import PrintJS from 'print-js';

export default{
    name: 'Receipts',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const { getYear } = useDateFormatter();
        const { getMonth } = useDateFormatter();
        const addingRight = ref('Adding Receipt');
        const rightsModule = ref('Accounts');
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'journal_id';
        const addButtonLabel = ref('New Receipt');
        const submitButtonLabel = ref('Add');
        const title = ref('Receipt Booking');
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
            {label: "Customer Name", key:"customer_name"},
            {label: "Cashbook", key:"cashbook"},
            {label: "Pay. Method", key:"payment_method"},
            {label: "Ref No", key:"reference_no"},
            {label: "Amount", key:"total_amount", type:"number"},
            {label: "Done By", key:"done_by"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'print', icon: 'fa fa-print', title: 'Print Receipt', rightName: 'Print Receipt'},
            {name: 'download', icon: 'fa fa-download', title: 'Download Receipt', rightName: 'Print Receipt'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Receipt', rightName: 'Deleting Receipt'},
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
        const client_name_search = computed({
            get: () => store.state.Journals.client_name_search,
            set: (value) => store.commit('Journals/SET_SEARCH_FILTERS', {"client_name_search":value}),
        });
        const client_code_search = computed({
            get: () => store.state.Journals.client_code_search,
            set: (value) => store.commit('Journals/SET_SEARCH_FILTERS', {"client_code_search":value}),
        });
        const from_date_search = computed({
            get: () => store.state.Journals.from_date_search,
            set: (value) => store.commit('Journals/SET_SEARCH_FILTERS', {"from_date_search":value}),
        });
        const to_date_search = computed({
            get: () => store.state.Journals.to_date_search,
            set: (value) => store.commit('Journals/SET_SEARCH_FILTERS', {"to_date_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Client Code...", value: client_code_search, width:36},
            {type:'text', placeholder:"Client Name...", value: client_name_search, width:64},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            {
                type:'search-dropdown', value: customerID.value, width:64,
                selectOptions: customerArray, optionSelected: handleSearchCustomers,
                searchPlaceholder: 'Customer Search...', dropdownWidth: '400px',
                fetchData: fetchCustomers(), clearSearch: clearSearchCustomer()             
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
            store.commit('pageTab/ADD_PAGE', {'INV':'Receipt_Details'});
            store.state.pageTab.invActiveTab = 'Receipt_Details'; 
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
                client_category: "Customers",
                txn_type: "RCPT",
                client_name: client_name_search.value,
                client_code: client_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                property: null,
                company: companyID.value
            } 
   
            axios
            .post(`api/v1/clients-journals-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                receiptsList.value = response.data.results;
                store.commit('Journals/LIST_RECEIPTS', receiptsList.value)
                propResults.value = response.data;
                propArrLen.value = receiptsList.value.length;
                propCount.value = propResults.value.count;
                pageCount.value = Math.ceil(propCount.value / 50);
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
        }
        const resetFilters = () =>{
            store.commit('Journals/RESET_SEARCH_FILTERS')
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
        }
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
                client_category: "Customers",
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
            addingRight,rightsModule
        }
    }
};
</script>