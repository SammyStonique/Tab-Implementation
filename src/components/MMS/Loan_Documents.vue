<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewDocument"
        :searchFilters="searchFilters"
        @searchPage="searchDocuments"
        @resetFilters="resetFilters"
        @removeItem="removeDocument"
        @removeSelectedItems="removeDocuments"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="documentsList"
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
        :selectedValue="selectedValue"
        @selectSearchQuantity="selectSearchQuantity"
    />
    <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader"  @closeModal="closeModal">
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="createLoanDocument" @handleReset="handleReset" @file-changed="handleFileChange"
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
import PrintJS from 'print-js';

export default{
    name: 'Loan_Documents',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const memComponentKey = ref(0);
        const prodComponentKey = ref(0);
        const title = ref('Document Details');
        const addButtonLabel = ref('New Document');
        const addingRight = ref('Adding Loan Documents');
        const removingRight = ref('Deleting Loan Documents');
        const rightsModule = ref('MMS');
        const idField = 'loan_document_id';
        const depModalVisible = ref(false);
        const documentsList = ref([]);
        const selectedIds = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
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
        const upload_file = ref('');
        const filePath = ref('');
        const computedFilePath = ref('');
        const isEditing = computed(()=> store.state.Loan_Documents.isEditing)
        const selectedDocument = computed(()=> store.state.Loan_Documents.selectedDocument);
        const selectedApplication = computed(()=> store.state.Loan_Documents.selectedApplication);
        const applicationArray = computed(() => store.state.Loan_Applications.applicationArr);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Member No", key: "member_number", type: "text", editable: false},
            {label: "Member Name", key: "member_name", type: "text", editable: false},
            {label: "Loan No", key: "loan_number", type: "text", editable: false},
            {label: "Document Type", key: "document_type", type: "text", editable: false},
            {label: "Name", key: "document_name", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'preview', icon: 'fa fa-paperclip', title: 'View Document', rightName: 'Adding Loan Documents'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Document', rightName: 'Deleting Loan Documents'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const applicationID = ref('');
        const loan_number_search = ref('');
        const name_search = ref('');
        const member_number_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Loan No...", value: loan_number_search, width:40,},
            {type:'text', placeholder:"Member No...", value: member_number_search, width:36,},
            {type:'text', placeholder:"Search Name...", value: name_search, width:48,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedApplication = async(option) =>{
            await store.dispatch('Loan_Applications/handleSelectedApplication', option)
            applicationID.value = store.state.Loan_Applications.applicationID;
        };
        const clearSelectedApplication = async() =>{
            await store.dispatch('Loan_Applications/updateState', {applicationID: ''});
            applicationID.value = store.state.Loan_Applications.applicationID;
        };
        const formFields = ref([]);

        const applicationValue = computed(() => {
            return (selectedDocument.value && selectedDocument.value.loan_application && !applicationID.value) ? selectedDocument.value.loan_application.savings_product_id : applicationID.value;
        });
        const handleFileChange = (fileData) => {
            filePath.value = fileData.filePath;
            upload_file.value = fileData.file;

        };
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Loan Application", value: applicationValue.value, componentKey: prodComponentKey,
                    selectOptions: applicationArray, optionSelected: handleSelectedApplication, required: true,
                    searchPlaceholder: 'Select Loan Application...', dropdownWidth: '500px', updateValue: selectedApplication.value,
                    fetchData: store.dispatch('Loan_Applications/fetchLoanApplications', {company:companyID.value}), clearSearch: clearSelectedApplication
                },
                { type: 'text', name: 'document_name',label: "Name", value: selectedDocument.value?.document_name || '', required: true },
                { type: 'dropdown', name: 'document_type',label: "Type", value: selectedDocument?.document_type || '', placeholder: "", required: true, options: [{ text: 'Personal Identification', value: 'Personal Identification' }, { text: 'Collateral Documents', value: 'Collateral Documents' }, { text: 'Payslip', value: 'Payslip' },{ text: 'Credit Score', value: 'Credit Score' }, { text: 'Application Form', value: 'Application Form' }, { text: 'Financial Statement', value: 'Financial Statement' }, { text: 'Other', value: 'Other' }] },
                { type: 'file', name: 'file-input',label: "Attachment", value: '', filePath: computedFilePath.value, required: false, placeholder: "", accepted_formats: "*/*", method: handleFileChange}
            ];
        };
        watch([selectedDocument, selectedDocument, selectedApplication], () => {
            if (selectedDocument.value && selectedDocument.value && selectedApplication.value) {
                memComponentKey.value += 1;
                prodComponentKey.value += 1;
                updateFormFields();
            }
            else{
                updateFormFields();
            }
        }, { immediate: true });
        const addNewDocument = () =>{
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Loan_Documents/updateState",{selectedDocument:null, selectedApplication:null,isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        };
        const previewDocument = (formData) =>{
            showLoader();
            axios
            .post("api/v1/preview-loan-document-pdf/", formData, { responseType: 'blob' })
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
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'preview'){
                const docID = row['loan_document_id'];
                let formData = {
                    loan_document: docID,
                    company: companyID.value
                } 
                previewDocument(formData);
                
            }else if(action == 'delete'){
                const accountID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    loan_document: accountID
                }
                await store.dispatch('Loan_Documents/deleteLoanDocument',formData).
                then(()=>{
                    searchDocuments();
                })
            }
        } 
        const handleReset = () =>{
            store.dispatch("Loan_Documents/updateState",{selectedDocument:null, selectedApplication:null,isEditing:false})
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            applicationID.value = "";
            prodComponentKey.value += 1;
            memComponentKey.value += 1;

        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createLoanDocument = async() =>{
            showModalLoader();
            let formData = new FormData();
            formData.append('document_name', formFields.value[1].value);
            formData.append('document_type', formFields.value[2].value);
            formData.append('document_file', upload_file.value);
            formData.append('loan_application', applicationID.value);
            formData.append('loan_application_id', applicationID.value);
            formData.append('company', companyID.value);

            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type !='search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(applicationValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Loan_Documents/createLoanDocument', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Document created successfully!');
                        handleReset();
                        memComponentKey.value += 1;
                        prodComponentKey.value += 1;
                    }else {
                        toast.error('An error occurred while creating the Document.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Document: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchDocuments();
                }
            }

        };
        const removeDocument = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    loan_document: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Loan_Documents/deleteLoanDocument',formData)
                    if(response && response.status == 200){
                        toast.success("Document Removed Succesfully");
                        searchDocuments();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Document: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Document") 
            }else{
                toast.error("Please Select A Document To Remove")
            }
        }
        const removeDocuments = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    loan_document: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Loan_Documents/deleteLoanDocument',formData)
                    if(response && response.status == 200){
                        toast.success("Document(s) Removed Succesfully");
                        searchDocuments();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Document(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Document To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchDocuments = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                loan_number: loan_number_search.value,
                member_name: name_search.value,
                member_number: member_number_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios
            .post(`api/v1/loan-documents-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                documentsList.value = response.data.results;
                store.commit('Loan_Documents/LIST_LOAN_DOCUMENTS', documentsList.value)
                depResults.value = response.data;
                depArrLen.value = documentsList.value.length;
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
            searchDocuments(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchDocuments();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchDocuments();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchDocuments();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchDocuments();
        }
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            name_search.value = "";
            loan_number_search.value = "";
            member_number_search.value = "";
            searchDocuments();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchDocuments();
        })
        return{
            title,idField, searchDocuments, addButtonLabel, searchFilters, resetFilters, tableColumns, documentsList,
            currentPage,depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewDocument,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, createLoanDocument,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeDocument, removeDocuments,
            addingRight,removingRight,rightsModule, closeModal,selectSearchQuantity,selectedValue,handleSelectionChange,
            handleFileChange
        }
    }
}
</script>