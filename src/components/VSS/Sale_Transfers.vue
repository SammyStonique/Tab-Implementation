<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewTransfer"
        :searchFilters="searchFilters"
        @searchPage="searchTransfers"
        @resetFilters="resetFilters"
        @removeItem="removeTransfer"
        @removeSelectedItems="removeTransfers"
        @importData="importTransfers"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="transfersList"
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
            :displayButtons="displayButtons" @handleSubmit="createTransfer" @handleReset="handleReset"
        />
    </MovableModal>
    <MovableModal v-model:visible="transModalVisible" :title="transTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="trans_modal_loader" @showLoader="showTransModalLoader" @hideLoader="hideTransModalLoader" @closeModal="closeTransModal">
        <DynamicForm 
            :fields="formFields1" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="approveTransfer" @handleReset="handleReset"
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

export default{
    name: 'Sale_Transfers',
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
        const title = ref('Sale Transfer Details');
        const addButtonLabel = ref('New Sale Transfer');
        const addingRight = ref('Adding Sale Transfers');
        const removingRight = ref('Deleting Sale Transfers');
        const rightsModule = ref('PSS');
        const idField = 'unit_sale_transfer_id';
        const depModalVisible = ref(false);
        const selectedIds = ref([]);
        const transfersList = ref([]);
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
        const transTitle = ref('Approve/Reject Transfer');
        const transModalVisible = ref(false);
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('500px');
        const modal_width = ref('30vw');
        const accArray = computed(() => store.state.Asset_Clients.customerArr);
        const itemArray = computed(() => store.state.Asset_Units.itemArr);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "date"},
            {label: "Client From", key: "customer_from"},
            {label: "Asset", key: "asset"},
            {label: "Client To", key: "customer_to"},
            {label: "Unit", key: "unit_number"},
            {label: "Done By", key: "done_by"},
            {label: "Status", key: "approval_status", textColor: "textColor"},
        ])
        const showTotals = ref(false);
        const actions = ref([
            {name: 'approve/reject', icon: 'fa fa-check-circle', title: 'Approve/Reject Transfer', rightName: 'Approving Sale Transfers'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Transfer', rightName: 'Deleting Sale Transfers'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const transferID = ref('');
        const customerID = ref('');
        const customerToID = ref('');
        const saleItemID = ref('');
        const asset_code_search = ref('');
        const asset_name_search = ref('');
        const unit_number_search = ref("");
        const client_from_name_search = ref("");
        const client_to_name_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Asset Code...", value: asset_code_search, width:32,},
            {type:'text', placeholder:"Asset Name...", value: asset_name_search, width:36,},
            {type:'text', placeholder:"Unit No...", value: unit_number_search, width:32,},
            {type:'text', placeholder:"Client From...", value: client_from_name_search, width:48,},
            {type:'text', placeholder:"Client To...", value: client_to_name_search, width:48,},
            {type:'date', title: "From Date", placeholder:"From Date...", value: from_date_search, width:32,},
            {type:'date', title: "To Date",placeholder:"To Date...", value: to_date_search, width:32,},
        ]);
        const importTransfers = () =>{
            store.commit('pageTab/ADD_PAGE', {'PSS':'Import_Sale_Transfers'})
            store.state.pageTab.pssActiveTab = 'Import_Sale_Transfers';
        }
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const fetchSaleItems = async(clientID) =>{
            await store.dispatch('Asset_Units/fetchSaleItems', {company:companyID.value, client: clientID,})
        };
        const handleSelectedCustomer = async(option) =>{
            await store.dispatch('Asset_Clients/handleSelectedCustomer', option)
            customerID.value = store.state.Asset_Clients.customerID;
            fetchSaleItems(customerID.value);
        };
        const clearSelectedCustomer = async() =>{
            await store.dispatch('Asset_Clients/updateState', {customerID: ''});
            customerID.value = store.state.Asset_Clients.customerID;
        };
        const handleSelectedCustomerTo = async(option) =>{
            await store.dispatch('Asset_Clients/handleSelectedCustomer', option)
            customerToID.value = store.state.Asset_Clients.customerID;
        };
        const clearSelectedCustomerTo = async() =>{
            await store.dispatch('Asset_Clients/updateState', {customerID: ''});
            customerToID.value = store.state.Asset_Clients.customerID;
        };
        const handleSelectedSaleItem = async(option) =>{
            await store.dispatch('Asset_Units/handleSelectedItem', option)
            saleItemID.value = store.state.Asset_Units.itemID;
        };
        const clearSelectedSaleItem = async() =>{
            await store.dispatch('Asset_Units/updateState', {itemID: ''});
            saleItemID.value = store.state.Asset_Units.itemID;
        };
        const formFields = ref([]);
        const accValue = computed(() => {
            return customerID.value;
        });
        const accToValue = computed(() => {
            return customerToID.value;
        });
        const itemValue = computed(() => {
            return saleItemID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Client From", value: accValue.value, componentKey: memComponentKey,
                    selectOptions: accArray, optionSelected: handleSelectedCustomer, required: true,
                    searchPlaceholder: 'Select Client From...', dropdownWidth: '500px',
                    fetchData: store.dispatch('Asset_Clients/fetchAssetClients', {company:companyID.value}), clearSearch: clearSelectedCustomer
                },
                {  
                    type:'search-dropdown', label:"Sale Unit", value: itemValue.value, componentKey: prodComponentKey,
                    selectOptions: itemArray, optionSelected: handleSelectedSaleItem, required: true,
                    searchPlaceholder: 'Select Unit...', dropdownWidth: '500px',
                    clearSearch: clearSelectedSaleItem
                },
                {  
                    type:'search-dropdown', label:"Client To", value: accToValue.value, componentKey: prodComponentKey,
                    selectOptions: accArray, optionSelected: handleSelectedCustomerTo, required: true,
                    searchPlaceholder: 'Select Client To...', dropdownWidth: '500px',
                    clearSearch: clearSelectedCustomerTo
                },
                
                { type: 'date', name: 'date',label: "Transfer Date", value: '', required: true },
                
            ];
        };

        const formFields1 = ref([]);
        const updateFormFields1 = () => {
            formFields1.value = [
                { type: 'dropdown', name: 'approval_status',label: "Status", value: '', placeholder: "", required: true, options: [{ text: 'Approve', value: 'Approved' }, { text: 'Reject', value: 'Rejected' }] },
            ]
        };

        const addNewTransfer = async() =>{
            await store.dispatch('Asset_Units/updateState',{itemID: "", itemArr: [],})
            updateFormFields();
            depModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const transferID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    unit_sale_transfer: transferID
                }
                await store.dispatch('Sale_Transfers/deleteSaleTransfer',formData).
                then(()=>{
                    searchTransfers();
                })
            }else if(action == 'approve/reject'){
                const transferStatus = row['approval_status']
                if(transferStatus == 'Pending'){
                    updateFormFields1();
                    transferID.value = row['unit_sale_transfer_id'];
                    transModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                }else{
                    toast.error(`Transfer Already ${transferStatus}`)
                }
            }
        } 
        const handleReset = async() =>{
            await store.dispatch('Asset_Units/updateState',{itemID: "", itemArr: [],})
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            customerID.value = "";
            customerToID.value = "";
            prodComponentKey.value += 1;
            memComponentKey.value += 1;

        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createTransfer = async() =>{
            showModalLoader();
            let formData = {
                done_by: '-',
                date: formFields.value[3].value,
                approval_status: "Pending",
                customer_from: customerID.value,
                customer_from_id: customerID.value,
                customer_to: customerToID.value,
                customer_to_id: customerToID.value,
                sale_item: saleItemID.value,
                sale_item_id: saleItemID.value,
                user: userID.value,
                company: companyID.value
            };
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type !='search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(accValue.value == '' || accToValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Sale_Transfers/createSaleTransfer', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Transfer created successfully!');
                        handleReset();
                        memComponentKey.value += 1;
                        prodComponentKey.value += 1;
                    }else {
                        toast.error('An error occurred while creating the Transfer.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Transfer: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchTransfers();
                }
            }

        }

        const removeTransfer = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    unit_sale_transfer: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Sale_Transfers/deleteSaleTransfer',formData)
                    if(response && response.status == 200){
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
                    unit_sale_transfer: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Sale_Transfers/deleteSaleTransfer',formData)
                    if(response && response.status == 200){
                        toast.success("Transfer(s) Removed Succesfully");
                        searchTransfers();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Transfer(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Transfer To Remove")
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
                asset_code: asset_code_search.value,
                asset_name: asset_name_search.value,
                client_from_name: client_from_name_search.value,
                client_to_name: client_to_name_search.value,
                unit_number: unit_number_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios
            .post(`api/v1/unit-sale-transfers-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                transfersList.value = response.data.results;
                store.commit('Sale_Transfers/LIST_TRANSFERS', transfersList.value)
                depResults.value = response.data;
                depArrLen.value = transfersList.value.length;
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
            searchTransfers(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchTransfers();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchTransfers();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchTransfers();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchTransfers();
        }
        const resetFilters = () =>{
            selectedValue.value = 50;
            client_from_name_search.value = "";
            client_to_name_search.value = "";
            asset_code_search.value = "";
            asset_name_search.value = "";
            unit_number_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            searchTransfers();
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
            transferID.value = null;
            hideTransModalLoader();
        };
        const approveTransfer = async() =>{
            showTransModalLoader();
            let formData = {
                unit_sale_transfer: transferID.value,
                approval_status: formFields.value[0].value,
                company: companyID.value
            }

            axios.post(`api/v1/approve-unit-sale-transfer/`,formData)
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
        onMounted(()=>{
            searchTransfers();
        })
        return{
            title,idField, searchTransfers, addButtonLabel, searchFilters, resetFilters, tableColumns, transfersList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewTransfer,showTotals,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, createTransfer,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeTransfer, removeTransfers,
            addingRight,removingRight,rightsModule, closeModal,selectSearchQuantity,selectedValue,handleSelectionChange,importTransfers,
            formFields1, transTitle, transModalVisible, trans_modal_loader, showTransModalLoader, hideTransModalLoader, closeTransModal, approveTransfer
        }
    }
}
</script>