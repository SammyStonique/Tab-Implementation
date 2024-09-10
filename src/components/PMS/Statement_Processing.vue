<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <div class="flex h-16">
                    <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage"  @handleSubmit="createTenantReceipt" @handleReset="handleReset" /> 
                    <button @click="fetchTransactions" class="rounded bg-green-400 text-sm h-8 w-24 mt-2 text-white px-1.5 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Load</button>
                </div>
            </div>
            <div class="table-container capitalize text-sm min-h-[500px] mt-3">
                <table class="dynamic-table rounded">
                    <thead>
                        <tr>
                            <!-- Fixed main headers -->
                            <th rowspan="2" style="width:3%;">Unit</th>
                            <th rowspan="2">Tenant Name</th>
                            <th :colspan="subHeaders.balanceBF.length">Balance B/F</th>
                            <th :colspan="subHeaders.invoiced.length">Invoiced</th>
                            <th :colspan="subHeaders.paid.length">Paid</th>
                            <th :colspan="subHeaders.balanceCF.length">Balance C/F</th>
                        </tr>
                        <tr>
                            <!-- Dynamic sub-column headers -->
                            <th v-for="(subHeader, index) in subHeaders['balanceBF']" :key="'balanceBF-' + index">{{ subHeader }}</th>
                            <th v-for="(subHeader, index) in subHeaders['invoiced']" :key="'invoiced-' + index">{{ subHeader }}</th>
                            <th v-for="(subHeader, index) in subHeaders['paid']" :key="'paid-' + index">{{ subHeader }}</th>
                            <th v-for="(subHeader, index) in subHeaders['balanceCF']" :key="'balanceCF-' + index">{{ subHeader }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, rowIndex) in tableData" :key="rowIndex">
                            <td>{{ row.unitNo }}</td>
                            <td>{{ row.tenantName }}</td>
                            <td v-for="(subHeader, subIndex) in subHeaders['balanceBF']" :key="'balanceBF-' + subIndex">{{ row.balanceBF[subIndex] }}</td>
                            <td v-for="(subHeader, subIndex) in subHeaders['invoiced']" :key="'invoiced-' + subIndex">{{ row.invoiced[subIndex] }}</td>
                            <td v-for="(subHeader, subIndex) in subHeaders['paid']" :key="'paid-' + subIndex">{{ row.paid[subIndex] }}</td>
                            <td v-for="(subHeader, subIndex) in subHeaders['balanceCF']" :key="'balanceCF-' + subIndex">{{ row.balanceCF[subIndex] }}</td>
                        </tr>
                    </tbody>
                </table>
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
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import MovableModal from '@/components/MovableModal.vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import DynamicTable from '@/components/DynamicTable.vue';

export default defineComponent({
    name: 'Receipt_Details',
    components:{
        PageStyleComponent, DynamicForm, DynamicTable, MovableModal
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const tableKey = ref(0);
        const subHeaders = ref({
            balanceBF: computed(()=> store.state.Property_Statements.subHeaders),
            invoiced: computed(()=> store.state.Property_Statements.subHeaders),
            paid: computed(()=> store.state.Property_Statements.subHeaders),
            balanceCF: computed(()=> store.state.Property_Statements.subHeaders),
        });
        const tableData = computed(()=> store.state.Property_Statements.tableData);
        const mainComponentKey = ref(0);
        const tntComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const propComponentKey = ref(0);
        const receipt_totals = ref(0);
        const receiptTotals = ref(0);
        const receipt_memo = ref('');
        const hasPrepayment = ref(false);
        const prepModalVisible = ref(false);
        const prepaymentAmount = ref(0);
        const title = ref('Add Prepayment');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const outstanding_balance = computed(()=> store.state.Journals.outstandingBalance);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const displayButtons = ref(true);
        const showActions = ref(false);
        const idField = ref('');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const flex_basis_additional = ref('');
        const flex_basis_percentage_additional = ref('');
        const ledgerID = ref('');
        const tenantID = ref('');
        const propertyID = ref('');
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);
        const tenantArray = computed(() => store.state.Active_Tenants.tenantUnitsArr);
        const receiptRows = computed(() => store.state.Journals.journalsClientList);
        const receiptColumns = ref([
            {type: "checkbox"},
            {label: "Invoice", key:"journal_no", type: "text", editable: false},
            {label: "Description", key:"description", type: "text", editable: false},
            {label: "Amount", key: "total_amount", type: "text", editable: false},
            {label: "Paid", key: "total_paid", type: "text", editable: false},
            {label: "Due Amnt", key: "due_amount", type: "text", editable: false},
            {label: "Payment", key: "payment_allocation", type: "number", editable: true},
            {label: "Balance", key: "bal_after_alloc", type: "text", editable: false},
        ])

        const fetchProperties = async() =>{
            await store.dispatch('Properties_List/fetchProperties', {company:companyID.value})
        };

        const handleSelectedProperty = async(option) =>{
            await store.dispatch('Properties_List/handleSelectedProperty', option)
            propertyID.value = store.state.Properties_List.propertyID;
        };
        const clearSelectedProperty = async() =>{
            await store.dispatch('Properties_List/updateState', {propertyID: ''});
            propertyID.value = ""
        }
        const fetchTenants = async() =>{
            if(propertyID.value){
                await store.dispatch('Active_Tenants/fetchTenantUnits', {company:companyID.value, property: propertyID.value})
            } else{
                await store.dispatch('Active_Tenants/fetchTenantUnits', {company:companyID.value}) 
            }     
        };
        const fetchTenantInvoices = async() =>{
            if(tenantID.value){
                await store.dispatch('Journals/fetchJournalsClient', {company:companyID.value, txn_type:"INV", customer:tenantID.value, status:"Open"})
            }       
        };
        const handleSelectedTenant = async(option) =>{
            await store.dispatch('Active_Tenants/handleSelectedTenantUnit', option)
            tenantID.value = store.state.Active_Tenants.tenantID;
        };
        const clearSelectedTenant = async() =>{
            await store.dispatch('Active_Tenants/updateState', {tenantID: ''});
            tenantID.value = ""
        }
        const fetchLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value, ledger_type: 'Cashbook'})
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
            if(tenantID.value == "" || tenantID.value == null){
                toast.error("Select A Tenant To Receipt")
                formFields.value[6].value = 0;
                hasPrepayment.value = false;
            }
            else if(receiptTotals.value > 0 && receiptTotals.value <= outstanding_balance.value){
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
                prepaymentAmount.value = receiptTotals.value  - outstanding_balance.value;
                for(let i=0; i<receiptRows.value.length; i++){
                    if(receiptRows.value[i].due_amount <= receiptTotals.value && receiptTotals.value != 0){
                        receiptRows.value[i].payment_allocation = receiptRows.value[i].due_amount;
                        receiptRows.value[i].bal_after_alloc = receiptRows.value[i].due_amount - receiptRows.value[i].payment_allocation;
                        receiptTotals.value = receiptTotals.value - receiptRows.value[i].payment_allocation;
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
                formFields.value[8].value = "";
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
                    type:'search-dropdown', label:"Property", value: propertyID.value, componentKey: propComponentKey,
                    selectOptions: propertyArray, optionSelected: handleSelectedProperty, required: false,
                    searchPlaceholder: 'Select Property...', dropdownWidth: '390px', updateValue: "",
                    fetchData: fetchProperties(), clearSearch: clearSelectedProperty()            
                },
                { type: 'dropdown', name: 'month',label: "Month", value: '', placeholder: "", required: true, options: [{ text: 'January', value: 'January' }, { text: 'February', value: 'February' },{ text: 'March', value: 'March' }, { text: 'April', value: 'April' },{ text: 'May', value: 'May' }, { text: 'June', value: 'June' },{ text: 'July', value: 'July' }, { text: 'August', value: 'August' },{ text: 'September', value: 'September' }, { text: 'October', value: 'October' },{ text: 'November', value: 'November' }, { text: 'December', value: 'December' }] },
                { type: 'text', name: 'reference_no',label: "Year", value: '', required: true,},
                { type: 'date', name: 'with_effect_from',label: "W.E.F", value: '', required: true },
                { type: 'date', name: 'with_effect_to',label: "W.E.T", value: '', required: true },            
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
            store.dispatch('Journals/updateState', {journalsClientList: [], outstandingBalance: 0})
            mainComponentKey.value += 1;
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].type == 'number'){
                    formFields.value[i].value = 0;
                }else{
                    formFields.value[i].value = '';
                }
                
            }
            propertyID.value = '';
            tenantID.value = '';
            ledgerID.value = '';
            propComponentKey.value += 1;
            tntComponentKey.value += 1;
            ledComponentKey.value += 1;
            receipt_totals.value = 0;
            receiptTotals.value = 0;
            prepaymentAmount.value = 0;
            hasPrepayment.value = false;
        }
        watch([propertyID, tenantID], () => {
            if (propertyID.value && !tenantID.value) {
                tntComponentKey.value += 1;
                fetchTenants();
            }else if(tenantID.value){
                fetchTenantInvoices();
            }    
        }, { immediate: true });
        watch([ledgerID], () => {
            if (ledgerID.value !="") {
                formFields.value[7].value = ledgerID.value;
            }   
        }, { immediate: true })

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createTenantReceipt = async() =>{
            showLoader();
            if(formFields.value[8].value == ""){
                let rcptMemo = ""
                for(let i=0; i<receiptRows.value.length; i++){
                    rcptMemo = rcptMemo + receiptRows.value[i].description + ', ';
                }
                formFields.value[8].value = rcptMemo;
            }
            let formData = {
                company: companyID.value,
                txn_type: "RCPT",
                tenant: tenantID.value,
                cashbook: ledgerID.value,
                description: formFields.value[8].value,
                issue_date: formFields.value[2].value,
                due_date: formFields.value[2].value,
                client_category: "Tenants",
                total_amount: formFields.value[6].value,
                tax_amount: 0,
                payment_method: formFields.value[4].value,
                reference_no: formFields.value[5].value,
                banking_date: formFields.value[3].value,
                receipt_items: receiptRows.value
            }
            
            errors.value = [];
            for(let i=2; i < (formFields.value.length); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(tenantID.value == '' || ledgerID.value == ''){
                errors.value.push('Error');
            }
            let rcptTotal = 0
            for(let i=0; i<receiptRows.value.length; i++){
                rcptTotal += Number(receiptRows.value[i].payment_allocation);
            }

            if(formFields.value[6].value != Number(rcptTotal)){
                toast.error('Invalid Receipt Amount');
                hideLoader();
            }
            else{
                if(errors.value.length){
                    toast.error('Fill In Required Fields');
                    hideLoader();                 
                }else{            
                    try {
                        const response = await store.dispatch('Journals/createTenantReceipt', formData);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Receipt created successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                            propComponentKey.value += 1;
                            ledComponentKey.value += 1;
                            tntComponentKey.value += 1;
                        } else {
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
                formFields.value[6].value = receipt_totals.value;
                prepaymentCheck();
            } 
        }, { immediate: true });

        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const additionalFields = ref([]);
        const updateAdditionalFields = () =>{
            additionalFields.value = [
                { type: 'number', name: 'prepayment_amount',label: "Prepayment Amount", value: prepaymentAmount.value, required: true, disabled: true },
            ]
        };
        const handlePrepayment = async() =>{
            showModalLoader();
            if(prepaymentAmount.value <= 0 ){
                toast.error("Invalid Prepayment Amount");
                hideModalLoader();
            }else{
                let formData = {
                    journal_no : "PREPAID",
                    description : "Tenant Prepayment",
                    total_amount : prepaymentAmount.value,
                    total_paid : prepaymentAmount.value,
                    due_amount : 0,
                    payment_allocation : prepaymentAmount.value,
                    bal_after_alloc : 0,
                }
                await store.dispatch('Journals/handleClientPrepayment',formData);
                toast.success("Prepayment Added");
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
            flex_basis_additional.value = '1/2';
            flex_basis_percentage_additional.value = '50';
        }
        const closeModal = async() =>{
            prepModalVisible.value = false;
            handlePrepaymentReset();
        }

        const fetchTransactions = async() =>{
            showLoader();
            let formData = {
                month: formFields.value[1].value,
                year: formFields.value[2].value,
                with_effect_from: formFields.value[3].value,
                with_effect_to: formFields.value[4].value,
                property: propertyID.value,
                company: companyID.value
            }
            await store.dispatch('Property_Statements/fetchStatementData', formData)
            hideLoader();
        }

        onBeforeMount(()=>{ 
            updateFormFields();
            outstanding_balance.value = 0;
            ledComponentKey.value += 1;
            propComponentKey.value += 1;
            tntComponentKey.value += 1;
            flex_basis.value = '1/5';
            flex_basis_percentage.value = '20';
        })
        onMounted(()=>{

        })

        return{
            subHeaders, tableData, formFields, flex_basis, flex_basis_percentage, displayButtons, createTenantReceipt, mainComponentKey,
            handleReset, loader, showLoader, hideLoader, tableKey, receiptColumns, receiptRows, showActions, idField,
            autoPopulatePaymentAlloc, outstanding_balance, hasPrepayment, addPrepayment, handlePrepayment, allocateInputAmount,
            title, modal_loader, modal_left, modal_top, modal_width, prepModalVisible, showModalLoader, hideModalLoader, closeModal,
            additionalFields,flex_basis_additional, flex_basis_percentage_additional, handlePrepaymentReset,
            fetchTransactions
        }
    }
})
</script>

<style scoped>
.dynamic-table {
  width: 100%;
  border-collapse: collapse;
  /* table-layout: fixed; */
}

.dynamic-table th,
.dynamic-table td {
  border: 1px solid #ccc;
  padding: 3px;
  text-align: left;
}

.dynamic-table input{
  text-align: left;
  outline: none;
  background-color: inherit;
}
/* Style for fixed header */
.table-container thead th {
  position: sticky;
  top: 0;
  background: #3b4252;
  color: white;
}

.table-body tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>