<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewExitCharge"
            :searchFilters="searchFilters"
            @searchPage="searchExitCharges"
            @resetFilters="resetFilters"
            @removeItem="removeExitCharge"
            @removeSelectedItems="removeExitCharges"
            @printList="printList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="chargesList"
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
        />
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="saveExitCharge" @handleReset="handleReset"
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
    name: 'Exit_Charges',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'exit_charge_id';
        const addButtonLabel = ref('New Exit Charge');
        const addingRight = ref('Adding Exit Charges');
        const rightsModule = ref('PMS');
        const title = ref('Exit Charge Details');
        const submitButtonLabel = ref('Add');
        const ledComponentKey = ref(0);
        const selectedIds = ref([]);
        const chargesList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const ledgerID = ref('');
        const isEditing = computed(()=> store.state.Exit_Charges.isEditing);
        const selectedCharge = computed(()=> store.state.Exit_Charges.selectedCharge);
        const selectedLedger = computed(()=> store.state.Exit_Charges.selectedLedger);
        const ledgerArray = computed(() => store.state.Ledgers.liabilityLedgerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"name"},
            {label: "Amount", key: "value"},
            {label: "Posting Account", key:"posting_account_name"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Charge', rightName: 'Editing Exit Charges'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Charge', rightName: 'Deleting Exit Charges'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = computed({
            get: () => store.state.Exit_Charges.name_search,
            set: (value) => store.commit('Exit_Charges/SET_SEARCH_FILTERS', {"name_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:60,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option);
            ledgerID.value = store.state.Ledgers.ledgerID;
            if(selectedCharge.value){
                selectedCharge.value.posting_account.ledger_id = ledgerID.value;
                ledgerValue.value = ledgerID.value
            }
        }
        const formFields = ref([]);
        const ledgerValue = computed(() => {
           return (selectedCharge.value && selectedCharge.value.posting_account && !ledgerID.value) ? selectedCharge.value.posting_account.ledger_id : ledgerID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'name',label: "Name", value: selectedCharge.value?.name || '', required: true },
                { type: 'number', name: 'value',label: "Default Value", value: selectedCharge.value?.value || 0, required: false },
                {  
                    type:'search-dropdown', label:"Posting Account", value: ledgerValue.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Posting Account...', dropdownWidth: '500px', updateValue: selectedLedger.value,
                    fetchData: store.dispatch('Ledgers/fetchLiabilityLedgers', {company:companyID.value, ledger_type: "Current Liability", ledger_category: "General Ledger"})
                },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            ledgerID.value = '';
        }

        watch([selectedCharge, selectedLedger], () => {
            if (selectedCharge.value && selectedLedger.value) {
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
        const createExitCharge = async() =>{
            showModalLoader();
            let formData = {
                name: formFields.value[0].value,
                value: formFields.value[1].value || 0,
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
                    const response = await store.dispatch('Exit_Charges/createExitCharge', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Exit Charge created successfully!');
                        handleReset();
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Exit Charge.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Exit Charge: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchExitCharges();
                }
            }
        }
        const updateExitCharge = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                exit_charge: selectedCharge.value.exit_charge_id,
                name: formFields.value[0].value,
                value: formFields.value[1].value || 0,
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
                    const response = await store.dispatch('Exit_Charges/updateExitCharge', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        ledComponentKey.value += 1;
                        toast.success("Exit Charge updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Exit Charge.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Exit Charge: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Exit_Charges/updateState",{selectedCharge:null})
                    searchExitCharges();
                }             
            }
        }
        const saveExitCharge = () =>{
            if(isEditing.value == true){
                updateExitCharge();
            }else{
                createExitCharge();
            }
        }
        const removeExitCharge = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    exit_charge: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Exit_Charges/deleteExitCharge',formData)
                    if(response && response.status == 200){
                        toast.success("Exit Charge Removed Succesfully");
                        searchExitCharges();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Exit Charge: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Exit Charge") 
            }else{
                toast.error("Please Select An Exit Charge To Remove")
            }
        }
        const removeExitCharges = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    exit_charge: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Exit_Charges/deleteExitCharge',formData)
                    if(response && response.status == 200){
                        toast.success("Exit Charge(s) Removed Succesfully");
                        searchExitCharges();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Exit Charges: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select Exit Charges To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchExitCharges = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                name: name_search.value,
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/exit-charges-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                chargesList.value = response.data.results;
                store.commit('Exit_Charges/LIST_CHARGES', chargesList.value)
                propResults.value = response.data;
                propArrLen.value = chargesList.value.length;
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
            currentPage.value = 1;
            store.commit('Exit_Charges/RESET_SEARCH_FILTERS')
            searchExitCharges();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchExitCharges();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchExitCharges();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchExitCharges();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchExitCharges();
            // scrollToTop();
        }
        const addNewExitCharge = () =>{
            store.dispatch("Exit_Charges/updateState",{selectedCharge:null, selectedLedger:null, isEditing:false})
            ledgerID.value = "";
            ledComponentKey.value += 1;
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const chargeID = row[idField];
                let formData = {
                    company: companyID.value,
                    exit_charge: chargeID
                }
                await store.dispatch('Exit_Charges/fetchExitCharge',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';

            }else if(action == 'delete'){
                const chargeID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    exit_charge: chargeID
                }
                await store.dispatch('Exit_Charges/deleteExitCharge',formData).
                then(()=>{
                    searchExitCharges();
                })
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchExitCharges();
            store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        })
        return{
            title, searchExitCharges,resetFilters, addButtonLabel, searchFilters, tableColumns, chargesList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewExitCharge, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveExitCharge, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeExitCharge, removeExitCharges,addingRight,rightsModule
        }
    }
};
</script>