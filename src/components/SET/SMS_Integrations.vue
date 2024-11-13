<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewBulkSMS"
        :searchFilters="searchFilters"
        @searchPage="searchBulkSMS"
        @resetFilters="resetFilters"
        :addingRight="addingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="depList"
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
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" >
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="saveSMSProvider" @handleReset="handleReset"
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
    name: 'SMS_Integrations',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('SMS Provider Details');
        const addButtonLabel = ref('New SMS Provider');
        const addingRight = ref('SMS Integrations');
        const rightsModule = ref('Settings');
        const idField = 'bulk_sms_id';
        const depModalVisible = ref(false);
        const depList = ref([]);
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
        const modal_top = ref('120px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const isEditing = computed(()=> store.state.SMS_Integrations.isEditing)
        const selectedBulkSMS = computed(()=> store.state.SMS_Integrations.selectedBulkSMS);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Service Provider", key:"service_provider",type: "text", editable: false},
            {label: "Username", key: "username", type: "text", editable: false},
            {label: "Sender ID", key:"sender_id",type: "text", editable: false},
            {label: "Status", key:"status",type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit SMS Provider', rightName: 'SMS Integrations'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete SMS Provider', rightName: 'SMS Integrations'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);

        const searchFilters = ref([
            
        ]);
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'dropdown', name: 'service_provider',label: "Service Provider", value: selectedBulkSMS.value?.service_provider || '', placeholder: "", required: true, options: [{ text: 'Africastalking', value: 'Africastalking' }, { text: 'MTECH', value: 'MTECH' }] },
                { type: 'text', name: 'username',label: "Username", value: selectedBulkSMS.value?.username || '', required: true },
                { type: 'text', name: 'sender_id',label: "Sender ID:", value: selectedBulkSMS.value?.sender_id || '', required: false },
                { type: 'text', name: 'api_key',label: "API Key", value: selectedBulkSMS.value?.api_key || '', required: true },
                { type: 'dropdown', name: 'status',label: "Status", value: selectedBulkSMS.value?.status || 'Active', placeholder: "", required: true, options: [{ text: 'Active', value: 'Active' }, { text: 'Inactive', value: 'Inactive' }] },
            ];
        };
        watch([selectedBulkSMS], () => {
            if(selectedBulkSMS.value){
                updateFormFields();
            }
        }, { immediate: true });
        const addNewBulkSMS = () =>{
            updateFormFields();
            depModalVisible.value = true;
            handleReset();
            store.dispatch("SMS_Integrations/updateState",{isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const bulkSMSID = row[idField];
                let formData = {
                    company: companyID.value,
                    bulk_sms: bulkSMSID
                }
                await store.dispatch('SMS_Integrations/fetchSMS',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const bulkSMSID = row[idField];
                let formData = {
                    company: companyID.value,
                    bulk_sms: bulkSMSID
                }
                await store.dispatch('SMS_Integrations/deleteBulkSMS',formData).
                then(()=>{
                    searchBulkSMS();
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
        const createSMSProvider = async() =>{
            showModalLoader();
            let formData = {
                service_provider: formFields.value[0].value,
                username: formFields.value[1].value,
                sender_id: formFields.value[2].value, 
                api_key: formFields.value[3].value,
                status: formFields.value[4].value,
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
                    const response = await store.dispatch('SMS_Integrations/createBulkSMS', formData);
                    if(response && response.status === 200) {
                        hideModalLoader();
                        toast.success('SMS Provider created successfully!');
                        handleReset();
                        searchBulkSMS();
                    }else {
                        toast.error('An error occurred while creating the SMS Provider.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create SMS Provider: ' + error.message);
                } finally {
                    hideModalLoader();
                }
            }

        }
        const updateSMSProvider = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                service_provider: formFields.value[0].value,
                username: formFields.value[1].value,
                sender_id: formFields.value[2].value, 
                api_key: formFields.value[3].value,
                status: formFields.value[4].value,
                company: companyID.value,
                bulk_sms: selectedBulkSMS.value.bulk_sms_id
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
                    const response = await store.dispatch('SMS_Integrations/updateBulkSMS', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("SMS Provider updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the SMS Provider.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update SMS Provider: ' + error.message);
                } finally {
                    hideModalLoader();
                }
            }
        }
        const saveSMSProvider = () =>{
            if(isEditing.value == true){
                updateSMSProvider();
            }else{
                createSMSProvider();
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchBulkSMS = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                company: companyID.value
            }
            axios
            .post(`api/v1/bulk-sms-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                depList.value = response.data.results;
                store.commit('SMS_Integrations/LIST_SMS', depList.value)
                depResults.value = response.data;
                depArrLen.value = depList.value.length;
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
            
            searchBulkSMS();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchBulkSMS();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchBulkSMS();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchBulkSMS();
        }
        const resetFilters = () =>{
            store.commit('SMS_Integrations/RESET_SEARCH_FILTERS')
            searchBulkSMS();
        }
        onMounted(()=>{
            searchBulkSMS();
        })
        return{
            title,idField, searchBulkSMS, addButtonLabel, searchFilters, resetFilters, tableColumns, depList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewBulkSMS,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveSMSProvider,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,addingRight,rightsModule
        }
    }
}
</script>