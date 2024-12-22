<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewDeduction"
            :searchFilters="searchFilters"
            @searchPage="searchDeductions"
            @resetFilters="resetFilters"
            @removeItem="removeDeduction"
            @removeSelectedItems="removeDeductions"
            @printList="printDeductionsList"
            @printExcel="downloadDeductionsExcel"
            @printCSV="downloadDeductionsCSV"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="deductionsList"
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
                :displayButtons="displayButtons" @handleSubmit="saveDeduction" @handleReset="handleReset"
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
    name: 'Deductions',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const ledComponentKey = ref(0);
        const idField = 'deduction_id';
        const addButtonLabel = ref('New Earning/Deduction');
        const addingRight = ref('Adding Earnings/Deductions');
        const rightsModule = ref('HR');
        const title = ref('Earning/Deduction Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const deductionsList = ref([]);
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
        const modal_width = ref('30vw');
        const ledgerID = ref('');
        const isEditing = computed(()=> store.state.Deductions.isEditing);
        const selectedDeduction = computed(()=> store.state.Deductions.selectedDeduction);
        const selectedLedger = computed(()=> store.state.Deductions.selectedLedger);
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Earning/Deduction Name", key:"deduction_name"},
            {label: "Type", key: "deduction_type"},
            {label: "Taxed", key:"taxation_status"},
            {label: "Charge Mode", key:"default_mode"},
            {label: "Amount", key:"default_value"},
            {label: "Posting Account", key:"posting_account_name"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Earnings/Deductions', rightName: 'Editing Earnings/Deductions'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Earnings/Deductions', rightName: 'Deleting Earnings/Deductions'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const deduction_name_search = ref('');
        const deduction_type_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Group Name...", value: deduction_name_search, width:56,},
            {
                type:'dropdown', placeholder:"Type..", value: deduction_type_search, width:56,
                options: [{text:'Earning',value:'Earning'},{text:'Deduction',value:'Deduction'}]
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
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
           return (selectedDeduction.value && selectedDeduction.value.posting_account && !ledgerID.value) ? selectedDeduction.value.posting_account.ledger_id : ledgerID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                
                { type: 'text', name: 'deduction_name',label: "Name", value: selectedDeduction.value?.deduction_name || '', required: true },
                { type: 'dropdown', name: 'deduction_type',label: "Type", value: selectedDeduction.value?.deduction_type || '', placeholder: "", required: true, options: [{ text: 'Earning', value: 'Earning' }, { text: 'Deduction', value: 'Deduction' }] },
                { type: 'dropdown', name: 'default_mode',label: "Charge Mode", value: selectedDeduction.value?.default_mode || '', placeholder: "", required: true, options: [{ text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'Basic Percentage', value: 'Basic Percentage' },{ text: 'Gross Percentage', value: 'Gross Percentage' }, { text: 'Net Percentage', value: 'Net Percentage' }] },
                { type: 'number', name: 'default_value',label: "Value", value: selectedDeduction.value?.default_value || 0, required: false },
                { type: 'dropdown', name: 'taxation_status',label: "Taxed", value: selectedDeduction.value?.taxation_status || 'No', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                {  
                    type:'search-dropdown', label:"Posting Account", value: ledgerValue.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Posting Account...', dropdownWidth: '500px', updateValue: selectedLedger.value,
                    fetchData: store.dispatch('Ledgers/fetchLedgers', {company:companyID.value}),
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

        watch([selectedDeduction, selectedLedger], () => {
            if (selectedDeduction.value && selectedLedger.value) {
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
        const createDeduction = async() =>{
            showModalLoader();
            let formData = {
                deduction_name: formFields.value[0].value,
                deduction_type: formFields.value[1].value,
                default_mode: formFields.value[2].value,
                default_value: formFields.value[3].value,
                taxation_status: formFields.value[4].value || 'No',
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
                    const response = await store.dispatch('Deductions/createDeduction', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Earning/Deduction created successfully!');
                        handleReset();
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Earning/Deduction.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Earning/Deduction: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchDeductions();
                }
            }
        }
        const updateDeduction = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                deduction: selectedDeduction.value.deduction_id,
                deduction_name: formFields.value[0].value,
                deduction_type: formFields.value[1].value,
                default_mode: formFields.value[2].value,
                default_value: formFields.value[3].value,
                taxation_status: formFields.value[4].value || 'No',
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
                    const response = await store.dispatch('Deductions/updateDeduction', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        ledComponentKey.value += 1;
                        toast.success("Earning/Deduction updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Earning/Deduction.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update unit: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Deductions/updateState",{selectedGroup:null})
                    searchDeductions();
                }             
            }
        }
        const saveDeduction = () =>{
            if(isEditing.value == true){
                updateDeduction();
            }else{
                createDeduction();
            }
        }
        const removeDeduction = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    deduction: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Deductions/deleteDeduction',formData)
                    if(response && response.status == 200){
                        toast.success("Earning/Deduction Removed Succesfully");
                        searchDeductions();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Earning/Deduction: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Earning/Deduction") 
            }else{
                toast.error("Please Select An Earning/Deduction To Remove")
            }
        }
        const removeDeductions = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    deduction: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Deductions/deleteDeduction',formData)
                    if(response && response.status == 200){
                        toast.success("Earning/Deduction(s) Removed Succesfully");
                        searchDeductions();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Earning/Deduction: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select An Earning/Deduction To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchDeductions = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                deduction_name: deduction_name_search.value,
                deduction_type: deduction_type_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/deductions-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                deductionsList.value = response.data.results;
                store.commit('Deductions/LIST_DEDUCTIONS', deductionsList.value)
                propResults.value = response.data;
                propArrLen.value = deductionsList.value.length;
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
            searchDeductions(selectedValue.value);
        };
        const resetFilters = () =>{
            selectedValue.value = 50;
            deduction_name_search.value = "";
            deduction_type_search.value = "";
            searchDeductions();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchDeductions();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchDeductions();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchDeductions();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchDeductions();
            // scrollToTop();
        }
        const addNewDeduction = () =>{
            store.dispatch("Deductions/updateState",{selectedDeduction:null, selectedLedger:null});
            ledComponentKey.value += 1;
            handleReset();
            updateFormFields();
            propModalVisible.value = true;
            store.dispatch("Deductions/updateState",{isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const deductionID = row['deduction_id'];
                let formData = {
                    company: companyID.value,
                    deduction: deductionID
                }
                await store.dispatch('Deductions/fetchDeduction',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';

            }else if(action == 'delete'){
                const deductionID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    deduction: deductionID
                }
                await store.dispatch('Deductions/deleteDeduction',formData).
                then(()=>{
                    searchDeductions();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printDeductionsList = () =>{
            showLoader();
            let formData = {
                deduction_name: deduction_name_search.value,
                deduction_type: deduction_type_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 

            axios
            .post("api/v1/export-deductions-pdf/", formData, { responseType: 'blob' })
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
        };
        const downloadDeductionsExcel = () =>{
            showLoader();
            let formData = {
                deduction_name: deduction_name_search.value,
                deduction_type: deduction_type_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios.post("api/v1/export-deductions-excel/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Earning/Deductions.xlsx');
                document.body.appendChild(link);
                link.click();
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        const downloadDeductionsCSV = () =>{
            showLoader();
            let formData = {
                deduction_name: deduction_name_search.value,
                deduction_type: deduction_type_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios.post("api/v1/export-deductions-csv/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Deductions.csv');
                document.body.appendChild(link);
                link.click();
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        onBeforeMount(()=>{
            searchDeductions();
            
        })
        return{
            title, searchDeductions,resetFilters, addButtonLabel, searchFilters, tableColumns, deductionsList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewDeduction, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveDeduction, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeDeduction, removeDeductions,addingRight,rightsModule,printDeductionsList,selectSearchQuantity,selectedValue,
            downloadDeductionsCSV,downloadDeductionsExcel
        }
    }
};
</script>