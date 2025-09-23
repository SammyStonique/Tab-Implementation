<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="bookInvoice"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchInvoices"
            @resetFilters="resetFilters"
            @removeItem="removeInvoice"
            @removeSelectedItems="removeInvoices"
            @printList="printInvoiceList"
            v-model:printModalVisible="printModalVisible"
            :printTitle="printTitle"
            :pdfUrl="pdfUrl"
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
                :displayButtons="displayButtons" @handleSubmit="bookRentalInvoice" @handleReset="handleReset"
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
    name: 'Tenant_Invoices',
    components:{
        PageComponent, MovableModal,DynamicForm,JournalEntries,InvoiceLines,InvoicePayments,PrintModal
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
        const addButtonLabel = ref('New Booking');
        const addingRight = ref('Book Rental Invoice');
        const removingRight = ref('Deleting Tenant Invoice');
        const rightsModule = ref('PMS');
        const submitButtonLabel = ref('Add');
        const title = ref('Invoice Booking');
        const detailsTitle = ref('Item Details');
        const tabs = ref(['Journal Entries','Invoice Lines','Invoice Payments']);
        const activeTab = ref(0);
        const invoiceID = ref(null);
        const propComponentKey = ref(0);
        const tntComponentKey = ref(0);
        const invModalVisible = ref(false);
        const printModalVisible = ref(false);
        const printModalVisible1 = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Tenant Invoices');
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
        const ledgerID = ref('');
        const tenantID = ref(null);
        const propertyID = ref(null);
        const propertySearchID = ref('');
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);
        const tenantArray = computed(() => store.state.Active_Tenants.tenantUnitsArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Invoice#", key:"journal_no"},
            {label: "Date", key: "date"},
            {label: "Tenant Name", key:"tenant_name"},
            {label: "Property Name", key:"property_name"},
            {label: "Unit", key:"unit_number"},
            {label: "Description", key:"description"},
            {label: "Amount", key:"total_amount", type: "number"},
            {label: "Paid", key:"total_paid", type: "number"},
            {label: "Balance", key:"due_amount", type: "number"},
            {label: "Status", key:"status"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'print', icon: 'fa fa-print', title: 'Print Invoice', rightName: 'Print Tenant Invoice'},
            {name: 'download', icon: 'fa fa-download', title: 'Download Invoice', rightName: 'Print Tenant Invoice'},
            {name: 'send-sms', icon: 'fas fa-comment', title: 'Send SMS', rightName: 'Sending PMS SMS'},
            {name: 'send-email', icon: 'fas fa-envelope', title: 'Send Email', rightName: 'Sending PMS Emails'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Invoice', rightName: 'Deleting Tenant Invoice'},
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
        };
        const journal_no_search = ref("");
        const tenant_name_search = ref("");
        const tenant_code_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const status_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Invoice#...", value: journal_no_search, width:36},
            {type:'text', placeholder:"Tenant Code...", value: tenant_code_search, width:36},
            {type:'text', placeholder:"Tenant Name...", value: tenant_name_search, width:64},
            {
                type:'dropdown', placeholder:"Status..", value: status_search, width:32,
                options: [{text:'Open',value:'Open'},{text:'Closed',value:'Closed'}]
            },
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            {
                type:'search-dropdown', value: propertySearchID.value, width:64, componentKey: propComponentKey,
                selectOptions: propertyArray, optionSelected: handleSearchProperty,
                searchPlaceholder: 'Property Search...', dropdownWidth: '300px',
                fetchData: fetchProperties(), clearSearch: clearSearchProperty           
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        const handleSelectedProperty = async(option) =>{
            await store.dispatch('Properties_List/handleSelectedProperty', option)
            propertyID.value = store.state.Properties_List.propertyID;
        };
        const clearSelectedProperty = async() =>{
            await store.dispatch('Properties_List/updateState', {propertyID: ''});
            propertyID.value = ""
        }
        const fetchTenants = async() =>{
            if(propertyID.value){
                await store.dispatch('Active_Tenants/fetchTenantUnits', {company:companyID.value, property: propertyID.value})
            }       
        };
        const handleSelectedTenant = async(option) =>{
            await store.dispatch('Active_Tenants/handleSelectedTenantUnit', option)
            tenantID.value = store.state.Active_Tenants.tenantUnitID;
        };
        const clearSelectedTenant = async() =>{
            await store.dispatch('Active_Tenants/updateState', {tenantUnitID: ''});
            tenantID.value = ""
        }
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                {
                    type:'search-dropdown', label:"Property", value: propertyID.value, componentKey: propComponentKey,
                    selectOptions: propertyArray, optionSelected: handleSelectedProperty, required: false,
                    searchPlaceholder: 'Select Property...', dropdownWidth: '500px', updateValue: "",
                    fetchData: fetchProperties(), clearSearch: clearSelectedProperty            
                },
                {
                    type:'search-dropdown', label:"Tenant", value: tenantID.value, componentKey: tntComponentKey,
                    selectOptions: tenantArray, optionSelected: handleSelectedTenant, required: false,
                    searchPlaceholder: 'Select Tenant...', dropdownWidth: '500px', updateValue: "",
                    fetchData: fetchTenants(), clearSearch: clearSelectedTenant         
                },
                { type: 'dropdown', name: 'period_month',label: "Month", value: '', placeholder: "", required: true, options: [{ text: 'January', value: 'January' }, { text: 'February', value: 'February' },{ text: 'March', value: 'March' }, { text: 'April', value: 'April' },{ text: 'May', value: 'May' }, { text: 'June', value: 'June' },{ text: 'July', value: 'July' }, { text: 'August', value: 'August' },{ text: 'September', value: 'September' }, { text: 'October', value: 'October' },{ text: 'November', value: 'November' }, { text: 'December', value: 'December' }] },
                { type: 'text', name: 'period_year',label: "Year", value: "", required: true },
                
            ]
        };

        watch([propertyID], () => {
            if (propertyID.value) {
                tntComponentKey.value += 1;
                fetchTenants();
            }      
        }, { immediate: true });

        const handleReset = async() =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            propComponentKey.value += 1;
            propertyID.value = '';
            tntComponentKey.value += 1;
            tenantID.value = '';
        }
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const bookRentalInvoice = async() =>{
            showModalLoader();
            let formData = {
                property: propertyID.value,
                tenant: tenantID.value,
                period_month: formFields.value[2].value,
                period_year: formFields.value[3].value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=2; i < (formFields.value.length); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Journals/bookTenantInvoices', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Invoice(s) Booked Successfully!');
                        handleReset();
                        propComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while booking the invoice(s).');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to book invoice(s): ' + error.message);
                } finally {
                    hideModalLoader();
                    searchInvoices();
                }
            }
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
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                client_category: "Tenants",
                txn_type: "INV",
                client_name: tenant_name_search.value,
                client_code: tenant_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                journal_no: journal_no_search.value,
                status: status_search.value,
                reversed: "No",
                property: propertySearchID.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
   
            axios
            .post(`api/v1/clients-journals-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                invoicesList.value = response.data.results;
                store.commit('Journals/LIST_TENANTS_INVOICES', invoicesList.value)
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
            currentPage.value = 1;
            selectedValue.value = 50;
            tenant_name_search.value = "";
            tenant_code_search.value = "";
            from_date_search.value= "";
            to_date_search.value = "";
            journal_no_search.value= "";
            status_search.value = "";
            propComponentKey.value += 1;
            propertySearchID.value = "";
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
        const bookInvoice = () =>{
            invModalVisible.value = true;
            updateFormFields();
            formFields.value[2].value = getMonth(current_date);
            formFields.value[3].value = getYear(current_date);
            propertyID.value = "";
            tenantID.value = "";
            propComponentKey.value += 1;
            tntComponentKey.value += 1;
            propModalVisible.value = true;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
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
                const response = await store.dispatch('Journals/previewTenantInvoice',formData)
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
                await store.dispatch('Journals/downloadTenantInvoice',formData).
                then(()=>{
                    hideLoader();
                })
            }else if(action == 'send-sms'){
                showLoader();
                const tenantID = [row['tenant_id']];
                const particulars = [row['description']];
                const particularsAmnt = [row['total_amount']];
                const txnNo = [row['journal_no']];
                let formData = {
                    tenant: tenantID,
                    particulars: particulars,
                    transaction_numbers: txnNo,
                    particulars_amount: particularsAmnt,
                    journal: null,
                    company: companyID.value
                }
                await axios.post('api/v1/tenant-invoice-sms/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("SMS Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Tenant Invoice Template Not Set!")
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
            else if(action == 'send-email'){
                showLoader();
                const tenantID = [row['tenant_id']];
                const invoiceID = row['journal_id'];
                const particulars = [row['description']];
                const particularsAmnt = [row['total_amount']];
                const txnNo = [row['journal_no']];
                let formData = {
                    tenant: tenantID,
                    invoice: invoiceID,
                    particulars: particulars,
                    transaction_numbers: txnNo,
                    particulars_amount: particularsAmnt,
                    journal: null,
                    company: companyID.value
                }
                await axios.post('api/v1/tenant-invoice-email/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Email Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Tenant Invoice Template Not Set!")
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
            propComponentKey.value += 1;
            propertyID.value = "";
            tntComponentKey.value += 1;
            tenantID.value = "";
            handleReset();
        }

        const dropdownOptions = ref([
            {label: 'Withholding Tax', action: 'withholding-tax'},
            {label: 'SMS Tenant Invoices', action: 'send-sms'},
            {label: 'Email Tenant Invoices', action: 'send-email'},
        ]);
        const handleDynamicOption = async(option) =>{
            if(option == 'send-sms'){
                showLoader();
                const tenantID = [];
                const particulars = "";
                const particularsAmnt = "";
                const txnNo = "";
                const journalID = selectedIds.value
                let formData = {
                    tenant: tenantID,
                    particulars: particulars,
                    transaction_numbers: txnNo,
                    particulars_amount: particularsAmnt,
                    journal: journalID,
                    company: companyID.value
                }
                await axios.post('api/v1/tenant-invoice-sms/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("SMS Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Tenant Invoice Template Not Set!")
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
                const tenantID = [];
                const invoiceID = "";
                const particulars = "";
                const particularsAmnt = "";
                const txnNo = "";
                const journalID = selectedIds.value
                let formData = {
                    tenant: tenantID,
                    invoice: invoiceID,
                    particulars: particulars,
                    transaction_numbers: txnNo,
                    particulars_amount: particularsAmnt,
                    journal: journalID,
                    company: companyID.value
                }
                await axios.post('api/v1/tenant-invoice-email/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Email Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Tenant Invoice Template Not Set!")
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
        const printInvoiceList = () =>{
            showLoader();

            let formData = {
                journal_no: "",
                client_category: "Tenants",
                txn_type: "INV",
                client: tenant_name_search.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                status: "",
                company_id: companyID.value
            } 
   
            axios
            .post("api/v1/export-rental-invoices-pdf/", formData, { responseType: 'blob' })
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
            searchInvoices();
            
        })
        return{
            showTotals,title, searchInvoices,resetFilters, addButtonLabel, searchFilters, tableColumns, invoicesList,printModalVisible1,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,invModalVisible,printModalVisible,pdfUrl, printTitle,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, bookInvoice, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeInvoice, removeInvoices, dropdownOptions, handleDynamicOption, bookRentalInvoice,addingRight,removingRight,rightsModule,printInvoiceList,
            selectSearchQuantity,selectedValue,showDetails,detailsTitle,hideDetails,handleShowDetails,journalEntries,
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