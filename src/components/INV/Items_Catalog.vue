<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewItem"
            :searchFilters="searchFilters"
            @searchPage="searchItems"
            @resetFilters="resetFilters"
            @importData="importItems"
            @removeItem="removeItem"
            @removeSelectedItems="removeItems"
            @printList="printList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="itemsList"
            :actions="actions"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            :count="propCount"
            :currentPage="currentPage"
            :result="propArrLen"
            @loadPrev="loadPrev"
            @loadNext="loadNext"
            @firstPage="firstPage"
            @lastPage="lastPage"
            :showNextBtn="showNextBtn"
            :showPreviousBtn="showPreviousBtn"
        />
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Items_Catalog',
    components:{
        PageComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const idField = 'inventory_item_id';
        const addButtonLabel = ref('New Item');
        const addingRight = ref('Adding Inventory Item');
        const rightsModule = ref('Inventory');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const itemsList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"item_code"},
            {label: "Item Name", key:"item_name"},
            {label: "Category", key: "item_category"},
            {label: "Type", key:"inventory_type"},
            {label: "Stock", key:"available_stock"},
            {label: "P.Price", key:"default_purchase_price"},
            {label: "S.Price", key:"default_selling_price"},
            {label: "Sold", key:"quantity_sold"},
            {label: "Reorder", key:"reorder_level"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Item', rightName: 'Editing Inventory Item'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Item', rightName: 'Deleting Inventory Item'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const categoryID = ref(null);
        const item_name_search = computed({
            get: () => store.state.Items_Catalog.item_name_search,
            set: (value) => store.commit('Items_Catalog/SET_SEARCH_FILTERS', {"item_name_search":value}),
        });
        const item_code_search = computed({
            get: () => store.state.Items_Catalog.item_code_search,
            set: (value) => store.commit('Items_Catalog/SET_SEARCH_FILTERS', {"item_code_search":value}),
        });
        const stock_type_search = computed({
            get: () => store.state.Items_Catalog.stock_type_search,
            set: (value) => store.commit('Items_Catalog/SET_SEARCH_FILTERS', {"stock_type_search":value}),
        });
        const categories_array = computed({
            get: () => store.state.Item_Categories.categoryArr,
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Code...", value: item_code_search, width:48,},
            {type:'text', placeholder:"Name...", value: item_name_search, width:48,},
            {
                type:'search-dropdown', value: categories_array, width:48,
                selectOptions: categories_array,
                searchPlaceholder: 'Category...', dropdownWidth: '300px',
                fetchData: store.dispatch('Item_Categories/fetchItemCategories', {company:companyID.value})
            },
            {
                type:'dropdown', placeholder:"Stock Type", value: stock_type_search, width:48,
                options: [{text:'Stocked',value:'Stocked'},{text:'Serialized',value:'Serialized'},{text:'Service',value:'Service'},{text:'Non Stocked',value:'Non Stocked'}]
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const importItems = () =>{
            store.commit('pageTab/ADD_PAGE', {'INV':'Import_Items'})
            store.state.pageTab.invActiveTab = 'Import_Items';
        }
        const removeItem = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    inventory_item: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Items_Catalog/deleteInventoryItem',formData)
                    if(response && response.status == 200){
                        toast.success("Item Removed Succesfully");
                        searchItems();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove item: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 item") 
            }else{
                toast.error("Please Select An Item To Remove")
            }
        }
        const removeItems = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    inventory_item: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Items_Catalog/deleteInventoryItem',formData)
                    if(response && response.status == 200){
                        toast.success("Item(s) Removed Succesfully");
                        searchItems();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove items: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select Items To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchItems = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                item_name: item_name_search.value,
                item_code: item_code_search.value,
                stock_type: stock_type_search.value,
                item_category: categoryID.value,
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/item-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                itemsList.value = response.data.results;
                store.commit('Items_Catalog/LIST_ITEMS', itemsList.value)
                propResults.value = response.data;
                propArrLen.value = itemsList.value.length;
                propCount.value = propResults.value.count;
                pageCount.value = Math.ceil(propCount.value / 50);
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
        }
        const resetFilters = () =>{
            store.commit('Items_Catalog/RESET_SEARCH_FILTERS')
            searchItems();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchItems();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchItems();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchItems();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchItems();
            // scrollToTop();
        }
        const addNewItem = async() =>{
            store.commit('Items_Catalog/initializeStore');
            await store.dispatch('Items_Catalog/updateState', {selectedItem: null,selectedCategory:null,selectedVendor:null,selectedUom:null, isEditing: false});
            store.commit('pageTab/ADD_PAGE', {'INV':'Item_Details'});
            store.state.pageTab.invActiveTab = 'Item_Details';          
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const itemID = row[idField];
                let formData = {
                    company: companyID.value,
                    inventory_item: itemID
                }

                await store.dispatch('Items_Catalog/fetchInventoryItem',formData).
                then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'INV':'Item_Details'})
                    store.state.pageTab.invActiveTab = 'Item_Details';
                })
            }else if(action == 'delete'){
                const itemID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    inventory_item: itemID
                }
                await store.dispatch('Items_Catalog/deleteInventoryItem',formData).
                then(()=>{
                    searchItems();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchItems();
            
        })
        return{
            searchItems,resetFilters, addButtonLabel, searchFilters, tableColumns, itemsList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewItem, showLoader, loader, hideLoader, importItems, removeItem, removeItems,
            handleSelectionChange,addingRight,rightsModule
        }
    }
};
</script>