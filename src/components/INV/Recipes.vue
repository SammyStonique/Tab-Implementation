<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewRecipe"
            :searchFilters="searchFilters"
            @searchPage="searchRecipes"
            @resetFilters="resetFilters"
            @removeItem="removeRecipe"
            @removeSelectedItems="removeRecipes"
            @printList="printRecipesList"
            v-model:printModalVisible="printModalVisible"
            :printTitle="printTitle"
            :pdfUrl="pdfUrl"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="recipeList"
            :actions="actions"
            :showTotals="showTotals"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            @handleShowDetails="handleShowDetails"
            :count="propCount"
            :currentPage="currentPage"
            :result="propArrLen"
            @loadPrev="loadPrev"
            @loadNext="loadNext"
            @firstPage="firstPage"
            @lastPage="lastPage"
            :showNextBtn="showNextBtn"
            :showPreviousBtn="showPreviousBtn"
            :selectedValue="selectedValue"
            @selectSearchQuantity="selectSearchQuantity"
            :showDetails="showDetails"
            :detailsTitle="detailsTitle"
            @hideDetails="hideDetails"
            >
            <div>
                <div class="tabs pt-2">
                    <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                        {{ tab }}
                    </button>
                </div>
                <div class="tab-content mt-3">
                    <div v-if="activeTab == 0">
                        <StockAdjustments 
                            :adjustmentItemsRows="itemLines"
                        />
                    </div>
                </div>
                
            </div>
        </PageComponent>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import StockAdjustments from "@/components/StockAdjustments.vue";
import PrintJS from 'print-js';

export default{
    name: 'Recipes',
    components:{
        PageComponent,StockAdjustments,
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const idField = 'recipe_id';
        const addButtonLabel = ref('New Recipe');
        const addingRight = ref('Adding Product Recipe');
        const rightsModule = ref('Inventory');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const recipeList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const selectedValue = ref(50);
        const detailsTitle = ref('Item Details');
        const tabs = ref(['Ingredients']);
        const activeTab = ref(0);
        const adjustmentID = ref(null);
        const showDetails = ref(false);
        const journalEntries = ref([]);
        const itemLines = ref([]);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const printModalVisible = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Product Recipes List');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"item_code"},
            {label: "Item Name", key:"item_name"},
            {label: "Quantity", key: "quantity"},
        ]);
        const showTotals = ref(false);
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Recipe', rightName: 'Editing Product Recipe'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Recipe', rightName: 'Deleting Product Recipe'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const item_code_search = ref('');
        const item_name_search = ref('');

        const searchFilters = ref([
            {type:'text', placeholder:"Code...", value: item_code_search, width:40,},
            {type:'text', placeholder:"Item Name...", value: item_name_search, width:48,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const removeRecipe = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    recipes: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Recipes/deleteRecipe',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Recipe Removed Succesfully");
                        searchRecipes();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Recipe: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Recipe") 
            }else{
                toast.error("Please Select A Recipe To Remove")
            }
        }
        const removeRecipes = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    recipes: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Recipes/deleteRecipe',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Recipe(s) Removed Succesfully");
                        searchRecipes();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Recipes: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select Recipes To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchRecipes = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                item_code: item_code_search.value,
                item_name: item_name_search.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/product-recipe-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                recipeList.value = response.data.results;
                store.commit('Recipes/LIST_RECIPES', recipeList.value)
                propResults.value = response.data;
                propArrLen.value = recipeList.value.length;
                propCount.value = propResults.value.count;
                pageCount.value = Math.ceil(propCount.value / selectedValue.value);
                if(response.data.next){
                    showNextBtn.value = true;
                }
                if(response.data.previous){
                    showPreviousBtn.value = true;
                }
            })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchRecipes(selectedValue.value);
        }
        const resetFilters = () =>{
            currentPage.value = 1;
            item_code_search.value = '';
            item_name_search.value = '';   
            selectedValue.value = 50;
            searchRecipes();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchRecipes();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchRecipes();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchRecipes();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchRecipes();
            // scrollToTop();
        };
        const addNewRecipe = () =>{
            store.dispatch('Recipes/updateState', { ingredientsArray: [], selectedRecipe: null, selectedItem: null, isEditing: false})
            store.dispatch('Items_Catalog/updateState', { item_uom: null, ingredientsArray: []})
            store.commit('Recipes/initializeStore');
            store.commit('pageTab/ADD_PAGE', {'INV':'Recipe_Details'});
            store.state.pageTab.invActiveTab = 'Recipe_Details';         
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const recipeID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    recipes: recipeID,
                }
                await store.dispatch('Recipes/deleteRecipe',formData).
                then(()=>{
                    searchRecipes();
                })
            }else if(action == 'edit'){
                const recipeID = row[idField];
                await store.dispatch('Recipes/fetchRecipe', {company: companyID.value, recipe: recipeID})
                .then(()=>{
                    store.state.pageTab.invActiveTab = 'Recipe_Details';
                    store.commit('pageTab/ADD_PAGE', {'INV':'Recipe_Details'});
                })
            }
            else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        };
        const handleShowDetails = async(row) =>{
            activeTab.value = 0;
            adjustmentID.value = row['item_code'];
            detailsTitle.value = row['item_code'] + ' Details';
            showDetails.value = true;
        };
        const selectTab = async(index) => {
            let formData = {
                company: companyID.value,
                date_from: "",
                date_to: "",
                item_code: adjustmentID.value,
                warehouse: "",
                inventory_item: "",
            }
            if(index == 1){
                activeTab.value = index;
                await axios.post('api/v1/recipe-ingredients-search/',formData)
                .then((response)=>{
                    itemLines.value = response.data.results;
                })
                .catch((error)=>{
                    console.log(error.message)
                })
            }else{
                activeTab.value = index;
                hideLoader();
            }

        };
        const hideDetails = async() =>{
            showDetails.value = false;
        };
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printRecipesList = () =>{
            showLoader();

            let formData = {
                item_code: item_code_search.value,
                item_name: item_name_search.value,
                company: companyID.value
            } 
   
            axios
            .post("api/v1/export-product-recipe-pdf/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const blob1 = new Blob([response.data], { type: 'application/pdf' });
                        const url = URL.createObjectURL(blob1);
                        // PrintJS({printable: url, type: 'pdf'});
                        pdfUrl.value = url;
                        printModalVisible.value = true;
                    }
                })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        }
        
        onBeforeMount(()=>{
            searchRecipes();
            
        })
        return{
            currentPage,showTotals,searchRecipes,resetFilters, addButtonLabel, searchFilters, tableColumns, recipeList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,printModalVisible,pdfUrl, printTitle,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewRecipe, showLoader, loader, hideLoader, removeRecipe, removeRecipes,
            handleSelectionChange,addingRight,rightsModule,printRecipesList,selectedValue,selectSearchQuantity,showDetails,
            detailsTitle,hideDetails,handleShowDetails,journalEntries,itemLines,tabs,selectTab,activeTab
        }
    }
};
</script>

<style scoped>
.tabs {
    display: flex;
    border-bottom: 1px solid #ccc;
}
.tab {
    padding: 2px 20px 2px 20px;
    cursor: pointer;
}

.tab.active {
    border-bottom: 2px solid #000;
}

.tab-content {
    padding: 1px;
}</style>