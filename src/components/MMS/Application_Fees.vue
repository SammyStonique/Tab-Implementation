<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewFee"
        :searchFilters="searchFilters"
        @searchPage="searchApplicationFees"
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
            :displayButtons="displayButtons" @handleSubmit="createApplicationFee" @handleReset="handleReset"
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
    name: 'Application_Fees',
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
        const title = ref('Loan Fees Details');
        const addButtonLabel = ref('New Fee');
        const addingRight = ref('Adding Loan Fees');
        const removingRight = ref('Deleting Loan Fees');
        const rightsModule = ref('MMS');
        const idField = 'loan_application_fee_id';
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
        const isEditing = computed(()=> store.state.Application_Fees.isEditing)
        const selectedFee = computed(()=> store.state.Application_Fees.selectedFee);
        const selectedLoanFee = computed(()=> store.state.Application_Fees.selectedLoanFee);
        const selectedApplication = computed(()=> store.state.Application_Fees.selectedApplication);
        const feesArray = computed(() => store.state.Loan_Fees.feeArr);
        const applicationArray = computed(() => store.state.Loan_Applications.applicationArr);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Member No", key: "member_number", type: "text", editable: false},
            {label: "Member Name", key: "member_name", type: "text", editable: false},
            {label: "Loan No", key: "loan_number", type: "text", editable: false},
            {label: "Fee Name", key: "loan_fee", type: "text", editable: false},
            {label: "Charge Time", key: "charge_time", type: "text", editable: false},
            {label: "Charge Mode", key: "charge_mode", type: "text", editable: false},
            {label: "Charge Type", key: "charge_type", type: "text", editable: false},
            {label: "Amount", key: "formatted_amount", type: "number", editable: false},
            {label: "Posted", key: "posted", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'mark-posted', icon: 'fa fa-spinner', title: 'Mark As Posted', rightName: 'Adding Loan Fees'},
            {name: 'unmark-posted', icon: 'fa fa-minus-circle', title: 'Unmark As Posted', rightName: 'Adding Loan Fees'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Fee', rightName: 'Deleting Loan Fees'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const loanFeeID = ref('');
        const feeSearchID =ref('');
        const applicationID = ref('');
        const handleSelectedSearchfee = async(option) =>{
            await store.dispatch('Loan_Fees/handleSelectedFee', option)
            feeSearchID.value = store.state.Loan_Fees.feeID;
        };
        const clearSelectedSearchfee = async() =>{
            await store.dispatch('Loan_Fees/updateState', {feeID: ''});
            feeSearchID.value = store.state.Loan_Fees.feeID;
        };
        const loan_number_search = ref('');
        const name_search = ref('');
        const posted_status_search = ref('');
        const loan_status_search = ref('');
        const member_number_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Loan No...", value: loan_number_search, width:32,},
            {type:'text', placeholder:"Member No...", value: member_number_search, width:32,},
            {type:'text', placeholder:"Search Name...", value: name_search, width:48,},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:32, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:32, title: "Date To Search"},
            {
                type:'dropdown', placeholder:"Posted..", value: posted_status_search, width:24,
                options: [{text:'Yes',value:'Yes'},{text:'No',value:'No'}]
            },
            {
                type:'dropdown', placeholder:"Loan Status..", value: loan_status_search, width:32,
                options: [{text:'Pending',value:'Pending'},{text:'Approved',value:'Approved'},{text:'Rejected',value:'Rejected'}]
            },
            {
                type:'search-dropdown', value: feesArray, width:48, componentKey: feeSearchComponentKey,
                selectOptions: feesArray, optionSelected: handleSelectedSearchfee,
                searchPlaceholder: 'Loan Fee...', dropdownWidth: '200px',
                clearSearch: clearSelectedSearchfee
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedFee = async(option) =>{
            await store.dispatch('Loan_Fees/handleSelectedFee', option)
            loanFeeID.value = store.state.Loan_Fees.feeID;
            if(selectedFee.value){
                selectedFee.value.loan_fee.loan_fee_id = loanFeeID.value;
                feeValue.value = loanFeeID.value
            }
        };
        const clearSelectedFee = async() =>{
            await store.dispatch('Loan_Fees/updateState', {feeID: ''});
            loanFeeID.value = store.state.Loan_Fees.feeID;
        };
        const handleSelectedApplication = async(option) =>{
            await store.dispatch('Loan_Applications/handleSelectedApplication', option)
            applicationID.value = store.state.Loan_Applications.applicationID;
        };
        const clearSelectedApplication = async() =>{
            await store.dispatch('Loan_Applications/updateState', {applicationID: ''});
            applicationID.value = store.state.Loan_Applications.applicationID;
        };
        const formFields = ref([]);
        const feeValue = computed(() => {
            return (selectedFee.value && selectedFee.value.loan_fee && !loanFeeID.value) ? selectedFee.value.loan_fee.loan_fee_id : loanFeeID.value;
        });
        const applicationValue = computed(() => {
            return (selectedFee.value && selectedFee.value.loan_application && !applicationID.value) ? selectedFee.value.loan_application.loan_application_id : applicationID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Loan Fee", value: feeValue.value, componentKey: memComponentKey,
                    selectOptions: feesArray, optionSelected: handleSelectedFee, required: true,
                    searchPlaceholder: 'Select Fee...', dropdownWidth: '500px', updateValue: selectedFee.value,
                    fetchData: store.dispatch('Loan_Fees/fetchLoanFees', {company:companyID.value}), clearSearch: clearSelectedFee
                },
                {  
                    type:'search-dropdown', label:"Loan Application", value: applicationValue.value, componentKey: prodComponentKey,
                    selectOptions: applicationArray, optionSelected: handleSelectedApplication, required: true,
                    searchPlaceholder: 'Select Loan Application...', dropdownWidth: '500px', updateValue: selectedApplication.value,
                    fetchData: store.dispatch('Loan_Applications/fetchLoanApplications', {company:companyID.value, status: "Approved"}), clearSearch: clearSelectedApplication
                },
                { type: 'text', name: 'amount',label: "Amount", value: selectedFee.value?.amount || '0', required: true },
            ];
        };
        watch([selectedFee, selectedFee, selectedApplication], () => {
            if (selectedFee.value && selectedFee.value && selectedApplication.value) {
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
            store.dispatch("Application_Fees/updateState",{selectedFee:null, selectedLoanFee:null, selectedApplication:null,isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'mark-posted'){
                const appFeeID = row['loan_application_fee_id'];
                const loan_fee_id = row['loan_fee_id'];
                const loan_app_id = row['loan_application_id'];
                const feeAmount = row['amount'];
                const postedStatus = row['posted'];
                if(postedStatus == "No"){
                    let formData = {
                        loan_application_fee: appFeeID,
                        amount: feeAmount,
                        posted: "Yes",
                        loan_fee: loan_fee_id,
                        loan_fee_id: loan_fee_id,
                        loan_application: loan_app_id,
                        loan_application_id: loan_app_id,
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
                            axios.put(`api/v1/update-loan-application-fee/`,formData)
                            .then((response)=>{
                            if(response.status == 200){
                                Swal.fire("Success!", {
                                    icon: "success",
                                }); 
                                searchApplicationFees();
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
                const appFeeID = row['loan_application_fee_id'];
                const loan_fee_id = row['loan_fee_id'];
                const loan_app_id = row['loan_application_id'];
                const feeAmount = row['amount'];
                const postedStatus = row['posted'];
                if(postedStatus == "Yes"){
                    let formData = {
                        loan_application_fee: appFeeID,
                        amount: feeAmount,
                        posted: "No",
                        loan_fee: loan_fee_id,
                        loan_fee_id: loan_fee_id,
                        loan_application: loan_app_id,
                        loan_application_id: loan_app_id,
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
                            axios.put(`api/v1/update-loan-application-fee/`,formData)
                            .then((response)=>{
                            if(response.status == 200){
                                Swal.fire("Success!", {
                                    icon: "success",
                                });
                                searchApplicationFees(); 
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
                    loan_application_fee: accountID
                }
                await store.dispatch('Application_Fees/deleteApplicationFee',formData).
                then(()=>{
                    searchApplicationFees();
                })
            }
        } 
        const handleReset = () =>{
            store.dispatch("Application_Fees/updateState",{selectedFee:null, selectedLoanFee:null, selectedApplication:null,isEditing:false})
            formFields.value[2].value = 0;
            loanFeeID.value = "";
            applicationID.value = "";
            prodComponentKey.value += 1;
            memComponentKey.value += 1;

        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createApplicationFee = async() =>{
            showModalLoader();
            let formData = {
                amount: formFields.value[2].value,
                posted: "No",
                loan_fee: loanFeeID.value,
                loan_fee_id: loanFeeID.value,
                loan_application: applicationID.value,
                loan_application_id: applicationID.value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=2; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type !='search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(feeValue.value == '' || applicationValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Application_Fees/createApplicationFee', formData);
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
                    searchApplicationFees();
                }
            }

        };
        const removeFee = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    loan_application_fee: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Application_Fees/deleteApplicationFee',formData)
                    if(response && response.status == 200){
                        toast.success("Fee Removed Succesfully");
                        searchApplicationFees();
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
                    loan_application_fee: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Application_Fees/deleteApplicationFee',formData)
                    if(response && response.status == 200){
                        toast.success("Fee(s) Removed Succesfully");
                        searchApplicationFees();
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
        const searchApplicationFees = () =>{
            showLoader();
            selectedIds.value = [];
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                loan_number: loan_number_search.value,
                member_name: name_search.value,
                member_number: member_number_search.value,
                posted: posted_status_search.value,
                loan_status: loan_status_search.value,
                fee: feeSearchID.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios
            .post(`api/v1/loan-application-fees-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                feesList.value = response.data.results;
                store.commit('Application_Fees/LIST_FEES', feesList.value)
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
            searchApplicationFees(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchApplicationFees();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchApplicationFees();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchApplicationFees();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchApplicationFees();
        }
        const resetFilters = () =>{
            feeSearchComponentKey.value += 1;
            feeSearchID.value = "";
            currentPage.value = 1;
            selectedValue.value = 50;
            name_search.value = "";
            loan_number_search.value = "";
            member_number_search.value = "";
            posted_status_search.value = "";
            loan_status_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            searchApplicationFees();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        };
        const printFeesList = () =>{
            showLoader();
            let formData = {
                loan_number: loan_number_search.value,
                member_name: name_search.value,
                member_number: member_number_search.value,
                posted: posted_status_search.value,
                loan_status: loan_status_search.value,
                fee: feeSearchID.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
   
            axios
            .post("api/v1/export-loan-application-fees-pdf/", formData, { responseType: 'blob' })
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
            searchApplicationFees();
        })
        return{
            title,idField, searchApplicationFees, addButtonLabel, searchFilters, resetFilters, tableColumns, feesList,showTotals,
            currentPage,depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewFee,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, createApplicationFee,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeFee, removeFees,printFeesList,
            addingRight,removingRight,rightsModule, closeModal,selectSearchQuantity,selectedValue,handleSelectionChange
        }
    }
}
</script>