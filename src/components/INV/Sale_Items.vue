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
    name: 'Sale_Items',
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
        const countComponentKey = ref(0);
        const outComponentKey = ref(0);
        const chanComponentKey = ref(0);
        const itemComponentKey = ref(0);
        const title = ref('Sale Items');
        const selectedValue = ref(50);
        const companyID = computed(()=> store.state.userData.company_id);
        const outletID = ref('');
        const counterID = ref(null);
        const channelID = ref(null);
        const itemID = ref(null);
        const outlets_array = computed(() => store.state.Retail_Outlets.outletArr);
        const counters_array = computed(() => store.state.Outlet_Counters.counterArr);
        const channels_array = computed(() => store.state.Counter_Channels.channelArr);
        const items_array = computed(() => store.state.Items_Catalog.itemsArr);
        const idField = 'sale_item_id';
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const printModalVisible = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Sale Items List');
        const itemsList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
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
            // {label: "Outlet", key:"outlet_name"},
            {label: "Date", key:"date"},
            {label: "Customer Name", key: "client"},
            {label: "Item Name", key:"inventory_item_name"},
            {label: "Qty", key:"quantity", type: "number"},
            {label: "S.Price", key:"selling_price", type: "number"},
            {label: "Amnt", key:"total_amount", type: "number"},
            {label: "Discnt", key:"discount", type: "number", textColor: "red"},
            {label: "Profit", key:"profit", type: "number", textColor: "green"},
            {label: "Rcpt#", key:"receipt_no"},
            {label: "Done By", key:"done_by"},
        ])
        const showTotals = ref(true);
        const showActions = ref(false);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Item'},
        ])
        const date_from_search = ref("");
        const date_to_search = ref("");
        const done_by_search = ref("");

        const fetchOutlets = () =>{
            store.dispatch('Retail_Outlets/fetchOutlets', {company:companyID.value})
        };
        const fetchCounters = () =>{
            if(outletID.value){
                store.dispatch('Outlet_Counters/fetchCounters', {company:companyID.value, outlet: outletID.value})
            }
        };
        const fetchChannels = () =>{
            if(counterID.value){
                store.dispatch('Counter_Channels/fetchChannels', {company:companyID.value, outlet_counter:counterID.value})
            }
        };
        const fetchItems = () =>{
            store.dispatch('Items_Catalog/fetchInventoryItems', {company:companyID.value})
        };
        const handleSelectedOutlet= async(option) =>{
            await store.dispatch('Retail_Outlets/handleSelectedOutlet', option)
            outletID.value = store.state.Retail_Outlets.outletID;
            fetchCounters();
        };
        const clearSelectedOutlet= async() =>{
            await store.dispatch('Retail_Outlets/updateState', {outletID: ''});
            outletID.value = store.state.Retail_Outlets.outletID;
        };
        const handleSelectedCounter= async(option) =>{
            await store.dispatch('Outlet_Counters/handleSelectedCounter', option)
            counterID.value = store.state.Outlet_Counters.counterID;
            fetchChannels();
        };
        const clearSelectedCounter= async() =>{
            await store.dispatch('Outlet_Counters/updateState', {counterID: ''});
            counterID.value = store.state.Outlet_Counters.counterID;
        };
        
        const handleSelectedChannel= async(option) =>{
            await store.dispatch('Counter_Channels/handleSelectedChannel', option)
            channelID.value = store.state.Counter_Channels.channelID;
        };
        const clearSelectedChannel= async() =>{
            await store.dispatch('Counter_Channels/updateState', {channelID: ''});
            channelID.value = store.state.Counter_Channels.channelID;
        };
        const handleSelectedItem= async(option) =>{
            await store.dispatch('Items_Catalog/handleSelectedInventoryItem', option)
            itemID.value = store.state.Items_Catalog.itemID;
        };
        const clearSelectedItem= async() =>{
            await store.dispatch('Items_Catalog/updateState', {itemID: ''});
            itemID.value = store.state.Items_Catalog.itemID;
        };
        const searchFilters = ref([
            {
                type:'search-dropdown', value: outlets_array, width:48, componentKey: outComponentKey,
                selectOptions: outlets_array,optionSelected: handleSelectedOutlet,
                searchPlaceholder: 'Outlet...', dropdownWidth: '250px',
                fetchData: fetchOutlets(), clearSearch: clearSelectedOutlet
            },
            {
                type:'search-dropdown', value: counters_array, width:48, componentKey: countComponentKey,
                selectOptions: counters_array,optionSelected: handleSelectedCounter,
                searchPlaceholder: 'Counter...', dropdownWidth: '250px',
                fetchData: fetchCounters(), clearSearch: clearSelectedCounter
            },
            {
                type:'search-dropdown', value: channels_array, width:30, componentKey: chanComponentKey,
                selectOptions: channels_array,optionSelected: handleSelectedChannel,
                searchPlaceholder: 'Channel...', dropdownWidth: '250px',
                fetchData: fetchChannels(), clearSearch: clearSelectedChannel
            },
            {type:'date', placeholder:"From Date...", value: date_from_search, width:30,},
            {type:'date', placeholder:"To Date...", value: date_to_search, width:30,},
            {type:'text', placeholder:"Done By...", value: done_by_search, width:44,},
            {
                type:'search-dropdown', value: items_array, width:44, componentKey: itemComponentKey,
                selectOptions: items_array,optionSelected: handleSelectedItem,
                searchPlaceholder: 'Item...', dropdownWidth: '300px',
                fetchData: fetchItems(), clearSearch: clearSelectedItem
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
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                item: itemID.value,
                counter: counterID.value,
                channel: channelID.value,
                done_by: done_by_search.value,
                sale_category: "Sale",
                outlet: outletID.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/sale-items-search/?page=${currentPage.value}`,formData)
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
        }
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
            date_from_search.value = "";
            date_to_search.value = "";
            done_by_search.value = "";
            countComponentKey.value += 1;
            outComponentKey.value += 1;
            chanComponentKey.value += 1;
            itemComponentKey.value += 1;
            outletID.value = "";
            counterID.value = "";
            channelID.value = "";
            itemID.value = "";
            searchItems();
        }
        const closeModal = () =>{

        }
        const printItemsList = () =>{
            showLoader();
            let formData = {
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                item: itemID.value,
                counter: counterID.value,
                channel: channelID.value,
                done_by: done_by_search.value,
                sale_category: "Sale",
                outlet: outletID.value,
                company_id: companyID.value
            } 

            axios
            .post("api/v1/export-sale-items-pdf/", formData, { responseType: 'blob' })
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
        })
        return{
            currentPage,showAddButton,showActions,showTotals,title, searchItems, idField, selectedIds, actions, itemsList, propArrLen,propCount,propResults,appModalVisible,
            searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,
            showNextBtn,showPreviousBtn,displayButtons,printModalVisible,pdfUrl, printTitle,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            closeModal, handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,printItemsList,selectedValue,selectSearchQuantity
        }
    }
}
</script>
