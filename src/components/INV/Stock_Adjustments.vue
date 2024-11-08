<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewAdjustment"
            :searchFilters="searchFilters"
            @searchPage="searchAdjustments"
            @resetFilters="resetFilters"
            @removeItem="removeAdjustment"
            @removeSelectedItems="removeAdjustments"
            @printList="printAdjustmentsList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="adjustmentsList"
            :actions="actions"
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
        />
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';

export default{
    name: 'Stock_Adjustments',
    components:{
        PageComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const catComponentKey = ref('');
        const defaultSettings = computed(()=> store.state.Default_Settings.settingsList);
        const idField = 'adjustment_id';
        const addButtonLabel = ref('New Stock Adjustment');
        const addingRight = ref('Adding Stock Adjustment');
        const rightsModule = ref('Inventory');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const adjustmentsList = ref([]);
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
            {label: "Code", key:"adjustment_code"},
            {label: "Date", key:"date"},
            {label: "Outlet Name", key: "warehouse_name"},
            {label: "Amount", key:"total_amount", type: "number"},
            {label: "Done By", key:"done_by"},
        ]);
        const showTotals = ref(true);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Adjustment', rightName: 'Deleting Stock Adjustment'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const categoryID = ref(null);
        const adjustment_code_search = computed({
            get: () => store.state.Stock_Adjustments.adjustment_code_search,
            set: (value) => store.commit('Stock_Adjustments/SET_SEARCH_FILTERS', {"adjustment_code_search":value}),
        });

        const done_by_search = computed({
            get: () => store.state.Stock_Adjustments.done_by_search,
            set: (value) => store.commit('Stock_Adjustments/SET_SEARCH_FILTERS', {"done_by_search":value}),
        });
        const date_from_search = computed({
            get: () => store.state.Stock_Adjustments.date_from_search,
            set: (value) => store.commit('Stock_Adjustments/SET_SEARCH_FILTERS', {"date_from_search":value}),
        });
        const date_to_search = computed({
            get: () => store.state.Stock_Adjustments.date_to_search,
            set: (value) => store.commit('Stock_Adjustments/SET_SEARCH_FILTERS', {"date_to_search":value}),
        });
        const warehouse_search = computed({
            get: () => store.state.Stock_Adjustments.warehouse_search,
            set: (value) => store.commit('Stock_Adjustments/SET_SEARCH_FILTERS', {"warehouse_search":value}),
        });

        const searchFilters = ref([
            {type:'text', placeholder:"Code...", value: adjustment_code_search, width:40,},
            {type:'text', placeholder:"Outlet...", value: warehouse_search, width:48,},
            {type:'date', placeholder:"From Date...", value: date_from_search, width:30,},
            {type:'date', placeholder:"To Date...", value: date_to_search, width:30,},
            {type:'text', placeholder:"Done By...", value: done_by_search, width:48,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const removeAdjustment = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    adjustment_array: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Stock_Adjustments/deleteStockAdjustment',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Adjustment Removed Succesfully");
                        searchAdjustments();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Adjustment: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Adjustment") 
            }else{
                toast.error("Please Select An Adjustment To Remove")
            }
        }
        const removeAdjustments = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    adjustment_array: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Stock_Adjustments/deleteStockAdjustment',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Adjustment(s) Removed Succesfully");
                        searchAdjustments();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Adjustments: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select Adjustments To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchAdjustments = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                adjustment_code: adjustment_code_search.value,
                warehouse: warehouse_search.value,
                inventory_item: "",
                done_by: done_by_search.value,
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/stock-adjustment-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                adjustmentsList.value = response.data.results;
                store.commit('Stock_Adjustments/LIST_ADJUSTMENTS', adjustmentsList.value)
                propResults.value = response.data;
                propArrLen.value = adjustmentsList.value.length;
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
            store.commit('Stock_Adjustments/RESET_SEARCH_FILTERS')
            searchAdjustments();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchAdjustments();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchAdjustments();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchAdjustments();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchAdjustments();
            // scrollToTop();
        };
        const addNewAdjustment = () =>{
            store.commit('Stock_Adjustments/initializeStore');
            store.commit('pageTab/ADD_PAGE', {'INV':'Stock_Adjustment_Details'});
            store.state.pageTab.invActiveTab = 'Stock_Adjustment_Details';         
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const adjustmentID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    adjustment_array: adjustmentID
                }
                await store.dispatch('Stock_Adjustments/deleteStockAdjustment',formData).
                then(()=>{
                    searchAdjustments();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printAdjustmentsList = () =>{
            showLoader();

            let formData = {
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                adjustment_code: adjustment_code_search.value,
                warehouse: warehouse_search.value,
                inventory_item: "",
                done_by: done_by_search.value,
                company_id: companyID.value
            } 
   
            axios
            .post("api/v1/export-stock-adjustments-pdf/", formData, { responseType: 'blob' })
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
        
        onBeforeMount(()=>{
            searchAdjustments();
            
        })
        return{
            showTotals,searchAdjustments,resetFilters, addButtonLabel, searchFilters, tableColumns, adjustmentsList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewAdjustment, showLoader, loader, hideLoader, removeAdjustment, removeAdjustments,
            handleSelectionChange,addingRight,rightsModule,printAdjustmentsList
        }
    }
};
</script>