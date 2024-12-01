<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :showAddButton="showAddButton"
        :searchFilters="searchFilters"
        @searchPage="searchItems"
        @resetFilters="resetFilters"
        @removeItem=""
        @removeSelectedItems=""
        @printList="printItemsList"
        :columns="tableColumns"
        :rows="itemsList"
        :actions="actions"
        :showActions="showActions"
        :showTotals="showTotals"
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
        :selectedValue="selectedValue"
        @selectSearchQuantity="selectSearchQuantity"
    />
    <MovableModal v-model:visible="appModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
    >
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="" @handleReset="handleReset"
        />
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted,watch } from 'vue';
import { useStore } from "vuex";
import PageComponent from "../PageComponent.vue";
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';

export default{
    name: 'Fast_Moving_Items',
    props: ['scrollToTop','loader','showLoader','hideLoader',],
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const showAddButton = ref(false);
        const pageComponentKey = ref(0);
        const catComponentKey = ref(0);
        const outComponentKey = ref(0);
        const title = ref('Fast Moving Items');
        const companyID = computed(()=> store.state.userData.company_id);
        const outletID = ref('');
        const categoryID = ref(null);
        const outlets_array = computed({
            get: () => store.state.Retail_Outlets.outletArr,
        });
        const idField = 'inventory_item_id';
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const itemsList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('35vw');
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"item_code"},
            {label: "Item Name", key:"item_name"},
            {label: "Category", key: "item_category"},
            {label: "Type", key:"inventory_type"},
            {label: "P.Price", key:"default_purchase_price"},
            {label: "S.Price", key:"default_selling_price"},
            {label: "Sold", key:"quantity_sold", type: "number"},
            {label: "Reorder", key:"reorder_level"},
        ])
        const showTotals = ref(true);
        const showActions = ref(false);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Item'},
        ])
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
        const handleSelectedOutlet= async(option) =>{
            await store.dispatch('Retail_Outlets/handleSelectedOutlet', option)
            outletID.value = store.state.Retail_Outlets.outletID;
        };
        const clearSelectedOutlet= async() =>{
            await store.dispatch('Retail_Outlets/updateState', {outletID: ''});
            outletID.value = store.state.Retail_Outlets.outletID;
        };
        const handleSelectedCategory= async(option) =>{
            await store.dispatch('Item_Categories/handleSelectedCategory', option)
            categoryID.value = store.state.Item_Categories.categoryID;
        };
        const clearSelectedCategory= async() =>{
            await store.dispatch('Item_Categories/updateState', {categoryID: ''});
            categoryID.value = store.state.Item_Categories.categoryID;
        };
        const searchFilters = ref([
            {type:'text', placeholder:"Code...", value: item_code_search, width:48,},
            {type:'text', placeholder:"Name...", value: item_name_search, width:60,},
            {
                type:'search-dropdown', value: categories_array, width:48, componentKey: catComponentKey,
                selectOptions: categories_array,optionSelected: handleSelectedCategory,
                searchPlaceholder: 'Category...', dropdownWidth: '300px',
                fetchData: store.dispatch('Item_Categories/fetchItemCategories', {company:companyID.value}), clearSearch: clearSelectedCategory
            },
            {
                type:'dropdown', placeholder:"Stock Type", value: stock_type_search, width:48,
                options: [{text:'Stocked',value:'Stocked'},{text:'Serialized',value:'Serialized'},{text:'Service',value:'Service'},{text:'Non Stocked',value:'Non Stocked'}]
            },
            {
                type:'search-dropdown', value: outlets_array, width:48, componentKey: outComponentKey,
                selectOptions: outlets_array,optionSelected: handleSelectedOutlet,
                searchPlaceholder: 'Outlet...', dropdownWidth: '300px',
                fetchData: store.dispatch('Retail_Outlets/fetchOutlets', {company:companyID.value}), clearSearch: clearSelectedOutlet
            },
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchItems = () =>{
            if(outletID.value != ''){
                showLoader();
                showNextBtn.value = false;
                showPreviousBtn.value = false;
                let formData = {
                    item_name: item_name_search.value,
                    item_code: item_code_search.value,
                    stock_type: stock_type_search.value,
                    item_category: categoryID.value,
                    outlet: outletID.value,
                    company_id: companyID.value,
                    page_size: selectedValue.value
                } 
                axios
                .post(`api/v1/fast-moving-items-search/?page=${currentPage.value}`,formData)
                .then((response)=>{
                    itemsList.value = response.data.results;
                    propResults.value = response.data;
                    propArrLen.value = itemsList.value.length;
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
            }else{
                toast.error("Please Select An Outlet")
            }
        };
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchItems(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchItems();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchItems();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchItems();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchItems();
        }
        const resetFilters = () =>{
            store.commit('Retail_Outlets/RESET_SEARCH_FILTERS')
            item_name_search.value = "";
            item_code_search.value = "";
            stock_type_search.value = "";
            catComponentKey.value += 1;
            outComponentKey.value += 1;
            searchItems();
        }
        const closeModal = () =>{

        }
        const printItemsList = () =>{
            showLoader();
            let formData = {
                item_name: item_name_search.value,
                item_code: item_code_search.value,
                stock_type: stock_type_search.value,
                item_category: categoryID.value,
                outlet: outletID.value,
                company_id: companyID.value
            } 

            axios
            .post("api/v1/export-fast-moving-items-pdf/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const blob1 = new Blob([response.data]);
                        // Convert blob to URL
                        const url = URL.createObjectURL(blob1);
                        PrintJS({printable: url, type: 'pdf'});
                    }
                })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        }
        onMounted(() =>{
            
        })
        return{
            showAddButton,showActions,showTotals,title, searchItems, idField, selectedIds, actions, itemsList, propArrLen,propCount,propResults,appModalVisible,
            searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,
            showNextBtn,showPreviousBtn,displayButtons,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            closeModal, handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,printItemsList,selectSearchQuantity,selectedValue
        }
    }
}
</script>
