<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm :saveButtonLabel="saveButtonLabel"  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="savePurchaseOrder" @handleReset="handleReset"> 
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
import DynamicTable from '@/components/INV/DynamicTable.vue';

export default defineComponent({
    name: 'Purchase_Order_Details',
    components:{
        PageStyleComponent, DynamicForm, DynamicTable, MovableModal
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const rightsModule = ref('Inventory');
        const saveButtonLabel = computed(()=> store.state.Direct_Purchases.saveButtonLabel);
        const current_date = new Date();
        const loader = ref('none');
        const modal_loader = ref('none');
        const tableKey = ref(0);
        const mainComponentKey = ref(0);
        const custComponentKey = ref(0);
        const outComponentKey = ref(0);
        const chanComponentKey = ref(0);
        const itemComponentKey = ref(0);
        const receipt_totals = ref(0);
        const receiptTotals = ref(0);
        const discountTotals = ref(0);
        const tax_totals = ref(0);
        const purchaseItemsArray = ref([]);
        const title = ref('Add Prepayment');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const selectedOutlet = computed(()=> store.state.Direct_Purchases.selectedOutlet);
        const selectedPurchase = computed(()=> store.state.Direct_Purchases.selectedPurchase);
        const selectedVendor = computed(()=> store.state.Direct_Purchases.selectedVendor);
        const isEditing = computed(()=> store.state.Direct_Purchases.isEditing);
        const isDelivering = computed(()=> store.state.Direct_Purchases.isDelivering);
        const displayButtons = ref(true);
        const showActions = ref(true);
        const idField = ref('');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const itemID = ref('');
        const outletID = ref(null);
        const itemArray = computed(() => store.state.Items_Catalog.itemsArr);
        const outletArray = computed(() => store.state.Retail_Outlets.outletArr);
        const vendorArray = computed(() => store.state.Vendors.vendorArr);
        const vendorID = ref(null);
        const itemRows = computed(() => store.state.Items_Catalog.lineItemsArray);
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
        const fetchVendors = async() =>{
            await store.dispatch('Vendors/fetchVendors', {company:companyID.value})
        };

        const fetchAllItems = async() =>{
            await store.dispatch('Items_Catalog/fetchInventoryItems', {company:companyID.value})
        };
        const fetchItems = async(stock_type) =>{
            await store.dispatch('Items_Catalog/fetchInventoryItems', {company:companyID.value})
        };
        const fetchOutlets = async() =>{
            await store.dispatch('Retail_Outlets/fetchOutlets', {company:companyID.value})
        };
        watch([outletID,], () => {
            
        }, { immediate: true });
        const handleSelectedOutlet = async(option) =>{
            await store.dispatch('Retail_Outlets/handleSelectedOutlet', option)
            outletID.value = store.state.Retail_Outlets.outletID;
        };
        const handleSelectedVendor = async(option) =>{
            await store.dispatch('Vendors/handleSelectedVendor', option)
            vendorID.value = store.state.Vendors.vendorID;
        };
        const handleSelectedItem = async(option) =>{
            await store.dispatch('Items_Catalog/handleSelectedPurchaseItem', option)
            itemID.value = store.state.Items_Catalog.itemID;
            itemComponentKey.value += 1;
        };
        const clearSelectedOutlet = async() =>{
            await store.dispatch('Retail_Outlets/updateState', {outletID: ''});
            outletID.value = ""
        };
        const clearSelectedVendor = async() =>{
            await store.dispatch('Vendors/updateState', {vendorID: ''});
            vendorID.value = ""
        };

        const fetchInventoryItems = (value) =>{
            itemComponentKey.value += 1;
            fetchItems(value);
        };

        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                { type: 'date', name: 'issue_date',label: "Date", value: selectedPurchase.value?.date || formatDate(current_date), required: true, maxDate: formatDate(current_date) },                
                {
                    type:'search-dropdown', label:"Outlet", value: outletID.value, componentKey: outComponentKey,
                    selectOptions: outletArray, optionSelected: handleSelectedOutlet, required: true,
                    searchPlaceholder: 'Select Outlet...', dropdownWidth: '500px', updateValue: selectedOutlet.value,
                    fetchData: fetchOutlets(), clearSearch: clearSelectedOutlet()  
                },
                {
                    type:'search-dropdown', label:"Vendor", value: vendorID.value, componentKey: custComponentKey,
                    selectOptions: vendorArray, optionSelected: handleSelectedVendor, required: true,
                    searchPlaceholder: 'Select Vendor...', dropdownWidth: '500px', updateValue: selectedVendor.value,
                    fetchData: fetchVendors(), clearSearch: clearSelectedVendor()  
                },
                {
                    type:'search-dropdown', label:"Item", value: itemID.value, componentKey: itemComponentKey,
                    selectOptions: itemArray, optionSelected: handleSelectedItem, required: false,
                    searchPlaceholder: 'Select Item...', dropdownWidth: '500px', updateValue: "",
                    // fetchData: fetchItems(), clearSearch: clearSelectedItem()  
                },    
            ]
        };

        watch([selectedPurchase,selectedVendor], () => {
            if(selectedPurchase.value && selectedVendor.value){
                custComponentKey.value += 1; 
                updateFormFields();
            }
            
        }, { immediate: true });

        const handleReset = () =>{
            store.dispatch('Items_Catalog/updateState', { lineItemsArray: []})
            mainComponentKey.value += 1;
            formFields.value[0].value = formatDate(current_date);
            receipt_totals.value = 0;
            receiptTotals.value = 0;
            discountTotals.value = 0;
            tax_totals.value = 0;
            custComponentKey.value += 1;
            vendorID.value = null;
        }

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createPurchaseOrder = async() =>{
            showLoader();
            purchaseItemsArray.value = [];
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
                    purchaseItemsArray.value.push(purchaseItem);
                    
                }else{
                    let purchaseItem ={
                        "date": formFields.value[0].value,
                        "inventory_item": itemRows.value[i].item,
                        "adjusted_stock": itemRows.value[i].quantity,
                        "batch_before_sale": itemRows.value[i].quantity,
                        "batch_count": itemRows.value[i].batch_count,
                        "discount": itemRows.value[i].discount,
                        "tax": parseFloat(itemRows.value[i].vat_amount),
                        "item_total": itemRows.value[i].total_amount,
                        "batch_after_sale": itemRows.value[i].quantity,
                        "purchase_price": parseFloat(itemRows.value[i].cost),
                        "selling_price": parseFloat(itemRows.value[i].selling_price),
                        "quantity": itemRows.value[i].quantity,
                        "tax_type": "",
                        "tax_inclusivity": "",
                    } 
                    purchaseItemsArray.value.push(purchaseItem);
                }
            }

            let formData = {
                outlet: outletID.value,
                notes: "",
                date: formFields.value[0].value,
                purchase_items_array: purchaseItemsArray.value,
                total_amount: receiptTotals.value,
                sale_type: "Credit",
                sale_delivery: "Not Delivered",
                vendor: vendorID.value,
                tax: tax_totals.value,
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
            if(outletID.value == '' || vendorID.value == ''){
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
                }
                else{            
                    try {
                        const response = await store.dispatch('Direct_Purchases/createPurchaseOrder', formData);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Purchase Order created successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                        } else {
                            toast.error('An error occurred while creating the Purchase Order.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to create Purchase Order: ' + error.message);
                    } finally {
                        hideLoader();
                    }              
                }
            }
            
        }
        const updatePurchaseOrder = async() =>{
            showLoader();
            purchaseItemsArray.value = [];
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
                        "item_batch_id": itemRows.value[i].item_batch_id,
                        "date": formFields.value[0].value,
                        "inventory_item": itemRows.value[i].item,
                        "adjusted_stock": itemRows.value[i].quantity,
                        "batch_before_sale": itemRows.value[i].quantity,
                        "batch_count": itemRows.value[i].batch_count,
                        "discount": itemRows.value[i].discount,
                        "tax": parseFloat(itemRows.value[i].vat_amount),
                        "item_total": itemRows.value[i].total_amount,
                        "batch_after_sale": itemRows.value[i].quantity,
                        "purchase_price": parseFloat(itemRows.value[i].purchase_price),
                        "selling_price": parseFloat(itemRows.value[i].selling_price),
                        "quantity": itemRows.value[i].quantity,
                        "tax_type": itemRows.value[i].vat_rate.tax_id,
                        "tax_inclusivity": itemRows.value[i].vat_inclusivity,
                    }        
                    purchaseItemsArray.value.push(purchaseItem);
                    
                }else{
                    let purchaseItem ={
                        "item_batch_id": itemRows.value[i].item_batch_id,
                        "date": formFields.value[0].value,
                        "inventory_item": itemRows.value[i].item,
                        "adjusted_stock": itemRows.value[i].quantity,
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
                    purchaseItemsArray.value.push(purchaseItem);
                }
            }

            let formData = {
                sale_order: selectedPurchase.value.sale_id,
                outlet_counter: null,
                outlet: outletID.value != null ? outletID.value : selectedPurchase.value.outlet_id,
                notes: "",
                date: formFields.value[0].value,
                sale_items_array: purchaseItemsArray.value,
                total_amount: receiptTotals.value,
                sale_type: "Credit",
                sale_delivery: "Not Delivered",
                vendor: (vendorID.value == "") ? selectedPurchase.value.client_id : vendorID.value ,
                tax: tax_totals.value,
                discount: discountTotals.value,
                company: companyID.value,
                user: userID.value,
            }

            console.log("THE FORM DATA IS ",formData)
       
            errors.value = [];
            for(let i=0; i < formFields.value.length ; i++){
                if(formFields.value[i].type != "search-dropdown" && formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(outletID.value == '' || (vendorID.value == '' && selectedPurchase.value.client_id == "")){
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
                }
                else{            
                    try {
                        const response = await store.dispatch('Direct_Purchases/updatePurchaseOrder', formData);
                        // const response = "";
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Purchase Order updated successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                            await store.dispatch('Direct_Purchases/updateState', {selectedVendor: null})
                        } else {
                            toast.error('An error occurred while updating the Purchase Order.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to update Purchase Order: ' + error.message);
                    } finally {
                        hideLoader();
                    }              
                }
            }
            
        }
        const receivePurchaseOrder = async() =>{
            showLoader();
            purchaseItemsArray.value = [];
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
                        "item_batch_id": itemRows.value[i].item_batch_id,
                        "date": formFields.value[0].value,
                        "inventory_item": itemRows.value[i].item,
                        "stock_at_hand": itemRows.value[i].stock_at_hand,
                        "adjusted_stock": itemRows.value[i].quantity,
                        "batch_before_sale": itemRows.value[i].stock_after_adjustment,
                        "batch_count": itemRows.value[i].batch_count,
                        "discount": itemRows.value[i].discount,
                        "tax": parseFloat(itemRows.value[i].vat_amount),
                        "profit": itemRows.value[i].item_sales_income,
                        "item_total": itemRows.value[i].total_amount,
                        "batch_after_sale": itemRows.value[i].available_batch_count - itemRows.value[i].quantity,
                        "purchase_price": parseFloat(itemRows.value[i].purchase_price),
                        "selling_price": parseFloat(itemRows.value[i].selling_price),
                        "quantity": itemRows.value[i].stock_after_adjustment,
                        "tax_type": itemRows.value[i].vat_rate.tax_id,
                        "tax_inclusivity": itemRows.value[i].vat_inclusivity,
                        "output_vat_id": itemRows.value[i].vat_rate.tax_output_account.ledger_id
                    }        
                    purchaseItemsArray.value.push(purchaseItem);
                    
                }else{
                    let purchaseItem ={
                        "item_batch_id": itemRows.value[i].item_batch_id,
                        "date": formFields.value[0].value,
                        "inventory_item": itemRows.value[i].item,
                        "stock_at_hand": itemRows.value[i].stock_at_hand,
                        "adjusted_stock": itemRows.value[i].quantity,
                        "batch_before_sale": itemRows.value[i].stock_after_adjustment,
                        "batch_count": itemRows.value[i].batch_count,
                        "discount": itemRows.value[i].discount,
                        "tax": itemRows.value[i].vat_amount,
                        "profit": itemRows.value[i].item_sales_income,
                        "item_total": itemRows.value[i].total_amount,
                        "batch_after_sale": itemRows.value[i].available_batch_count - itemRows.value[i].quantity,
                        "purchase_price": parseFloat(itemRows.value[i].purchase_price),
                        "selling_price": parseFloat(itemRows.value[i].selling_price),
                        "quantity": itemRows.value[i].stock_after_adjustment,
                        "tax_type": "",
                        "tax_inclusivity": "",
                        "output_vat_id": ""
                    } 
                    purchaseItemsArray.value.push(purchaseItem);
                }
            }

            let formData = {
                outlet: outletID.value,
                notes: "",
                date: formFields.value[0].value,
                sale_items_array: purchaseItemsArray.value,
                total_amount: receiptTotals.value,
                sale_type: "Credit",
                sale_delivery: "Not Delivered",
                vendor: vendorID.value,
                tax: tax_totals.value,
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
            if(outletID.value == '' || vendorID.value == ''){
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
                }
                else{            
                    try {
                        const response = await store.dispatch('Direct_Purchases/createPurchaseOrder', formData);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Purchase Order created successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                        } else {
                            toast.error('An error occurred while creating the Purchase Order.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to create Purchase Order: ' + error.message);
                    } finally {
                        hideLoader();
                    }              
                }
            }
            
        }
        const savePurchaseOrder = () =>{
            if(isEditing.value){
                updatePurchaseOrder();
            }else if(isDelivering.value){
                receivePurchaseOrder();
            }else{
                createPurchaseOrder();
            }
        }

        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const fetchDefaultSettings = async() =>{
            await store.dispatch('Default_Settings/fetchDefaultSettings', {company:companyID.value})
        };
        onBeforeMount(()=>{ 
            store.dispatch('Ledgers/updateState', { invoiceItemsArray: []})
            updateFormFields();
            flex_basis.value = '1/5';
            flex_basis_percentage.value = '20';
        })
        onMounted(async()=>{
            fetchDefaultSettings();
            fetchTaxes();
            fetchItems();
            if(isEditing.value == false){
                formFields.value[0].value = formatDate(current_date);
            }
        })

        return{
            saveButtonLabel,formFields, flex_basis, flex_basis_percentage, displayButtons, savePurchaseOrder, mainComponentKey,showTotals,
            handleReset, loader, showLoader, hideLoader, tableKey, itemColumns, itemRows, showActions, actions, deleteItemLine, idField,
            title, modal_loader, modal_left, modal_top, modal_width, showModalLoader, hideModalLoader,rightsModule
        }
    }
})
</script>