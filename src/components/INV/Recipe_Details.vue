<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveRecipe" @handleReset="handleReset"> 
                    <template v-slot:additional-content>                    
                        <div class="border border-slate-400 rounded px-3 min-h-[220px] mb-4">
                            <DynamicTable :key="tableKey" :columns="itemColumns" :rows="itemRows" :showActions="showActions" :showTotals="showTotals" :idField="idField" :actions="actions" @action-click="deleteIngredient"/>
                        </div>
                        <div class="flex">
                            <div class="basis-3/4 text-left min-h-[200px] mb-16">
                                <label class="font-bold">Recipe Instructions :</label><br />
                                <quill-editor :key="editorComponentKey" v-model:value="templateContent"></quill-editor>
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
    name: 'Recipe_Details',
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
        const itemComponentKey = ref(0);
        const editorComponentKey = ref(0);
        const templateContent = ref('');
        const ingredientsArr = ref([]);
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
        const itemID = ref('');
        const itemArray = computed(() => store.state.Items_Catalog.itemsArr);
        const itemRows = computed(() => store.state.Items_Catalog.ingredientsArray);
        const isEditing = computed(() => store.state.Recipes.isEditing);
        const item_uom = computed(() => store.state.Items_Catalog.item_uom);
        const selectedRecipe = computed(() => store.state.Recipes.selectedRecipe);
        const selectedItem = computed(() => store.state.Recipes.selectedItem);
        const itemColumns = ref([
            {label: "Item Name", key:"item_name", type: "text", editable: false},
            {label: "Quantity", key: "ingr_quantity", type: "number", editable: true, minWidth:"50px", maxWidth:"50px"},
            {label: "UOM", key:"uom", type: "text", editable: false,},
            {label: "P.Price", key:"ingr_purchase_price", type: "text", editable: false,},
            {label: "Total", key: "ingr_total_amount", type: "number", editable: false},        
        ]);
        const showTotals = ref(true);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Ingredient', rightName: 'Adding Product Recipe'},
        ])

        const deleteIngredient = (rowIndex, action, row) =>{
            store.dispatch('Items_Catalog/removeIngredientLine', rowIndex);
        }
        const fetchItems = async() =>{
            await store.dispatch('Items_Catalog/fetchInventoryItems', {company:companyID.value})
        };
        const handleSelectedItem = async(option) =>{
            await store.dispatch('Items_Catalog/handleSelectedInventoryItem', option)
            itemID.value = store.state.Items_Catalog.itemID;
        };
        const clearSelectedItem = () =>{
            itemID.value = '';
            ledComponentKey.value += 1;
        };
        const handleSelectedIngredient = async(option) =>{
            if(itemID.value == ''){
                toast.error('Select Recipe Item First');
                itemComponentKey.value += 1;
                return;
            }
            await store.dispatch('Items_Catalog/handleSelectedRecipeIngredient', option)
            itemComponentKey.value += 1;
        };
        const itemValue = computed(() => {
           return (selectedRecipe.value && selectedRecipe.value.inventory_item && !itemID.value) ? selectedRecipe.value.inventory_item.inventory_item_id : itemID.value;

        });
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                {
                    type:'search-dropdown', label:"Recipe Item", value: itemValue.value, componentKey: ledComponentKey,
                    selectOptions: itemArray, optionSelected: handleSelectedItem, required: true,
                    searchPlaceholder: 'Select Item...', dropdownWidth: '400px', updateValue: selectedItem.value,
                    clearSearch: clearSelectedItem()  
                },
                {
                    type:'search-dropdown', label:"Ingredient", value: "", componentKey: itemComponentKey,
                    selectOptions: itemArray, optionSelected: handleSelectedIngredient, required: true,
                    searchPlaceholder: 'Select Ingredient...', dropdownWidth: '400px', updateValue: "",
                },
                {type:'number', label:"Recipe Quantity", value: selectedRecipe.value?.quantity || 0, required: true},
                {type:'text', label:"U.O.M", value: selectedRecipe.value?.uom || item_uom, required: false, disabled: true},
            ]
        };

        const handleReset = () =>{
            store.dispatch('Recipes/updateState', { ingredientsArray: [], selectedRecipe: null, selectedItem: null, isEditing: false})
            store.dispatch('Items_Catalog/updateState', { item_uom: null, ingredientsArray: []})
            mainComponentKey.value += 1;
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].type == 'number'){
                    formFields.value[i].value = 0;
                }            
            }
            itemID.value = '';
            ledComponentKey.value += 1;
            templateContent.value = '';
        }

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        };
        watch([selectedRecipe, selectedItem], () => {
            if(selectedRecipe.value  && selectedItem.value){
                ledComponentKey.value += 1;
                updateFormFields();
                templateContent.value = selectedRecipe.value.instructions || '';
                store.dispatch('Items_Catalog/updateState', {  ingredientsArray: selectedRecipe.value.recipe_ingredients, item_uom: selectedItem.value.uom})
            }         
        }, { immediate: true });
        const createRecipe = async() =>{
            showLoader();
            ingredientsArr.value = [];

            for(let i=0; i<itemRows.value.length; i++){;
                let rcpItem ={
                    "inventory_item_id": itemRows.value[i].inventory_item_id,
                    "wastage": itemRows.value[i].ingr_wastage,
                    "quantity": itemRows.value[i].ingr_quantity,
                }
                ingredientsArr.value.push(rcpItem)
            }

            let formData = {
                company: companyID.value,
                inventory_item: itemID.value,
                inventory_item_id: itemID.value,
                quantity: formFields.value[2].value,
                instructions: templateContent.value,
                ingredients: ingredientsArr.value,
                user: userID.value
            }
  
            errors.value = [];
            if(itemID.value == ''){
                errors.value.push('Error');
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }
            else{   
                try {
                    const response = await store.dispatch('Recipes/createRecipe', formData);
                    if (response && response.status === 201) {
                        hideLoader();
                        toast.success('Sucess!');
                        handleReset();
                        mainComponentKey.value += 1;
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating Recipe.');
                        hideLoader();
                    }
                } catch (error) {
                    toast.error('Failed to create Recipe: ' + error.message);
                } finally {
                    hideLoader();
                }              
            
            }
            
        }
        const updateRecipe = async() => {
            showLoader();
            errors.value = [];
            ingredientsArr.value = [];

            for(let i=0; i<itemRows.value.length; i++){
                let rcpItem ={
                    "inventory_item_id": itemRows.value[i].inventory_item_id,
                    "wastage": itemRows.value[i].ingr_wastage,
                    "quantity": itemRows.value[i].ingr_quantity,
                }
                ingredientsArr.value.push(rcpItem)
            }
            if(itemValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
                    hideLoader();
            }else{
                const updatedItem = {
                    recipe: selectedRecipe.value.recipe_id,
                    company: companyID.value,
                    inventory_item: itemValue.value,
                    inventory_item_id: itemValue.value,
                    quantity: formFields.value[2].value,
                    instructions: templateContent.value,
                    ingredients: ingredientsArr.value,
                    user: userID.value                 
                };

                try {
                        const response = await store.dispatch('Recipes/updateRecipe', updatedItem);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Recipe Updated Success!');
                            handleReset();
                            ledComponentKey.value += 1;
                            mainComponentKey.value += 1;
                            store.dispatch("Recipes/updateState",{selectedRecipe:null,ingredientsArray:[]})
                        } else {
                            toast.error('An error occurred while updating the Recipe.');
                            hideLoader();
                        }
                    } catch (error) {
                        toast.error('Failed to update Recipe: ' + error.message);
                    } finally {
                        hideLoader();
                    }
            }                    
        };

        const saveRecipe = () =>{
            if(isEditing.value == true){
                updateRecipe();
            }else{
                createRecipe();
            }
        }

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
        })

        return{
            formFields, flex_basis, flex_basis_percentage, displayButtons, saveRecipe, mainComponentKey,
            handleReset, loader, showLoader, hideLoader, tableKey, itemColumns, itemRows, showActions, actions, deleteIngredient, idField,
            title, modal_loader, modal_left, modal_top, modal_width, showModalLoader, hideModalLoader,
            editorComponentKey, templateContent, showTotals
        }
    }
})
</script>