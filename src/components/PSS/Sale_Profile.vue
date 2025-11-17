<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[750px]">
                <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Sale Details</h1>
                <div class="tabs pt-2">
                    <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                        {{ tab }}
                    </button>
                </div>
                <div class="tab-content mt-3">
                    <div v-if="activeTab == 0">
                        <div class="flex">
                            <div class="basis-1/2 border-left border-gray-400">
                                <h1 class="font-bold mb-10">Sale Details</h1>
                                <table class="w-full">
                                    <tr class="text-left">
                                        <td class="font-bold ">Sale Code:</td>
                                        <td> {{ saleDetails.sale_code }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold">Sale Date:</td>
                                        <td>{{ saleDetails.date }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Client Code:</td>
                                        <td>{{ saleClient.client_code }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold">Client Name:</td>
                                        <td>{{ saleClient.client_name }}</td>
                                        
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Asset:</td>
                                        <td>{{ saleAsset.name }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Installments:</td>
                                        <td>{{ saleDetails.installments }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Sale Currency:</td>
                                        <td>{{ saleDetails.sale_currency }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Interest Method:</td>
                                        <td>{{ saleDetails.interest_method }}</td>
                                    </tr>
                                    
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Sale Amount:</td>
                                        <td>{{ saleDetails.total_amount }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Approved Amount:</td>
                                        <td>{{ saleDetails.total_amount }}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div v-if="activeTab == 1" class="text-left"> 
                        <button @click="printSchedule" class="rounded bg-green-400 cursor-pointer text-sm mr-2 mb-1.5  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Print Schedule</button>                                   
                        <DynamicTable :key="tableKey" :rightsModule="rightsModule" :columns="scheduleColumns" :rows="computedScheduleRows" :idField="idFieldSchedule" :showTotals="showTotals" :actions="actionsSchedule" @action-click="scheduleActionClick" />
                    </div>
                    <div v-show="activeTab == 2"> 
                        <div class="relative w-[100%] bg-white z-50 px-6">
                            <FilterBar 
                                :showAddButton="showAddButton"
                                :filters="searchFilters" 
                                @search="searchLoanStatement"
                                @reset="resetFilters"
                                @printList="printSaleStatement"
                                @printExcel="printExcel"
                                @printCSV="printCSV"
                                :dropdownOptions="dropdownOptions"
                                @handleDynamicOption="handleDynamicOption1"
                                v-model:printModalVisible="printModalVisible"
                                :printTitle="printTitle"
                                :pdfUrl="pdfUrl"
                            />
                        </div>   
                        <div class="table w-[100%] top-[17.1rem] z-30 px-6">              
                            <DynamicTable :key="statementTableKey" :rightsModule="rightsModule" :columns="statement1Columns" :rows="statement1Rows" :idField="idFieldStatement" :actions="actionsStatement" :showActions="showActions"/>
                        </div>
                    </div> 
                    <div v-show="activeTab == 3">                  
                        <DynamicTable :key="paymentTableKey" :rightsModule="rightsModule" :columns="paymentColumns" :rows="computedPaymentRows" :idField="idFieldPayment" :actions="actionsUtility" @action-click="paymentActionClick" 
                                        :showActions="showActions" :showTotals="showTotals"/>
                    </div>   
                    <div v-show="activeTab == 4">                  
                        <DynamicTable :key="documentTableKey" :rightsModule="rightsModule" :columns="documentColumns" :rows="computedDocumentRows" :idField="idFieldDocument" :actions="actionsDocument" @action-click="documentActionClick"/>
                    </div> 
                    <div v-show="activeTab == 5">                  
                        <DynamicTable :key="documentTableKey" :columns="activityColumns" :rows="computedActivityRows" :showActions=false />
                    </div> 
                </div>
            </div>
        </template>
    </PageStyleComponent>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch, reactive } from 'vue';
import PageStyleComponent from '../PageStyleComponent.vue';
import FilterBar from "@/components/FilterBar.vue";
import DynamicTable from '@/components/DynamicTable.vue';
import DynamicForm from '../NewDynamicForm.vue';
import MovableModal from '@/components/MovableModal.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import axios from 'axios';
import PrintJS from 'print-js';
import Swal from 'sweetalert2';

export default defineComponent({
    name: 'Sale_Profile',
    components:{
        PageStyleComponent, DynamicTable, MovableModal, DynamicForm,FilterBar
    },
    setup(props,{emit}){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const showAddButton = ref(false);
        const dep_modal_loader = ref('none');
        const util_modal_loader = ref('none');
        const tnt_modal_loader = ref('none');
        const rightsModule = ref('PSS');
        const allowedRights = ref([]);
        const depModalVisible = ref(false);
        const printModalVisible = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Sale Statement');
        const displayButtons = ref(true);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const tabs = ref(['Sale Details','Armotization Schedule','Statement','Sale Repayment','Sale Documents','Sale Activities']);
        const activeTab = ref(0);
        const mainComponentKey = ref(0);
        const tableKey = ref(0);
        const paymentTableKey = ref(0);
        const scheduleTableKey = ref(0);
        const statementTableKey = ref(0);
        const documentTableKey = ref(0);
        const idFieldSchedule = ref('asset_sale_schedule_id');
        const idFieldPayment = ref('utility_id');
        const idFieldStatement = ref('');
        const saleID = computed(()=> store.state.Asset_Sales.selectedSaleID);
        const computedScheduleRows = computed(()=> store.state.Asset_Sales.selectedSchedules);
        const computedPaymentRows = computed(()=> store.state.Asset_Sales.selectedRepayments);
        const computedDocumentRows = computed(()=> store.state.Asset_Sales.selectedDocuments);
        const computedActivityRows = computed(()=> store.state.Asset_Sales.saleActivities);
        const statementRows = computed(()=> store.state.Asset_Sales.selectedTransactions);
        const statement1Rows = computed(()=> store.state.Asset_Sales.selectedStatement);
        const saleDetails = computed(()=> store.state.Asset_Sales.saleDetails);
        const saleClient = computed(()=> store.state.Asset_Sales.saleClient);
        const saleAsset = computed(()=> store.state.Asset_Sales.saleAsset);
        const scheduleColumns = ref([
            {type: "checkbox"},
            {label: "#", key:"installment", type: "text"},
            {label: "Due", key:"due_date", type: "text", txtColor: "txtColor"},
            {label: "Balance", key:"formatted_asset_balance", type: "text"},
            {label: "Principal", key:"formatted_principal_amount", type: "number"},
            {label: "Interest", key:"formatted_interest_amount", type: "number"},
            {label: "Penalty", key:"penalty", type: "number"},
            {label: "Sch. Total", key:"formatted_schedule_repayment", type: "number"},
            {label: "Prepay.", key:"formatted_asset_prepayment", type: "number"},
            {label: "Paid Princ.", key:"formatted_repaid_principal_amount", type: "number"},
            {label: "Paid Int.", key:"formatted_repaid_interest_amount", type: "number"},
            {label: "Paid Pen.", key:"formatted_repaid_penalty", type: "number"},
            {label: "Total Paid", key:"formatted_schedule_payment", type: "number", },
            {label: "Princ. Bal", key:"formatted_principal_balance", type: "number"},
            {label: "Int. Bal.", key:"formatted_interest_balance", type: "number"},
            {label: "Total Bal.", key:"formatted_installment_balance", type: "number", txtColor: "txtColor"},
            {label: "I.P", key:"interest_posted", type: "text"},
            {label: "C.R.P", key:"credit_reduction_applied", type: "text"},
        ]);
        const showTotals = ref(true);
        const actionsSchedule = ref([
            {name: 'post-interest', icon: 'fa fa-spinner', title: 'Post Interest', rightName: 'Posting Sale Interest'},
            {name: 'unpost-interest', icon: 'fa fa-minus-circle', title: 'Unpost Interest', rightName: 'Posting Sale Interest'},
            {name: 'process-credit-reduction', icon: 'fa fa-arrow-down', title: 'Process C.R', rightName: 'Posting Sale Interest'},
            {name: 'unprocess-credit-reduction', icon: 'fa fa-minus-circle', title: 'Unprocess C.R', rightName: 'Posting Sale Interest'},
        ]);

        const paymentColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"issue_date", type: "text", editable: false},
            {label: "Txn No", key:"journal_no", type: "text", editable: false},
            {label: "Description", key: "description", type: "text", editable: false},
            {label: "Amount", key: "amount", type: "number", editable: false},
        ]);
        const documentColumns = ref([
            {label: "Document Type", key:"document_type", type: "text"},
            {label: "Document Name", key:"document_name", type: "text"},
        ]);
        const actionsDocument = ref([
            {name: 'preview', icon: 'fa fa-paperclip', title: 'View Document',rightName: 'Adding Sale Documents'},
        ]);
        const activityColumns = ref([
            {label: "Date", key:"created_at", type: "text"},
            {label: "Activity Type", key:"activity_type", type: "text"},
            {label: "Description", key:"description", type: "text"},
            {label: "Done By", key:"done_by", type: "text"},
        ]);
        const actionsUtility = ref([

        ]);
        const showActions = ref(false);

        const statementColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date", type: "text", editable: false},
            {label: "Ref No", key:"reference_no", type: "text", editable: false},
            {label: "Txn No", key: "journal_no", type: "text", editable: false},
            {label: "Narration", key: "description", type: "text", editable: false, maxWidth:"1200px"},
            {label: "Charges", key: "debit_amount", type: "text", editable: false},
            {label: "Payments", key: "credit_amount", type: "text", editable: false},
            {label: "Balance", key: "running_balance", type: "text", editable: false},
        ]);

        const actionsStatement = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Transaction'},
        ]);
        const statement1Columns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date", type: "text", editable: false},
            {label: "Amount Paid", key:"amount_paid", type: "text", editable: false},
            {label: "Down Payment", key: "down_payment", type: "text", editable: false},
            {label: "Principal", key: "principal", type: "text", editable: false},
            {label: "Interest", key: "interest", type: "text", editable: false},
            {label: "Penalty", key: "penalty", type: "text", editable: false},
            {label: "Prepayment", key: "prepayment", type: "text", editable: false},
            {label: "Running Balance", key: "running_balance", type: "text", editable: false},
        ]);

        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            
        ]);
        const searchLoanTransactions = async() =>{
            showLoader();
            let formData = {
                client: saleDetails.value.loan_ledger_id,
                company: companyID.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                page_size: 1000
            }
            try{
                const response = await store.dispatch('Ledgers/fetchClientJournals', formData)
            }
            catch(error){

            }finally{
                hideLoader();
            }  
        }
        const dropdownOptions = ref([
            {label: 'Email Sale Statement', action: 'send-email', icon: 'fa-envelope', colorClass: 'text-indigo-500', rightName: 'Sending PSS Emails'},
        ]);
        
        const handleDynamicOption1 = async(option) =>{           
            if(option == 'send-sms'){
                showLoader();
                let formData = {
                    client: [saleDetails.value.asset_sale_id],
                    company: companyID.value,
                    date_from: from_date_search.value,
                    date_to: to_date_search.value,
                    company: companyID.value
                }
                await axios.post('api/v1/asset-sale-statement-sms/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("SMS Sent!")
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
            }else if(option == 'send-email'){
                showLoader();
                let formData = {
                    company: companyID.value,
                    asset_sale: [saleDetails.value.asset_sale_id],
                    date_from: from_date_search.value,
                    date_to: to_date_search.value,
                    company: companyID.value
                }
                await axios.post('api/v1/asset-sale-statement-email/',formData).
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
            }
        };
        
        const printSaleStatement = () =>{
            showLoader();
            let formData = {
                company: companyID.value,
                asset_sale: saleDetails.value.asset_sale_id,
                page_size: "1000"
                // date_from: from_date_search.value,
                // date_to: to_date_search.value,
            }
            axios
            .post("api/v1/asset-sale-statement-pdf/", formData, { responseType: 'blob' })
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
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchLoanTransactions();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchLoanTransactions();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchLoanTransactions();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchLoanTransactions();
        }
        const resetFilters = () =>{
            from_date_search.value = "";
            to_date_search.value = "";
            searchLoanTransactions();
        }

        const selectTab = async(index) => {
            showLoader();
            let formData = {
                company: companyID.value,
                asset_sale: saleID.value
            }
            let formData1 = {
                company: companyID.value,
                asset_sale: saleDetails.value.asset_sale_id,
                page_size: "1000"
            }
            if(index == 2){
                activeTab.value = index;
                await store.dispatch('Asset_Sales/fetchSaleStatement',formData1)
                .then(()=>{
                    hideLoader();
                })
            }else if( index == 1){
                activeTab.value = index;
                await store.dispatch('Asset_Sales/fetchSaleDetails',formData)
                .then(()=>{
                    hideLoader();
                })
            }
            else if( index == 3){
                activeTab.value = index;
                hideLoader();
            }else{
                activeTab.value = index;
                hideLoader();
            }

        };

        const showLoader = () =>{
            loader.value = "block";
        };
        const hideLoader = () =>{
            loader.value = "none";
        };

        const scheduleActionClick = async(rowIndex, action, row) =>{
            if( action == 'post-interest'){
                const postedStatus = row['interest_posted']
                const scheduleID = [row['asset_sale_schedule_id']]
                if(postedStatus == 'No'){
                    let formData = {
                        armotization_schedule: scheduleID,
                        company: companyID.value
                    }
                    Swal.fire({
                        title: "Are you sure?",
                        text: `Do you wish to Post Interest?`,
                        type: 'warning',
                        showCloseButton: true,
                        showCancelButton: true,
                        confirmButtonText: 'Yes, Post!',
                        cancelButtonText: 'Cancel!',
                        customClass: {
                            confirmButton: 'swal2-confirm-custom',
                            cancelButton: 'swal2-cancel-custom',
                        },
                        showLoaderOnConfirm: true,
                        }).then((result) => {
                        if (result.value) {
                            axios.post(`api/v1/post-armotization-interest/`,formData)
                            .then((response)=>{
                            if(response.data.msg == 'Success'){
                                Swal.fire("Interest Posted Succesfully!", {
                                    icon: "success",
                                }); 
                            }else if(response.data.msg == 'Failed'){
                                Swal.fire("Interest Already Posted!", {
                                    icon: "warning",
                                });
                            }
                            else{
                                Swal.fire({
                                    title: "Error Posting Interest",
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
                            Swal.fire(`Interest(s) has not been posted!`);
                        }
                    })
                }else{
                    toast.error("Interest Already Posted")
                }
                           
            }else if( action == 'unpost-interest'){
                const postedStatus = row['interest_posted']
                const scheduleID = [row['asset_sale_schedule_id']]
                if(postedStatus == 'Yes'){
                    let formData = {
                        armotization_schedule: scheduleID,
                        company: companyID.value
                    }
                    Swal.fire({
                        title: "Are you sure?",
                        text: `Do you wish to Unpost Interest?`,
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
                            axios.post(`api/v1/unpost-armotization-interest/`,formData)
                            .then((response)=>{
                            if(response.data.msg == 'Success'){
                                Swal.fire("Interest Unposted Succesfully!", {
                                    icon: "success",
                                }); 
                            }else if(response.data.msg == 'Failed'){
                                Swal.fire("Interest Not Posted!", {
                                    icon: "warning",
                                });
                            }
                            else{
                                Swal.fire({
                                    title: "Error Unposting Interest",
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
                            Swal.fire(`Interest(s) has not been unposted!`);
                        }
                    })
                }else{
                    toast.error("Interest Not Posted")
                }
                           
            }
            if( action == 'process-credit-reduction'){
                const postedStatus = row['credit_reduction_applied']
                const scheduleID = [row['asset_sale_schedule_id']]
                if(postedStatus == 'No'){
                    let formData = {
                        armotization_schedule: scheduleID,
                        company: companyID.value
                    }
                    Swal.fire({
                        title: "Are you sure?",
                        text: `Do you wish to Process Credit Reduction?`,
                        type: 'warning',
                        showCloseButton: true,
                        showCancelButton: true,
                        confirmButtonText: 'Yes, Post!',
                        cancelButtonText: 'Cancel!',
                        customClass: {
                            confirmButton: 'swal2-confirm-custom',
                            cancelButton: 'swal2-cancel-custom',
                        },
                        showLoaderOnConfirm: true,
                        }).then((result) => {
                        if (result.value) {
                            axios.post(`api/v1/process-credit-reduction/`,formData)
                            .then((response)=>{
                            if(response.data.msg == 'Success'){
                                Swal.fire("C.R Done Succesfully!", {
                                    icon: "success",
                                }); 
                            }else if(response.data.msg == 'Failed'){
                                Swal.fire("C.R Already Processed!", {
                                    icon: "warning",
                                });
                            }
                            else{
                                Swal.fire({
                                    title: "Error Processing C.R",
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
                            Swal.fire(`C.R(s) has not been processed!`);
                        }
                    })
                }else{
                    toast.error("C.R Already Processed")
                }
                           
            }else if( action == 'process-credit-reduction'){
                const postedStatus = row['credit_reduction_applied']
                const scheduleID = [row['asset_sale_schedule_id']]
                if(postedStatus == 'Yes'){
                    let formData = {
                        armotization_schedule: scheduleID,
                        company: companyID.value
                    }
                    Swal.fire({
                        title: "Are you sure?",
                        text: `Do you wish to Unprocess Credit Reduction?`,
                        type: 'warning',
                        showCloseButton: true,
                        showCancelButton: true,
                        confirmButtonText: 'Yes, Unprocess!',
                        cancelButtonText: 'Cancel!',
                        customClass: {
                            confirmButton: 'swal2-confirm-custom',
                            cancelButton: 'swal2-cancel-custom',
                        },
                        showLoaderOnConfirm: true,
                        }).then((result) => {
                        if (result.value) {
                            axios.post(`api/v1/unprocess-credit-reduction/`,formData)
                            .then((response)=>{
                            if(response.data.msg == 'Success'){
                                Swal.fire("Credit Reduction Unprocessed Succesfully!", {
                                    icon: "success",
                                }); 
                            }else if(response.data.msg == 'Failed'){
                                Swal.fire("Credit Reduction Not Processed!", {
                                    icon: "warning",
                                });
                            }
                            else{
                                Swal.fire({
                                    title: "Error Unprocessing Credit Reduction",
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
                            Swal.fire(`Credit Reduction(s) has not been unprocessed!`);
                        }
                    })
                }else{
                    toast.error("Credit Reduction Not Processed")
                }
                           
            }
            else if(action == 'delete'){
 
            }
        }
        const printSchedule = () =>{
            showLoader();
            let formData = {
                company: companyID.value,
                asset_sale: saleID.value,
            }
            axios
            .post("api/v1/export-asset-sale-schedule-pdf/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const blob1 = new Blob([response.data], { type: 'application/pdf' });
                        const url = URL.createObjectURL(blob1);
                        // PrintJS({printable: url, type: 'pdf'});
                        pdfUrl.value = url;
                        printModalVisible.value = true;
                        printTitle.value = "Print Sale Repayment Schedule";
                    }
                })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        const previewDocument = (formData) =>{
            showLoader();
            axios
            .post("api/v1/preview-loan-document-pdf/", formData, { responseType: 'blob' })
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
        const documentActionClick = async(rowIndex, action, row) =>{
            if( action == 'preview'){
                const docID = row['loan_document_id'];
                let formData = {
                    loan_document: docID,
                    company: companyID.value
                } 
                previewDocument(formData);
                
            }
        }

        const paymentActionClick = async(rowIndex, action, row) =>{
            if( action == 'void-utility'){
                
            }else if( action == 'reactivate-utility'){

            }
            else if(action == 'delete'){
            }
        }
        const formFields = ref([
            { type: 'date', name: 'date',label: "Date", value: '', required: true },
            { type: 'dropdown', name: 'default_mode',label: "Charge Mode", value: '', placeholder: "", required: true, options: [{ text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'Rent Percentage', value: 'Rent Percentage' }] },
            { type: 'number', name: 'default_value',label: "Default Value", value: 0, required: true },
        ]);

        const handleDepReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            depositID.value = '';
        }
        const showDepModalLoader = () =>{
            dep_modal_loader.value = "block";
        }
        const hideDepModalLoader = () =>{
            dep_modal_loader.value = "none";
        }
        const additionalFields = ref([
            { type: 'dropdown', name: 'default_mode',label: "Charge Mode", value: '', placeholder: "", required: true, options: [{ text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'Rent Percentage', value: 'Rent Percentage' }, { text: 'Billed On Use', value: 'Billed On Use' }] },
            { type: 'number', name: 'default_value',label: "Default Value", value: 0, required: true },
            { type: 'date', name: 'from_date',label: "From Date", value: '', required: true },
        ]);
        

        const isDisabled =(permissionName) =>{
            const permission = allowedRights.value.find(p => p.permission_name === permissionName);
            return permission ? !permission.right_status : true;
        };
        onBeforeMount(()=>{
            saleDetails.value = store.state.Asset_Sales.saleDetails;
        });
        onMounted(()=>{

        });

        return{
            tabs, activeTab, mainComponentKey, scheduleColumns, paymentColumns, selectTab, loader, showLoader, hideLoader, formFields, additionalFields,showTotals,
            tableKey,paymentTableKey, idFieldSchedule, idFieldPayment, actionsSchedule, actionsUtility, computedScheduleRows, computedPaymentRows,printSchedule,
            scheduleTableKey, idFieldSchedule, scheduleColumns, actionsSchedule, statementTableKey, idFieldStatement, statementRows,statement1Rows,showActions,searchFilters,resetFilters,dropdownOptions,
            statementColumns,statement1Columns, actionsStatement, saleDetails,saleAsset,saleClient, scheduleActionClick,showAddButton,searchLoanTransactions,
            scheduleActionClick,tnt_modal_loader, dep_modal_loader, util_modal_loader, depModalVisible, displayButtons, printSaleStatement,handleDynamicOption1,
            documentActionClick,documentColumns,documentTableKey,actionsDocument,computedDocumentRows,printModalVisible,pdfUrl, printTitle,
            modal_top, modal_left, modal_width, showDepModalLoader, hideDepModalLoader, handleDepReset,computedActivityRows,activityColumns,
            flex_basis, flex_basis_percentage, paymentActionClick,rightsModule,isDisabled,
        }
    }
})
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
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
}

.table{
    min-height: 15vh;
    max-height: 15vh;
    overflow-y: scroll;
    overflow-x: scroll;
}

</style>