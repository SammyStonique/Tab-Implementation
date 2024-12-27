<template>
    <h2><strong>Employment Details</strong></h2>
    <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage"  @handleReset="handleReset"> 
        <template v-slot:additional-content>
            <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[280px]">
                <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Deductions</h1>
                <div class="tabs pt-2">
                    <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                        {{ tab }}
                    </button>
                </div>
                <div class="tab-content">
                    <div v-show="activeTab == 0">
                        <DynamicForm :fields="additionalFields" :flex_basis="additional_flex_basis" :flex_basis_percentage="additional_flex_basis_percentage" @handleReset="handleReset"/>
                    </div>
                    <div v-show="activeTab == 1">
                        <div class="text-left p-2">
                            <SearchableDropdown 
                                :key="deducComponentKey"
                                :options="deductionArr"
                                :dropdownWidth="deductionsDropdownWidth"
                                :searchPlaceholder="deductionsSearchPlaceholder"
                                @option-selected="handleSelectedDeduction"
                                @fetchData="fetchData"
                            />
                        </div>                      
                        <DynamicTable :key="tableKey" :columns="deductionColumns" :rows="computedDeductionRows" :idField="idFieldDeduction" :actions="actionDeductions" @action-click="deleteDeduction" :rightsModule="rightsModule" />
                    </div>
                    <div v-show="activeTab == 2">
                        <div class="text-left p-2">
              
                        </div>                      
                    </div>
                </div>
            </div>
        </template>
    </DynamicForm>
    
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch, reactive } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import DynamicTable from '@/components/DynamicTable.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default defineComponent({
    name: 'Deduction_Details',
    components:{
        DynamicForm, SearchableDropdown, DynamicTable
    },
    props:{
        formFields: Array,
        additionalFields: Array,
        deductionRows:{
            type: Array,
            default:() => [],
        },
    },
    emits: ['update-form'],
    setup(props,{emit}){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const tabs = ref(['Statutory Deductions','Recurrent Earnings/Deductions']);
        const rightsModule = ref('HR');
        const activeTab = ref(0);
        const mainComponentKey = ref(0);
        const bankComponentKey = ref(0);
        const deducComponentKey = ref(0);
        const tableKey = ref(0);
        const statTableKey = ref(0);
        const deducTableKey = ref(0);
        const currencyComponentKey = ref(0);
        const payComponentKey = ref(0);
        const companyID = computed(()=> store.state.userData.company_id);
        const isEditing = computed(()=> store.state.Employees.isEditing);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const selectedEmployee = computed(()=> store.state.Employees.selectedEmployee);
        const selectedEmployeeCurrency = computed(()=> store.state.Employees.selectedEmployeeCurrency);
        const currencyArray = computed(() => store.state.Currencies.currencyArr);
        const bankArray = computed(() => store.state.Banks.bankArr);
        const payGroupArray = computed(() => store.state.Pay_Groups.groupArr);
        const currencyID = ref('');
        const payGroupID = ref('');
        const bankID = ref('');
        const deductionArr = computed({
            get: () => store.state.Deductions.deductionArr,
        });
        const deductionsDropdownWidth = ref('400px');
        const deductionsSearchPlaceholder = ref('Select Earning/Deduction');
        const deductionColumns = ref([
            {label: "Name", key:"deduction_name", type: "text", editable: false},
            {label: "Type", key:"deduction_type", type: "text", editable: false},
            {label: "Amount", key: "default_value", type: "number", editable: true},
        ])

        const localDeductionRows = ref([...props.deductionRows]);
        const computedDeductionRows = computed(() => {
            return store.state.Deductions.deductionArray;
        });

        const idFieldDeduction = 'deduction_id';
        const actionDeductions = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Deduction', rightName: 'Adding Employees'},
        ])

        const showLoader = () =>{
            loader.value = "block";
        };
        const hideLoader = () =>{
            loader.value = "none";
        };

        watch([currencyID], () => {
            if(currencyID.value){
                formFields.value[10].value = currencyID.value;
            }


        }, { immediate: true });
        const formFields = ref(props.formFields);
        const currencyValue = computed(() => {
           return (selectedEmployee.value && selectedEmployee.value.currency && !currencyID.value) ? selectedEmployee.value.currency.currency_id : currencyID.value;
        });
        const bankValue = computed(() => {
           return bankID.value;
        });
        const payValue = computed(() => {
           return payGroupID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                { type: 'date', name: 'employment_start_date',label: "Employment Date", value: selectedEmployee.value?.employment_start_date || '', required: true },
                { type: 'date', name: 'employment_end_date',label: "Employment End Date", value: selectedEmployee.value?.employment_end_date || '', required: false },
                { type: 'text', name: 'basic_pay',label: "Basic Pay", value: selectedEmployee.value?.basic_pay || '0', required: true },
                { type: 'dropdown', name: 'employment_status',label: "Employment Type", value: selectedEmployee.value?.employment_status || '', placeholder: "", required: true, options: [{ text: 'Full-time Permanent', value: 'Full-time Permanent' }, { text: 'Part-time Permanent', value: 'Part-time Permanent' }, { text: 'Consultant', value: 'Consultant' },{ text: 'Casual', value: 'Casual' }, { text: 'Full-time Contract', value: 'Full-time Contract' }, { text: 'Part-time Contract', value: 'Part-time Contract' },{ text: 'Probation', value: 'Probation' }, { text: 'Internship', value: 'Internship' }] },
                { type: 'dropdown', name: 'payment_method',label: "Payment Method", value: selectedEmployee.value?.payment_method || '', placeholder: "", required: true, options: [{ text: 'Cash', value: 'Cash' }, { text: 'Mpesa', value: 'Mpesa' }, { text: 'Bank Deposit', value: 'Bank Deposit' },{ text: 'Cheque', value: 'Cheque' }, { text: 'Check-off', value: 'Check-off' }, { text: 'RTGS', value: 'RTGS' },{ text: 'EFT', value: 'EFT' }, { text: 'Not Applicable', value: 'Not Applicable' }] },
                {  
                    type:'search-dropdown', label:"Bank", value: bankValue.value, componentKey: bankComponentKey,
                    selectOptions: bankArray, optionSelected: handleSelectedBank, required: false,
                    searchPlaceholder: 'Select Bank...', dropdownWidth: '500px', updateValue: selectedEmployeeCurrency.value,
                    fetchData: fetchBanks(), clearSearch: clearSelectedBank
                },
                { type: 'text', name: 'account_name',label: "Account Name", value: '-', required: false },
                { type: 'text', name: 'account_number',label: "Account No", value: '0', required: false },
                { type: 'text', name: 'insurance_premium',label: "Insurance Premium", value: selectedEmployee.value?.insurance_premium || '0', required: false },
                { type: 'text', name: 'insurance_relief',label: "Insurance Relief", value: selectedEmployee.value?.insurance_relief || '0', required: false },
                {  
                    type:'search-dropdown', label:"Currency", value: currencyValue.value, componentKey: currencyComponentKey,
                    selectOptions: currencyArray, optionSelected: handleSelectedCurrency, required: true,
                    searchPlaceholder: 'Select Currency...', dropdownWidth: '500px', updateValue: selectedEmployeeCurrency.value,
                    fetchData: fetchCurrencies(), clearSearch: clearSelectedCurrency
                },
                {  
                    type:'search-dropdown', label:"Pay Group", value: payValue.value, componentKey: payComponentKey,
                    selectOptions: payGroupArray, optionSelected: handleSelectedPayGroup, required: false,
                    searchPlaceholder: 'Select Pay Group...', dropdownWidth: '500px', updateValue: selectedEmployeeCurrency.value,
                    fetchData: fetchPayGroups(), clearSearch: clearSelectedPayGroup
                },
               ];
        };
        watch([bankID, payGroupID], () => {
            if (bankID.value != "") {
                formFields.value[5].value = bankID.value
            }
            if (payGroupID.value != "") {
                formFields.value[11].value = payGroupID.value
            }
        }, { immediate: true });
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
  
            for(let i=0; i < additionalFields.value.length; i++){
                additionalFields.value[i].value = '';
            }
            currencyID.value = '';
            payGroupID.value = '';
            bankID.value = '';
            store.dispatch('Deductions/updateState',{deductionArray: []})
            emit('reset-employment-details')
        }

        watch([selectedEmployee], () => {
            if (selectedEmployee.value) {
                bankComponentKey.value += 1;
                deducComponentKey.value += 1;
                // updateFormFields();
            }
        }, { immediate: true });
        const handleSelectedBank = async(option) =>{
            await store.dispatch('Banks/handleSelectedBank', option)
            bankID.value = store.state.Banks.bankID;
        }
        const clearSelectedBank = async() =>{
            await store.dispatch('Banks/updateState', {bankID: ''});
            bankID.value = store.state.Banks.bankID;
        }

        const fetchBanks = async() =>{
            await store.dispatch('Banks/fetchBanks', {company:companyID.value})
        };

        const handleSelectedCurrency = async(option) =>{
            await store.dispatch('Currencies/handleSelectedCurrency', option)
            currencyID.value = store.state.Currencies.currencyID;
            if(selectedEmployee.value){
                selectedEmployee.value.employee_currency.currency_id = currencyID.value;
            }
        }
        const clearSelectedCurrency = async() =>{
            await store.dispatch('Currencies/updateState', {currencyID: ''});
            currencyID.value = store.state.Currencies.currencyID;
        }

        const fetchCurrencies = async() =>{
            await store.dispatch('Currencies/fetchCurrencies', {company:companyID.value})
        };

        const handleSelectedPayGroup = async(option) =>{
            await store.dispatch('Pay_Groups/handleSelectedPayGroup', option)
            payGroupID.value = store.state.Pay_Groups.groupID;
        }
        const clearSelectedPayGroup = async() =>{
            await store.dispatch('Pay_Groups/updateState', {groupID: ''});
            payGroupID.value = store.state.Pay_Groups.groupID;
        }

        const fetchPayGroups = async() =>{
            await store.dispatch('Pay_Groups/fetchPayGroups', {company:companyID.value})
        };
        const additionalFields = ref(props.additionalFields);
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                { type: 'dropdown', name: 'deduct_shif',label: "Deduct SHIF", value: selectedEmployee.value?.deduct_shif || 'No', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                { type: 'text', name: 'shif_number',label: "SHIF No", value: selectedEmployee.value?.shif_number || '-', required: false },
                {required:false},
                { type: 'dropdown', name: 'deduct_nssf',label: "Deduct NSSF", value: selectedEmployee.value?.deduct_nssf || 'No', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                { type: 'text', name: 'nssf_number',label: "NSSF No", value: selectedEmployee.value?.nssf_number || '-', required: false },
                {required:false}
            ];
        };
        watch([selectedEmployee, selectedEmployeeCurrency], () => {
            if(selectedEmployee.value  && selectedEmployeeCurrency.value){
                currencyComponentKey.value += 1;
                payComponentKey.value += 1;
                updateAdditionalFormFields();
            }
        }, { immediate: true });

        const emitUpdatedFields = () => {
            emit('update-form', formFields.value, additionalFields.value, localDeductionRows.value);
        };
        watch(() => store.state.Deductions.deductionArray, (newVal) => {
            if (newVal) {
                localDeductionRows.value = [...newVal];
                tableKey.value += 1;
                emitUpdatedFields();
            }else{
                emitUpdatedFields();
            }
        },{ immediate: true });
         
        const selectTab = (index) => {
            activeTab.value = index;
        };
        
        const handleSelectedDeduction = async(option) =>{
            await store.dispatch('Deductions/handleSelectedDeduction', option);
            deducComponentKey.value += 1;
        }
        const deleteDeduction = (rowIndex, action, row) =>{
            store.dispatch('Deductions/removeDeduction', rowIndex);
            tableKey.value += 1;
        }
        onBeforeMount(()=>{ 
            store.dispatch('Deductions/fetchDeductions',{company:companyID.value});
            updateFormFields();
            updateAdditionalFormFields();
            currencyComponentKey.value += 1;
            payComponentKey.value += 1;
            bankComponentKey.value += 1;
            deducComponentKey.value += 1;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
            additional_flex_basis.value = '1/4';
            additional_flex_basis_percentage.value = '25';
        })
        onMounted(()=>{
            emitUpdatedFields();
        })

        return{
            emitUpdatedFields, computedDeductionRows,tabs, selectTab,activeTab, bankComponentKey,deducComponentKey, formFields, additionalFields,flex_basis, 
            flex_basis_percentage, additional_flex_basis,additional_flex_basis_percentage, mainComponentKey,handleReset, isEditing, loader, showLoader, hideLoader,
            tableKey, deductionArr, deductionsDropdownWidth, deductionsSearchPlaceholder, deductionColumns,  idFieldDeduction, actionDeductions, deleteDeduction, handleSelectedDeduction,
            statTableKey,rightsModule
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