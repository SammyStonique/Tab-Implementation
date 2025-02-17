<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="composeEmail"
            :searchFilters="searchFilters"
            @searchPage="searchEmails"
            @resetFilters="resetFilters"
            @printList="printList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="emailsList"
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
    </div>
    <MovableModal v-model:visible="testModalVisible" :title="testTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="test_modal_loader" @showLoader="showTestModalLoader" @hideLoader="hideTestModalLoader" >
            <DynamicForm 
                :fields="formFields1" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="sendTestEmail" @handleReset="handleTestReset"
                @file-changed="handleFileChange"
            />
        </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Sent_Emails',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const test_modal_loader = ref('none');
        const testModalVisible = ref(false);
        const idField = 'sent_email_id';
        const addButtonLabel = ref('Compose Email');
        const testTitle = ref('Compose Email');
        const addingRight = ref('Sending System Emails');
        const rightsModule = ref('Settings');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const emailsList = ref([]);
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
        const modal_top = ref('120px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const displayButtons = ref(true);
        const showModal = ref(false);
        const errors = ref([]);
        const upload_file = ref('');
        const filePath = ref('');
        const computedFilePath = ref('');
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Recipient Name", key:"recipient_name"},
            {label: "Recipient Email", key:"recipient_email"},
            {label: "Subject", key:"email_subject"},
            {label: "Email Body", key:"email_body",maxWidth:"2000px"},
            {label: "Status", key:"status_code"},
            
        ])
        const actions = ref([
            {name: 'resend', icon: 'fas fa-sync-alt', title: 'Resend', rightName: 'Sending System Emails'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const email_search = ref('');
        const status_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Email Address...", value: email_search, width:56,},
            {type:'text', placeholder:"Status...", value: status_search, width:56,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const handleFileChange = (fileData) => {
            filePath.value = fileData.filePath;
            upload_file.value = fileData.file;
            console.log("File path updated to: ", filePath.value);
            console.log("The file updated to: ", upload_file.value);
        };

        const formFields1 = ref([]);
        const updateFormFields1 = () => {
            formFields1.value = [
                { type: 'text', name: 'recepient_names',label: "Recepient Name(s)", value: '', required: false, placeholder: "Jack,Jane" },
                { type: 'text', name: 'phone_number',label: "Email Address(s)", value: '', required: true, placeholder: "test@test.com" },
                { type: 'text', name: 'subject',label: "Subject", value: '', required: false, placeholder: "" },
                {type:'text-area', label:"Message", value: '', textarea_rows: '4', textarea_cols: '56', required: true},
                { type: 'file', name: 'file-input',label: "Attachment", value: '', filePath: computedFilePath.value, required: false, placeholder: "", accepted_formats: "*/*", method: handleFileChange},
            ];
        };
  
        const sendTestEmail = async() =>{
            showTestModalLoader();
            let recepient_names_array = [formFields1.value[0].value]
            let emails_array = [formFields1.value[1].value]
            let formData = new FormData();
            formData.append('subject', formFields1.value[2].value);
            formData.append('content', formFields1.value[3].value);
            formData.append('recepient_names', recepient_names_array);
            formData.append('emails', emails_array);
            formData.append('attachment', upload_file.value);
            formData.append('company', companyID.value);

            errors.value = [];
            for(let i=0; i < formFields1.value.length; i++){
                if(formFields1.value[i].value =='' && formFields1.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideTestModalLoader();
            }else{
                try {
                    const response = await axios.post('api/v1/test-send-email/', formData)
                    if(response && response.data.msg === "Success") {
                        hideTestModalLoader();
                        toast.success('Email Sent!');
                        handleTestReset();
                        testModalVisible.value = false;
                    }else {
                        toast.error('An error occurred while sending the Email.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to send Email: ' + error.message);
                } finally {
                    hideTestModalLoader();
                }
            }

        }
        const handleTestReset = () =>{
            for(let i=0; i < formFields1.value.length; i++){
                formFields1.value[i].value = '';
            }
        }
        const showTestModalLoader = () =>{
            test_modal_loader.value = "block";
        }
        const hideTestModalLoader = () =>{
            test_modal_loader.value = "none";
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
                email: email_search.value,
                status: status_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/sent-emails-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                emailsList.value = response.data.results;
                propResults.value = response.data;
                propArrLen.value = emailsList.value.length;
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
            searchEmails(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            email_search.value = "";
            status_search.value = "";
            searchEmails();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchEmails();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchEmails();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchEmails();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchEmails();
            // scrollToTop();
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'resend'){
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';
                testModalVisible.value = true;
                updateFormFields1();

            }
        };
        const composeEmail = async() =>{
            updateFormFields1();
            handleTestReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
            testModalVisible.value = true; 
            
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchEmails();
            
        })
        return{
            searchEmails,resetFilters, addButtonLabel, searchFilters, tableColumns, emailsList,flex_basis,flex_basis_percentage,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,selectSearchQuantity,selectedValue,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,modal_left,modal_top,modal_width,
            submitButtonLabel, showLoader, loader,handleSelectionChange,addingRight,rightsModule,displayButtons,
            composeEmail,testModalVisible,testTitle,test_modal_loader,handleTestReset,showTestModalLoader,hideTestModalLoader,
            formFields1,sendTestEmail,handleFileChange
        }
    }
};
</script>