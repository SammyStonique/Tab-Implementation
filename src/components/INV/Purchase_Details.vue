<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="createPurchaseVoucher" @handleReset="handleReset"> 
                    <template v-slot:additional-content>                    
                        <div class="min-h-[220px]">
                            <DynamicTable :key="tableKey" :showTotals="showTotals" :rightsModule="rightsModule" :columns="itemColumns" :rows="itemRows" :showActions="showActions" :idField="idField" :actions="actions" @action-click="deleteItemLine"/>
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
// import DynamicTable from '../DynamicTable.vue';
import DynamicTable from '@/components/INV/DynamicTable.vue';

export default defineComponent({
    name: 'Purchase_Details',
    components:{
        PageStyleComponent, DynamicForm, DynamicTable, MovableModal
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const rightsModule = ref('Inventory');
        const current_date = new Date();
        const loader = ref('none');
        const modal_loader = ref('none');
        const tableKey = ref(0);
        const mainComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const outComponentKey = ref(0);
        const itemComponentKey = ref(0);
        const receipt_totals = ref(0);
        const receiptTotals = ref(0);
        const discountTotals = ref(0);
        const tax_totals = ref(0);
        const saleItemsArray = ref([]);
        const journalEntryArr = ref([]);
        const taxTransactionArr = ref([]);
        const title = ref('Add Prepayment');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const defaultSettings = computed(()=> store.state.userData.defaultSettings);
        const defaultOutlet = computed(()=> store.state.Direct_Purchases.defaultOutlet);
        const defaultCounter = computed(()=> store.state.Direct_Purchases.defaultCounter);
        const defaultChannel = computed(()=> store.state.Direct_Purchases.defaultChannel);
        const defaultStockType = computed(()=> store.state.Direct_Purchases.defaultStockType);
        const displayButtons = ref(true);
        const showActions = ref(true);
        const idField = ref('');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const itemID = ref('');
        const outletID = computed(()=> store.state.Direct_Purchases.defaultOutletID);
        const counterID = computed(()=> store.state.Direct_Purchases.defaultCounterID);
        const channelID = computed(()=> store.state.Direct_Purchases.defaultChannelID);
        const cashbookID = ref("");
        const itemArray = computed(() => store.state.Items_Catalog.itemsArr);
        const outletArray = computed(() => store.state.Retail_Outlets.outletArr);
        const ledgerArray = computed(() => store.state.Ledgers.cashbookLedgerArr);
        const itemRows = computed(() => store.state.Items_Catalog.lineItemsArray);
        const stock_control_account = ref("");
        const sales_income_account = ref("");
        const taxRates = computed(() => store.getters['Taxes/getFormatedTax']);
        const itemColumns = ref([
            {label: "Item Name", key:"item_name", type: "text", editable: false},
            {label: "Qty", key:"quantity", type: "number", editable: true, minWidth:"50px", maxWidth:"50px"},
            {label: "P.Price", key: "cost", type: "number", editable: true,},
            {label: "S.Price", key:"selling_price", type: "number", editable: true,},
            {label: "Vat rate", key: "vat_rate", type: "select-dropdown", editable: false, options: taxRates, maxWidth:"50px"},
            {label: "Incl.", key: "vat_inclusivity", type: "select-dropdown", editable: false, maxWidth:"20px", options: [{ text: 'Yes', value: 'Inclusive' }, { text: 'No', value: 'Exclusive' }]},
            {label: "Vat Amnt", key: "vat_amount", type: "number", editable: false, maxWidth:"30px"},
            {label: "Total", key: "total_amount", type: "number", editable: false},
            {label: "Discount", key: "discount", type: "number", editable: true, minWidth:"50px", maxWidth:"50px"},
            
        ]);
        const showTotals = ref(true);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Item', rightName: "Adding Inventory Sale"},
        ])

        const deleteItemLine = (rowIndex, action, row) =>{
            store.dispatch('Items_Catalog/removeItemLine', rowIndex);
        }
        const fetchTaxes = async() =>{
            await store.dispatch('Taxes/fetchTaxes', {company:companyID.value})
        };

        const fetchAllItems = async() =>{
            await store.dispatch('Items_Catalog/fetchInventoryItems', {company:companyID.value})
        };
        const fetchItems = async() =>{
            await store.dispatch('Items_Catalog/fetchInventoryItems', {company:companyID.value})
        };
        const fetchOutlets = async() =>{
            await store.dispatch('Retail_Outlets/fetchOutlets', {company:companyID.value})
        };
        const fetchCashbooks = async(outletCounter) =>{
            await store.dispatch('Ledgers/fetchCashbookLedgers', {company:companyID.value, ledger_type: "Cashbook"})
        };

        const handleSelectedOutlet = async(option) =>{
            await store.dispatch('Retail_Outlets/handleSelectedOutlet', option)
            // outletID.value = store.state.Retail_Outlets.outletID;     
            await store.dispatch('Direct_Purchases/updateState', {defaultOutletID: store.state.Retail_Outlets.outletID});
        };
        const handleSelectedCashbook = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            cashbookID.value = store.state.Ledgers.ledgerID;
        };
        const handleSelectedItem = async(option) =>{
            await store.dispatch('Items_Catalog/handleSelectedPurchaseItem', option)
            itemID.value = store.state.Items_Catalog.itemID;
            itemComponentKey.value += 1;
        };
        const clearSelectedOutlet = async() =>{
            await store.dispatch('Retail_Outlets/updateState', {outletID: ''});
            outletID.value = ""
            await store.dispatch('Direct_Purchases/updateState', {defaultOutletID: outletID.value});
        }
        const clearSelectedCashbook = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            channelID.value = "";
            cashbookID.value = "";
        }
        const fetchInventoryItems = (value) =>{
            itemComponentKey.value += 1;
            fetchItems(value);
        };
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                { type: 'date', name: 'issue_date',label: "Recording Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },        
                {
                    type:'search-dropdown', label:"Outlet", value: outletID.value, componentKey: outComponentKey,
                    selectOptions: outletArray, optionSelected: handleSelectedOutlet, required: true,
                    searchPlaceholder: 'Select Outlet...', dropdownWidth: '500px', updateValue: defaultOutlet.value,
                    clearSearch: clearSelectedOutlet()  
                },
                {
                    type:'search-dropdown', label:"Cashbook", value: cashbookID.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedCashbook, required: true,
                    searchPlaceholder: 'Select Cashbook...', dropdownWidth: '400px', updateValue: "",
                    clearSearch: clearSelectedCashbook()  
                },
                {
                    type:'search-dropdown', label:"Item", value: itemID.value, componentKey: itemComponentKey,
                    selectOptions: itemArray, optionSelected: handleSelectedItem, required: true,
                    searchPlaceholder: 'Select Item...', dropdownWidth: '500px', updateValue: "",
                },
                { type: 'text', name: 'customer',label: "Vendor", value: '', required: true,},
                { type: 'text', name: 'phone_number',label: "Phone No", value: '0', required: true,},
                { type: 'text', name: 'reference_no',label: "Reference No", value: '', required: true,},
                { type: 'number', name: 'total_amount',label: "Amount", value: receipt_totals.value || 0, required: true, },
                {required: false,}                
            ]
        };

        watch([defaultOutlet, defaultCounter, defaultChannel, defaultStockType], () => {
            if(defaultOutlet.value != null){
                outComponentKey.value += 1; 
            }
            
        }, { immediate: true });

        const handleReset = () =>{
            store.dispatch('Items_Catalog/updateState', { lineItemsArray: []})
            mainComponentKey.value += 1;
            formFields.value[0].value = formatDate(current_date);
            formFields.value[5].value = "";
            formFields.value[5].value = "0";
            formFields.value[6].value = "";
            formFields.value[7].value = 0;
            receipt_totals.value = 0;
            receiptTotals.value = 0;
            discountTotals.value = 0;
            tax_totals.value = 0;
        }

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createPurchaseVoucher = async() =>{
            showLoader();
            saleItemsArray.value = [];
            journalEntryArr.value = [];
            taxTransactionArr.value = [];
            receiptTotals.value = 0;
            receipt_totals.value = 0;
            discountTotals.value = 0;
            tax_totals.value = 0;

            for(let i=0; i<itemRows.value.length; i++){
                receiptTotals.value += Number(itemRows.value[i].total_amount);
                tax_totals.value += Number(itemRows.value[i].vat_amount);
                receipt_totals.value += Number(itemRows.value[i].sub_total);
                discountTotals.value += Number(itemRows.value[i].discount);

                if(itemRows.value[i].vat_rate){
                    let purchaseItem ={
                        "date": formFields.value[0].value,
                        "inventory_item": itemRows.value[i].item,
                        "adjusted_stock": itemRows.value[i].quantity,
                        "stock_type": itemRows.value[i].stock_type,
                        "batch_before_sale": itemRows.value[i].quantity,
                        "batch_count": itemRows.value[i].batch_count,
                        "discount": itemRows.value[i].discount,
                        "tax": parseFloat(itemRows.value[i].vat_amount),
                        "item_total": itemRows.value[i].total_amount,
                        "batch_after_sale": itemRows.value[i].quantity,
                        "purchase_price": parseFloat(itemRows.value[i].cost),
                        "selling_price": parseFloat(itemRows.value[i].selling_price),
                        "quantity": itemRows.value[i].quantity,
                        "tax_type": itemRows.value[i].vat_rate.tax_id,
                        "tax_inclusivity": itemRows.value[i].vat_inclusivity,
                    }        
                    saleItemsArray.value.push(purchaseItem);
                    
                }else{
                    let purchaseItem ={
                        "date": formFields.value[0].value,
                        "inventory_item": itemRows.value[i].item,
                        "adjusted_stock": itemRows.value[i].quantity,
                        "stock_type": itemRows.value[i].stock_type,
                        "batch_before_sale": itemRows.value[i].quantity,
                        "batch_count": itemRows.value[i].batch_count,
                        "discount": itemRows.value[i].discount,
                        "tax": parseFloat(itemRows.value[i].vat_amount),
                        "item_total": itemRows.value[i].total_amount,
                        "batch_after_sale": itemRows.value[i].quantity,
                        "purchase_price": parseFloat(itemRows.value[i].purchase_price),
                        "selling_price": parseFloat(itemRows.value[i].selling_price),
                        "quantity": itemRows.value[i].quantity,
                        "tax_type": "",
                        "tax_inclusivity": "",
                    } 
                    saleItemsArray.value.push(purchaseItem);
                }
                if(itemRows.value[i].vat_amount > 0){
                    let jnlEntry1 ={
                        "date": formFields.value[0].value,
                        "txn_type": "JNL",
                        "posting_account": stock_control_account.value,
                        "credit_amount": 0,
                        "description": "Purchase of "+ itemRows.value[i].quantity+' '+ itemRows.value[i].item_name,
                        "debit_amount": itemRows.value[i].sub_total,
                    }     
                    let jnlEntry2 ={
                        "date": formFields.value[0].value,
                        "txn_type": "JNL",
                        "posting_account": itemRows.value[i].vat_rate.tax_input_account.ledger_id,
                        "credit_amount": 0,
                        "description": "Purchase of "+ itemRows.value[i].item_name+", Tax receivable",
                        "debit_amount": Math.abs(itemRows.value[i].vat_amount),
                    }    
                    let taxTxn ={
                        "tax": itemRows.value[i].vat_rate.tax_id,
                        "client": formFields.value[4].value,
                        "amount": itemRows.value[i].vat_amount,
                        "description": "Purchase of "+ itemRows.value[i].item_name+", Tax receivable",
                        "tax_inclusive": itemRows.value[i].vat_inclusivity,
                        "tax_category": 'Input'
                    }               
                    journalEntryArr.value.push(jnlEntry1, jnlEntry2);
                    taxTransactionArr.value.push(taxTxn);
                }else{
                    let jnlEntry1 ={
                        "date": formFields.value[0].value,
                        "txn_type": "JNL",
                        "posting_account": stock_control_account.value,
                        "credit_amount": 0,
                        "description": "Purchase of "+ itemRows.value[i].quantity+' '+ itemRows.value[i].item_name,
                        "debit_amount": itemRows.value[i].sub_total,
                    }                       
                    journalEntryArr.value.push(jnlEntry1);
                }
            }

            let jnlEntry3 ={
                "date": formFields.value[0].value,
                "txn_type": "JNL",
                "posting_account": cashbookID.value,
                "debit_amount": 0,
                "description": "Inventory Purchase",
                "credit_amount": Math.abs(receiptTotals.value),
            }
            journalEntryArr.value.push(jnlEntry3);

            let formData = {
                outlet: outletID.value,
                cashbook: cashbookID.value,
                outlet_counter: counterID.value,
                notes: "",
                date: formFields.value[0].value,
                purchase_items_array: saleItemsArray.value,
                journal_entry_array: journalEntryArr.value,
                tax_transaction_array: taxTransactionArr.value,
                txn_type: "JNL",
                issue_date: formFields.value[0].value,
                banking_date: formFields.value[0].value,
                total_amount: receiptTotals.value,
                sale_type: "Cash",
                vendor: formFields.value[4].value,
                phone_number: formFields.value[5].value,
                amount_paid: formFields.value[7].value,
                balance: formFields.value[7].value - receiptTotals.value,
                tax: tax_totals.value,
                reference_no: formFields.value[6].value,
                discount: discountTotals.value,
                company: companyID.value,
                user: userID.value
            }
       
            errors.value = [];
            for(let i=0; i < formFields.value.length ; i++){
                if(formFields.value[i].type != "search-dropdown" && formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(outletID.value == '' || cashbookID.value == ''){
                errors.value.push('Error');
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }
            else{
                if(Number(receiptTotals.value) <= 0){
                    toast.error('Invalid Purchase Amount');
                    hideLoader();
                }else if(Number(receiptTotals.value) != formFields.value[7].value){
                    toast.error('Invalid Purchase Amount');
                    hideLoader();
                }
                else{            
                    try {
                        const response = await store.dispatch('Direct_Purchases/createPurchase', formData);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Purchase created successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                        } else {
                            toast.error('An error occurred while creating the Purchase.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to create Purchase: ' + error.message);
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

        const fetchDefaultSettings = async() =>{
            for(let i=0; i < defaultSettings.value.length; i++){
                if(defaultSettings.value[i].setting_name === 'Inventory Stock Control A/c'){
                    stock_control_account.value = defaultSettings.value[i].setting_value;
                }else if(defaultSettings.value[i].setting_name === 'Inventory Sales Income A/c'){
                    sales_income_account.value = defaultSettings.value[i].setting_value;
                }
            }
        };

        onBeforeMount(()=>{ 
            store.dispatch('Ledgers/fetchLedgers', {company: companyID.value})
            store.dispatch('Ledgers/updateState', { invoiceItemsArray: []})
            updateFormFields();
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
        })
        onMounted(async()=>{
            fetchCashbooks();
            fetchOutlets();
            fetchDefaultSettings();
            fetchTaxes();
            fetchItems();

        })

        return{
            formFields, flex_basis, flex_basis_percentage, displayButtons, createPurchaseVoucher, mainComponentKey,showTotals,
            handleReset, loader, showLoader, hideLoader, tableKey, itemColumns, itemRows, showActions, actions, deleteItemLine, idField,
            title, modal_loader, modal_left, modal_top, modal_width, showModalLoader, hideModalLoader,rightsModule,
        }
    }
})
</script>