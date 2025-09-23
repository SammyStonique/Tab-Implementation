<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewPurchase"
            :searchFilters="searchFilters"
            @searchPage="searchPurchases"
            @resetFilters="resetFilters"
            @removeItem="removePurchase"
            @removeSelectedItems="removePurchases"
            @printList="printPurchasesList"
            v-model:printModalVisible="printModalVisible"
            :printTitle="printTitle"
            :pdfUrl="pdfUrl"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="purchasesList"
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

export default{
    name: 'Purchase_Orders',
    components:{
        PageComponent,JournalEntries,SaleItems,
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const catComponentKey = ref('');
        const defaultSettings = computed(()=> store.state.userData.defaultSettings);
        const idField = 'sale_id';
        const addButtonLabel = ref('New Purchase Order');
        const addingRight = ref('Adding Inventory Purchase Order');
        const rightsModule = ref('Inventory');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const purchasesList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const detailsTitle = ref('Item Details');
        const tabs = ref(['Journal Entries','Purchase Items']);
        const activeTab = ref(0);
        const saleID = ref(null);
        const showDetails = ref(false);
        const journalEntries = ref([]);
        const itemLines = ref([]);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const printModalVisible = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Purchase Orders List');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"sale_code"},
            {label: "Date", key:"date"},
            {label: "Outlet", key: "outlet_name"},
            {label: "Vendor", key:"client"},
            {label: "Phone No", key:"client_phone_number"},
            {label: "Amount", key:"total_amount", type: "number"},
            {label: "Paid", key:"total_paid", type: "number"},
            {label: "Balance", key:"balance", type: "number"},
            {label: "Status", key:"status", textColor: "textColor"},
            {label: "Done By", key:"done_by"},
        ]);
        const showTotals = ref(true);
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Purchase Order', rightName: 'Editing Inventory Purchase Order'},
            {name: 'receive', icon: 'fa fa-truck', title: 'Receive Purchase Order', rightName: 'Receive Purchase Order'},
            {name: 'print', icon: 'fa fa-print', title: 'Print Purchase Order', rightName: 'Print Inventory Purchase Orders'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Purchase Order', rightName: 'Deleting Inventory Purchase Order'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const categoryID = ref(null);
        const sale_code_search = ref("");
        const min_amount_search = ref("");
        const max_amount_search = ref("");
        const done_by_search = ref("");
        const date_from_search = ref("");
        const date_to_search = ref("");
        const customer_search = ref("");

        const searchFilters = ref([
            {type:'text', placeholder:"Code...", value: sale_code_search, width:40,},
            {type:'text', placeholder:"Vendor...", value: customer_search, width:48,},
            {type:'date', placeholder:"From Date...", value: date_from_search, width:30,},
            {type:'date', placeholder:"To Date...", value: date_to_search, width:30,},
            {type:'text', placeholder:"Min Amount...", value: min_amount_search, width:36,},
            {type:'text', placeholder:"Max Amount...", value: max_amount_search, width:36,},
            {type:'text', placeholder:"Done By...", value: done_by_search, width:48,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const removePurchase = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    purchases_array: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Direct_Purchases/deletePurchaseOrder',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Purchase Order Removed Succesfully");
                        searchPurchases();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Purchase Order: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Purchase Order") 
            }else{
                toast.error("Please Select A Purchase Order To Remove")
            }
        }
        const removePurchases = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    purchases_array: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Direct_Purchases/deletePurchaseOrder',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Purchase Order(s) Removed Succesfully");
                        searchPurchases();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Purchase Order: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select Purchase Order To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchPurchases = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                sale_code: sale_code_search.value,
                sale_type: "Credit",
                category: "Purchase",
                max_amount: max_amount_search.value,
                min_amount: min_amount_search.value,
                customer: customer_search.value,
                done_by: done_by_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/inventory-sale-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                purchasesList.value = response.data.results;
                propResults.value = response.data;
                propArrLen.value = purchasesList.value.length;
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
            searchPurchases(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1,
            selectedValue.value = 50,
            date_from_search.value = "",
            date_to_search.value = "",
            sale_code_search.value = "",
            max_amount_search.value = "",
            min_amount_search.value = "",
            customer_search.value = "",
            done_by_search.value = "",
            searchPurchases();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchPurchases();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchPurchases();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchPurchases();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchPurchases();
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
        const addNewPurchase = () =>{
            // store.commit('Direct_Sales/initializeStore');
            store.commit('pageTab/ADD_PAGE', {'INV':'Purchase_Order_Details'});
            store.state.pageTab.invActiveTab = 'Purchase_Order_Details';         
        };
        const fetchPurchaseOrderItems = async(purchaseID) =>{
            let formData = {
                sale: purchaseID,
                inventory_item: "",
                company_id: companyID.value
            }
            await store.dispatch('Items_Catalog/fetchPurchaseOrderItems',formData)
        };
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'edit'){
                const order_delivery = row['sale_delivery'];
                if(order_delivery == "Delivered"){
                    toast.error("Cannot Edit Received Order")
                }else{
                    await store.dispatch('Direct_Purchases/updateState',{saveButtonLabel: 'Save', isEditing: true})
                    await store.dispatch('Items_Catalog/updateState',{lineItemsArray:[]})
                    const purchaseID = row[idField];
                    let formData = {
                        company: companyID.value,
                        inventory_sale: purchaseID
                    }
                    fetchPurchaseOrderItems(purchaseID);
                    await store.dispatch('Direct_Purchases/fetchPurchase',formData);
                    store.commit('pageTab/ADD_PAGE', {'INV':'Purchase_Order_Details'});
                    store.state.pageTab.invActiveTab = 'Purchase_Order_Details';
                }
            }
            else if(action == 'receive'){
                const order_delivery = row['sale_delivery'];
                if(order_delivery == "Delivered"){
                    toast.error("Order Already Received")
                }else{
                    await store.dispatch('Direct_Purchases/updateState',{saveButtonLabel: 'Receive', isDelivering: true})
                    await store.dispatch('Items_Catalog/updateState',{lineItemsArray:[]})
                    const purchaseID = row[idField];
                    let formData = {
                        company: companyID.value,
                        inventory_sale: purchaseID
                    }
                    fetchPurchaseOrderItems(purchaseID);
                    await store.dispatch('Direct_Purchases/fetchPurchase',formData);
                    store.commit('pageTab/ADD_PAGE', {'INV':'Purchase_Order_Details'});
                    store.state.pageTab.invActiveTab = 'Purchase_Order_Details';
                }             
            }
            else if(action == 'delete'){
                const saleID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    purchases_array: saleID
                }
                await store.dispatch('Direct_Purchases/deletePurchaseOrder',formData).
                then(()=>{
                    searchPurchases();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
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
                company_id: companyID.value,
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
        const printPurchasesList = () =>{
            showLoader();

            let formData = {
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                sale_code: sale_code_search.value,
                sale_type: "Credit",
                category: "Purchase",
                max_amount: max_amount_search.value,
                min_amount: min_amount_search.value,
                customer: customer_search.value,
                done_by: done_by_search.value,
                company_id: companyID.value
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
            searchPurchases();
            
        })
        return{
            currentPage,showTotals,searchPurchases,resetFilters, addButtonLabel, searchFilters, tableColumns, purchasesList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,printModalVisible,pdfUrl, printTitle,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewPurchase, showLoader, loader, hideLoader, removePurchase, removePurchases,
            handleSelectionChange,addingRight,rightsModule,printPurchasesList,selectSearchQuantity,selectedValue,showDetails,
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