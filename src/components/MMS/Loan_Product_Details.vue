<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <h2><strong>Product Details</strong></h2>
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveLoanProduct" @handleReset="handleReset"> 
                    <template v-slot:additional-content>
                        <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[180px]">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Charge Details</h1>
                            <div class="tabs pt-2">
                                <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                                    {{ tab }}
                                </button>
                            </div>
                            <div class="tab-content">
                                <div v-show="activeTab == 0">
                                    <div class="text-left p-2">
                                        <SearchableDropdown 
                                            :key="chargeComponentKey"
                                            :options="chargeArr"
                                            :dropdownWidth="chargesDropdownWidth"
                                            :searchPlaceholder="chargesSearchPlaceholder"
                                            @option-selected="handleSelectedCharge"
                                            @fetchData="fetchData"
                                        />
                                    </div>                      
                                    <DynamicTable :key="tableKey" :columns="chargeColumns" :rows="chargeRows" :idField="idFieldCharge" :actions="actionCharges" @action-click="deleteCharge" :rightsModule="rightsModule" />
                                </div>
                                <div v-show="activeTab == 2">
                                    <div class="text-left p-2">
                        
                                    </div>                      
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
    name: 'Loan_Product_Details',
    components:{
         DynamicForm,PageStyleComponent,SearchableDropdown,DynamicTable
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const tabs = ref(['Loan Charges']);
        const mainComponentKey = ref(0);
        const intComponentKey = ref(0);
        const penComponentKey = ref(0);
        const recComponentKey = ref(0);
        const catComponentKey = ref(0);
        const grntCatComponentKey = ref(0);
        const chargeComponentKey = ref(0);
        const activeTab = ref(0);
        const rightsModule = ref('MMS');
        const displayButtons = ref(true);
        const componentKey = ref(0);
        const tableKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const isEditing = computed(()=> store.state.Loan_Products.isEditing);
        const selectedProduct = computed(()=> store.state.Loan_Products.selectedProduct);
        const selectedInterestLedger = computed(()=> store.state.Loan_Products.selectedInterestLedger);
        const selectedPenaltyLedger = computed(()=> store.state.Loan_Products.selectedPenaltyLedger);
        const selectedRecoveryLedger = computed(()=> store.state.Loan_Products.selectedRecoveryLedger);
        const selectedCategory = computed(()=> store.state.Loan_Products.selectedCategory);
        const selectedGuarantorCategory = computed(()=> store.state.Loan_Products.selectedGuarantorCategory);
        const loanCharges = computed(()=> store.state.Loan_Products.loanCharges);
        const categoryArray = computed(() => store.state.Member_Categories.categoryArr);
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const intLedgerID = ref('');
        const penaltyLedgerID = ref('');
        const recoveryLedgerID = ref('');
        const chargeArr = computed(() => store.state.Loan_Fees.feeArr);
        const chargesDropdownWidth = ref('400px');
        const chargesSearchPlaceholder = ref('Select Charge...');
        const categoryID = ref('');
        const grntCategoryID = ref('');
        const chargeColumns = ref([
            {label: "Name", key:"fee_name", type: "text", editable: false},
            {label: "Charge Time", key:"charge_time", type: "text", editable: false},
            {label: "Charge Mode", key:"charge_mode", type: "text", editable: false},
            {label: "Charge Type", key:"charge_type", type: "text", editable: false},
            {label: "Value", key: "default_amount", type: "number", editable: true},
        ]);
        const chargeRows = computed(() => {
            return store.state.Loan_Fees.feeArray;
        });
        const idFieldCharge = 'loan_fee_id';
        const actionCharges = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Charge', rightName: 'Adding Loan Products'},
        ])

        const handleSelectedCategory = async(option) =>{
            await store.dispatch('Member_Categories/handleSelectedCategory', option)
            categoryID.value = store.state.Member_Categories.categoryID;
            
        };
        const clearSelectedCategory = async() =>{
            await store.dispatch('Member_Categories/updateState', {categoryID: ''});
            categoryID.value = store.state.Member_Categories.categoryID;
        };
        const handleSelectedGuarantorCategory = async(option) =>{
            await store.dispatch('Member_Categories/handleSelectedCategory', option)
            grntCategoryID.value = store.state.Member_Categories.categoryID;
            
        };
        const clearSelectedGuarantorCategory = async() =>{
            await store.dispatch('Member_Categories/updateState', {categoryID: ''});
            grntCategoryID.value = store.state.Member_Categories.categoryID;
        };
        const fetchAllLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const handleSelectedInterestLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            intLedgerID.value = store.state.Ledgers.ledgerID;
            if(selectedProduct.value){
                selectedProduct.value.interest_posting_account.ledger_id = intLedgerID.value;
                intLedgerValue.value = intLedgerID.value
            }
        };
        const clearSelectedInterestLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            intLedgerID.value = store.state.Ledgers.ledgerID;
        };
        const handleSelectedPenaltyLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            penaltyLedgerID.value = store.state.Ledgers.ledgerID;
            if(selectedProduct.value && selectedProduct.value.penalty_posting_account){
                selectedProduct.value.penalty_posting_account.ledger_id = penaltyLedgerID.value;
                penaltyLedgerValue.value = penaltyLedgerID.value
            }
        };
        const clearSelectedPenaltyLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            penaltyLedgerID.value = store.state.Ledgers.ledgerID;
        };
        const handleSelectedRecoveryLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            recoveryLedgerID.value = store.state.Ledgers.ledgerID;
            if(selectedProduct.value && selectedProduct.value.recovery_posting_account){
                selectedProduct.value.recovery_posting_account.ledger_id = recoveryLedgerID.value;
                recoveryLedgerValue.value = recoveryLedgerID.value
            }
        };
        const clearSelectedRecoveryLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            recoveryLedgerID.value = store.state.Ledgers.ledgerID;
        };
        const fetchCharges = async() =>{
            await store.dispatch('Loan_Fees/fetchLoanFees', {company:companyID.value})
        };
        const formFields = ref();
        const categoryValue = computed(() => {
           return (selectedProduct.value && selectedProduct.value.member_category && !categoryID.value) ? selectedProduct.value.member_category.member_category_id : categoryID.value;

        });
        const grntCategoryValue = computed(() => {
           return (selectedProduct.value && selectedProduct.value.guarantor_category && !categoryID.value) ? selectedProduct.value.guarantor_category.member_category_id : grntCategoryID.value;

        });
        const intLedgerValue = computed(() => {
            return (selectedProduct.value && selectedProduct.value.interest_posting_account && !intLedgerID.value) ? selectedProduct.value.interest_posting_account.ledger_id : intLedgerID.value;
        });
        const penaltyLedgerValue = computed(() => {
            return (selectedProduct.value && selectedProduct.value.penalty_posting_account && !penaltyLedgerID.value) ? selectedProduct.value.penalty_posting_account.ledger_id : penaltyLedgerID.value;
        });
        const recoveryLedgerValue = computed(() => {
            return (selectedProduct.value && selectedProduct.value.recovery_posting_account && !recoveryLedgerID.value) ? selectedProduct.value.recovery_posting_account.ledger_id : recoveryLedgerID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Member Category", value: categoryValue.value, componentKey: catComponentKey,
                    selectOptions: categoryArray, optionSelected: handleSelectedCategory, required: false,
                    searchPlaceholder: 'Select Category...', dropdownWidth: '300px', updateValue: selectedCategory.value,
                    fetchData: store.dispatch('Member_Categories/fetchMemberCategories', {company:companyID.value}), clearSearch: clearSelectedCategory
                },
                { type: 'text', name: 'product_code',label: "Code", value: selectedProduct.value?.product_code || '', required: false },
                { type: 'text', name: 'product_name',label: "Name", value: selectedProduct.value?.product_name || '', required: true },
                { type: 'date', name: 'date',label: "Effective Date", value: selectedProduct.value?.date || '', required: true, placeholder: '' },
                { type: 'dropdown', name: 'repayment_frequency',label: "Repayment Frequency", value: selectedProduct.value?.repayment_frequency || 'Monthly', placeholder: "", required: true, options: [{ text: 'Daily', value: 'Daily' }, { text: 'Weekly', value: 'Weekly' },{ text: 'Monthly', value: 'Monthly' }, { text: 'Annually', value: 'Annually' }] },
                { type: 'text', name: 'min_amount',label: "Min Amount", value: selectedProduct.value?.min_amount || '', required: true },
                { type: 'text', name: 'max_amount',label: "Max Amount", value: selectedProduct.value?.max_amount || '0', required: false },
                { type: 'text', name: 'interest_rate',label: "Interest Rate(%)p.a", value: selectedProduct.value?.interest_rate || '0', required: false },
                { type: 'dropdown', name: 'interest_calculation',label: "Interest Method", value: selectedProduct.value?.interest_calculation || 'Simple Interest', placeholder: "", required: true, options: [{ text: 'Reducing Interest EMI', value: 'Reducing Interest EMI' }, { text: 'Reducing Interest Fixed Principal', value: 'Reducing Interest Principal Payments' },{ text: 'Flat Interest EMI', value: 'Flat Interest EMI' }, { text: 'Flat Interest Principal Payments', value: 'Flat Interest Principal Payments' },{ text: 'Simple Interest', value: 'Simple Interest' },{ text: 'Compound Interest', value: 'Compound Interest' }] },
                { type: 'dropdown', name: 'interest_frequency',label: "Interest Frequency", value: selectedProduct.value?.interest_frequency || 'Monthly', placeholder: "", required: true, options: [{ text: 'Daily', value: 'Days' }, { text: 'Weekly', value: 'Weeks' },{ text: 'Monthly', value: 'Months' }, { text: 'Annually', value: 'Years' }] },
                { type: 'text', name: 'max_repayment',label: "Max Repay. Period", value: selectedProduct.value?.max_repayment || '0', required: false },
                { type: 'dropdown', name: 'mandatory_savings',label: "Use Savings/Shares", value: selectedProduct.value?.mandatory_savings || 'Yes', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                { type: 'dropdown', name: 'guarantee_option',label: "Savings/Shares Option", value: selectedProduct.value?.guarantee_option || 'Savings', placeholder: "", required: true, options: [{ text: 'Savings', value: 'Savings' }, { text: 'Shares', value: 'Shares' }] },
                { type: 'text', name: 'savings_percentage',label: "Savings/Shares Percentage(%)", value: selectedProduct.value?.savings_percentage || '0', required: false },
                { type: 'dropdown', name: 'penalize',label: "Penalize", value: selectedProduct.value?.penalize || 'No', placeholder: "", required: false, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                { type: 'dropdown', name: 'penalty_frequency',label: "Penalty Frequency", value: selectedProduct.value?.penalty_frequency || 'Monthly', placeholder: "", required: true, options: [{ text: 'Daily', value: 'Daily' }, { text: 'Weekly', value: 'Weekly' },{ text: 'Monthly', value: 'Monthly' }, { text: 'Annually', value: 'Annually' }, { text: 'One-Off', value: 'One-Off' }] },
                { type: 'dropdown', name: 'penalty_mode',label: "Penalty Mode", value: selectedProduct.value?.penalty_mode || 'Flat Amount', placeholder: "", required: false, options: [{ text: 'Flat Amount', value: 'Flat Amount' }, { text: '% of Installment Principal', value: 'Installment Principal' },{ text: '% of Installment Interest', value: 'Installment Interest' }, { text: '% of Installment Principal + Interest', value: 'Installment Principal + Interest' }, { text: '% of Installment (Principal + Interest) Balance', value: 'Installment Principal + Interest Balance' },{ text: '% of Principal Balance', value: 'Principal Balance' }, { text: '% of Loan Balance', value: 'Loan Balance' }] },
                { type: 'text', name: 'penalty_value',label: "Penalty Value", value: selectedProduct.value?.penalty_value || '0', required: false },
                { type: 'number', name: 'penalty_days',label: "Exempt Penalty For Expired Loans(Days)", value: selectedProduct.value?.penalty_days || 0, required: false },
                { type: 'dropdown', name: 'use_guarantors',label: "Use Guarantors", value: selectedProduct.value?.use_guarantors || 'Yes', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                { type: 'text', name: 'min_guarantors',label: "Minimum Guarantors", value: selectedProduct.value?.min_guarantors || '0', required: false },
                { type: 'text', name: 'guarantors_percentage',label: "Guarantors Percentage(%)", value: selectedProduct.value?.guarantors_percentage || '0', required: false },
                {  
                    type:'search-dropdown', label:"Guarantor Category", value: grntCategoryValue.value, componentKey: grntCatComponentKey,
                    selectOptions: categoryArray, optionSelected: handleSelectedGuarantorCategory, required: false,
                    searchPlaceholder: 'Select Category...', dropdownWidth: '300px', updateValue: selectedGuarantorCategory.value,
                    clearSearch: clearSelectedGuarantorCategory
                },
                { type: 'dropdown', name: 'use_security',label: "Use Security", value: selectedProduct.value?.use_security || 'No', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                { type: 'dropdown', name: 'credit_reduction',label: "Credit Reduction", value: selectedProduct.value?.credit_reduction || 'No', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                { type: 'dropdown', name: 'recovery_option',label: "Loan Recovery Option", value: selectedProduct.value?.recovery_option || 'Payable', placeholder: "", required: true, options: [{ text: 'Payable', value: 'Payable' },{ text: 'Savings', value: 'Savings' }, { text: 'Shares', value: 'Shares' }] },                
                {  
                    type:'search-dropdown', label:"Interest Posting Account", value: intLedgerValue.value, componentKey: intComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedInterestLedger, required: true,
                    searchPlaceholder: 'Select Posting Acc...', dropdownWidth: '350px', updateValue: selectedInterestLedger.value,
                    clearSearch: clearSelectedInterestLedger
                },
                {  
                    type:'search-dropdown', label:"Penalty Income Posting Account", value: penaltyLedgerValue.value, componentKey: penComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedPenaltyLedger, required: false,
                    searchPlaceholder: 'Select Posting Acc...', dropdownWidth: '350px', updateValue: selectedPenaltyLedger.value,
                    clearSearch: clearSelectedPenaltyLedger
                },
                {  
                    type:'search-dropdown', label:"Loan Recovery Payable Account", value: recoveryLedgerValue.value, componentKey: recComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedRecoveryLedger, required: false,
                    searchPlaceholder: 'Select Payable Acc...', dropdownWidth: '350px', updateValue: selectedRecoveryLedger.value,
                    clearSearch: clearSelectedRecoveryLedger
                },
                { type: 'dropdown', name: 'enable_reminders',label: "Enable Reminder", value: selectedProduct.value?.enable_reminders || 'No', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                { type: 'dropdown', name: 'reminder_mode',label: "Reminder Mode", value: selectedProduct.value?.reminder_mode || 'On Schedule Day', placeholder: "", required: true, options: [{ text: 'On Schedule Day', value: 'On Schedule Day' }, { text: 'Day(s) Before and After Schedule Date', value: 'Before and After Schedule Date' },{ text: 'Day(s) Before Schedule Date', value: 'Before Schedule Date' }, { text: 'Day(s) After Schedule Date', value: 'After Schedule Date' },{ text: 'On Schedule Day and Day(s) Before Schedule Date', value: 'On Schedule Day and Before Schedule Date' }, { text: 'On Schedule Day and Day(s) After Schedule Date', value: 'On Schedule Day and After Schedule Date' }] },
                { type: 'number', name: 'reminder_days',label: "Reminder Days", value: selectedProduct.value?.reminder_days || 1, required: false },
                {required: false},
                {required: false},
                {required: false},
                {required: false},
            ];
        };

        const additionalFields = ref();
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                ];
        };

        watch([categoryID, intLedgerID,penaltyLedgerID,grntCategoryID,recoveryLedgerID], () => {
            if (categoryID.value != "") {
                formFields.value[0].value = categoryID.value;
            }
            if(intLedgerID.value != ""){
                formFields.value[26].value = intLedgerID.value;
            }
            if(penaltyLedgerID.value != ""){
                formFields.value[27].value = penaltyLedgerID.value;
            }
            if (grntCategoryID.value != "") {
                formFields.value[22].value = grntCategoryID.value;
            }
            if (recoveryLedgerID.value != "") {
                formFields.value[28].value = recoveryLedgerID.value;
            }
        }, { immediate: true });

        watch([selectedProduct, selectedInterestLedger, selectedPenaltyLedger, selectedRecoveryLedger, selectedCategory, selectedGuarantorCategory, loanCharges], () => {
            if(loanCharges.value){
                store.dispatch('Loan_Fees/updateState',{feeArray: loanCharges.value})
                tableKey.value += 1;
            }
            if(selectedProduct.value){
                catComponentKey.value += 1;
                intComponentKey.value += 1;
                penComponentKey.value += 1;
                recComponentKey.value += 1;
                grntCatComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
            }
            
        }, { immediate: true });

        const handleReset = async() =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].label != 'Country'){
                    formFields.value[i].value = '';
                }
            }
            for(let i=0; i < additionalFields.value.length; i++){
                additionalFields.value[i].value = '';
            }
            await store.dispatch('Loan_Fees/updateState', {feeArray: []});
            await store.dispatch('Loan_Products/updateState', {selectedProduct: null, loanCharges: [], selectedInterestLedger: null, selectedPenaltyLedger: null, selectedRecoveryLedger: null, selectedCategory: null, selectedGuarantorCategory: null, isEditing:false});
            mainComponentKey.value += 1;
            intComponentKey.value += 1;
            catComponentKey.value += 1;
            grntCatComponentKey.value += 1;
            penComponentKey.value += 1;
            recComponentKey.value += 1;
            intLedgerID.value = "";
            penaltyLedgerID.value = "";
            categoryID.value = "";
            grntCategoryID.value = "";
            recoveryLedgerID.value = "";
        }
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createLoanProduct = async() =>{
            showLoader();
            let formData = {
                product_code: formFields.value[1].value || '-',
                product_name: formFields.value[2].value,
                date: formFields.value[3].value,
                repayment_frequency: formFields.value[4].value,
                min_amount: formFields.value[5].value,
                max_amount: formFields.value[6].value,
                interest_rate: formFields.value[7].value,
                interest_calculation: formFields.value[8].value,
                interest_frequency: formFields.value[9].value,
                max_repayment: formFields.value[10].value,
                mandatory_savings: formFields.value[11].value,
                guarantee_option: formFields.value[12].value,
                savings_percentage: formFields.value[13].value,
                penalize: formFields.value[14].value,
                penalty_frequency: formFields.value[15].value,
                penalty_value: formFields.value[17].value,
                status: 'Active',
                penalty_mode: formFields.value[16].value,
                penalty_days: formFields.value[18].value,
                use_guarantors: formFields.value[19].value,
                min_guarantors: formFields.value[20].value,
                guarantors_percentage: formFields.value[21].value,
                use_security: formFields.value[23].value,
                credit_reduction: formFields.value[24].value,
                recovery_option: formFields.value[25].value,
                enable_reminders: formFields.value[29].value,
                reminder_mode: formFields.value[30].value,
                reminder_days: formFields.value[31].value,
                interest_posting_account: intLedgerID.value,
                interest_posting_account_id: intLedgerID.value,
                penalty_posting_account: penaltyLedgerID.value,
                penalty_posting_account_id: penaltyLedgerID.value,
                recovery_posting_account: recoveryLedgerID.value,
                recovery_posting_account_id: recoveryLedgerID.value,
                member_category: categoryID.value,
                member_category_id: categoryID.value,
                guarantor_category: grntCategoryID.value,
                guarantor_category_id: grntCategoryID.value,
                charges: chargeRows.value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(intLedgerValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();
            }else{
                try {
                    const response = await store.dispatch('Loan_Products/createLoanProduct', formData);
                    if(response && response.status === 201) {
                        hideLoader();
                        toast.success('Product created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Product.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Product: ' + error.message);
                } finally {
                    hideLoader();
                }
            }

        }
        const updateLoanProduct = async() =>{
            showLoader();
            errors.value = [];
            let formData = {
                loan_product: selectedProduct.value.loan_product_id,
                product_code: formFields.value[1].value || '-',
                product_name: formFields.value[2].value,
                date: formFields.value[3].value,
                repayment_frequency: formFields.value[4].value,
                min_amount: formFields.value[5].value,
                max_amount: formFields.value[6].value,
                interest_rate: formFields.value[7].value,
                interest_calculation: formFields.value[8].value,
                interest_frequency: formFields.value[9].value,
                max_repayment: formFields.value[10].value,
                mandatory_savings: formFields.value[11].value,
                guarantee_option: formFields.value[12].value,
                savings_percentage: formFields.value[13].value,
                penalize: formFields.value[14].value,
                penalty_frequency: formFields.value[15].value,
                penalty_value: formFields.value[17].value,
                status: selectedProduct.value.status,
                penalty_mode: formFields.value[16].value,
                penalty_days: formFields.value[18].value,
                use_guarantors: formFields.value[19].value,
                min_guarantors: formFields.value[20].value,
                guarantors_percentage: formFields.value[21].value,
                use_security: formFields.value[23].value,
                credit_reduction: formFields.value[24].value,
                recovery_option: formFields.value[25].value,
                enable_reminders: formFields.value[29].value,
                reminder_mode: formFields.value[30].value,
                reminder_days: formFields.value[31].value,
                interest_posting_account: intLedgerValue.value,
                interest_posting_account_id: intLedgerValue.value,
                penalty_posting_account: penaltyLedgerValue.value,
                penalty_posting_account_id: penaltyLedgerValue.value,
                recovery_posting_account: recoveryLedgerValue.value,
                recovery_posting_account_id: recoveryLedgerValue.value,
                member_category: categoryValue.value,
                member_category_id: categoryValue.value,
                guarantor_category: grntCategoryValue.value,
                guarantor_category_id: grntCategoryValue.value,
                company: companyID.value,
                charges: chargeRows.value,
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(intLedgerValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
            }else{
                try {
                    const response = await store.dispatch('Loan_Products/updateLoanProduct', formData);
                    if (response && response.status === 200) {
                        hideLoader();
                        toast.success("Product updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Product.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Product: ' + error.message);
                } finally {
                    hideLoader();
                }
            }
        }
        const saveLoanProduct = () =>{
            if(isEditing.value == true){
                updateLoanProduct();
            }else{
                createLoanProduct();
            }
        };

        const selectTab = (index) => {
            activeTab.value = index;
        };
        
        const handleSelectedCharge = async(option) =>{
            await store.dispatch('Loan_Fees/handleSelectedFee', option);
            chargeComponentKey.value += 1;
        }
        const deleteCharge = (rowIndex, action, row) =>{
            store.dispatch('Loan_Fees/removeLoanFee', rowIndex);
            tableKey.value += 1;
        }
        
        onBeforeMount(()=>{ 
            fetchCharges();
            updateFormFields();
            updateAdditionalFormFields();
            flex_basis.value = '1/6';
            flex_basis_percentage.value = '25';
            additional_flex_basis.value = '1/4';
            additional_flex_basis_percentage.value = '25';
        })
        onMounted(()=>{
            fetchAllLedgers();
        })

        return{
            tabs,componentKey, formFields, additionalFields, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, mainComponentKey,handleReset, loader, showLoader, hideLoader,
            displayButtons,saveLoanProduct,chargeArr,chargesDropdownWidth,chargesSearchPlaceholder,selectTab,handleSelectedCharge,
            deleteCharge,activeTab,rightsModule,idFieldCharge,chargeRows,chargeColumns,actionCharges,chargeComponentKey
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