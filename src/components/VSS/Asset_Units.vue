<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewUnit"
            :searchFilters="searchFilters"
            @searchPage="searchUnits"
            @resetFilters="resetFilters"
            @importData="importUnits"
            @removeItem="removeUnit"
            @removeSelectedItems="removeUnits"
            @printList="printUnitsList"
            @printExcel="downloadUnitsExcel"
            @printCSV="downloadUnitsCSV"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="unitList"
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
                :displayButtons="displayButtons" @handleSubmit="saveUnit" @handleReset="handleReset"
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
    name: 'Asset_Units',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const propComponentKey = ref(0);
        const catComponentKey = ref(0);
        const propSearchComponentKey = ref(0);
        const catSearchComponentKey = ref(0);
        const idField = 'asset_unit_id';
        const addButtonLabel = ref('New Unit');
        const addingRight = ref('Adding Asset Unit');
        const removingRight = ref('Deleting Asset Unit');
        const rightsModule = ref('PSS');
        const title = ref('Unit Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const unitList = ref([]);
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
        const modal_width = ref('40vw');
        const assetID = ref('');
        const categoryID = ref('');
        const assetSearchID = ref('');
        const catSearchID = ref('');
        const isEditing = computed(()=> store.state.Asset_Units.isEditing);
        const selectedUnit = computed(()=> store.state.Asset_Units.selectedUnit);
        const selectedCategory = computed(()=> store.state.Asset_Units.selectedCategory);
        const selectedAsset = computed(()=> store.state.Asset_Units.selectedAsset);
        const assetArray = computed(() => store.state.Sale_Assets.assetArr);
        const categoryArray = computed(() => store.state.Unit_Categories.categoryArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Unit No", key:"unit_number"},
            {label: "Asset Name", key:"asset"},
            {label: "Category", key:"asset_unit_category"},
            {label: "Client Name", key: "client_name"},
            {label: "Reg. Number", key: "registration_number"},
            {label: "Unit Cost", key:"unit_cost"},
            {label: "Markup(%)", key:"selling_markup"},
            {label: "Selling Price", key:"unit_selling_price"},
            {label: "Status", key:"status", textColor: "textColor"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Unit', rightName: 'Editing Asset Unit'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Unit'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Unit', rightName: 'Deleting Asset Unit'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const unit_number_search = ref("");
        const category_array = computed(() => store.state.Unit_Categories.categoryArr);
        const assets_array = computed(() => store.state.Sale_Assets.assetArr);
        const status_search = ref("");
        const asset_code_search = ref("");
        const handleSearchAsset = async(option) =>{
            await store.dispatch('Sale_Assets/handleSelectedAsset', option)
            assetSearchID.value = store.state.Sale_Assets.assetID;
        };
        const clearSearchAsset = async() =>{
            await store.dispatch('Sale_Assets/updateState', {assetID: ''});
            assetSearchID.value = store.state.Sale_Assets.assetID;
        };
        const handleSearchCategory = async(option) =>{
            await store.dispatch('Unit_Categories/handleSelectedCategory', option)
            catSearchID.value = store.state.Unit_Categories.categoryID;
        };
        const clearSearchCategory = async() =>{
            await store.dispatch('Unit_Categories/updateState', {categoryID: ''});
            catSearchID.value = store.state.Unit_Categories.categoryID;
        };
        const searchFilters = ref([
            {type:'text', placeholder:"Unit No...", value: unit_number_search, width:28,},
            {
                type:'search-dropdown', value: assets_array, width:48,
                selectOptions: assets_array, optionSelected: handleSearchAsset,
                searchPlaceholder: 'Asset...', dropdownWidth: '250px',
                fetchData: store.dispatch('Sale_Assets/fetchSaleAssets', {company:companyID.value}),
                clearSearch: clearSearchAsset, componentKey: propSearchComponentKey
            },
            {
                type:'dropdown', placeholder:"Status..", value: status_search, width:32,
                options: [{text:'Available',value:'Available'},{text:'Reserved',value:'Reserved'},{text:'Sold',value:'Sold'}]
            },
            {type:'text', placeholder:"Asset Code...", value: asset_code_search, width:36,},
            {
                type:'search-dropdown', value: category_array, width:36,
                selectOptions: category_array, optionSelected: handleSearchCategory,
                searchPlaceholder: 'Category...', dropdownWidth: '200px',
                fetchData: store.dispatch('Unit_Categories/fetchUnitCategories', {company:companyID.value}),
                clearSearch: clearSearchCategory, componentKey: catSearchComponentKey
            },                    
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedAsset = async(option) =>{
            await store.dispatch('Sale_Assets/handleSelectedAsset', option);
            assetID.value = store.state.Sale_Assets.assetID;
            if(selectedUnit.value){
                selectedUnit.value.asset.assetID = assetID.value;
                assetValue.value = assetID.value
            }
        }
        const handleSelectedCategory = async(option) =>{
            await store.dispatch('Unit_Categories/handleSelectedCategory', option);
            categoryID.value = store.state.Unit_Categories.categoryID;
            if(selectedUnit.value && selectedUnit.value.unit_category != null){
                selectedUnit.value.unit_category.asset_unit_category_id = categoryID.value;
                categoryValue.value = categoryID.value
            }
        }
        const formFields = ref([]);
        const assetValue = computed(() => {
           return (selectedUnit.value && selectedUnit.value.asset && !assetID.value) ? selectedUnit.value.asset.sale_asset_id : assetID.value;

        });
        const categoryValue = computed(() => {
           return (selectedUnit.value && selectedUnit.value.unit_category && !assetID.value) ? selectedUnit.value.unit_category.asset_unit_category_id : categoryID.value;

        });
        const calculateSellingPrice = (value) =>{
            let sellingPrice = parseFloat(formFields.value[6].value) + parseFloat(formFields.value[6].value * (parseFloat(value)/100))
            formFields.value[8].value = sellingPrice
        }
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Asset", value: assetValue.value, componentKey: propComponentKey,
                    selectOptions: assetArray, optionSelected: handleSelectedAsset, required: true,
                    searchPlaceholder: 'Select Asset...', dropdownWidth: '500px', updateValue: selectedAsset.value,
                    fetchData: store.dispatch('Sale_Assets/fetchSaleAssets', {company:companyID.value})
                },
                {  
                    type:'search-dropdown', label:"Category", value: categoryValue.value, componentKey: catComponentKey,
                    selectOptions: categoryArray, optionSelected: handleSelectedCategory, required: false,
                    searchPlaceholder: 'Select Category...', dropdownWidth: '500px', updateValue: selectedCategory.value,
                    fetchData: store.dispatch('Unit_Categories/fetchUnitCategories', {company:companyID.value})
                },
                { type: 'text', name: 'unit_number',label: "Unit No.", value: selectedUnit.value?.unit_number || '', required: true },
                { type: 'text', name: 'unit_size',label: "Unit Size", value: selectedUnit.value?.unit_size || '', required: false },
                { type: 'text', name: 'registration_number',label: "Registration No.", value: selectedUnit.value?.registration_number || '', required: false },
                { type: 'date', name: 'registration_date',label: "Registration Date", value: selectedUnit.value?.registration_date || null, required: false },
                { type: 'number', name: 'unit_cost',label: "Unit Cost", value: selectedUnit.value?.unit_cost || 0, required: true },
                { type: 'number', name: 'selling_markup',label: "Markup(%)", value: selectedUnit.value?.selling_markup || 0, required: false , method: calculateSellingPrice },
                { type: 'number', name: 'unit_selling_price',label: "Selling Price", value: selectedUnit.value?.unit_selling_price || 0, required: true },
                { required: false}
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].type == "number"){
                    formFields.value[i].value = 0;
                }else{
                    formFields.value[i].value = '';
                }          
            }
            assetID.value = '';
            categoryID.value = '';
            propComponentKey.value += 1;
            catComponentKey.value += 1;
        }

        watch([selectedUnit, selectedAsset, selectedCategory], () => {
            if (selectedUnit.value && selectedAsset.value && selectedCategory.value) {
                propComponentKey.value += 1;
                catComponentKey.value += 1;
                updateFormFields();
            }
            else if(selectedUnit.value && selectedAsset.value){
                propComponentKey.value += 1;
                updateFormFields();
            }
            
        }, { immediate: true });
        
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createUnit = async() =>{
            showModalLoader();
            let formData = {
                unit_number: formFields.value[2].value,
                unit_size: formFields.value[3].value,
                registration_number: formFields.value[4].value,
                status: "Available",
                registration_date: formFields.value[5].value || null,
                unit_cost: formFields.value[6].value,
                selling_markup: formFields.value[7].value,
                unit_selling_price: formFields.value[8].value,
                asset: assetID.value,
                asset_id: assetID.value,
                unit_category: categoryID.value,
                unit_category_id: categoryID.value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(assetValue.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Asset_Units/createAssetUnit', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Unit created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the unit.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create unit: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchUnits();
                }
            }
        }
        const updateUnit = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                asset_unit: selectedUnit.value.asset_unit_id,
                unit_number: formFields.value[2].value,
                unit_size: formFields.value[3].value,
                registration_number: formFields.value[4].value,
                status: selectedUnit.value.status,
                registration_date: formFields.value[5].value || null,
                unit_cost: formFields.value[6].value,
                selling_markup: formFields.value[7].value,
                unit_selling_price: formFields.value[8].value,
                asset: assetValue.value,
                asset_id: assetValue.value,
                unit_category: categoryValue.value,
                unit_category_id: categoryValue.value,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(assetValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Asset_Units/updateAssetUnit', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        propModalVisible.value = false;
                        store.dispatch('Asset_Units/updateState', {selectedUnit: null, selectedCategory: null, selectedAsset: null, isEditing: false})
                        toast.success("Unit updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the unit.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update unit: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchUnits();
                }             
            }
        }
        const saveUnit = () =>{
            if(isEditing.value == true){
                updateUnit();
            }else{
                createUnit();
            }
        }
        const importUnits = () =>{
            store.commit('pageTab/ADD_PAGE', {'PSS':'Import_Asset_Units'})
            store.state.pageTab.pssActiveTab = 'Import_Asset_Units';
        }
        const removeUnit = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    asset_unit: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Asset_Units/deleteAssetUnit',formData)
                    if(response && response.status == 200){
                        toast.success("Unit Removed Succesfully");
                        searchUnits();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove unit: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 unit") 
            }else{
                toast.error("Please Select A Unit To Remove")
            }
        }
        const removeUnits = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    asset_unit: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Asset_Units/deleteUnit',formData)
                    if(response && response.status == 200){
                        toast.success("Unit(s) Removed Succesfully");
                        searchUnits();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove unit: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Unit To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchUnits = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                unit_number: unit_number_search.value,
                status: status_search.value,
                asset_code: asset_code_search.value,
                asset: assetSearchID.value,
                category: catSearchID.value,
                agent_asset_ids: [],
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/asset-units-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                unitList.value = response.data.results;
                store.commit('Asset_Units/LIST_UNITS', unitList.value)
                propResults.value = response.data;
                propArrLen.value = unitList.value.length;
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
            searchUnits(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            assetSearchID.value = "";
            catSearchID.value = "";
            unit_number_search.value = "";
            status_search.value = "";
            asset_code_search.value = "";
            propSearchComponentKey.value += 1;
            catSearchComponentKey.value += 1;
            searchUnits();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchUnits();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchUnits();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchUnits();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchUnits();
            // scrollToTop();
        }
        const addNewUnit = () =>{
            store.dispatch('Asset_Units/updateState', {selectedUnit: null, selectedCategory: null, selectedAsset: null, isEditing: false})
            updateFormFields();
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const unitID = row['asset_unit_id'];
                let formData = {
                    company: companyID.value,
                    asset_unit: unitID
                }
                await store.dispatch('Asset_Units/fetchAssetUnit',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const unitID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    asset_unit: unitID
                }
                await store.dispatch('Asset_Units/deleteAssetUnit',formData).
                then(()=>{
                    searchUnits();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printUnitsList = () =>{
            showLoader();
            let formData = {
                unit_number: unit_number_search.value,
                status: status_search.value,
                asset_code: asset_code_search.value,
                asset: assetSearchID.value,
                category: catSearchID.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 

            axios
            .post("api/v1/export-asset-units-pdf/", formData, { responseType: 'blob' })
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
        const downloadUnitsExcel = () =>{
            showLoader();
            let formData = {
                unit_number: unit_number_search.value,
                status: status_search.value,
                asset_code: asset_code_search.value,
                asset: assetSearchID.value,
                category: catSearchID.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios.post("api/v1/export-asset-units-excel/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Asset Units.xlsx');
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
        const downloadUnitsCSV = () =>{
            showLoader();
            let formData = {
                unit_number: unit_number_search.value,
                status: status_search.value,
                asset_code: asset_code_search.value,
                asset: assetSearchID.value,
                category: catSearchID.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios.post("api/v1/export-asset-units-csv/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Asset Units.csv');
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
            searchUnits();
            
        })
        return{
            title, searchUnits,resetFilters, addButtonLabel, searchFilters, tableColumns, unitList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewUnit, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveUnit, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            importUnits, removeUnit, removeUnits,addingRight,removingRight,rightsModule,printUnitsList,selectSearchQuantity,selectedValue,
            downloadUnitsCSV,downloadUnitsExcel
        }
    }
};
</script>