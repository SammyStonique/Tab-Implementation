<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveInventoryItem" @handleReset="handleReset"> 
                    <template v-slot:additional-content>
                        <div class="border border-slate-200 rounded relative py-3 mt-3 px-2 flex">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Purchase & Sale Details</h1>
                            <div class="px-3">
                                <DynamicForm :fields="additionalFields1" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" @handleReset="handleReset"/>
                            </div>
                        </div>
                        <div class="border border-slate-200 rounded relative py-3 mt-3 px-2 flex">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Lead Time Details</h1>
                            <div class="px-3">
                                <DynamicForm :fields="additionalFields" :flex_basis="additional_flex_basis" :flex_basis_percentage="additional_flex_basis_percentage" @handleReset="handleReset"/>
                            </div>
                        </div>
                        
                        <div class="border border-slate-200 rounded relative py-3 mt-3 px-2 flex">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Stock Tracking</h1>
                            <div class="px-3">
                                <DynamicForm :fields="additionalFields2" :flex_basis="additional_flex_basis" :flex_basis_percentage="additional_flex_basis_percentage" @handleReset="handleReset"/>
                            </div>
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
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useDateFormatter } from '@/composables/DateFormatter';
import { useToast } from "vue-toastification";

export default defineComponent({
    name: 'Item_Details',
    components:{
        PageStyleComponent, DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const mainComponentKey = ref(0);
        const componentKey = ref(0);
        const uomComponentKey = ref(0);
        const venComponentKey = ref(0);
        const catComponentKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const displayButtons = ref(true);
        const isEditing = computed(()=> store.state.Items_Catalog.isEditing);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const selectedItem = computed(()=> store.state.Items_Catalog.selectedItem);
        const selectedCategory = computed(()=> store.state.Items_Catalog.selectedCategory);
        const selectedUom = computed(()=> store.state.Items_Catalog.selectedUom);
        const selectedVendor = computed(()=> store.state.Items_Catalog.selectedVendor);
        const categoryArray = computed(() => store.state.Item_Categories.categoryArr);
        const vendorArray = computed(() => store.state.Vendors.vendorArr);
        const uomArray = computed(() => store.state.Uom.uomArr);
        const categoryID = ref('');
        const uomID = ref('');
        const vendorID = ref('');
        const purchase_price = ref(0);
        const selling_markup = ref(0);
        const calculated_selling_price = ref(0);
        const computed_purchase_price = computed(() =>{ return purchase_price.value});
        const computed_selling_markup = computed(() =>{ return selling_markup.value});
        const computed_selling_price = computed(() =>{ return calculated_selling_price.value});

        const fetchCategories = async() =>{
            await store.dispatch('Item_Categories/fetchItemCategories', {company:companyID.value});
        };
        const handleSelectedCategory = async(option) =>{
            await store.dispatch('Item_Categories/handleSelectedCategory', option)
            categoryID.value = store.state.Item_Categories.categoryID;
            if(selectedItem.value){
                selectedItem.value.item_category.item_category_id = categoryID.value;
                categoryValue.value = categoryID.value
            }
        }
        const clearSelectedCategory = async() =>{
            await store.dispatch('Item_Categories/updateState', {categoryID: ''});
            categoryID.value = store.state.Item_Categories.categoryID;
        }
        const fetchUoms = async() =>{
            await store.dispatch('Uom/fetchUoms', {company:companyID.value});
        };
        const handleSelectedUom = async(option) =>{
            await store.dispatch('Uom/handleSelectedUom', option)
            uomID.value = store.state.Uom.uomID;
            if(selectedItem.value){
                selectedItem.value.unit_of_measure.uom_id = uomID.value;
                uomValue.value = uomID.value
            }
        };
        const clearSelectedUom = async() =>{
            await store.dispatch('Uom/updateState', {uomID: ''});
            uomID.value = store.state.Uom.uomID;
        }
        const fetchVendors = async() =>{
            await store.dispatch('Vendors/fetchVendors', {company:companyID.value});
        };
        const handleSelectedVendor = async(option) =>{
            await store.dispatch('Vendors/handleSelectedVendor', option)
            vendorID.value = store.state.Vendors.vendorID;
            if(selectedItem.value && selectedItem.value.preferred_vendor != null){
                selectedItem.value.preferred_vendor.vendor_id = vendorID.value;
                vendorValue.value = vendorID.value
            }
        };
        const clearSelectedVendor = async() =>{
            await store.dispatch('Vendors/updateState', {vendorID: ''});
            vendorID.value = store.state.Vendors.vendorID;
        }
        const formFields = ref([]);
        const categoryValue = computed(() => {
           return (selectedItem.value && selectedItem.value.item_category && !categoryID.value) ? selectedItem.value.item_category.item_category_id : categoryID.value;

        });
        const uomValue = computed(() => {
            return (selectedItem.value && selectedItem.value.unit_of_measure && !uomID.value) ? selectedItem.value.unit_of_measure.uom_id : uomID.value;
        });
        const vendorValue = computed(() => {
            return (selectedItem.value && selectedItem.value.preferred_vendor && !vendorID.value) ? selectedItem.value.preferred_vendor.vendor_id : vendorID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Category", value: categoryValue.value, componentKey: catComponentKey,
                    selectOptions: categoryArray, optionSelected: handleSelectedCategory, required: true,
                    searchPlaceholder: 'Select Category...', dropdownWidth: '280px', updateValue: selectedCategory.value,
                    fetchData: fetchCategories(), clearSearch: clearSelectedCategory()
                },
                { type: 'text', name: 'item_code',label: "Code", value: selectedItem.value?.item_code || '', required: true },
                { type: 'text', name: 'item_name',label: "Name", value: selectedItem.value?.item_name || '', required: true },
                { type: 'dropdown', name: 'stock_type',label: "Stock Type", value: selectedItem.value?.stock_type || '', placeholder: "", required: true, options: [{ text: 'Stocked', value: 'Stocked'}, { text: 'Serialized', value: 'Serialized'},{ text: 'Non Stocked', value: 'Non Stocked'}, { text: 'Service', value: 'Service'}] },
                { type: 'dropdown', name: 'inventory_type',label: "Inventory Type", value: selectedItem.value?.inventory_type || '', placeholder: "", required: true, options: [{ text: 'Sale Item', value: 'Sale Item'}, { text: 'Non Sale Item', value: 'Non Sale Item'}] },
                { type: 'text', name: 'specification',label: "Specification", value: selectedItem.value?.specification || '', required: false },             
                { type: 'text', name: 'brand',label: "Brand", value: selectedItem.value?.brand || '', required: false },
                { type: 'text', name: 'serial_number',label: "Serial Number", value: selectedItem.value?.serial_number || '', required: false },
                { type: 'dropdown', name: 'valuation_type',label: "Valuation Type", value: selectedItem.value?.valuation_type || '', placeholder: "", required: true, options: [{ text: 'Last In First Out', value: 'LIFO'}, { text: 'First In First Out', value: 'FIFO'}] },
                {  
                    type:'search-dropdown', label:"Uom", value: uomValue.value, componentKey: uomComponentKey,
                    selectOptions: uomArray, optionSelected: handleSelectedUom, required: true,
                    searchPlaceholder: 'Select Uom...', dropdownWidth: '280px', updateValue: selectedUom.value,
                    fetchData: fetchUoms(), clearSearch: clearSelectedUom()
                },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].type == 'number'){
                    formFields.value[i].value = 0;
                }else{
                    formFields.value[i].value = '';
                }
            }
            vendorID.value = '';
            uomID.value = '';
            categoryID.value = '';
            venComponentKey.value += 1;
            catComponentKey.value += 1;
            uomComponentKey.value += 1;
            for(let i=0; i < additionalFields.value.length; i++){
                if(additionalFields.value[i].type == 'number'){
                    additionalFields.value[i].value = 0;
                }else{
                    additionalFields.value[i].value = '';
                }
            }
            for(let i=0; i < additionalFields1.value.length; i++){
                if(additionalFields1.value[i].type == 'number'){
                    additionalFields1.value[i].value = 0;
                }else{
                    additionalFields1.value[i].value = '';
                }
            }
            for(let i=0; i < additionalFields2.value.length; i++){
                if(additionalFields2.value[i].type == 'number'){
                    additionalFields2.value[i].value = 0;
                }else{
                    additionalFields2.value[i].value = '';
                }
            }
        }

        watch([selectedItem, selectedCategory, selectedUom], () => {
            if (selectedItem.value && selectedCategory.value && selectedUom.value) {
                catComponentKey.value += 1;
                uomComponentKey.value += 1;
                updateFormFields();
            }else if(selectedItem.value){
                updateFormFields();
            }
        }, { immediate: true });

        const additionalFields = ref([]);
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                { type: 'number', name: 'order_lead_time',label: "Order Lead Time", value: selectedItem.value?.order_lead_time || 0, required: false },
                { type: 'number', name: 'delivery_lead_time',label: "Delivery Lead Time", value: selectedItem.value?.delivery_lead_time || 0, required: false },
                { type: 'number', name: 'handling_lead_time',label: "Handling Lead Time", value: selectedItem.value?.handling_lead_time || 0, required: false },
            ];
        };
        const calculateSellingPrice = (value) =>{
            additionalFields1.value[2].value = additionalFields1.value[0].value + ((value/100) * additionalFields1.value[0].value);
        };
        const additionalFields1 = ref([]);
        const updateAdditionalFormFields1 = () => {
            additionalFields1.value = [
                { type: 'number', name: 'default_purchase_price',label: "Purchase Price", value: selectedItem.value?.default_purchase_price || purchase_price.value, required: false },
                { type: 'number', name: 'selling_markup',label: "Mark Up(%)", value: selectedItem.value?.selling_markup || selling_markup.value, required: false, method: calculateSellingPrice},
                { type: 'number', name: 'default_selling_price',label: "Selling Price", value: selectedItem.value?.default_selling_price || computed_selling_price.value, required: false },
                { type: 'number', name: 'wholesale_selling_price',label: "Wholesale Price", value: selectedItem.value?.wholesale_selling_price || 0, required: false },
                { type: 'number', name: 'wholesale_markup',label: "Mark Up(%)", value: selectedItem.value?.wholesale_markup || 0, required: false },
                { type: 'number', name: 'wholesale_quantity',label: "Wholesale Quantity", value: selectedItem.value?.wholesale_quantity || 0, required: false },
                {  
                    type:'search-dropdown', label:"Prefered Vendor", value: vendorValue.value, componentKey: venComponentKey,
                    selectOptions: vendorArray, optionSelected: handleSelectedVendor, required: false,
                    searchPlaceholder: 'Select Prefered Vendor...', dropdownWidth: '390px', updateValue: selectedVendor.value,
                    fetchData: fetchVendors(), clearSearch: clearSelectedVendor()
                },
                {required: false},
                {required: false},
            ];
        };

        const additionalFields2 = ref([]);
        const updateAdditionalFormFields2 = () => {
            additionalFields2.value = [
                { type: 'number', name: 'stock_min_level',label: "Stock Min Level", value: selectedItem.value?.stock_min_level || 0, required: false },
                { type: 'number', name: 'stock_max_level',label: "Stock Max Level", value: selectedItem.value?.stock_max_level || 0, required: false },
                { type: 'number', name: 'reorder_level',label: "Reorder Level", value: selectedItem.value?.reorder_level || 0, required: false },
                { type: 'number', name: 'shelf_life',label: "Shelf Life", value: selectedItem.value?.shelf_life || 0, required: false },
            ];
        };
        watch([selectedItem, selectedVendor], () => {
            if(selectedItem.value  && selectedVendor.value){
                venComponentKey.value += 1;
                updateAdditionalFormFields();
                updateAdditionalFormFields1();
                updateAdditionalFormFields2();
            }else if(selectedItem.value){
                updateAdditionalFormFields();
                updateAdditionalFormFields1();
                updateAdditionalFormFields2();
            }          
        }, { immediate: true });
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createInventoryItem = async() =>{
            showLoader();
            let formData = {
                item_name: formFields.value[2].value,
                item_category: categoryValue.value,
                item_category_id: categoryValue.value,
                item_code: formFields.value[1].value,
                inventory_type: formFields.value[4].value,
                valuation_type: formFields.value[8].value,
                stock_type: formFields.value[3].value,
                specification: formFields.value[5].value,
                brand: formFields.value[6].value,
                serial_number: formFields.value[7].value,
                unit_of_measure: uomValue.value,
                unit_of_measure_id: uomValue.value,
                default_purchase_price: additionalFields1.value[0].value,
                default_selling_price: additionalFields1.value[2].value,
                selling_markup: additionalFields1.value[1].value,
                wholesale_selling_price: additionalFields1.value[3].value,
                wholesale_quantity: additionalFields1.value[5].value,
                wholesale_markup: additionalFields1.value[4].value,
                preferred_vendor: vendorValue.value,
                preferred_vendor_id: vendorValue.value,
                stock_min_level: additionalFields2.value[0].value,
                stock_max_level: additionalFields2.value[1].value,
                shelf_life: additionalFields2.value[3].value,
                reorder_level: additionalFields2.value[2].value,
                order_lead_time: additionalFields.value[0].value,
                handling_lead_time: additionalFields.value[2].value,
                delivery_lead_time: additionalFields.value[1].value,
                // image: "",
                company: companyID.value
            }

            errors.value = [];
            for(let i=1; i < (formFields.value.length - 1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(categoryValue.value == '' || uomValue.value == ''){
                errors.value.push('Error');
            }
            for(let i=0; i < additionalFields.value.length; i++){
                if(additionalFields.value[i].value =='' && additionalFields.value[i].required == true){
                    errors.value.push(additionalFields.value[i].label);
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }else{            
                try {
                    const response = await store.dispatch('Items_Catalog/createInventoryItem', formData);
                    if (response && response.status === 200) {
                        hideLoader();
                        toast.success('Item created successfully!');
                        handleReset();
                        mainComponentKey.value += 1;
                        venComponentKey.value += 1;
                        catComponentKey.value += 1;
                        uomComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the item.');
                        hideLoader();
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create item: ' + error.message);
                } finally {
                    hideLoader();
                }              
            }
        }

        const updateInventoryItem = async() => {
            showLoader();
            errors.value = [];
            for(let i=2; i < (formFields.value.length -1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            for(let i=0; i < additionalFields.value.length; i++){
                if(additionalFields.value[i].value =='' && additionalFields.value[i].required == true){
                    errors.value.push(additionalFields.value[i].label);
                }
            }
            if(uomValue.value == '' || categoryValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
                    hideLoader();
            }else{
                const updatedItem = {
                    inventory_item: selectedItem.value.inventory_item_id,
                    item_name: formFields.value[2].value,
                    item_category: categoryValue.value,
                    item_category_id: categoryValue.value,
                    item_code: formFields.value[1].value,
                    inventory_type: formFields.value[4].value,
                    valuation_type: formFields.value[8].value,
                    stock_type: formFields.value[3].value,
                    specification: formFields.value[5].value,
                    brand: formFields.value[6].value,
                    serial_number: formFields.value[7].value,
                    unit_of_measure: uomValue.value,
                    unit_of_measure_id: uomValue.value,
                    default_purchase_price: additionalFields1.value[0].value,
                    default_selling_price: additionalFields1.value[2].value,
                    selling_markup: additionalFields1.value[1].value,
                    wholesale_selling_price: additionalFields1.value[3].value,
                    wholesale_quantity: additionalFields1.value[5].value,
                    wholesale_markup: additionalFields1.value[4].value,
                    preferred_vendor: vendorValue.value,
                    preferred_vendor_id: vendorValue.value,
                    stock_min_level: additionalFields2.value[0].value,
                    stock_max_level: additionalFields2.value[1].value,
                    shelf_life: additionalFields2.value[3].value,
                    reorder_level: additionalFields2.value[2].value,
                    order_lead_time: additionalFields.value[0].value,
                    handling_lead_time: additionalFields.value[2].value,
                    delivery_lead_time: additionalFields.value[1].value,
                    // image: "",
                    company: companyID.value
                };

                try {
                        const response = await store.dispatch('Items_Catalog/updateInventoryItem', updatedItem);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Item updated successfully!');
                            handleReset();
                            uomComponentKey.value += 1;
                            venComponentKey.value += 1;
                            catComponentKey.value += 1;
                            mainComponentKey.value += 1;
                            store.dispatch('Item_Categories/updateState',{categoryID:''})
                            store.dispatch('Vendors/updateState',{vendorID:''})
                            store.dispatch('Uom/updateState',{uomID:''})
                            store.dispatch("Items_Catalog/updateState",{selectedItem:null,selectedCategory:null,selectedUom:null,selectedVendor:null})
                        } else {
                            toast.error('An error occurred while updating the item.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to update item: ' + error.message);
                    } finally {
                        hideLoader();
                    }
            }                    
        };

        const saveInventoryItem = () =>{
            if(isEditing.value == true){
                updateInventoryItem();
            }else{
                createInventoryItem();
            }
        }
        
        onBeforeMount(()=>{ 
            updateFormFields();
            updateAdditionalFormFields();
            updateAdditionalFormFields1();
            updateAdditionalFormFields2();
            venComponentKey.value += 1;
            catComponentKey.value += 1;
            uomComponentKey.value += 1;
            flex_basis.value = '1/6';
            flex_basis_percentage.value = '20';
            additional_flex_basis.value = '1/5';
            additional_flex_basis_percentage.value = '25';
        })
        onMounted(()=>{

        })

        return{
            componentKey, formFields, additionalFields, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, displayButtons, saveInventoryItem, mainComponentKey,additionalFields1,
            handleReset, isEditing, loader, showLoader, hideLoader,additionalFields2
        }
    }
})
</script>