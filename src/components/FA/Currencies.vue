<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewCurrency"
        :searchFilters="searchFilters"
        @searchPage="searchCurrencies"
        @resetFilters="resetFilters"
        @removeItem="removeCurrency"
        @removeSelectedItems="removeCurrencies"
        :addingRight="addingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="currencyList"
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
            :displayButtons="displayButtons" @handleSubmit="saveCurrency" @handleReset="handleReset"
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
    name: 'Currencies',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Currency Details');
        const addButtonLabel = ref('New Currency');
        const addingRight = ref('Adding Currencies');
        const rightsModule = ref('Accounts');
        const idField = 'currency_id';
        const depModalVisible = ref(false);
        const currencyList = ref([]);
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
        const isEditing = computed(()=> store.state.Currencies.isEditing)
        const selectedCurrency = computed(()=> store.state.Currencies.selectedCurrency);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key: "code", type: "text", editable: false},
            {label: "Name", key: "name", type: "text", editable: false},
            {label: "Symbol", key: "symbol", type: "text", editable: false},
            {label: "Country", key: "country", type: "text", editable: false},
            {label: "Exchange Rate", key: "exchange_rate_to_base", type: "text", editable: false}
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Currency', rightName: 'Editing Currencies'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Currency', rightName: 'Deleting Currencies'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const currency_name_search = ref('');
        const currency_code_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Search Code...", value: currency_code_search, width: 44},
            {type:'text', placeholder:"Search Name...", value: currency_name_search, width: 64}
        ]);
        const formFields = ref([]);
        const updateFormFields = (currency) => {
            formFields.value = [
                { type: 'text', name: 'code',label: "Code", value: currency?.code || '', required: true },
                { type: 'text', name: 'name',label: "Name", value: currency?.name || '', required: true },
                { type: 'text', name: 'symbol',label: "Symbol", value: currency?.symbol || '', required: true },
                { type: 'text', name: 'country',label: "Country", value: currency?.country || '', required: true },
                { type: 'text', name: 'exchange_rate_to_base',label: "Exchange Rate To Base", value: currency?.exchange_rate_to_base || 1, required: true },
            ];
        };
        watch(selectedCurrency, (newCurrency) => {
            updateFormFields(newCurrency);
        }, { immediate: true });
        const addNewCurrency = () =>{
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Currencies/updateState",{isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const currencyID = row[idField];
                let formData = {
                    company: companyID.value,
                    currency: currencyID
                }
                await store.dispatch('Currencies/fetchCurrency',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const currencyID = row[idField];
                let formData = {
                    company: companyID.value,
                    currency: currencyID
                }
                await store.dispatch('Currencies/deleteCurrency',formData).
                then(()=>{
                    searchCurrencies();
                })
            }
        } 
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createCurrency = async() =>{
            showModalLoader();
            let formData = {
                name: formFields.value[1].value,
                code: formFields.value[0].value,
                symbol: formFields.value[2].value,
                country: formFields.value[3].value,
                exchange_rate_to_base: formFields.value[4].value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Currencies/createCurrency', formData);
                    if(response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Currency created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Currency.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Currency: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchCurrencies();
                }
            }

        }
        const updateCurrency = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                name: formFields.value[1].value,
                code: formFields.value[0].value,
                symbol: formFields.value[2].value,
                country: formFields.value[3].value,
                exchange_rate_to_base: formFields.value[4].value,
                company: companyID.value,
                currency: selectedCurrency.value.currency_id
            }
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
            }else{
                try {
                    const response = await store.dispatch('Currencies/updateCurrency', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Currency updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Currency.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Currency: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchCurrencies();
                }
            }
        }
        const saveCurrency = () =>{
            if(isEditing.value == true){
                updateCurrency();
            }else{
                createCurrency();
            }
        }
        const removeCurrency = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    currency: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Currencies/deleteCurrency',formData)
                    if(response && response.status == 200){
                        toast.success("Currency Removed Succesfully");
                        searchCurrencies();
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
        const removeCurrencies = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    currency: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Currencies/deleteCurrency',formData)
                    if(response && response.status == 200){
                        toast.success("Currency(s) Removed Succesfully");
                        searchCurrencies();
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
        const searchCurrencies = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                name: currency_name_search.value,
                code: currency_code_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios
            .post(`api/v1/currencies-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                currencyList.value = response.data.results;
                store.commit('Currencies/LIST_CURRENCIES', currencyList.value)
                depResults.value = response.data;
                depArrLen.value = currencyList.value.length;
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
            searchCurrencies(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchCurrencies();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchCurrencies();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchCurrencies();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchCurrencies();
        }
        const resetFilters = () =>{
            currency_code_search.value = "";
            currency_name_search.value = "";
            searchCurrencies();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchCurrencies();
        })
        return{
            title,idField, searchCurrencies, addButtonLabel, searchFilters, resetFilters, tableColumns, currencyList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewCurrency,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveCurrency,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeCurrency, removeCurrencies,
            addingRight,rightsModule, closeModal,selectSearchQuantity,selectedValue,
        }
    }
}
</script>