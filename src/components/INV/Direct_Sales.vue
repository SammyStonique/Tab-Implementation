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
            @printList="printList"
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

export default{
    name: 'Direct_Sales',
    components:{
        PageComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const catComponentKey = ref('');
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
            {label: "Rcpt No", key:"receipt_no"},
            {label: "Done By", key:"done_by"},
        ]);
        const showTotals = ref(true);
        const actions = ref([
            {name: 'print', icon: 'fa fa-print', title: 'Print Receipt', rightName: 'Print Inventory Sales'},
            {name: 'download', icon: 'fa fa-download', title: 'Download Receipt', rightName: 'Print Inventory Sales'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Sale', rightName: 'Deleting Inventory Sale'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const categoryID = ref(null);
        const sale_code_search = computed({
            get: () => store.state.Direct_Sales.sale_code_search,
            set: (value) => store.commit('Direct_Sales/SET_SEARCH_FILTERS', {"sale_code_search":value}),
        });

        const min_amount_search = computed({
            get: () => store.state.Direct_Sales.min_amount_search,
            set: (value) => store.commit('Direct_Sales/SET_SEARCH_FILTERS', {"min_amount_search":value}),
        });
        const max_amount_search = computed({
            get: () => store.state.Direct_Sales.max_amount_search,
            set: (value) => store.commit('Direct_Sales/SET_SEARCH_FILTERS', {"max_amount_search":value}),
        });

        const done_by_search = computed({
            get: () => store.state.Direct_Sales.done_by_search,
            set: (value) => store.commit('Direct_Sales/SET_SEARCH_FILTERS', {"done_by_search":value}),
        });
        const date_from_search = computed({
            get: () => store.state.Direct_Sales.date_from_search,
            set: (value) => store.commit('Direct_Sales/SET_SEARCH_FILTERS', {"date_from_search":value}),
        });
        const date_to_search = computed({
            get: () => store.state.Direct_Sales.date_to_search,
            set: (value) => store.commit('Direct_Sales/SET_SEARCH_FILTERS', {"date_to_search":value}),
        });
        const customer_search = computed({
            get: () => store.state.Direct_Sales.customer_search,
            set: (value) => store.commit('Direct_Sales/SET_SEARCH_FILTERS', {"customer_search":value}),
        });

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
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/inventory-sale-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                salesList.value = response.data.results;
                store.commit('Direct_Sales/LIST_SALES', salesList.value)
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
            store.commit('Direct_Sales/RESET_SEARCH_FILTERS')
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
        }
        const addNewSale = async() =>{
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
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchSales();
            
        })
        return{
            showTotals,searchSales,resetFilters, addButtonLabel, searchFilters, tableColumns, salesList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewSale, showLoader, loader, hideLoader, removeSale, removeSales,
            handleSelectionChange,addingRight,rightsModule
        }
    }
};
</script>