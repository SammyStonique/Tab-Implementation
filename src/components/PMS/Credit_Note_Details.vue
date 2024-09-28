<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="createTenantReceipt" @handleReset="handleReset"> 
                    <template v-slot:additional-content>
                        <div class="flex">
                            <div class="basis-1/3 text-left">
                            </div>
                            <div class="basis-1/2 text-red-500 text-left">
                                <p class="font-bold">DUE BALANCE:  {{ Number(outstanding_balance).toLocaleString() }}</p>
                            </div> 
                            <div class="basis-1/3 text-left">
                            </div>              
                        </div>
                        
                        <div class="px-3 min-h-[220px]">
                            <DynamicTable :key="tableKey" :columns="receiptColumns" :rows="receiptRows" :showActions="showActions" :idField="idField" @update-receipt-amount="allocateInputAmount" @row-db-click="autoPopulatePaymentAlloc"/>
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
    name: 'Credit_Note_Details',
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
        const tableKey = ref(0);
        const mainComponentKey = ref(0);
        const tntComponentKey = ref(0);
        const propComponentKey = ref(0);
        const receipt_totals = ref(0);
        const receiptTotals = ref(0);
        const receipt_memo = ref('');
        const prepaymentAmount = ref(0);
        const outstanding_balance = computed(()=> store.state.Journals.outstandingBalance);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const displayButtons = ref(true);
        const showActions = ref(false);
        const idField = ref('');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const tenantID = ref('');
        const propertyID = ref('');
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
                await store.dispatch('Journals/fetchJournalsClient', {company:companyID.value, txn_type:['INV','DBN'], customer:tenantID.value, status:"Open"})
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
                toast.error("Select A Tenant To Pass Credit Note")
                formFields.value[3].value = 0;
            }
            else if(receiptTotals.value > 0 && receiptTotals.value <= outstanding_balance.value){
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
                receipt_totals.value = 0;
                prepaymentAmount.value = 0;
                receipt_memo.value = "";
                formFields.value[4].value = "";
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
                    searchPlaceholder: 'Select Property...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchProperties(), clearSearch: clearSelectedProperty()            
                },
                {
                    type:'search-dropdown', label:"Tenant", value: tenantID.value, componentKey: tntComponentKey,
                    selectOptions: tenantArray, optionSelected: handleSelectedTenant, required: true,
                    searchPlaceholder: 'Select Tenant...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchTenants(), clearSearch: clearSelectedTenant()  
                },
                { type: 'date', name: 'issue_date',label: "Recording Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
                { type: 'number', name: 'total_amount',label: "Amount", value: receipt_totals.value || 0, required: true, method: allocateReceivedAmount },
                {type:'text-area', label:"Memo", value: receipt_memo.value, textarea_rows: '2', textarea_cols: '40', required: true},
                
            ]
        };
        watch([receipt_memo, receipt_totals], () => {
            if (receipt_memo.value.length) {
                formFields.value[4].value = receipt_memo.value;
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
            propComponentKey.value += 1;
            tntComponentKey.value += 1;
            receipt_totals.value = 0;
            receiptTotals.value = 0;
            prepaymentAmount.value = 0;
        }
        watch([propertyID, tenantID], () => {
            if (propertyID.value && !tenantID.value) {
                tntComponentKey.value += 1;
                fetchTenants();
            }else if(tenantID.value){
                fetchTenantInvoices();
            }    
        }, { immediate: true });

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createTenantReceipt = async() =>{
            showLoader();
            if(formFields.value[4].value == ""){
                let rcptMemo = ""
                for(let i=0; i<receiptRows.value.length; i++){
                    if(receiptRows.value[i].payment_allocation > 0){
                        rcptMemo = rcptMemo + receiptRows.value[i].description + ', ';
                    }
                }
                formFields.value[4].value = rcptMemo;
            }
            let formData = {
                company: companyID.value,
                txn_type: "CDN",
                tenant: tenantID.value,
                user: userID.value,
                cashbook: null,
                description: formFields.value[4].value,
                issue_date: formFields.value[2].value,
                due_date: formFields.value[2].value,
                client_category: "Tenants",
                total_amount: formFields.value[3].value,
                tax_amount: 0,
                payment_method: "",
                reference_no: "",
                banking_date: formFields.value[2].value,
                receipt_items: receiptRows.value
            }
            
            errors.value = [];
            for(let i=2; i < (formFields.value.length); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(tenantID.value == ''){
                errors.value.push('Error');
            }
            let rcptTotal = 0
            for(let i=0; i<receiptRows.value.length; i++){
                rcptTotal += Number(receiptRows.value[i].payment_allocation);
            }

            if(formFields.value[3].value != Number(rcptTotal)){
                toast.error('Invalid Amount');
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
                            toast.success('Credit Note created successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                            propComponentKey.value += 1;
                            tntComponentKey.value += 1;
                        } else {
                            toast.error('An error occurred while creating the Credit Note.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to create Credit Note: ' + error.message);
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
                formFields.value[3].value = receipt_totals.value;
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
            outstanding_balance.value = 0;
            propComponentKey.value += 1;
            tntComponentKey.value += 1;
            flex_basis.value = '1/5';
            flex_basis_percentage.value = '20';
        })
        onMounted(()=>{

        })

        return{
            formFields, flex_basis, flex_basis_percentage, displayButtons, createTenantReceipt, mainComponentKey,
            handleReset, loader, showLoader, hideLoader, tableKey, receiptColumns, receiptRows, showActions, idField,
            autoPopulatePaymentAlloc, outstanding_balance, allocateInputAmount,
        }
    }
})
</script>