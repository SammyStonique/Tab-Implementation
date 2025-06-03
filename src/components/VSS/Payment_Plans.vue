<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewPlan"
            :searchFilters="searchFilters"
            @searchPage="searchPlans"
            @resetFilters="resetFilters"
            @removeItem="removePaymentPlan"
            @removeSelectedItems="removePaymentPlans"
            @printList="printList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="plansList"
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
        />
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="savePaymentPlan" @handleReset="handleReset"
            />
        </MovableModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import DynamicTable from '../DynamicTable.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import Swal from 'sweetalert2';

export default{
    name: 'Payment_Plans',
    components:{
        PageComponent, MovableModal,DynamicForm,SearchableDropdown,DynamicTable
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const penComponentKey = ref(0);
        const idField = 'payment_plan_id';
        const addButtonLabel = ref('New Payment Plan');
        const title = ref('Payment Plan Details');
        const addingRight = ref('Adding Payment Plans');
        const removingRight = ref('Deleting Payment Plans');
        const rightsModule = ref('PSS');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const selectedValue = ref(50);
        const plansList = ref([]);
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
        const dropdownWidth = ref("320px")
        const modal_top = ref('130px');
        const modal_left = ref('300px');
        const modal_width = ref('60vw');
        const isEditing = computed(()=> store.state.Payment_Plans.isEditing);
        const selectedPlan = computed(()=> store.state.Payment_Plans.selectedPlan);
        const selectedPenaltyLedger = computed(()=> store.state.Payment_Plans.selectedPenaltyLedger);
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"name"},
            {label: "Category", key: "category"},
            {label: "Mode", key: "payment_mode"},
            {label: "Instl", key:"installments"},
            {label: "Deposit Mode", key:"deposit_mode"},
            {label: "Dep. Value", key:"deposit_value"},
            {label: "Interest", key:"interest_value"},
            {label: "Repay. Freq.", key:"repayment_frequency"},
            {label: "Penalize", key:"penalize"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Plan', rightName: 'Editing Payment Plans'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Plan', rightName: 'Deleting Payment Plans'},
        ]);
        const companyID = computed(()=> store.state.userData.company_id);
        const planID = ref(null);
        const penaltyLedgerID = ref("");
        const name_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:60,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const fetchAllLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const handleSelectedPenaltyLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            penaltyLedgerID.value = store.state.Ledgers.ledgerID;
            if(selectedPlan.value && selectedPlan.value.penalty_posting_account){
                selectedPlan.value.penalty_posting_account.ledger_id = penaltyLedgerID.value;
                penaltyLedgerValue.value = penaltyLedgerID.value
            }
        };
        const clearSelectedPenaltyLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            penaltyLedgerID.value = store.state.Ledgers.ledgerID;
            if(selectedPlan.value && selectedPlan.value.penalty_posting_account != ""){
                selectedPlan.value.penalty_posting_account.ledger_id = penaltyLedgerID.value;
                penaltyLedgerValue.value = penaltyLedgerID.value
            }
        };
        
        const displayHirePurchaseOptions = (value) =>{
            if (value == "One-Off"){
                formFields.value[3].hidden = true;
                formFields.value[4].hidden = true;
                formFields.value[5].hidden = true;
                formFields.value[6].hidden = true;
                formFields.value[7].hidden = true;
                formFields.value[8].hidden = true;
                formFields.value[9].hidden = true;
                formFields.value[10].hidden = true;
                formFields.value[11].hidden = true;
                formFields.value[12].hidden = true;
                formFields.value[13].hidden = true;
                formFields.value[14].hidden = true;
                formFields.value[15].hidden = true;
                formFields.value[16].hidden = true;
            }else{
                formFields.value[3].hidden = false;
                formFields.value[4].hidden = false;
                formFields.value[5].hidden = false;
                formFields.value[6].hidden = false;
                formFields.value[7].hidden = false;
                formFields.value[8].hidden = false;
                formFields.value[9].hidden = false;
                formFields.value[10].hidden = false;
                formFields.value[11].hidden = false;
                formFields.value[12].hidden = false;
                formFields.value[13].hidden = false;
                formFields.value[14].hidden = false;
                formFields.value[15].hidden = false;
                formFields.value[16].hidden = false;
            }
        }
        const displayDepositValue = (value) =>{
            if(value == "None"){
                formFields.value[4].hidden = true;
            }else{
                formFields.value[4].hidden = false;
            }
        }
        const displayPenaltyOptions = (value) =>{
            if(value == "No"){
                formFields.value[13].hidden = true;
                formFields.value[14].hidden = true;
                formFields.value[15].hidden = true;
                formFields.value[16].hidden = true;
            }else{
                formFields.value[13].hidden = false;
                formFields.value[14].hidden = false;
                formFields.value[15].hidden = false;
                formFields.value[16].hidden = false;
            }
        }
        const formFields = ref([]);
        const penaltyLedgerValue = computed(() => {
            return (selectedPlan.value && selectedPlan.value.penalty_posting_account && !penaltyLedgerID.value) ? selectedPlan.value.penalty_posting_account.ledger_id : penaltyLedgerID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                { type: 'dropdown', name: 'category',label: "Category", value: selectedPlan.value?.category || 'Sale', placeholder: "", required: true, options: [{ text: 'Sale', value: 'Sale' }, { text: 'Purchase', value: 'Purchase' }]},
                { type: 'text', name: 'name',label: "Name", value: selectedPlan.value?.name || '', required: true },
                { type: 'dropdown', name: 'payment_mode',label: "Payment Mode", value: selectedPlan.value?.payment_mode || 'Hire Purchase', placeholder: "", required: true, options: [{ text: 'One-Off', value: 'One-Off' }, { text: 'Hire Purchase', value: 'Hire Purchase' }], method: displayHirePurchaseOptions},
                { type: 'dropdown', name: 'deposit_mode',label: "Deposit Mode", value: selectedPlan.value?.deposit_mode || 'Percentage', placeholder: "", required: true, hidden:false, options: [{ text: 'Percentage', value: 'Percentage' }, { text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'None', value: 'None' }] , method: displayDepositValue},
                { type: 'text', name: 'deposit_value',label: "Deposit Value", value: selectedPlan.value?.deposit_value || 0, placeholder: "", required: false, hidden:false },
                { type: 'text', name: 'installments',label: "Installments", value: selectedPlan.value?.installments || 1, placeholder: "", required: false, hidden:false },
                { type: 'dropdown', name: 'interest_method',label: "Interest Method", value: selectedPlan.value?.interest_method || 'Simple Interest', placeholder: "", required: true, hidden:false, options: [{ text: 'Simple Interest', value: 'Simple Interest' },{ text: 'Compound Interest', value: 'Compound Interest' },{ text: 'Reducing Interest EMI', value: 'Reducing Interest EMI' }, { text: 'Reducing Interest Fixed Principal', value: 'Reducing Interest Principal Payments' },{ text: 'Flat Interest EMI', value: 'Flat Interest EMI' }, { text: 'Flat Interest Principal Payments', value: 'Flat Interest Principal Payments' }] },
                { type: 'text', name: 'interest_value',label: "Interest Value", value: selectedPlan.value?.interest_value || '0', placeholder: "", required: false, hidden:false },
                { type: 'dropdown', name: 'interest_mode',label: "Interest Mode", value: selectedPlan.value?.interest_mode || 'Deposit Exclusive', placeholder: "", required: true, hidden:false, options: [{ text: 'Deposit Inclusive', value: 'Deposit Inclusive' }, { text: 'Deposit Exclusive', value: 'Deposit Exclusive' }] },
                { type: 'dropdown', name: 'balance_mode',label: "Balance Mode", value: selectedPlan.value?.balance_mode || 'Equal Distribution', placeholder: "", required: true, hidden:false, options: [{ text: 'Equal Distribution', value: 'Equal Distribution' }, { text: 'One-Off', value: 'One-Off' }, { text: 'Any Amount', value: 'Any Amount' }] },
                { type: 'dropdown', name: 'hp_posting_mode',label: "Hire Purchase Mode", value: selectedPlan.value?.hp_posting_mode || 'Interest Suspense', placeholder: "", required: true, hidden:false, options: [{ text: 'Interest Suspense', value: 'Interest Suspense' }, { text: 'Asset Accrual', value: 'Asset Accrual' }, { text: 'Cash Price', value: 'Cash Price' }, { text: 'Trading', value: 'Trading' }] },
                { type: 'dropdown', name: 'repayment_frequency',label: "Repayment Frequency", value: selectedPlan.value?.repayment_frequency || 'Monthly', placeholder: "", required: true, options: [{ text: 'Daily', value: 'Daily' }, { text: 'Weekly', value: 'Weekly' },{ text: 'Monthly', value: 'Monthly' }, { text: 'Annually', value: 'Annually' }] },
                { type: 'dropdown', name: 'penalize',label: "Penalize", value: selectedPlan.value?.penalize || 'No', placeholder: "", required: false, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] , method: displayPenaltyOptions},
                { type: 'dropdown', name: 'penalty_frequency',label: "Penalty Frequency", value: selectedPlan.value?.penalty_frequency || 'Monthly', placeholder: "", required: true, hidden: true, options: [{ text: 'Daily', value: 'Daily' }, { text: 'Weekly', value: 'Weekly' },{ text: 'Monthly', value: 'Monthly' }, { text: 'Annually', value: 'Annually' }, { text: 'One-Off', value: 'One-Off' }] },
                { type: 'dropdown', name: 'penalty_mode',label: "Penalty Mode", value: selectedPlan.value?.penalty_mode || 'Flat Amount', placeholder: "", required: false, hidden: true, options: [{ text: 'Flat Amount', value: 'Flat Amount' }, { text: '% of Installment Principal', value: 'Installment Principal' },{ text: '% of Installment Interest', value: 'Installment Interest' }, { text: '% of Installment Principal + Interest', value: 'Installment Principal + Interest' }, { text: '% of Installment (Principal + Interest) Balance', value: 'Installment Principal + Interest Balance' },{ text: '% of Principal Balance', value: 'Principal Balance' }, { text: '% of Total Balance', value: 'Sale Balance' }] },
                { type: 'number', name: 'penalty_value',label: "Penalty Value", value: selectedPlan.value?.penalty_value || 0, required: false, hidden: true },
                {  
                    type:'search-dropdown', label:"Penalty Income Posting Account", value: penaltyLedgerValue.value, componentKey: penComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedPenaltyLedger, required: false, hidden: true,
                    searchPlaceholder: 'Select Posting Acc...', dropdownWidth: '320px', updateValue: selectedPenaltyLedger.value,
                    clearSearch: clearSelectedPenaltyLedger
                },
                {required: false}
            ];  
        };
        const handleReset = () =>{
            penComponentKey.value += 1;
            penaltyLedgerID.value = "";
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].label == "Category"){
                    formFields.value[i].value = 'Sale';
                }else if(formFields.value[i].label == "Payment Mode"){
                    formFields.value[i].value = 'Hire Purchase';
                }else if(formFields.value[i].label == "Deposit Mode" ){
                    formFields.value[i].value = 'Percentage';
                }else if(formFields.value[i].label == "Deposit Value" || formFields.value[i].name == "penalty_value"){
                    formFields.value[i].value = 0;
                }else if(formFields.value[i].label == "Installments" ){
                    formFields.value[i].value = 1;
                }else if(formFields.value[i].label == "Interest Method" ){
                    formFields.value[i].value = 'Simple Interest';
                }else if(formFields.value[i].label == "Interest Mode" ){
                    formFields.value[i].value = 'Deposit Exclusive';
                }else if(formFields.value[i].label == "Balance Mode" ){
                    formFields.value[i].value = 'Equal Distribution';
                }else if(formFields.value[i].label == "Hire Purchase Mode" ){
                    formFields.value[i].value = 'Interest Suspense';
                }else if(formFields.value[i].name == "penalty_frequency" || formFields.value[i].name == "repayment_frequency"){
                    formFields.value[i].value = 'Monthly';
                }else if(formFields.value[i].name == "penalty_mode" ){
                    formFields.value[i].value = 'Flat Amount';
                }else if(formFields.value[i].name == "penalize" ){
                    formFields.value[i].value = 'No';
                }else{
                    formFields.value[i].value = '';
                }     
            }
            formFields.value[13].hidden = true;
            formFields.value[14].hidden = true;
            formFields.value[15].hidden = true;
            formFields.value[16].hidden = true;
        }

        watch([selectedPlan,selectedPenaltyLedger], () => {
            if (selectedPlan.value && selectedPenaltyLedger.value) {
                penComponentKey.value += 1;
                updateFormFields();
                if(selectedPlan.value.penalize == "No"){
                    formFields.value[13].hidden = true;
                    formFields.value[14].hidden = true;
                    formFields.value[15].hidden = true;
                    formFields.value[16].hidden = true;
                }else{
                    formFields.value[13].hidden = false;
                    formFields.value[14].hidden = false;
                    formFields.value[15].hidden = false;
                    formFields.value[16].hidden = false;
                }
            }else if(selectedPlan.value){
                updateFormFields();
                if(selectedPlan.value.penalize == "No"){
                    formFields.value[13].hidden = true;
                    formFields.value[14].hidden = true;
                    formFields.value[15].hidden = true;
                    formFields.value[16].hidden = true;
                }else{
                    formFields.value[13].hidden = false;
                    formFields.value[14].hidden = false;
                    formFields.value[15].hidden = false;
                    formFields.value[16].hidden = false;
                }
            }else{
                updateFormFields();
            }
            
        }, { immediate: true });
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createPaymentPlan = async() =>{
            showModalLoader();
            let formData = {
                category: formFields.value[0].value,
                payment_mode: formFields.value[2].value,
                name: formFields.value[1].value,
                installments: formFields.value[5].value,
                deposit_mode: formFields.value[3].value,
                deposit_value: formFields.value[4].value || 0,
                interest_method: formFields.value[6].value,
                interest_value: formFields.value[7].value || 0,
                interest_mode: formFields.value[8].value,
                balance_mode: formFields.value[9].value,
                hp_posting_mode: formFields.value[10].value,
                repayment_frequency: formFields.value[11].value,
                penalize: formFields.value[12].value || 'No',
                penalty_frequency: formFields.value[13].value || 'Monthly',
                penalty_value: formFields.value[15].value || 0,
                penalty_mode: formFields.value[14].value || 'Flat Amount',
                penalty_posting_account: penaltyLedgerID.value,
                penalty_posting_account_id: penaltyLedgerID.value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=0; i < (formFields.value.length - 1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Payment_Plans/createPaymentPlan', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Plan created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the Plan.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Plan: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchPlans();
                }
            }
        }
        const updatePaymentPlan= async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                payment_plan: selectedPlan.value.payment_plan_id,
                category: formFields.value[0].value,
                payment_mode: formFields.value[2].value,
                name: formFields.value[1].value,
                installments: formFields.value[5].value,
                deposit_mode: formFields.value[3].value,
                deposit_value: formFields.value[4].value,
                interest_method: formFields.value[6].value,
                interest_value: formFields.value[7].value || 0,
                interest_mode: formFields.value[8].value,
                balance_mode: formFields.value[9].value,
                hp_posting_mode: formFields.value[10].value,
                repayment_frequency: formFields.value[11].value,
                penalize: formFields.value[12].value || 'No',
                penalty_frequency: formFields.value[13].value || 'Monthly',
                penalty_value: formFields.value[15].value || 0,
                penalty_mode: formFields.value[14].value || 'Flat Amount',
                penalty_posting_account: penaltyLedgerValue.value,
                penalty_posting_account_id: penaltyLedgerValue.value,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type !='number' && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Payment_Plans/updatePaymentPlan', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Plan updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Plan.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Plan: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Payment_Plans/updateState",{selectedPlan:null})
                    searchPlans();
                }             
            }
        }
        const savePaymentPlan = () =>{
            if(isEditing.value == true){
                updatePaymentPlan();
            }else{
                createPaymentPlan();
            }
        }
        const removePaymentPlan = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    payment_plan: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Payment_Plans/deletePaymentPlan',formData)
                    if(response && response.status == 200){
                        toast.success("Plan Removed Succesfully");
                        searchPlans();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Plan: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Plan") 
            }else{
                toast.error("Please Select A Plan To Remove")
            }
        }
        const removePaymentPlans = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    payment_plan: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Payment_Plans/deletePaymentPlan',formData)
                    if(response && response.status == 200){
                        toast.success("Plan(s) Removed Succesfully");
                        searchPlans();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Plan: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Plan To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchPlans = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                name: name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/payment-plans-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                plansList.value = response.data.results;
                store.commit('Payment_Plans/LIST_PLANS', plansList.value)
                propResults.value = response.data;
                propArrLen.value = plansList.value.length;
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
            searchPlans(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            name_search.value = "";
            searchPlans();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchPlans();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchPlans();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchPlans();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchPlans();
            // scrollToTop();
        }
        const addNewPlan = () =>{
            store.dispatch("Payment_Plans/updateState",{selectedPlan:null,selectedPenaltyLedger: null,isEditing:false})
            propModalVisible.value = true;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const planID = row[idField];
                let formData = {
                    company: companyID.value,
                    payment_plan: planID
                }
                await store.dispatch('Payment_Plans/fetchPaymentPlan',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/4';
                flex_basis_percentage.value = '25';

            }else if(action == 'delete'){
                const planID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    payment_plan: planID
                }
                await store.dispatch('Payment_Plans/deletePaymentPlan',formData).
                then(()=>{
                    searchPlans();
                })
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
            handleReset();
        }
        onBeforeMount(()=>{
            searchPlans();
            fetchAllLedgers();
        })
        return{
            title, searchPlans,resetFilters, addButtonLabel, searchFilters, tableColumns, plansList,selectSearchQuantity,selectedValue,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,addingRight,removingRight,rightsModule,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewPlan, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, savePaymentPlan, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            dropdownWidth,removePaymentPlan, removePaymentPlans
        }
    }
};
</script>