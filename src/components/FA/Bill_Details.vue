<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="createBill" @handleReset="handleReset"> 
                    <template v-slot:additional-content>                    
                        <div class="px-3 min-h-[220px]">
                            <DynamicTable :key="tableKey" :columns="invoiceColumns" :rows="invoiceRows" :showActions="showActions" :idField="idField" :rightsModule="rightsModule" :actions="actions" @action-click="deleteBillLine"/>
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
    name: 'Bill_Details',
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
        const custComponentKey = ref(0);
        const currComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const invoice_totals = ref(0);
        const invoiceTotals = ref(0);
        const invoice_memo = ref('');
        const tax_totals = ref(0);
        const journalEntryArr = ref([]);
        const journalsArray = ref([]);
        const taxTransactionArr = ref([]);
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
        const ledgerID = ref('');
        const vendorID = ref('');
        const vendorName = ref('');
        const vendorLedger = ref('');
        const currencyID = ref('');
        const ledgerArray = computed(() => store.state.Ledgers.expenseLedgerArr);
        const currencyArray = computed(() => store.state.Currencies.currencyArr);
        const vendorArray = computed(() => store.state.Vendors.vendorArr);
        const invoiceRows = computed(() => {
            return store.state.Ledgers.billItemsArray;
        });
        const taxRates = computed(() => store.getters['Taxes/getFormatedTax']);
        const invoiceColumns = ref([
            {label: "Expense Account", key:"posting_account", type: "text", editable: false},
            {label: "Bill Description", key:"description", type: "text", editable: true, minWidth:"700px", maxWidth:"700px"},
            {label: "Cost", key: "cost", type: "number", editable: true, minWidth:"50px", maxWidth:"50px"},
            {label: "Qty", key: "quantity", type: "number", editable: true, minWidth:"50px", maxWidth:"50px"},
            {label: "Vat Rate", key: "vat_rate", type: "select-dropdown", editable: false, options: taxRates},
            {label: "Vat Incl", key: "vat_inclusivity", type: "select-dropdown", editable: false, maxWidth:"20px", options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }]},
            {label: "Vat", key: "vat_amount", type: "text", editable: false, maxWidth:"30px"},
            {label: "Total", key: "total_amount", type: "text", editable: false},
        ]);

        const actions = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Bill Line', rightName: "Adding Bills"},
        ])

        const deleteBillLine = (rowIndex, action, row) =>{
            store.dispatch('Ledgers/removeBillLine', rowIndex);
        }
        const fetchTaxes = async() =>{
            await store.dispatch('Taxes/fetchTaxes', {company:companyID.value})
        };
        const fetchAllLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const fetchLedgers = async() =>{
            await store.dispatch('Ledgers/fetchExpenseLedgers', {company:companyID.value, ledger_type: 'Expenses'})
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedgerBill', option)
            ledgerID.value = store.state.Ledgers.ledgerID;
            ledComponentKey.value += 1;
     
        };
        const clearSelectedLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            ledgerID.value = ""
        }
        const fetchVendors = async() =>{
            await store.dispatch('Vendors/fetchVendors', {company:companyID.value})
        };
        const handleSelectedVendor = async(option) =>{
            await store.dispatch('Vendors/handleSelectedVendor', option)
            vendorID.value = store.state.Vendors.vendorID;
            vendorName.value = store.state.Vendors.vendorName;
            vendorLedger.value = store.state.Vendors.vendorLedger;
 
        };
        const clearSelectedVendor = async() =>{
            await store.dispatch('Vendors/updateState', {vendorID: ''});
            vendorID.value = ""
        }
        const fetchCurrencies = async() =>{
            await store.dispatch('Currencies/fetchCurrencies', {company:companyID.value})
        };
        const handleSelectedCurrency = async(option) =>{
            await store.dispatch('Currencies/handleSelectedCurrency', option)
            currencyID.value = store.state.Currencies.currencyID;
        };
        const clearSelectedCurrency= async() =>{
            await store.dispatch('Currencies/updateState', {currencyID: ''});
            currencyID.value = ""
        }

        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                {
                    type:'search-dropdown', label:"Vendor", value: vendorID.value, componentKey: custComponentKey,
                    selectOptions: vendorArray, optionSelected: handleSelectedVendor, required: true,
                    searchPlaceholder: 'Select Vendor...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchVendors(), clearSearch: clearSelectedVendor()  
                },
                { type: 'date', name: 'issue_date',label: "Issue Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
                { type: 'date', name: 'due_date',label: "Due Date", value: '', required: true, maxDate: formatDate(current_date) },
                {
                    type:'search-dropdown', label:"Currency", value: currencyID.value, componentKey: currComponentKey,
                    selectOptions: currencyArray, optionSelected: handleSelectedCurrency, required: true,
                    searchPlaceholder: 'Select Currency...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchCurrencies(), clearSearch: clearSelectedCurrency()  
                },
                {
                    type:'search-dropdown', label:"Expense Account", value: ledgerID.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Expense Account...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchLedgers(), clearSearch: clearSelectedLedger()  
                },
                {type:'text-area', label:"Memo", value: invoice_memo.value, textarea_rows: '2', textarea_cols: '56', required: true},
                
            ]
        };

        const handleReset = () =>{
            store.dispatch('Journals/updateState', {})
            store.dispatch('Ledgers/updateState', { invoiceItemsArray: []})
            mainComponentKey.value += 1;
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].type == 'number'){
                    formFields.value[i].value = 0;
                }else{
                    formFields.value[i].value = '';
                }
                
            }
            vendorID.value = '';
            ledgerID.value = '';
            currencyID.value = '';
            custComponentKey.value += 1;
            currComponentKey.value += 1;
            ledComponentKey.value += 1;
            invoice_totals.value = 0;
            invoiceTotals.value = 0;
            tax_totals.value = 0;
        }

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createBill = async() =>{
            showLoader();
            journalEntryArr.value = [];
            journalsArray.value = [];
            taxTransactionArr.value = [];
            invoiceTotals.value = 0;
            invoice_totals.value = 0;
            tax_totals.value = 0;

            for(let i=0; i<invoiceRows.value.length; i++){
                invoiceTotals.value += Number(invoiceRows.value[i].total_amount);
                tax_totals.value += Number(invoiceRows.value[i].vat_amount);
                invoice_totals.value += Number(invoiceRows.value[i].sub_total);

                if(invoiceRows.value[i].vat_rate){
                    let jnlEntry1 = {
                        "date": formFields.value[1].value,
                        "description": invoiceRows.value[i].description,
                        "txn_type": "BIL",
                        "posting_account": invoiceRows.value[i].ledger_id,
                        "debit_amount": invoiceRows.value[i].sub_total,
                        "credit_amount": 0,
                    }
                    let jnlEntry2 = {
                        "date": formFields.value[1].value,
                        "description": invoiceRows.value[i].description+", Tax Payable",
                        "txn_type": "BIL",
                        "posting_account": invoiceRows.value[i].vat_rate.tax_input_account,
                        "debit_amount": invoiceRows.value[i].vat_amount,
                        "credit_amount": 0,
                    }
                    let taxTxn ={
                        "tax": invoiceRows.value[i].vat_rate.tax_id,
                        "client": vendorName.value,
                        "client_id": vendorID.value,
                        "amount": invoiceRows.value[i].vat_amount,
                        "description": invoiceRows.value[i].description+", Tax Payable",
                        "tax_inclusive": invoiceRows.value[i].vat_inclusivity,
                        "tax_category": 'Input'
                    }
                    
                    journalEntryArr.value.push(jnlEntry1, jnlEntry2);
                    taxTransactionArr.value.push(taxTxn);
                    
                }else{
                    let jnlEntry1 = {
                        "date": formFields.value[1].value,
                        "description": invoiceRows.value[i].description,
                        "txn_type": "BIL",
                        "posting_account": invoiceRows.value[i].ledger_id,
                        "debit_amount": invoiceRows.value[i].sub_total,
                        "credit_amount": 0,
                    }
                    journalEntryArr.value.push(jnlEntry1);
                }
                let jnlLine ={
                    "invoice_amount": invoiceRows.value[i].sub_total,
                    "tax_amount": invoiceRows.value[i].vat_amount,
                    "total_amount": invoiceRows.value[i].total_amount,
                    "description": invoiceRows.value[i].description,
                    "quantity": invoiceRows.value[i].quantity,
                }
                journalsArray.value.push(jnlLine);
                let jnlEntry3 = {
                    "date": formFields.value[1].value,
                    "description": formFields.value[5].value,
                    "txn_type": "BIL",
                    "posting_account": vendorLedger.value,
                    "debit_amount": 0,
                    "credit_amount": invoiceTotals.value,
                }
                journalEntryArr.value.push(jnlEntry3)
            }

            let formData = {
                company: companyID.value,
                client: vendorName.value,
                client_id: vendorID.value,
                customer_id: vendorID.value,
                currency: currencyID.value,
                client_category: "Customers",
                description: formFields.value[5].value,
                txn_type: "BIL",
                issue_date: formFields.value[1].value,
                due_date: formFields.value[2].value,
                total_amount: invoiceTotals.value,
                tax_amount: tax_totals.value,
                journal_entry_array: journalEntryArr.value,
                tax_transactions_array: taxTransactionArr.value,
                journals_array: journalsArray.value,
                user: userID.value
            }
            
            errors.value = [];
            for(let i=1; i < (formFields.value.length - 3); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(vendorID.value == '' || currencyID.value == ''  || formFields.value[5].value == ''){
                errors.value.push('Error');
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }
            else{
                if(Number(invoiceTotals.value) <= 0){
                    toast.error('Invalid Bill Amount');
                    hideLoader();
                }
                else{            
                    try {
                        const response = await store.dispatch('Journals/createJournal', formData);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Bill created successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                            ledComponentKey.value += 1;
                            custComponentKey.value += 1;
                            currComponentKey.value += 1;
                        } else {
                            toast.error('An error occurred while creating the bill.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to create bill: ' + error.message);
                    } finally {
                        hideLoader();
                    }              
                }
            }
            
        }

        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }

        onBeforeMount(()=>{ 
            store.dispatch('Ledgers/updateState', { invoiceItemsArray: []})
            updateFormFields();
            ledComponentKey.value += 1;
            custComponentKey.value += 1;
            currComponentKey.value += 1;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
        })
        onMounted(()=>{
            fetchTaxes();
            fetchAllLedgers();
        })

        return{
            formFields, flex_basis, flex_basis_percentage, displayButtons, createBill, mainComponentKey,
            handleReset, loader, showLoader, hideLoader, tableKey, invoiceColumns, invoiceRows, showActions, actions, deleteBillLine, idField,
            title, modal_loader, modal_left, modal_top, modal_width, showModalLoader, hideModalLoader,rightsModule
        }
    }
})
</script>