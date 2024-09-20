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
            @printList="printList"
            :columns="tableColumns"
            :rows="invoicesList"
            :actions="actions"
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

export default{
    name: 'General_Invoices',
    components:{
        PageComponent, MovableModal,DynamicForm
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
        const addButtonLabel = ref('New Invoice');
        const submitButtonLabel = ref('Add');
        const title = ref('Invoice Booking');
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
            {label: "Customer Name", key:"customer_name"},
            {label: "Description", key:"description"},
            {label: "Amount", key:"total_amount"},
            {label: "Paid", key:"total_paid"},
            {label: "Balance", key:"due_amount"},
            {label: "Status", key:"status"},
        ])
        
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Invoice'},
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
        
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                {
                    type:'search-dropdown', label:"Property", value: propertyID.value, componentKey: propComponentKey,
                    selectOptions: propertyArray, optionSelected: handleSelectedProperty, required: false,
                    searchPlaceholder: 'Select Property...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchProperties(), clearSearch: clearSelectedProperty()            
                },
                {
                    type:'search-dropdown', label:"Tenant", value: tenantID.value, componentKey: tntComponentKey,
                    selectOptions: tenantArray, optionSelected: handleSelectedTenant, required: false,
                    searchPlaceholder: 'Select Tenant...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchTenants(), clearSearch: clearSelectedTenant()            
                },
                { type: 'dropdown', name: 'period_month',label: "Month", value: '', placeholder: "", required: true, options: [{ text: 'January', value: 'January' }, { text: 'February', value: 'February' },{ text: 'March', value: 'March' }, { text: 'April', value: 'April' },{ text: 'May', value: 'May' }, { text: 'June', value: 'June' },{ text: 'July', value: 'July' }, { text: 'August', value: 'August' },{ text: 'September', value: 'September' }, { text: 'October', value: 'October' },{ text: 'November', value: 'November' }, { text: 'December', value: 'December' }] },
                { type: 'text', name: 'period_year',label: "Year", value: "", required: true },
                
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
            store.commit('pageTab/ADD_PAGE', {'FA':'Invoice_Details'});
            store.state.pageTab.faActiveTab = 'Invoice_Details'; 
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
                property: null,
                company: companyID.value
            } 
   
            axios
            .post(`api/v1/clients-journals-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                invoicesList.value = response.data.results;
                store.commit('Journals/LIST_INVOICES', invoicesList.value)
                propResults.value = response.data;
                propArrLen.value = invoicesList.value.length;
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
        }
        onBeforeMount(()=>{
            searchInvoices();
            
        })
        return{
            title, searchInvoices,resetFilters, addButtonLabel, searchFilters, tableColumns, invoicesList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,invModalVisible,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeInvoice, removeInvoices, dropdownOptions, handleDynamicOption, addNewInvoice
        }
    }
};
</script>