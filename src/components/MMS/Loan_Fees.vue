<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewFee"
            :searchFilters="searchFilters"
            @searchPage="searchFees"
            @resetFilters="resetFilters"
            @removeItem="removeFee"
            @removeSelectedItems="removeFees"
            @printList="printList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="feesList"
            :actions="actions"
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
            :selectedValue="selectedValue"
            @selectSearchQuantity="selectSearchQuantity"
        />
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="saveFee" @handleReset="handleReset"
            />
        </MovableModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Loan_Fees',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'loan_fee_id';
        const addButtonLabel = ref('New Loan Fee');
        const addingRight = ref('Adding Loan Fees');
        const removingRight = ref('Deleting Loan Fees');
        const rightsModule = ref('MMS');
        const title = ref('Loan Fee Details');
        const submitButtonLabel = ref('Add');
        const ledComponentKey = ref(0);
        const selectedIds = ref([]);
        const feesList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const ledgerID = ref('');
        const isEditing = computed(()=> store.state.Loan_Fees.isEditing);
        const selectedFee = computed(()=> store.state.Loan_Fees.selectedFee);
        const selectedLedger = computed(()=> store.state.Loan_Fees.selectedLedger);
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"fee_name"},
            {label: "Charge Time", key:"charge_time"},
            {label: "Charge Mode", key:"charge_mode"},
            {label: "Charge Type", key:"charge_type"},
            {label: "Default Amount", key: "default_amount"},
            {label: "Posting Account", key:"posting_account"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Fee', rightName: 'Editing Loan Fees'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Fee', rightName: 'Deleting Loan Fees'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:60,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option);
            ledgerID.value = store.state.Ledgers.ledgerID;
            if(selectedFee.value){
                selectedFee.value.posting_account.ledger_id = ledgerID.value;
                ledgerValue.value = ledgerID.value
            }
        }
        const formFields = ref([]);
        const ledgerValue = computed(() => {
           return (selectedFee.value && selectedFee.value.posting_account && !ledgerID.value) ? selectedFee.value.posting_account.ledger_id : ledgerID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'name',label: "Name", value: selectedFee.value?.fee_name || '', required: true },
                { type: 'dropdown', name: 'charge_time',label: "Charge Time", value: selectedFee.value?.charge_time || 'Loan Application', placeholder: "", required: true, options: [{ text: 'Loan Application', value: 'Loan Application' }, { text: 'Loan Approval', value: 'Loan Approval' }, { text: 'Loan Disbursement', value: 'Loan Disbursement' }, { text: 'Loan Offsetting', value: 'Loan Offsetting' },] },
                { type: 'dropdown', name: 'charge_mode',label: "Charge Mode", value: selectedFee.value?.charge_mode || 'Flat Amount', placeholder: "", required: false, options: [{ text: 'Flat Amount', value: 'Flat Amount' }, { text: '% of Applied Amount', value: 'Applied Amount' }, { text: '% of Installment Principal', value: 'Installment Principal' },{ text: '% of Disbursement Amount', value: 'Disbursement Amount' }, { text: '% of Installment Principal + Interest', value: 'Installment Principal + Interest' },{ text: '% of Principal Balance', value: 'Principal Balance' }, { text: '% of Loan Balance', value: 'Loan Balance' }] },
                { type: 'dropdown', name: 'charge_type',label: "Charge Type", value: selectedFee.value?.charge_type || '', placeholder: "", required: true, options: [{ text: 'Add To Principal', value: 'Add To Principal' }, { text: 'Deduct From Principal', value: 'Deduct From Principal' }, { text: 'Receive Cash', value: 'Receive Cash' }] },
                { type: 'text', name: 'default_amount',label: "Default Amount", value: selectedFee.value?.default_amount || '0', required: false },
                {  
                    type:'search-dropdown', label:"Posting Account", value: ledgerValue.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Posting Account...', dropdownWidth: '500px', updateValue: selectedLedger.value,
                    fetchData: store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
                },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            ledgerID.value = '';
            formFields.value[2].value = '0';
        }

        watch([selectedFee, selectedLedger], () => {
            if (selectedFee.value && selectedLedger.value) {
                ledComponentKey.value += 1;
                updateFormFields();
            }else{
                updateFormFields();
            }
            
        }, { immediate: true });
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createFee = async() =>{
            showModalLoader();
            let formData = {
                fee_name: formFields.value[0].value,
                charge_mode: formFields.value[2].value,
                charge_time: formFields.value[1].value,
                charge_type: formFields.value[3].value,
                default_amount: formFields.value[4].value || 0,
                posting_account: ledgerID.value,
                posting_account_id: ledgerID.value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=0; i < (formFields.value.length - 1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(ledgerValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Loan_Fees/createLoanFee', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Fee created successfully!');
                        handleReset();
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Fee.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Fee: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchFees();
                }
            }
        }
        const updateFee = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                loan_fee: selectedFee.value.loan_fee_id,
                fee_name: formFields.value[0].value,
                charge_mode: formFields.value[2].value,
                charge_time: formFields.value[1].value,
                charge_type: formFields.value[3].value,
                default_amount: formFields.value[4].value || 0,
                posting_account: ledgerValue.value,
                posting_account_id: ledgerValue.value,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value ==''){
                    errors.value.push('Error');
                }
            }
            if(ledgerValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Loan_Fees/updateLoanFee', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        ledComponentKey.value += 1;
                        toast.success("Fee updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Fee.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Fee: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Loan_Fees/updateState",{selectedFee:null})
                    searchFees();
                }             
            }
        }
        const saveFee = () =>{
            if(isEditing.value == true){
                updateFee();
            }else{
                createFee();
            }
        }
        const removeFee = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    loan_fee: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Loan_Fees/deleteLoanFee',formData)
                    if(response && response.status == 200){
                        toast.success("Fee Removed Succesfully");
                        searchFees();
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
                    loan_fee: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Loan_Fees/deleteLoanFee',formData)
                    if(response && response.status == 200){
                        toast.success("Fee(s) Removed Succesfully");
                        searchFees();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Fees: ' + error.message);
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
        const searchFees = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                fee_name: name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/loan-fees-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                feesList.value = response.data.results;
                store.commit('Loan_Fees/LIST_FEES', feesList.value)
                propResults.value = response.data;
                propArrLen.value = feesList.value.length;
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
            searchFees(selectedValue.value);
        };
        const resetFilters = () =>{
            selectedValue.value = 50;
            name_search.value = "";
            searchFees();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchFees();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchFees();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchFees();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchFees();
            // scrollToTop();
        }
        const addNewFee = () =>{
            store.dispatch("Loan_Fees/updateState",{selectedFee:null, selectedLedger:null, isEditing:false})
            ledgerID.value = "";
            ledComponentKey.value += 1;
            propModalVisible.value = true;
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const feeID = row[idField];
                let formData = {
                    company: companyID.value,
                    loan_fee: feeID
                }
                await store.dispatch('Loan_Fees/fetchLoanFee',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';

            }else if(action == 'delete'){
                const feeID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    loan_fee: feeID
                }
                await store.dispatch('Loan_Fees/deleteLoanFee',formData).
                then(()=>{
                    searchFees();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
            handleReset();
        }
        onBeforeMount(()=>{
            searchFees();
            
        })
        return{
            title, searchFees,resetFilters, addButtonLabel, searchFilters, tableColumns, feesList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,selectSearchQuantity,selectedValue,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewFee, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveFee, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeFee, removeFees,addingRight,removingRight,rightsModule,
        }
    }
};
</script>