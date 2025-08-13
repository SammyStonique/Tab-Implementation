<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="prepaymentAllocations"
        :searchFilters="searchFilters"
        @searchPage="searchPrepayments"
        @resetFilters="resetFilters"
        @printList="printList"
        :addingRight="addingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="prepaymentsList"
        :actions="actions"
        :idField="idField"
        :showTotals="showTotals"
        @handleSelectionChange="handleSelectionChange"
        @handleActionClick="handleActionClick"
        @handleOpenLink="handleOpenLink"
        :count="appCount"
        :currentPage="currentPage"
        :result="appArrLen"
        @loadPrev="loadPrev"
        @loadNext="loadNext"
        @firstPage="firstPage"
        @lastPage="lastPage"
        :showNextBtn="showNextBtn"
        :showPreviousBtn="showPreviousBtn"
        :selectedValue="selectedValue"
        @selectSearchQuantity="selectSearchQuantity"
    />
    <MovableModal v-model:visible="appModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
    >
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="allocatePrepayment" @handleReset="handleReset"
        />
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted,watch } from 'vue';
import { useStore } from "vuex";
import PageComponent from "../PageComponent.vue";
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';

export default{
    name: 'Loan_Prepayments',
    props: ['scrollToTop','loader','showLoader','hideLoader',],
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const modal_loader = ref('none');
        const addButtonLabel = ref('Allocations');
        const addingRight = ref('View Prepayment Allocations');
        const rightsModule = ref('MMS');
        const pageComponentKey = ref(0);
        const invComponentKey = ref(0);
        const title = ref('Prepayment Allocation');
        const companyID = computed(()=> store.state.userData.company_id);
        const applicationID = ref("");
        const prepaymentID = ref("");
        const prepaymentAmount = ref(0);
        const prepaymentAllocError = ref(false);
        const scheduleID = ref('');
        const scheduleDescription = ref('');
        const scheduleDueAmount = ref(0);
        const itemType = ref('');
        const scheduleInstallment = ref('');
        const schedulesArray = computed(() => store.state.Loan_Prepayments.loanItems);
        const idField = 'loan_prepayment_id';
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const prepaymentsList = ref([]);
        const appResults = ref([]);
        const appArrLen = ref(0);
        const appCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('35vw');
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Member#", key:"member_number"},
            {label: "Member Name", key:"member_name"},
            {label: "Loan#", key:"loan_number", type:'link'},
            {label: "Receipt", key:"receipt_no"},
            {label: "Amount", key: "total_amount", type: "number", editable: false},
            {label: "Allocated", key: "allocated_amount", type: "number", editable: false},
            {label: "Balance", key: "due_amount", type: "number", editable: false},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'allocate', icon: 'fa fa-exchange-alt', title: 'Allocate Prepayment', rightName: 'Allocate Prepayment'},
        ])
        const member_name_search = ref("");
        const member_number_search = ref("");
        const loan_number_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const fetchLoanItems = async(applicationID) =>{
            await store.dispatch('Loan_Prepayments/fetchLoanItems', {company:companyID.value, loan_application: applicationID, historical_loan: null, date: ""})
        };
        const handleSelectedItem = async(option) =>{
            await store.dispatch('Loan_Prepayments/handleSelectedLoanItem', option)
            scheduleID.value = store.state.Loan_Prepayments.scheduleID;
            scheduleDescription.value = store.state.Loan_Prepayments.scheduleDescription;
            scheduleDueAmount.value = store.state.Loan_Prepayments.itemAmount;
            scheduleInstallment.value = store.state.Loan_Prepayments.scheduleInstallment;
            itemType.value = store.state.Loan_Prepayments.itemType;
        };
        const clearSelectedItem  = async() =>{
            await store.dispatch('Loan_Prepayments/updateState', {scheduleID: '', itemAmount: 0, scheduleDescription: '', scheduleInstallment: '', itemType: ""});
            scheduleID.value = ""
        }
        const searchFilters = ref([
            {type:'text', placeholder:"Loan No...", value: loan_number_search, width:44},
            {type:'text', placeholder:"Member No...", value: member_number_search, width:36},
            {type:'text', placeholder:"Member Name...", value: member_name_search, width:64},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const checkPrepaymentLimit = (value) =>{
            if(parseFloat(scheduleDueAmount.value) < parseFloat(value)){
                toast.error(`Due Amount Is ${scheduleDueAmount.value}`)
                formFields.value[2].value = 0;
            }
            else if(parseFloat(prepaymentAmount.value) < parseFloat(value)){
                toast.error(`Cannot Allocate More Than ${prepaymentAmount.value}`)
                formFields.value[2].value = 0;
            }
        }
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
            {  
                type:'search-dropdown', label:"Schedule Item", value: scheduleID.value, componentKey: invComponentKey,
                selectOptions: schedulesArray, optionSelected: handleSelectedItem, required: true,
                searchPlaceholder: 'Select Item...', dropdownWidth: '450px', updateValue: "",
                clearSearch: clearSelectedItem() 
            },
            { type: 'date', name: 'date',label: "Date", value: formatDate(current_date), required: true },
            { type: 'number', name: 'allocated_amount',label: "Amount", value: 0, required: true, method: checkPrepaymentLimit },
            
            ];
        };
        const handleReset = () =>{
            for(let i=1; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            scheduleID.value = '';
            formFields.value[1].value = formatDate(current_date);
        }
        const handleOpenLink = async(row) =>{
            const applicationID = row['loan_application_id'];
            let formData = {
                company: companyID.value,
                loan_application: applicationID
            }
            await store.dispatch('Loan_Applications/fetchLoanDetails',formData).
            then(()=>{
                store.commit('pageTab/ADD_PAGE', {'MMS':'Loan_Statement'});
                store.state.pageTab.mmsActiveTab = 'Loan_Statement'; 
            })
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'allocate'){
                updateFormFields();
                const reversalStatus = row['reversal_status']
                if (reversalStatus == "Yes"){
                    toast.error("Cannot Allocate Reversed Receipt")
                }else{
                    let dueAmount = parseFloat(row['due_amount'].replace(/,/g, ''));
                    if (dueAmount > 0){
                        appModalVisible.value = true;
                        handleReset();
                        flex_basis.value = '1/3';
                        flex_basis_percentage.value = '33.333';
                        applicationID.value = row['loan_application'];
                        prepaymentID.value = row["loan_prepayment_id"]
                        fetchLoanItems(applicationID.value);
                        prepaymentAmount.value = dueAmount;
                    }else{
                        toast.error("Prepayment Is Fully Allocated")
                    }
                }
                
                
            }
        } 
        const prepaymentAllocations = async() =>{
            store.commit('pageTab/ADD_PAGE', {'MMS':'Prepayment_Allocations'});
            store.state.pageTab.mmsActiveTab = 'Prepayment_Allocations'; 
        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const allocatePrepayment = async() =>{
            showModalLoader();
            let formData = {
                date: formFields.value[1].value,
                description: scheduleDescription.value,
                allocated_amount: formFields.value[2].value,
                installment: scheduleInstallment.value,
                schedule_item: itemType.value,
                armotization_schedule: scheduleID.value,
                loan_prepayment: prepaymentID.value,
                loan_prepayment_id: prepaymentID.value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && (formFields.value[i].type != "number" || formFields.value[i].type != "search-dropdown") && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }else if(formFields.value[i].value == 0 && formFields.value[i].type == "number"){
                    prepaymentAllocError.value = true;
                }
            }
            if(scheduleID.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else if(prepaymentAllocError.value){
                toast.error('Invalid Amount');
                hideModalLoader();
                prepaymentAllocError.value = false;
            }else{
                try {
                    const response = await store.dispatch('Loan_Prepayments/allocatePrepayment', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Prepayment Allocated Successfully!');
                        handleReset();
                        invComponentKey.value += 1;
                        appModalVisible.value = false;
                    } else {
                        toast.error('An error occurred while allocating the prepayment.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to allocate prepayment: ' + error.message);
                } finally {
                    hideModalLoader();
                    store.dispatch('Journals/updateState',{journalID:''})
                    searchPrepayments();
                }
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchPrepayments = () =>{
            showLoader();
            let formData = {
                client_code: member_number_search.value,
                client_name: member_name_search.value,
                loan_number: loan_number_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                company: companyID.value,
                page_size: selectedValue.value
            }
 
            axios
            .post(`api/v1/loan-prepayments-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                prepaymentsList.value = response.data.results;
                store.commit('Loan_Prepayments/LIST_LOAN_PREPAYMENTS', prepaymentsList.value)
                appResults.value = response.data;
                appArrLen.value = prepaymentsList.value.length;
                appCount.value = appResults.value.count;
                pageCount.value = Math.ceil(appCount.value / selectedValue.value);
                
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
            searchPrepayments(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchPrepayments();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchPrepayments();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchPrepayments();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchPrepayments();
        }
        const resetFilters = () =>{
            currentPage.value = 1;
            member_name_search.value = "";
            member_number_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            loan_number_search.value = "";
            searchPrepayments();
        }
        const closeModal = () =>{
            appModalVisible.value = false;
            scheduleID.value = "";
            store.dispatch('Journals/updateState',{journalID:''})
        }
        onMounted(() =>{
            searchPrepayments();
        })
        return{
            showTotals,title, searchPrepayments, idField, selectedIds, actions, prepaymentsList, appArrLen,appCount,appResults,appModalVisible,formFields,
            addButtonLabel, searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,
            currentPage,showNextBtn,showPreviousBtn, handleActionClick,allocatePrepayment,displayButtons,handleReset,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            closeModal, handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage, prepaymentAllocations,
            addingRight,rightsModule,selectSearchQuantity,selectedValue,handleOpenLink
        }
    }
}
</script>
