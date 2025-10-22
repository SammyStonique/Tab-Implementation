<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="createProductionBatch" @handleReset="handleReset"> 
                    <template v-slot:additional-content>                    
                        <div class="border border-slate-400 rounded px-3 min-h-[220px] mb-4">
                            <DynamicTable :key="tableKey" :columns="itemColumns" :rows="itemRows" :showActions="showActions" :showTotals="showTotals" :idField="idField" :actions="actions" @action-click="deleteIngredient"/>
                        </div>
                        
                        <div class="flex">
                            <div class="basis-1/3">
                                <label for="" class="font-bold uppercase text-red-500 text-sm">Item Production Cost: </label>
                                <input v-model="itemProdCost"  type="number" pattern="^\d+(\.\d{0,2})?$" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\.\d{2})\d+/g, '$1')" :class="[`bg-slate-50 rounded pl-3 border border-gray-400 font-bold w-40`]"/>
                            </div>
                            <div class="basis-1/6">
                                <label for="" class="font-bold uppercase text-black-500 text-sm">Markup(%): </label>
                                <input v-model="sellingMarkup" @change="calculateSellingPrice($event)"  type="number" pattern="^\d+(\.\d{0,2})?$" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\.\d{2})\d+/g, '$1')" :class="[`bg-slate-50 rounded pl-3 border border-gray-400 font-bold w-24`]"/>
                            </div>
                            <div class="basis-1/4">
                                <label for="" class="font-bold uppercase text-green-500 text-sm">Item Selling Price: </label>
                                <input v-model="prodSellingPrice"  type="number" pattern="^\d+(\.\d{0,2})?$" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\.\d{2})\d+/g, '$1')" :class="[`bg-slate-50 rounded pl-3 border border-gray-400 font-bold w-40`]"/>
                            </div>
                            <div class="basis-1/3">
                                <input v-model="updateSellingPrice" @change="checkboxSelection($event)"  type="checkbox" :class="`checkbox h-4 w-4`"/>
                                <label class="min-w-[150px] text-sm"  for="">Update Selling Price for All Batches</label>
                            </div>
                        </div>
                        <div class="flex">
                            <div class="basis-3/4 text-left min-h-[150px] mb-16">
                                <label class="font-bold">Notes :</label><br />
                                <quill-editor :key="editorComponentKey" v-model:value="templateContent"></quill-editor>
                            </div>
                            <div class="basis-1/4 align-items-center pt-24">
                                <label for="" class="font-bold uppercase text-red-500 text-sm">Total Production Cost: </label>
                                <input v-model="productionCost" :disabled=true type="number" pattern="^\d+(\.\d{0,2})?$" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\.\d{2})\d+/g, '$1')" :class="[`bg-slate-50 rounded pl-3 border border-gray-400 font-bold w-40`]"/>
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
import MovableModal from '@/components/MovableModal.vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import DynamicTable from '@/components/INV/DynamicTable.vue';
import { quillEditor } from 'vue3-quill'

export default defineComponent({
    name: 'Production_Details',
    components:{
        PageStyleComponent, DynamicForm, DynamicTable, MovableModal,quillEditor
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
        const ledComponentKey = ref(0);
        const rcpComponentKey = ref(0);
        const itemComponentKey = ref(0);
        const editorComponentKey = ref(0);
        const outComponentKey = ref(0);
        const templateContent = ref('');
        const ingredientsArr = ref([]);
        const title = ref('');
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
        const itemID = ref('');
        const recipeID = ref('');
        const outletID = ref('');
        const productionCost = ref(0);
        const itemProdCost = ref(0);
        const sellingMarkup = ref(0);
        const prodSellingPrice = ref(0);
        const updateSellingPrice = ref(false);
        const baseQuantity = ref(0);
        const itemArray = computed(() => store.state.Items_Catalog.itemsArr);
        const recipeArray = computed(() => store.state.Recipes.recipeArr);
        const outletArray = computed(() => store.state.Retail_Outlets.outletArr);
        const itemQuantity = computed(() => store.state.Recipes.itemQuantity);
        const itemRows = computed(() => store.state.Items_Catalog.prodIngredientsArray);
        const item_uom = computed(() => store.state.Items_Catalog.item_uom);
        const itemColumns = ref([
            {label: "Item Name", key:"item_name", type: "text", editable: false},
            {label: "Quantity", key: "ingr_quantity", type: "number", editable: true, minWidth:"50px", maxWidth:"50px"},
            {label: "Wastage(%)", key: "ingr_wastage", type: "number", editable: true, minWidth:"50px", maxWidth:"50px"},
            {label: "UOM", key:"uom", type: "text", editable: false,},
            {label: "P.Price", key:"ingr_purchase_price", type: "text", editable: false,},
            {label: "Total", key: "ingr_total_amount", type: "number", editable: false},        
        ]);
        const showTotals = ref(true);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Ingredient', rightName: 'Adding Production Batches'},
        ])

        const deleteIngredient = (rowIndex, action, row) =>{
            store.dispatch('Items_Catalog/removeProdIngredientLine', rowIndex);
        }
        const fetchItems = async() =>{
            await store.dispatch('Items_Catalog/fetchInventoryItems', {company:companyID.value})
        };
        const fetchRecipes = async(item_id) =>{
            await store.dispatch('Recipes/fetchRecipes', {company:companyID.value, inventory_item: item_id})
        };
        const handleSelectedItem = async(option) =>{
            await store.dispatch('Items_Catalog/handleSelectedInventoryItem', option)
            itemID.value = store.state.Items_Catalog.itemID;
            fetchRecipes(itemID.value)
        };
        const clearSelectedItem = () =>{
            itemID.value = '';
            ledComponentKey.value += 1;
        };
        const handleSelectedRecipe = async(option) =>{
            await store.dispatch('Recipes/handleSelectedRecipe', option)
            recipeID.value = store.state.Recipes.recipeID;
            baseQuantity.value = store.state.Recipes.itemQuantity;
            await store.dispatch('Items_Catalog/updateState', {prodIngredientsArray: store.state.Recipes.prodIngredientsArray})
            calculateProductionCost();
        };
        const fetchRetailOutlets = async() =>{
            await store.dispatch('Retail_Outlets/fetchOutlets', {company:companyID.value})
        };
        const handleSelectedOutlet = async(option) =>{
            await store.dispatch('Retail_Outlets/handleSelectedOutlet', option)
            outletID.value = store.state.Retail_Outlets.outletID;  
        };
        const clearSelectedOutlet = async() =>{
            await store.dispatch('Retail_Outlets/updateState', {outletID: ''});
            outletID.value = ""
        }
        const clearSelectedRecipe = () =>{
            recipeID.value = '';
            rcpComponentKey.value += 1;
        };
        const handleSelectedIngredient = async(option) =>{
            if(itemID.value == ''){
                toast.error('Select Production Item First');
                itemComponentKey.value += 1;
                return;
            }
            await store.dispatch('Items_Catalog/handleSelectedProductionIngredient', option)
            itemComponentKey.value += 1;
            calculateProductionCost();
        };
        watch([baseQuantity], () => {
            if(baseQuantity.value > 0){
                formFields.value[5].value = baseQuantity.value;
            }         
        }, { immediate: true });
        
        
        const calculateProductionCost = () =>{
            let totalCost = 0;
            for(let i=0; i<itemRows.value.length; i++){
                totalCost += parseFloat(itemRows.value[i].ingr_total_amount);
            }
            if(formFields.value[7].value){
                totalCost += parseFloat(formFields.value[7].value);
            }
            productionCost.value = totalCost.toFixed(2);
            itemProdCost.value = (productionCost.value / formFields.value[5].value).toFixed(2) ;
        };
        const adjustIngredientQuantities = async() =>{
            let ratio = formFields.value[5].value / baseQuantity.value;
            if(formFields.value[5].value > 0 && itemRows.value.length > 0){
                for(let i=0; i<itemRows.value.length; i++){
                    let baseQuantity = itemRows.value[i].initial_quantity ? itemRows.value[i].initial_quantity : 1;
                    let newQuantity = (baseQuantity * ratio).toFixed(2);
                    itemRows.value[i].ingr_quantity = parseFloat(newQuantity);
                    itemRows.value[i].ingr_total_amount = (newQuantity * itemRows.value[i].ingr_purchase_price).toFixed(2);
                }

            }
            else{
                toast.error('Enter Valid Batch Quantity');                
            }
            calculateProductionCost();
        }
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                {type:'date', label:"Production Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date)},
                {
                    type:'search-dropdown', label:"Production Item", value: itemID.value, componentKey: ledComponentKey,
                    selectOptions: itemArray, optionSelected: handleSelectedItem, required: true,
                    searchPlaceholder: 'Select Item...', dropdownWidth: '300px', updateValue: '',
                    clearSearch: clearSelectedItem()  
                },
                {
                    type:'search-dropdown', label:"Recipe", value: recipeID.value, componentKey: rcpComponentKey,
                    selectOptions: recipeArray, optionSelected: handleSelectedRecipe, required: false,
                    searchPlaceholder: 'Select Recipe...', dropdownWidth: '300px', updateValue: '',
                    clearSearch: clearSelectedRecipe()  
                },
                {
                    type:'search-dropdown', label:"Ingredient", value: "", componentKey: itemComponentKey,
                    selectOptions: itemArray, optionSelected: handleSelectedIngredient, required: true,
                    searchPlaceholder: 'Select Ingredient...', dropdownWidth: '300px', updateValue: "",
                },
                { type: 'dropdown', name: 'product_type',label: "Product Type", value: '', placeholder: "", required: true, options: [{ text: 'Raw Material', value: 'Raw Material'}, { text: 'Final Product', value: 'Final Product'}, { text: 'Both', value: 'Both'}] },
                {type:'number', label:"Batch Quantity", value: 0, required: true, method: adjustIngredientQuantities},
                {type:'text', label:"U.O.M", value: item_uom, required: false, disabled: true},
                {type:'number', label:"Other Production Costs", value: 0, required: false, method: calculateProductionCost},
                {type:'date', label:"Expiry Date", value: null, required: false,},
                {
                    type:'search-dropdown', label:"Outlet", value: outletID.value, componentKey: outComponentKey,
                    selectOptions: outletArray, optionSelected: handleSelectedOutlet, required: true,
                    searchPlaceholder: 'Select Outlet...', dropdownWidth: '400px', updateValue: "",
                    clearSearch: clearSelectedOutlet()  
                },
            ]
        };

        const handleReset = () =>{
            store.dispatch('Items_Catalog/updateState', { item_uom: null, prodIngredientsArray: []})
            store.dispatch('Recipes/updateState', { recipeID: '', prodIngredientsArray: [], itemQuantity: 0})
            mainComponentKey.value += 1;
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].type == 'number'){
                    formFields.value[i].value = 0;
                }            
            }
            itemID.value = '';
            recipeID.value = '';
            outletID.value = '';
            rcpComponentKey.value += 1;
            ledComponentKey.value += 1;
            outComponentKey.value += 1;
            templateContent.value = '';
            productionCost.value = 0;
            sellingMarkup.value = 0;
            updateSellingPrice.value = false;
            prodSellingPrice.value = 0;
            itemProdCost.value = 0;
        }

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        };

        const createProductionBatch = async() =>{
            showLoader();
            ingredientsArr.value = [];

            for(let i=0; i<itemRows.value.length; i++){;
                let rcpItem ={
                    "inventory_item_id": itemRows.value[i].inventory_item_id,
                    "wastage": itemRows.value[i].ingr_wastage,
                    "quantity": itemRows.value[i].ingr_quantity,
                    "price": itemRows.value[i].ingr_total_amount,
                }
                ingredientsArr.value.push(rcpItem)
            }

            let formData = {
                company: companyID.value,
                batch_number: null,
                quantity_produced: formFields.value[5].value,
                inventory_item: itemID.value,
                inventory_item_id: itemID.value,
                recipe: recipeID.value,
                recipe_id: recipeID.value,
                outlet: outletID.value,
                outlet_id: outletID.value,
                production_date: formFields.value[0].value,
                expiry_date: formFields.value[8].value,
                production_cost: productionCost.value,
                other_cost: formFields.value[7].value,
                production_type: formFields.value[4].value,
                ingredients: ingredientsArr.value,
                item_batch_data: [],
                notes: templateContent.value,
                item_production_cost: itemProdCost.value,
                prod_selling_price: prodSellingPrice.value,
                update_selling_price: updateSellingPrice.value,
                selling_mark_up: sellingMarkup.value,
                user: userID.value
            }
  
            errors.value = [];
            if(itemID.value == '' || outletID.value == ''){
                errors.value.push('Error');
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }
            else{   
                try {
                    const response = await store.dispatch('Production_Batches/createProdutionBatch', formData);
                    if (response && response.status === 201) {
                        hideLoader();
                        toast.success('Sucess!');
                        handleReset();
                        mainComponentKey.value += 1;
                        ledComponentKey.value += 1;
                    }else if(response.data.msg == "Unavailable"){
                        toast.error(`${response.data.item} Not In Stock`);
                        hideLoader();
                    }else if(response.data.msg == "Deficit"){
                        toast.error(`${response.data.item} Stock Deficit`);
                        hideLoader();
                    }else {
                        toast.error('An error occurred while creating Batch.');
                        hideLoader();
                    }
                } catch (error) {
                    toast.error('Failed to create Batch: ' + error.message);
                } finally {
                    hideLoader();
                }              
            
            }
            
        };
        const calculateSellingPrice = (event) =>{
            let selectedValue = event.target.value;
            prodSellingPrice.value = parseFloat(itemProdCost.value) + parseFloat((selectedValue/100) * itemProdCost.value);
        };
        const checkboxSelection = (event) => {
            updateSellingPrice.value = event.target.checked;
        };

        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }

        onBeforeMount(()=>{ 
            updateFormFields();
            flex_basis.value = '1/6';
            flex_basis_percentage.value = '20';
        })
        onMounted(()=>{
            fetchItems();
            fetchRetailOutlets();
        })

        return{
            formFields, flex_basis, flex_basis_percentage, displayButtons, createProductionBatch, mainComponentKey,
            handleReset, loader, showLoader, hideLoader, tableKey, itemColumns, itemRows, showActions, actions, deleteIngredient, idField,
            title, modal_loader, modal_left, modal_top, modal_width, showModalLoader, hideModalLoader,
            editorComponentKey, templateContent, showTotals, productionCost, itemProdCost, sellingMarkup, prodSellingPrice, updateSellingPrice,
            calculateSellingPrice, checkboxSelection
        }
    }
})
</script>