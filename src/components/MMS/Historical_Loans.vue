<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            :showAddButton="showAddButton"
            @handleAddNew="addNewApplication"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchApplications"
            @resetFilters="resetFilters"
            @removeItem="removeApplication"
            @removeSelectedItems="removeApplications"
            @importData="importApplications"
            @printList="printApplicationList"
            v-model:printModalVisible="printModalVisible"
            :printTitle="printTitle"
            :pdfUrl="pdfUrl"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="applicationList"
            :actions="actions"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            @handleRightClick="handleRightClick"
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
        />
    </div>
    <MovableModal v-model:visible="transModalVisible" :title="transTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="trans_modal_loader" @showLoader="showTransModalLoader" @hideLoader="hideTransModalLoader" @closeModal="closeTransModal">
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="approveLoan" @handleReset="handleReset"
        />
    </MovableModal>
    <MovableModal v-model:visible="refModalVisible" :title="refTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="ref_modal_loader" @showLoader="showRefModalLoader" @hideLoader="hideRefModalLoader" @closeModal="closeRefModal">
        <DynamicForm 
            :fields="refFormFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="postLoanBalance" @handleReset="handleRefReset"
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
import { ref, computed, watch, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import PrintJS from 'print-js';
import MovableModal from '@/components/MovableModal.vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import Swal from 'sweetalert2';

export default{
    name: 'Historical_Loans',
    components:{
        PageComponent,MovableModal,SearchableDropdown,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('');
        const modal_loader1 = ref('none');
        const ledComponentKey = ref(0);
        const propComponentKey = ref(0);
        const displayButtons = ref(true);
        const trans_modal_loader = ref('none');
        const ref_modal_loader = ref('none');
        const idField = 'loan_application_id';
        const showAddButton = ref(false);
        const addButtonLabel = ref('New Application');
        const addingRight = ref('Adding Loan Applications');
        const removingRight = ref('Deleting Loan Applications');
        const rightsModule = ref('MMS');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const applicationList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const showDetails = ref(false);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const detailsTitle = ref('Application Documents');
        const transTitle = ref('Approve/Reject Loan');
        const refTitle = ref('Post Loan Balance');
        const title1 = ref('Update Repayment Date');
        const transModalVisible = ref(false);
        const refModalVisible = ref(false);
        const appModalVisible = ref(false);
        const printModalVisible = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Loan Applications');
        const dropdownWidth = ref("500px")
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"application_date"},
            {label: "Loan No", key:"loan_number", type:"link"},
            {label: "Member#", key:"member_number"},
            {label: "Member Name", key:"member"},
            {label: "Applied", key: "formatted_applied_amount"},
            {label: "Approved", key: "formatted_approved_amount"},
            {label: "Disbursed", key: "disbursed"},
            {label: "Status", key:"approval_status", textColor: "textColor"},
            {label: "Loan Remarks", key:"loan_remarks"},
            {label: "Appr. By", key:"approved_by"},
            {label: "Exempt", key:"exempt_penalty"},
            {label: "Posted", key:"posted"},
            {label: "Due", key:"loan_due_date"},
        ])
        const actions = ref([
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Loan', rightName: 'Viewing Loan Ledger'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Application', rightName: 'Deleting Loan Applications'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const cashbookArr = computed(() => store.state.Ledgers.ledgerArr);
        const applicationID = ref("");
        const cashbookID = ref("");
        const appliedAmount = ref(0);
        const approvedAmount = ref(0);
        const loanApprvAmnt = ref(0);
        const computedApprovedAmount = computed(() => {return approvedAmount});
        
        const name_search = ref('');
        const loan_number_search = ref("");
        const member_number_search = ref("");
        const approval_status_search = ref("");
        const penalty_status_search = ref("");
        const disbursed_status_search = ref("");
        const repayment_status_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const productID = ref('');
        const products_array = computed(() => store.state.Loan_Products.productArr);
        const handleSelectedProduct = async(option) =>{
            await store.dispatch('Loan_Products/handleSelectedProduct', option)
            productID.value = store.state.Loan_Products.productID;
        };
        const clearSelectedProduct = async() =>{
            await store.dispatch('Loan_Products/updateState', {productID: ''});
            productID.value = store.state.Loan_Products.productID;
        };
        const searchFilters = ref([
            {type:'text', placeholder:"Loan No...", value: loan_number_search, width:48,},
            {type:'text', placeholder:"Member Name...", value: name_search, width:48,},
            {type:'text', placeholder:"Member No...", value: member_number_search, width:32,},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:32, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:32, title: "Date To Search"},
            {
                type:'dropdown', placeholder:"Status..", value: approval_status_search, width:32,
                options: [{text:'Active',value:'Active'},{text:'Defaulted',value:'Defaulted'},{text:'Cleared',value:'Cleared'}]
            },
            {
                type:'search-dropdown', value: productID.value, width:48, componentKey: propComponentKey,
                selectOptions: products_array, optionSelected: handleSelectedProduct,
                searchPlaceholder: 'Loan Product...', dropdownWidth: '350px',
                fetchData: store.dispatch('Loan_Products/fetchLoanProducts', {company:companyID.value}),
                clearSearch: clearSelectedProduct
            },
            {
                type:'dropdown', placeholder:"Repayment Status..", value: repayment_status_search, width:44,
                options: [{text:'On-Time Payments',value:'On-Time'},{text:'Prepaid Clients',value:'Prepaid'},{text:'Defaulting',value:'Defaulted'}]
            },
            {
                type:'dropdown', placeholder:"Penalty Exemption..", value: penalty_status_search, width:44,
                options: [{text:'Yes',value:'Yes'},{text:'No',value:'No'}]
            },
        ]);
        const importApplications = () =>{
            store.commit('pageTab/ADD_PAGE', {'MMS':'Import_Historical_Loans'})
            store.state.pageTab.mmsActiveTab = 'Import_Historical_Loans';
        }
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'date', name: 'date',label: "Date", value: '', required: true },
                { type: 'dropdown', name: 'approval_status',label: "Status", value: '', placeholder: "", required: true, options: [{ text: 'Approve', value: 'Approved' }, { text: 'Reject', value: 'Rejected' }] },
                { type: 'text', name: 'approved_amount',label: "Approved Amount", value: appliedAmount || '0', required: false },
                { type: 'text-area', name: 'approval_remarks',label: "Remarks", value: '', required: false,textarea_rows: '2', textarea_cols: '56'},
            ]
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        };
        const formFields1 = ref([]);
        const updateFormFields1 = () => {
            formFields1.value = [
                { type: 'number', name: 'day',label: "New Repayment Day", value: 1, required: true },
                { type: 'text', name: 'installment_from',label: "Installment From", value: 1, required: true },
                { type: 'text', name: 'installment_to',label: "Installment To", value: 1, required: true },
                { type: 'date', name: 'new_repayment_date',label: "New Date", value: '', required: false },
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
            if(formFields1.value[2].value < formFields1.value[1].value){
                toast.error("Installment To Cannot Be Less Than Installment From");
                hideModalLoader1();
                return;
            }
            let formData = {
                loan_application: applicationID.value,
                new_day: formFields1.value[0].value,
                installment_from: formFields1.value[1].value,
                installment_to: formFields1.value[2].value,
                new_repayment_date: formFields1.value[3].value,
                company: companyID.value
            }
            axios.post(`api/v1/update-loan-repayment-date/`,formData)
            .then((response)=>{
                if(response.data.msg == "Success"){
                    toast.success("Success")
                    closeModal1();
                    searchApplications();
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
            applicationID.value = null;
            hideModalLoader1();
        };
        const removeApplication = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    loan_application: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Loan_Applications/deleteLoanApplication',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Application(s) Removed Succesfully");
                        searchApplications();
                    }else if(response && response.data.msg == "Failed"){
                        toast.error("Failed To Remove Application");
                        searchApplications();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Application: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Application") 
            }else{
                toast.error("Please Select An Application To Remove")
            }
        }
        const removeApplications = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    loan_application: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Loan_Applications/deleteLoanApplication',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Application(s) Removed Succesfully");
                        searchApplications();
                    }else if(response && response.data.msg == "Failed"){
                        toast.error("Failed To Remove Application");
                        searchApplications();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Application: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select An Application To Remove")
            }
        };
        const showTransModalLoader = () =>{
            trans_modal_loader.value = "block";
        }
        const hideTransModalLoader = () =>{
            trans_modal_loader.value = "none";
        }
        const approveLoan = async() =>{
            showTransModalLoader();
            let formData = {
                loan_application: applicationID.value,
                approved_by: userID.value,
                approval_date: formFields.value[0].value,
                approval_status: formFields.value[1].value,
                approved_amount: formFields.value[2].value,
                approval_remarks: formFields.value[3].value,
                company: companyID.value
            }

            axios.post(`api/v1/approve-member-loan/`,formData)
            .then((response)=>{
            if(response.data.msg == "Success"){
                hideTransModalLoader();
                closeTransModal();
                toast.success("Success")
                searchApplications();
            }else{
                toast.error("Error");
                hideTransModalLoader();
            }                   
            })
            .catch((error)=>{
                console.log(error.message);
                toast.error(error.message);
                hideTransModalLoader();
            })
        };
        const closeTransModal = () =>{
            transModalVisible.value = false;
            applicationID.value = null;
            hideTransModalLoader();
        };
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchApplications = () =>{
            showLoader();
            selectedIds.value = [];
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                member_name: name_search.value,
                loan_number: loan_number_search.value,
                member_number: member_number_search.value,
                approval_status: approval_status_search.value,
                penalty_status: penalty_status_search.value,
                disbursed: disbursed_status_search.value,
                repayment_status: repayment_status_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                product: productID.value,
                company_id: companyID.value,
                page_size: selectedValue.value,
                loan_type: 'Historical'
            } 
            axios
            .post(`api/v1/loan-applications-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                applicationList.value = response.data.results;
                store.commit('Loan_Applications/LIST_APPLICATIONS', applicationList.value)
                propResults.value = response.data;
                propArrLen.value = applicationList.value.length;
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
            searchApplications(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            name_search.value = "";
            member_number_search.value = "";
            loan_number_search.value = "";
            approval_status_search.value = "";
            penalty_status_search.value = "";
            disbursed_status_search.value = "";
            repayment_status_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            productID.value = "";
            propComponentKey.value += 1;
            searchApplications();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchApplications();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchApplications();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchApplications();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchApplications();
            // scrollToTop();
        };
  
        const addNewApplication = async() =>{
         
        };
        const handleOpenLink = async(row) =>{
            const applicationID = row[idField];
            const applicationStatus = row['approval_status']
            if(applicationStatus == 'Approved'){
                let formData = {
                    company: companyID.value,
                    loan_application: applicationID
                }
                await store.dispatch('Loan_Applications/fetchLoanDetails',formData).
                then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'MMS':'Hist_Loan_Statement'});
                    store.state.pageTab.mmsActiveTab = 'Hist_Loan_Statement'; 
                })
            }else{
                toast.error(`Cannot View ${applicationStatus} Loan`)
            }
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const applicationID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    loan_application: applicationID
                }
                await store.dispatch('Loan_Applications/deleteLoanApplication',formData).
                then(()=>{
                    searchApplications();
                })
            }else if(action == 'view'){
                const applicationID = row[idField];
                const applicationStatus = row['approval_status']
                if(applicationStatus == 'Approved'){
                    let formData = {
                        company: companyID.value,
                        loan_application: applicationID
                    }
                    await store.dispatch('Loan_Applications/fetchLoanDetails',formData).
                    then(()=>{
                        store.commit('pageTab/ADD_PAGE', {'MMS':'Hist_Loan_Statement'});
                        store.state.pageTab.mmsActiveTab = 'Hist_Loan_Statement'; 
                    })
                }else{
                    toast.error(`Cannot View ${applicationStatus} Loan`)
                }
            }
        };
        watch(() => store.state.contextMenu.selectedAction, (actionPayload) => {
            if (!actionPayload) return;

            const { rowIndex, action, data } = actionPayload;

            handleActionClick(rowIndex, action, data);

            store.commit('contextMenu/CLEAR_SELECTED_ACTION');
        });
        
        const handleRightClick = (row, rowIndex, event) => {

            const menuOptions = [
                { label: 'View', action: 'view', rowIndex: rowIndex, icon: 'fa fa-file-pdf-o', rightName: 'Viewing Loan Ledger' },
                { label: 'Delete', action: 'delete', rowIndex: rowIndex, icon: 'fa fa-trash', rightName: 'Deleting Loan Applications' },
            ];

            store.commit('contextMenu/SHOW_CONTEXT_MENU', {
                x: event.clientX,
                y: event.clientY,
                options: menuOptions,
                contextData: row,
            });
        };
        const dropdownOptions = ref([
            {label: 'Exempt Penalty', action: 'exempt-penalty', icon: 'fa-ban', colorClass: 'text-yellow-600', rightName: 'Exempting Loan Penalty'},
            {label: 'Unexempt Penalty', action: 'unexempt-penalty', icon: 'fa-undo', colorClass: 'text-green-600' , rightName: 'Exempting Loan Penalty'},
            {label: 'SMS Statement Link', action: 'send-sms', icon: 'fa-sms', colorClass: 'text-blue-500', rightName: 'Sending MMS SMS'},
            {label: 'Email Loan Statement', action: 'send-email', icon: 'fa-envelope', colorClass: 'text-indigo-500', rightName: 'Sending MMS Emails'},
            {label: 'Post Loan Balance', action: 'post-balance', icon: 'fa-check-circle',colorClass: 'text-green-600', rightName: 'Posting Loan Balance'},
            {label: 'Unpost Loan Balance', action: 'unpost-balance', icon: 'fa-times-circle', colorClass: 'text-red-600', rightName: 'Posting Loan Balance'},
            {label: 'Update Repayment Date', action: 'repayment-date', icon: 'fa-calendar-alt', colorClass: 'text-grey-700', rightName: 'Updating Loan Repayment Date'},
        ]);
        const handleDynamicOption = async(option) =>{
            if( option == 'exempt-penalty'){
                if(selectedIds.value.length == 0){
                    toast.error("Please Select An Application")
                    return;
                }else{
                    let formData = {
                        loan_application: selectedIds.value,
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
                            axios.post(`api/v1/exempt-loan-penalty/`,formData)
                            .then((response)=>{
                            if(response.data.msg == 'Success'){
                                Swal.fire("Penalty Exempted Succesfully!", {
                                    icon: "success",
                                });
                                searchApplications(); 
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
                }
                
                           
            }else if( option == 'unexempt-penalty'){
                if(selectedIds.value.length == 0){
                    toast.error("Please Select An Application")
                    return;
                }else{
                    let formData = {
                        loan_application: selectedIds.value,
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
                            axios.post(`api/v1/unexempt-loan-penalty/`,formData)
                            .then((response)=>{
                            if(response.data.msg == 'Success'){
                                Swal.fire("Penalty Unexempted Succesfully!", {
                                    icon: "success",
                                }); 
                                searchApplications();
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
                }
                                 
            }else if( option == 'post-balance'){
                refModalVisible.value = true;
                handleRefReset();                             
            }else if( option == 'unpost-balance'){
                let formData = {
                    historical_loan: selectedIds.value,
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
                        axios.post(`api/v1/unpost-historical-loan-balance/`,formData)
                        .then((response)=>{
                        if(response.data.msg == 'Success'){
                            Swal.fire("Balance Unposted Succesfully!", {
                                icon: "success",
                            }); 
                            searchApplications();
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
            }else if(option == 'repayment-date'){
                if(selectedIds.value.length == 1){
                    applicationID.value = selectedIds.value[0];
                    appModalVisible.value = true;
                    updateFormFields1();
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
          
                }else if(selectedIds.value.length > 1){
                    toast.error("You have selected more than 1 Application")
                }else{
                    toast.error("Please Select An Application")
                }
            }else if(option == 'send-sms'){
                showLoader();
                let formData = {
                    company: companyID.value,
                    loan_application: selectedIds.value,
                    company: companyID.value
                }
                await axios.post('api/v1/member-loan-statement-sms/',formData).
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
            }else if(option == 'send-email'){
                showLoader();
                let formData = {
                    company: companyID.value,
                    loan_application: selectedIds.value,
                    company: companyID.value
                }
                await axios.post('api/v1/member-loan-statement-email/',formData).
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
        
        const printApplicationList = () =>{
            showLoader();
            let formData = {
                member_name: name_search.value,
                loan_number: loan_number_search.value,
                member_number: member_number_search.value,
                approval_status: approval_status_search.value,
                disbursed: disbursed_status_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                product: productID.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 

            axios
            .post("api/v1/export-loan-applications-pdf/", formData, { responseType: 'blob' })
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
        };
        const hideDetails = async() =>{
            showDetails.value = false;
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
        const checkApprovedLimit = (value) =>{
            if(parseFloat(loanApprvAmnt.value) < parseFloat(value)){
                toast.error(`Approved Amount is ${loanApprvAmnt.value}`)
                refFormFields.value[6].value = loanApprvAmnt.value;
            }
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
        const postLoanBalance = async() =>{
            showRefModalLoader();
            let formData = {
                ledger: cashbookID.value,
                loan_application: selectedIds.value,
                company: companyID.value
            }
            axios.post(`api/v1/post-historical-loan-balance/`,formData)
            .then((response)=>{
                if(response.data.msg == "Success"){
                    toast.success("Success")
                    closeRefModal();
                    searchApplications();
                }else{
                    toast.error("Error Posting Loan Balance")
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
            searchApplications();
            
        })
        return{
            showAddButton,searchApplications,resetFilters, addButtonLabel, searchFilters, tableColumns, applicationList,dropdownWidth,displayButtons,importApplications,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,flex_basis,flex_basis_percentage,formFields,handleReset,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,showDetails,detailsTitle,hideDetails,handleRightClick,
            submitButtonLabel, showModal, addNewApplication, showLoader, loader, hideLoader, removeApplication, removeApplications,printModalVisible,pdfUrl, printTitle,
            handleSelectionChange,addingRight,removingRight,rightsModule,printApplicationList,selectSearchQuantity,selectedValue,handleOpenLink,
            modal_left,modal_top,modal_width,trans_modal_loader,transModalVisible,transTitle,showTransModalLoader,hideTransModalLoader,approveLoan,closeTransModal,
            dropdownOptions,handleDynamicOption,refTitle,refFormFields,refModalVisible,ref_modal_loader,handleRefReset,showRefModalLoader,hideRefModalLoader,closeRefModal,
            postLoanBalance,appModalVisible,title1,modal_loader1,showModalLoader1,hideModalLoader1,updateFormFields,formFields1,handleReset1,closeModal1,updateRepaymentDate
        }
    }
};
</script>
