<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewSecurity"
        :searchFilters="searchFilters"
        @searchPage="searchSecurities"
        @resetFilters="resetFilters"
        @removeItem="removeSecurity"
        @removeSelectedItems="removeSecurities"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="securitiesList"
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
            :displayButtons="displayButtons" @handleSubmit="saveSecurity" @handleReset="handleReset"
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
    name: 'Security_Types',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Security Details');
        const addButtonLabel = ref('New Security');
        const addingRight = ref('Adding Security Types');
        const removingRight = ref('Deleting Security Types');
        const rightsModule = ref('MMS');
        const idField = 'security_type_id';
        const depModalVisible = ref(false);
        const securitiesList = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const selectedValue = ref(50);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const isEditing = computed(()=> store.state.Security_Types.isEditing)
        const selectedSecurity = computed(()=> store.state.Security_Types.selectedSecurity);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key: "security_name", type: "text", editable: false},
            {label: "Type", key: "security_type", type: "text", editable: false},
            {label: "Value", key: "security_value", type: "text", editable: false},
            {label: "Description", key: "description", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Security', rightName: 'Editing Security Types'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Security', rightName: 'Deleting Security Types'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Search Name...", value: name_search}
        ]);
        const formFields = ref([]);
        const updateFormFields = (security) => {
            formFields.value = [
                { type: 'text', name: 'security_name',label: "Name", value: security?.security_name || '', required: true },
                { type: 'dropdown', name: 'security_type',label: "Type", value: security?.security_type || '', placeholder: "", required: true, options: [{ text: 'Real Estate', value: 'Real Estate' }, { text: 'Vehicle', value: 'Vehicle' }, { text: 'Stocks/Bonds', value: 'Stocks/Bonds' },{ text: 'Personal Guarantee', value: 'Personal Guarantee' }, { text: 'Other', value: 'Other' }] },
                { type: 'text', name: 'security_value',label: "Value", value: security?.security_value || '0', required: true },
                {type:'text-area', label:"Description", value: security?.description, textarea_rows: '4', textarea_cols: '56', required: false},

            ];
        };
        watch(selectedSecurity, (newSecurity) => {
            updateFormFields(newSecurity);
        }, { immediate: true });
        const addNewSecurity = () =>{
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Security_Types/updateState",{isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const categoryID = row[idField];
                let formData = {
                    company: companyID.value,
                    security_types: categoryID
                }
                await store.dispatch('Security_Types/fetchSecurityType',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const categoryID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    security_types: categoryID
                }
                await store.dispatch('Security_Types/deleteSecurityType',formData).
                then(()=>{
                    searchSecurities();
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
        const createSecurity = async() =>{
            showModalLoader();
            let formData = {
                security_name: formFields.value[0].value,
                security_type: formFields.value[1].value,
                security_value: formFields.value[2].value,
                description: formFields.value[3].value,
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
                    const response = await store.dispatch('Security_Types/createSecurityType', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Security created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Security.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Security: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchSecurities();
                }
            }

        }
        const updateSecurity = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                security_name: formFields.value[0].value,
                security_type: formFields.value[1].value,
                security_value: formFields.value[2].value,
                description: formFields.value[3].value,
                company: companyID.value,
                security_types: selectedSecurity.value.security_type_id
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
                    const response = await store.dispatch('Security_Types/updateSecurityType', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Security updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Security.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Security: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchSecurities();
                }
            }
        }
        const saveSecurity = () =>{
            if(isEditing.value == true){
                updateSecurity();
            }else{
                createSecurity();
            }
        }
        const removeSecurity = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    security_type: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Security_Types/deleteSecurityType',formData)
                    if(response && response.status == 200){
                        toast.success("Security Removed Succesfully");
                        searchSecurities();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Security: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Security") 
            }else{
                toast.error("Please Select A Security To Remove")
            }
        }
        const removeSecurities = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    security_type: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Security_Types/deleteSecurityType',formData)
                    if(response && response.status == 200){
                        toast.success("Security(s) Removed Succesfully");
                        searchSecurities();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Security(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Security To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchSecurities = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                security_name: name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios
            .post(`api/v1/security-types-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                securitiesList.value = response.data.results;
                store.commit('Security_Types/LIST_SECURITY_TYPES', securitiesList.value)
                depResults.value = response.data;
                depArrLen.value = securitiesList.value.length;
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
            searchSecurities(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchSecurities();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchSecurities();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchSecurities();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchSecurities();
        }
        const resetFilters = () =>{
            selectedValue.value = 50;
            currentPage.value = 1;
            name_search.value = "";
            searchSecurities();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchSecurities();
        })
        return{
            title,idField, searchSecurities, addButtonLabel, searchFilters, resetFilters, tableColumns, securitiesList,
            currentPage,depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewSecurity,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveSecurity,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeSecurity, removeSecurities,
            addingRight,removingRight,rightsModule, closeModal,selectSearchQuantity,selectedValue,
        }
    }
}
</script>