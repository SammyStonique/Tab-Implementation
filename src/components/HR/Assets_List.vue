<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewAsset"
            :searchFilters="searchFilters"
            @searchPage="searchAssets"
            @resetFilters="resetFilters"
            @importData="importAssets"
            @removeItem="removeAsset"
            @removeSelectedItems="removeAssets"
            @printList="printAssetsList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="assetsList"
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
                :displayButtons="displayButtons" @handleSubmit="saveAsset" @handleReset="handleReset"
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
    name: 'Assets_List',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'asset_id';
        const addButtonLabel = ref('New Asset');
        const title = ref('Asset Details');
        const addingRight = ref('Adding Asset');
        const removingRight = ref('Deleting Asset');
        const rightsModule = ref('HR');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const assetsList = ref([]);
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
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('45vw');
        const catComponentKey = ref(0);
        const isEditing = computed(()=> store.state.Assets.isEditing);
        const selectedAsset = computed(()=> store.state.Assets.selectedAsset);
        const selectedCategory = computed(()=> store.state.Assets.selectedCategory);
        const categoryArray = computed(()=> store.state.Asset_Categories.categoryArr)
        const categoryID = ref('');
        const categorySearchID = ref('');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Serial No", key:"serial_number"},
            {label: "Name", key:"asset_name"},
            {label: "Category", key:"category"},
            {label: "Purchase Date", key: "purchase_date"},
            {label: "Model No", key:"model_number"},
            {label: "Supplier", key:"supplier"},
            {label: "Condition", key:"asset_condition"},
            {label: "Status", key:"status"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Asset', rightName: 'Editing Asset'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Asset', rightName: 'Deleting Asset'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        
        const serial_number_search = ref("");
        const asset_name_search = ref("");
        const fetchCategories = async() =>{
            await store.dispatch('Asset_Categories/fetchAssetCategories', {company:companyID.value})
        };
        const handleSearchCategory = async(option) =>{
            await store.dispatch('Asset_Categories/handleSelectedCategory', option)
            categorySearchID.value = store.state.Asset_Categories.categoryID;
        };
        const clearSearchCategory = async() =>{
            await store.dispatch('Asset_Categories/updateState', {categoryID: ''});
            categorySearchID.value = ""
        };
        const searchFilters = ref([
            {type:'text', placeholder:"Serial No...", value: serial_number_search, width:40,},
            {type:'text', placeholder:"Asset Name...", value: asset_name_search, width:48,},
            {
                type:'search-dropdown', value: categorySearchID.value, width:64, componentKey: catComponentKey,
                selectOptions: categoryArray, optionSelected: handleSearchCategory,
                searchPlaceholder: 'Category Search...', dropdownWidth: '300px',
                fetchData: fetchCategories(), clearSearch: clearSearchCategory()             
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        const handleSelectedCategory = async(option) =>{
            await store.dispatch('Asset_Categories/handleSelectedCategory', option)
            categoryID.value = store.state.Asset_Categories.categoryID;
        };
        const clearSelectedCategory = async() =>{
            await store.dispatch('Asset_Categories/updateState', {categoryID: ''});
            categoryID.value = ""
        };
        const formFields = ref([]);
        const categoryValue = computed(() => {
            return (selectedAsset.value && selectedAsset.value.asset_category && !categoryID.value) ? selectedAsset.value.asset_category.asset_category_id : categoryID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Category", value: categoryValue.value, componentKey: catComponentKey,
                    selectOptions: categoryArray, optionSelected: handleSelectedCategory, required: true,
                    searchPlaceholder: 'Select Category...', dropdownWidth: '350px', updateValue: selectedCategory.value,
                    fetchData: fetchCategories(), clearSearch: clearSelectedCategory()
                },
                { type: 'text', name: 'asset_name',label: "Name", value: selectedAsset.value?.asset_name || '', required: true },
                { type: 'date', name: 'purchase_date',label: "Purchase Date", value: selectedAsset.value?.purchase_date || '', required: true },
                { type: 'text', name: 'purchase_cost',label: "Purchase Cost", value: selectedAsset.value?.purchase_cost || '0', required: true },
                { type: 'text', name: 'serial_number',label: "Serial No. ", value: selectedAsset.value?.serial_number || '', required: false },
                { type: 'text', name: 'model_number',label: "Model No. ", value: selectedAsset.value?.model_number || '', required: false },
                { type: 'text', name: 'supplier',label: "Supplier", value: selectedAsset.value?.supplier || '', required: false },
                { type: 'date', name: 'warranty_end_date',label: "Warranty End Date", value: selectedAsset.value?.warranty_end_date || '', required: false },
                { type: 'dropdown', name: 'status',label: "Status", value: selectedAsset.value?.status || 'Active', placeholder: "", required: true, options: [{ text: 'Active', value: 'Active' }, { text: 'Under Maintenance', value: 'Under Maintenance' }, { text: 'Retired', value: 'Retired' }, { text: 'Lost', value: 'Lost' }] },
                { type: 'text-area', name: 'description',label: "Description", value: selectedAsset.value?.description || '', required: false,textarea_rows: '2', textarea_cols: '40'},
                { type: 'dropdown', name: 'asset_condition',label: "Asset Condition", value: selectedAsset.value?.asset_condition || 'New', placeholder: "", required: true, options: [{ text: 'New', value: 'New' }, { text: 'Good', value: 'Good' }, { text: 'Fair', value: 'Fair' }, { text: 'Poor', value: 'Poor' }] },
                { type: 'text-area', name: 'condition_notes',label: "Condition Notes", value: selectedAsset.value?.condition_notes || '', required: false,textarea_rows: '2', textarea_cols: '40'},

            ];
        };
        const handleReset = () =>{
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].name == 'purchase_cost'){
                    formFields.value[i].value = '0';
                }else if(formFields.value[i].name == 'status'){
                    formFields.value[i].value = 'Active';
                }else if(formFields.value[i].name == 'asset_condition'){
                    formFields.value[i].value = 'New';
                }else{
                    formFields.value[i].value = '';
                }
                
            }
            categoryID.value = "";
            catComponentKey.value += 1;
        }

        watch([selectedAsset, selectedCategory], () => {
            if (selectedAsset.value && selectedCategory.value) {
                updateFormFields();
                catComponentKey.value += 1;
            }
            
        }, { immediate: true });
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createAsset = async() =>{
            showModalLoader();
            let formData = {
                asset_name: formFields.value[1].value,
                purchase_date: formFields.value[2].value,
                purchase_cost: formFields.value[3].value,
                supplier: formFields.value[6].value,
                warranty_end_date: formFields.value[7].value || null,
                serial_number: formFields.value[4].value,
                model_number: formFields.value[5].value,
                description: formFields.value[9].value,
                status: formFields.value[8].value,
                asset_condition: formFields.value[10].value,
                condition_notes: formFields.value[11].value,
                asset_category: categoryID.value,
                asset_category_id: categoryID.value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != "search-dropdown"){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(categoryID.value == ""){
                errors.value.push('Error');
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Assets/createAsset', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Asset created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the Asset.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Asset: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchAssets();
                }
            }
        }
        const updateAsset = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                asset: selectedAsset.value.asset_id,
                asset_name: formFields.value[1].value,
                purchase_date: formFields.value[2].value,
                purchase_cost: formFields.value[3].value,
                supplier: formFields.value[6].value,
                warranty_end_date: formFields.value[7].value || null,
                serial_number: formFields.value[4].value,
                model_number: formFields.value[5].value,
                description: formFields.value[9].value,
                status: formFields.value[8].value,
                asset_condition: formFields.value[10].value,
                condition_notes: formFields.value[11].value,
                asset_category: categoryValue.value,
                asset_category_id: categoryValue.value,
                company: companyID.value
            }
            console.log("THE FORM DATA IS ",formData)
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != "search-dropdown"){
                    errors.value.push('Error');
                }
            }
            if(categoryValue.value == ""){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Assets/updateAsset', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Asset updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Asset.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Asset: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Assets/updateState",{selectedAsset:null,  selectedCategory:null,})
                    searchAssets();
                }             
            }
        }
        const saveAsset = () =>{
            if(isEditing.value == true){
                updateAsset();
            }else{
                createAsset();
            }
        }
        const importAssets = () =>{
            // store.commit('pageTab/ADD_PAGE', {'FA':'Import_Assets'})
            // store.state.pageTab.faActiveTab = 'Import_Assets';
        }
        const removeAsset = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    asset: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Assets/deleteAsset',formData)
                    if(response && response.status == 200){
                        toast.success("Asset Removed Succesfully");
                        searchAssets();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Asset: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Asset") 
            }else{
                toast.error("Please Select An Asset To Remove")
            }
        }
        const removeAssets = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    asset: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Assets/deleteAsset',formData)
                    if(response && response.status == 200){
                        toast.success("Asset(s) Removed Succesfully");
                        searchAssets();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Asset: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select An Asset To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchAssets = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                asset_name: asset_name_search.value,
                serial_number: serial_number_search.value,
                category: categorySearchID.value,
                company_id: companyID.value,
                module: "HR",
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/assets-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                assetsList.value = response.data.results;
                store.commit('Assets/LIST_ASSETS', assetsList.value)
                propResults.value = response.data;
                propArrLen.value = assetsList.value.length;
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
            searchAssets(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            serial_number_search.value = "";
            asset_name_search.value = "";
            catComponentKey.value += 1;
            categorySearchID.value = "";
            searchAssets();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchAssets();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchAssets();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchAssets();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchAssets();
            // scrollToTop();
        }
        const addNewAsset = () =>{
            updateFormFields();
            store.dispatch("Assets/updateState",{selectedAsset:null, selectedCategory:null, isEditing:false})
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const assetID = row[idField];
                let formData = {
                    company: companyID.value,
                    asset: assetID
                }
                await store.dispatch('Assets/fetchAsset',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const assetID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    asset: assetID
                }
                await store.dispatch('Assets/deleteAsset',formData).
                then(()=>{
                    searchAssets();
                })
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printAssetsList = () =>{
            showLoader();

            let formData = {
                asset_name: asset_name_search.value,
                serial_number: serial_number_search.value,
                category: categorySearchID.value,
                module: "HR",
                company_id: companyID.value,
            }
            axios
            .post("api/v1/export-assets-pdf/", formData, { responseType: 'blob' })
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
        }
        onBeforeMount(()=>{
            searchAssets();
            
        })
        return{
            title, searchAssets,resetFilters, addButtonLabel, searchFilters, tableColumns, assetsList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewAsset, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveAsset, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            importAssets, removeAsset, removeAssets, handleReset,printAssetsList,addingRight,removingRight,rightsModule,selectSearchQuantity,selectedValue
        }
    }
};
</script>