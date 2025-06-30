<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="createPaymentVoucher" @handleReset="handleReset"> 
                    <template v-slot:additional-content>                  
                        <div class="px-3 min-h-[220px]">
                            <DynamicTable :key="tableKey" :columns="receiptColumns" :rows="receiptRows" :showActions="showActions" :idField="idField" :rightsModule="rightsModule" :actions="actions" @action-click="deletePaymentLine"/>
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
import MovableModal from '@/components/MovableModal.vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import DynamicTable from '@/components/DynamicTable.vue';

export default defineComponent({
    name: 'Payment_Details',
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
        const rightsModule = ref('Accounts');
        const tableKey = ref(0);
        const mainComponentKey = ref(0);
        const tntComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const vouComponentKey = ref(0);
        const propComponentKey = ref(0);
        const receipt_totals = ref(0);
        const receiptTotals = ref(0);
        const receipt_memo = ref('');
        const tax_totals = ref(0);
        const journalEntryArr = ref([]);
        const journalsArray = ref([]);
        const taxTransactionArr = ref([]);
        const prepModalVisible = ref(false);
        const title = ref('Add Prepayment');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const displayButtons = ref(true);
        const showActions = ref(true);
        const idField = ref('');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const flex_basis_additional = ref('');
        const flex_basis_percentage_additional = ref('');
        const ledgerID = ref('');
        const ledgerArray = computed(() => store.state.Ledgers.cashbookLedgerArr);
        const ledger_array = computed(() => store.state.Ledgers.ledgerArr);
        const receiptRows = computed(() => {
            return store.state.Ledgers.paymentItemsArray;
        });
        const taxRates = computed(() => store.getters['Taxes/getFormatedTax']);
        
        const receiptColumns = ref([
            {label: "Posting Account", key:"posting_account", type: "text", editable: false},
            {label: "Payment Description", key:"description", type: "text", editable: true, minWidth:"700px", maxWidth:"700px"},
            {label: "Cost", key: "cost", type: "number", editable: true, minWidth:"50px", maxWidth:"50px"},
            {label: "Qty", key: "quantity", type: "number", editable: true, minWidth:"50px", maxWidth:"50px"},
            {label: "Vat Rate", key: "vat_rate", type: "select-dropdown", editable: false, options: taxRates},
            {label: "Vat Incl", key: "vat_inclusivity", type: "select-dropdown", editable: false, maxWidth:"20px", options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }]},
            {label: "Vat", key: "vat_amount", type: "text", editable: false, maxWidth:"30px"},
            {label: "Total", key: "total_amount", type: "text", editable: false},
        ]);

        const actions = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Payment Line', rightName: "Adding Payment Voucher"},
        ])

        const deletePaymentLine = (rowIndex, action, row) =>{
            store.dispatch('Ledgers/removeVoucherLine', rowIndex);
        }
        const fetchTaxes = async() =>{
            await store.dispatch('Taxes/fetchTaxes', {company:companyID.value})
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
        const handleSelectedVoucherLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedgerVoucher', option)
            vouComponentKey.value += 1;
        };
        
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                { type: 'text', name: 'reference_no',label: "Payee Name", value: '', required: true,},
                {
                    type:'search-dropdown', label:"Cashbook", value: ledgerID.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Cashbook...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchLedgers(), clearSearch: clearSelectedLedger()  
                },
                { type: 'date', name: 'issue_date',label: "Recording Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
                { type: 'date', name: 'banking_date',label: "Banking Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
                { type: 'dropdown', name: 'payment_method',label: "Payment Method", value: '', placeholder: "", required: true, options: [{ text: 'Cash', value: 'Cash' }, { text: 'Mpesa', value: 'Mpesa' },{ text: 'Bank Deposit', value: 'Bank Deposit' }, { text: 'Cheque', value: 'Cheque' },{ text: 'Check-off', value: 'Check-off' }, { text: 'RTGS', value: 'RTGS' },{ text: 'EFT', value: 'EFT' }, { text: 'Not Applicable', value: 'Not Applicable' }] },
                { type: 'text', name: 'reference_no',label: "Reference No", value: '', required: true,},
                { type: 'number', name: 'total_amount',label: "Amount", value: receipt_totals.value || 0, required: true},
                {
                    type:'search-dropdown', label:"Select Posting Account ", value: "", componentKey: vouComponentKey,
                    selectOptions: ledger_array, optionSelected: handleSelectedVoucherLedger, required: true,
                    searchPlaceholder: 'Select Account...', dropdownWidth: '400px', updateValue: "",  
                },
                {type:'text-area', label:"Memo", value: receipt_memo.value, textarea_rows: '3', textarea_cols: '56', required: true},
                
            ]
        };
        watch([receipt_memo, receipt_totals], () => {
            if (receipt_memo.value.length) {
                formFields.value[8].value = receipt_memo.value;
            }else if(receipt_totals.value == 0){
                receipt_memo.value = "";
            }
        }, { immediate: true })
        const handleReset = () =>{
            store.dispatch('Ledgers/updateState', {paymentItemsArray: []})
            mainComponentKey.value += 1;
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].type == 'number'){
                    formFields.value[i].value = 0;
                }else{
                    formFields.value[i].value = '';
                }
                
            }
            ledgerID.value = '';
            propComponentKey.value += 1;
            tntComponentKey.value += 1;
            ledComponentKey.value += 1;
            vouComponentKey.value += 1;
            receipt_totals.value = 0;
            receiptTotals.value = 0;
            receipt_memo.value = "";
            formFields.value[2].value = formatDate(current_date);
            formFields.value[3].value = formatDate(current_date);
        }
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
        const createPaymentVoucher = async() =>{
            showLoader();
            if(formFields.value[8].value == ""){
                let rcptMemo = ""
                for(let i=0; i<receiptRows.value.length; i++){
                    if(receiptRows.value[i].payment_allocation > 0){
                        rcptMemo = rcptMemo + receiptRows.value[i].description + ', ';
                    }
                }
                formFields.value[8].value = rcptMemo;
            }
            journalEntryArr.value = [];
            journalsArray.value = [];
            taxTransactionArr.value = [];
            receiptTotals.value = 0;
            receipt_totals.value = 0;
            tax_totals.value = 0;

            for(let i=0; i< receiptRows.value.length; i++){
                receiptTotals.value += Number(receiptRows.value[i].total_amount);
                tax_totals.value += Number(receiptRows.value[i].vat_amount);
                receipt_totals.value += Number(receiptRows.value[i].sub_total);

                if(receiptRows.value[i].vat_rate){
                    let jnlEntry1 = {
                        "date": formFields.value[2].value,
                        "description": receiptRows.value[i].description,
                        "txn_type": "PMT",
                        "posting_account": receiptRows.value[i].ledger_id,
                        "debit_amount": receiptRows.value[i].sub_total,
                        "credit_amount": 0,
                    }
                    let jnlEntry2 = {
                        "date": formFields.value[2].value,
                        "description": receiptRows.value[i].description+", Tax Payable",
                        "txn_type": "PMT",
                        "posting_account": receiptRows.value[i].vat_rate.tax_input_account,
                        "debit_amount": receiptRows.value[i].vat_amount,
                        "credit_amount": 0,
                    }
                    let taxTxn ={
                        "tax": receiptRows.value[i].vat_rate.tax_id,
                        "client": formFields.value[0].value,
                        "client_id": "",
                        "amount": receiptRows.value[i].vat_amount,
                        "description": receiptRows.value[i].description+", Tax Payable",
                        "tax_inclusive": receiptRows.value[i].vat_inclusivity,
                        "tax_category": 'Input'
                    }
                    
                    journalEntryArr.value.push(jnlEntry1, jnlEntry2);
                    taxTransactionArr.value.push(taxTxn);
                    
                }else{
                    let jnlEntry1 = {
                        "date": formFields.value[2].value,
                        "description": receiptRows.value[i].description,
                        "txn_type": "PMT",
                        "posting_account": receiptRows.value[i].ledger_id,
                        "debit_amount": receiptRows.value[i].sub_total,
                        "credit_amount": 0,
                    }
                    journalEntryArr.value.push(jnlEntry1);
                }
                let jnlLine ={
                    "journal_id": "",
                    "total_paid": receiptRows.value[i].total_amount,
                    "description": receiptRows.value[i].description,
                }
                journalsArray.value.push(jnlLine);
                let jnlEntry3 = {
                    "date": formFields.value[2].value,
                    "description": formFields.value[8].value,
                    "txn_type": "PMT",
                    "posting_account": ledgerID.value,
                    "debit_amount": 0,
                    "credit_amount": receiptTotals.value,
                }
                journalEntryArr.value.push(jnlEntry3)
            }
            let formData = {
                company: companyID.value,
                client: formFields.value[0].value,
                client_id: ledgerID.value,
                customer_id: "Direct Payment",
                client_category: "Customers",
                description: formFields.value[8].value,
                txn_type: "PMT",
                issue_date: formFields.value[2].value,
                banking_date: formFields.value[3].value,
                payment_method: formFields.value[4].value,
                reference_no: formFields.value[5].value,
                total_amount: receiptTotals.value,
                tax_amount: tax_totals.value,
                journal_entry_array: journalEntryArr.value,
                tax_transactions_array: taxTransactionArr.value,
                journals_array: journalsArray.value,
                user: userID.value
            }
            
            errors.value = [];
            for(let i=0; i < (formFields.value.length); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(ledgerID.value == ''){
                errors.value.push('Error');
            }

            if(Number(receiptTotals.value) <= 0){
                toast.error('Invalid Payment Amount');
                hideLoader();
            }
            else{
                if(errors.value.length){
                    toast.error('Fill In Required Fields');
                    hideLoader();                 
                }else{            
                    try {
                        const response = await store.dispatch('Journals/createJournal', formData);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Voucher created successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                            propComponentKey.value += 1;
                            ledComponentKey.value += 1;
                            tntComponentKey.value += 1;
                        } else {
                            toast.error('An error occurred while creating the Voucher.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to create Voucher: ' + error.message);
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

        watch([receipt_totals], () => {
            if (receipt_totals.value) {
                formFields.value[6].value = receipt_totals.value;
            } 
        }, { immediate: true });

        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }

        onBeforeMount(()=>{ 
            updateFormFields();
            ledComponentKey.value += 1;
            propComponentKey.value += 1;
            tntComponentKey.value += 1;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
        })
        onMounted(()=>{
            fetchTaxes();
            fetchAllLedgers();
        })

        return{
            formFields, flex_basis, flex_basis_percentage, displayButtons, createPaymentVoucher, mainComponentKey,
            handleReset, loader, showLoader, hideLoader, tableKey, receiptColumns, receiptRows, showActions, idField,
            autoPopulatePaymentAlloc, allocateInputAmount,actions,rightsModule,
            title, modal_loader, modal_left, modal_top, modal_width, prepModalVisible, showModalLoader, hideModalLoader,
            flex_basis_additional, flex_basis_percentage_additional, deletePaymentLine, 
        }
    }
})
</script>