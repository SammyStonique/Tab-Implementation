<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="postInterest"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchSchedules"
            @resetFilters="resetFilters"
            @removeItem="removeSchedule"
            @removeSelectedItems="removeSchedules"
            @printList="printSchedulesList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="schedulesList"
            :actions="actions"
            :showTotals="showTotals"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            @handleShowDetails="handleShowDetails"
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
        </PageComponent>
        <MovableModal v-model:visible="invModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
        >
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="bookScheduleInterest" @handleReset="handleReset"
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
import Swal from 'sweetalert2';

export default{
    name: 'Loan_Schedules',
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
        const idField = 'armotization_schedule_id';
        const addButtonLabel = ref('New Booking');
        const addingRight = ref('Processing Schedule Interest');
        const removingRight = ref('Deletingg Loan Schedules');
        const rightsModule = ref('MMS');
        const submitButtonLabel = ref('Add');
        const title = ref('Interest Processing');
        const propComponentKey = ref(0);
        const invModalVisible = ref(false);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const selectedIds = ref([]);
        const schedulesList = ref([]);
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
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Loan#", key:"loan_number"},
            {label: "#", key:"installment"},
            {label: "Due", key:"due_date"},
            {label: "Balance", key:"formatted_loan_balance"},
            {label: "Principal", key:"formatted_principal_amount", type: "number"},
            {label: "Interest", key:"formatted_interest_amount", type: "number"},
            {label: "Penalty", key:"penalty", type: "number"},
            {label: "Sch. Total", key:"formatted_schedule_repayment", type: "number"},
            {label: "Prepay.", key:"formatted_loan_prepayment", type: "number", editable: false},
            {label: "Paid Princ.", key:"formatted_repaid_principal_amount", type: "number", editable: false},
            {label: "Paid Int.", key:"formatted_repaid_interest_amount", type: "number", editable: false},
            {label: "Paid Pen.", key:"formatted_repaid_penalty", type: "number", editable: false},
            {label: "Total Paid", key:"formatted_schedule_payment", type: "number", editable: false, },
            {label: "Princ. Bal", key:"formatted_principal_balance", type: "number", editable: false},
            {label: "Int. Bal.", key:"formatted_interest_balance", type: "number", editable: false},
            {label: "Total Bal.", key:"formatted_installment_balance", type: "number", editable: false},
            {label: "I.P", key:"interest_posted"},
            {label: "C.R.P", key:"credit_reduction_applied"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'post-interest', icon: 'fa fa-spinner', title: 'Post Interest', rightName: 'Posting Loan Interest'},
            {name: 'unpost-interest', icon: 'fa fa-minus-circle', title: 'Unpost Interest', rightName: 'Posting Loan Interest'},
            {name: 'process-credit-reduction', icon: 'fa fa-arrow-down', title: 'Process C.R', rightName: 'Posting Loan Interest'},
            {name: 'unprocess-credit-reduction', icon: 'fa fa-minus-circle', title: 'Unprocess C.R', rightName: 'Posting Loan Interest'},
            {name: 'send-sms', icon: 'fas fa-comment', title: 'Send SMS', rightName: 'Sending MMS SMS'},
            {name: 'send-email', icon: 'fas fa-envelope', title: 'Send Email', rightName: 'Sending MMS Emails'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const member_number_search = ref("");
        const member_name_search = ref("");
        const loan_number_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const interest_status_search = ref("");
        const balance_status = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Loan No...", value: loan_number_search, width:40},
            {type:'text', placeholder:"Member No...", value: member_name_search, width:40},
            {type:'text', placeholder:"Member Name...", value: member_number_search, width:64},
            {
                type:'dropdown', placeholder:"Interest Posted..", value: interest_status_search, width:32,
                options: [{text:'Yes',value:'Yes'},{text:'No',value:'No'}]
            },
            {
                type:'dropdown', placeholder:"With Balance Only..", value: balance_status, width:40,
                options: [{text:'Yes',value:'Yes'},{text:'No',value:'No'}]
            },
            {type:'date', placeholder:"From Date...", value: from_date_search, width:32, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:32, title: "Date To Search"},

        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [

                { type: 'date', name: 'period_year',label: "Date From", value: "", required: true },
                { type: 'date', name: 'period_year',label: "Date To", value: "", required: true },
            ]
        };

        const handleReset = async() =>{
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
        const bookScheduleInterest = async() =>{
            showModalLoader();
            let formData = {
                date_from: formFields.value[0].value,
                date_to: formFields.value[1].value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=0; i < (formFields.value.length); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    axios.post(`api/v1/post-armotization-interest/`,formData).
                    then((response)=>{
                        if (response.data.msg === "Success"){
                            hideModalLoader();
                            toast.success('Interest(s) Posted Successfully!');
                            handleReset();
                            searchSchedules();
                        } else {
                            toast.error('An error occurred while booking the Interest(s).');
                        }
                    })
                    
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to book Interest(s): ' + error.message);
                } finally {
                    hideModalLoader();
                    
                }
            }
        }

        const removeSchedule = async() =>{

        }
        const removeSchedules = async() =>{

        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchSchedules = () =>{
            showLoader();
            selectedIds.value = [];
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                loan_number: loan_number_search.value,
                member_number: member_number_search.value,
                member_name: member_name_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                interest_status: interest_status_search.value,
                balance_status: balance_status.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
   
            axios
            .post(`api/v1/armotization-schedules-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                schedulesList.value = response.data.results;
                store.commit('Loan_Schedules/LIST_LOAN_SCHEDULES', schedulesList.value)
                propResults.value = response.data;
                propArrLen.value = schedulesList.value.length;
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
            searchSchedules(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            loan_number_search.value = "";
            member_number_search.value = "";
            member_name_search.value = "";
            from_date_search.value= "";
            to_date_search.value = "";
            interest_status_search.value = "";
            balance_status.value = "";
            searchSchedules();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchSchedules();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchSchedules();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchSchedules();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchSchedules();
            // scrollToTop();
        }
        const postInterest = () =>{
            invModalVisible.value = true;
            updateFormFields();
            propModalVisible.value = true;
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'send-sms'){
                showLoader();
                const scheduleID = [row['armotization_schedule_id']];
                let formData = {
                    armotization_schedule: scheduleID,
                    company: companyID.value
                }
                await axios.post('api/v1/loan-balance-reminder-sms/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("SMS Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Loan Balance Template Not Set!")
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
                const scheduleID = [row['armotization_schedule_id']];
                let formData = {
                    armotization_schedule: scheduleID,
                    company: companyID.value
                }
                await axios.post('api/v1/loan-balance-reminder-email/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Email Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Loan Balance Template Not Set!")
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
            else if( action == 'post-interest'){
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
            else if( action == 'process-credit-reduction'){
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
        }

        const closeModal = async() =>{
            invModalVisible.value = false;
            handleReset();
        }

        const dropdownOptions = ref([
            {label: 'Batch Post Interest', action: 'batch-post-interest', rightName: 'Posting Loan Interest'},
            {label: 'Batch Unpost Interest', action: 'batch-unpost-interest', rightName: 'Posting Loan Interest'},
            {label: 'SMS Schedule Balances', action: 'send-sms', rightName: 'Sending MMS SMS'},
            {label: 'Email Schedule Balances', action: 'send-email', rightName: 'Sending MMS Emails'},
            {label: 'Process Penalty', action: 'process-penalty', rightName: 'Processing Loan Penalties'},
        ]);
        const handleDynamicOption = async(option) =>{
            if(option == 'send-sms'){
                showLoader();
                const scheduleID = selectedIds.value
                let formData = {
                    armotization_schedule: scheduleID,
                    company: companyID.value
                }
                await axios.post('api/v1/loan-balance-reminder-sms/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("SMS Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Loan Balance Template Not Set!")
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
                const scheduleID = selectedIds.value
                let formData = {
                    armotization_schedule: scheduleID,
                    company: companyID.value
                }
                await axios.post('api/v1/loan-balance-reminder-email/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Email Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Loan Balance Template Not Set!")
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
            }else if( option == 'batch-post-interest'){
                let formData = {
                    armotization_schedule: selectedIds.value,
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
                            searchSchedules(); 
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
                           
            }else if( option == 'batch-unpost-interest'){
                let formData = {
                    armotization_schedule: selectedIds.value,
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
                            searchSchedules();
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
            }
            else if( option == 'process-credit-reduction'){
                let formData = {
                    armotization_schedule: selectedIds.value,
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
                                 
            }else if( option == 'process-credit-reduction'){
                let formData = {
                    armotization_schedule: selectedIds.value,
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
                
                           
            }else if( option == 'process-penalty'){
                let formData = {
                    armotization_schedule: selectedIds.value,
                    from_date: from_date_search.value,
                    to_date: to_date_search.value,
                    company: companyID.value
                }
                Swal.fire({
                    title: "Are you sure?",
                    text: `Do you wish to Process Penalty?`,
                    type: 'warning',
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Process!',
                    cancelButtonText: 'Cancel!',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom',
                    },
                    showLoaderOnConfirm: true,
                    }).then((result) => {
                    if (result.value) {
                        axios.post(`api/v1/process-loan-penalty/`,formData)
                        .then((response)=>{
                        if(response.data.msg == 'Success'){
                            Swal.fire("Penalty Processed Succesfully!", {
                                icon: "success",
                            }); 
                            searchSchedules();
                        }else if(response.data.msg == 'Processed'){
                            Swal.fire({
                                title: "Penalty Already Processed!",
                                icon: "warning",
                            });
                        } 
                        else{
                            Swal.fire({
                                title: "Error Processing Penalty",
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
                        Swal.fire(`Penalty(s) has not been processed!`);
                    }
                })
                           
            }
        };
        const printSchedulesList = () =>{
            showLoader();

            let formData = {
                journal_no: "",
                client_category: "Tenants",
                txn_type: "INV",
                client: member_number_search.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                status: "",
                company_id: companyID.value
            } 
   
            axios
            .post("api/v1/export-armotization-schedules-pdf/", formData, { responseType: 'blob' })
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
            searchSchedules();
            
        })
        return{
            showTotals,title, searchSchedules,resetFilters, addButtonLabel, searchFilters, tableColumns, schedulesList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,invModalVisible,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, postInterest, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeSchedule, removeSchedules, dropdownOptions, handleDynamicOption, bookScheduleInterest,addingRight,removingRight,rightsModule,printSchedulesList,
            selectSearchQuantity,selectedValue,
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