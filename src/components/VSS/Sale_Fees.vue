<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewFee"
        :searchFilters="searchFilters"
        @searchPage="searchSaleFees"
        @resetFilters="resetFilters"
        @removeItem="removeFee"
        @removeSelectedItems="removeFees"
        @printList="printFeesList"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="feesList"
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
            :displayButtons="displayButtons" @handleSubmit="createSaleFee" @handleReset="handleReset"
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
import Swal from 'sweetalert2';
import PrintJS from 'print-js';

export default{
    name: 'Sale_Fees',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const memComponentKey = ref(0);
        const prodComponentKey = ref(0);
        const feeSearchComponentKey = ref(0);
        const title = ref('Sale Fees Details');
        const addButtonLabel = ref('New Fee');
        const addingRight = ref('Adding Sale Fees');
        const removingRight = ref('Deleting Sale Feess');
        const rightsModule = ref('PSS');
        const idField = 'asset_sale_fee_id';
        const depModalVisible = ref(false);
        const feesList = ref([]);
        const selectedIds = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showTotals = ref(true);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const isEditing = computed(()=> store.state.Sale_Fees.isEditing)
        const selectedFee = computed(()=> store.state.Sale_Fees.selectedFee);
        const selectedSaleFee = computed(()=> store.state.Sale_Fees.selectedSaleFee);
        const selectedSale = computed(()=> store.state.Sale_Fees.selectedSale);
        const feesArray = computed(() => store.state.Asset_Fees.feeArr);
        const saleArray = computed(() => store.state.Asset_Sales.saleArr);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Client Code", key: "client_code", type: "text", editable: false},
            {label: "Client Name", key: "client_name", type: "text", editable: false},
            {label: "Sale Code", key: "sale_code", type: "text", editable: false},
            {label: "Fee Name", key: "asset_fee", type: "text", editable: false},
            {label: "Charge Time", key: "charge_time", type: "text", editable: false},
            {label: "Charge Mode", key: "charge_mode", type: "text", editable: false},
            {label: "Charge Type", key: "charge_type", type: "text", editable: false},
            {label: "Amount", key: "formatted_amount", type: "number", editable: false},
            {label: "Posted", key: "posted", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'mark-posted', icon: 'fa fa-spinner', title: 'Mark As Posted', rightName: 'Adding Sale Fees'},
            {name: 'unmark-posted', icon: 'fa fa-minus-circle', title: 'Unmark As Posted', rightName: 'Adding Sale Fees'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Fee', rightName: 'Deleting Sale Feess'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const assetFeeID = ref('');
        const feeSearchID =ref('');
        const saleID = ref('');
        const handleSelectedSearchfee = async(option) =>{
            await store.dispatch('Asset_Fees/handleSelectedFee', option)
            feeSearchID.value = store.state.Asset_Fees.feeID;
        };
        const clearSelectedSearchfee = async() =>{
            await store.dispatch('Asset_Fees/updateState', {feeID: ''});
            feeSearchID.value = store.state.Asset_Fees.feeID;
        };
        const sale_code_search = ref('');
        const name_search = ref('');
        const posted_status_search = ref('');
        const sale_status_search = ref('');
        const client_code_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Sale Code...", value: sale_code_search, width:32,},
            {type:'text', placeholder:"Client Code...", value: client_code_search, width:32,},
            {type:'text', placeholder:"Search Name...", value: name_search, width:48,},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:32, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:32, title: "Date To Search"},
            {
                type:'dropdown', placeholder:"Posted..", value: posted_status_search, width:24,
                options: [{text:'Yes',value:'Yes'},{text:'No',value:'No'}]
            },
            {
                type:'dropdown', placeholder:"Sale Status..", value: sale_status_search, width:32,
                options: [{text:'Pending',value:'Pending'},{text:'Approved',value:'Approved'},{text:'Rejected',value:'Rejected'}]
            },
            {
                type:'search-dropdown', value: feesArray, width:48, componentKey: feeSearchComponentKey,
                selectOptions: feesArray, optionSelected: handleSelectedSearchfee,
                searchPlaceholder: 'Sale Fee...', dropdownWidth: '200px',
                clearSearch: clearSelectedSearchfee
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedFee = async(option) =>{
            await store.dispatch('Asset_Fees/handleSelectedFee', option)
            assetFeeID.value = store.state.Asset_Fees.feeID;
            if(selectedFee.value){
                selectedFee.value.asset_fee.asset_fee_id = assetFeeID.value;
                feeValue.value = assetFeeID.value
            }
        };
        const clearSelectedFee = async() =>{
            await store.dispatch('Asset_Fees/updateState', {feeID: ''});
            assetFeeID.value = store.state.Asset_Fees.feeID;
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
        const feeValue = computed(() => {
            return (selectedFee.value && selectedFee.value.asset_fee && !assetFeeID.value) ? selectedFee.value.asset_fee.asset_fee_id : assetFeeID.value;
        });
        const saleValue = computed(() => {
            return (selectedFee.value && selectedFee.value.asset_sale && !saleID.value) ? selectedFee.value.asset_sale.asset_sale_id : saleID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Sale Fee", value: feeValue.value, componentKey: memComponentKey,
                    selectOptions: feesArray, optionSelected: handleSelectedFee, required: true,
                    searchPlaceholder: 'Select Fee...', dropdownWidth: '500px', updateValue: selectedFee.value,
                    fetchData: store.dispatch('Asset_Fees/fetchAssetFees', {company:companyID.value}), clearSearch: clearSelectedFee
                },
                {  
                    type:'search-dropdown', label:"Sale", value: saleValue.value, componentKey: prodComponentKey,
                    selectOptions: saleArray, optionSelected: handleSelectedSale, required: true,
                    searchPlaceholder: 'Select Sale...', dropdownWidth: '500px', updateValue: selectedSale.value,
                    fetchData: store.dispatch('Asset_Sales/fetchAssetSales', {company:companyID.value, status: "Approved"}), clearSearch: clearSelectedSale
                },
                { type: 'text', name: 'amount',label: "Amount", value: selectedFee.value?.amount || '0', required: true },
            ];
        };
        watch([selectedFee, selectedFee, selectedSale], () => {
            if (selectedFee.value && selectedFee.value && selectedSale.value) {
                memComponentKey.value += 1;
                prodComponentKey.value += 1;
                updateFormFields();
            }
            else{
                updateFormFields();
            }
        }, { immediate: true });
        const addNewFee = () =>{
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Sale_Fees/updateState",{selectedFee:null, selectedSaleFee:null, selectedSale:null,isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'mark-posted'){
                const appFeeID = row['asset_sale_fee_id'];
                const asset_fee_id = row['asset_fee_id'];
                const loan_app_id = row['asset_sale_id'];
                const feeAmount = row['amount'];
                const postedStatus = row['posted'];
                if(postedStatus == "No"){
                    let formData = {
                        asset_sale_fee: appFeeID,
                        amount: feeAmount,
                        posted: "Yes",
                        loan_fee: asset_fee_id,
                        asset_fee_id: asset_fee_id,
                        asset_sale: loan_app_id,
                        asset_sale_id: loan_app_id,
                        company: companyID.value
                    }
                    Swal.fire({
                        title: "Are you sure?",
                        text: `Do you wish to Mark Fee As Posted?`,
                        type: 'warning',
                        showCloseButton: true,
                        showCancelButton: true,
                        confirmButtonText: 'Yes, Mark!',
                        cancelButtonText: 'Cancel!',
                        customClass: {
                            confirmButton: 'swal2-confirm-custom',
                            cancelButton: 'swal2-cancel-custom',
                        },
                        showLoaderOnConfirm: true,
                        }).then((result) => {
                        if (result.value) {
                            axios.put(`api/v1/update-asset-sale-fee/`,formData)
                            .then((response)=>{
                            if(response.status == 200){
                                Swal.fire("Success!", {
                                    icon: "success",
                                }); 
                                searchSaleFees();
                            }
                            else{
                                Swal.fire({
                                    title: "Error Marking As Posted",
                                    icon: "warning",
                                });
                            }                   
                            })
                            .catch((error)=>{
                                toast.error(error.message)
                                Swal.fire({
                                    title: error.message,
                                    icon: "warning",
                                });
                            })
                        }else{
                            Swal.fire(`Fee Not Marked As Posted!`);
                        }
                    })
                }else{
                    toast.error("Fee Already Posted!")
                }
                
                
            }else if( action == 'unmark-posted'){
                const appFeeID = row['asset_sale_fee_id'];
                const asset_fee_id = row['asset_fee_id'];
                const loan_app_id = row['asset_sale_id'];
                const feeAmount = row['amount'];
                const postedStatus = row['posted'];
                if(postedStatus == "Yes"){
                    let formData = {
                        asset_sale_fee: appFeeID,
                        amount: feeAmount,
                        posted: "No",
                        asset_fee: asset_fee_id,
                        asset_fee_id: asset_fee_id,
                        asset_sale: loan_app_id,
                        asset_sale_id: loan_app_id,
                        company: companyID.value
                    }
                    Swal.fire({
                        title: "Are you sure?",
                        text: `Do you wish to Unmark Fee As Posted?`,
                        type: 'warning',
                        showCloseButton: true,
                        showCancelButton: true,
                        confirmButtonText: 'Yes, Unmark!',
                        cancelButtonText: 'Cancel!',
                        customClass: {
                            confirmButton: 'swal2-confirm-custom',
                            cancelButton: 'swal2-cancel-custom',
                        },
                        showLoaderOnConfirm: true,
                        }).then((result) => {
                        if (result.value) {
                            axios.put(`api/v1/update-asset-sale-fee/`,formData)
                            .then((response)=>{
                            if(response.status == 200){
                                Swal.fire("Success!", {
                                    icon: "success",
                                });
                                searchSaleFees(); 
                            }
                            else{
                                Swal.fire({
                                    title: "Error Unmarking As Posted",
                                    icon: "warning",
                                });
                            }                   
                            })
                            .catch((error)=>{
                                toast.error(error.message)
                                Swal.fire({
                                    title: error.message,
                                    icon: "warning",
                                });
                            })
                        }else{
                            Swal.fire(`Fee Not Unmarked As Posted!`);
                        }
                    })
                }else{
                    toast.error("Fee Not Posted!")
                }
                
                
            }
            else if(action == 'delete'){
                const accountID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    asset_sale_fee: accountID
                }
                await store.dispatch('Sale_Fees/deleteSaleFee',formData).
                then(()=>{
                    searchSaleFees();
                })
            }
        } 
        const handleReset = () =>{
            store.dispatch("Sale_Fees/updateState",{selectedFee:null, selectedSaleFee:null, selectedSale:null,isEditing:false})
            formFields.value[2].value = 0;
            assetFeeID.value = "";
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
        const createSaleFee = async() =>{
            showModalLoader();
            let formData = {
                amount: formFields.value[2].value,
                posted: "No",
                asset_fee: assetFeeID.value,
                asset_fee_id: assetFeeID.value,
                asset_sale: saleID.value,
                asset_sale_id: saleID.value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=2; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type !='search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(feeValue.value == '' || saleValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Sale_Fees/createSaleFee', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Fee created successfully!');
                        handleReset();
                        memComponentKey.value += 1;
                        prodComponentKey.value += 1;
                    }else {
                        toast.error('An error occurred while creating the Fee.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Fee: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchSaleFees();
                }
            }

        };
        const removeFee = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    asset_sale_fee: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Sale_Fees/deleteSaleFee',formData)
                    if(response && response.status == 200){
                        toast.success("Fee Removed Succesfully");
                        searchSaleFees();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Fee: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Fee") 
            }else{
                toast.error("Please Select A Fee To Remove")
            }
        }
        const removeFees = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    asset_sale_fee: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Sale_Fees/deleteSaleFee',formData)
                    if(response && response.status == 200){
                        toast.success("Fee(s) Removed Succesfully");
                        searchSaleFees();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Fee(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Fee To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchSaleFees = () =>{
            showLoader();
            selectedIds.value = [];
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                sale_code: sale_code_search.value,
                client_name: name_search.value,
                client_code: client_code_search.value,
                posted: posted_status_search.value,
                sale_status: sale_status_search.value,
                fee: feeSearchID.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios
            .post(`api/v1/asset-sale-fees-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                feesList.value = response.data.results;
                store.commit('Sale_Fees/LIST_FEES', feesList.value)
                depResults.value = response.data;
                depArrLen.value = feesList.value.length;
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
            searchSaleFees(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchSaleFees();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchSaleFees();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchSaleFees();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchSaleFees();
        }
        const resetFilters = () =>{
            feeSearchComponentKey.value += 1;
            feeSearchID.value = "";
            currentPage.value = 1;
            selectedValue.value = 50;
            name_search.value = "";
            sale_code_search.value = "";
            client_code_search.value = "";
            posted_status_search.value = "";
            sale_status_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            searchSaleFees();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        };
        const printFeesList = () =>{
            showLoader();
            let formData = {
                sale_code: sale_code_search.value,
                client_name: name_search.value,
                client_code: client_code_search.value,
                posted: posted_status_search.value,
                sale_status: sale_status_search.value,
                fee: feeSearchID.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
   
            axios
            .post("api/v1/export-asset-sale-fees-pdf/", formData, { responseType: 'blob' })
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
        onMounted(()=>{
            searchSaleFees();
        })
        return{
            title,idField, searchSaleFees, addButtonLabel, searchFilters, resetFilters, tableColumns, feesList,showTotals,
            currentPage,depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewFee,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, createSaleFee,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeFee, removeFees,printFeesList,
            addingRight,removingRight,rightsModule, closeModal,selectSearchQuantity,selectedValue,handleSelectionChange
        }
    }
}
</script>