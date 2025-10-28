<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewRate"
        :searchFilters="searchFilters"
        :dropdownOptions="dropdownOptions"
        @handleDynamicOption="handleDynamicOption"
        @searchPage="searchExchangeRates"
        @resetFilters="resetFilters"
        @removeItem="removeRate"
        @removeSelectedItems="removeRates"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="ratesList"
        :actions="actions"
        :idField="idField"
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
            :displayButtons="displayButtons" @handleSubmit="saveExchangeRate" @handleReset="handleReset"
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
    name: 'Exchange_Rates',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Exchange Rate Details');
        const addButtonLabel = ref('New Rate');
        const addingRight = ref('Adding Exchange Rates');
        const removingRight = ref('Deleting Exchange Rates');
        const rightsModule = ref('Accounts');
        const idField = 'exchange_rate_id';
        const depModalVisible = ref(false);
        const tgtComponentKey = ref(0);
        const baseComponentKey = ref(0);
        const selectedIds = ref([]);
        const ratesList = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const selectedValue = ref(50);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('250px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const isEditing = computed(()=> store.state.Exchange_Rates.isEditing)
        const selectedRate = computed(()=> store.state.Exchange_Rates.selectedRate);
        const selectedBaseCurrency = computed(()=> store.state.Exchange_Rates.selectedBaseCurrency);
        const selectedTargetCurrency = computed(()=> store.state.Exchange_Rates.selectedTargetCurrency);
        const currencyArray = computed(() => store.state.Currencies.currencyArr);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "date", type: "text"},
            {label: "Base Currency", key: "from_currency", type: "text"},
            {label: "Target Currency", key: "to_currency", type: "text"},
            {label: "Exchange Rate", key: "exchange_rate", type: "text"}
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Rate', rightName: 'Editing Exchange Rates'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Rate', rightName: 'Deleting Exchange Rates'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const baseCurrID = ref("");
        const tgtCurrID = ref("");
        const currency_name_search = ref('');
        const currency_code_search = ref('');
        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Search Code...", value: currency_code_search, width: 32},
            {type:'text', placeholder:"Search Name...", value: currency_name_search, width: 48},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:32, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:32, title: "Date To Search"},
        ]);
        const fetchCurrencies = async() =>{
            await store.dispatch('Currencies/fetchCurrencies', {company:companyID.value})
        };
        const handleSelectedBaseCurrency = async(option) =>{
            await store.dispatch('Currencies/handleSelectedCurrency', option)
            baseCurrID.value = store.state.Currencies.currencyID;
        };
        const clearSelectedBaseCurrency = async() =>{
            await store.dispatch('Currencies/updateState', {currencyID: ''});
            baseCurrID.value = store.state.Currencies.currencyID;
        };
        const handleSelectedTargetCurrency = async(option) =>{
            await store.dispatch('Currencies/handleSelectedCurrency', option)
            tgtCurrID.value = store.state.Currencies.currencyID;
        };
        const clearSelectedTargetCurrency = async() =>{
            await store.dispatch('Currencies/updateState', {currencyID: ''});
            tgtCurrID.value = store.state.Currencies.currencyID;
        };
        const baseCurrValue = computed(() => {
           return (selectedRate.value && selectedRate.value.from_currency && !baseCurrID.value) ? selectedRate.value.from_currency.currency_id : baseCurrID.value;
        });
        const tgtCurrValue = computed(() => {
           return (selectedRate.value && selectedRate.value.to_currency && !tgtCurrID.value) ? selectedRate.value.to_currency.currency_id : tgtCurrID.value;
        });
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Base Currency", value: baseCurrValue.value, componentKey: baseComponentKey,
                    selectOptions: currencyArray, optionSelected: handleSelectedBaseCurrency, required: true,
                    searchPlaceholder: 'Select Base Currency...', dropdownWidth: '500px', updateValue: selectedBaseCurrency.value,
                    clearSearch: clearSelectedBaseCurrency
                },
                {  
                    type:'search-dropdown', label:"Target Currency", value: tgtCurrValue.value, componentKey: tgtComponentKey,
                    selectOptions: currencyArray, optionSelected: handleSelectedTargetCurrency, required: true,
                    searchPlaceholder: 'Select Target Currency...', dropdownWidth: '500px', updateValue: selectedTargetCurrency.value,
                    clearSearch: clearSelectedTargetCurrency
                },
                { type: 'date', name: 'date',label: "Effective Date", value: selectedRate.value?.date || '', required: true },
                { type: 'number', name: 'amount',label: "Exchange Rate", value: selectedRate.value?.exchange_rate || 0, required: true },
            ];
        };
        watch([selectedRate,selectedBaseCurrency,selectedTargetCurrency ], () => {
            if(selectedRate.value && selectedBaseCurrency.value && selectedTargetCurrency.value){
                updateFormFields();
                baseComponentKey.value += 1;
                tgtComponentKey.value += 1;
            }
        }, { immediate: true });
        const addNewRate = async() =>{
            depModalVisible.value = true;
            updateFormFields();
            handleReset();
            await store.dispatch("Exchange_Rates/updateState",{isEditing:false, selectedRate:null, selectedBaseCurrency:null, selectedTargetCurrency:null})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const rateID = row[idField];
                let formData = {
                    company: companyID.value,
                    exchange_rate: rateID
                }
                await store.dispatch('Exchange_Rates/fetchExchangeRate',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const rateID = row[idField];
                let formData = {
                    company: companyID.value,
                    exchange_rate: rateID
                }
                await store.dispatch('Exchange_Rates/deleteExchangeRate',formData).
                then(()=>{
                    searchExchangeRates();
                })
            }
        } 
        const handleReset = async() =>{
            await store.dispatch("Exchange_Rates/updateState",{isEditing:false, selectedRate:null, selectedBaseCurrency:null, selectedTargetCurrency:null})
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            tgtComponentKey.value += 1;
            baseComponentKey.value += 1;
            baseCurrID.value = "";
            tgtCurrID.value = "";
        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createExchangeRate = async() =>{
            showModalLoader();
            let formData = {
                from_currency: baseCurrID.value,
                from_currency_id: baseCurrID.value,
                to_currency: tgtCurrID.value,
                to_currency_id: tgtCurrID.value,
                date: formFields.value[2].value,
                exchange_rate: formFields.value[3].value,
                company: companyID.value
            }
            if(tgtCurrValue.value == "" || baseCurrValue.value == ""){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Exchange_Rates/createExchangeRate', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Success!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Exchange Rate.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Exchange Rate: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchExchangeRates();
                }
            }

        }
        const updateExchangeRate = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                from_currency: baseCurrValue.value,
                from_currency_id: baseCurrValue.value,
                to_currency: tgtCurrValue.value,
                to_currency_id: tgtCurrValue.value,
                date: formFields.value[2].value,
                exchange_rate: formFields.value[3].value,
                company: companyID.value,
                exchange_rates: selectedRate.value.exchange_rate_id
            }
            if(tgtCurrValue.value == "" || baseCurrValue.value == ""){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Exchange_Rates/updateExchangeRate', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Success!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Exchange Rate.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Exchange Rate: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchExchangeRates();
                }
            }
        }
        const saveExchangeRate = () =>{
            if(isEditing.value == true){
                updateExchangeRate();
            }else{
                createExchangeRate();
            }
        }
        const removeRate = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    currency: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Exchange_Rates/deleteCurrency',formData)
                    if(response && response.status == 200){
                        toast.success("Currency Removed Succesfully");
                        searchExchangeRates();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Currency: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Currency") 
            }else{
                toast.error("Please Select A Currency To Remove")
            }
        }
        const removeRates = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    currency: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Exchange_Rates/deleteCurrency',formData)
                    if(response && response.status == 200){
                        toast.success("Currency(s) Removed Succesfully");
                        searchExchangeRates();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Currency(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Currency To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchExchangeRates = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                name: currency_name_search.value,
                code: currency_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios
            .post(`api/v1/exchange-rates-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                ratesList.value = response.data.results;
                store.commit('Exchange_Rates/LIST_RATES', ratesList.value)
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
            searchExchangeRates(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchExchangeRates();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchExchangeRates();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchExchangeRates();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchExchangeRates();
        }
        const resetFilters = () =>{
            currentPage.value = 1;
            currency_code_search.value = "";
            currency_name_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            searchExchangeRates();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        };
        const dropdownOptions = ref([
            {label: 'Exchange Rate Prompts', action: 'view-exchange-rates', icon: 'fa-repeat', colorClass: 'text-yellow-600', rightName: 'Adding Exchange_Rates'},
        ]);
        const handleDynamicOption = async(option) =>{
            if(option == 'view-exchange-rates'){
                // store.commit('pageTab/ADD_PAGE', {'FA':'Exchange_Rates'});
                // store.state.pageTab.faActiveTab = 'Exchange_Rates'; 
            }
        };
        onMounted(()=>{
            searchExchangeRates();
            fetchCurrencies();
        })
        return{
            title,idField, searchExchangeRates, addButtonLabel, searchFilters, resetFilters, tableColumns, ratesList,
            currentPage,depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewRate,dropdownOptions,handleDynamicOption,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveExchangeRate,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeRate, removeRates,
            addingRight,removingRight,rightsModule, closeModal,selectSearchQuantity,selectedValue,selectedIds
        }
    }
}
</script>