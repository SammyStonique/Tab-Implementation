<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewCategory"
        :searchFilters="searchFilters"
        @searchPage="searchCategories"
        @resetFilters="resetFilters"
        @removeItem="removeCategory"
        @removeSelectedItems="removeCategories"
        :addingRight="addingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="categoryList"
        :actions="actions"
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
    />
    <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="saveCategory" @handleReset="handleReset"
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
    name: 'Item_Categories',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Category Details');
        const addButtonLabel = ref('New Category');
        const addingRight = ref('Adding Item Categories');
        const rightsModule = ref('Inventory');
        const idField = 'category_id';
        const selectedIds = ref([]);
        const depModalVisible = ref(false);
        const categoryList = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
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
        const isEditing = computed(()=> store.state.Item_Categories.isEditing);
        const selectedCategory = computed(()=> store.state.Item_Categories.selectedCategory);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key: "category_name", type: "text", editable: false},
            {label: "Group", key: "item_group", type: "text", editable: false},
            {label: "Module", key: "module", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Category', rightName: 'Editing Item Categories'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Category', rightName: 'Deleting Item Categories'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = computed({
            get: () => store.state.Item_Categories.category_name_search,
            set: (value) => store.commit('Item_Categories/SET_SEARCH_FILTERS', {"category_name_search":value}),
        });
        const module_search = computed({
            get: () => store.state.Item_Categories.module_search,
            set: (value) => store.commit('Item_Categories/SET_SEARCH_FILTERS', {"module_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Search Name...", value: name_search},
            {
                type:'dropdown', placeholder:"Module..", value: module_search, width:40,
                options: [{text:'Inventory',value:'Inventory'},{text:'Accounts',value:'Accounts'},{text:'HMS',value:'HMS'}]
            },
        ]);
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'dropdown', name: 'item_group',label: "Item Group", value: selectedCategory.value?.item_group || '', placeholder: "", required: true, options: [{ text: 'Goods', value: 'Goods' }, { text: 'Service', value: 'Service' }] },
                { type: 'text', name: 'name',label: "Name", value: selectedCategory.value?.category_name || '', required: true },
                { type: 'dropdown', name: 'module',label: "Module", value: selectedCategory.value?.module || 'Inventory', placeholder: "", required: true, options: [{ text: 'Inventory', value: 'Inventory' }, { text: 'HMS', value: 'HMS' }, { text: 'Accounts', value: 'Accounts' }] },
            ];
        };
        watch([selectedCategory], () => {
            if(selectedCategory.value){
                updateFormFields();
            }      
        }, { immediate: true });
        const addNewCategory = async() =>{
            updateFormFields();
            await store.dispatch("Item_Categories/updateState",{isEditing:false, selectedCategory:null})
            console.log("ydttfttf ",store.state.Item_Categories.isEditing)
            depModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        };
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const categoryID = row[idField];
                let formData = {
                    company: companyID.value,
                    category: categoryID
                }
                await store.dispatch('Item_Categories/fetchItemCategory',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const categoryID = [row['category_id']];
                let formData = {
                    company: companyID.value,
                    category: categoryID
                }
                await store.dispatch('Item_Categories/deleteItemCategory',formData)
                searchCategories();
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
        const createCategory = async() =>{
            showModalLoader();
            let formData = {
                item_group: formFields.value[0].value,
                category_name: formFields.value[1].value,    
                item_count: 0, 
                module: formFields.value[2].value,
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
                    const response = await store.dispatch('Item_Categories/createItemCategory', formData);
                    if(response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Category created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the category.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create category: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchCategories();
                }
            }

        }
        const updateCategory = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                item_group: formFields.value[0].value,
                category_name: formFields.value[1].value,
                item_count: selectedCategory.value.item_count,
                module: formFields.value[2].value,
                category: selectedCategory.value.item_category_id,
                company: companyID.value,
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
                    const response = await store.dispatch('Item_Categories/updateItemCategory', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Category updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Category.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Category: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchCategories();
                }
            }
        }
        const saveCategory = () =>{
            if(isEditing.value == true){
                updateCategory();
            }else{
                createCategory();
            }
        }
        const removeCategory = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    category: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Item_Categories/deleteItemCategory',formData)
                    if(response && response.status == 200){
                        toast.success("Category Removed Succesfully");
                        searchCategories();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Category: ' + error.message);
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
                    category: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Item_Categories/deleteItemCategory',formData)
                    if(response && response.status == 200){
                        toast.success("Category(s) Removed Succesfully");
                        searchCategories();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Category(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Category To Remove")
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
            showPreviousBtn.value = false;
            let formData = {
                category_name: name_search.value,
                module: module_search.value,
                company_id: companyID.value
            }
            axios
            .post(`api/v1/item-category-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                categoryList.value = response.data.results;
                store.commit('Item_Categories/LIST_ITEM_CATEGORIES', categoryList.value)
                depResults.value = response.data;
                depArrLen.value = categoryList.value.length;
                depCount.value = depResults.value.count;
                pageCount.value = Math.ceil(depCount.value / 50);
                
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
            
            searchCategories();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchCategories();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchCategories();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchCategories();
        }
        const resetFilters = () =>{
            store.commit('Item_Categories/RESET_SEARCH_FILTERS')
            searchCategories();
        };
        const closeModal = async() =>{
            await store.dispatch("Item_Categories/updateState",{isEditing:false, selectedCategory:null})
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchCategories();
        })
        return{
            title,idField, searchCategories, addButtonLabel, searchFilters, resetFilters, tableColumns, categoryList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewCategory,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveCategory,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeCategory, removeCategories,
            addingRight,rightsModule,handleSelectionChange,closeModal
        }
    }
}
</script>