<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <h2><strong>Loan Application Details</strong></h2>
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveLoanApplication" @handleReset="handleReset"> 
                    <template v-slot:additional-content>
                        <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[180px]">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Amortization Details</h1>
                            <div class="tabs pt-2">
                                <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                                    {{ tab }}
                                </button>
                            </div>
                            <div class="tab-content">
                                <div v-show="activeTab == 0" class="text-left">  
                                    <button @click="generateSchedules" class="rounded bg-green-400 cursor-pointer text-sm mr-2 mb-1.5  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Generate Schedules</button>                
                                    <DynamicTable :key="tableKey" :columns="scheduleColumns" :rows="scheduleRows" :showActions="showActions" :showTotals="showTotals"/>
                                </div>
                            </div>
                        </div>
                    </template>
                </DynamicForm>
            </div>
        </template>
    </PageStyleComponent>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import DynamicTable from '@/components/DynamicTable.vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default defineComponent({
    name: 'Loan_Application_Details',
    components:{
         DynamicForm,PageStyleComponent,SearchableDropdown,DynamicTable
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const tabs = ref(['Amortization Schedule']);
        const mainComponentKey = ref(0);
        const intComponentKey = ref(0);
        const catComponentKey = ref(0);
        const activeTab = ref(0);
        const rightsModule = ref('MMS');
        const displayButtons = ref(true);
        const componentKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const isEditing = computed(()=> store.state.Employee_Loan_Applications.isEditing);
        const selectedApplication = computed(()=> store.state.Employee_Loan_Applications.selectedApplication);
        const selectedEmployee = computed(()=> store.state.Employee_Loan_Applications.selectedEmployee);
        const selectedInterestLedger = computed(()=> store.state.Employee_Loan_Applications.selectedInterestLedger);
        const loanSchedules = computed(()=> store.state.Employee_Loan_Applications.loanSchedules);
        const employeeArray = computed(() => store.state.Employees.employeeArr);
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const employeeID = ref('');
        const intLedgerID = ref('');
        const showActions = ref(false);
        const showTotals = ref(true);
        const scheduleColumns = ref([
            {label: "Instlmnt", key:"installment", type: "text", editable: false},
            {label: "Due Date", key:"due_date", type: "text", editable: false},
            {label: "Loan Balance", key:"formatted_loan_balance", type: "text", editable: false},
            {label: "Instl Principal", key:"formatted_principal_amount", type: "number", editable: false},
            {label: "Instl Interest", key:"formatted_interest_amount", type: "number", editable: false},
            {label: "Schedule Payment", key:"formatted_schedule_repayment", type: "number", editable: false},
        ]);
        const scheduleRows = computed(() => {
            return store.state.Employee_Loan_Applications.loanSchedules;
        });
        const handleSelectedEmployee = async(option) =>{
            await store.dispatch('Employees/handleSelectedEmployee', option)
            employeeID.value = store.state.Employees.employeeID;
            if(selectedApplication.value){
                selectedApplication.value.employee.employee_id = employeeID.value;
                employeeValue.value = employeeID.value
            }
        };
        const clearSelectedEmployee = async() =>{
            await store.dispatch('Employees/updateState', {employeeID: ''});
            employeeID.value = store.state.Employees.employeeID;
        };
        const fetchAllLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const handleSelectedInterestLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            intLedgerID.value = store.state.Ledgers.ledgerID;
            if(selectedInterestLedger.value){
                selectedApplication.value.interest_posting_account.ledger_id = intLedgerID.value;
                intLedgerValue.value = intLedgerID.value
            }
        };
        const clearSelectedInterestLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            intLedgerID.value = store.state.Ledgers.ledgerID;
        };
        const formFields = ref();
        const employeeValue = computed(() => {
            return (selectedApplication.value && selectedApplication.value.employee && !employeeID.value) ? selectedApplication.value.employee.employee_id : employeeID.value;
        });
        const intLedgerValue = computed(() => {
            return (selectedApplication.value && selectedApplication.value.interest_posting_account && !intLedgerID.value) ? selectedApplication.value.interest_posting_account.ledger_id : intLedgerID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Employee", value: employeeValue.value, componentKey: catComponentKey,
                    selectOptions: employeeArray, optionSelected: handleSelectedEmployee, required: true,
                    searchPlaceholder: 'Select Employee...', dropdownWidth: '400px', updateValue: selectedEmployee.value,
                    fetchData: store.dispatch('Employees/fetchEmployees', {company:companyID.value}), clearSearch: clearSelectedEmployee
                },
                { type: 'text', name: 'applied_amount',label: "Applied Amount", value: selectedApplication.value?.applied_amount || '0', required: true},
                { type: 'date', name: 'application_date',label: "Application Date", value: selectedApplication.value?.application_date || '', required: true, placeholder: '' },
                { type: 'date', name: 'repayment_start_date',label: "Repayment Start Date", value: selectedApplication.value?.repayment_start_date || '', required: true, placeholder: '' },
                { type: 'text', name: 'loan_due_date',label: "Due Day", value: selectedApplication.value?.loan_due_date || '1', required: true },
                { type: 'text', name: 'installments',label: "Installments", value: selectedApplication.value?.installments || '1', required: true },
                { type: 'dropdown', name: 'loan_period',label: "Repayment Frequency", value: selectedApplication.value?.loan_period || 'Monthly', placeholder: "", required: true, options: [{ text: 'Daily', value: 'Daily' }, { text: 'Weekly', value: 'Weekly' },{ text: 'Monthly', value: 'Monthly' }, { text: 'Annually', value: 'Annually' }] },
                { type: 'dropdown', name: 'interest_charged',label: "Charge Interest", value: selectedApplication.value?.interest_charged || 'No', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                { type: 'text', name: 'interest_rate',label: "Interest Rate", value: selectedApplication.value?.interest_rate || '0', required: false },
                { type: 'dropdown', name: 'interest_calculation',label: "Interest Method", value: selectedApplication.value?.interest_calculation || 'Simple Interest', placeholder: "", required: false, options: [{ text: 'Reducing Interest EMI', value: 'Reducing Interest EMI' }, { text: 'Reducing Interest Fixed Principal', value: 'Reducing Interest Principal Payments' },{ text: 'Flat Interest EMI', value: 'Flat Interest EMI' }, { text: 'Flat Interest Principal Payments', value: 'Flat Interest Principal Payments' },{ text: 'Simple Interest', value: 'Simple Interest' }] },
                { type: 'text-area', name: 'loan_remarks',label: "Remarks", value: selectedApplication.value?.loan_remarks || '', required: false,textarea_rows: '2', textarea_cols: '56'},
                {  
                    type:'search-dropdown', label:"Interest Posting Account", value: intLedgerValue.value, componentKey: intComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedInterestLedger, required: false,
                    searchPlaceholder: 'Select Posting Acc...', dropdownWidth: '400px', updateValue: selectedInterestLedger.value,
                    fetchData: store.dispatch('Ledgers/fetchLedger', {company:companyID.value}), clearSearch: clearSelectedInterestLedger
                },
                {required: false}
            ];
        };

        const additionalFields = ref();
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                ];
        };

        watch([employeeID], () => {
            if(employeeID.value != ""){
                formFields.value[0].value = employeeID.value;
            }
        }, { immediate: true });

        watch([selectedApplication,selectedEmployee,selectedInterestLedger], () => {
            if (selectedApplication.value && selectedEmployee.value && selectedInterestLedger.value) {
                catComponentKey.value += 1;
                intComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
        
            }
            else if (selectedApplication.value && selectedEmployee.value) {
                catComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
        
            }else if(selectedApplication.value){
                updateFormFields();
                updateAdditionalFormFields();
            }
        }, { immediate: true });

        const handleReset = async() =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].label == 'Applied Amount'){
                    formFields.value[i].value = '0';
                }
                if(formFields.value[i].label == 'Due Day'){
                    formFields.value[i].value = '1';
                }
                if(formFields.value[i].label != 'Installments'){
                    formFields.value[i].value = '';
                }
            }
            await store.dispatch('Employee_Loan_Applications/updateState', {selectedApplication: null,selectedEmployee: null, loanSchedules: [], isEditing:false});
            mainComponentKey.value += 1;
            intComponentKey.value += 1;
            catComponentKey.value += 1;
            employeeID.value = "";
            intLedgerID.value = "";
        }
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const generateSchedules = async() =>{
            showLoader();
            let formData = {
                interest_charged: formFields.value[7].value,
                interest_calculation: formFields.value[9].value,
                interest_rate: formFields.value[8].value,
                loan_period: formFields.value[6].value,
                due_day: formFields.value[4].value || '1',
                application_date: formFields.value[2].value,
                repayment_start_date: formFields.value[3].value,
                applied_amount: formFields.value[1].value,
                installments: formFields.value[5].value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(employeeValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();
            }else if(parseFloat(formFields.value[2].value) <= 0){
                toast.error('Invalid Amount');
                hideLoader();
            }
            else{
                try {
                    const response = await store.dispatch('Employee_Loan_Applications/generateArmotizationSchedules', formData);
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to generate schedules: ' + error.message);
                } finally {
                    hideLoader();
                }
            }

        }
        const createLoanApplication = async() =>{
            showLoader();
            let formData = {
                loan_number: "-",
                loan_due_date: formFields.value[5].value || '1',
                interest_charged: formFields.value[7].value,
                interest_calculation: formFields.value[9].value,
                interest_rate: formFields.value[8].value,
                loan_period: formFields.value[6].value,
                application_date: formFields.value[2].value,
                repayment_start_date: formFields.value[3].value,
                applied_amount: formFields.value[1].value,
                installments: formFields.value[5].value,
                employee: employeeID.value,
                employee_id: employeeID.value,
                loan_remarks: formFields.value[10].value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(employeeValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();
            }else{
                try {
                    const response = await store.dispatch('Employee_Loan_Applications/createLoanApplication', formData);
                    if(response && response.status === 201) {
                        hideLoader();
                        toast.success('Application created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Application.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Application: ' + error.message);
                } finally {
                    hideLoader();
                }
            }

        }
        const updateLoanApplication = async() =>{
            showLoader();
            errors.value = [];
            let formData = {
                loan_application: selectedApplication.value.loan_application_id,
                loan_number: selectedApplication.value.loan_number,
                loan_due_date: formFields.value[5].value || '1',
                application_date: formFields.value[3].value,
                repayment_start_date: formFields.value[4].value,
                installments: formFields.value[6].value,
                employee: employeeValue.value,
                employee_id: employeeValue.value,
                loan_remarks: formFields.value[7].value,
                applied_amount: formFields.value[2].value,
                company: companyID.value,
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(employeeValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
            }else{
                try {
                    const response = await store.dispatch('Employee_Loan_Applications/updateLoanApplication', formData);
                    if (response && response.status === 200) {
                        hideLoader();
                        toast.success("Application updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Application.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Application: ' + error.message);
                } finally {
                    hideLoader();
                }
            }
        }
        const saveLoanApplication = () =>{
            if(isEditing.value == true){
                updateLoanApplication();
            }else{
                createLoanApplication();
            }
        };

        const selectTab = (index) => {
            activeTab.value = index;
        };
        
        onBeforeMount(()=>{ 
            updateFormFields();
            updateAdditionalFormFields();
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '20';
            additional_flex_basis.value = '1/3';
            additional_flex_basis_percentage.value = '33.333';
        })
        onMounted(()=>{
            
        })

        return{
            tabs,componentKey, formFields, additionalFields, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, mainComponentKey,handleReset, loader, showLoader, hideLoader,
            displayButtons,saveLoanApplication,selectTab,activeTab,rightsModule,scheduleColumns,scheduleRows,generateSchedules,showActions,showTotals
            
        }
    }
})
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
    padding: 3px;
    margin-top: 10px !important;
}
</style>