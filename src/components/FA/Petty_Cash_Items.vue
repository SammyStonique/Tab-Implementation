<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        :showAddButton="showAddButton"
        :searchFilters="searchFilters"
        :dropdownOptions="dropdownOptions"
        @handleDynamicOption="handleDynamicOption"
        @searchPage="searchItems"
        @resetFilters="resetFilters"
        @removeItem="removeAllocation"
        @removeSelectedItems="removeAllocations"
        @printList="printArrearsList"
        :columns="tableColumns"
        :rows="arrearsList"
        :actions="actions"
        :showActions="showActions"
        :rightsModule="rightsModule"
        :idField="idField"
        :showTotals="showTotals"
        @handleSelectionChange="handleSelectionChange"
        @handleActionClick="handleActionClick"
        @handleRightClick="handleRightClick"
        :groupingKey=true
        :count="appCount"
        :currentPage="currentPage"
        :result="appArrLen"
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
            :displayButtons="displayButtons" @handleSubmit="assignSubcategory" @handleReset="handleReset"
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
    name: 'Petty_Cash_Items',
    props: ['scrollToTop','loader','showLoader','hideLoader',],
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const pageComponentKey = ref(0);
        const propComponentKey = ref(0);
        const riskComponentKey = ref(0);
        const showAddButton = ref(false);
        const title = ref('Assign/Change Sub Category');
        const companyID = computed(()=> store.state.userData.company_id);
        const idField = 'tenant_lease_id';
        const rightsModule = ref('Accounts');
        const categoryID = ref('');
        const itemID = ref("");
        const subCategoryID = ref('');
        const subCatID = ref('');
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const arrearsList = ref([]);
        const appResults = ref([]);
        const appArrLen = ref(0);
        const appCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('35vw');
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date",type: "text"},
            {label: "Voucher#", key:"voucher",type: "text"},
            {label: "Petty Cash", key:"petty_cash",type: "text"},
            // {label: "Category", key:"category",type: "text"},
            {label: "Sub Category", key:"sub_category",type: "text"},
            {label: "Description", key:"description",type: "text"},
            {label: "Amount", key:"amount",type: "number"},
        ])
        const showTotals = ref(true);
        const showActions = ref(false);
        const actions = ref([

        ])
        const to_date_search = ref("");
        const voucher_no_search = ref("");
        const from_date_search = ref("");
        const categoryArray = computed(()=> store.state.Petty_Cash_Item_Categories.categoryArr);
        const subCategoryArray = computed(()=> store.state.Petty_Cash_Item_Categories.subCategoryArr);
        const handleSelectedCategory = async(option) =>{
            await store.dispatch('Petty_Cash_Item_Categories/handleSelectedCategory', option)
            categoryID.value = store.state.Petty_Cash_Item_Categories.categoryID;
        };
        const clearSelectedCategory = async() =>{
            await store.dispatch('Petty_Cash_Item_Categories/updateState', {categoryID: ''});
            categoryID.value = store.state.Petty_Cash_Item_Categories.categoryID;
        };
        const handleSelectedSubCategory = async(option) =>{
            await store.dispatch('Petty_Cash_Item_Categories/handleSelectedSubCategory', option)
            subCategoryID.value = store.state.Petty_Cash_Item_Categories.subCategoryID;
        };
        const clearSelectedSubCategory = async() =>{
            await store.dispatch('Petty_Cash_Item_Categories/updateState', {subCategoryID: ''});
            subCategoryID.value = store.state.Petty_Cash_Item_Categories.subCategoryID;
        };
        const searchFilters = ref([
            {
                type:'search-dropdown', value: categoryID.value, width:48, componentKey: propComponentKey,
                selectOptions: categoryArray, optionSelected: handleSelectedCategory,
                searchPlaceholder: 'Category...', dropdownWidth: '250px',
                fetchData: store.dispatch('Petty_Cash_Item_Categories/fetchItemCategories', {company:companyID.value}),
                clearSearch: clearSelectedCategory
            },
            {
                type:'search-dropdown', value: subCategoryID.value, width:48, componentKey: propComponentKey,
                selectOptions: subCategoryArray, optionSelected: handleSelectedSubCategory,
                searchPlaceholder: 'Sub Category...', dropdownWidth: '250px',
                fetchData: store.dispatch('Petty_Cash_Item_Categories/fetchItemSubCategories', {company:companyID.value}),
                clearSearch: clearSelectedSubCategory
            },
            {type:'text', placeholder:"Voucher...", value: voucher_no_search, width:32},
            {type:'date', placeholder:"Date...", value: from_date_search, width:32, title: "From Date"},
            {type:'date', placeholder:"Date...", value: to_date_search, width:32, title: "To Date"},

            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        watch(() => store.state.contextMenu.selectedAction, (actionPayload) => {
            if (!actionPayload) return;

            const { rowIndex, action, data } = actionPayload;

            handleActionClick(rowIndex, action, data);

            store.commit('contextMenu/CLEAR_SELECTED_ACTION');
        });
        const handleSelectedSubCat = async(option) =>{
            await store.dispatch('Petty_Cash_Item_Categories/handleSelectedSubCategory', option)
            subCatID.value = store.state.Petty_Cash_Item_Categories.subCategoryID;
        };
        const clearSelectedSubCat = async() =>{
            await store.dispatch('Petty_Cash_Item_Categories/updateState', {subCategoryID: ''});
            subCatID.value = store.state.Petty_Cash_Item_Categories.subCategoryID;
        };
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Sub Category", value: subCatID.value, componentKey: propComponentKey,
                    selectOptions: subCategoryArray, optionSelected: handleSelectedSubCat, required: true,
                    searchPlaceholder: 'Select Sub Category...', dropdownWidth: '300px', updateValue: "",
                    clearSearch: clearSelectedSubCat
                },
            ];
        };
        const handleRightClick = (row, rowIndex, event) => {

            const menuOptions = [
                { label: 'Add To SubCategory', action: 'add-subcategory', rowIndex: rowIndex , icon: 'fa fa-arrows-alt', rightName: 'Adding Petty Cash Item Category'},
            ];

            store.commit('contextMenu/SHOW_CONTEXT_MENU', {
                x: event.clientX,
                y: event.clientY,
                options: menuOptions,
                contextData: row,
            });
        };
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'add-subcategory'){
                itemID.value = row['petty_cash_item_id'];
                appModalVisible.value = true;
                updateFormFields();
            }
        };
        const assignSubcategory = async() =>{
            showModalLoader();
            let formData = {
                company: companyID.value,
                petty_cash_item: itemID.value,
                sub_category: subCatID.value
            }
            await axios.post('api/v1/assign-petty-cash-item-subcategory/',formData)
            .then((response)=>{
                if(response.data.msg == "Success"){
                    toast.success("Success");
                    closeModal();
                }
            })
            .catch((error)=>{
                toast.error(error.message);
            })
            .finally(()=>{
                hideModalLoader();
                searchItems();
            })
        }
        const dropdownOptions = ref([
            
        ]);
        const handleDynamicOption = async(option) =>{
        
        };
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        };
        const closeModal = () =>{
            appModalVisible.value = false;
            subCatID.value = "";
        };
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchItems = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                voucher_no: voucher_no_search.value,
                to_date: to_date_search.value,
                from_date: from_date_search.value,
                category: categoryID.value,
                sub_category: subCategoryID.value,
                company: companyID.value,
                page_size: selectedValue.value
            }
 
            axios
            .post(`api/v1/petty-cash-items-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                arrearsList.value = response.data.results;
                appResults.value = response.data;
                appArrLen.value = arrearsList.value.length;
                appCount.value = appResults.value.count;
                pageCount.value = Math.ceil(appCount.value / selectedValue.value);
                
                if(response.data.next){
                    showNextBtn.value = true;
                }
                if(response.data.previous){
                    showPreviousBtn.value = true;
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
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
            currentPage.value = 1;
            selectedValue.value = 50;
            propComponentKey.value += 1;
            categoryID.value = "";
            subCategoryID.value = "";
            to_date_search.value = "";
            voucher_no_search.value = "";
            from_date_search.value = "";
            searchItems();
        };
        const printArrearsList = () =>{
            showLoader();
            let formData = {
                voucher_no: voucher_no_search.value,
                to_date: to_date_search.value,
                from_date: from_date_search.value,
                category: categoryID.value,
                sub_category: subCategoryID.value,
                company: companyID.value,
                page_size: selectedValue.value
            }

            axios
            .post("api/v1/export-loan-arrears-pdf/", formData, { responseType: 'blob' })
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
            searchItems();
        })
        return{
            showAddButton,title, searchItems, idField, selectedIds, actions, showActions, arrearsList, appArrLen,appCount,appResults,appModalVisible,
            currentPage,searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,dropdownOptions,handleDynamicOption,
            showNextBtn,showPreviousBtn, handleActionClick,handleRightClick,displayButtons,assignSubcategory,formFields,closeModal,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,rightsModule,
            handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,showTotals,printArrearsList,selectSearchQuantity,selectedValue
        }
    }
}
</script>
