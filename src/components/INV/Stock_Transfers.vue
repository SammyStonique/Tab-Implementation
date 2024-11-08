<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewTransfer"
            :searchFilters="searchFilters"
            @searchPage="searchTransfers"
            @resetFilters="resetFilters"
            @removeItem="removeTransfer"
            @removeSelectedItems="removeTransfers"
            @printList="printTransfersList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="transfersList"
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
    name: 'Stock_Transfers',
    components:{
        PageComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const catComponentKey = ref('');
        const defaultSettings = computed(()=> store.state.Default_Settings.settingsList);
        const idField = 'stock_transfer_id';
        const addButtonLabel = ref('New Stock Transfer');
        const addingRight = ref('Inventory Stock Transfer');
        const rightsModule = ref('Inventory');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const transfersList = ref([]);
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
            {label: "Code", key:"transfer_code"},
            {label: "Date", key:"date"},
            {label: "Outlet From", key: "from_location_name"},
            {label: "Outlet To", key: "to_location_name"},
            {label: "Qty", key: "quantity", type: "number"},
            {label: "Done By", key:"done_by"},
            {label: "Notes", key:"transfer_notes"},
        ]);
        const showTotals = ref(true);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Transfer', rightName: 'Deleting Stock Transfer'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const categoryID = ref(null);
        const transfer_code_search = computed({
            get: () => store.state.Stock_Transfers.transfer_code_search,
            set: (value) => store.commit('Stock_Transfers/SET_SEARCH_FILTERS', {"transfer_code_search":value}),
        });

        const done_by_search = computed({
            get: () => store.state.Stock_Transfers.done_by_search,
            set: (value) => store.commit('Stock_Transfers/SET_SEARCH_FILTERS', {"done_by_search":value}),
        });
        const date_from_search = computed({
            get: () => store.state.Stock_Transfers.date_from_search,
            set: (value) => store.commit('Stock_Transfers/SET_SEARCH_FILTERS', {"date_from_search":value}),
        });
        const date_to_search = computed({
            get: () => store.state.Stock_Transfers.date_to_search,
            set: (value) => store.commit('Stock_Transfers/SET_SEARCH_FILTERS', {"date_to_search":value}),
        });
        const from_location_search = computed({
            get: () => store.state.Stock_Transfers.from_location_search,
            set: (value) => store.commit('Stock_Transfers/SET_SEARCH_FILTERS', {"from_location_search":value}),
        });
        const to_location_search = computed({
            get: () => store.state.Stock_Transfers.to_location_search,
            set: (value) => store.commit('Stock_Transfers/SET_SEARCH_FILTERS', {"to_location_search":value}),
        });

        const searchFilters = ref([
            {type:'text', placeholder:"Code...", value: transfer_code_search, width:40,},
            {type:'text', placeholder:"Outlet From...", value: from_location_search, width:48,},
            {type:'text', placeholder:"Outlet To...", value: to_location_search, width:48,},
            {type:'date', placeholder:"From Date...", value: date_from_search, width:30,},
            {type:'date', placeholder:"To Date...", value: date_to_search, width:30,},
            {type:'text', placeholder:"Done By...", value: done_by_search, width:48,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const removeTransfer = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    stock_transfer: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Stock_Transfers/deleteStockTransfer',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Transfer Removed Succesfully");
                        searchTransfers();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Transfer: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Transfer") 
            }else{
                toast.error("Please Select A Transfer To Remove")
            }
        }
        const removeTransfers = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    stock_transfer: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Stock_Transfers/deleteStockTransfer',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Transfer(s) Removed Succesfully");
                        searchTransfers();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Transfers: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select Transfers To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchTransfers = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                transfer_code: transfer_code_search.value,
                from_location: from_location_search.value,
                to_location: to_location_search.value,
                done_by: done_by_search.value,
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/stock-transfer-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                transfersList.value = response.data.results;
                store.commit('Stock_Transfers/LIST_TRANSFERS', transfersList.value)
                propResults.value = response.data;
                propArrLen.value = transfersList.value.length;
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
            store.commit('Stock_Transfers/RESET_SEARCH_FILTERS')
            searchTransfers();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchTransfers();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchTransfers();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchTransfers();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchTransfers();
            // scrollToTop();
        };
        const addNewTransfer = () =>{
            store.commit('Stock_Transfers/initializeStore');
            store.commit('pageTab/ADD_PAGE', {'INV':'Stock_Transfer_Details'});
            store.state.pageTab.invActiveTab = 'Stock_Transfer_Details';         
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const transferID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    stock_transfer: transferID
                }
                await store.dispatch('Stock_Transfers/deleteStockTransfer',formData).
                then(()=>{
                    searchTransfers();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printTransfersList = () =>{
            showLoader();

            let formData = {
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                transfer_code: transfer_code_search.value,
                from_location: from_location_search.value,
                to_location: to_location_search.value,
                done_by: done_by_search.value,
                company_id: companyID.value
            } 
   
            axios
            .post("api/v1/export-stock-transfers-pdf/", formData, { responseType: 'blob' })
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
            searchTransfers();
            
        })
        return{
            showTotals,searchTransfers,resetFilters, addButtonLabel, searchFilters, tableColumns, transfersList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewTransfer, showLoader, loader, hideLoader, removeTransfer, removeTransfers,
            handleSelectionChange,addingRight,rightsModule,printTransfersList
        }
    }
};
</script>