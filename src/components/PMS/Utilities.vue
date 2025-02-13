<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewUtility"
            :searchFilters="searchFilters"
            @searchPage="searchUtilities"
            @resetFilters="resetFilters"
            @importData="importUtilities"
            @removeItem="removeUtility"
            @removeSelectedItems="removeUtilities"
            @printList="printList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="utilityList"
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
                :displayButtons="displayButtons" @handleSubmit="saveUtility" @handleReset="handleReset"
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
    name: 'Utilities',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'utility_id';
        const addButtonLabel = ref('New Utility');
        const addingRight = ref('Adding Utilities');
        const rightsModule = ref('PMS');
        const title = ref('Utility Details');
        const submitButtonLabel = ref('Add');
        const ledComponentKey = ref(0);
        const selectedIds = ref([]);
        const utilityList = ref([]);
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
        const isEditing = computed(()=> store.state.Utilities.isEditing);
        const selectedUtility = computed(()=> store.state.Utilities.selectedUtility);
        const selectedLedger = computed(()=> store.state.Utilities.selectedLedger);
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"name"},
            {label: "Charge Mode", key:"default_mode"},
            {label: "Default Value", key: "default_value"},
            {label: "Posting Account", key:"posting_account_name"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Utility', rightName: 'Editing Utilities'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Utility', rightName: 'Deleting Utilities'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = computed({
            get: () => store.state.Utilities.name_search,
            set: (value) => store.commit('Utilities/SET_SEARCH_FILTERS', {"name_search":value}),
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
            if(selectedUtility.value){
                selectedUtility.value.posting_account.ledger_id = ledgerID.value;
                ledgerValue.value = ledgerID.value
            }
        }
        const formFields = ref([]);
        const ledgerValue = computed(() => {
           return (selectedUtility.value && selectedUtility.value.posting_account && !ledgerID.value) ? selectedUtility.value.posting_account.ledger_id : ledgerID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'name',label: "Name", value: selectedUtility.value?.name || '', required: true },
                { type: 'dropdown', name: 'default_mode',label: "Charge Mode", value: selectedUtility.value?.default_mode || '', placeholder: "", required: false, options: [{ text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'Rent Percentage', value: 'Rent Percentage' }, { text: 'Billed On Use', value: 'Billed On Use' }] },
                { type: 'number', name: 'default_value',label: "Default Value", value: selectedUtility.value?.default_value || 0, required: false },
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
        }

        watch([selectedUtility, selectedLedger], () => {
            if (selectedUtility.value && selectedLedger.value) {
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
        const createUtility = async() =>{
            showModalLoader();
            let formData = {
                name: formFields.value[0].value,
                default_mode: formFields.value[1].value,
                default_value: formFields.value[2].value || 0,
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
                    const response = await store.dispatch('Utilities/createUtility', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Utility created successfully!');
                        handleReset();
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the utility.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create utility: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchUtilities();
                }
            }
        }
        const updateUtility = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                utility: selectedUtility.value.utility_id,
                name: formFields.value[0].value,
                default_mode: formFields.value[1].value,
                default_value: formFields.value[2].value || 0,
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
                    const response = await store.dispatch('Utilities/updateUtility', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        ledComponentKey.value += 1;
                        toast.success("Utility updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the utility.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update utility: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Utilities/updateState",{selectedUtility:null})
                    searchUtilities();
                }             
            }
        }
        const saveUtility = () =>{
            if(isEditing.value == true){
                updateUtility();
            }else{
                createUtility();
            }
        }
        const importUtilities = () =>{
            store.commit('pageTab/ADD_PAGE', {'PMS':'Import_Utilities'})
            store.state.pageTab.pmsActiveTab = 'Import_Utilities';
        }
        const removeUtility = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    utility: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Utilities/deleteUtility',formData)
                    if(response && response.status == 200){
                        toast.success("Utility Removed Succesfully");
                        searchUtilities();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove utility: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 utility") 
            }else{
                toast.error("Please Select A Utility To Remove")
            }
        }
        const removeUtilities = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    utility: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Utilities/deleteUtility',formData)
                    if(response && response.status == 200){
                        toast.success("Utility(s) Removed Succesfully");
                        searchUtilities();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove utilities: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Utilities To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchUtilities = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                name: name_search.value,
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/utilities-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                utilityList.value = response.data.results;
                store.commit('Utilities/LIST_UTILITIES', utilityList.value)
                propResults.value = response.data;
                propArrLen.value = utilityList.value.length;
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
            store.commit('Utilities/RESET_SEARCH_FILTERS')
            searchUtilities();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchUtilities();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchUtilities();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchUtilities();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchUtilities();
            // scrollToTop();
        }
        const addNewUtility = () =>{
            store.dispatch("Utilities/updateState",{selectedUtility:null, selectedLedger:null, isEditing:false})
            ledgerID.value = "";
            ledComponentKey.value += 1;
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const utilityID = row[idField];
                let formData = {
                    company: companyID.value,
                    utility: utilityID
                }
                await store.dispatch('Utilities/fetchUtility',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';

            }else if(action == 'delete'){
                const utilityID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    utility: utilityID
                }
                await store.dispatch('Utilities/deleteUtility',formData).
                then(()=>{
                    searchUtilities();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchUtilities();
            
        })
        return{
            title, searchUtilities,resetFilters, addButtonLabel, searchFilters, tableColumns, utilityList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewUtility, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveUtility, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            importUtilities, removeUtility, removeUtilities,addingRight,rightsModule
        }
    }
};
</script>