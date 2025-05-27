<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewModel"
            :searchFilters="searchFilters"
            @searchPage="searchAssetModels"
            @resetFilters="resetFilters"
            @removeItem="removeAssetModel"
            @removeSelectedItems="removeAssetModels"
            @printList="printmodelsList"
            @printExcel="downloadGroupsExcel"
            @printCSV="downloadGroupsCSV"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="modelsList"
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
                :displayButtons="displayButtons" @handleSubmit="saveAssetModel" @handleReset="handleReset"
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
    name: 'Asset_Designs',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const propComponentKey = ref(0);
        const idField = 'asset_model_id';
        const addButtonLabel = ref('New Asset Design');
        const addingRight = ref('Adding Asset Models');
        const removingRight = ref('Deleting Asset Models');
        const rightsModule = ref('PSS');
        const title = ref('Asset Design Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const modelsList = ref([]);
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
        const modal_top = ref('300px');
        const modal_left = ref('500px');
        const modal_width = ref('30vw');
        const makeID = ref('');
        const isEditing = computed(()=> store.state.Asset_Models.isEditing);
        const selectedModel = computed(()=> store.state.Asset_Models.selectedModel);
        const selectedMake = computed(()=> store.state.Asset_Models.selectedMake);
        const makesArray = computed(() => store.state.Asset_Makes.makeArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Design Name", key:"name"},
            {label: "Asset Type", key: "asset_make"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Design', rightName: 'Editing Asset Models'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Design', rightName: 'Deleting Asset Models'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Design Name...", value: name_search, width:56,},
  
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedMake = async(option) =>{
            await store.dispatch('Asset_Makes/handleSelectedMake', option)
            makeID.value = store.state.Asset_Makes.makeID;
        };
        const clearSelectedMake = async() =>{
            await store.dispatch('Asset_Makes/updateState', {makeID: ''});
            makeID.value = store.state.Asset_Makes.makeID;
        };
        const formFields = ref([]);
        const makeValue = computed(() => {
           return (selectedModel.value && selectedModel.value.asset_make && !makeID.value) ? selectedModel.value.asset_make.asset_make_id : makeID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Asset Type", value: makeValue.value, componentKey: propComponentKey,
                    selectOptions: makesArray, optionSelected: handleSelectedMake, required: true,
                    searchPlaceholder: 'Select Asset Type...', dropdownWidth: '400px', updateValue: selectedMake.value,
                    fetchData: store.dispatch('Asset_Makes/fetchAssetMakes', {company:companyID.value}),
                    clearSearch: clearSelectedMake
                },
                { type: 'text', name: 'name',label: "Design Name", value: selectedModel.value?.name || '', required: true },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            propComponentKey.value += 1;
            makeID.value = '';
        }

        watch([selectedModel, selectedMake], () => {
            if (selectedModel.value && selectedMake.value) {
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
        const createAssetModel = async() =>{
            showModalLoader();
            let formData = {
                name: formFields.value[1].value,
                asset_make: makeID.value,
                asset_make_id: makeID.value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(makeValue.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Asset_Models/createAssetModel', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Success!');
                        handleReset();
                        propComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Asset Design.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Asset Design: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchAssetModels();
                }
            }
        }
        const updateAssetModel = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                asset_model: selectedModel.value.asset_model_id,
                name: formFields.value[1].value,
                asset_make: makeValue.value,
                asset_make_id: makeValue.value,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown'  && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(makeValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Asset_Models/updateAssetModel', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        propComponentKey.value += 1;
                        toast.success("Asset Design updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Asset Design.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Asset Design: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Asset_Models/updateState",{selectedModel:null})
                    searchAssetModels();
                }             
            }
        }
        const saveAssetModel = () =>{
            if(isEditing.value == true){
                updateAssetModel();
            }else{
                createAssetModel();
            }
        }
        const removeAssetModel = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    asset_model: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Asset_Models/deleteAssetModel',formData)
                    if(response && response.status == 200){
                        toast.success("Asset Design Removed Succesfully");
                        searchAssetModels();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Asset Design: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Asset Design") 
            }else{
                toast.error("Please Select An Asset Design To Remove")
            }
        }
        const removeAssetModels = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    asset_model: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Asset_Models/deleteAssetModel',formData)
                    if(response && response.status == 200){
                        toast.success("Asset Design(s) Removed Succesfully");
                        searchAssetModels();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Asset Design: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select An Asset Design To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchAssetModels = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                name: name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/asset-models-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                modelsList.value = response.data.results;
                store.commit('Asset_Models/LIST_ASSET_MODELS', modelsList.value)
                propResults.value = response.data;
                propArrLen.value = modelsList.value.length;
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
            searchAssetModels(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            name_search.value = "";
            searchAssetModels();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchAssetModels();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchAssetModels();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchAssetModels();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchAssetModels();
            // scrollToTop();
        }
        const addNewModel = () =>{
            store.dispatch("Asset_Models/updateState",{selectedMake:null, selectedModel:null});
            propComponentKey.value += 1;
            handleReset();
            updateFormFields();
            propModalVisible.value = true;
            store.dispatch("Asset_Models/updateState",{isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const modelID = row['asset_model_id'];
                let formData = {
                    company: companyID.value,
                    asset_model: modelID
                }
                await store.dispatch('Asset_Models/fetchAssetModel',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const modelID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    asset_model: modelID
                }
                await store.dispatch('Asset_Models/deleteAssetModel',formData).
                then(()=>{
                    searchAssetModels();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printmodelsList = () =>{

        };
        const downloadGroupsExcel = () =>{

        };
        const downloadGroupsCSV = () =>{

        };
        onBeforeMount(()=>{
            searchAssetModels();
            
        })
        return{
            title, searchAssetModels,resetFilters, addButtonLabel, searchFilters, tableColumns, modelsList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewModel, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveAssetModel, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeAssetModel, removeAssetModels,addingRight,removingRight,rightsModule,printmodelsList,selectSearchQuantity,selectedValue,
            downloadGroupsCSV,downloadGroupsExcel
        }
    }
};
</script>