<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewMake"
        :searchFilters="searchFilters"
        @searchPage="searchAssetMakes"
        @resetFilters="resetFilters"
        @removeItem="removeAssetMake"
        @removeSelectedItems="removeAssetMakes"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="makesList"
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
    />
    <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader"  @closeModal="closeModal">
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="saveAssetMake" @handleReset="handleReset"
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
    name: 'Asset_Makes',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Asset Make Details');
        const addButtonLabel = ref('New Asset Make');
        const addingRight = ref('Adding Asset Makes');
        const removingRight = ref('Deleting Asset Makes');
        const rightsModule = ref('PSS');
        const idField = 'asset_make_id';
        const depModalVisible = ref(false);
        const makesList = ref([]);
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
        const modal_width = ref('35vw');
        const isEditing = computed(()=> store.state.Asset_Makes.isEditing)
        const selectedMake = computed(()=> store.state.Asset_Makes.selectedMake);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key: "name", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Make', rightName: 'Editing Asset Makes'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Make', rightName: 'Deleting Asset Makes'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Search Name...", value: name_search}
        ]);
        const formFields = ref([]);
        const updateFormFields = (asset) => {
            formFields.value = [
                { type: 'text', name: 'name',label: "Name", value: asset?.name || '', required: true },
            ];
        };
        watch(selectedMake, (newMake) => {
            updateFormFields(newMake);
        }, { immediate: true });
        const addNewMake = () =>{
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Asset_Makes/updateState",{isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const makeID = row[idField];
                let formData = {
                    company: companyID.value,
                    asset_make: makeID
                }
                await store.dispatch('Asset_Makes/fetchAssetMake',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const makeID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    asset_make: makeID
                }
                await store.dispatch('Asset_Makes/deleteAssetMake',formData).
                then(()=>{
                    searchAssetMakes();
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
        const createAssetMake = async() =>{
            showModalLoader();
            let formData = {
                name: formFields.value[0].value,
                asset_type: "Land",
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
                    const response = await store.dispatch('Asset_Makes/createAssetMake', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Success!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Make.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Make: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchAssetMakes();
                }
            }

        }
        const updateAssetMake = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                name: formFields.value[0].value,
                company: companyID.value,
                asset_type: selectedMake.value.asset_type,
                asset_make: selectedMake.value.asset_make_id
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
                    const response = await store.dispatch('Asset_Makes/updateAssetMake', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Success!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Make.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Make: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchAssetMakes();
                }
            }
        }
        const saveAssetMake = () =>{
            if(isEditing.value == true){
                updateAssetMake();
            }else{
                createAssetMake();
            }
        }
        const removeAssetMake = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    asset_make: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Asset_Makes/deleteAssetMake',formData)
                    if(response && response.status == 200){
                        toast.success("Make Removed Succesfully");
                        searchAssetMakes();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Make: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Make") 
            }else{
                toast.error("Please Select A Make To Remove")
            }
        }
        const removeAssetMakes = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    asset_make: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Asset_Makes/deleteAssetMake',formData)
                    if(response && response.status == 200){
                        toast.success("Make(s) Removed Succesfully");
                        searchAssetMakes();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Make(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Make To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchAssetMakes = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                name: name_search.value,
                asset_type: "Land",
                company_id: companyID.value
            }
            axios
            .post(`api/v1/asset-makes-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                makesList.value = response.data.results;
                store.commit('Asset_Makes/LIST_ASSET_MAKES', makesList.value)
                depResults.value = response.data;
                depArrLen.value = makesList.value.length;
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
            
            searchAssetMakes();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchAssetMakes();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchAssetMakes();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchAssetMakes();
        }
        const resetFilters = () =>{
            name_search.value = "";
            searchAssetMakes();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchAssetMakes();
        })
        return{
            title,idField, searchAssetMakes, addButtonLabel, searchFilters, resetFilters, tableColumns, makesList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewMake,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveAssetMake,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeAssetMake, removeAssetMakes,
            addingRight,removingRight,rightsModule, closeModal
        }
    }
}
</script>