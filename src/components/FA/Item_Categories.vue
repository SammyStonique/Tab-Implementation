<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewCategory"
            :searchFilters="searchFilters"
            @searchPage="searchCategories"
            @resetFilters="resetFilters"
            @removeItem="removeCategory"
            @removeSelectedItems="removeCategories"
            @printList="printList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="categoryList"
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
                :displayButtons="displayButtons" @handleSubmit="saveCategory" @handleReset="handleReset"
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
    name: 'Item_Categories',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'petty_cash_item_category_id';
        const addButtonLabel = ref('New Category');
        const addingRight = ref('Adding Petty Cash Item Category');
        const removingRight = ref('Deleting Petty Cash Item Category');
        const rightsModule = ref('Accounts');
        const title = ref('Category Details');
        const submitButtonLabel = ref('Add');
        const ledComponentKey = ref(0);
        const selectedIds = ref([]);
        const categoryList = ref([]);
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
        const isEditing = computed(()=> store.state.Petty_Cash_Item_Categories.isEditing);
        const selectedCategory = computed(()=> store.state.Petty_Cash_Item_Categories.selectedCategory);
        const selectedLedger = computed(()=> store.state.Petty_Cash_Item_Categories.selectedLedger);
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"category_name"},
            {label: "Posting Account", key:"posting_account"},
            {label: "Min Amount", key:"min_amount"},
            {label: "Max Amount", key:"max_amount"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Category', rightName: 'Editing Petty Cash Item Category'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Category', rightName: 'Deleting Petty Cash Item Category'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:60,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option);
            ledgerID.value = store.state.Ledgers.ledgerID;
            if(selectedCategory.value){
                selectedCategory.value.posting_account.ledger_id = ledgerID.value;
                ledgerValue.value = ledgerID.value
            }
        }
        const formFields = ref([]);
        const ledgerValue = computed(() => {
           return (selectedCategory.value && selectedCategory.value.posting_account && !ledgerID.value) ? selectedCategory.value.posting_account.ledger_id : ledgerID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'category_name',label: "Name", value: selectedCategory.value?.category_name || '', required: true },
                { type: 'number', name: 'min_amount',label: "Min Amount", value: selectedCategory.value?.min_amount || 0, required: false },
                { type: 'number', name: 'max_amount',label: "Max Amount", value: selectedCategory.value?.max_amount || 0, required: false },
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
            formFields.value[1].value = 0;
            formFields.value[2].value = 0;
        }

        watch([selectedCategory, selectedLedger], () => {
            if (selectedCategory.value && selectedLedger.value) {
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
        const createCategory = async() =>{
            showModalLoader();
            let formData = {
                category_name: formFields.value[0].value,
                min_amount: formFields.value[1].value || 0,
                max_amount: formFields.value[2].value || 0,
                posting_account: ledgerID.value,
                posting_account_id: ledgerID.value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=0; i < (formFields.value.length - 1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type == "search-dropdown"){
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
                    const response = await store.dispatch('Petty_Cash_Item_Categories/createItemCategory', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Success!');
                        handleReset();
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Category.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Category: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchCategories();
                }
            }
        }
        const updateItemCategory = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                petty_cash_item_category: selectedCategory.value.petty_cash_item_category_id,
                category_name: formFields.value[0].value,
                min_amount: formFields.value[1].value || 0,
                max_amount: formFields.value[2].value || 0,
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
                    const response = await store.dispatch('Petty_Cash_Item_Categories/updateItemCategory', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        ledComponentKey.value += 1;
                        toast.success("Success!");              
                    } else {
                        toast.error('An error occurred while updating the Category.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Category: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Petty_Cash_Item_Categories/updateState",{selectedCategory:null, selectedLedger:null})
                    searchCategories();
                }             
            }
        }
        const saveCategory = () =>{
            if(isEditing.value == true){
                updateItemCategory();
            }else{
                createCategory();
            }
        }
        const removeCategory = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    petty_cash_item_category: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Petty_Cash_Item_Categories/deleteItemCategory',formData)
                    if(response && response.status == 200){
                        toast.success("Category Removed Succesfully");
                        searchCategories();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Petty Cash: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Category") 
            }else{
                toast.error("Please Select A Category To Remove")
            }
        }
        const removeCategories = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    petty_cash_item_category: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Petty_Cash_Item_Categories/deleteItemCategory',formData)
                    if(response && response.status == 200){
                        toast.success("Petty Cash(s) Removed Succesfully");
                        searchCategories();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Petty Cash: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Petty Cash To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchCategories = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                category_name: name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/petty-cash-item-categories-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                categoryList.value = response.data.results;
                store.commit('Petty_Cash_Item_Categories/LIST_ITEM_CATEGORIES', categoryList.value)
                propResults.value = response.data;
                propArrLen.value = categoryList.value.length;
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
            searchCategories(selectedValue.value);
        };
        const resetFilters = () =>{
            selectedValue.value = 50;
            currentPage.value = 1;
            name_search.value = "";
            searchCategories();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchCategories();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchCategories();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchCategories();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchCategories();
            // scrollToTop();
        }
        const addNewCategory = () =>{
            store.dispatch("Petty_Cash_Item_Categories/updateState",{selectedCategory:null, selectedLedger:null, isEditing:false})
            ledgerID.value = "";
            ledComponentKey.value += 1;
            propModalVisible.value = true;
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const categoryID = row[idField];
                let formData = {
                    company: companyID.value,
                    petty_cash_item_category: categoryID
                }
                await store.dispatch('Petty_Cash_Item_Categories/fetchItemCategory',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';

            }else if(action == 'delete'){
                const categoryID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    petty_cash_item_category: categoryID
                }
                await store.dispatch('Petty_Cash_Item_Categories/deleteItemCategory',formData).
                then(()=>{
                    searchCategories();
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
            searchCategories();
            
        })
        return{
            title, searchCategories,resetFilters, addButtonLabel, searchFilters, tableColumns, categoryList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,selectSearchQuantity,selectedValue,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewCategory, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveCategory, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeCategory, removeCategories,addingRight,removingRight,rightsModule,
        }
    }
};
</script>