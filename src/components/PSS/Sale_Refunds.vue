<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewRefund"
        :searchFilters="searchFilters"
        @searchPage="searchRefunds"
        @resetFilters="resetFilters"
        @removeItem="removeRefund"
        @removeSelectedItems="removeRefunds"
        @importData="importRefunds"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="refundsList"
        :actions="actions"
        :showTotals="showTotals"
        :idField="idField"
        @handleSelectionChange="handleSelectionChange"
        @handleActionClick="handleActionClick"
        :count="depCount"
        :currentPage="currentPage"
        :result="depArrLen"
        @loadPrev="loadPrev"
        @loadNext="loadNext"
        @firstPage="firstPage"
        @lastPage="lastPage"
        :showNextBtn="showNextBtn"
        :showPreviousBtn="showPreviousBtn"
        :selectedValue="selectedValue"
        @selectSearchQuantity="selectSearchQuantity"
    />
    <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader"  @closeModal="closeModal">
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="createRefund" @handleReset="handleReset"
        />
    </MovableModal>
    <MovableModal v-model:visible="transModalVisible" :title="transTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="trans_modal_loader" @showLoader="showTransModalLoader" @hideLoader="hideTransModalLoader" @closeModal="closeTransModal">
        <DynamicForm 
            :fields="formFields1" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="approveRefund" @handleReset="handleReset"
        />
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { parse } from "postcss";

export default{
    name: 'Sale_Refunds',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const trans_modal_loader = ref('none');
        const memComponentKey = ref(0);
        const prodComponentKey = ref(0);
        const prodSearchComponentKey = ref(0);
        const title = ref('Sale Refund Details');
        const addButtonLabel = ref('New Sale Refund');
        const addingRight = ref('Adding Sale Refunds');
        const removingRight = ref('Deleting Sale Refunds');
        const rightsModule = ref('PSS');
        const idField = 'unit_sale_refund_id';
        const depModalVisible = ref(false);
        const selectedIds = ref([]);
        const refundsList = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const transTitle = ref('Approve/Reject Refund');
        const transModalVisible = ref(false);
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('500px');
        const modal_width = ref('30vw');
        const saleArray = computed(() => store.state.Asset_Sales.saleArr);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "date"},
            {label: "Client", key: "customer"},
            {label: "Asset", key: "asset"},
            {label: "Sale#", key: "sale_code"},
            {label: "Amount Due", key: "due_amount"},
            {label: "Refund Fee", key: "refund_fee"},
            {label: "Total Amnt", key: "total_amount"},
            {label: "Done By", key: "done_by"},
            {label: "Status", key: "approval_status", textColor: "textColor"},
        ])
        const showTotals = ref(false);
        const actions = ref([
            {name: 'approve/reject', icon: 'fa fa-check-circle', title: 'Approve/Reject Refund', rightName: 'Approving Sale Refunds'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Refund', rightName: 'Deleting Sale Refunds'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const refundID = ref('');
        const saleID = ref('');
        const asset_code_search = ref('');
        const asset_name_search = ref('');
        const sale_code_search = ref("");
        const client_code_search = ref("");
        const client_name_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Asset Code...", value: asset_code_search, width:32,},
            {type:'text', placeholder:"Asset Name...", value: asset_name_search, width:36,},
            {type:'text', placeholder:"Sale Code...", value: sale_code_search, width:32,},
            {type:'text', placeholder:"Client Code...", value: client_code_search, width:32,},
            {type:'text', placeholder:"Client Name...", value: client_name_search, width:48,},
            {type:'date', title: "From Date", placeholder:"From Date...", value: from_date_search, width:32,},
            {type:'date', title: "To Date",placeholder:"To Date...", value: to_date_search, width:32,},
        ]);
        const importRefunds = () =>{
            store.commit('pageTab/ADD_PAGE', {'PSS':'Import_Sale_Refunds'})
            store.state.pageTab.pssActiveTab = 'Import_Sale_Refunds';
        }
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedSale = async(option) =>{
            await store.dispatch('Asset_Sales/handleSelectedSale', option)
            saleID.value = store.state.Asset_Sales.saleID;
        };
        const clearSelectedSale = async() =>{
            await store.dispatch('Asset_Sales/updateState', {saleID: ''});
            saleID.value = store.state.Asset_Sales.saleID;
        };
        const formFields = ref([]);
        const saleValue = computed(() => {
            return saleID.value;
        });
        const calculateTotalAmount= (value) =>{
            let totalAmount = 0;
            if(value && value.length > 0){
               totalAmount = parseFloat(value) - formFields.value[3].value;
               formFields.value[4].value = totalAmount.toFixed(2);
            }else{
                formFields.value[4].value = 0;
            }
           
        }
        const calculateTotalAmount1= (value) =>{
            let totalAmount = 0;
            if(value && value.length > 0){
               totalAmount = formFields.value[2].value - parseFloat(value);
               formFields.value[4].value = totalAmount.toFixed(2);
            }else{
                formFields.value[4].value = 0;
            }
           
        }

        const updateFormFields = () => {
            formFields.value = [
                { type: 'date', name: 'date',label: "Refund Date", value: '', required: true },
                {  
                    type:'search-dropdown', label:"Sale", value: saleValue.value, componentKey: memComponentKey,
                    selectOptions: saleArray, optionSelected: handleSelectedSale, required: true,
                    searchPlaceholder: 'Select Sale...', dropdownWidth: '500px',
                    fetchData: store.dispatch('Asset_Sales/fetchAssetSales', {company:companyID.value}), clearSearch: clearSelectedSale
                },               
                { type: 'number', name: 'due_amount',label: "Due Amount", value: 0, required: false, method: calculateTotalAmount},
                { type: 'number', name: 'refund_fee',label: "Refund Fee", value: 0, required: false, method: calculateTotalAmount1 },
                { type: 'number', name: 'total_amount',label: "Total Amount", value: 0, required: true },            
            ];
        };

        const formFields1 = ref([]);
        const updateFormFields1 = () => {
            formFields1.value = [
                { type: 'dropdown', name: 'approval_status',label: "Status", value: '', placeholder: "", required: true, options: [{ text: 'Approve', value: 'Approved' }, { text: 'Reject', value: 'Rejected' }] },
            ]
        };

        const addNewRefund = () =>{
            updateFormFields();
            depModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const refundID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    unit_sale_refund: refundID
                }
                await store.dispatch('Sale_Refunds/deleteSaleRefund',formData).
                then(()=>{
                    searchRefunds();
                })
            }else if(action == 'approve/reject'){
                const refundStatus = row['approval_status']
                if(refundStatus == 'Pending'){
                    updateFormFields1();
                    refundID.value = row['unit_sale_refund_id'];
                    transModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                }else{
                    toast.error(`Refund Already ${refundStatus}`)
                }
            }
        } 
        const handleReset = async() =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].name == 'refund_fee' || formFields.value[i].name == 'total_amount' || formFields.value[i].name == 'due_amount'){
                    formFields.value[i].value = 0;
                }else{
                    formFields.value[i].value = '';
                }
            }
            saleID.value = "";
            prodComponentKey.value += 1;
            memComponentKey.value += 1;

        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createRefund = async() =>{
            showModalLoader();
            let formData = {
                done_by: '-',
                date: formFields.value[0].value,
                approval_status: "Pending",
                due_amount: formFields.value[2].value,
                refund_fee: formFields.value[3].value,
                total_amount: formFields.value[4].value,
                asset_sale: saleID.value,
                asset_sale_id: saleID.value,
                user: userID.value,
                company: companyID.value
            };
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type !='search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(saleValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Sale_Refunds/createSaleRefund', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Refund created successfully!');
                        handleReset();
                        memComponentKey.value += 1;
                        prodComponentKey.value += 1;
                    }else {
                        toast.error('An error occurred while creating the Refund.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Refund: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchRefunds();
                }
            }

        }

        const removeRefund = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    unit_sale_refund: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Sale_Refunds/deleteSaleRefund',formData)
                    if(response && response.status == 200){
                        toast.success("Refund Removed Succesfully");
                        searchRefunds();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Refund: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Refund") 
            }else{
                toast.error("Please Select A Refund To Remove")
            }
        }
        const removeRefunds = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    unit_sale_refund: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Sale_Refunds/deleteSaleRefund',formData)
                    if(response && response.status == 200){
                        toast.success("Refund(s) Removed Succesfully");
                        searchRefunds();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Refund(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Refund To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchRefunds = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                asset_code: asset_code_search.value,
                asset_name: asset_name_search.value,
                client_code: client_code_search.value,
                client_name: client_name_search.value,
                sale_code: sale_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios
            .post(`api/v1/unit-sale-refunds-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                refundsList.value = response.data.results;
                store.commit('Sale_Refunds/LIST_REFUNDS', refundsList.value)
                depResults.value = response.data;
                depArrLen.value = refundsList.value.length;
                depCount.value = depResults.value.count;
                pageCount.value = Math.ceil(depCount.value / selectedValue.value);
                
                if(response.data.next){
                    showNextBtn.value = true;
                }
                if(response.data.previous){
                    showPreviousBtn.value = true;
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchRefunds(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchRefunds();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchRefunds();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchRefunds();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchRefunds();
        }
        const resetFilters = () =>{
            selectedValue.value = 50;
            client_code_search.value = "";
            client_name_search.value = "";
            asset_code_search.value = "";
            asset_name_search.value = "";
            sale_code_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            searchRefunds();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        };
        const showTransModalLoader = () =>{
            trans_modal_loader.value = "block";
        }
        const hideTransModalLoader = () =>{
            trans_modal_loader.value = "none";
        };
        const closeTransModal = () =>{
            transModalVisible.value = false;
            refundID.value = null;
            hideTransModalLoader();
        };
        const approveRefund = async() =>{
            showTransModalLoader();
            let formData = {
                sale_refund: refundID.value,
                approval_status: formFields1.value[0].value,
                company: companyID.value
            }

            axios.post(`api/v1/approve-unit-sale-refund/`,formData)
            .then((response)=>{
            if(response.data.msg == "Success"){
                hideTransModalLoader();
                closeTransModal();
                toast.success("Success")
                searchRefunds();
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
        onMounted(()=>{
            searchRefunds();
        })
        return{
            title,idField, searchRefunds, addButtonLabel, searchFilters, resetFilters, tableColumns, refundsList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewRefund,showTotals,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, createRefund,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeRefund, removeRefunds,
            addingRight,removingRight,rightsModule, closeModal,selectSearchQuantity,selectedValue,handleSelectionChange,importRefunds,
            formFields1, transTitle, transModalVisible, trans_modal_loader, showTransModalLoader, hideTransModalLoader, closeTransModal, approveRefund
        }
    }
}
</script>