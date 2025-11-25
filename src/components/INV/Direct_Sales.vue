<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewSale"
            :searchFilters="searchFilters"
            @searchPage="searchSales"
            @resetFilters="resetFilters"
            @removeItem="removeSale"
            @removeSelectedItems="removeSales"
            @printList="printSalesList"
            v-model:printModalVisible="printModalVisible"
            :printTitle="printTitle"
            :pdfUrl="pdfUrl"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="salesList"
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
                        <JournalEntries 
                            :detailRows="journalEntries"
                        />
                    </div>
                    <div v-if="activeTab == 1">
                        <SaleItems 
                            :saleItemsRows="itemLines"
                        />
                    </div>
                </div>
                
            </div>
        </PageComponent>
        <PrintModal v-model:visible="printModalVisible1" :title="printTitle1" >
            <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="100%" type="application/pdf" style="border: none;"></iframe>
        </PrintModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import JournalEntries from "@/components/JournalEntries.vue";
import SaleItems from "@/components/SaleItems.vue";
import PrintJS from 'print-js';
import PrintModal from '@/components/PrintModal.vue';

export default{
    name: 'Direct_Sales',
    components:{
        PageComponent,JournalEntries,SaleItems,PrintModal
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const catComponentKey = ref('');
        const defaultSettings = computed(()=> store.state.userData.defaultSettings);
        const idField = 'sale_id';
        const addButtonLabel = ref('New Direct Sale');
        const addingRight = ref('Adding Inventory Sale');
        const rightsModule = ref('Inventory');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const salesList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const selectedValue = ref(50);
        const detailsTitle = ref('Item Details');
        const tabs = ref(['Journal Entries','Sale Items']);
        const activeTab = ref(0);
        const saleID = ref(null);
        const showDetails = ref(false);
        const journalEntries = ref([]);
        const itemLines = ref([]);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const printModalVisible = ref(false);
        const printModalVisible1 = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Direct Sales List');
        const printTitle1 = ref('Print Sale Receipt');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"sale_code"},
            {label: "Date", key:"date"},
            {label: "Outlet", key: "outlet_name"},
            {label: "Customer", key:"client"},
            {label: "Phone No", key:"client_phone_number"},
            {label: "Amnt", key:"total_amount", type: "number", txtColor:"txtColorPaid"},
            {label: "Paid", key:"total_paid", type: "number"},
            {label: "Bal.", key:"balance", type: "number", txtColor:"txtColorBal"},
            {label: "Rcpt No", key:"receipt_no"},
            {label: "Ref No", key:"reference_no"},
            {label: "Done By", key:"done_by"},
        ]);
        const showTotals = ref(true);
        const actions = ref([
            {name: 'print', icon: 'fa fa-print', title: 'Print Receipt', rightName: 'Print Inventory Sales'},
            {name: 'download', icon: 'fa fa-download', title: 'Download Receipt', rightName: 'Print Inventory Sales'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Sale', rightName: 'Deleting Inventory Sale'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const categoryID = ref(null);
        const sale_code_search = ref('');
        const min_amount_search = ref('');
        const max_amount_search = ref('');
        const done_by_search = ref('');
        const date_from_search = ref('');
        const date_to_search = ref('');
        const customer_search = ref('');

        const searchFilters = ref([
            {type:'text', placeholder:"Code...", value: sale_code_search, width:40,},
            {type:'text', placeholder:"Customer...", value: customer_search, width:48,},
            {type:'date', placeholder:"From Date...", value: date_from_search, width:30,},
            {type:'date', placeholder:"To Date...", value: date_to_search, width:30,},
            {type:'text', placeholder:"Min Amount...", value: min_amount_search, width:36,},
            {type:'text', placeholder:"Max Amount...", value: max_amount_search, width:36,},
            {type:'text', placeholder:"Done By...", value: done_by_search, width:48,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const removeSale = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    sales_array: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Direct_Sales/deleteSale',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Sale Removed Succesfully");
                        searchSales();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Sale: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Sale") 
            }else{
                toast.error("Please Select A Sale To Remove")
            }
        }
        const removeSales = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    sales_array: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Direct_Sales/deleteSale',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Sale(s) Removed Succesfully");
                        searchSales();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Sales: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select Sales To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchSales = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                sale_code: sale_code_search.value,
                sale_type: "Cash",
                category: "Sale",
                max_amount: max_amount_search.value,
                min_amount: min_amount_search.value,
                customer: customer_search.value,
                done_by: done_by_search.value,
                company_id: companyID.value,
                user: userID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/inventory-sale-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                salesList.value = response.data.results;
                store.commit('Direct_Sales/LIST_SALES', salesList.value)
                propResults.value = response.data;
                propArrLen.value = salesList.value.length;
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
            searchSales(selectedValue.value);
        }
        const resetFilters = () =>{
            date_from_search.value = '';
            date_to_search.value = '';
            sale_code_search.value = '';   
            min_amount_search.value = '';
            max_amount_search.value = '';
            customer_search.value = '';
            done_by_search.value = '';
            currentPage.value = 1;
            selectedValue.value = 50;
            searchSales();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchSales();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchSales();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchSales();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchSales();
            // scrollToTop();
        };
        const fetchDefaultSettings = async() =>{
            for(let i=0; i < defaultSettings.value.length; i++){
                if(defaultSettings.value[i].setting_name === 'Default Retail Outlet'){
                    store.dispatch('Direct_Sales/updateState', {defaultOutlet:defaultSettings.value[i].setting_value_name, defaultOutletID:defaultSettings.value[i].setting_value})
                }else if(defaultSettings.value[i].setting_name === 'Default Outlet Counter'){
                    store.dispatch('Direct_Sales/updateState', {defaultCounter:defaultSettings.value[i].setting_value_name, defaultCounterID:defaultSettings.value[i].setting_value})
                }else if(defaultSettings.value[i].setting_name === 'Default Counter Channel'){
                    store.dispatch('Direct_Sales/updateState', {defaultChannel:defaultSettings.value[i].setting_value_name, defaultChannelID:defaultSettings.value[i].setting_value})
                }else if(defaultSettings.value[i].setting_name === 'Default Stock Type'){
                    store.dispatch('Direct_Sales/updateState', {defaultStockType:defaultSettings.value[i].setting_value_name})
                }
            }
        };
        const addNewSale = () =>{
            store.commit('Direct_Sales/initializeStore');
            store.commit('pageTab/ADD_PAGE', {'INV':'Sale_Details'});
            store.state.pageTab.invActiveTab = 'Sale_Details';         
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const saleID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    sales_array: saleID
                }
                await store.dispatch('Direct_Sales/deleteSale',formData).
                then(()=>{
                    searchSales();
                })
            }else if(action == 'print'){
                showLoader();
                const saleID = row[idField];
                let formData = {
                    inventory_sale: saleID,
                    company: companyID.value
                }
                const response = await store.dispatch('Direct_Sales/previewSaleReceipt',formData)
                if (response && response.status === 200) {
                    const blob = new Blob([response.data], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    pdfUrl.value = url; // reuse your same modal iframe
                    printModalVisible1.value = true;
                }
                 // Request HTML version for thermal print
                // const response = await axios.post('/api/v1/export-direct-sales-thermal-receipt/',formData,{ responseType: 'text' });
                
                // if (response && response.status === 200) {
                //     // Open the thermal view in a new tab/window for printing
                //     const newWindow = window.open('', '_blank');
                //     newWindow.document.open();
                //     newWindow.document.write(response.data);
                //     newWindow.document.close();
                // }
                hideLoader();
            }else if(action == 'download'){
                showLoader();
                const saleID = row[idField];
                let formData = {
                    inventory_sale: saleID,
                    company: companyID.value
                }
                await store.dispatch('Direct_Sales/downloadClientReceipt',formData).
                then(()=>{
                    hideLoader();
                })
            }
        };
        const handleShowDetails = async(row) =>{
            activeTab.value = 0;
            saleID.value = row['sale_id'];
            detailsTitle.value = row['sale_code'] + ' Details';
            showDetails.value = true;
            let formData = {
                client_id: row['sale_id'],
                company: companyID.value
            }
            axios.post('api/v1/inventory-journal-entries-search/',formData)
            .then((response)=>{
                journalEntries.value = response.data.journal_entries;
            })
            .catch((error)=>{
                console.log(error.message)
            })
        };
        const selectTab = async(index) => {
            let formData = {
                company: companyID.value,
                sale: saleID.value,
            }
            if(index == 1){
                activeTab.value = index;
                await axios.post('api/v1/inventory-sale-items-search/',formData)
                .then((response)=>{
                    itemLines.value = response.data.saleItems;
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
        const printSalesList = () =>{
            showLoader();

            let formData = {
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                sale_code: sale_code_search.value,
                sale_type: "Cash",
                category: "Sale",
                max_amount: max_amount_search.value,
                min_amount: min_amount_search.value,
                customer: customer_search.value,
                done_by: done_by_search.value,
                company_id: companyID.value,
                
            } 
   
            axios
            .post("api/v1/export-inventory-sales-pdf/", formData, { responseType: 'blob' })
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
            fetchDefaultSettings();
            searchSales();
            
        })
        return{
            currentPage,showTotals,searchSales,resetFilters, addButtonLabel, searchFilters, tableColumns, salesList,propResults, propArrLen, 
            propCount, pageCount, showNextBtn, showPreviousBtn,printModalVisible,printModalVisible1,pdfUrl, printTitle,printTitle1,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewSale, showLoader, loader, hideLoader, removeSale, removeSales,
            handleSelectionChange,addingRight,rightsModule,printSalesList,selectedValue,selectSearchQuantity,showDetails,
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