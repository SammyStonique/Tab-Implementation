<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewRate"
        :searchFilters="searchFilters"
        @searchPage="searchRates"
        @resetFilters="resetFilters"
        @removeItem="removeRate"
        @removeSelectedItems="removeRates"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="ratesList"
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
            :displayButtons="displayButtons" @handleSubmit="saveRate" @handleReset="handleReset"
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
    name: 'Interest_Rates',
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
        const addButtonLabel = ref('New Interest Rate');
        const addingRight = ref('Adding Interest Rates');
        const removingRight = ref('Deleting Interest Rates');
        const rightsModule = ref('MMS');
        const idField = 'interest_rate_id';
        const depModalVisible = ref(false);
        const selectedIds = ref([]);
        const ratesList = ref([]);
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
        const selectedRate = computed(()=> store.state.Interest_Rates.selectedRate);
        const selectedProduct = computed(()=> store.state.Interest_Rates.selectedProduct);
        const selectedPeriod = computed(()=> store.state.Interest_Rates.selectedPeriod);
        const isEditing = computed(()=> store.state.Interest_Rates.isEditing);
        const productArray = computed(() => store.state.Savings_Products.productArr);
        const periodArray = computed(() => store.state.Fiscal_Periods.periodArr);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "date", type: "text", editable: false},
            {label: "Saving Product", key: "saving_product", type: "text", editable: false},
            {label: "Saving Period", key: "fiscal_period", type: "text", editable: false},
            {label: "Interest Rate(%)", key: "interest_rate", type: "text", editable: false},
            {label: "Retention Rate(%)", key: "retention_rate", type: "text", editable: false},
        ])
        const showTotals = ref(false);
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Rate', rightName: 'Editing Interest Rates'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Rate', rightName: 'Deleting Interest Rates'},
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
            return (selectedRate.value && selectedRate.value.saving_product && !productID.value) ? selectedRate.value.saving_product.savings_product_id : productID.value;
        });
        const periodValue = computed(() => {
            return (selectedRate.value && selectedRate.value.fiscal_period && !periodID.value) ? selectedRate.value.fiscal_period.fiscal_period_id : periodID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Saving Product", value: productValue.value, componentKey: memComponentKey,
                    selectOptions: productArray, optionSelected: handleSelectedProduct, required: true,
                    searchPlaceholder: 'Select Product...', dropdownWidth: '500px',updateValue: selectedProduct.value,
                    clearSearch: clearSelectedProduct
                },
                {  
                    type:'search-dropdown', label:"Saving Period", value: periodValue.value, componentKey: prodComponentKey,
                    selectOptions: periodArray, optionSelected: handleSelectedPeriod, required: true,
                    searchPlaceholder: 'Select Period...', dropdownWidth: '500px',updateValue: selectedPeriod.value,
                    clearSearch: clearSelectedPeriod
                },
                { type: 'date', name: 'date',label: "Declared Date", value: selectedRate.value?.date || '', required: true },
                { type: 'text', name: 'interest_rate',label: "Interest Rate(%)", value: selectedRate.value?.interest_rate || '0', required: true },
                { type: 'text', name: 'retention_rate',label: "Retention Rate(%)", value: selectedRate.value?.retention_rate || '0', required: false },
            ];
        };

        watch([selectedRate, selectedProduct, selectedPeriod], () => {
            if (selectedRate.value && selectedProduct.value && selectedPeriod.value) {
                memComponentKey.value += 1;
                prodComponentKey.value += 1;
                updateFormFields();
            }
            
        }, { immediate: true });

        const addNewRate = async() =>{
            await store.dispatch('Interest_Rates/updateState', {selectedRate: null,selectedPeriod: null,selectedProduct: null,isEditing: false});
            updateFormFields();
            depModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                await store.dispatch('Interest_Rates/updateState', {selectedRate: null,selectedPeriod: null,selectedProduct: null,isEditing: false});
                const rateID = row[idField];
                let formData = {
                    company: companyID.value,
                    interest_rate: rateID
                }
                await store.dispatch('Interest_Rates/fetchInterestRate',formData)
                depModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';
                
            }
            else if(action == 'delete'){
                const rateID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    interest_rate: rateID
                }
                await store.dispatch('Interest_Rates/deleteInterestRate',formData).
                then(()=>{
                    searchRates();
                })
            }
        } 
        const handleReset = async() =>{
            await store.dispatch('Interest_Rates/updateState', {selectedRate: null,selectedPeriod: null,selectedProduct: null,isEditing: false});
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
        const createRate = async() =>{
            showModalLoader();
            let formData = {
                date: formFields.value[2].value,
                interest_rate: formFields.value[3].value,
                retention_rate: formFields.value[4].value,
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
                    const response = await store.dispatch('Interest_Rates/createInterestRate', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Rate created successfully!');
                        handleReset();
                        memComponentKey.value += 1;
                        prodComponentKey.value += 1;
                    }else {
                        toast.error('An error occurred while creating the Rate.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Rate: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchRates();
                }
            }

        }

        const updateRate = async() =>{
            showModalLoader();
            let formData = {
                interest_rates: selectedRate.value.interest_rate_id,
                date: formFields.value[2].value,
                interest_rate: formFields.value[3].value,
                retention_rate: formFields.value[4].value,
                saving_product: productValue.value,
                saving_product_id: productValue.value,
                fiscal_period: periodValue.value,
                fiscal_period_id: periodValue.value,
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
                    const response = await store.dispatch('Interest_Rates/updateInterestRate', formData);
                    if(response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Rate updated successfully!');
                        handleReset();
                        memComponentKey.value += 1;
                        prodComponentKey.value += 1;
                    }else {
                        toast.error('An error occurred while upating the Rate.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Rate: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchRates();
                }
            }

        }

        const saveRate = () =>{
            if(isEditing.value == true){
                updateRate();
            }else{
                createRate();
            }
        };

        const removeRate = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    interest_rate: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Interest_Rates/deleteInterestRate',formData)
                    if(response && response.status == 200){
                        toast.success("Rate Removed Succesfully");
                        searchRates();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Rate: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Rate") 
            }else{
                toast.error("Please Select A Rate To Remove")
            }
        }
        const removeRates = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    interest_rate: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Interest_Rates/deleteInterestRate',formData)
                    if(response && response.status == 200){
                        toast.success("Rate(s) Removed Succesfully");
                        searchRates();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Rate(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Rate To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchRates = () =>{
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
            .post(`api/v1/interest-rates-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                ratesList.value = response.data.results;
                store.commit('Interest_Rates/LIST_RATES', ratesList.value)
                depResults.value = response.data;
                depArrLen.value = ratesList.value.length;
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
            searchRates(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchRates();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchRates();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchRates();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchRates();
        }
        const resetFilters = () =>{
            selectedValue.value = 50;
            periodSearchComponentKey.value += 1;
            periodSearchID.value = "";
            prodSearchComponentKey.value += 1;
            productSearchID.value = "";
            searchRates();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchRates();
        })
        return{
            title,idField, searchRates, addButtonLabel, searchFilters, resetFilters, tableColumns, ratesList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewRate,showTotals,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveRate,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeRate, removeRates,
            addingRight,removingRight,rightsModule, closeModal,selectSearchQuantity,selectedValue,handleSelectionChange,importTransfers
        }
    }
}
</script>