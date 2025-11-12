<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            :showAddButton="showAddButton"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchAssetSales"
            @resetFilters="resetFilters"
            @removeItem="removeAssetSale"
            @removeSelectedItems="removeAssetSales"
            @importData="importSales"
            @printList="printSalesList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="salesList"
            :actions="actions"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            @handleShowDetails="handleShowDetails"
            @handleOpenLink="handleOpenLink"
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
                    <div v-show="activeTab == 0">
                        <LoanSchedules 
                            :loanSchedulesRows="loanScheduleRows"
                        />
                    </div>
                    <div v-show="activeTab == 1">
                        <div class="border border-slate-200 rounded relative py-2 w-[75%] mt-3 px-2 min-h-[50px]">                    
                            <ShowDetailsTable :key="tableKey" :columns="itemColumns" :rows="saleItemsRows" :idField="idFieldCharge" :actions="actionCharges" :showActions="showActions" :rightsModule="rightsModule" />
                        </div>
                    </div>
                </div>
                
            </div>
        </PageComponent>
    </div>
    <MovableModal v-model:visible="refModalVisible" :title="refTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="ref_modal_loader" @showLoader="showRefModalLoader" @hideLoader="hideRefModalLoader" @closeModal="closeRefModal">
        <DynamicForm 
            :fields="refFormFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="postSaleBalance" @handleReset="handleRefReset"
        />
    </MovableModal>
    <MovableModal v-model:visible="appModalVisible" :title="title1" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader1" @showLoader="showModalLoader1" @hideLoader="hideModalLoader1" @closeModal="closeModal1">
        <DynamicForm 
            :fields="formFields1" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="updateRepaymentDate" @handleReset="handleReset1"
        />
    </MovableModal>

</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import PrintJS from 'print-js';
import MovableModal from '@/components/MovableModal.vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import DynamicTable from '@/components/DynamicTable.vue';
import ShowDetailsTable from '@/components/ShowDetailsTable.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import LoanSchedules from "@/components/LoanSchedules.vue";
import Swal from 'sweetalert2';

export default{
    name: 'Historical_Sales',
    components:{
        PageComponent,MovableModal,SearchableDropdown,DynamicForm,DynamicTable,LoanSchedules,ShowDetailsTable
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('');
        const ledComponentKey = ref(0);
        const propComponentKey = ref(0);
        const displayButtons = ref(true);
        const trans_modal_loader = ref('none');
        const ref_modal_loader = ref('none');
        const modal_loader1 = ref('none');
        const idField = 'asset_sale_id';
        const showAddButton = ref(false);
        const addButtonLabel = ref('New Sale');
        const addingRight = ref('Adding Asset Sales');
        const removingRight = ref('Deleting Asset Sales');
        const rightsModule = ref('PSS');
        const submitButtonLabel = ref('Add');
        const showActions = ref(false);
        const selectedIds = ref([]);
        const salesList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const showDetails = ref(false);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const detailsTitle = ref('Sale Documents');
        const transTitle = ref('Approve/Reject Sale');
        const refTitle = ref('Post Sale Balance');
        const title1 = ref('Update Repayment Date');
        const transModalVisible = ref(false);
        const refModalVisible = ref(false);
        const appModalVisible = ref(false);
        const dropdownWidth = ref("500px")
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const showModal = ref(false);
        const tabs = ref(['Repayment Schedule','Sold Units']);
        const activeTab = ref(0);
        const appID = ref(null);
        const loanScheduleRows = ref([]);
        const saleItemsRows = ref([]);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Code", key:"sale_code", type:"link"},
            {label: "Client Name", key: "customer"},
            {label: "Sales Plan", key:"payment_plan"},
            {label: "Currency", key:"client_currency"},
            {label: "Amount", key:"formatted_total_amount"},
            {label: "Sale Balance", key:"sale_balance"},
            {label: "Notes", key:"notes"},
            {label: "Status", key:"approval_status", textColor: "textColor"},
            {label: "Exempt", key:"exempt_penalty"},
            {label: "Posted", key:"posted"},
            {label: "Due", key:"sale_due_date"},
            {label: "Status", key:"sale_status", txtColor: "textStatusColor"},
        ])
        const actions = ref([
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Sale', rightName: 'Viewing Asset Sales'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Sale', rightName: 'Deleting Asset Sales'},
        ]);
        const itemColumns = ref([
            {label: "Unit Number", key:"unit_number", type: "text"},
            {label: "Currency", key:"unit_currency", type: "text"},
            {label: "Selling Price", key:"unit_selling_price", type: "number"},
            {label: "Discount", key:"discount", type: "number"},
            {label: "Charges", key:"charges_amount", type: "number"},
            {label: "Total Amount", key:"sale_total_amount", type: "number"},
            {label: "Transferred", key:"transfer_status", type: "text"},
        ]);
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const cashbookArr = computed(() => store.state.Ledgers.ledgerArr);
        const cashbookID = ref("");
        const saleID = ref("");
        const client_name_search = ref('');
        const client_code_search = ref("");
        const asset_name_search = ref('');
        const asset_code_search = ref("");
        const sale_code_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const approval_status_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Sale Code...", value: sale_code_search, width:32,},
            {type:'text', placeholder:"Asset Code...", value: asset_code_search, width:32,},
            {type:'text', placeholder:"Asset Name...", value: asset_name_search, width:48,},
            {type:'text', placeholder:"Client Code...", value: client_code_search, width:32,},
            {type:'text', placeholder:"Client Name...", value: client_name_search, width:48,},
            {type:'date', title: "From Date", placeholder:"From Date...", value: from_date_search, width:32,},
            {type:'date', title: "To Date",placeholder:"To Date...", value: to_date_search, width:32,},
            {
                type:'dropdown', placeholder:"Status..", value: approval_status_search, width:32,
                options: [{text:'Active',value:'Active'},{text:'Defaulted',value:'Defaulted'},{text:'Cleared',value:'Cleared'}]
            },

        ]);

        const importSales = () =>{
            store.commit('pageTab/ADD_PAGE', {'PSS':'Import_Historical_Sales'})
            store.state.pageTab.pssActiveTab = 'Import_Historical_Sales';
        }
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
            ]
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }
        const displayRecalculationOptions = (value) =>{
            if(value == "Due Date"){
                formFields1.value[1].hidden = false;
                formFields1.value[2].hidden = false;
                formFields1.value[3].hidden = false;
                formFields1.value[4].hidden = true;
                formFields1.value[5].hidden = true;
                formFields1.value[6].hidden = true;
                formFields1.value[7].hidden = true;
                formFields1.value[4].required = false;
                formFields1.value[5].required = false;
                formFields1.value[8].required = false;
                formFields1.value[1].required = true;
                formFields1.value[2].required = true;
                formFields1.value[3].required = true;
            }else if(value == "Sale Amount"){
                formFields1.value[1].hidden = true;
                formFields1.value[2].hidden = true;
                formFields1.value[3].hidden = true;
                formFields1.value[4].hidden = false; 
                formFields1.value[5].hidden = false;
                formFields1.value[6].hidden = false;
                formFields1.value[7].hidden = false;               
                formFields1.value[4].required = true;
                formFields1.value[5].required = true;
                formFields1.value[8].required = true;
                formFields1.value[1].required = false;
                formFields1.value[2].required = false;
                formFields1.value[3].required = false;
            }
        }
        const formFields1 = ref([]);
        const updateFormFields1 = () => {
            formFields1.value = [
                { type: 'dropdown', name: 'recalc_mode',label: "Recalculate On", value: '', placeholder: "", required: true, options: [{ text: 'Due Date', value: 'Due Date' }, { text: 'Sale Amount', value: 'Sale Amount' }], method: displayRecalculationOptions },
                { type: 'number', name: 'day',label: "New Repayment Day", value: 1, required: true, hidden: true },
                { type: 'text', name: 'installment_from',label: "Installment From", value: 1, required: true, hidden: true },
                { type: 'text', name: 'installment_to',label: "Installment To", value: 1, required: true, hidden: true },
                { type: 'number', name: 'sale_amount',label: "Sale Amount", value: 0, required: false, hidden: true },
                { type: 'number', name: 'installments',label: "Installments", value: 0, required: false, hidden: true },
                { type: 'number', name: 'principal_amount',label: "Principal Amount", value: 0, required: false, hidden: true },
                { type: 'number', name: 'interest_amount',label: "Interest Amount", value: 0, required: false, hidden: true },
                { type: 'date', name: 'new_repayment_date',label: "New Date", value: '', required: false },
                { type: 'text-area', name: 'sale_remarks',label: "Sale Remarks", value: null, required: false,textarea_rows: '3', textarea_cols: '56'}
            ]
        };
        const handleReset1 = () =>{
            for(let i=0; i < formFields1.value.length; i++){
                formFields1.value[i].value = '';
            }
        };
        const showModalLoader1 = () =>{
            modal_loader1.value = "block";
        }
        const hideModalLoader1 = () =>{
            modal_loader1.value = "none";
        };
        const updateRepaymentDate = async() =>{
            showModalLoader1();
            if(formFields1.value[3].value < formFields1.value[2].value){
                toast.error("Installment To Cannot Be Less Than Installment From");
                hideModalLoader1();
                return;
            }
            let formData = {
                asset_sale: saleID.value,
                recalculation_mode: formFields1.value[0].value,
                new_day: formFields1.value[1].value,
                installment_from: formFields1.value[2].value,
                installment_to: formFields1.value[3].value,
                sale_balance: formFields1.value[4].value,
                installments: formFields1.value[5].value,
                principal_amount: formFields1.value[6].value,
                interest_amount: formFields1.value[7].value,
                new_repayment_date: formFields1.value[8].value,
                sale_remarks: formFields1.value[9].value || null,
                user: userID.value,
                company: companyID.value
            }
            axios.post(`api/v1/update-asset-sale-repayment-date/`,formData)
            .then((response)=>{
                if(response.data.msg == "Success"){
                    toast.success("Success")
                    closeModal1();
                    searchAssetSales();
                }else{
                    toast.error("Error Updating Repayment Date");
                }                   
            })
            .catch((error)=>{
                toast.error(error.message)
                hideModalLoader1();
            })
            .finally(()=>{
                hideModalLoader1();
            })
        
        };
        const closeModal1 = () =>{
            appModalVisible.value = false;
            saleID.value = null;
            hideModalLoader1();
        };
        const removeAssetSale = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    asset_sale: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Asset_Sales/deleteAssetSale',formData)
                    if(response && response.status == 200){
                        toast.success("Sale Removed Succesfully");
                        searchAssetSales();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Sale: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Sale") 
            }else{
                toast.error("Please Select A Sale To Remove")
            }
        }
        const removeAssetSales = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    asset_sale: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Asset_Sales/deleteAssetSale',formData)
                    if(response && response.status == 200){
                        toast.success("Sale(s) Removed Succesfully");
                        searchPropertys();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Sale: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Sale To Remove")
            }
        };
        const showTransModalLoader = () =>{
            trans_modal_loader.value = "block";
        }
        const hideTransModalLoader = () =>{
            trans_modal_loader.value = "none";
        }

        const closeTransModal = () =>{
            transModalVisible.value = false;
            saleID.value = null;
            hideTransModalLoader();
        };
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchAssetSales = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                asset_name: asset_name_search.value,
                asset_code: asset_code_search.value,
                sale_code: sale_code_search.value,
                client_name: client_name_search.value,
                client_code: client_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                sale_type: "Historical",
                sales_agent: '',
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/asset-sales-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                salesList.value = response.data.results;
                store.commit('Asset_Sales/LIST_SALES', salesList.value)
                propResults.value = response.data;
                propArrLen.value = salesList.value.length;
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
            searchAssetSales(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            client_name_search.value = "";
            asset_name_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            asset_code_search.value = "";
            sale_code_search.value = "";
            client_code_search.value = "";
            propComponentKey.value += 1;
            searchAssetSales();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchAssetSales();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchAssetSales();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchAssetSales();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchAssetSales();
            // scrollToTop();
        };
  
        const addNewSale = async() =>{
         
        };
        const handleOpenLink = async(row) =>{
            const saleID = row[idField];
            const saleStatus = row['approval_status']
            if(saleStatus == 'Approved'){
                let formData = {
                    company: companyID.value,
                    asset_sale: saleID
                }
                await store.dispatch('Asset_Sales/fetchSaleDetails',formData).
                then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'PSS':'Sale_Profile'});
                    store.state.pageTab.pssActiveTab = 'Sale_Profile'; 
                })
            }else{
                toast.error(`Cannot View ${saleStatus} Sale`)
            }
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const saleID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    asset_sale: saleID
                }
                await store.dispatch('Asset_Sales/deleteAssetSale',formData).
                then(()=>{
                    searchAssetSales();
                })
            }else if(action == 'view'){
                const saleID = row[idField];
                const applicationStatus = row['approval_status']
                if(applicationStatus == 'Approved'){
                    let formData = {
                        company: companyID.value,
                        asset_sale: saleID
                    }
                    await store.dispatch('Asset_Sales/fetchSaleDetails',formData).
                    then(()=>{
                        store.commit('pageTab/ADD_PAGE', {'PSS':'Sale_Profile'})
                        store.state.pageTab.pssActiveTab = 'Sale_Profile';
                    })
                }else{
                    toast.error(`Cannot View ${applicationStatus} Sale`)
                }
            }
        };
        const dropdownOptions = ref([
            {label: 'Exempt Penalty', action: 'exempt-penalty', icon: 'fa-ban', colorClass: 'text-yellow-600', rightName: 'Exempting Sale Penalty'},
            {label: 'Unexempt Penalty', action: 'unexempt-penalty', icon: 'fa-undo', colorClass: 'text-green-600' , rightName: 'Exempting Sale Penalty'},
            {label: 'SMS Statement Link', action: 'send-sms', icon: 'fa-sms', colorClass: 'text-blue-500', rightName: 'Sending PSS SMS'},
            {label: 'Email Sale Statement', action: 'send-email', icon: 'fa-envelope', colorClass: 'text-indigo-500', rightName: 'Sending PSS Emails'},
            {label: 'Post Sale Balance', action: 'post-balance', icon: 'fa-check-circle',colorClass: 'text-green-600', rightName: 'Posting Sale Balance'},
            {label: 'Unpost Sale Balance', action: 'unpost-balance', icon: 'fa-times-circle', colorClass: 'text-red-600', rightName: 'Posting Sale Balance'},
            {label: 'Update Repayment Date', action: 'repayment-date', icon: 'fa-calendar-alt', colorClass: 'text-grey-700', rightName: 'Updating Sale Repayment Date'},
        ]);
        const handleDynamicOption = async(option) =>{
            if( option == 'exempt-penalty'){
                let formData = {
                    asset_sale: selectedIds.value,
                    company: companyID.value
                }
                Swal.fire({
                    title: "Are you sure?",
                    text: `Do you wish to Exempt Penalty?`,
                    type: 'warning',
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Exempt!',
                    cancelButtonText: 'Cancel!',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom',
                    },
                    showLoaderOnConfirm: true,
                    }).then((result) => {
                    if (result.value) {
                        axios.post(`api/v1/exempt-asset-sale-penalty/`,formData)
                        .then((response)=>{
                        if(response.data.msg == 'Success'){
                            Swal.fire("Penalty Exempted Succesfully!", {
                                icon: "success",
                            });
                            searchAssetSales(); 
                        }else if(response.data.msg == 'Failed'){
                            Swal.fire("Penalty Already Exempted!", {
                                icon: "warning",
                            });
                        }
                        else{
                            Swal.fire({
                                title: "Error Exempting Penalty",
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
                        Swal.fire(`Penalty(s) has not been exempted!`);
                    }
                })
                            
            }else if( option == 'unexempt-penalty'){
                let formData = {
                    asset_sale: selectedIds.value,
                    company: companyID.value
                }
                Swal.fire({
                    title: "Are you sure?",
                    text: `Do you wish to Unexempt Penalty?`,
                    type: 'warning',
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Unexempt!',
                    cancelButtonText: 'Cancel!',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom',
                    },
                    showLoaderOnConfirm: true,
                    }).then((result) => {
                    if (result.value) {
                        axios.post(`api/v1/unexempt-asset-sale-penalty/`,formData)
                        .then((response)=>{
                        if(response.data.msg == 'Success'){
                            Swal.fire("Penalty Unexempted Succesfully!", {
                                icon: "success",
                            }); 
                            searchAssetSales();
                        }else if(response.data.msg == 'Failed'){
                            Swal.fire("Penalty Not Exempted!", {
                                icon: "warning",
                            });
                        }
                        else{
                            Swal.fire({
                                title: "Error Unexempting Penalty",
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
                        Swal.fire(`Penalty(s) has not been Unexempted!`);
                    }
                })                 
            }else if(option == 'send-email'){
                showLoader();
                let formData = {
                    company: companyID.value,
                    asset_sale: selectedIds.value,
                    date_from: from_date_search.value,
                    date_to: to_date_search.value,
                    company: companyID.value
                }
                axios.post('api/v1/asset-sale-statement-email/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Email Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Sale Statement Template Not Set!")
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
            }else if( option == 'post-balance'){
                refModalVisible.value = true;
                handleRefReset();                             
            }else if( option == 'unpost-balance'){
                let formData = {
                    asset_sale: selectedIds.value,
                    company: companyID.value
                }
                Swal.fire({
                    title: "Are you sure?",
                    text: `Do you wish to Unpost Balance?`,
                    type: 'warning',
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Unpost!',
                    cancelButtonText: 'Cancel!',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom',
                    },
                    showLoaderOnConfirm: true,
                    }).then((result) => {
                    if (result.value) {
                        axios.post(`api/v1/unpost-historical-asset-sale-balance/`,formData)
                        .then((response)=>{
                        if(response.data.msg == 'Success'){
                            Swal.fire("Balance Unposted Succesfully!", {
                                icon: "success",
                            }); 
                            searchAssetSales();
                        }else if(response.data.msg == 'Failed'){
                            Swal.fire("Balance Not Unposted!", {
                                icon: "warning",
                            });
                        }
                        else{
                            Swal.fire({
                                title: "Error Unposting Balance",
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
                        Swal.fire(`Balance(s) has not been Unposted!`);
                    }
                })                 
            }else if(option == 'send-sms'){
                showLoader();
                let formData = {
                    company: companyID.value,
                    asset_sale: selectedIds.value,
                    company: companyID.value
                }
                await axios.post('api/v1/sale-client-statement-sms/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("SMS Sent!")
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
            }else if(option == 'repayment-date'){
                if(selectedIds.value.length == 1){
                    saleID.value = selectedIds.value[0];
                    appModalVisible.value = true;
                    updateFormFields1();
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
            
                }else if(selectedIds.value.length > 1){
                    toast.error("You have selected more than 1 Sale")
                }else{
                    toast.error("Please Select A Sale")
                }
            }
        };
        const handleShowDetails = async(row) =>{
            activeTab.value = 0;
            appID.value = row['asset_sale_id'];
            detailsTitle.value = row['sale_code'] + ' Schedules';
            showDetails.value = true;
            let formData = {
                asset_sale: row['asset_sale_id'],
                company: companyID.value
            }
            axios.post('api/v1/asset-sale-schedules-search/',formData)
            .then((response)=>{
                loanScheduleRows.value = response.data.armotization_schedules;
            })
            .catch((error)=>{
                console.log(error.message)
            })
        };
        const selectTab = async(index) => {
            let formData = {
                company: companyID.value,
                asset_sale: appID.value,
            }
            if(index == 1){
                axios.post('api/v1/get-asset-sale-items/',formData)
                .then((response)=>{
                    saleItemsRows.value = response.data;
                })
                .catch((error)=>{
                    console.log(error.message)
                })
                activeTab.value = index;
            }else{
                activeTab.value = index;
                hideLoader();
            }

        };
        const hideDetails = async() =>{
            showDetails.value = false;
        };
        
        const printSalesList = () =>{
            showLoader();
            let formData = {
                asset_name: asset_name_search.value,
                asset_code: asset_code_search.value,
                sale_code: sale_code_search.value,
                client_name: client_name_search.value,
                client_code: client_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                sale_type: "Historical",
                company_id: companyID.value,
                page_size: selectedValue.value
            } 

            axios
            .post("api/v1/export-asset-sales-pdf/", formData, { responseType: 'blob' })
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
        };
        const fetchLedgers = async() =>{
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
        const refFormFields = ref([
            {  
                type:'search-dropdown', label:"Posting Account", value: cashbookID.value, componentKey: ledComponentKey,
                selectOptions: cashbookArr, optionSelected: handleSelectedLedger, required: true,
                searchPlaceholder: 'Select Posting Account...', dropdownWidth: '500px', updateValue: "",
                fetchData: fetchLedgers(), clearSearch: clearSelectedLedger
            },
       ]);
        const handleRefReset = () =>{
            for(let i=0; i < refFormFields.value.length; i++){
                refFormFields.value[i].value = '';
            }
            cashbookID.value = null;
            ledComponentKey.value +=1;
        }
        const showRefModalLoader = () =>{
            ref_modal_loader.value = "block";
        }
        const hideRefModalLoader = () =>{
            ref_modal_loader.value = "none";
        }
        const postSaleBalance = async() =>{
            showRefModalLoader();
            let formData = {
                ledger: cashbookID.value,
                asset_sale: selectedIds.value,
                company: companyID.value
            }
            axios.post(`api/v1/post-historical-asset-sale-balance/`,formData)
            .then((response)=>{
                if(response.data.msg == "Success"){
                    toast.success("Success")
                    closeRefModal();
                    searchAssetSales();
                }else{
                    toast.error("Error Posting Sale Balance")
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
            handleRefReset();
            hideRefModalLoader();
        };
        onBeforeMount(()=>{
            searchAssetSales();
            
        })
        return{
            showAddButton,searchAssetSales,resetFilters, addButtonLabel, searchFilters, tableColumns, salesList,dropdownWidth,displayButtons,importSales,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,flex_basis,flex_basis_percentage,formFields,handleReset,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,handleOpenLink,showDetails,handleShowDetails,detailsTitle,hideDetails,
            submitButtonLabel, showModal, showLoader, loader, hideLoader, removeAssetSale, removeAssetSales,showActions,
            handleSelectionChange,addingRight,removingRight,rightsModule,printSalesList,selectSearchQuantity,selectedValue,
            modal_left,modal_top,modal_width,trans_modal_loader,transModalVisible,transTitle,showTransModalLoader,hideTransModalLoader,closeTransModal,
            dropdownOptions,handleDynamicOption,refTitle,refFormFields,refModalVisible,ref_modal_loader,handleRefReset,showRefModalLoader,hideRefModalLoader,closeRefModal,
            postSaleBalance,tabs,activeTab,loanScheduleRows,itemColumns,saleItemsRows,selectTab,
            appModalVisible,title1,modal_loader1,showModalLoader1,hideModalLoader1,updateFormFields,formFields1,handleReset1,closeModal1,updateRepaymentDate,
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
