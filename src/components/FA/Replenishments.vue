<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewReplenishment"
            :searchFilters="searchFilters"
            @searchPage="searchReplenishments"
            @resetFilters="resetFilters"
            @removeItem="removeReplenishment"
            @removeSelectedItems="removeReplenishments"
            @printList="printList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="replenishmentList"
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
                :displayButtons="displayButtons" @handleSubmit="createReplenishment" @handleReset="handleReset"
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
    name: 'Replenishments',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'petty_cash_replenishment_id';
        const addButtonLabel = ref('New Replenishment');
        const addingRight = ref('Adding Petty Cash Replenishment');
        const removingRight = ref('Deleting Petty Cash Replenishments');
        const rightsModule = ref('Accounts');
        const title = ref('Replenishment Details');
        const submitButtonLabel = ref('Add');
        const ledComponentKey = ref(0);
        const selectedIds = ref([]);
        const replenishmentList = ref([]);
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
        const pettyCashID = ref('');
        const isEditing = computed(()=> store.state.Petty_Cash_Replenishments.isEditing);
        const selectedReplenishment = computed(()=> store.state.Petty_Cash_Replenishments.selectedReplenishment);
        const selectedLedger = computed(()=> store.state.Petty_Cash_Replenishments.selectedLedger);
        const pettyArray = computed(() => store.state.Petty_Cash.cashArr);
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Petty Cash", key:"petty_cash"},
            {label: "Checking Account", key:"posting_account"},
            {label: "Narration", key:"narration"},
            {label: "Ref. No", key:"reference_no"},
            {label: "Amount", key: "amount"},
            {label: "Journal", key: "journal"},
        ])
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Replenishment', rightName: 'Deleting Petty Cash Replenishments'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const from_date_search = ref('');
        const to_date_search = ref('');
        const searchFilters = ref([
            {type:'date', title:"Date From...", value: from_date_search, width:36,},
            {type:'date', title:"Date To...", value: to_date_search, width:36,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedPettyCash = async(option) =>{
            await store.dispatch('Petty_Cash/handleSelectedPettyCash', option);
            pettyCashID.value = store.state.Petty_Cash.cashID;
        }
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option);
            ledgerID.value = store.state.Ledgers.ledgerID;
        }
        const formFields = ref([]);
        const pettyCashValue = computed(() => {
           return (selectedReplenishment.value && selectedReplenishment.value.petty_cash && !pettyCashID.value) ? selectedReplenishment.value.petty_cash.petty_cash_id : pettyCashID.value;

        });
        const ledgerValue = computed(() => {
           return (selectedReplenishment.value && selectedReplenishment.value.posting_account && !ledgerID.value) ? selectedReplenishment.value.posting_account.ledger_id : ledgerID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Petty Cash", value: pettyCashValue.value, componentKey: ledComponentKey,
                    selectOptions: pettyArray, optionSelected: handleSelectedPettyCash, required: true,
                    searchPlaceholder: 'Select Petty Cash...', dropdownWidth: '500px', updateValue: selectedLedger.value,
                    fetchData: store.dispatch('Petty_Cash/fetchPettyCashes', {company:companyID.value})
                },
                {  
                    type:'search-dropdown', label:"Checking Account", value: ledgerValue.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Posting Account...', dropdownWidth: '500px', updateValue: selectedLedger.value,
                    fetchData: store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
                },
                { type: 'date', name: 'date',label: "Date", value: selectedReplenishment.value?.date || '', placeholder: "", required: true},
                { type: 'text', name: 'narration',label: "Narration", value: selectedReplenishment.value?.narration || '', required: true },
                { type: 'text', name: 'reference_no',label: "Reference No", value: selectedReplenishment.value?.reference_no || '', required: true },
                { type: 'number', name: 'amount',label: "Amount", value: selectedReplenishment.value?.amount || 0, required: true },
                
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            ledgerID.value = '';
            pettyCashID.value = '';
            formFields.value[5].value = 0;
        }
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createReplenishment = async() =>{
            showModalLoader();
            let formData = {
                narration: formFields.value[3].value,
                date: formFields.value[2].value,
                reference_no: formFields.value[4].value,
                amount: formFields.value[5].value,
                journal: null,
                journal_id: null,
                petty_cash: pettyCashID.value,
                petty_cash_id: pettyCashID.value,
                posting_account: ledgerID.value,
                posting_account_id: ledgerID.value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != "search-dropdown"){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(ledgerValue.value == '' || pettyCashValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Petty_Cash_Replenishments/createReplenishment', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Success!');
                        handleReset();
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Replenishment.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Replenishment: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchReplenishments();
                }
            }
        }
        const removeReplenishment = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    petty_cash_replenishment: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Petty_Cash_Replenishments/deleteReplenishment',formData)
                    if(response && response.status == 200){
                        toast.success("Replenishment Removed Succesfully");
                        searchReplenishments();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Replenishment: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Replenishment") 
            }else{
                toast.error("Please Select A Replenishment To Remove")
            }
        }
        const removeReplenishments = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    petty_cash_replenishment: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Petty_Cash_Replenishments/deleteReplenishment',formData)
                    if(response && response.status == 200){
                        toast.success("Replenishment(s) Removed Succesfully");
                        searchReplenishments();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Replenishment: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Replenishment To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchReplenishments = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/petty-cash-replenishments-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                replenishmentList.value = response.data.results;
                store.commit('Petty_Cash_Replenishments/LIST_REPLENISHMENTS', replenishmentList.value)
                propResults.value = response.data;
                propArrLen.value = replenishmentList.value.length;
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
            searchReplenishments(selectedValue.value);
        };
        const resetFilters = () =>{
            selectedValue.value = 50;
            currentPage.value = 1;
            from_date_search.value = "";
            to_date_search.value = "";
            searchReplenishments();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchReplenishments();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchReplenishments();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchReplenishments();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchReplenishments();
            // scrollToTop();
        }
        const addNewReplenishment = () =>{
            updateFormFields();
            store.dispatch("Petty_Cash_Replenishments/updateState",{selectedReplenishment:null, selectedLedger:null, isEditing:false})
            ledgerID.value = "";
            pettyCashID.value = "";
            ledComponentKey.value += 1;
            propModalVisible.value = true;
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const replenishID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    petty_cash_replenishment: replenishID
                }
                await store.dispatch('Petty_Cash_Replenishments/deleteReplenishment',formData).
                then(()=>{
                    searchReplenishments();
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
            searchReplenishments();
            
        })
        return{
            title, searchReplenishments,resetFilters, addButtonLabel, searchFilters, tableColumns, replenishmentList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,selectSearchQuantity,selectedValue,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewReplenishment, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, createReplenishment, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeReplenishment, removeReplenishments,addingRight,removingRight,rightsModule,
        }
    }
};
</script>