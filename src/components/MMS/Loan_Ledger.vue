<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[750px]">
                <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Loan Details</h1>
                <div class="tabs pt-2">
                    <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                        {{ tab }}
                    </button>
                </div>
                <div class="tab-content mt-3">
                    <div v-if="activeTab == 0">
                        <div class="flex">
                            <div class="basis-1/2 border-left border-gray-400">
                                <h1 class="font-bold mb-10">Loan Details</h1>
                                <table class="w-full">
                                    <tr class="text-left">
                                        <td class="font-bold ">Loan Number:</td>
                                        <td> {{ loanDetails.loan_number }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold">Application Date:</td>
                                        <td>{{ loanDetails.application_date }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Member Number:</td>
                                        <td>{{ loanMember.member_number }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold">Member Name:</td>
                                        <td>{{ loanMember.member_name }}</td>
                                        
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Loan Product:</td>
                                        <td>{{ loanProduct.product_name }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Installments:</td>
                                        <td>{{ loanDetails.installments }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Interest Rate(%):</td>
                                        <td>{{ loanProduct.interest_rate }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Interest Method:</td>
                                        <td>{{ loanProduct.interest_calculation }}</td>
                                    </tr>
                                    
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Applied Amount:</td>
                                        <td>{{ loanDetails.applied_amount }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Approved Amount:</td>
                                        <td>{{ loanDetails.approved_amount }}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div v-if="activeTab == 2">
                        <div class="relative w-[100%] bg-white z-50 px-6">
                            <FilterBar 
                                :showAddButton="showAddButton"
                                :filters="searchFilters" 
                                @search="searchLoanTransactions"
                                @reset="resetFilters"
                                @printList="printLoanStatement"
                                @printExcel="printExcel"
                                @printCSV="printCSV"
                            />
                        </div>
                        <div class="table w-[100%] top-[17.1rem] z-30 px-6">
                            <DynamicTable :key="statementTableKey" :rightsModule="rightsModule" :columns="statementColumns" :rows="statementRows" :idField="idFieldStatement" :showActions="showActions" :actions="actionsStatement"/>
                        </div>
                    </div>          
                    <div v-if="activeTab == 1">                    
                        <DynamicTable :key="tableKey" :rightsModule="rightsModule" :columns="scheduleColumns" :rows="computedScheduleRows" :idField="idFieldSchedule" :showTotals="showTotals" :actions="actionsSchedule" @action-click="scheduleActionClick" />
                    </div>
                    <div v-show="activeTab == 3">                  
                        <DynamicTable :key="paymentTableKey" :rightsModule="rightsModule" :columns="paymentColumns" :rows="computedPaymentRows" :idField="idFieldPayment" :actions="actionsUtility" @action-click="paymentActionClick" 
                                        :showActions="showActions" :showTotals="showTotals"/>
                    </div> 
                    <div v-show="activeTab == 4">                  
                        <DynamicTable :key="guarantorTableKey" :rightsModule="rightsModule" :columns="guarantorColumns" :rows="computedGuarantorRows" :idField="idFieldGuarantor" :actions="actionsUtility" @action-click="guarantorActionClick" 
                                        :showActions="showActions" :showTotals="showTotals"/>
                    </div> 
                    <div v-show="activeTab == 5">                  
                        <DynamicTable :key="securityTableKey" :rightsModule="rightsModule" :columns="securityColumns" :rows="computedSecurityRows" :idField="idFieldSecurity" :actions="actionsUtility" @action-click="securityActionClick" 
                                        :showActions="showActions" :showTotals="showTotals"/>
                    </div>  
                    <div v-show="activeTab == 6">                  
                        <DynamicTable :key="documentTableKey" :rightsModule="rightsModule" :columns="documentColumns" :rows="computedDocumentRows" :idField="idFieldDocument" :actions="actionsDocument" @action-click="documentActionClick"/>
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
    name: 'Loan_Ledger',
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
        const rightsModule = ref('MMS');
        const allowedRights = ref([]);
        const depModalVisible = ref(false);
        const displayButtons = ref(true);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const tabs = ref(['Loan Details','Armotization Schedule','Loan Statement','Loan Repayment','Loan Guarantors','Loan Securities','Loan Documents']);
        const activeTab = ref(0);
        const mainComponentKey = ref(0);
        const tableKey = ref(0);
        const paymentTableKey = ref(0);
        const scheduleTableKey = ref(0);
        const statementTableKey = ref(0);
        const documentTableKey = ref(0);
        const idFieldSchedule = ref('armotization_schedule_id');
        const idFieldPayment = ref('utility_id');
        const idFieldStatement = ref('');
        const applicationID = computed(()=> store.state.Loan_Applications.selectedApplicationID);
        const computedScheduleRows = computed(()=> store.state.Loan_Applications.selectedSchedules);
        const computedPaymentRows = computed(()=> store.state.Loan_Applications.selectedRepayments);
        const computedGuarantorRows = computed(()=> store.state.Loan_Applications.selectedGuarantors);
        const computedSecurityRows = computed(()=> store.state.Loan_Applications.selectedSecurities);
        const computedDocumentRows = computed(()=> store.state.Loan_Applications.selectedDocuments);
        const statementRows = computed(()=> store.state.Loan_Applications.selectedTransactions);
        const loanDetails = computed(()=> store.state.Loan_Applications.loanDetails);
        const loanMember = computed(()=> store.state.Loan_Applications.loanMember);
        const loanProduct = computed(()=> store.state.Loan_Applications.loanProduct);
        const scheduleColumns = ref([
            {type: "checkbox"},
            {label: "#", key:"installment", type: "text", editable: false},
            {label: "Due", key:"due_date", type: "text", editable: false},
            {label: "Balance", key:"formatted_loan_balance", type: "text", editable: false},
            {label: "Principal", key:"formatted_principal_amount", type: "number", editable: false},
            {label: "Interest", key:"formatted_interest_amount", type: "number", editable: false},
            {label: "Penalty", key:"penalty", type: "number", editable: false},
            {label: "Sch. Total", key:"formatted_schedule_repayment", type: "number", editable: false},
            {label: "Prepay.", key:"formatted_loan_prepayment", type: "number", editable: false},
            {label: "Paid Princ.", key:"formatted_repaid_principal_amount", type: "number", editable: false},
            {label: "Paid Int.", key:"formatted_repaid_interest_amount", type: "number", editable: false},
            {label: "Paid Pen.", key:"formatted_repaid_penalty", type: "number", editable: false},
            {label: "Total Paid", key:"formatted_schedule_payment", type: "number", editable: false, },
            {label: "Princ. Bal", key:"formatted_principal_balance", type: "number", editable: false},
            {label: "Int. Bal.", key:"formatted_interest_balance", type: "number", editable: false},
            {label: "Total Bal.", key:"formatted_installment_balance", type: "number", editable: false},
            {label: "I.P", key:"interest_posted", type: "text", editable: false},
            {label: "C.R.P", key:"credit_reduction_applied", type: "text", editable: false},
        ]);
        const showTotals = ref(true);
        const actionsSchedule = ref([
            {name: 'post-interest', icon: 'fa fa-spinner', title: 'Post Interest', rightName: 'Posting Loan Interest'},
            {name: 'unpost-interest', icon: 'fa fa-minus-circle', title: 'Unpost Interest', rightName: 'Posting Loan Interest'},
            {name: 'process-credit-reduction', icon: 'fa fa-arrow-down', title: 'Process C.R', rightName: 'Posting Loan Interest'},
            {name: 'unprocess-credit-reduction', icon: 'fa fa-minus-circle', title: 'Unprocess C.R', rightName: 'Posting Loan Interest'},
        ]);

        const paymentColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"journal.issue_date", type: "text", editable: false},
            {label: "Txn No", key:"journal.journal_no", type: "text", editable: false},
            {label: "Description", key: "description", type: "text", editable: false},
            {label: "Amount", key: "amount", type: "number", editable: false},
        ]);
        const guarantorColumns = ref([
            {type: "checkbox"},
            {label: "Member No", key:"member_number", type: "text"},
            {label: "Member Name", key:"member_name", type: "text"},
            {label: "Phone Number", key:"phone_number", type: "text"},
            {label: "Amount", key: "guarantee_amount", type: "number"},
        ]);
        const securityColumns = ref([
            {type: "checkbox"},
            {label: "Type", key:"security_name", type: "text"},
            {label: "Security Name", key:"name", type: "text"},
            {label: "Reg/ID No", key:"registration_number", type: "text"},
            {label: "Phone No", key:"phone_number", type: "text"},
            {label: "Value", key:"security_value", type: "number"},
            {label: "Security Description", key:"description", type: "text"},
        ])
        const documentColumns = ref([
            {label: "Document Type", key:"document_type", type: "text"},
            {label: "Document Name", key:"document_name", type: "text"},
        ]);
        const actionsDocument = ref([
            {name: 'preview', icon: 'fa fa-paperclip', title: 'View Document',rightName: 'Adding Loan Documents'},
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

        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            
        ]);
        const searchLoanTransactions = async() =>{
            showLoader();
            let formData = {
                client: loanDetails.value.loan_ledger_id,
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
            {label: 'SMS Loan Statement', action: 'send-sms'},
            {label: 'Email Loan Statement', action: 'send-email'},
        ]);
        const handleDynamicOption = async(option) =>{           
            if(option == 'send-sms'){
                showLoader();
                let formData = {
                    client: [loanDetails.value.loan_application_id],
                    company: companyID.value,
                    date_from: from_date_search.value,
                    date_to: to_date_search.value,
                    company: companyID.value
                }
                await axios.post('api/v1/loan-statement-sms/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("SMS Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Loan Statement Template Not Set!")
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
                    client: [loanDetails.value.loan_application_id],
                    company: companyID.value,
                    date_from: from_date_search.value,
                    date_to: to_date_search.value,
                    company: companyID.value
                }
                await axios.post('api/v1/loan-statement-email/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Email Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Loan Statement Template Not Set!")
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
        const printLoanStatement = () =>{
            showLoader();
            let formData = {
                client: loanDetails.value.loan_ledger_id,
                loan_application: loanDetails.value.loan_application_id,
                historical_loan: null,
                company: companyID.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
            }
            axios
            .post("api/v1/loan-statement-pdf/", formData, { responseType: 'blob' })
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
                loan_application: applicationID.value
            }
            let formData1 = {
                company: companyID.value,
                client: loanDetails.value.loan_ledger_id,
                application: loanDetails.value.loan_application_id,
                historical_loan: null,
                page_size: "1000"
            }
            if(index == 2){
                activeTab.value = index;
                await store.dispatch('Loan_Applications/fetchLoanTransactions',formData1)
                .then(()=>{
                    hideLoader();
                })
            }else if( index == 1){
                activeTab.value = index;
                await store.dispatch('Loan_Applications/fetchLoanDetails',formData)
                .then(()=>{
                    hideLoader();
                })
            }
            else if( index == 3){
                activeTab.value = index;
                await store.dispatch('Loan_Applications/fetchLoanRepayments',formData)
                .then(()=>{
                    hideLoader();
                })
            }
            else if( index == 4){
                activeTab.value = index;
                await store.dispatch('Loan_Applications/fetchLoanGuarantors',formData)
                .then(()=>{
                    hideLoader();
                })
            }
            else if( index == 5){
                activeTab.value = index;
                await store.dispatch('Loan_Applications/fetchLoanSecurities',formData)
                .then(()=>{
                    hideLoader();
                })
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
                const scheduleID = [row['armotization_schedule_id']]
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
                const scheduleID = [row['armotization_schedule_id']]
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
                const scheduleID = [row['armotization_schedule_id']]
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
                const scheduleID = [row['armotization_schedule_id']]
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
        const handleSelectedDeposit = async(option) =>{
            await store.dispatch('Security_Deposits/handleSelectedDeposit', option)
            depositID.value = store.state.Security_Deposits.depositID;
        }
        const fetchDeposits = async() =>{
            await store.dispatch('Security_Deposits/fetchDeposits', {company:companyID.value})
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
        
        const fetchEnabledRights = () =>{
            allowedRights.value = [];
            let formData = {
                user: userID.value,
                company: companyID.value,
                module: rightsModule.value
            }
            axios
            .post("api/v1/user-permissions-search/",formData)
            .then((response)=>{
                allowedRights.value = response.data.results;
            })
            .catch((error)=>{
                console.log(error.message);
            })
        };
        const isDisabled =(permissionName) =>{
            const permission = allowedRights.value.find(p => p.permission_name === permissionName);
            return permission ? !permission.right_status : true;
        };
        onBeforeMount(()=>{
            loanDetails.value = store.state.Loan_Applications.loanDetails;
        });
        onMounted(()=>{
            fetchEnabledRights();
        });

        return{
            tabs, activeTab, mainComponentKey, scheduleColumns, paymentColumns, selectTab, loader, showLoader, hideLoader, formFields, additionalFields,showTotals,
            tableKey,paymentTableKey, idFieldSchedule, idFieldPayment, actionsSchedule, actionsUtility, computedScheduleRows, computedPaymentRows,computedGuarantorRows,computedSecurityRows,
            scheduleTableKey, idFieldSchedule, scheduleColumns, actionsSchedule, statementTableKey, idFieldStatement, statementRows,showActions,searchFilters,resetFilters,dropdownOptions,
            statementColumns, actionsStatement, loanDetails,loanProduct,loanMember, scheduleActionClick,showAddButton,searchLoanTransactions,printLoanStatement,handleDynamicOption,
            scheduleActionClick,tnt_modal_loader, dep_modal_loader, util_modal_loader, depModalVisible, displayButtons,guarantorColumns,securityColumns,
            documentActionClick,documentColumns,documentTableKey,actionsDocument,computedDocumentRows,
            modal_top, modal_left, modal_width, showDepModalLoader, hideDepModalLoader, handleDepReset,
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