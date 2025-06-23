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
            @handleShowDetails="handleShowDetails"
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
            :showDetails="showDetails"
            :detailsTitle="detailsTitle"
            @hideDetails="hideDetails"
        >
            <div>
                <div class="tabs pt-1">
                    <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                        {{ tab }}
                    </button>
                </div>
                <div class="tab-content mt-3">
                    <div v-show="activeTab == 0">
                        <div class="border border-slate-200 rounded relative py-2 w-[75%] px-2 min-h-[50px]">                    
                            <ShowDetailsTable :key="tableKey" :columns="categoryColumns" :rows="assignedCategoryRows" :displayButtons="displayDetailsButtons" :fields="detailsField" :idField="idFieldCategory" @handleSelectionChange="handleCategoryChange" :showActions="showActions" :rightsModule="rightsModule" />
                        </div>
                    </div>
                </div>
                
            </div>
        </PageComponent>
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="saveCategory" @handleReset="handleReset"
            />
        </MovableModal>
        <MovableModal v-model:visible="depModalVisible" :title="title1" :modal_top="modal_top1" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader1" @showLoader="showModalLoader1" @hideLoader="hideModalLoader1" @closeModal="closeModal1">
            <DynamicForm 
                :fields="formFields1" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="addSubCategory" @handleReset="handleReset"
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
import ShowDetailsTable from '@/components/ShowDetailsTable.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import Swal from 'sweetalert2';

export default{
    name: 'Item_Categories',
    components:{
        PageComponent, MovableModal,DynamicForm,ShowDetailsTable
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const modal_loader1 = ref('none');
        const idField = 'petty_cash_item_category_id';
        const addButtonLabel = ref('New Category');
        const addingRight = ref('Adding Petty Cash Item Category');
        const removingRight = ref('Deleting Petty Cash Item Category');
        const rightsModule = ref('Accounts');
        const title = ref('Category Details');
        const title1 = ref('Add Sub Category');
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
        const depModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_top1 = ref('400px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const ledgerID = ref('');
        const isEditing = computed(()=> store.state.Petty_Cash_Item_Categories.isEditing);
        const selectedCategory = computed(()=> store.state.Petty_Cash_Item_Categories.selectedCategory);
        const selectedSubCategory = computed(()=> store.state.Petty_Cash_Item_Categories.selectedSubCategory);
        const selectedLedger = computed(()=> store.state.Petty_Cash_Item_Categories.selectedLedger);
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const showModal = ref(false);
        const showDetails = ref(false);
        const showActions = ref(false);
        const detailsTitle = ref('');
        const displayDetailsButtons = ref(true);
        const tabs = ref(['Sub Categories']);
        const idFieldCategory = 'petty_cash_item_subcategory_id';
        const categoryColumns = ref([
            {type: "checkbox"},
            {label: "Category Name", key:"category_name"},
            {label: "Min Amount", key:"min_amount"},
            {label: "Max Amount", key:"max_amount"},
        ]);
        const selectedCategoryIds = ref([]);
        const assignedCategoryRows = ref([]);
        const activeTab = ref(0);
        const categoryID = ref(null);
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
        const handleCategoryChange = (ids) => {
            selectedCategoryIds.value = ids;
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
        };
        const handleShowDetails = async(row) =>{
            activeTab.value = 0;
            categoryID.value = row['petty_cash_item_category_id'];
            detailsTitle.value = row['category_name'] + ' Category';
            showDetails.value = true;
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
            let formData = {
                petty_cash_item_category: row['petty_cash_item_category_id'],
                company: companyID.value
            }
            axios.post('api/v1/get-petty-cash-item-subcategories/',formData)
            .then((response)=>{
                assignedCategoryRows.value = response.data;
            })
            .catch((error)=>{
                console.log(error.message)
            })
        };
        const selectTab = async(index) => {

        };
        const hideDetails = async() =>{
            showDetails.value = false;
        };
        const formFields1 = ref([]);
        const updateFormFields1 = () => {
            formFields1.value = [
                { type: 'text', name: 'category_name',label: "Name", value: selectedSubCategory.value?.category_name || '', required: true },
                { type: 'number', name: 'min_amount',label: "Min Amount", value: selectedSubCategory.value?.min_amount || 0, required: false },
                { type: 'number', name: 'max_amount',label: "Max Amount", value: selectedSubCategory.value?.max_amount || 0, required: false },
            ]
        };
        watch([selectedSubCategory], () => {
            if (selectedSubCategory.value) {
                updateFormFields1();
            }else{
                updateFormFields1();
            }
            
        }, { immediate: true });
        const displaySubCategories = () =>{
            store.dispatch("Petty_Cash_Item_Categories/updateState",{selectedSubCategory:null, isEditing:false})
            depModalVisible.value = true;
            updateFormFields1();
        };
        const editSubCategory = async() =>{
            if(selectedCategoryIds.value.length == 1){
                const categoryID = selectedCategoryIds.value[0];
                let formData = {
                    company: companyID.value,
                    petty_cash_item_subcategory: categoryID
                }
                await store.dispatch('Petty_Cash_Item_Categories/fetchItemSubCategory',formData)
                depModalVisible.value = true;
                updateFormFields1();
            }
        }
        const removeSubCategory = async() =>{
            let formData = {
                petty_cash_item_subcategory: selectedCategoryIds.value,
                company: companyID.value
            }
            Swal.fire({
            title: "Are you sure?",
            text: `Do you wish to Remove Sub Category?`,
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes Remove Sub Category!',
            cancelButtonText: 'Cancel!',
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            showLoaderOnConfirm: true,
            }).then((result) => {
            if (result.value) {
                axios.post(`api/v1/delete-petty-cash-item-subcategory/`,formData)
                .then((response)=>{
                    if(response.data.msg == "Success"){
                        Swal.fire("Success!", {
                            icon: "success",
                        }); 
                    }else{
                        Swal.fire({
                        title: "Error Removing Sub Category",
                        icon: "warning",
                        });
                    }                   
                })
                .catch((error)=>{
                    console.log(error.message);
                    Swal.fire({
                        title: error.message,
                        icon: "warning",
                    });
                })
                .finally(()=>{
                    selectedCategoryIds.value = [];
                });
            }else{
                Swal.fire(`Sub Category has not been removed!`);
            }
            })     
        };
        const detailsField = ref([
            {type: 'add', label: 'Add SubCategory', icon: 'fa fa-plus', method: displaySubCategories},
            {type: 'other', label: 'Edit SubCategory', icon: 'fa fa-edit', method: editSubCategory},
            {type: 'remove', label: 'Remove SubCategory', icon: 'fa fa-times', method: removeSubCategory},
        ]);
        const showModalLoader1 = () =>{
            modal_loader1.value = "block";
        }
        const hideModalLoader1 = () =>{
            modal_loader1.value = "none";
        }
        const closeModal1 = () =>{
            depModalVisible.value = false;
            hideModalLoader1();
            categoryID.value = '';
        };
        const createSubCategory = async() =>{
            showModalLoader1();
            let formData = {
                category: categoryID.value,
                category_id: categoryID.value,
                category_name: formFields1.value[0].value,
                min_amount: formFields1.value[1].value,
                max_amount: formFields1.value[2].value,
                company: companyID.value
            }
            errors.value = [];
            if(formFields1.value[0].value == ''){
                toast.error('Please Fill In Required Fields');
                hideModalLoader1();
            }
            else if(assignedCategoryRows.value.some(category => category.category_name === formFields1.value[0].value)){
                toast.error('Sub-Category Already Added To Category');
                hideModalLoader1();
            }else{
                try {
                    const response = await axios.post('api/v1/create-petty-cash-item-subcategory/',formData);
                    if (response && response.status === 201) {
                        toast.success('Success!');
                        closeModal1();
                    } else {
                        toast.error('An error occurred while adding the Sub Category.');
                    }
                } catch (error) {
                    toast.error('Failed to add Sub Category: ' + error.message);
                } finally {
                    hideModalLoader1();
                    depModalVisible.value = false;
                }
            }
        };
        const updateSubCategory = async() =>{
            showModalLoader1();
            let formData = {
                petty_cash_item_subcategory: selectedSubCategory.value.petty_cash_item_subcategory_id,
                category: selectedSubCategory.value.category.petty_cash_item_category_id,
                category_id: selectedSubCategory.value.category.petty_cash_item_category_id,
                category_name: formFields1.value[0].value,
                min_amount: formFields1.value[1].value,
                max_amount: formFields1.value[2].value,
                company: companyID.value
            }
            errors.value = [];
            if(formFields1.value[0].value == ''){
                toast.error('Please Fill In Required Fields');
                hideModalLoader1();
            }
            else{
                try {
                    const response = await axios.put('api/v1/update-petty-cash-item-subcategory/',formData);
                    if (response && response.status === 200) {
                        toast.success('Success!');
                        closeModal1();
                    } else {
                        toast.error('An error occurred while updating the Sub Category.');
                    }
                } catch (error) {
                    toast.error('Failed to update Sub Category: ' + error.message);
                } finally {
                    hideModalLoader1();
                    depModalVisible.value = false;
                }
            }
        };
        const addSubCategory = () =>{
            if(isEditing.value == true){
                updateSubCategory();
            }else{
                createSubCategory();
            }
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
            handleShowDetails, showDetails,assignedCategoryRows,categoryColumns,showActions,tabs,selectTab,activeTab,idFieldCategory, detailsTitle,hideDetails,detailsField,
            displayDetailsButtons, addSubCategory,modal_loader1,modal_top1, depModalVisible, title1, formFields1,showModalLoader1, hideModalLoader1,closeModal1,handleCategoryChange
        }
    }
};
</script>

<style scoped>
.tabs {
    display: flex;
    border-bottom: 1px solid #ccc;
}
.tab {
    padding: 2px 20px 2px 20px;
    cursor: pointer;
}

.tab.active {
    border-bottom: 2px solid #000;
}

.tab-content {
    padding: 1px;
}</style>