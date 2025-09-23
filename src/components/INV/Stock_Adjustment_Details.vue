<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="createStockAdjustment" @handleReset="handleReset"> 
                    <template v-slot:additional-content>                    
                        <div class="px-3 min-h-[220px]">
                            <DynamicTable :key="tableKey" :columns="itemColumns" :rows="itemRows" :showActions="showActions" :idField="idField" :actions="actions" @action-click="deleteItemLine"/>
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
import DynamicTable from '../DynamicTable.vue';

export default defineComponent({
    name: 'Stock_Adjustment_Details',
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
        const outComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const itemComponentKey = ref(0);
        const adjustment_totals = ref(0);
        const adjustmentTotals = ref(0);
        const adjustment_memo = ref('');
        const journalEntryArr = ref([]);
        const adjustmentItemsArray = ref([]);
        const inventoryItemsArray = ref([]);
        const stock_control_account = ref('');
        const inv_take_on_account = ref('');
        const title = ref('');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const errors = ref([]);
        const defaultSettings = computed(()=> store.state.userData.defaultSettings);
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const displayButtons = ref(true);
        const showActions = ref(true);
        const idField = ref('');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const outletFromID = ref('');
        const ledgerID = ref('');
        const itemID = ref('');
        const outletArray = computed(() => store.state.Retail_Outlets.outletArr);
        const ledgerArray = computed(() => store.state.Ledgers.cashbookLedgerArr);
        const itemArray = computed(() => store.state.Items_Catalog.itemsArr);
        const itemRows = computed(() => store.state.Items_Catalog.lineItemsArray);
        const itemColumns = ref([
            {label: "Item Name", key:"item_name", type: "text", editable: false},
            {label: "At Hand", key:"available_stock", type: "text", editable: false},
            {label: "Qty", key: "quantity", type: "number", editable: true, minWidth:"50px", maxWidth:"50px"},
            {label: "P.Price", key:"purchase_price", type: "text", editable: false,},
            {label: "S.Price", key:"selling_price", type: "text", editable: false,},
            {label: "Operation", key: "operation", type: "select-dropdown", editable: false, maxWidth:"20px", options: [{ text: 'Add', value: 'Add' }]},
            {label: "Total", key: "total_amount", type: "number", editable: false},        
        ]);

        const actions = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Invoice Line'},
        ])

        const deleteItemLine = (rowIndex, action, row) =>{
            store.dispatch('Items_Catalog/removeItemLine', rowIndex);
        }
        const fetchRetailOutlets = async() =>{
            await store.dispatch('Retail_Outlets/fetchOutlets', {company:companyID.value})
        };
        const handleSelectedOutletFrom = async(option) =>{
            await store.dispatch('Retail_Outlets/handleSelectedOutlet', option)
            outletFromID.value = store.state.Retail_Outlets.outletID;  
        };
        const clearSelectedOutletFrom = async() =>{
            await store.dispatch('Retail_Outlets/updateState', {outletID: ''});
            outletFromID.value = ""
        }
        const fetchLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value, ledger_type: 'Cashbook'})
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            ledgerID.value = store.state.Ledgers.ledgerID;  
        };
        const clearSelectedLedger = async() =>{
            await store.dispatch('Ledger/updateState', {ledgerID: ''});
            ledgerID.value = ""
        };
        const fetchItems = async() =>{
            await store.dispatch('Items_Catalog/fetchItemsWithStock', {company:companyID.value})
        };
        const handleSelectedItem = async(option) =>{
            await store.dispatch('Items_Catalog/handleSelectedPurchaseItem', option)
            itemComponentKey.value += 1;
        };
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                { type: 'date', name: 'date',label: "Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
                {
                    type:'search-dropdown', label:"Outlet", value: outletFromID.value, componentKey: outComponentKey,
                    selectOptions: outletArray, optionSelected: handleSelectedOutletFrom, required: true,
                    searchPlaceholder: 'Select Outlet...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchRetailOutlets(), clearSearch: clearSelectedOutletFrom()  
                },
                {
                    type:'search-dropdown', label:"Cashbook", value: ledgerID.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: false,
                    searchPlaceholder: 'Select Cashbook...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchLedgers(),clearSearch: clearSelectedLedger()  
                },
                {
                    type:'search-dropdown', label:"Item", value: itemID.value, componentKey: itemComponentKey,
                    selectOptions: itemArray, optionSelected: handleSelectedItem, required: true,
                    searchPlaceholder: 'Select Item...', dropdownWidth: '400px', updateValue: "",
                },
                {type:'text-area', label:"Memo", value: adjustment_memo.value, textarea_rows: '2', textarea_cols: '50', required: true},
                
            ]
        };

        const handleReset = () =>{
            store.dispatch('Items_Catalog/updateState', { lineItemsArray: []})
            mainComponentKey.value += 1;
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].type == 'number'){
                    formFields.value[i].value = 0;
                }else{
                    formFields.value[i].value = '';
                }
                
            }
            outletFromID.value = '';
            ledgerID.value = '';
            outComponentKey.value += 1;
            ledComponentKey.value += 1;
            adjustment_totals.value = 0;
            adjustmentTotals.value = 0;
        }

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createStockAdjustment = async() =>{
            showLoader();
            adjustmentItemsArray.value = [];
            journalEntryArr.value = [];
            inventoryItemsArray.value = [];
            adjustmentTotals.value = 0;
            adjustment_totals.value = 0;

            for(let i=0; i<itemRows.value.length; i++){
                inventoryItemsArray.value.push(itemRows.value[i].item);
                let adjItem ={
                    "date": formFields.value[0].value,
                    "inventory_item": itemRows.value[i].item,
                    "stock_at_hand": itemRows.value[i].available_stock,
                    "adjusted_stock": itemRows.value[i].quantity,
                    "quantity": itemRows.value[i].quantity,
                    "operation": itemRows.value[i].operation,
                    "purchase_price": itemRows.value[i].purchase_price,
                    "selling_price": itemRows.value[i].selling_price,
                }
                adjustmentItemsArray.value.push(adjItem)
                if(itemRows.value[i].operation === 'Add'){
                    adjustment_totals.value += itemRows.value[i].sub_total;
                }else{
                    adjustment_totals.value -= itemRows.value[i].sub_total;
                }
            }
            if(adjustment_totals.value == 0){
                toast.error('Stock Adjustment of 0 Not Allowed');
                hideLoader();
            }
            else if(adjustment_totals.value < 0){
                let jnlEntry1 ={
                    "date": formFields.value[0].value,
                    "txn_type": "JNL",
                    "posting_account": stock_control_account.value,
                    "credit_amount": Math.abs(adjustment_totals.value),
                    "debit_amount": 0,
                }
                journalEntryArr.value.push(jnlEntry1);

                let jnlEntry2 = {
                    "date": formFields.value[0].value,
                    "txn_type": "JNL",
                    "posting_account": inv_take_on_account.value,
                    "credit_amount": 0,
                    "debit_amount": Math.abs(adjustment_totals.value),
                }
                journalEntryArr.value.push(jnlEntry2);      
            }
            else{
                let jnlEntry1 ={
                    "date": formFields.value[0].value,
                    "txn_type": "JNL",
                    "posting_account": stock_control_account.value,
                    "debit_amount": adjustment_totals.value,
                    "credit_amount": 0,
                }
                journalEntryArr.value.push(jnlEntry1);

                if(ledgerID.value){
                    let jnlEntry2 = {
                        "date": formFields.value[0].value,
                        "txn_type": "JNL",
                        "posting_account": ledgerID.value,
                        "debit_amount": 0,
                        "credit_amount": adjustment_totals.value,
                    }
                    journalEntryArr.value.push(jnlEntry2);
                }else{
                    let jnlEntry2 = {
                        "date": formFields.value[0].value,
                        "txn_type": "JNL",
                        "posting_account": inv_take_on_account.value,
                        "debit_amount": 0,
                        "credit_amount": adjustment_totals.value,
                    }
                    journalEntryArr.value.push(jnlEntry2);
                }    
            }

            let formData = {
                company: companyID.value,
                warehouse: outletFromID.value,
                notes: formFields.value[4].value,
                date: formFields.value[0].value,
                items_array: inventoryItemsArray.value,
                adjustment_items_array: adjustmentItemsArray.value,
                txn_type: "JNL",
                issue_date: formFields.value[0].value,
                total_amount: adjustment_totals.value,
                journal_entry_array: journalEntryArr.value,
                user: userID.value
            }
            // console.log("THE FORM DATA IS ",formData)
            errors.value = [];
            if(outletFromID.value == '' || formFields.value[4].value == '' || formFields.value[0].value == ''){
                errors.value.push('Error');
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }
            else{
                if(Number(adjustment_totals.value) <= 0){
                    toast.error('Invalid Adjustment Quantity');
                    hideLoader();
                }
                else{            
                    try {
                        const response = await store.dispatch('Stock_Adjustments/createStockAdjustment', formData);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Stock Adjustment Done successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                            outComponentKey.value += 1;
                            ledComponentKey.value += 1;
                        } else {
                            toast.error('An error occurred while creating Stock Adjustment.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to create Stock Adjustment: ' + error.message);
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
                }else if(defaultSettings.value[i].setting_name === 'Inventory Take On Balancing A/c'){
                    inv_take_on_account.value = defaultSettings.value[i].setting_value;
                }
            }
        };

        onBeforeMount(()=>{ 
            fetchDefaultSettings();
            store.dispatch('Items_Catalog/updateState', { lineItemsArray: []})
            updateFormFields();
            outComponentKey.value += 1;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
        })
        onMounted(()=>{
            fetchItems();
        })

        return{
            formFields, flex_basis, flex_basis_percentage, displayButtons, createStockAdjustment, mainComponentKey,
            handleReset, loader, showLoader, hideLoader, tableKey, itemColumns, itemRows, showActions, actions, deleteItemLine, idField,
            title, modal_loader, modal_left, modal_top, modal_width, showModalLoader, hideModalLoader,
        }
    }
})
</script>