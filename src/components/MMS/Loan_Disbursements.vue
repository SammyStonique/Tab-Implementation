<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewDisbursement"
        :searchFilters="searchFilters"
        @searchPage="searchDisbursements"
        @resetFilters="resetFilters"
        @removeItem="removeDisbursement"
        @removeSelectedItems="removeDisbursements"
        :addingRight="addingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="disbursementsList"
        :actions="actions"
        :idField="idField"
        @handleSelectionChange="handleSelectionChange"
        @handleActionClick="handleActionClick"
        :count="depCount"
        :currentPage="currentPage"
        :result="depArrLen"
        @loadPrev="loadPrev"
        @loadNext="loadNext"
        @firstPage="firstPage"
        @lastPage="lastPage"
        :showNextBtn="showNextBtn"
        :showPreviousBtn="showPreviousBtn"
        :selectedValue="selectedValue"
        @selectSearchQuantity="selectSearchQuantity"
    />
    <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader"  @closeModal="closeModal">
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="disburseMemberLoan" @handleReset="handleReset"
        />
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';

export default{
    name: 'Loan_Disbursements',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('');
        const modal_loader = ref('none');
        const memComponentKey = ref(0);
        const prodComponentKey = ref(0);
        const title = ref('Disbursement Details');
        const addButtonLabel = ref('New Disbursement');
        const addingRight = ref('Adding Loan Disbursements');
        const rightsModule = ref('MMS');
        const idField = 'loan_disbursement_id';
        const depModalVisible = ref(false);
        const selectedIds = ref([]);
        const disbursementsList = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('170px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const isEditing = computed(()=> store.state.Loan_Disbursements.isEditing)
        const selectedDisbursement = computed(()=> store.state.Loan_Disbursements.selectedDisbursement);
        const selectedApplication = computed(()=> store.state.Loan_Disbursements.selectedApplication);
        const selectedLedger = computed(()=> store.state.Loan_Disbursements.selectedLedger);
        const applicationArray = computed(() => store.state.Loan_Applications.applicationArr);
        const ledgerArray = computed(() => store.state.Ledgers.cashbookLedgerArr);
        const approvedAmount = ref(400000);
        const loanApprvAmnt = ref(400000);
        const computedApprovedAmount = computed(() => {return approvedAmount});
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "date", type: "text", editable: false},
            {label: "Loan No", key: "loan_number", type: "text", editable: false},
            {label: "Loan Product", key: "loan_product", type: "text", editable: false},
            {label: "Member No", key: "member_number", type: "text", editable: false},
            {label: "Member Name", key: "member_name", type: "text", editable: false},
            {label: "Amount", key: "amount", type: "text", editable: false},
            {label: "P.V#", key: "journal_no", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Disbursement', rightName: 'Deleting Loan Disbursements'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const applicationID = ref('');
        const cashbookID = ref('');
        const loan_number_search = ref('');
        const journal_number_search = ref('');
        const name_search = ref('');
        const member_number_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"P.V No...", value: journal_number_search, width:36,},
            {type:'text', placeholder:"Loan No...", value: loan_number_search, width:36,},
            {type:'text', placeholder:"Member No...", value: member_number_search, width:36,},
            {type:'text', placeholder:"Search Name...", value: name_search, width:48,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedApplication = async(option) =>{
            await store.dispatch('Loan_Applications/handleSelectedApplication', option)
            applicationID.value = store.state.Loan_Applications.applicationID;
        };
        const clearSelectedApplication = async() =>{
            await store.dispatch('Loan_Applications/updateState', {applicationID: ''});
            applicationID.value = store.state.Loan_Applications.applicationID;
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            cashbookID.value = store.state.Ledgers.ledgerID;
        };
        const clearSelectedLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            cashbookID.value = store.state.Ledgers.ledgerID;
        };
        const fetchLedgers = async() =>{
            await store.dispatch('Ledgers/fetchCashbookLedgers', {company:companyID.value, ledger_type: 'Cashbook'})
        };
        const formFields = ref([]);
        const applicationValue = computed(() => {
            return applicationID.value;
        });
        const ledgerValue = computed(() => {
            return cashbookID.value;
        });
        const checkApprovedLimit = (value) =>{
            if(parseFloat(loanApprvAmnt.value) < parseFloat(value)){
                toast.error(`Approved Amount is ${loanApprvAmnt.value}`)
                formFields.value[7].value = loanApprvAmnt.value;
            }
        };
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Application", value: applicationValue.value, componentKey: memComponentKey,
                    selectOptions: applicationArray, optionSelected: handleSelectedApplication, required: true,
                    searchPlaceholder: 'Select Application...', dropdownWidth: '400px', updateValue: selectedApplication.value,
                    fetchData: store.dispatch('Loan_Applications/fetchLoanApplications', {company:companyID.value, status:"Approved"}), clearSearch: clearSelectedApplication
                },
                {  
                    type:'search-dropdown', label:"Cashbook", value: ledgerValue.value, componentKey: prodComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Cashbook...', dropdownWidth: '400px', updateValue: selectedLedger.value,
                    fetchData: fetchLedgers(), clearSearch: clearSelectedLedger
                },
                { type: 'date', name: 'issue_date',label: "Recording Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
                { type: 'date', name: 'banking_date',label: "Banking Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
                { type: 'dropdown', name: 'payment_method',label: "Payment Method", value: '', placeholder: "", required: true, options: [{ text: 'Cash', value: 'Cash' }, { text: 'Mpesa', value: 'Mpesa' },{ text: 'Bank Deposit', value: 'Bank Deposit' }, { text: 'Cheque', value: 'Cheque' },{ text: 'Check-off', value: 'Check-off' }, { text: 'RTGS', value: 'RTGS' },{ text: 'EFT', value: 'EFT' }, { text: 'Not Applicable', value: 'Not Applicable' }] },
                { type: 'text', name: 'reference_no',label: "Reference No", value: '', required: true,},
                { type: 'dropdown', name: 'partial_disbursement',label: "Partial Payment", value: 'No', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' },{ text: 'No', value: 'No' }]},
                { type: 'number', name: 'total_amount',label: "Amount", value: computedApprovedAmount.value, required: true , method: checkApprovedLimit},
            ];
        };
        watch([selectedDisbursement, selectedApplication, selectedLedger], () => {
            if (selectedDisbursement.value && selectedApplication.value && selectedLedger.value) {
                memComponentKey.value += 1;
                prodComponentKey.value += 1;
                updateFormFields();
            }
            else{
                updateFormFields();
            }
        }, { immediate: true });
        const addNewDisbursement = () =>{
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Loan_Disbursements/updateState",{selectedDisbursement:null, selectedApplication:null, selectedLedger:null,isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const accountID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    loan_disbursement: accountID
                }
                await store.dispatch('Loan_Disbursements/deleteLoanDisbursement',formData).
                then(()=>{
                    searchDisbursements();
                })
            }
        } 
        const handleReset = () =>{
            store.dispatch("Loan_Disbursements/updateState",{selectedDisbursement:null, selectedApplication:null, selectedLedger:null,isEditing:false})
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].name == 'partial_disbursement'){
                    formFields.value[i].value = 'No';
                }else{
                    formFields.value[i].value = '';
                }
                
            }
            applicationID.value = "";
            cashbookID.value = "";
            prodComponentKey.value += 1;
            memComponentKey.value += 1;

        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const disburseMemberLoan = async() =>{
            showModalLoader();
            let formData = {
                cashbook: cashbookID.value,
                issue_date: formFields.value[2].value,
                loan_application: applicationID.value,
                banking_date: formFields.value[3].value,
                partial_disbursement: formFields.value[6].value,
                amount: formFields.value[7].value,
                payment_method: formFields.value[4].value,
                reference_no: formFields.value[5].value,
                user: userID.value,
                company: companyID.value
            }
            axios.post(`api/v1/disburse-member-loan/`,formData)
            .then((response)=>{
                if(response.data.msg == "Success"){
                    toast.success("Success")
                    closeModal();
                    searchDisbursements();
                }else if(response.data.msg == "Excess"){
                    toast.error("Maximum Disbursement Exceeded")
                }else{
                    toast.error("Error Disbursing Loan")
                }                  
            })
            .catch((error)=>{
                console.log(error.message);
                toast.error(error.message)
                hideModalLoader();
            })
            .finally(()=>{
                hideModalLoader();
            })
        
        };
        const removeDisbursement = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    loan_disbursement: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Loan_Disbursements/deleteLoanDisbursement',formData)
                    if(response && response.status == 200){
                        toast.success("Disbursement Removed Succesfully");
                        searchDisbursements();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Disbursement: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Disbursement") 
            }else{
                toast.error("Please Select A Disbursement To Remove")
            }
        }
        const removeDisbursements = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    loan_disbursement: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Loan_Disbursements/deleteLoanDisbursement',formData)
                    if(response && response.status == 200){
                        toast.success("Disbursement(s) Removed Succesfully");
                        searchDisbursements();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Disbursement(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Disbursement To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchDisbursements = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                loan_number: loan_number_search.value,
                journal_no: journal_number_search.value,
                member_name: name_search.value,
                member_number: member_number_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios
            .post(`api/v1/loan-disbursements-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                disbursementsList.value = response.data.results;
                store.commit('Loan_Disbursements/LIST_DISBURSEMENTS', disbursementsList.value)
                depResults.value = response.data;
                depArrLen.value = disbursementsList.value.length;
                depCount.value = depResults.value.count;
                pageCount.value = Math.ceil(depCount.value / selectedValue.value);
                
                if(response.data.next){
                    showNextBtn.value = true;
                }
                if(response.data.previous){
                    showPreviousBtn.value = true;
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchDisbursements(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchDisbursements();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchDisbursements();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchDisbursements();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchDisbursements();
        }
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            name_search.value = "";
            loan_number_search.value = "";
            member_number_search.value = "";
            journal_number_search.value = "";
            searchDisbursements();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchDisbursements();
        })
        return{
            title,idField, searchDisbursements, addButtonLabel, searchFilters, resetFilters, tableColumns, disbursementsList,
            currentPage,depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewDisbursement,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, disburseMemberLoan,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeDisbursement, removeDisbursements,
            addingRight,rightsModule, closeModal,handleSelectionChange,selectSearchQuantity,selectedValue,
        }
    }
}
</script>