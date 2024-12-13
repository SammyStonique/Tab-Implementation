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
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="invoicesList"
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
            :selectedValue="selectedValue"
            @selectSearchQuantity="selectSearchQuantity"
        />
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
import PrintJS from 'print-js';

export default{
    name: 'Debit_Notes',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const { getYear } = useDateFormatter();
        const { getMonth } = useDateFormatter();
        const addingRight = ref('Adding Debit Notes');
        const rightsModule = ref('PMS');
        const current_date = new Date();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'journal_id';
        const addButtonLabel = ref('New Debit Note');
        const submitButtonLabel = ref('Add');
        const title = ref('Invoice Booking');
        const propComponentKey = ref(0);
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
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const tenantID = ref('');
        const propertyID = ref(null);
        const propertySearchID = ref('');
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);
        const tenantArray = computed(() => store.state.Active_Tenants.tenantUnitsArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "DBN#", key:"journal_no"},
            {label: "Date", key: "date"},
            {label: "Tenant Name", key:"tenant_name"},
            {label: "Property Name", key:"property_name"},
            {label: "Unit", key:"unit_number"},
            {label: "Description", key:"description"},
            {label: "Amount", key:"total_amount", type:"number"},
            {label: "Paid", key:"total_paid", type:"number"},
            {label: "Balance", key:"due_amount", type:"number"},
            {label: "Status", key:"status"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'print', icon: 'fa fa-print', title: 'Print Invoice', rightName: 'Print Tenant Invoice'},
            {name: 'download', icon: 'fa fa-download', title: 'Download Invoice', rightName: 'Print Tenant Invoice'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Invoice',rightName: 'Deleting Debit Notes'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
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
        const client_name_search = ref('');
        const client_code_search = ref('');
        const from_date_search = ref('');
        const to_date_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Tenant Code...", value: client_code_search, width:36},
            {type:'text', placeholder:"Tenant Name...", value: client_name_search, width:64},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            {
                type:'search-dropdown', value: propertySearchID.value, width:64, componentKey: propComponentKey,
                selectOptions: propertyArray, optionSelected: handleSearchProperty,
                searchPlaceholder: 'Property Search...', dropdownWidth: '200px',
                fetchData: fetchProperties(), clearSearch: clearSearchProperty()             
            },
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
            propComponentKey.value += 1;
            propertySearchID.value = '';
        }
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const addNewInvoice = () =>{
            store.commit('pageTab/ADD_PAGE', {'PMS':'Debit_Note_Details'});
            store.state.pageTab.pmsActiveTab = 'Debit_Note_Details'; 
        }
        const removeInvoice = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    journal: selectedIds.value,
                    txn_type: "DBN"
                }
                try{
                    const response = await store.dispatch('Journals/deleteDebitNote',formData)
                    if(response && response.status == 200){
                        toast.success("Debit Note Removed Succesfully");
                        searchInvoices();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Debit Note: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    searchInvoices();
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Debit Note") 
            }else{
                toast.error("Please Select A Debit Note To Remove")
            }
        }
        const removeInvoices = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    journal: selectedIds.value,
                    txn_type: "DBN"
                }

                try{
                    const response = await store.dispatch('Journals/deleteDebitNote',formData)
                    if(response && response.msg == "Success"){
                        toast.success("Debit Note(s) Removed Succesfully");
                        searchInvoices();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Debit Note: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    searchInvoices();
                }
            }else{
                toast.error("Please Select A Debit Note To Remove")
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
                client_category: "Tenants",
                txn_type: "DBN",
                client_name: client_name_search.value,
                client_code: client_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                property: propertySearchID.value,
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
            store.commit('Journals/RESET_SEARCH_FILTERS')
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
                    txn_type: "DBN"
                }
                await store.dispatch('Journals/deleteDebitNote',formData).
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
        const printInvoiceList = () =>{
            showLoader();

            let formData = {
                journal_no: "",
                client_category: "Customers",
                txn_type: "DBN",
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
            addingRight,rightsModule,selectSearchQuantity,selectedValue
        }
    }
};
</script>