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
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="salesList"
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
    name: 'Sale_Orders',
    components:{
        PageComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const catComponentKey = ref('');
        const defaultSettings = computed(()=> store.state.Default_Settings.settingsList);
        const idField = 'sale_id';
        const addButtonLabel = ref('New Sale Order');
        const addingRight = ref('Adding Inventory Sale Order');
        const rightsModule = ref('Inventory');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const salesList = ref([]);
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
            {label: "Code", key:"sale_code"},
            {label: "Date", key:"date"},
            {label: "Outlet", key: "outlet_name"},
            {label: "Customer", key:"client"},
            {label: "Phone No", key:"client_phone_number"},
            {label: "Amount", key:"total_amount", type: "number"},
            {label: "Status", key:"status"},
            {label: "Done By", key:"done_by"},
        ]);
        const showTotals = ref(true);
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Sale Order', rightName: 'Editing Inventory Sale Order'},
            {name: 'deliver', icon: 'fa fa-truck', title: 'Deliver Sale Order', rightName: 'Deliver Sale Order'},
            {name: 'print', icon: 'fa fa-print', title: 'Print Sale Order', rightName: 'Print Inventory Sales'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Sale Order', rightName: 'Deleting Inventory Sale Order'},
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
                    const response = await store.dispatch('Direct_Sales/deleteSaleOrder',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Sale Order Removed Succesfully");
                        searchSales();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Sale Order: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Sale Order") 
            }else{
                toast.error("Please Select A Sale Order To Remove")
            }
        }
        const removeSales = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    sales_array: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Direct_Sales/deleteSaleOrder',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Sale Order(s) Removed Succesfully");
                        searchSales();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Sale Orders: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select Sale Orders To Remove")
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
            showPreviousBtn.value = false;
            let formData = {
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                sale_code: sale_code_search.value,
                sale_type: "Credit",
                category: "Sale",
                max_amount: max_amount_search.value,
                min_amount: min_amount_search.value,
                customer: customer_search.value,
                done_by: done_by_search.value,
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/inventory-sale-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                salesList.value = response.data.results;
                propResults.value = response.data;
                propArrLen.value = salesList.value.length;
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
            date_from_search.value = "",
            date_to_search.value = "",
            sale_code_search.value = "",
            max_amount_search.value = "",
            min_amount_search.value = "",
            customer_search.value = "",
            done_by_search.value = "",
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
            await store.dispatch('Default_Settings/fetchDefaultSettings', {company:companyID.value})
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
        const addNewSale = async() =>{
            // store.commit('Direct_Sales/initializeStore');
            await store.dispatch('Direct_Sales/updateState',{saveButtonLabel: 'Save', selectedCustomer: null, isEditing: false, isDelivering:false})
            await store.dispatch('Items_Catalog/updateState',{lineItemsArray:[]})
            store.commit('pageTab/ADD_PAGE', {'INV':'Sale_Order_Details'});
            store.state.pageTab.invActiveTab = 'Sale_Order_Details';         
        };
        const fetchSaleOrderItems = async(saleID) =>{
            let formData = {
                sale: saleID,
                inventory_item: "",
                company_id: companyID.value
            }
            await store.dispatch('Items_Catalog/fetchSaleOrderItems',formData)
        };
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'edit'){
                const order_delivery = row['sale_delivery'];
                if(order_delivery == "Delivered"){
                    toast.error("Cannot Edit Delivered Order")
                }else{
                    await store.dispatch('Direct_Sales/updateState',{saveButtonLabel: 'Save', isEditing: true})
                    await store.dispatch('Items_Catalog/updateState',{lineItemsArray:[]})
                    const saleID = row[idField];
                    let formData = {
                        company: companyID.value,
                        inventory_sale: saleID
                    }
                    fetchSaleOrderItems(saleID);
                    await store.dispatch('Direct_Sales/fetchSale',formData);
                    store.commit('pageTab/ADD_PAGE', {'INV':'Sale_Order_Details'});
                    store.state.pageTab.invActiveTab = 'Sale_Order_Details';
                }
            }
            else if(action == 'deliver'){
                const order_delivery = row['sale_delivery'];
                if(order_delivery == "Delivered"){
                    toast.error("Order Already Delivered")
                }else{
                    await store.dispatch('Direct_Sales/updateState',{saveButtonLabel: 'Deliver', isDelivering: true})
                    await store.dispatch('Items_Catalog/updateState',{lineItemsArray:[]})
                    const saleID = row[idField];
                    let formData = {
                        company: companyID.value,
                        inventory_sale: saleID
                    }
                    fetchSaleOrderItems(saleID);
                    await store.dispatch('Direct_Sales/fetchSale',formData);
                    store.commit('pageTab/ADD_PAGE', {'INV':'Sale_Order_Details'});
                    store.state.pageTab.invActiveTab = 'Sale_Order_Details';
                }             
            }
            else if(action == 'delete'){
                const saleID = [row[idField]];
                const order_delivery = row['sale_delivery'];
                if(order_delivery == "Delivered"){
                    toast.error("Cannot Delete Delivered Sale Order")
                }else{
                    let formData = {
                        company: companyID.value,
                        sales_array: saleID
                    }
                await store.dispatch('Direct_Sales/deleteSaleOrder',formData).
                then(()=>{
                    searchSales();
                })
                }
                
            }
            else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printSalesList = () =>{
            showLoader();

            let formData = {
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                sale_code: sale_code_search.value,
                sale_type: "Credit",
                category: "Sale",
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
            fetchDefaultSettings();
            searchSales();
            
        })
        return{
            showTotals,searchSales,resetFilters, addButtonLabel, searchFilters, tableColumns, salesList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewSale, showLoader, loader, hideLoader, removeSale, removeSales,
            handleSelectionChange,addingRight,rightsModule,printSalesList
        }
    }
};
</script>