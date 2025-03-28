<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewTax"
        :searchFilters="searchFilters"
        @searchPage="searchTaxes"
        @resetFilters="resetFilters"
        @importData=""
        @removeItem="removeTax"
        @removeSelectedItems="removeTaxes"
        @printList="printList"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="taxList"
        :actions="actions"
        :idField="idField"
        @handleSelectionChange="handleSelectionChange"
        @handleActionClick="handleActionClick"
        :count="appCount"
        :currentPage="currentPage"
        :result="appArrLen"
        @loadPrev="loadPrev"
        @loadNext="loadNext"
        @firstPage="firstPage"
        @lastPage="lastPage"
        :showNextBtn="showNextBtn"
        :showPreviousBtn="showPreviousBtn"
    />
    <MovableModal v-model:visible="appModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
    >
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="saveTax" @handleReset="handleReset"
        />
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted,watch } from 'vue';
import { useStore } from "vuex";
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '@/components/NewDynamicForm.vue';
import { useDateFormatter } from '@/composables/DateFormatter';
import { useToast } from "vue-toastification";

export default{
    name: 'Tax_Mapping',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const { formatDate } = useDateFormatter();
        const addButtonLabel = ref('New Tax Type');
        const addingRight = ref('Adding Taxes');
        const removingRight = ref('Deleting Taxes');
        const rightsModule = ref('Accounts');
        const pageComponentKey = ref(0);
        const inputComponentKey = ref(0);
        const outputComponentKey = ref(0);
        const title = ref('Tax Type Details');
        const companyID = computed(()=> store.state.userData.company_id);
        const inputLedgerID = ref('');
        const outputLedgerID = ref('');
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const idField = 'tax_id';
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const taxList = ref([]);
        const appResults = ref([]);
        const appArrLen = ref(0);
        const appCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('40vw');
        const isEditing = computed(()=> store.state.Taxes.isEditing);
        const selectedTax = computed(()=> store.state.Taxes.selectedTax);
        const selectedInputAccount = computed(()=> store.state.Taxes.selectedInputAccount);
        const selectedOutputAccount = computed(()=> store.state.Taxes.selectedOutputAccount);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"tax_name",type: "text", editable: false},
            {label: "Rate", key:"tax_rate",type: "text", editable: false},
            {label: "Category", key: "tax_category", type: "text", editable: false},
            {label: "Input Account", key: "tax_input_account_name", type: "text", editable: false},
            {label: "Output Account", key: "tax_output_account_name", type: "text", editable: false},
            {label: "Withholding Acc", key: "withholding_account_name", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Tax', rightName: 'Editing Taxes'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Tax', rightName: 'Deleting Taxes'},
        ])
        const tax_name_search = computed({
            get: () => store.state.Taxes.tax_name_search,
            set: (value) => store.commit('Taxes/SET_SEARCH_FILTERS', {"tax_name_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: tax_name_search, width:64},

        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const fetchLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const handleSelectedInputAccount = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option);
            inputLedgerID.value = store.state.Ledgers.ledgerID;

        };
        const clearSelectedInputAccount = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            inputLedgerID.value = ""
        };
        const handleSelectedOutputAccount = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            outputLedgerID.value = store.state.Ledgers.ledgerID;
        };
        const clearSelectedOutputAccount = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            outputLedgerID.value = ""
        };
        const formFields = ref([]);
        const inputValue = computed(() => {
           return (selectedTax.value && selectedTax.value.tax_input_account && !inputLedgerID.value) ? selectedTax.value.tax_input_account.ledger_id : inputLedgerID.value;

        });
        const outputValue = computed(() => {
            return (selectedTax.value && selectedTax.value.tax_output_account && !outputLedgerID.value) ? selectedTax.value.tax_output_account.ledger_id : outputLedgerID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
            { type: 'text', name: 'tax_name',label: "Name", value: selectedTax.value?.tax_name || '', required: true },
            { type: 'number', name: 'tax_rate',label: "Rate", value: selectedTax.value?.tax_rate || '', required: true },
            { type: 'dropdown', name: 'tax_type',label: "Type", value: selectedTax.value?.tax_type || '', placeholder: "", required: true, options: [{ text: 'VAT', value: 'VAT' }, { text: 'Withholding Tax', value: 'Withholding Tax' }]},
            { type: 'dropdown', name: 'tax_category',label: "Category", value: selectedTax.value?.tax_category || '', placeholder: "", required: false, options: [{ text: 'Resident', value: 'Resident' }, { text: 'Non Resident', value: 'Non Resident' }] },
            {  
                type:'search-dropdown', label:"Input Account", value: inputValue.value, componentKey: inputComponentKey,
                selectOptions: ledgerArray, optionSelected: handleSelectedInputAccount, required: true,
                searchPlaceholder: 'Select Input Account...', dropdownWidth: '500px', updateValue: selectedInputAccount.value,
                fetchData: fetchLedgers(), clearSearch: clearSelectedInputAccount()
            },
            {  
                type:'search-dropdown', label:"Output Account", value: outputValue.value, componentKey: outputComponentKey,
                selectOptions: ledgerArray, optionSelected: handleSelectedOutputAccount, required: true,
                searchPlaceholder: 'Select Output Account...', dropdownWidth: '500px', updateValue: selectedOutputAccount.value,
                 clearSearch: clearSelectedOutputAccount()
            },
            
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            outputLedgerID.value = '';
            inputLedgerID.value = '';
            inputComponentKey.value += 1;
            outputComponentKey.value += 1;
        }

        watch([selectedTax, selectedInputAccount, selectedOutputAccount], () => {
            if (selectedTax.value && selectedInputAccount.value && selectedOutputAccount.value) {
                inputComponentKey.value += 1;
                outputComponentKey.value += 1;
                updateFormFields();
            }else{
                updateFormFields();
            }
            
        }, { immediate: true });
        
        const addNewTax = () =>{
            store.dispatch("Taxes/updateState",{selectedTax:null,selectedOutputAccount:null,selectedInputAccount:null,isEditing:false})
            inputLedgerID.value = "";
            outputLedgerID.value = "";
            appModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const taxID = row[idField];
                let formData = {
                    company: companyID.value,
                    tax: taxID
                }
                
                await store.dispatch('Taxes/fetchTax',formData)
                appModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';
                inputComponentKey.value += 1;
                outputComponentKey.value += 1;
                
            }else if(action == 'delete'){
                const taxID = row[idField];
                let formData = {
                    company: companyID.value,
                    tax: taxID
                }

                await store.dispatch('Taxes/deleteTax',formData)
                searchTaxes();         
            }
        } 
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createTax = async() =>{
            showModalLoader();
            let formData = {
                tax_name: formFields.value[0].value,
                tax_rate: formFields.value[1].value,
                tax_type: formFields.value[2].value,
                tax_category: formFields.value[3].value || 'Resident',
                tax_input_account: inputValue.value,
                tax_input_account_id: inputValue.value,
                tax_output_account: outputValue.value,
                tax_output_account_id: outputValue.value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=0; i < (formFields.value.length - 2); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(inputValue.value == '' || outputValue.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Taxes/createTax', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Tax created successfully!');
                        handleReset();
                        inputComponentKey.value += 1;
                        outputComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the tax.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create tax: ' + error.message);
                } finally {
                    hideModalLoader();
                    store.dispatch('Ledgers/updateState',{ledgerID:''})
                    searchTaxes();
                }
            }
        }
        const updateTax = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                tax: selectedTax.value.tax_id,
                tax_name: formFields.value[0].value,
                tax_rate: formFields.value[1].value,
                tax_type: formFields.value[2].value,
                tax_category: formFields.value[3].value || 'Resident',
                tax_input_account: inputValue.value,
                tax_input_account_id: inputValue.value,
                tax_output_account: outputValue.value,
                tax_output_account_id: outputValue.value,
                company: companyID.value
            }

            for(let i=0; i < (formFields.value.length - 2); i++){
                if(formFields.value[i].value ==''){
                    errors.value.push('Error');
                }
            }
            if(inputValue.value == '' || outputValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Taxes/updateTax', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Tax updated successfully!");              
                        inputComponentKey.value += 1;
                        outputComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while updating the Tax.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Tax: ' + error.message);
                } finally {
                    hideModalLoader();
                    appModalVisible.value = false;
                    store.dispatch('Taxes/updateState',{ledgerID:''})
                    store.dispatch("Taxes/updateState",{selectedTax:null,selectedInputAccount:null,selectedOutputAccount:null})
                    searchTaxes();
                }             
            }
        }
        const saveTax = () =>{
            if(isEditing.value == true){
                updateTax();
            }else{
                createTax();
            }
        }

        const removeTax = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    taxes: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Taxes/deleteTax',formData)
                    if(response && response.status == 200){
                        toast.success("Tax Removed Succesfully");
                        searchTaxes();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove tax: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    pageComponentKey.value += 1;
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 tax") 
            }else{
                toast.error("Please Select A Tax To Remove")
            }
        }
        const removeTaxes = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    taxes: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Taxes/deleteTax',formData)
                    if(response && response.status == 200){
                        toast.success("Taxes Removed Succesfully");
                        searchTaxes();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Taxes: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    pageComponentKey.value += 1;
                }
            }else{
                toast.error("Please Select Taxes To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchTaxes = () =>{
            showLoader();
            selectedIds.value = [];
            let formData = {
                tax_name: tax_name_search.value,
                company: companyID.value
            }

            axios
            .post(`api/v1/taxes-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                taxList.value = response.data.results;
                store.commit('Taxes/LIST_TAXES', taxList.value)
                appResults.value = response.data;
                appArrLen.value = taxList.value.length;
                appCount.value = appResults.value.count;
                pageCount.value = Math.ceil(appCount.value / 50);
                
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
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchTaxes();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchTaxes();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchTaxes();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchTaxes();
        }
        const resetFilters = () =>{
            store.commit('Taxes/RESET_SEARCH_FILTERS')
            searchTaxes();
        }
        const closeModal = () =>{
            appModalVisible.value = false;
            store.dispatch('Ledgers/updateState',{ledgerID:''})
            store.dispatch("Taxes/updateState",{selectedTax:null,selectedInputAccount:null,selectedOutputAccount:null})
        }
        onMounted(() =>{
            searchTaxes();
        })
        return{
            title, searchTaxes, idField, selectedIds, actions, taxList, appArrLen,appCount,appResults,appModalVisible,formFields,
            addButtonLabel, searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,flex_basis,flex_basis_percentage,
            showNextBtn,showPreviousBtn,addNewTax, handleActionClick,saveTax,displayButtons,handleReset,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            closeModal, handleSelectionChange, removeTax, removeTaxes, pageComponentKey,addingRight,removingRight,rightsModule
        }
    }
}
</script>
