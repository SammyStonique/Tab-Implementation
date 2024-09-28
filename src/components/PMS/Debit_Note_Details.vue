<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="createInvoice" @handleReset="handleReset"> 
                    <template v-slot:additional-content>                    
                        <div class="px-3 min-h-[220px]">
                            <DynamicTable :key="tableKey" :columns="invoiceColumns" :rows="invoiceRows" :rightsModule="rightsModule" :showActions="showActions" :idField="idField" :actions="actions" @action-click="deleteInvoiceLIne"/>
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
    name: 'Debit_Note_Details',
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
        const rightsModule = ref('PMS');
        const tableKey = ref(0);
        const mainComponentKey = ref(0);
        const tntComponentKey = ref(0);
        const currComponentKey = ref(0);
        const propComponentKey = ref(0);
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
        const propertyID = ref('');
        const ledgerID = ref('');
        const tenantID = ref('');
        const tenantName = ref('');
        const tenantLedger = ref('');
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);
        const tenantArray = computed(() => store.state.Active_Tenants.tenantUnitsArr);
        const invoiceRows = computed(() => {
            return store.state.Ledgers.invoiceItemsArray;
        });
        const taxRates = computed(() => store.getters['Taxes/getFormatedTax']);
        const chargeTypes = computed(() => store.getters['Utilities/getFormatedUtilities']);
        const invoiceColumns = ref([
            {label: "Posting Account", key:"posting_account", type: "text", editable: false},
            {label: "Type", key:"charge_type", type: "select-dropdown", editable: false, options: chargeTypes},
            {label: "Invoice Description", key:"description", type: "text", editable: true, minWidth:"700px", maxWidth:"700px"},
            {label: "Cost", key: "cost", type: "number", editable: true, minWidth:"50px", maxWidth:"50px"},
            {label: "Qty", key: "quantity", type: "number", editable: true, minWidth:"50px", maxWidth:"50px"},
            {label: "Vat Rate", key: "vat_rate", type: "select-dropdown", editable: false, options: taxRates},
            {label: "Vat Incl", key: "vat_inclusivity", type: "select-dropdown", editable: false, maxWidth:"20px", options: [{ text: 'Yes', value: 'Inclusive' }, { text: 'No', value: 'Exclusive' }]},
            {label: "Vat", key: "vat_amount", type: "text", editable: false, maxWidth:"30px"},
            {label: "Total", key: "total_amount", type: "text", editable: false},
        ]);

        const actions = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Invoice Line', rightName: 'Adding Debit Notes'},
        ])

        const deleteInvoiceLIne = (rowIndex, action, row) =>{
            store.dispatch('Ledgers/removeInvoiceLine', rowIndex);
        }
        const fetchProperties = async() =>{
            await store.dispatch('Properties_List/fetchProperties', {company:companyID.value})
        };
        const fetchUtilities = async() =>{
            await store.dispatch('Utilities/fetchUtilities', {company:companyID.value})
        };
        const handleSelectedProperty = async(option) =>{
            await store.dispatch('Properties_List/handleSelectedProperty', option)
            propertyID.value = store.state.Properties_List.propertyID;
        };
        const clearSelectedProperty = async() =>{
            await store.dispatch('Properties_List/updateState', {propertyID: ''});
            propertyID.value = ""
        }
        const fetchTaxes = async() =>{
            await store.dispatch('Taxes/fetchTaxes', {company:companyID.value})
        };
        const fetchLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            ledgerID.value = store.state.Ledgers.ledgerID;
            ledComponentKey.value += 1;
     
        };
        const clearSelectedLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            ledgerID.value = ""
        }
        const fetchTenants = async() =>{
            if(propertyID.value){
                await store.dispatch('Active_Tenants/fetchTenantUnits', {company:companyID.value, property: propertyID.value})
            } else{
                await store.dispatch('Active_Tenants/fetchTenantUnits', {company:companyID.value}) 
            }     
        };
        const handleSelectedTenant = async(option) =>{
            await store.dispatch('Active_Tenants/handleSelectedTenantUnit', option)
            tenantID.value = store.state.Active_Tenants.tenantID;
            tenantName.value = store.state.Active_Tenants.tenantName;
            tenantLedger.value = store.state.Active_Tenants.tenantLedger;
        };
        const clearSelectedTenant = async() =>{
            await store.dispatch('Active_Tenants/updateState', {tenantID: ''});
            tenantID.value = ""
        }

        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                {
                    type:'search-dropdown', label:"Property", value: propertyID.value, componentKey: propComponentKey,
                    selectOptions: propertyArray, optionSelected: handleSelectedProperty, required: false,
                    searchPlaceholder: 'Select Property...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchProperties(), clearSearch: clearSelectedProperty()            
                },
                {
                    type:'search-dropdown', label:"Tenant", value: tenantID.value, componentKey: tntComponentKey,
                    selectOptions: tenantArray, optionSelected: handleSelectedTenant, required: true,
                    searchPlaceholder: 'Select Tenant...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchTenants(), clearSearch: clearSelectedTenant()  
                },
                { type: 'date', name: 'issue_date',label: "Issue Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
                { type: 'date', name: 'due_date',label: "Due Date", value: '', required: true, maxDate: formatDate(current_date) },
                {
                    type:'search-dropdown', label:"Posting Account", value: ledgerID.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Posting Account...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchLedgers(), clearSearch: clearSelectedLedger()  
                },
                {type:'text-area', label:"Memo", value: invoice_memo.value, textarea_rows: '2', textarea_cols: '40', required: true},
                
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
            tenantID.value = '';
            ledgerID.value = '';
            propertyID.value = '';
            tntComponentKey.value += 1;
            propComponentKey.value += 1;
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
        const createInvoice = async() =>{
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
                        "txn_type": "DBN",
                        "posting_account": invoiceRows.value[i].ledger_id,
                        "debit_amount": 0,
                        "credit_amount": invoiceRows.value[i].sub_total,
                    }
                    let jnlEntry2 = {
                        "date": formFields.value[2].value,
                        "description": invoiceRows.value[i].description+", Tax Payable",
                        "txn_type": "DBN",
                        "posting_account": invoiceRows.value[i].vat_rate.tax_output_account.ledger_id,
                        "debit_amount": 0,
                        "credit_amount": invoiceRows.value[i].vat_amount,
                    }
                    let taxTxn ={
                        "tax": invoiceRows.value[i].vat_rate.tax_id,
                        "client": tenantName.value,
                        "client_id": tenantID.value,
                        "amount": invoiceRows.value[i].vat_amount,
                        "description": invoiceRows.value[i].description+", Tax Payable",
                        "tax_inclusive": invoiceRows.value[i].vat_inclusivity || "Inclusive",
                        "tax_category": 'Output'
                    }
                    
                    journalEntryArr.value.push(jnlEntry1, jnlEntry2);
                    taxTransactionArr.value.push(taxTxn);
                    
                }else{
                    let jnlEntry1 = {
                        "date": formFields.value[2].value,
                        "description": invoiceRows.value[i].description,
                        "txn_type": "DBN",
                        "posting_account": invoiceRows.value[i].ledger_id,
                        "debit_amount": 0,
                        "credit_amount": invoiceRows.value[i].sub_total,
                    }
                    journalEntryArr.value.push(jnlEntry1);
                }
                let jnlLine ={
                    "invoice_amount": invoiceRows.value[i].sub_total,
                    "tax_amount": invoiceRows.value[i].vat_amount,
                    "total_amount": invoiceRows.value[i].total_amount,
                    "description": invoiceRows.value[i].description,
                    "quantity": invoiceRows.value[i].quantity,
                    "charge_type": invoiceRows.value[i].charge_type,
                }
                journalsArray.value.push(jnlLine);
                
            }
            let jnlEntry3 = {
                "date": formFields.value[2].value,
                "description": formFields.value[5].value,
                "txn_type": "DBN",
                "posting_account": tenantLedger.value,
                "debit_amount": invoiceTotals.value,
                "credit_amount": 0,
            }
            journalEntryArr.value.push(jnlEntry3)

            let formData = {
                company: companyID.value,
                client: tenantName.value,
                client_id: tenantID.value,
                customer_id: tenantID.value,
                currency: null,
                client_category: "Tenants",
                description: formFields.value[5].value,
                txn_type: "DBN",
                issue_date: formFields.value[2].value,
                due_date: formFields.value[3].value,
                total_amount: invoiceTotals.value,
                tax_amount: tax_totals.value,
                journal_entry_array: journalEntryArr.value,
                tax_transactions_array: taxTransactionArr.value,
                journals_array: journalsArray.value,
                user: userID.value
            }
            console.log("THE FORM DATA IS ",formData)
            errors.value = [];
            for(let i=2; i < (formFields.value.length - 2); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(tenantID.value == ''  || formFields.value[5].value == ''){
                errors.value.push('Error');
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }
            else{
                if(Number(invoiceTotals.value) <= 0){
                    toast.error('Invalid Invoice Amount');
                    hideLoader();
                }
                else{            
                    try {
                        const response = await store.dispatch('Journals/createJournal', formData);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Debit Note created successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                            ledComponentKey.value += 1;
                            tntComponentKey.value += 1;
                            propComponentKey.value += 1;
                        } else {
                            toast.error('An error occurred while creating the Debit Note.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to create Debit Note: ' + error.message);
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
            tntComponentKey.value += 1;
            propComponentKey.value += 1;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
            fetchUtilities();
        })
        onMounted(()=>{
            fetchTaxes();
        })

        return{
            formFields, flex_basis, flex_basis_percentage, displayButtons, createInvoice, mainComponentKey,
            handleReset, loader, showLoader, hideLoader, tableKey, invoiceColumns, invoiceRows, showActions, actions, deleteInvoiceLIne, idField,
            title, modal_loader, modal_left, modal_top, modal_width, showModalLoader, hideModalLoader,rightsModule
        }
    }
})
</script>