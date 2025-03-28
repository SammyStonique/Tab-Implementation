<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewShif"
            :searchFilters="searchFilters"
            @searchPage="searchShifs"
            @resetFilters="resetFilters"
            @removeItem="removeShif"
            @removeSelectedItems="removeShifs"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="shifList"
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
                :displayButtons="displayButtons" @handleSubmit="saveShif" @handleReset="handleReset"
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
import PrintJS from 'print-js';

export default{
    name: 'Shif',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const ledComponentKey = ref(0);
        const idField = 'shif_id';
        const addButtonLabel = ref('New SHIF');
        const addingRight = ref('Adding Shif');
        const removingRight = ref('Deleting Shif');
        const rightsModule = ref('HR');
        const title = ref('SHIF Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const shifList = ref([]);
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
        const modal_left = ref('500px');
        const modal_width = ref('40vw');
        const ledgerID = ref('');
        const isEditing = computed(()=> store.state.Shif.isEditing);
        const selectedShif = computed(()=> store.state.Shif.selectedShif);
        const selectedLedger = computed(()=> store.state.Shif.selectedLedger);
        const ledgerArray = computed(() => store.state.Ledgers.liabilityLedgerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Regime", key: "regime"},
            {label: "Tax Allow.", key:"taxation_status"},
            {label: "Charge Mode", key:"charge_mode"},
            {label: "Rate", key:"rate"},
            {label: "Posting Account", key:"posting_account_name"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Shif', rightName: 'Editing Shif'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Shif', rightName: 'Deleting Shif'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const searchFilters = ref([
        
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const fetchAllLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            ledgerID.value = store.state.Ledgers.ledgerID;
        };
        const clearSelectedLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            ledgerID.value = store.state.Ledgers.ledgerID;
        }
        const formFields = ref([]);
        const ledgerValue = computed(() => {
           return (selectedShif.value && selectedShif.value.posting_account && !ledgerID.value) ? selectedShif.value.posting_account.ledger_id : ledgerID.value;

        });
        const updateFormFields = () => {
            formFields.value = [     
                { type: 'date', name: 'date',label: "Effective Date", value: selectedShif.value?.date || '', required: true },
                { type: 'dropdown', name: 'regime',label: "Regime", value: selectedShif.value?.regime || 'Kenya', placeholder: "", required: true, options: [{ text: 'Kenya', value: 'Kenya' }, { text: 'South Sudan', value: 'South Sudan' }] },
                { type: 'dropdown', name: 'charge_mode',label: "Charge Mode", value: selectedShif.value?.charge_mode || '', placeholder: "", required: true, options: [{ text: 'Monthly', value: 'Monthly' }, { text: 'Annually', value: 'Annually' }] },
                { type: 'dropdown', name: 'taxation_status',label: "Tax Allowable", value: selectedShif.value?.taxation_status || 'Yes', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }]},
                { type: 'text', name: 'min_amount',label: "Min Amount", value: selectedShif.value?.min_amount || '0', required: true },
                { type: 'text', name: 'max_amount',label: "Max Amount", value: selectedShif.value?.max_amount || '0', required: false },
                { type: 'text', name: 'rate',label: "Rate(%)", value: selectedShif.value?.rate || '0', required: true },
                {  
                    type:'search-dropdown', label:"Posting Account", value: ledgerValue.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Posting Account...', dropdownWidth: '400px', updateValue: selectedLedger.value,
                    fetchData: store.dispatch('Ledgers/fetchLiabilityLedgers', {company:companyID.value, ledger_type: 'Current Liability'}),
                    clearSearch: clearSelectedLedger
                },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            ledComponentKey.value += 1;
            ledgerID.value = '';
        }

        watch([selectedShif, selectedLedger], () => {
            if (selectedShif.value && selectedLedger.value) {
                ledComponentKey.value += 1;
                updateFormFields();
            }
            
        }, { immediate: true });
        
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createShif = async() =>{
            showModalLoader();
            let formData = {
                date: formFields.value[0].value,
                rate: formFields.value[6].value,
                regime: formFields.value[1].value,
                taxation_status: formFields.value[3].value || 'No',
                charge_mode: formFields.value[2].value,
                min_amount: formFields.value[4].value,
                max_amount: formFields.value[5].value,
                posting_account: ledgerID.value,
                posting_account_id: ledgerID.value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown' && formFields.value[i].required == true){
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
                    const response = await store.dispatch('Shif/createShif', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Shif created successfully!');
                        handleReset();
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Shif.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Shif: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchShifs();
                }
            }
        }
        const updateShif = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                shif: selectedShif.value.shif_id,
                date: formFields.value[0].value,
                rate: formFields.value[6].value,
                regime: formFields.value[1].value,
                taxation_status: formFields.value[3].value || 'No',
                charge_mode: formFields.value[2].value,
                min_amount: formFields.value[4].value,
                max_amount: formFields.value[5].value,
                posting_account: ledgerValue.value,
                posting_account_id: ledgerValue.value,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown'  && formFields.value[i].required == true){
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
                    const response = await store.dispatch('Shif/updateShif', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        ledComponentKey.value += 1;
                        toast.success("Shif updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Shif.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Shif: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Shif/updateState",{selectedShif:null})
                    searchShifs();
                }             
            }
        }
        const saveShif = () =>{
            if(isEditing.value == true){
                updateShif();
            }else{
                createShif();
            }
        }
        const removeShif = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    shif: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Shif/deleteShif',formData)
                    if(response && response.status == 200){
                        toast.success("Shif Removed Succesfully");
                        searchShifs();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Shif: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Shif") 
            }else{
                toast.error("Please Select A Shif To Remove")
            }
        }
        const removeShifs = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    shif: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Shif/deleteShif',formData)
                    if(response && response.status == 200){
                        toast.success("Shif(s) Removed Succesfully");
                        searchShifs();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Shif: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Shif To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchShifs = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/shifs-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                shifList.value = response.data.results;
                store.commit('Shif/LIST_SHIF', shifList.value)
                propResults.value = response.data;
                propArrLen.value = shifList.value.length;
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
            searchShifs(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            searchShifs();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchShifs();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchShifs();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchShifs();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchShifs();
            // scrollToTop();
        }
        const addNewShif = () =>{
            fetchAllLedgers();
            store.dispatch("Shif/updateState",{selectedShif:null, selectedLedger:null});
            ledComponentKey.value += 1;
            handleReset();
            updateFormFields();
            propModalVisible.value = true;
            store.dispatch("Shif/updateState",{isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                fetchAllLedgers();
                const shifID = row['shif_id'];
                let formData = {
                    company: companyID.value,
                    shif: shifID
                }
                await store.dispatch('Shif/fetchShif',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const shifID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    shif: shifID
                }
                await store.dispatch('Shif/deleteShif',formData).
                then(()=>{
                    searchShifs();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };

        onBeforeMount(()=>{
            searchShifs();
            
        })
        return{
            title, searchShifs,resetFilters, addButtonLabel, searchFilters, tableColumns, shifList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewShif, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveShif, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeShif, removeShifs,addingRight,removingRight,rightsModule,selectSearchQuantity,selectedValue,
        }
    }
};
</script>