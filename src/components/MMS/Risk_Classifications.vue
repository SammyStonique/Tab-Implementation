<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewClass"
        :searchFilters="searchFilters"
        @searchPage="searchClassifications"
        @resetFilters="resetFilters"
        @removeItem="removeClassification"
        @removeSelectedItems="removeClassifications"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="sponsorList"
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
            :displayButtons="displayButtons" @handleSubmit="saveRiskClass" @handleReset="handleReset"
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
    name: 'Risk_Classifications',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Classification Details');
        const addButtonLabel = ref('New Classification');
        const addingRight = ref('Adding Risk Classifications');
        const removingRight = ref('Deleting Risk Classifications');
        const rightsModule = ref('MMS');
        const idField = 'risk_classification_id';
        const depModalVisible = ref(false);
        const sponsorList = ref([]);
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
        const isEditing = computed(()=> store.state.Risk_Classifications.isEditing)
        const selectedClassification = computed(()=> store.state.Risk_Classifications.selectedClassification);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Order", key: "class_order", type: "text", editable: false},
            {label: "Name", key: "classification_name", type: "text", editable: false},
            {label: "From Days", key: "from_days", type: "text", editable: false},
            {label: "To Days", key: "to_days", type: "text", editable: false},
            {label: "Description", key: "description", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Sponsor', rightName: 'Editing Risk Classifications'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Sponsor', rightName: 'Deleting Risk Classifications'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Search Name...", value: name_search}
        ]);
        const formFields = ref([]);
        const updateFormFields = (classification) => {
            formFields.value = [
                { type: 'number', name: 'class_order',label: "Order", value: classification?.class_order || 0, required: true },
                { type: 'text', name: 'classification_name',label: "Name", value: classification?.classification_name || '', required: true },
                { type: 'number', name: 'from_days',label: "From Days", value: classification?.from_days || '', required: true },
                { type: 'number', name: 'to_days',label: "To Days", value: classification?.to_days || '', required: true },
                {type:'text-area', label:"Description", value: classification?.description || '', textarea_rows: '3', textarea_cols: '56', required: false},
            ];
        };
        watch(selectedClassification, (newClass) => {
            updateFormFields(newClass);
        }, { immediate: true });
        const addNewClass = () =>{
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Risk_Classifications/updateState",{isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const riskID = row[idField];
                let formData = {
                    company: companyID.value,
                    risk_classification: riskID
                }
                await store.dispatch('Risk_Classifications/fetchRiskClassification',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const riskID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    risk_classification: riskID
                }
                await store.dispatch('Risk_Classifications/deleteRiskClassification',formData).
                then(()=>{
                    searchClassifications();
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
        const createRiskClass = async() =>{
            showModalLoader();
            let formData = {
                class_order: formFields.value[0].value,
                classification_name: formFields.value[1].value,
                from_days: formFields.value[2].value,
                to_days: formFields.value[3].value,
                description: formFields.value[4].value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'number'){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Risk_Classifications/createRiskClassification', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Class created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Class.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Class: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchClassifications();
                }
            }

        }
        const updateRiskClass = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                class_order: formFields.value[0].value,
                classification_name: formFields.value[1].value,
                from_days: formFields.value[2].value,
                to_days: formFields.value[3].value,
                description: formFields.value[4].value,
                risk_classification: selectedClassification.value.risk_classification_id,
                company: companyID.value
            }
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'number'){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
            }else{
                try {
                    const response = await store.dispatch('Risk_Classifications/updateRiskClassification', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Class updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Class.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Class: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchClassifications();
                }
            }
        }
        const saveRiskClass = () =>{
            if(isEditing.value == true){
                updateRiskClass();
            }else{
                createRiskClass();
            }
        }
        const removeClassification = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    risk_classification: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Risk_Classifications/deleteRiskClassification',formData)
                    if(response && response.status == 200){
                        toast.success("Class Removed Succesfully");
                        searchClassifications();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Class: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Class") 
            }else{
                toast.error("Please Select A Class To Remove")
            }
        }
        const removeClassifications = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    risk_classification: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Risk_Classifications/deleteRiskClassification',formData)
                    if(response && response.status == 200){
                        toast.success("Class(s) Removed Succesfully");
                        searchClassifications();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Class(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Class To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchClassifications = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                classification_name: name_search.value,
                company_id: companyID.value
            }
            axios
            .post(`api/v1/loan-risk-classifications-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                sponsorList.value = response.data.results;
                store.commit('Risk_Classifications/LIST_RISK_CLASSES', sponsorList.value)
                depResults.value = response.data;
                depArrLen.value = sponsorList.value.length;
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
            
            searchClassifications();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchClassifications();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchClassifications();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchClassifications();
        }
        const resetFilters = () =>{
            name_search.value = "";
            searchClassifications();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchClassifications();
        })
        return{
            title,idField, searchClassifications, addButtonLabel, searchFilters, resetFilters, tableColumns, sponsorList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewClass,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveRiskClass,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeClassification, removeClassifications,
            addingRight,removingRight,rightsModule, closeModal
        }
    }
}
</script>