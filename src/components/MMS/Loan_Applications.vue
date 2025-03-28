<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewApplication"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchApplications"
            @resetFilters="resetFilters"
            @removeItem="removeApplication"
            @removeSelectedItems="removeApplications"
            @printList="printApplicationList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="applicationList"
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
            :displayButtons="displayButtons" @handleSubmit="disburseMemberLoan" @handleReset="handleRefReset"
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
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import Swal from 'sweetalert2';

export default{
    name: 'Loan_Applications',
    components:{
        PageComponent,MovableModal,SearchableDropdown,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('');
        const ledComponentKey = ref(0);
        const displayButtons = ref(true);
        const trans_modal_loader = ref('none');
        const ref_modal_loader = ref('none');
        const idField = 'loan_application_id';
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
        const refTitle = ref('Disburse Loan');
        const transModalVisible = ref(false);
        const refModalVisible = ref(false);
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
            {label: "Loan No", key:"loan_number"},
            {label: "Member Name", key:"member"},
            {label: "Product Name", key:"loan_product"},
            {label: "Applied", key: "formatted_applied_amount"},
            {label: "Approved", key: "formatted_approved_amount"},
            {label: "Disbursed", key: "disbursed"},
            {label: "Status", key:"approval_status", textColor: "textColor"},
            {label: "Loan Remarks", key:"loan_remarks"},
            {label: "Appr. By", key:"approved_by"},
            {label: "Exempt", key:"exempt_penalty"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Application', rightName: 'Editing Loan Applications'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Loan', rightName: 'Viewing Loan Ledger'},
            {name: 'approve/reject', icon: 'fa fa-check-circle', title: 'Approve/Reject Loan', rightName: 'Approving Loan Applications'},
            {name: 'disburse', icon: 'fa fa-credit-card', title: 'Disburse Loan', rightName: 'Disbursing Member Loan'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Application', rightName: 'Deleting Loan Applications'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const cashbookArr = computed(() => store.state.Ledgers.cashbookLedgerArr);
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
        const disbursed_status_search = ref("");
 
        const searchFilters = ref([
            {type:'text', placeholder:"Loan No...", value: loan_number_search, width:48,},
            {type:'text', placeholder:"Member Name...", value: name_search, width:48,},
            {type:'text', placeholder:"Member No...", value: member_number_search, width:48,},
            {
                type:'dropdown', placeholder:"Status..", value: approval_status_search, width:40,
                options: [{text:'Pending',value:'Pending'},{text:'Approved',value:'Approved'},{text:'Rejected',value:'Rejected'}]
            },
            {
                type:'dropdown', placeholder:"Disbursal Status..", value: disbursed_status_search, width:40,
                options: [{text:'Yes',value:'Yes'},{text:'No',value:'No'}]
            },
        ]);
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
        }
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
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                member_name: name_search.value,
                loan_number: loan_number_search.value,
                member_number: member_number_search.value,
                approval_status: approval_status_search.value,
                disbursed: disbursed_status_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
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
            disbursed_status_search.value = "";
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
        const calculateDisbursalAmount = async() =>{
 
            let formData = {
                company: companyID.value,
                loan_application: applicationID.value
            }
           await axios.post('api/v1/check-member-disbursal-amount/', formData).
            then((response)=>{
                loanApprvAmnt.value = response.data.disbursal_amount;
                approvedAmount.value = response.data.disbursal_amount;
            })
            .catch((error)=>{
                toast.error(error.message)
            })
            .finally(()=>{

            })
        };
        const addNewApplication = async() =>{
            await store.dispatch('Loan_Products/updateState', {loanCharges: [], productMaxAmount: 0, installments:0});
            await store.dispatch('Loan_Guarantors/updateState', {memberArray: []});
            store.commit('Loan_Applications/initializeStore');
            await store.dispatch('Loan_Applications/updateState', {selectedApplication: null,selectedMember: null,selectedProduct: null,loanCharges: [],loanGuarantors: [], loanSecurities: [],loanSchedules: [], loanDocuments: [],isEditing: false});
            store.commit('pageTab/ADD_PAGE', {'MMS':'Loan_Application_Details'});
            store.state.pageTab.mmsActiveTab = 'Loan_Application_Details';          
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                await store.dispatch('Loan_Applications/updateState', {selectedApplication: null,selectedMember: null,selectedProduct: null,loanCharges: [],loanGuarantors: [], loanSecurities: [],loanSchedules: [], loanDocuments: [],isEditing: false});
                const applicationID = row[idField];
                const applicationStatus = row['approval_status']
                if(applicationStatus == 'Pending'){
                    let formData = {
                        company: companyID.value,
                        loan_application: applicationID
                    }
                    await store.dispatch('Loan_Applications/fetchLoanApplication',formData).
                    then(()=>{
                        store.commit('pageTab/ADD_PAGE', {'MMS':'Loan_Application_Details'})
                        store.state.pageTab.mmsActiveTab = 'Loan_Application_Details';
                    })
                }else{
                    toast.error(`Cannot Edit ${applicationStatus} Loan`)
                }
                
            }else if(action == 'delete'){
                const applicationID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    loan_application: applicationID
                }
                await store.dispatch('Loan_Applications/deleteLoanApplication',formData).
                then(()=>{
                    searchApplications();
                })
            }else if(action == 'approve/reject'){
                const applicationStatus = row['approval_status']
                if(applicationStatus == 'Pending'){
                    updateFormFields();
                    applicationID.value = row['loan_application_id'];
                    appliedAmount.value = row['applied_amount'];
                    transModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                }else{
                    toast.error(`Loan Already ${applicationStatus}`)
                }
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
                        store.commit('pageTab/ADD_PAGE', {'MMS':'Loan_Ledger'});
                        store.state.pageTab.mmsActiveTab = 'Loan_Ledger'; 
                    })
                }else{
                    toast.error(`Cannot View ${applicationStatus} Loan`)
                }
            }else if(action == 'disburse'){
                const applicationStatus = row['approval_status']
                const disburseStatus = row['disbursed']
                const partDisburse = row['partial_disbursement']
                if(disburseStatus == 'Yes' && partDisburse == 'No'){
                    toast.error(`Loan Already Disbursed`)
                }else{
                    if(applicationStatus == 'Approved'){
                        applicationID.value = row[idField];
                        fetchAllLedgers();
                        calculateDisbursalAmount();
                        refModalVisible.value = true;
                        flex_basis.value = '1/3';
                        flex_basis_percentage.value = '33.333';
                    }else{
                        toast.error(`Cannot Disburse ${applicationStatus} Loan`)
                    }
                }
                
            }
        };
        const dropdownOptions = ref([
            {label: 'Exempt Penalty', action: 'exempt-penalty'},
            {label: 'Unexempt Penalty', action: 'unexempt-penalty'},
            {label: 'Email Loan Statement', action: 'send-email'},
        ]);
        const handleDynamicOption = async(option) =>{
            if( option == 'exempt-penalty'){
                let formData = {
                    loan_application: selectedIds.value,
                    historical_loan: [],
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
                           
            }else if( option == 'unexempt-penalty'){
                let formData = {
                    loan_application: selectedIds.value,
                    historical_loan: [],
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
            }else if(option == 'send-email'){
                showLoader();
                let formData = {
                    company: companyID.value,
                    loan_application: selectedIds.value,
                    historical_loan: null,
                    date_from: "",
                    date_to: "",
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
                product_name: name_search.value,
                product_code: loan_number_search.value,
                active_status: member_number_search.value,
                company_id: companyID.value,
            } 

            axios
            .post("api/v1/export-loan-applications-pdf/", formData, { responseType: 'blob' })
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
        const hideDetails = async() =>{
            showDetails.value = false;
        };
        const fetchLedgers = async() =>{
            await store.dispatch('Ledgers/fetchCashbookLedgers', {company:companyID.value, ledger_type: 'Cashbook'})
        };
        const fetchAllLedgers = async() =>{
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
                type:'search-dropdown', label:"Cashbook", value: cashbookID.value, componentKey: ledComponentKey,
                selectOptions: cashbookArr, optionSelected: handleSelectedLedger, required: true,
                searchPlaceholder: 'Select Cashbook...', dropdownWidth: '550px', updateValue: "",
                fetchData: fetchLedgers(), clearSearch: clearSelectedLedger
            },
            { type: 'date', name: 'issue_date',label: "Recording Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
            { type: 'date', name: 'banking_date',label: "Banking Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
            { type: 'dropdown', name: 'payment_method',label: "Payment Method", value: '', placeholder: "", required: true, options: [{ text: 'Cash', value: 'Cash' }, { text: 'Mpesa', value: 'Mpesa' },{ text: 'Bank Deposit', value: 'Bank Deposit' }, { text: 'Cheque', value: 'Cheque' },{ text: 'Check-off', value: 'Check-off' }, { text: 'RTGS', value: 'RTGS' },{ text: 'EFT', value: 'EFT' }, { text: 'Not Applicable', value: 'Not Applicable' }] },
            { type: 'text', name: 'reference_no',label: "Reference No", value: '', required: true,},
            { type: 'dropdown', name: 'partial_disbursement',label: "Partial Payment", value: 'No', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' },{ text: 'No', value: 'No' }]},
            { type: 'number', name: 'total_amount',label: "Amount", value: computedApprovedAmount.value, required: true , method: checkApprovedLimit},
        ]);
        const handleRefReset = () =>{
            for(let i=0; i < refFormFields.value.length; i++){
                refFormFields.value[i].value = '';
            }
            applicationID.value = null;
            cashbookID.value = null;
            ledComponentKey.value +=1;
        }
        const showRefModalLoader = () =>{
            ref_modal_loader.value = "block";
        }
        const hideRefModalLoader = () =>{
            ref_modal_loader.value = "none";
        }
        const disburseMemberLoan = async() =>{
            showRefModalLoader();
            let formData = {
                cashbook: cashbookID.value,
                issue_date: refFormFields.value[1].value,
                loan_application: applicationID.value,
                banking_date: refFormFields.value[2].value,
                partial_disbursement: refFormFields.value[5].value,
                amount: refFormFields.value[6].value,
                payment_method: refFormFields.value[3].value,
                reference_no: refFormFields.value[4].value,
                user: userID.value,
                company: companyID.value
            }
            axios.post(`api/v1/disburse-member-loan/`,formData)
            .then((response)=>{
                if(response.data.msg == "Success"){
                    toast.success("Success")
                    closeRefModal();
                    searchApplications();
                }else if(response.data.msg == "Excess"){
                    toast.error("Maximum Disbursement Exceeded")
                }else{
                    toast.error("Error Disbursing Loan")
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
            searchApplications,resetFilters, addButtonLabel, searchFilters, tableColumns, applicationList,dropdownWidth,displayButtons,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,flex_basis,flex_basis_percentage,formFields,handleReset,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,showDetails,detailsTitle,hideDetails,
            submitButtonLabel, showModal, addNewApplication, showLoader, loader, hideLoader, removeApplication, removeApplications,
            handleSelectionChange,addingRight,removingRight,rightsModule,printApplicationList,selectSearchQuantity,selectedValue,
            modal_left,modal_top,modal_width,trans_modal_loader,transModalVisible,transTitle,showTransModalLoader,hideTransModalLoader,approveLoan,closeTransModal,
            dropdownOptions,handleDynamicOption,refTitle,refFormFields,refModalVisible,ref_modal_loader,handleRefReset,showRefModalLoader,hideRefModalLoader,closeRefModal,
            disburseMemberLoan
        }
    }
};
</script>
