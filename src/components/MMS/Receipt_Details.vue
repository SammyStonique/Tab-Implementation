<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="createMemberReceipt" @handleReset="handleReset"> 
                    <template v-slot:additional-content>
                        <div class="flex mb-1.5">
                            <div class="basis-1/3 text-left">
                                <button v-show="hasPrepayment" @click="addPrepayment" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Add Prepayment</button>
                            </div>
                            <div class="basis-1/2 text-red-500 text-left">
                                <p class="font-bold">DUE BALANCE:  {{ Number(outstanding_balance).toLocaleString() }}</p>
                            </div> 
                            <div class="basis-1/3 text-left">
                                <button  @click="addReceiptItems" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Add Receipt Items</button>
                            </div>              
                        </div>
                        
                        <div class="px-3 min-h-[220px]">
                            <DynamicTable :key="tableKey" :columns="receiptColumns" :rows="receiptRows" :showActions="showActions" :idField="idField" @update-receipt-amount="allocateInputAmount" @row-db-click="autoPopulatePaymentAlloc" 
                                            :showTotals="showTotals" :actions="actionsRcptItems" @action-click="removeReceiptItem" :rightsModule="rightsModule"/>
                        </div>
                    </template>
                </DynamicForm>
            </div>
        </template>
    </PageStyleComponent>
    <MovableModal v-model:visible="prepModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
    >
        <DynamicForm 
            :fields="additionalFields" :flex_basis="flex_basis_additional" :flex_basis_percentage="flex_basis_percentage_additional" 
            :displayButtons="displayButtons" @handleSubmit="handlePrepayment" @handleReset="handlePrepaymentReset"
        />
    </MovableModal>
    <MovableModal v-model:visible="addModalVisible" :title="addTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
    >
        <DynamicForm 
            :fields="additionalFields1" :flex_basis="flex_basis_additional" :flex_basis_percentage="flex_basis_percentage_additional" 
            :displayButtons="displayButtons" @handleSubmit="handleReceiptItem" @handleReset="handleReceiptItemReset"
        />
    </MovableModal>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import MovableModal from '@/components/MovableModal.vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import DynamicTable from '@/components/DynamicTable.vue';

export default defineComponent({
    name: 'Receipt_Details',
    components:{
        PageStyleComponent, DynamicForm, DynamicTable, MovableModal
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('none');
        const modal_loader = ref('none');
        const rightsModule = ref('MMS');
        const tableKey = ref(0);
        const mainComponentKey = ref(0);
        const memComponentKey = ref(0);
        const savComponentKey = ref(0);
        const shaComponentKey = ref(0);
        const lonComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const receipt_totals = ref(0);
        const receiptTotals = ref(0);
        const receipt_memo = ref('');
        const hasPrepayment = ref(false);
        const prepModalVisible = ref(false);
        const addModalVisible = ref(false);
        const prepaymentAmount = ref(0);
        const title = ref('Add Prepayment');
        const addTitle = ref('Other Receipt Items')
        const modal_top = ref('120px');
        const modal_left = ref('400px');
        const modal_width = ref('45vw');
        const outstanding_balance = computed(()=> store.state.Members.outstandingBalance);
        const allotable_prepayment = computed(()=> store.state.Active_Tenants.allotablePrepayment);
        const savingsArray = computed(() => store.state.Saving_Accounts.accountArr);
        const sharesArray = computed(() => store.state.Share_Accounts.accountArr);
        const loansArray = computed(() => store.state.Loan_Applications.applicationArr);
        const errors = ref([]);
        const itemObj = ref({});
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const displayButtons = ref(true);
        const showActions = ref(true);
        const showTotals = ref(true);
        const idField = ref('');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const flex_basis_additional = ref('');
        const flex_basis_percentage_additional = ref('');
        const ledgerID = ref('');
        const memberID = ref('');
        const ledgerArray = computed(() => store.state.Ledgers.cashbookLedgerArr);
        const memberArray = computed(() => store.state.Members.memberArr);
        const receiptRows = computed(() => store.state.Members.receiptItems);
        const receiptColumns = ref([
            {type: "checkbox"},
            {label: "Description", key:"description", type: "text", editable: false},
            {label: "Amount", key: "total_amount", type: "number", editable: false},
            {label: "Paid", key: "total_paid", type: "number", editable: false},
            {label: "Due Amnt", key: "due_amount", type: "number", editable: false},
            {label: "Payment", key: "payment_allocation", type: "number", editable: true},
            {label: "Balance", key: "bal_after_alloc", type: "text", editable: false},
        ])
        const actionsRcptItems = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Delete Receipt Item',rightName: 'Adding Member Receipt'},
        ]);
        const removeReceiptItem = (rowIndex, action, row) =>{
            store.dispatch('Members/removeReceiptItem', rowIndex);
            tableKey.value += 1;
        }

        const fetchMembers = async() =>{
                await store.dispatch('Members/fetchMembers', {company:companyID.value})    
        };
        const fetchReceiptItems = async() =>{
            if(memberID.value){
                await store.dispatch('Members/fetchMemberReceiptItems', {company:companyID.value, member:memberID.value, date: formFields.value[1].value})
            }       
        };
        const handleSelectedMember = async(option) =>{
            await store.dispatch('Members/handleSelectedMember', option)
            memberID.value = store.state.Members.memberID;
            outstanding_balance.value = store.state.Members.outstandingBalance;
        };
        const clearSelectedMember = async() =>{
            await store.dispatch('Members/updateState', {memberID: ''});
            memberID.value = ""
        };
        const fetchAllLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const fetchLedgers = async() =>{
            await store.dispatch('Ledgers/fetchCashbookLedgers', {company:companyID.value, ledger_type: 'Cashbook'})
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            ledgerID.value = store.state.Ledgers.ledgerID;
        };
        const clearSelectedLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            ledgerID.value = ""
        }
        const allocateReceivedAmount = (value) =>{
            receiptTotals.value = Number(value);
            prepaymentAmount.value = 0;
            receipt_memo.value = "";
            for(let i=0; i<receiptRows.value.length; i++){
                receiptRows.value[i].payment_allocation = 0;
                receiptRows.value[i].bal_after_alloc = "";
                receiptRows.value[i].allocation_status = false;
            }
            if(memberID.value == "" || memberID.value == null){
                toast.error("Select A Member To Receipt")
                formFields.value[5].value = 0;
                hasPrepayment.value = false;
            }
            else if(receiptTotals.value > 0 && (receiptTotals.value <= outstanding_balance.value)){
                hasPrepayment.value = false;
                for(let i=0; i<receiptRows.value.length; i++){
                    if(receiptRows.value[i].due_amount <= receiptTotals.value && receiptTotals.value != 0){
                        receiptRows.value[i].payment_allocation = receiptRows.value[i].due_amount;
                        receiptRows.value[i].bal_after_alloc = receiptRows.value[i].due_amount - receiptRows.value[i].payment_allocation;
                        receiptTotals.value = receiptTotals.value - receiptRows.value[i].payment_allocation;
                        receipt_memo.value += receiptRows.value[i].description + ', '
                    }else{
                        receiptRows.value[i].payment_allocation = receiptTotals.value;
                        receiptRows.value[i].bal_after_alloc = receiptRows.value[i].due_amount - receiptRows.value[i].payment_allocation;
                        receipt_memo.value += receiptRows.value[i].description;
                        break
                    }
                }
            }else if(receiptTotals.value > 0 && receiptTotals.value > outstanding_balance.value){
                hasPrepayment.value = true;
                prepaymentAmount.value = (receiptTotals.value  - outstanding_balance.value).toFixed(2);
                for(let i=0; i<receiptRows.value.length; i++){
                    if((receiptRows.value[i].due_amount <= receiptTotals.value) && (receiptTotals.value != 0)){
                        receiptRows.value[i].payment_allocation = receiptRows.value[i].due_amount;
                        receiptRows.value[i].bal_after_alloc = receiptRows.value[i].due_amount - receiptRows.value[i].payment_allocation;
                        // receiptTotals.value = (receiptTotals.value - receiptRows.value[i].payment_allocation).toFixed(2);
                        receipt_memo.value += receiptRows.value[i].description + ','
                    }else{
                        receiptRows.value[i].payment_allocation = receiptTotals.value;
                        receiptRows.value[i].bal_after_alloc = receiptRows.value[i].due_amount - receiptRows.value[i].payment_allocation;
                        receipt_memo.value += receiptRows.value[i].description;
                        break
                    }
                }
            }else{
                hasPrepayment.value = false;
                receipt_totals.value = 0;
                prepaymentAmount.value = 0;
                receipt_memo.value = "";
                formFields.value[7].value = "";
                for(let i=0; i<receiptRows.value.length; i++){
                    receiptRows.value[i].payment_allocation = 0;
                    receiptRows.value[i].bal_after_alloc = "";
                    receiptRows.value[i].allocation_status = false;
                }
            }
            
        }
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                {
                    type:'search-dropdown', label:"Member", value: memberID.value, componentKey: memComponentKey,
                    selectOptions: memberArray, optionSelected: handleSelectedMember, required: true,
                    searchPlaceholder: 'Select Member...', dropdownWidth: '500px', updateValue: "",
                    fetchData: fetchMembers(), clearSearch: clearSelectedMember()  
                },
                { type: 'date', name: 'issue_date',label: "Recording Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
                { type: 'date', name: 'banking_date',label: "Banking Date", value: '', required: true, maxDate: formatDate(current_date) },
                { type: 'dropdown', name: 'payment_method',label: "Payment Method", value: '', placeholder: "", required: true, options: [{ text: 'Cash', value: 'Cash' }, { text: 'Mpesa', value: 'Mpesa' },{ text: 'Bank Deposit', value: 'Bank Deposit' }, { text: 'Cheque', value: 'Cheque' },{ text: 'Check-off', value: 'Check-off' }, { text: 'RTGS', value: 'RTGS' },{ text: 'EFT', value: 'EFT' }, { text: 'Not Applicable', value: 'Not Applicable' }] },
                { type: 'text', name: 'reference_no',label: "Reference No", value: '', required: true,},
                { type: 'text', name: 'total_amount',label: "Amount", value: receipt_totals.value || 0, required: true, method: allocateReceivedAmount },
                {
                    type:'search-dropdown', label:"Cashbook", value: ledgerID.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Cashbook...', dropdownWidth: '450px', updateValue: "",
                    fetchData: fetchLedgers(), clearSearch: clearSelectedLedger()  
                },
                {type:'text-area', label:"Memo", value: receipt_memo.value, textarea_rows: '2', textarea_cols: '50', required: true},
                {required: false}
            ]
        };
        watch([receipt_memo, receipt_totals], () => {
            if (receipt_memo.value.length) {
                formFields.value[7].value = receipt_memo.value;
            }else if(receipt_totals.value == 0){
                receipt_memo.value = "";
            }
        }, { immediate: true })
        const handleReset = () =>{
            store.dispatch('Members/updateState', {receiptItems: [], outstandingBalance: 0})
            mainComponentKey.value += 1;
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].type == 'number'){
                    formFields.value[i].value = 0;
                }else{
                    formFields.value[i].value = '';
                }
                
            }
            memberID.value = '';
            ledgerID.value = '';
            memComponentKey.value += 1;
            ledComponentKey.value += 1;
            receipt_totals.value = 0;
            receiptTotals.value = 0;
            prepaymentAmount.value = 0;
            hasPrepayment.value = false;
            allotable_prepayment.value = 0;
        }
        watch([memberID], () => {
            if(memberID.value){
                fetchReceiptItems();
            }    
        }, { immediate: true });
        watch([ledgerID], () => {
            if (ledgerID.value !="") {
                formFields.value[6].value = ledgerID.value;
            }   
        }, { immediate: true })

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createMemberReceipt = async() =>{
            showLoader();
            if(formFields.value[7].value == ""){
                let rcptMemo = ""
                for(let i=0; i<receiptRows.value.length; i++){
                    if(receiptRows.value[i].payment_allocation > 0){
                        rcptMemo = rcptMemo + receiptRows.value[i].description + ', ';
                    }
                }
                formFields.value[7].value = rcptMemo;
            }
            let formData = {
                company: companyID.value,
                txn_type: "RCPT",
                member: memberID.value,
                user: userID.value,
                cashbook: ledgerID.value,
                description: formFields.value[7].value,
                issue_date: formFields.value[1].value,
                due_date: formFields.value[1].value,
                client_category: "Members",
                total_amount: formFields.value[5].value,
                tax_amount: 0,
                payment_method: formFields.value[3].value,
                reference_no: formFields.value[4].value,
                banking_date: formFields.value[2].value,
                receipt_items: receiptRows.value
            }
            
            errors.value = [];
            for(let i=1; i < (formFields.value.length); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(memberID.value == '' || ledgerID.value == ''){
                errors.value.push('Error');
            }
            let rcptTotal = 0
            for(let i=0; i<receiptRows.value.length; i++){
                rcptTotal += Number(receiptRows.value[i].payment_allocation);
            }

            if(formFields.value[5].value != Number(rcptTotal.toFixed(2))){
                toast.error('Invalid Receipt Amount');
                hideLoader();
            }
            else{
                if(errors.value.length){
                    toast.error('Fill In Required Fields');
                    hideLoader();                 
                }else{            
                    try {
                        const response = await store.dispatch('Members/createMemberReceipt', formData);
                        if (response && response.data.msg === "Success") {
                            hideLoader();
                            toast.success('Receipt created successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                            ledComponentKey.value += 1;
                            memComponentKey.value += 1;
                        }else if(response && response.data.msg === "Exists"){
                            hideLoader();
                            toast.error('Duplicate Reference No!');
                        }
                         else {
                            toast.error('An error occurred while creating the receipt.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to create receipt: ' + error.message);
                    } finally {
                        hideLoader();
                    }              
                }
            }
            
        }

        const autoPopulatePaymentAlloc = (row) =>{
            if(row.allocation_status == false){
                row.payment_allocation = row.due_amount;
                row.bal_after_alloc = 0;
                receipt_totals.value += Number(row.payment_allocation);
                row.allocation_status = true;
            }                 
        };
        const allocateInputAmount = (amount) =>{
            receipt_totals.value += amount;
        };
        const prepaymentCheck = () =>{
            if(receipt_totals.value <= outstanding_balance.value){
                hasPrepayment.value = false;
            }else{
                hasPrepayment.value = true;
            }
        }

        watch([receipt_totals], () => {
            if (receipt_totals.value) {
                formFields.value[5].value = receipt_totals.value;
                prepaymentCheck();
            } 
        }, { immediate: true });

        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        };
        const checkPrepaymentLimit = (value) =>{
            if(parseFloat(prepaymentAmount.value) < parseFloat(value)){
                toast.error(`Cannot Allocate More Than ${prepaymentAmount.value}`)
                additionalFields.value[2].value = 0;
            }
        };
        const selectPrepaymentItem = (value) =>{
            if(value == "Savings"){
                additionalFields.value[3].disabled = '';
                additionalFields.value[4].disabled = 'disabled-div';
                additionalFields.value[5].disabled = 'disabled-div';
                lonComponentKey.value += 1;
                shaComponentKey.value += 1;
            }else if(value == "Shares"){
                additionalFields.value[4].disabled = '';
                additionalFields.value[3].disabled = 'disabled-div';
                additionalFields.value[5].disabled = 'disabled-div';
                lonComponentKey.value += 1;
                savComponentKey.value += 1;
            }else if(value == "Loan"){
                additionalFields.value[5].disabled = '';
                additionalFields.value[4].disabled = 'disabled-div';
                additionalFields.value[3].disabled = 'disabled-div';
                savComponentKey.value += 1;
                shaComponentKey.value += 1;
            }
        };
        const handleSavingAccount = async(option) =>{
            await store.dispatch('Saving_Accounts/handleSelectedAccount', option)
            itemObj.value = {
                journal_no : "PREPAID SAVINGS",
                type: "savings_prepayment",
                journal_id : store.state.Saving_Accounts.accountID,
                description : `${additionalFields.value[1].value} Prepayment`,
                total_amount : additionalFields.value[2].value,
                total_paid : additionalFields.value[2].value,
                due_amount : 0,
                payment_allocation : additionalFields.value[2].value,
                bal_after_alloc : 0,
                cost: additionalFields.value[2].value
            }
        };
        const clearSavingAccount = async() =>{
            await store.dispatch('Saving_Accounts/updateState', {accountID: ''});
            itemObj.value = {};
        };
        const handleShareAccount = async(option) =>{
            await store.dispatch('Share_Accounts/handleSelectedAccount', option)
            itemObj.value = {
                journal_no : "PREPAID SHARES",
                type: "shares_prepayment",
                journal_id : store.state.Share_Accounts.accountID,
                description : `${additionalFields.value[1].value} Prepayment`,
                total_amount : additionalFields.value[2].value,
                total_paid : additionalFields.value[2].value,
                due_amount : 0,
                payment_allocation : additionalFields.value[2].value,
                bal_after_alloc : 0,
                cost: additionalFields.value[2].value
            }
        };
        const clearShareAccount = async() =>{
            await store.dispatch('Share_Accounts/updateState', {accountID: ''});
            itemObj.value = {};
        };
        const handleLoanApplication = async(option) =>{
            await store.dispatch('Loan_Applications/handleSelectedApplication', option)
            itemObj.value = {
                journal_no : "PREPAID LOAN",
                type: "loan_prepayment",
                journal_id : store.state.Loan_Applications.applicationID,
                description : `${additionalFields.value[1].value} Prepayment - ${store.state.Loan_Applications.applicationNumber}`,
                total_amount : additionalFields.value[2].value,
                total_paid : additionalFields.value[2].value,
                due_amount : 0,
                payment_allocation : additionalFields.value[2].value,
                bal_after_alloc : 0,
                cost: additionalFields.value[2].value
            }
        };
        const clearLoanApplication = async() =>{
            await store.dispatch('Loan_Applications/updateState', {applicationID: ''});
            itemObj.value = {};
        };
        const additionalFields = ref([]);
        const updateAdditionalFields = () =>{
            additionalFields.value = [
                { type: 'number', name: 'prepayment_amount',label: "Prepayment Amount", value: prepaymentAmount.value, disabled: true },
                { type: 'dropdown', name: 'item',label: "Prepay To", value: '', placeholder: "", required: true, options: [{ text: 'Savings', value: 'Savings' }, { text: 'Shares', value: 'Shares' }, { text: 'Loan', value: 'Loan' }], method: selectPrepaymentItem },
                { type: 'text', name: 'prepayment_amount',label: "Allocated Amount", value: '0', required: true, method: checkPrepaymentLimit },
                {  
                    type:'search-dropdown', label:"Saving Account", value: '', componentKey: savComponentKey, disabled:'disabled-div',
                    selectOptions: savingsArray, optionSelected: handleSavingAccount, required: true,
                    searchPlaceholder: 'Select Account...', dropdownWidth: '300px',
                    fetchData: store.dispatch('Saving_Accounts/fetchSavingAccounts', {company:companyID.value,member: memberID.value}), clearSearch: clearSavingAccount
                },
                {  
                    type:'search-dropdown', label:"Share Account", value: '', componentKey: shaComponentKey, disabled:'disabled-div',
                    selectOptions: sharesArray, optionSelected: handleShareAccount, required: true,
                    searchPlaceholder: 'Select Account...', dropdownWidth: '300px',
                    fetchData: store.dispatch('Share_Accounts/fetchShareAccounts', {company:companyID.value,member: memberID.value}), clearSearch: clearShareAccount
                },
                {  
                    type:'search-dropdown', label:"Loan Applications", value: '', componentKey: lonComponentKey, disabled:'disabled-div',
                    selectOptions: loansArray, optionSelected: handleLoanApplication, required: true,
                    searchPlaceholder: 'Select Application...', dropdownWidth: '300px',
                    fetchData: store.dispatch('Loan_Applications/fetchLoanApplications', {company:companyID.value,member: memberID.value}), clearSearch: clearLoanApplication
                },
            ]
        };
        const handlePrepayment = async() =>{
            showModalLoader();
            if(additionalFields.value[2].value <= 0 ){
                toast.error("Invalid Prepayment Amount");
                hideModalLoader();
            }else{
                let formData = itemObj.value
                await store.dispatch('Members/handleMemberPrepayment',formData);
                toast.success("Prepayment Added");
                formFields.value[7].value += `${itemObj.value['description']}`
                hideModalLoader();
                prepModalVisible.value = false;
            }
        }
        const handlePrepaymentReset = () =>{
            for(let i=0; i < additionalFields.value.length; i++){
                if(additionalFields.value[i].type == 'number'){
                    additionalFields.value[i].value = 0;
                }else{
                    additionalFields.value[i].value = '';
                }
                
            }
        };
        const addPrepayment = () =>{
            updateAdditionalFields();
            prepModalVisible.value = true;
            flex_basis_additional.value = '1/3';
            flex_basis_percentage_additional.value = '33.333';
        };
        const selectReceiptItem = (value) =>{
            if(value == "Savings"){
                additionalFields1.value[2].disabled = '';
                additionalFields1.value[3].disabled = 'disabled-div';
                additionalFields1.value[4].disabled = 'disabled-div';
                lonComponentKey.value += 1;
                shaComponentKey.value += 1;
            }else if(value == "Shares"){
                additionalFields1.value[3].disabled = '';
                additionalFields1.value[2].disabled = 'disabled-div';
                additionalFields1.value[4].disabled = 'disabled-div';
                lonComponentKey.value += 1;
                savComponentKey.value += 1;
            }else if(value == "Loan"){
                additionalFields1.value[4].disabled = '';
                additionalFields1.value[3].disabled = 'disabled-div';
                additionalFields1.value[2].disabled = 'disabled-div';
                savComponentKey.value += 1;
                shaComponentKey.value += 1;
            }else if(value == "Other Charges"){
                additionalFields1.value[4].disabled = '';
                additionalFields1.value[3].disabled = 'disabled-div';
                additionalFields1.value[2].disabled = 'disabled-div';
                savComponentKey.value += 1;
                shaComponentKey.value += 1;
            }
        };
        const handleSavingAccountItem = async(option) =>{
            await store.dispatch('Saving_Accounts/handleSelectedAccount', option)
            itemObj.value = {
                journal_no : "SAVINGS ITEM",
                type: "savings_prepayment",
                journal_id : store.state.Saving_Accounts.accountID,
                description : `Member ${additionalFields1.value[0].value}`,
                total_amount : additionalFields1.value[1].value,
                total_paid : additionalFields1.value[1].value,
                due_amount : 0,
                payment_allocation : additionalFields1.value[1].value,
                bal_after_alloc : 0,
                cost: additionalFields1.value[1].value
            }
        };
        const clearSavingAccountItem = async() =>{
            await store.dispatch('Saving_Accounts/updateState', {accountID: ''});
            itemObj.value = {};
        };
        const handleShareAccountItem = async(option) =>{
            await store.dispatch('Share_Accounts/handleSelectedAccount', option)
            itemObj.value = {
                journal_no : "SHARES ITEM",
                type: "shares_prepayment",
                journal_id : store.state.Share_Accounts.accountID,
                description : `Member ${additionalFields1.value[0].value}`,
                total_amount : additionalFields1.value[1].value,
                total_paid : additionalFields1.value[1].value,
                due_amount : 0,
                payment_allocation : additionalFields1.value[1].value,
                bal_after_alloc : 0,
                cost: additionalFields1.value[1].value
            }
        };
        const clearShareAccountItem = async() =>{
            await store.dispatch('Share_Accounts/updateState', {accountID: ''});
            itemObj.value = {};
        };
        const handleLoanApplicationItem = async(option) =>{
            await store.dispatch('Loan_Applications/handleSelectedApplication', option)
            itemObj.value = {
                journal_no : "PREPAID LOAN",
                type: "loan_prepayment",
                journal_id : store.state.Loan_Applications.applicationID,
                description : `${additionalFields1.value[0].value} Prepayment - ${store.state.Loan_Applications.applicationNumber}`,
                total_amount : additionalFields1.value[1].value,
                total_paid : additionalFields1.value[1].value,
                due_amount : 0,
                payment_allocation : additionalFields1.value[1].value,
                bal_after_alloc : 0,
                cost: additionalFields1.value[1].value
            }
        };
        const clearLoanApplicationItem = async() =>{
            await store.dispatch('Loan_Applications/updateState', {applicationID: ''});
            itemObj.value = {};
        };
        const additionalFields1 = ref([]);
        const updateAdditionalFields1 = () =>{
            additionalFields1.value = [
                { type: 'dropdown', name: 'item',label: "Receipt Item", value: '', placeholder: "", required: true, options: [{ text: 'Savings', value: 'Savings' }, { text: 'Shares', value: 'Shares' }, { text: 'Loan', value: 'Loan' }, { text: 'Membership Fees', value: 'Membership Fees' }, { text: 'Other Charges', value: 'Other Charges' }], method: selectReceiptItem },
                { type: 'text', name: 'amount',label: "Amount", value: '0', required: true },
                {  
                    type:'search-dropdown', label:"Saving Account", value: '', componentKey: savComponentKey, disabled:'disabled-div',
                    selectOptions: savingsArray, optionSelected: handleSavingAccountItem, required: true,
                    searchPlaceholder: 'Select Account...', dropdownWidth: '310px',
                    fetchData: store.dispatch('Saving_Accounts/fetchSavingAccounts', {company:companyID.value,member: memberID.value}), clearSearch: clearSavingAccountItem
                },
                {  
                    type:'search-dropdown', label:"Share Account", value: '', componentKey: shaComponentKey, disabled:'disabled-div',
                    selectOptions: sharesArray, optionSelected: handleShareAccountItem, required: true,
                    searchPlaceholder: 'Select Account...', dropdownWidth: '310px',
                    fetchData: store.dispatch('Share_Accounts/fetchShareAccounts', {company:companyID.value,member: memberID.value}), clearSearch: clearShareAccountItem
                },
                {  
                    type:'search-dropdown', label:"Loan Applications", value: '', componentKey: lonComponentKey, disabled:'disabled-div',
                    selectOptions: loansArray, optionSelected: handleLoanApplicationItem, required: true,
                    searchPlaceholder: 'Select Application...', dropdownWidth: '310px',
                    fetchData: store.dispatch('Loan_Applications/fetchLoanApplications', {company:companyID.value,member: memberID.value}), clearSearch: clearLoanApplicationItem
                },
            ]
        };
        const handleReceiptItem = async() =>{
            showModalLoader();
            if(additionalFields1.value[1].value <= 0 ){
                toast.error("Invalid Receipt Item Amount");
                hideModalLoader();
            }else{
                let formData = itemObj.value
                await store.dispatch('Members/handleMemberPrepayment',formData);
                toast.success("Receipt Item Added");
                formFields.value[7].value += `${itemObj.value['description']}`
                hideModalLoader();
                addModalVisible.value = false;
            }
        }
        const handleReceiptItemReset = () =>{
            for(let i=0; i < additionalFields1.value.length; i++){
                if(additionalFields1.value[i].type == 'number'){
                    additionalFields1.value[i].value = 0;
                }else{
                    additionalFields1.value[i].value = '';
                }
                
            }
        };
        const addReceiptItems = async() =>{
            updateAdditionalFields1();
            addModalVisible.value = true;
            flex_basis_additional.value = '1/3';
            flex_basis_percentage_additional.value = '33.333';
        }
        const closeModal = async() =>{
            prepModalVisible.value = false;
            handlePrepaymentReset();
        }

        onBeforeMount(()=>{ 
            updateFormFields();
            outstanding_balance.value = 0;
            ledComponentKey.value += 1;
            memComponentKey.value += 1;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
        })
        onMounted(()=>{
            fetchAllLedgers();
        })

        return{
            formFields, flex_basis, flex_basis_percentage, displayButtons, createMemberReceipt, mainComponentKey,addTitle,
            handleReset, loader, showLoader, hideLoader, tableKey, receiptColumns, receiptRows, showActions,showTotals, idField,
            autoPopulatePaymentAlloc, outstanding_balance, hasPrepayment, addPrepayment, handlePrepayment, allocateInputAmount,
            title, modal_loader, modal_left, modal_top, modal_width, prepModalVisible, showModalLoader, hideModalLoader, closeModal,
            additionalFields,flex_basis_additional, flex_basis_percentage_additional, handlePrepaymentReset,allotable_prepayment,addReceiptItems,
            actionsRcptItems,removeReceiptItem,rightsModule,addModalVisible,additionalFields1,handleReceiptItem,handleReceiptItemReset
        }
    }
})
</script>