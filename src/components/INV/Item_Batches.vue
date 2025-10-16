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
        v-model:printModalVisible="printModalVisible"
        :printTitle="printTitle"
        :pdfUrl="pdfUrl"
        :columns="tableColumns"
        :rows="itemsList"
        :actions="actions"
        :showActions="showActions"
        :showTotals="showTotals"
        :idField="idField"
        @handleSelectionChange="handleSelectionChange"
        @handleActionClick="handleActionClick"
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
    name: 'Item_Batches',
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
        const title = ref('Item Batches');
        const companyID = computed(()=> store.state.userData.company_id);
        const outletID = ref('');
        const categoryID = ref(null);
        const outlets_array = computed(() => store.state.Retail_Outlets.outletArr);
        const idField = 'inventory_item_id';
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const printModalVisible = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Item Batches By Outlet');
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
            {label: "Date", key:"date"},
            {label: "Adjust. Code", key:"adjustment_code"},
            {label: "Adjust. Type", key:"adjustment_type"},
            {label: "Code", key:"item_code"},
            {label: "Item Name", key:"item_name"},
            {label: "Category", key: "item_category"},
            {label: "Inv. Type", key:"inventory_type"},
            {label: "Count", key:"batch_count", type: "number"},
            {label: "P.Price", key:"purchase_price"},
            {label: "S.Price", key:"selling_price"},
            {label: "Qty", key:"quantity", type: "number", txtColor: "txtColor"},
        ])
        const showTotals = ref(true);
        const showActions = ref(false);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Item'},
        ])
        const item_name_search = ref('');
        const item_code_search = ref('');
        const adjustment_code_search = ref('');
        const from_date_search = ref('');
        const to_date_search = ref('');
        const fetchOutlets = () =>{
            store.dispatch('Retail_Outlets/fetchOutlets', {company:companyID.value})
        }
        const handleSelectedOutlet= async(option) =>{
            await store.dispatch('Retail_Outlets/handleSelectedOutlet', option)
            outletID.value = store.state.Retail_Outlets.outletID;
        };
        const clearSelectedOutlet= async() =>{
            await store.dispatch('Retail_Outlets/updateState', {outletID: ''});
            outletID.value = store.state.Retail_Outlets.outletID;
        };
        const searchFilters = ref([
            {type:'text', placeholder:"Code...", value: item_code_search, width:32,},
            {type:'text', placeholder:"Name...", value: item_name_search, width:48,},
            {type:'text', placeholder:"Adjust. Code...", value: adjustment_code_search, width:36,},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:32, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:32, title: "Date To Search"},
            {
                type:'search-dropdown', value: outlets_array, width:48, componentKey: outComponentKey,
                selectOptions: outlets_array,optionSelected: handleSelectedOutlet,
                searchPlaceholder: 'Outlet...', dropdownWidth: '300px',
                clearSearch: clearSelectedOutlet
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
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                item_name: item_name_search.value,
                item_code: item_code_search.value,
                adjustment_code: adjustment_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                outlet: outletID.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/adjustment-batches-search/?page=${currentPage.value}`,formData)
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
            item_name_search.value = "";
            item_code_search.value = "";
            adjustment_code_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            outComponentKey.value += 1;
            outletID.value = '';
            currentPage.value = 1;
            selectedValue.value = 50;
            searchItems();
        }
        const closeModal = () =>{

        }
        const printItemsList = () =>{
            showLoader();
            let formData = {
                item_name: item_name_search.value,
                item_code: item_code_search.value,
                adjustment_code: adjustment_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                outlet: outletID.value,
                company: companyID.value,
            } 

            axios
            .post("api/v1/export-catalog-by-outlet-pdf/", formData, { responseType: 'blob' })
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
        onMounted(() =>{
            searchItems();
            fetchOutlets();
        })
        return{
            currentPage,showAddButton,showActions,showTotals,title, searchItems, idField, selectedIds, actions, itemsList, propArrLen,propCount,propResults,appModalVisible,
            searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,
            showNextBtn,showPreviousBtn,displayButtons,printModalVisible,pdfUrl, printTitle,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            closeModal, handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,printItemsList,selectSearchQuantity,selectedValue
        }
    }
}
</script>
