<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="createSaleReceipt" @handleReset="handleReset"> 
                    <template v-slot:additional-content>   
                        <div class="flex">
                            <div class="basis-1/3"></div>
                            <div class="basis-1/2 text-red-500 text-left">
                                <p class="font-bold">BALANCE:  {{ Number(balance).toLocaleString() }}</p>
                            </div>               
                        </div>                 
                        <div class="min-h-[220px]">
                            <DynamicTable :key="tableKey" :showTotals="showTotals" :rightsModule="rightsModule" :columns="itemColumns" :rows="itemRows" :showActions="showActions" :idField="idField" :actions="actions" @action-click="deleteItemLine"/>
                        </div>
                    </template>
                </DynamicForm>
            </div>
        </template>
    </PageStyleComponent>
    <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
        
    </MovableModal>
</template>

<script>
import { defineComponent, ref, onBeforeUnmount, onBeforeMount, onMounted, computed, watch } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import MovableModal from '@/components/MovableModal.vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import DynamicTable from '@/components/INV/DynamicTable.vue';

export default defineComponent({
    name: 'Sale_Details',
    components:{
        PageStyleComponent, DynamicForm, DynamicTable, MovableModal
    },
    setup(){
        const socket = ref(null);
        const store = useStore();
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const rightsModule = ref('Inventory');
        const current_date = new Date();
        const loader = ref('none');
        const modal_loader = ref('none');
        const tableKey = ref(0);
        const mainComponentKey = ref(0);
        const countComponentKey = ref(0);
        const outComponentKey = ref(0);
        const chanComponentKey = ref(0);
        const itemComponentKey = ref(0);
        const receipt_totals = ref(0);
        const receiptTotals = ref(0);
        const discountTotals = ref(0);
        const balance = ref(0);
        const tax_totals = ref(0);
        const saleItemsArray = ref([]);
        const title = ref('Mpesa Payment Notification');
        const depModalVisible = ref(false);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const defaultSettings = computed(()=> store.state.userData.defaultSettings);
        const defaultOutlet = computed(()=> store.state.Direct_Sales.defaultOutlet);
        const defaultCounter = computed(()=> store.state.Direct_Sales.defaultCounter);
        const defaultChannel = computed(()=> store.state.Direct_Sales.defaultChannel);
        const defaultStockType = computed(()=> store.state.Direct_Sales.defaultStockType);
        const displayButtons = ref(true);
        const showActions = ref(true);
        const idField = ref('');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const itemID = ref('');
        const outletID = computed(()=> store.state.Direct_Sales.defaultOutletID);
        const counterID = computed(()=> store.state.Direct_Sales.defaultCounterID);
        const channelID = computed(()=> store.state.Direct_Sales.defaultChannelID);
        const cashbookID = computed(()=> store.state.Direct_Sales.defaultChannelID);
        const itemArray = computed(() => store.state.Items_Catalog.itemsArr);
        const outletArray = computed(() => store.state.Retail_Outlets.outletArr);
        const counterArray = computed(() => store.state.Outlet_Counters.counterArr);
        const channelArray = computed(() => store.state.Counter_Channels.channelArr);
        const itemRows = computed(() => store.state.Items_Catalog.lineItemsArray);
        const stock_control_account = ref("");
        const sales_income_account = ref("");
        const taxRates = computed(() => store.getters['Taxes/getFormatedTax']);
        const itemColumns = ref([
            {label: "Item Name", key:"inventory_item_name", type: "text", editable: false},
            {label: "Avail.", key:"batch_count", type: "text", editable: false},
            {label: "Batch", key: "available_batch_count", type: "text", editable: false,},
            {label: "Qty", key: "quantity", type: "number", editable: true, minWidth:"50px", maxWidth:"50px"},
            {label: "S.Price", key:"selling_price", type: "text", editable: true,},
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
        const fetchCounters = async() =>{
            if(outletID.value){
                await store.dispatch('Outlet_Counters/fetchCounters', {company:companyID.value, outlet:outletID.value})
            }
        };
        const fetchAllItems = async() =>{
            await store.dispatch('Items_Catalog/fetchInventoryItems', {company:companyID.value})
        };
        const fetchItems = async(stock_type) =>{
            if(outletID.value && stock_type){
                await store.dispatch('Items_Catalog/fetchItems', {company_id:companyID.value, outlet:outletID.value, stock_type:stock_type})
            }
        };
        const fetchOutlets = async() =>{
            await store.dispatch('Retail_Outlets/fetchOutlets', {company:companyID.value})
        };
        const fetchChannels = async(outletCounter) =>{
            if(outletID.value && outletCounter){
                await store.dispatch('Counter_Channels/fetchChannels', {company:companyID.value, outlet_counter:outletCounter})
            }
        };
        watch([outletID, counterID], () => {
            if(outletID.value && counterID.value){
                fetchChannels(counterID.value);
            }
            if (outletID.value) {
                fetchCounters();
            }
            
        }, { immediate: true });
        const handleSelectedCounter = async(option) =>{
            await store.dispatch('Outlet_Counters/handleSelectedCounter', option)
            await store.dispatch('Direct_Sales/updateState', {defaultCounterID: store.state.Outlet_Counters.counterID})
        };
        const handleSelectedOutlet = async(option) =>{
            await store.dispatch('Retail_Outlets/handleSelectedOutlet', option)
            await store.dispatch('Direct_Sales/updateState', {defaultOutletID: store.state.Retail_Outlets.outletID})
        };
        const handleSelectedChannel = async(option) =>{
            await store.dispatch('Counter_Channels/handleSelectedChannel', option)
            channelID.value = store.state.Counter_Channels.channelID;
            store.dispatch('Direct_Sales/updateState', {defaultChannelID: store.state.Counter_Channels.ledgerID})
        };
        const handleSelectedItem = async(option) =>{
            await store.dispatch('Items_Catalog/handleSelectedItem', option)
            itemID.value = store.state.Items_Catalog.itemID;
            itemComponentKey.value += 1;
        };
        const clearSelectedCounter = async() =>{
            await store.dispatch('Outlet_Counters/updateState', {counterID: ''});
            counterID.value = ""
        }
        const clearSelectedOutlet = async() =>{
            await store.dispatch('Retail_Outlets/updateState', {outletID: ''});
            outletID.value = ""
        }
        const clearSelectedChannel = async() =>{
            await store.dispatch('Counter_Channels/updateState', {channelID: '', ledgerID: ''});
            channelID.value = "";
            cashbookID.value = "";
        }
        const fetchInventoryItems = (value) =>{
            itemComponentKey.value += 1;
            fetchItems(value);
        };
        const calculateBalance = (value) =>{
            receiptTotals.value = 0;
            for(let i=0; i<itemRows.value.length; i++){
                receiptTotals.value += Number(itemRows.value[i].total_amount);
            }
            balance.value = value - receiptTotals.value;
        };
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                { type: 'date', name: 'issue_date',label: "Recording Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
                { type: 'date', name: 'banking_date',label: "Banking Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
                
                {
                    type:'search-dropdown', label:"Outlet", value: outletID.value, componentKey: outComponentKey,
                    selectOptions: outletArray, optionSelected: handleSelectedOutlet, required: true,
                    searchPlaceholder: 'Select Outlet...', dropdownWidth: '280px', updateValue: defaultOutlet.value,
                    fetchData: fetchOutlets(), clearSearch: clearSelectedOutlet()  
                },
                {
                    type:'search-dropdown', label:"Counter", value: counterID.value, componentKey: countComponentKey,
                    selectOptions: counterArray, optionSelected: handleSelectedCounter, required: true,
                    searchPlaceholder: 'Select Counter...', dropdownWidth: '280px', updateValue: defaultCounter.value,
                    fetchData: fetchCounters(), clearSearch: clearSelectedCounter()  
                },
                {
                    type:'search-dropdown', label:"Channel", value: channelID.value, componentKey: chanComponentKey,
                    selectOptions: channelArray, optionSelected: handleSelectedChannel, required: true,
                    searchPlaceholder: 'Select Channel...', dropdownWidth: '250px', updateValue: defaultChannel.value,
                    // fetchData: fetchChannels(), 
                    clearSearch: clearSelectedChannel()  
                },
                { type: 'dropdown', name: 'stock_type',label: "Stock Type", value: defaultStockType.value, placeholder: "", required: true, method: fetchInventoryItems, options: [{ text: 'Stocked', value: 'Stocked' }, { text: 'Serialized', value: 'Serialized' },{ text: 'Non Stocked', value: 'Non Stocked' }, { text: 'Service', value: 'Service' }] },
                {
                    type:'search-dropdown', label:"Item", value: itemID.value, componentKey: itemComponentKey,
                    selectOptions: itemArray, optionSelected: handleSelectedItem, required: true,
                    searchPlaceholder: 'Select Item...', dropdownWidth: '350px', updateValue: "",
                    // fetchData: fetchItems(), clearSearch: clearSelectedItem()  
                },
                { type: 'text', name: 'customer',label: "Customer", value: 'Walk-In Customer', required: true,},
                { type: 'text', name: 'phone_number',label: "Phone No", value: '0', required: true,},
                { type: 'text', name: 'reference_no',label: "Reference No", value: '', required: true,},
                { type: 'number', name: 'total_amount',label: "Amount", value: receipt_totals.value || 0, required: true, method: calculateBalance },
                {required: false},  
                {required: false},     
                {required: false},              
                {required: false},                       
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
            formFields.value[1].value = formatDate(current_date);
            formFields.value[5].value = defaultStockType.value;
            formFields.value[7].value = "Walk-In Customer";
            formFields.value[8].value = "0";
            formFields.value[9].value = "";
            formFields.value[10].value = 0;
            receipt_totals.value = 0;
            receiptTotals.value = 0;
            discountTotals.value = 0;
            tax_totals.value = 0;
            balance.value = 0;
        }

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createSaleReceipt = async() =>{
            showLoader();
            saleItemsArray.value = [];
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
                    let saleItem ={
                        "item_batch_id": itemRows.value[i].item_batch_id,
                        "date": formFields.value[0].value,
                        "inventory_item": itemRows.value[i].item,
                        "stock_at_hand": itemRows.value[i].stock_at_hand,
                        "adjusted_stock": itemRows.value[i].quantity,
                        "stock_type": itemRows.value[i].stock_type,
                        "batch_before_sale": itemRows.value[i].stock_after_adjustment,
                        "batch_count": itemRows.value[i].batch_count,
                        "discount": itemRows.value[i].discount,
                        "tax": parseFloat(itemRows.value[i].vat_amount),
                        "profit": itemRows.value[i].item_sales_income,
                        "sub_total": itemRows.value[i].sub_total,
                        "item_total": itemRows.value[i].total_amount,
                        "batch_after_sale": itemRows.value[i].available_batch_count - itemRows.value[i].quantity,
                        "purchase_price": parseFloat(itemRows.value[i].purchase_price),
                        "selling_price": parseFloat(itemRows.value[i].selling_price),
                        "quantity": itemRows.value[i].stock_after_adjustment,
                        "tax_type": itemRows.value[i].vat_rate.tax_id,
                        "tax_inclusivity": itemRows.value[i].vat_inclusivity,
                        "output_vat_id": itemRows.value[i].vat_rate.tax_output_account.ledger_id
                    }        
                    saleItemsArray.value.push(saleItem);
                    
                }else{
                    let saleItem ={
                        "item_batch_id": itemRows.value[i].item_batch_id,
                        "date": formFields.value[0].value,
                        "inventory_item": itemRows.value[i].item,
                        "stock_at_hand": itemRows.value[i].stock_at_hand,
                        "adjusted_stock": itemRows.value[i].quantity,
                        "stock_type": itemRows.value[i].stock_type,
                        "batch_before_sale": itemRows.value[i].stock_after_adjustment,
                        "batch_count": itemRows.value[i].batch_count,
                        "discount": itemRows.value[i].discount,
                        "tax": itemRows.value[i].vat_amount,
                        "profit": itemRows.value[i].item_sales_income,
                        "sub_total": itemRows.value[i].sub_total,
                        "item_total": itemRows.value[i].total_amount,
                        "batch_after_sale": itemRows.value[i].available_batch_count - itemRows.value[i].quantity,
                        "purchase_price": parseFloat(itemRows.value[i].purchase_price),
                        "selling_price": parseFloat(itemRows.value[i].selling_price),
                        "quantity": itemRows.value[i].stock_after_adjustment,
                        "tax_type": "",
                        "tax_inclusivity": "",
                        "output_vat_id": ""
                    } 
                    saleItemsArray.value.push(saleItem);
                }
            }

            let formData = {
                outlet: outletID.value,
                cashbook: cashbookID.value,
                outlet_counter: counterID.value,
                notes: "",
                date: formFields.value[0].value,
                sale_items_array: saleItemsArray.value,
                txn_type: "JNL",
                issue_date: formFields.value[0].value,
                banking_date: formFields.value[1].value,
                total_amount: receiptTotals.value,
                sale_type: "Cash",
                customer: formFields.value[7].value,
                phone_number: formFields.value[8].value,
                amount_received: formFields.value[10].value,
                balance: balance.value,
                tax: tax_totals.value,
                reference_no: formFields.value[9].value,
                discount: discountTotals.value,
                inventory_account: stock_control_account.value,
                income_account: sales_income_account.value,
                company: companyID.value,
                user: userID.value
            }
       
            errors.value = [];
            for(let i=0; i < formFields.value.length ; i++){
                if(formFields.value[i].type != "search-dropdown" && formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(outletID.value == '' || counterID.value == '' || channelID.value == ''){
                errors.value.push('Error');
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }
            else{
                if(Number(receiptTotals.value) <= 0 || balance.value < 0){
                    toast.error('Invalid Sale Amount');
                    hideLoader();
                }
                else{            
                    try {
                        const response = await store.dispatch('Direct_Sales/createSale', formData);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Sale created successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                        } else {
                            toast.error('An error occurred while creating the Sale.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to create Sale: ' + error.message);
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

        // Function to handle incoming WebSocket messages (transaction creation)
        const handleMessage = (event) => {
            const message = JSON.parse(event.data).message;
            alert(message);  // Show an alert when a new transaction is created
        };

        // Establish WebSocket connection when component is mounted
        onMounted(() => {
            fetchDefaultSettings();
            fetchTaxes();
            if(defaultOutlet.value != null && defaultStockType.value != null){
                fetchItems(defaultStockType.value)
            }
            // Connect to the Django WebSocket endpoint (adjust the URL as necessary)
            socket.value = new WebSocket("ws://127.0.0.1:8000/ws/notifications/");

            // When WebSocket connection is established
            socket.value.onopen = () => {
                console.log("WebSocket connection established.");
            };

            // Handle incoming messages (e.g., a new transaction)
            socket.value.onmessage = handleMessage;

            // Handle any WebSocket errors
            socket.value.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            // When the WebSocket connection is closed
            socket.value.onclose = () => {
                console.log("WebSocket connection closed.");
            };
        });

        // Clean up WebSocket connection when component is destroyed
        onBeforeUnmount(() => {
        if (socket.value) {
            socket.value.close();  // Close WebSocket when the component is unmounted
        }
        });

        onBeforeMount(()=>{ 
            store.dispatch('Items_Catalog/updateState', { lineItemsArray: []})
            updateFormFields();
            flex_basis.value = '1/6';
            flex_basis_percentage.value = '20';
        })
        // onMounted(async()=>{
        //     fetchDefaultSettings();
        //     fetchTaxes();
        //     if(defaultOutlet.value != null && defaultStockType.value != null){
        //         fetchItems(defaultStockType.value)
        //     }

        // });


        return{
            formFields, flex_basis, flex_basis_percentage, displayButtons, createSaleReceipt, mainComponentKey,showTotals,
            handleReset, loader, showLoader, hideLoader, tableKey, itemColumns, itemRows, showActions, actions, deleteItemLine, idField,
            title, modal_loader, modal_left, modal_top, modal_width, showModalLoader, hideModalLoader,rightsModule,balance,depModalVisible
        }
    }
})
</script>