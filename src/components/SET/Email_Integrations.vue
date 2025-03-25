<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewEmail"
        :searchFilters="searchFilters"
        @searchPage="searchEmails"
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
            :displayButtons="displayButtons" @handleSubmit="saveEmailProvider" @handleReset="handleReset"
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
    name: 'Email_Integrations',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Email Integration Details');
        const addButtonLabel = ref('New Email Provider');
        const addingRight = ref('Email Integrations');
        const rightsModule = ref('Settings');
        const idField = 'email_integration_id';
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
        const modal_top = ref('100px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const isEditing = computed(()=> store.state.Email_Integrations.isEditing)
        const selectedEmail = computed(()=> store.state.Email_Integrations.selectedEmail);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Email Name", key:"email_name",type: "text", editable: false},
            {label: "SMTP Type", key: "smtp_type", type: "text", editable: false},
            {label: "Username", key:"username",type: "text", editable: false},
            {label: "Auto CC", key:"auto_cc",type: "text", editable: false},
            {label: "Port", key:"port",type: "text", editable: false},
            {label: "Status", key:"status",type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Email Provider', rightName: 'Email Integrations'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Email Provider', rightName: 'Email Integrations'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);

        const searchFilters = ref([
            
        ]);
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'email_name',label: "Email Name", value: selectedEmail.value?.email_name || '', required: true },
                { type: 'dropdown', name: 'smtp_type',label: "SMTP Type", value: selectedEmail.value?.smtp_type || 'Gmail SMTP', placeholder: "", required: true, options: [{ text: 'Local SMTP', value: 'Local SMTP' }, { text: 'Gmail SMTP', value: 'Gmail SMTP' }, { text: 'Yahoo SMTP', value: 'Yahoo SMTP' }] },
                { type: 'text', name: 'host',label: "Host", value: selectedEmail.value?.host || 'smtp.gmail.com', required: false },
                { type: 'text', name: 'username',label: "Username", value: selectedEmail.value?.username || '', required: true },
                { type: 'password', name: 'password',label: "Password", value: selectedEmail.value?.password || '', required: true },
                { type: 'text', name: 'port',label: "Port", value: selectedEmail.value?.port || '587', required: true },
                { type: 'text', name: 'auto_cc',label: "Auto CC", value: selectedEmail.value?.auto_cc || '-', required: false },
                { type: 'dropdown', name: 'status',label: "Status", value: selectedEmail.value?.status || 'Active', placeholder: "", required: true, options: [{ text: 'Active', value: 'Active' }, { text: 'Inactive', value: 'Inactive' }] },
            ];
        };
        watch([selectedEmail], () => {
            if(selectedEmail.value){
                updateFormFields();
            }
        }, { immediate: true });
        const addNewEmail = () =>{
            updateFormFields();
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Email_Integrations/updateState",{isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const emailID = row[idField];
                let formData = {
                    company: companyID.value,
                    email_integration: emailID
                }
                await store.dispatch('Email_Integrations/fetchEmailProvider',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const emailID = row[idField];
                let formData = {
                    company: companyID.value,
                    email_integration: emailID
                }
                await store.dispatch('Email_Integrations/deleteEmailProvider',formData).
                then(()=>{
                    searchEmails();
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
        const createEmailProvider = async() =>{
            showModalLoader();
            let formData = {
                smtp_type: formFields.value[1].value,
                username: formFields.value[3].value,
                host: formFields.value[2].value, 
                email_name: formFields.value[0].value,
                password: formFields.value[4].value,
                port: formFields.value[5].value,
                auto_cc: formFields.value[6].value,
                status: formFields.value[7].value,
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
                    const response = await store.dispatch('Email_Integrations/createEmailProvider', formData);
                    if(response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Email Provider created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Email Provider.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Email Provider: ' + error.message);
                } finally {
                    hideModalLoader();
                }
            }

        }
        const updateEmailProvider = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                smtp_type: formFields.value[1].value,
                username: formFields.value[3].value,
                host: formFields.value[2].value, 
                email_name: formFields.value[0].value,
                password: formFields.value[4].value,
                port: formFields.value[5].value,
                auto_cc: formFields.value[6].value,
                status: formFields.value[7].value,
                company: companyID.value,
                email_integration: selectedEmail.value.email_integration_id
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
                    const response = await store.dispatch('Email_Integrations/updateEmailProvider', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Email Provider updated successfully!");
                        handleReset();
                        searchEmails();
                    } else {
                        toast.error('An error occurred while updating the Email Provider.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Email Provider: ' + error.message);
                } finally {
                    hideModalLoader();
                }
            }
        }
        const saveEmailProvider = () =>{
            if(isEditing.value == true){
                updateEmailProvider();
            }else{
                createEmailProvider();
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchEmails = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                company: companyID.value
            }
            axios
            .post(`api/v1/email-integration-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                depList.value = response.data.results;
                store.commit('Email_Integrations/LIST_EMAILS', depList.value)
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
            
            searchEmails();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchEmails();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchEmails();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchEmails();
        }
        const resetFilters = () =>{
            store.commit('Email_Integrations/RESET_SEARCH_FILTERS')
            searchEmails();
        }
        onMounted(()=>{
            searchEmails();
        })
        return{
            title,idField, searchEmails, addButtonLabel, searchFilters, resetFilters, tableColumns, depList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewEmail,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveEmailProvider,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,addingRight,rightsModule
        }
    }
}
</script>