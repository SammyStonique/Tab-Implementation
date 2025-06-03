<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewSale"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchAssetSales"
            @resetFilters="resetFilters"
            @importData="importMembers"
            @removeItem="removeAssetSale"
            @removeSelectedItems="removeAssetSales"
            @printList="printSalesList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="salesList"
            :actions="actions"
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
                    <div v-show="activeTab == 0">
                        <LoanSchedules 
                            :loanSchedulesRows="loanScheduleRows"
                        />
                    </div>
                    <div v-show="activeTab == 1">
                        <div class="border border-slate-200 rounded relative py-2 w-[75%] mt-3 px-2 min-h-[50px]">                    
                            <ShowDetailsTable :key="tableKey" :columns="itemColumns" :rows="saleItemsRows" :idField="idFieldCharge" :actions="actionCharges" :showActions="showActions" :rightsModule="rightsModule" />
                        </div>
                    </div>
                </div>
                
            </div>
        </PageComponent>
    </div>
    
    <MovableModal v-model:visible="transModalVisible" :title="transTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="trans_modal_loader" @showLoader="showTransModalLoader" @hideLoader="hideTransModalLoader" @closeModal="closeTransModal">
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="approveSale" @handleReset="handleReset"
        />
    </MovableModal>

</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';
import MovableModal from '@/components/MovableModal.vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import ShowDetailsTable from '@/components/ShowDetailsTable.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import LoanSchedules from "@/components/LoanSchedules.vue";
import Swal from 'sweetalert2';

export default{
    name: 'Asset_Sales',
    components:{
        PageComponent,MovableModal,SearchableDropdown,DynamicForm,LoanSchedules,ShowDetailsTable
    },
    setup(){

        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const displayButtons = ref(true);
        const unitComponentKey = ref(0);
        const catSearchComponentKey = ref(0);
        const trans_modal_loader = ref('none');
        const member_status = ref('');
        const exit_date = ref('');
        const idField = 'asset_sale_id';
        const addButtonLabel = ref('New Sale');
        const addingRight = ref('Adding Asset Sales');
        const removingRight = ref('');
        const rightsModule = ref('PSS');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const salesList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const showDetails = ref(false);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const detailsTitle = ref('Sale Documents');
        const transTitle = ref('Approve/Reject Sale');
        const loanScheduleRows = ref([]);
        const saleItemsRows = ref([]);
        const showActions = ref(false);
        const tabs = ref(['Repayment Schedule','Sold Units']);
        const activeTab = ref(0);
        const appID = ref(null);
        const transModalVisible = ref(false);
        const dropdownWidth = ref("500px")
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('45vw');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Code", key:"sale_code"},
            {label: "Asset Name", key:"asset"},
            {label: "Client Name", key: "customer"},
            {label: "Sales Plan", key:"payment_plan"},
            {label: "Amount", key:"formatted_total_amount"},
            {label: "Done By", key:"done_by"},
            {label: "Status", key:"approval_status", textColor: "textColor"},
            {label: "Exempt", key:"exempt_penalty"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Sale', rightName: 'Editing Asset Sales'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Sale', rightName: 'Viewing Asset Sales'},
        ]);
        const itemColumns = ref([
            {label: "Unit Number", key:"unit_number", type: "text", editable: false},
            {label: "Selling Price", key:"unit_selling_price", type: "number", editable: false},
            {label: "Discount", key:"discount", type: "number", editable: false},
            {label: "Charges", key:"charges_amount", type: "number", editable: false},
            {label: "Total", key:"sale_total_amount", type: "number", editable: false},
        ]);
        const companyID = computed(()=> store.state.userData.company_id);
        const agentAssets = computed(()=> store.state.userData.agentAssets);
        const salesAgentID = computed(()=> store.state.userData.salesAgentID);
        const saleID = ref("");
        const saleAmount = ref(0);
        const client_name_search = ref('');
        const client_code_search = ref("");
        const asset_name_search = ref('');
        const asset_code_search = ref("");
        const sale_code_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
 
        const searchFilters = ref([
            {type:'text', placeholder:"Sale Code...", value: sale_code_search, width:32,},
            {type:'text', placeholder:"Asset Code...", value: asset_code_search, width:32,},
            {type:'text', placeholder:"Asset Name...", value: asset_name_search, width:48,},
            {type:'text', placeholder:"Client Code...", value: client_code_search, width:32,},
            {type:'text', placeholder:"Client Name...", value: client_name_search, width:48,},
            {type:'date', title: "From Date", placeholder:"From Date...", value: from_date_search, width:32,},
            {type:'date', title: "To Date",placeholder:"To Date...", value: to_date_search, width:32,},

        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const importMembers = () =>{
            
        };
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'dropdown', name: 'approval_status',label: "Status", value: '', placeholder: "", required: true, options: [{ text: 'Approve', value: 'Approved' }, { text: 'Reject', value: 'Rejected' }] },
            ]
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }

        const removeAssetSale = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    asset_sale: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Asset_Sales/deleteAssetSale',formData)
                    if(response && response.status == 200){
                        toast.success("Sale Removed Succesfully");
                        searchAssetSales();
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
        const removeAssetSales = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    asset_sale: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Asset_Sales/deleteAssetSale',formData)
                    if(response && response.status == 200){
                        toast.success("Sale(s) Removed Succesfully");
                        searchPropertys();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Sale: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Sale To Remove")
            }
        };
        const showTransModalLoader = () =>{
            trans_modal_loader.value = "block";
        }
        const hideTransModalLoader = () =>{
            trans_modal_loader.value = "none";
        }
        const approveSale = async() =>{
            showTransModalLoader();
            let formData = {
                asset_sale: saleID.value,
                sale_amount: saleAmount.value,
                approval_status: formFields.value[0].value,
                company: companyID.value
            }

            axios.post(`api/v1/approve-asset-sale/`,formData)
            .then((response)=>{
            if(response.data.msg == "Success"){
                hideTransModalLoader();
                closeTransModal();
                toast.success("Success")
                searchAssetSales();
            }else{
                toast.error("Error");
                hideTransModalLoader();
            }                   
            })
            .catch((error)=>{
                toast.error(error.message);
                hideTransModalLoader();
            })
        };
        const closeTransModal = () =>{
            transModalVisible.value = false;
            saleID.value = null;
            saleAmount.value = 0;
            hideTransModalLoader();
        };
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }

        const searchAssetSales = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                asset_name: asset_name_search.value,
                asset_code: asset_code_search.value,
                sale_code: sale_code_search.value,
                client_name: client_name_search.value,
                client_code: client_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                sale_type: "New",
                sales_agent: salesAgentID.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/asset-sales-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                salesList.value = response.data.results;
                store.commit('Asset_Sales/LIST_SALES', salesList.value)
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
            searchAssetSales(selectedValue.value);
        };
        const resetFilters = () =>{
            catSearchComponentKey.value += 1;;
            selectedValue.value = 50;
            currentPage.value = 1;
            client_name_search.value = "";
            asset_name_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            asset_code_search.value = "";
            sale_code_search.value = "";
            client_code_search.value = "";
            searchAssetSales();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchAssetSales();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchAssetSales();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchAssetSales();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchAssetSales();
            // scrollToTop();
        }
        const addNewSale = async() =>{
            store.commit('Asset_Sales/initializeStore');
            await store.dispatch('Asset_Sales/updateState', {selectedSale: null, selectedAgent: null, selectedPlan: null, selectedAsset: null, selectedClient: null,saleCharges:[],saleUnits:[],assetSchedules:[], isEditing:false});
            await store.dispatch('Asset_Fees/updateState', {saleFeeArray: []})
            await store.dispatch("Asset_Units/updateState", {unitArray: []})
            await store.dispatch("Payment_Plans/updateState", {salePlanArray: []})
            store.commit('pageTab/ADD_PAGE', {'SAP':'Sale_Details'});
            store.state.pageTab.sapActiveTab = 'Sale_Details';          
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const assetStatus = row['approval_status']
                if(assetStatus == 'Pending'){
                    await store.dispatch('Asset_Sales/updateState', {selectedSale: null, selectedAgent: null, selectedPlan: null, selectedAsset: null, selectedClient: null,saleCharges:[],saleUnits:[],assetSchedules:[], isEditing:false});
                    const saleID = row[idField];
                    let formData = {
                        company: companyID.value,
                        asset_sale: saleID
                    }
                    await store.dispatch('Asset_Sales/fetchAssetSale',formData).
                    then(()=>{
                        store.commit('pageTab/ADD_PAGE', {'SAP':'Sale_Details'})
                        store.state.pageTab.sapActiveTab = 'Sale_Details';
                        
                    })
                }else{
                    toast.error(`Cannot Edit ${assetStatus} Sale`)
                }
            }else if(action == 'approve/reject'){
                const assetStatus = row['approval_status']
                if(assetStatus == 'Pending'){
                    updateFormFields();
                    saleID.value = row['asset_sale_id'];
                    saleAmount.value = row['total_amount'];
                    transModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                }else{
                    toast.error(`Sale Already ${assetStatus}`)
                }
            }else if(action == 'delete'){
                const saleID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    asset_sale: saleID
                }
                await store.dispatch('Asset_Sales/deleteAssetSale',formData).
                then(()=>{
                    searchAssetSales();
                })
            }else if(action == 'view'){
                const saleID = row[idField];
                const applicationStatus = row['approval_status']
                if(applicationStatus == 'Approved'){
                    let formData = {
                        company: companyID.value,
                        asset_sale: saleID
                    }
                    await store.dispatch('Asset_Sales/fetchSaleDetails',formData).
                    then(()=>{
                        store.commit('pageTab/ADD_PAGE', {'SAP':'Sale_Profile'})
                        store.state.pageTab.sapActiveTab = 'Sale_Profile';
                    })
                }else{
                    toast.error(`Cannot View ${applicationStatus} Sale`)
                }
            }else if(action == 'transfer'){
                hideTransModalLoader();
                saleID.value = row['member_id'];
                transModalVisible.value = true;
            }
        };
        const dropdownOptions = ref([
            {label: 'Exempt Penalty', action: 'exempt-penalty'},
            {label: 'Unexempt Penalty', action: 'unexempt-penalty'},
            {label: 'Email Sale Statement', action: 'send-email'},
        ]);
        const handleDynamicOption = async(option) =>{
            if( option == 'exempt-penalty'){
                let formData = {
                    asset_sale: selectedIds.value,
                    company: companyID.value
                }
                Swal.fire({
                    title: "Are you sure?",
                    text: `Do you wish to Exempt Penalty?`,
                    type: 'warning',
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Exempt!',
                    cancelButtonText: 'Cancel!',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom',
                    },
                    showLoaderOnConfirm: true,
                    }).then((result) => {
                    if (result.value) {
                        axios.post(`api/v1/exempt-asset-sale-penalty/`,formData)
                        .then((response)=>{
                        if(response.data.msg == 'Success'){
                            Swal.fire("Penalty Exempted Succesfully!", {
                                icon: "success",
                            });
                            searchAssetSales(); 
                        }else if(response.data.msg == 'Failed'){
                            Swal.fire("Penalty Already Exempted!", {
                                icon: "warning",
                            });
                        }
                        else{
                            Swal.fire({
                                title: "Error Exempting Penalty",
                                icon: "warning",
                            });
                        }                   
                        })
                        .catch((error)=>{
                            console.log(error.message);
                            Swal.fire({
                                title: error.message,
                                icon: "warning",
                            });
                        })
                    }else{
                        Swal.fire(`Penalty(s) has not been exempted!`);
                    }
                })
                            
            }else if( option == 'unexempt-penalty'){
                let formData = {
                    asset_sale: selectedIds.value,
                    company: companyID.value
                }
                Swal.fire({
                    title: "Are you sure?",
                    text: `Do you wish to Unexempt Penalty?`,
                    type: 'warning',
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Unexempt!',
                    cancelButtonText: 'Cancel!',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom',
                    },
                    showLoaderOnConfirm: true,
                    }).then((result) => {
                    if (result.value) {
                        axios.post(`api/v1/unexempt-asset-sale-penalty/`,formData)
                        .then((response)=>{
                        if(response.data.msg == 'Success'){
                            Swal.fire("Penalty Unexempted Succesfully!", {
                                icon: "success",
                            }); 
                            searchAssetSales();
                        }else if(response.data.msg == 'Failed'){
                            Swal.fire("Penalty Not Exempted!", {
                                icon: "warning",
                            });
                        }
                        else{
                            Swal.fire({
                                title: "Error Unexempting Penalty",
                                icon: "warning",
                            });
                        }                   
                        })
                        .catch((error)=>{
                            console.log(error.message);
                            Swal.fire({
                                title: error.message,
                                icon: "warning",
                            });
                        })
                    }else{
                        Swal.fire(`Penalty(s) has not been Unexempted!`);
                    }
                })                 
            }else if(option == 'send-email'){
                showLoader();
                let formData = {
                    company: companyID.value,
                    asset_sale: selectedIds.value,
                    date_from: from_date_search.value,
                    date_to: to_date_search.value,
                    company: companyID.value
                }
                await axios.post('api/v1/asset-sale-statement-email/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Email Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Sale Statement Template Not Set!")
                    }else{
                        toast.error(response.data.msg)
                    }
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideLoader();
                })
            }
        };
        const handleShowDetails = async(row) =>{
            activeTab.value = 0;
            appID.value = row['asset_sale_id'];
            detailsTitle.value = row['sale_code'] + ' Schedules';
            showDetails.value = true;
            let formData = {
                asset_sale: row['asset_sale_id'],
                company: companyID.value
            }
            axios.post('api/v1/asset-sale-schedules-search/',formData)
            .then((response)=>{
                loanScheduleRows.value = response.data.armotization_schedules;
            })
            .catch((error)=>{
                console.log(error.message)
            })
        };
        const selectTab = async(index) => {
            let formData = {
                company: companyID.value,
                asset_sale: appID.value,
            }
            if(index == 1){
                axios.post('api/v1/get-asset-sale-items/',formData)
                .then((response)=>{
                    saleItemsRows.value = response.data;
                })
                .catch((error)=>{
                    console.log(error.message)
                })
                activeTab.value = index;
            }else{
                activeTab.value = index;
                hideLoader();
            }

        };
        const hideDetails = async() =>{
            showDetails.value = false;
        };
        
        const printSalesList = () =>{
            showLoader();
            let formData = {
                sale_code: sale_code_search.value,
                asset_name: asset_name_search.value,
                asset_code: asset_code_search.value,
                client_name: client_name_search.value,
                client_code: client_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 

            axios
            .post("api/v1/export-asset-sales-pdf/", formData, { responseType: 'blob' })
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
        };
        const closeModal1 = async() =>{
            propModalVisible.value = false;
            handleReset1();
        }
        onBeforeMount(()=>{
            searchAssetSales();
            
        })
        return{
            searchAssetSales,resetFilters, addButtonLabel, searchFilters, tableColumns, salesList,dropdownWidth,displayButtons,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,flex_basis,flex_basis_percentage,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,showDetails,detailsTitle,hideDetails,
            submitButtonLabel, showModal, addNewSale, showLoader, loader, hideLoader, importMembers, removeAssetSale, removeAssetSales,
            handleSelectionChange,addingRight,removingRight,rightsModule,printSalesList,selectSearchQuantity,selectedValue,
            modal_left,modal_top,modal_width,trans_modal_loader,formFields,transModalVisible,transTitle,showTransModalLoader,hideTransModalLoader,approveSale,closeTransModal,
            handleReset,dropdownOptions,handleDynamicOption,member_status,exit_date,handleShowDetails,loanScheduleRows,saleItemsRows,itemColumns,showActions,tabs,selectTab,activeTab
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