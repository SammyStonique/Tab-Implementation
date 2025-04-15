<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="processingInterest"
        :searchFilters="searchFilters"
        @searchPage="searchProcessedInterests"
        @resetFilters="resetFilters"
        @removeItem="removeProcessing"
        @removeSelectedItems="removeProcessings"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="processingList"
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
            :displayButtons="displayButtons" @handleSubmit="processInterest" @handleReset="handleReset"
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

export default{
    name: 'Interest_Processing',
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
        const prodSearchComponentKey = ref(0);
        const periodSearchComponentKey = ref(0);
        const title = ref('Interest Rate Details');
        const addButtonLabel = ref('Process Interest');
        const addingRight = ref('Processing Savings Interest');
        const removingRight = ref('Deleting Processed Interests');
        const rightsModule = ref('MMS');
        const idField = 'interest_processing_id';
        const depModalVisible = ref(false);
        const selectedIds = ref([]);
        const processingList = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const productArray = computed(() => store.state.Savings_Products.productArr);
        const periodArray = computed(() => store.state.Fiscal_Periods.periodArr);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "date", type: "text", editable: false},
            {label: "Saving Product", key: "saving_product", type: "text", editable: false},
            {label: "Saving Period", key: "fiscal_period", type: "text", editable: false},
            {label: "Interest Amount", key: "total_interest", type: "text", editable: false},
            {label: "Retained Interest", key: "total_interest", type: "text", editable: false},
            {label: "Total Interest", key: "total_interest", type: "text", editable: false},
        ])
        const showTotals = ref(false);
        const actions = ref([
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Interests', rightName: 'Viewing Processed Interests'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Processing', rightName: 'Deleting Processed Interests'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const productID = ref('');
        const periodID = ref('');
        const productSearchID = ref('');
        const periodSearchID = ref('');

        const handleSelectedSearchProduct = async(option) =>{
            await store.dispatch('Savings_Products/handleSelectedProduct', option)
            productSearchID.value = store.state.Savings_Products.productID;
        };
        const clearSelectedSearchProduct = async() =>{
            await store.dispatch('Savings_Products/updateState', {productID: ''});
            productSearchID.value = store.state.Savings_Products.productID;
        };

        const handleSelectedSearchPeriod = async(option) =>{
            await store.dispatch('Fiscal_Periods/handleSelectedPeriod', option)
            periodSearchID.value = store.state.Fiscal_Periods.periodID;
        };
        const clearSelectedSearchPeriod = async() =>{
            await store.dispatch('Fiscal_Periods/updateState', {periodID: ''});
            periodSearchID.value = store.state.Fiscal_Periods.periodID;
        };
        const searchFilters = ref([
            {
                type:'search-dropdown', value: productArray, width:48, componentKey: prodSearchComponentKey,
                selectOptions: productArray, optionSelected: handleSelectedSearchProduct,
                searchPlaceholder: 'Saving Product...', dropdownWidth: '300px',
                fetchData: store.dispatch('Savings_Products/fetchSavingsProducts', {company:companyID.value}),
                clearSearch: clearSelectedSearchProduct
            },
            {
                type:'search-dropdown', value: periodArray, width:48, componentKey: periodSearchComponentKey,
                selectOptions: periodArray, optionSelected: handleSelectedSearchPeriod,
                searchPlaceholder: 'Saving Period...', dropdownWidth: '300px',
                fetchData: store.dispatch('Fiscal_Periods/fetchFiscalPeriods', {company:companyID.value}),
                clearSearch: clearSelectedSearchPeriod
            },
        ]);
        const importTransfers = () =>{
            
        }
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedProduct = async(option) =>{
            await store.dispatch('Savings_Products/handleSelectedProduct', option)
            productID.value = store.state.Savings_Products.productID;
        };
        const clearSelectedProduct = async() =>{
            await store.dispatch('Savings_Products/updateState', {productID: ''});
            productID.value = store.state.Savings_Products.productID;
        };
        const handleSelectedPeriod = async(option) =>{
            await store.dispatch('Fiscal_Periods/handleSelectedPeriod', option)
            periodID.value = store.state.Fiscal_Periods.periodID;
        };
        const clearSelectedPeriod = async() =>{
            await store.dispatch('Fiscal_Periods/updateState', {periodID: ''});
            periodID.value = store.state.Fiscal_Periods.periodID;
        };
        const formFields = ref([]);
        const productValue = computed(() => {
            return productID.value;
        });
        const periodValue = computed(() => {
            return periodID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Saving Product", value: productValue.value, componentKey: memComponentKey,
                    selectOptions: productArray, optionSelected: handleSelectedProduct, required: true,
                    searchPlaceholder: 'Select Product...', dropdownWidth: '500px',
                    clearSearch: clearSelectedProduct
                },
                {  
                    type:'search-dropdown', label:"Saving Period", value: periodValue.value, componentKey: prodComponentKey,
                    selectOptions: periodArray, optionSelected: handleSelectedPeriod, required: true,
                    searchPlaceholder: 'Select Period...', dropdownWidth: '500px',
                    clearSearch: clearSelectedPeriod
                },
                { type: 'date', name: 'date',label: "Processing Date", value: '', required: true },
            ];
        };

        const processingInterest = async() =>{
            updateFormFields();
            depModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const rateID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    interest_processing: rateID
                }
                await store.dispatch('Interest_Processing/deleteInterestProcessing',formData).
                then(()=>{
                    searchProcessedInterests();
                })
            }
        } 
        const handleReset = async() =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].name == "interest_rate" || formFields.value[i].name == "retention_rate"){
                    formFields.value[i].value = '0';
                }else{
                    formFields.value[i].value = '';
                }
                
            }
            productID.value = "";
            periodID.value = "";
            prodComponentKey.value += 1;
            memComponentKey.value += 1;

        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const processInterest = async() =>{
            showModalLoader();
            let formData = {
                date: formFields.value[2].value,
                saving_product: productID.value,
                saving_product_id: productID.value,
                fiscal_period: periodID.value,
                fiscal_period_id: periodID.value,
                company: companyID.value
            };
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type !='search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(productValue.value == '' || periodValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Interest_Processing/createInterestProcessing', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Interest Processed successfully!');
                        handleReset();
                        memComponentKey.value += 1;
                        prodComponentKey.value += 1;
                    }else {
                        toast.error('An error occurred while processing the Interests.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to process Interests: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchProcessedInterests();
                }
            }

        }

        const removeProcessing = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    interest_processing: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Interest_Processing/deleteInterestProcessing',formData)
                    if(response && response.status == 200){
                        toast.success("Processed Interests Removed Succesfully");
                        searchProcessedInterests();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Processed Interests: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Processed Interest") 
            }else{
                toast.error("Please Select A Processed Interest To Remove")
            }
        }
        const removeProcessings = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    interest_processing: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Interest_Processing/deleteInterestProcessing',formData)
                    if(response && response.status == 200){
                        toast.success("Processed Interest(s) Removed Succesfully");
                        searchProcessedInterests();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Processed Interest(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Processed Interest To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchProcessedInterests = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                period: periodSearchID.value,
                product: productSearchID.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios
            .post(`api/v1/interest-processings-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                processingList.value = response.data.results;
                store.commit('Interest_Processing/LIST_PROCESSINGS', processingList.value)
                depResults.value = response.data;
                depArrLen.value = processingList.value.length;
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
            searchProcessedInterests(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchProcessedInterests();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchProcessedInterests();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchProcessedInterests();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchProcessedInterests();
        }
        const resetFilters = () =>{
            selectedValue.value = 50;
            periodSearchComponentKey.value += 1;
            periodSearchID.value = "";
            prodSearchComponentKey.value += 1;
            productSearchID.value = "";
            searchProcessedInterests();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchProcessedInterests();
        })
        return{
            title,idField, searchProcessedInterests, addButtonLabel, searchFilters, resetFilters, tableColumns, processingList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, processingInterest,showTotals,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, processInterest,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeProcessing, removeProcessings,
            addingRight,removingRight,rightsModule, closeModal,selectSearchQuantity,selectedValue,handleSelectionChange,importTransfers
        }
    }
}
</script>