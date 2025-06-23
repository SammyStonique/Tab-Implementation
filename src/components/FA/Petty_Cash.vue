<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewPettyCash"
            :searchFilters="searchFilters"
            @searchPage="searchPettyCash"
            @resetFilters="resetFilters"
            @removeItem="removePettyCash"
            @removeSelectedItems="removePettyCashs"
            @printList="printList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="pettyCashList"
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
                :displayButtons="displayButtons" @handleSubmit="savePettyCash" @handleReset="handleReset"
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
    name: 'Petty_Cash',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'petty_cash_id';
        const addButtonLabel = ref('New Petty Cash');
        const addingRight = ref('Adding Petty Cash');
        const removingRight = ref('Deleting Petty Cash');
        const rightsModule = ref('Accounts');
        const title = ref('Petty Cash Details');
        const submitButtonLabel = ref('Add');
        const ledComponentKey = ref(0);
        const selectedIds = ref([]);
        const pettyCashList = ref([]);
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
        const isEditing = computed(()=> store.state.Petty_Cash.isEditing);
        const selectedCash = computed(()=> store.state.Petty_Cash.selectedCash);
        const selectedLedger = computed(()=> store.state.Petty_Cash.selectedLedger);
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Name", key:"name"},
            {label: "Posting Account", key:"posting_account"},
            {label: "Opening Bal", key:"opening_balance"},
            {label: "Control Amnt", key:"control_amount"},
            {label: "Approval?", key: "require_approval"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Petty Cash', rightName: 'Editing Petty Cash'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Statement', rightName: 'Viewing Petty Cash Statement'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Petty Cash', rightName: 'Deleting Petty Cash'},
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
            if(selectedCash.value){
                selectedCash.value.posting_account.ledger_id = ledgerID.value;
                ledgerValue.value = ledgerID.value
            }
        }
        const formFields = ref([]);
        const ledgerValue = computed(() => {
           return (selectedCash.value && selectedCash.value.posting_account && !ledgerID.value) ? selectedCash.value.posting_account.ledger_id : ledgerID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'name',label: "Name", value: selectedCash.value?.name || '', required: true },
                { type: 'date', name: 'date',label: "Effective Date", value: selectedCash.value?.date || '', placeholder: "", required: true},
                { type: 'dropdown', name: 'require_approval',label: "Require Approval", value: selectedCash.value?.require_approval || 'No', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                { type: 'number', name: 'control_amount',label: "Control Amount", value: selectedCash.value?.control_amount || 0, required: false },
                { type: 'number', name: 'opening_balance',label: "Opening Balance", value: selectedCash.value?.opening_balance || 0, required: false },
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
            formFields.value[2].value = 'No';
            formFields.value[3].value = 0;
            formFields.value[4].value = 0;
        }

        watch([selectedCash, selectedLedger], () => {
            if (selectedCash.value && selectedLedger.value) {
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
        const createPettyCash = async() =>{
            showModalLoader();
            let formData = {
                name: formFields.value[0].value,
                date: formFields.value[1].value,
                control_amount: formFields.value[3].value || 0,
                opening_balance: formFields.value[4].value || 0,
                require_approval: formFields.value[2].value || 'No',
                posting_account: ledgerID.value,
                posting_account_id: ledgerID.value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=0; i < (formFields.value.length - 1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type == "search-dropdown"){
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
                    const response = await store.dispatch('Petty_Cash/createPettyCash', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Success!');
                        handleReset();
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Petty Cash.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Petty Cash: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchPettyCash();
                }
            }
        }
        const updatePettyCash = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                petty_cash: selectedCash.value.petty_cash_id,
                name: formFields.value[0].value,
                date: formFields.value[1].value,
                control_amount: formFields.value[3].value || 0,
                opening_balance: formFields.value[4].value || 0,
                require_approval: formFields.value[2].value || 'No',
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
                    const response = await store.dispatch('Petty_Cash/updatePettyCash', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        ledComponentKey.value += 1;
                        toast.success("Petty Cash updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Petty Cash.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Petty Cash: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Petty_Cash/updateState",{selectedCash:null, selectedLedger:null})
                    searchPettyCash();
                }             
            }
        }
        const savePettyCash = () =>{
            if(isEditing.value == true){
                updatePettyCash();
            }else{
                createPettyCash();
            }
        }
        const removePettyCash = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    petty_cash: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Petty_Cash/deletePettyCash',formData)
                    if(response && response.status == 200){
                        toast.success("Petty Cash Removed Succesfully");
                        searchPettyCash();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Petty Cash: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Petty Cash") 
            }else{
                toast.error("Please Select A Petty Cash To Remove")
            }
        }
        const removePettyCashs = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    petty_cash: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Petty_Cash/deletePettyCash',formData)
                    if(response && response.status == 200){
                        toast.success("Petty Cash(s) Removed Succesfully");
                        searchPettyCash();
                    }
                }
                catch(error){
                    toast.error('Failed to remove Petty Cash: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Petty Cash To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchPettyCash = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                name: name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/petty-cash-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                pettyCashList.value = response.data.results;
                store.commit('Petty_Cash/LIST_PETTY_CASH', pettyCashList.value)
                propResults.value = response.data;
                propArrLen.value = pettyCashList.value.length;
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
            searchPettyCash(selectedValue.value);
        };
        const resetFilters = () =>{
            selectedValue.value = 50;
            currentPage.value = 1;
            name_search.value = "";
            searchPettyCash();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchPettyCash();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchPettyCash();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchPettyCash();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchPettyCash();
            // scrollToTop();
        }
        const addNewPettyCash = () =>{
            store.dispatch("Petty_Cash/updateState",{selectedCash:null, selectedLedger:null, isEditing:false})
            ledgerID.value = "";
            ledComponentKey.value += 1;
            propModalVisible.value = true;
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const pettyCashID = row[idField];
                let formData = {
                    company: companyID.value,
                    petty_cash: pettyCashID
                }
                await store.dispatch('Petty_Cash/fetchPettyCash',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';

            }else if(action == 'delete'){
                const pettyCashID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    petty_cash: pettyCashID
                }
                await store.dispatch('Petty_Cash/deletePettyCash',formData).
                then(()=>{
                    searchPettyCash();
                })
            }else if(action == 'view'){
                const pettyCashID = row[idField];
                let formData = {
                    company: companyID.value,
                    petty_cash: pettyCashID
                }
                await store.dispatch('Petty_Cash/fetchStatementData',formData).
                then(()=>{
                    store.dispatch("Petty_Cash/updateState",{selectedPettyCashID: pettyCashID})
                    store.commit('pageTab/ADD_PAGE', {'FA':'Petty_Cash_Statement'});
                    store.state.pageTab.faActiveTab = 'Petty_Cash_Statement';
                })
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
            handleReset();
        };
        
        onBeforeMount(()=>{
            searchPettyCash();
            
        })
        return{
            title, searchPettyCash,resetFilters, addButtonLabel, searchFilters, tableColumns, pettyCashList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,selectSearchQuantity,selectedValue,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewPettyCash, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, savePettyCash, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removePettyCash, removePettyCashs,addingRight,removingRight,rightsModule,
        }
    }
};
</script>