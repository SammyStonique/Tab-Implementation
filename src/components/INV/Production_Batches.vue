<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewBatch"
            :searchFilters="searchFilters"
            @searchPage="searchBatches"
            @resetFilters="resetFilters"
            @removeItem="removeBatch"
            @removeSelectedItems="removeBatchs"
            @printList="printBatchesList"
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
            :groupingKey=true
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
    name: 'Production_Batches',
    components:{
        PageComponent,StockAdjustments,
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const idField = 'production_batch_id';
        const addButtonLabel = ref('New Batch');
        const addingRight = ref('Adding Production Batches');
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
        const printTitle = ref('Print Production Batches List');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"production_date"},
            {label: "Batch#", key:"batch_number"},
            {label: "Code", key:"item_code"},
            {label: "Item Name", key:"item_name"},
            {label: "Quantity", key: "quantity"},
            {label: "Expiry Date", key:"expiry_date"},
        ]);
        const showTotals = ref(false);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Recipe', rightName: 'Deleting Production Batches'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const item_code_search = ref('');
        const item_name_search = ref('');
        const from_date_search = ref('');
        const to_date_search = ref('');
        const batch_number_search = ref('');

        const searchFilters = ref([
            {type:'text', placeholder:"Batch#...", value: batch_number_search, width:36,},
            {type:'text', placeholder:"Code...", value: item_code_search, width:32,},
            {type:'text', placeholder:"Item Name...", value: item_name_search, width:48,},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:32, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:32, title: "Date To Search"},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const removeBatch = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    production_batch: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Production_Batches/deleteProductionBatch',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Batch Removed Succesfully");
                        searchBatches();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Batch: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Batch") 
            }else{
                toast.error("Please Select A Batch To Remove")
            }
        }
        const removeBatchs = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    production_batch: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Production_Batches/deleteProductionBatch',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Batch(s) Removed Succesfully");
                        searchBatches();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Batches: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select Batches To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchBatches = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                batch_number: batch_number_search.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                item_name: item_name_search.value,
                item_code: item_code_search.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/production-batch-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                recipeList.value = response.data.results;
                store.commit('Production_Batches/LIST_BATCHES', recipeList.value)
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
            searchBatches(selectedValue.value);
        }
        const resetFilters = () =>{
            currentPage.value = 1;
            item_code_search.value = '';
            item_name_search.value = '';  
            from_date_search.value = '';
            to_date_search.value = '';
            batch_number_search.value = ''; 
            selectedValue.value = 50;
            searchBatches();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchBatches();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchBatches();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchBatches();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchBatches();
            // scrollToTop();
        };
        const addNewBatch = () =>{
            store.dispatch('Production_Batches/updateState', { ingredientsArray: []})
            store.dispatch('Items_Catalog/updateState', { item_uom: null, ingredientsArray: []})
            store.commit('Production_Batches/initializeStore');
            store.commit('pageTab/ADD_PAGE', {'INV':'Production_Details'});
            store.state.pageTab.invActiveTab = 'Production_Details';         
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const batchID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    production_batch: batchID,
                }
                await store.dispatch('Production_Batches/deleteProductionBatch',formData).
                then(()=>{
                    searchBatches();
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
        const printBatchesList = () =>{
            showLoader();

            let formData = {
                batch_number: batch_number_search.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                item_name: item_name_search.value,
                item_code: item_code_search.value,
                company: companyID.value,
            } 
   
            axios
            .post("api/v1/export-production-batch-pdf/", formData, { responseType: 'blob' })
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
            searchBatches();
            
        })
        return{
            currentPage,showTotals,searchBatches,resetFilters, addButtonLabel, searchFilters, tableColumns, recipeList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,printModalVisible,pdfUrl, printTitle,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewBatch, showLoader, loader, hideLoader, removeBatch, removeBatchs,
            handleSelectionChange,addingRight,rightsModule,printBatchesList,selectedValue,selectSearchQuantity,showDetails,
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