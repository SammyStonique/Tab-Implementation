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
        @handleSelectionChange="handleSelectionChange"
        @handleActionClick="handleActionClick"
        :enableContextMenu=true
        @handleRightClick="handleRightClick"
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
            :displayButtons="displayButtons" @handleSubmit="createLoanSecurity" @handleReset="handleReset"
        />
    </MovableModal>
    <MovableModal v-model:visible="propModalVisible" :title="title1" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader1" @showLoader="showModalLoader1" @hideLoader="hideModalLoader1"  @closeModal="closeModal1">
        <DynamicForm 
            :fields="formFields1" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="changeSecurityStatus" @handleReset="handleReset1"
        />
    </MovableModal>
    <MovableModal v-model:visible="docModalVisible" :title="title2" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader2" @showLoader="showModalLoader2" @hideLoader="hideModalLoader2"  @closeModal="closeModal2">
        <DynamicForm 
            :fields="formFields2" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="uploadSecurityDocument" @handleReset="handleReset2" @file-changed="handleFileChange"
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
    name: 'Loan_Securities',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const modal_loader1 = ref('none');
        const modal_loader2 = ref('none');
        const memComponentKey = ref(0);
        const prodComponentKey = ref(0);
        const title = ref('Loan Security Details');
        const title1 = ref('Change Security Status');
        const title2 = ref('Upload Security Document');
        const addButtonLabel = ref('New Security');
        const addingRight = ref('Adding Loan Securities');
        const removingRight = ref('Deleting Loan Securities');
        const rightsModule = ref('MMS');
        const idField = 'loan_security_id';
        const depModalVisible = ref(false);
        const propModalVisible = ref(false);
        const docModalVisible = ref(false);
        const securitiesList = ref([]);
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
        const upload_file = ref('');
        const filePath = ref('');
        const computedFilePath = ref('');
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('35vw');
        const isEditing = computed(()=> store.state.Loan_Securities.isEditing)
        const selectedSecurity = computed(()=> store.state.Loan_Securities.selectedSecurity);
        const selectedSecurityType = computed(()=> store.state.Loan_Securities.selectedSecurityType);
        const selectedApplication = computed(()=> store.state.Loan_Securities.selectedApplication);
        const securityArray = computed(() => store.state.Security_Types.securityArr);
        const applicationArray = computed(() => store.state.Loan_Applications.applicationArr);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "date", type: "text"},
            {label: "Member No", key: "member_number", type: "text"},
            {label: "Member Name", key: "member_name", type: "text"},
            {label: "Loan No", key: "loan_number", type: "text"},
            {label: "Security Type", key: "security_name", type: "text"},
            {label: "Name", key: "name", type: "text"},
            {label: "Reg/ID No", key: "registration_number", type: "text"},
            {label: "Phone No", key: "phone_number", type: "text"},
            {label: "Amount", key: "amount", type: "text"},
            {label: "Status", key: "security_status", type: "text"},
            {label: "Attach.?", key: "document_file", type: "text"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-exchange', title: 'Change Status', rightName: 'Changing Security Status'},
            {name: 'generate-form', icon: 'fa fa-print', title: 'Generate Form', rightName: 'Changing Security Status'},
            {name: 'upload', icon: 'fa fa-cloud-upload', title: 'Upload Document', rightName: 'Changing Security Status'},
            {name: 'preview', icon: 'fa fa-paperclip', title: 'View Document', rightName: 'Changing Security Status'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Security', rightName: 'Deleting Loan Securities'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const securityID = ref('');
        const applicationID = ref('');
        const loan_number_search = ref('');
        const name_search = ref('');
        const member_number_search = ref("");
        const security_status_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Loan No...", value: loan_number_search, width:40,},
            {type:'text', placeholder:"Member No...", value: member_number_search, width:36,},
            {type:'text', placeholder:"Search Name...", value: name_search, width:48,},
            {
                type:'dropdown', placeholder:"Status..", value: security_status_search, width:44,
                options: [{ text: 'Borrower Possession', value: 'Borrower Possession' }, { text: 'Company Possession', value: 'Company Possession' }, { text: 'Joint Possession', value: 'Joint Possession' }, { text: 'Auctioned', value: 'Auctioned' },{ text: 'Reclaimed', value: 'Reclaimed' }, { text: 'Under Litigation', value: 'Under Litigation' },{ text: 'Writen-off', value: 'Writen-off' },{ text: 'Settled', value: 'Settled' }]
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedSecurity = async(option) =>{
            await store.dispatch('Security_Types/handleSelectedSecurity', option)
            securityID.value = store.state.Security_Types.securityID;
            if(selectedSecurity.value){
                selectedSecurity.value.security_type.security_type_id = securityID.value;
                securityValue.value = securityID.value
            }
        };
        const clearSelectedSecurity = async() =>{
            await store.dispatch('Security_Types/updateState', {securityID: ''});
            securityID.value = store.state.Security_Types.securityID;
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
        const formFields1 = ref([]);
        const formFields2 = ref([]);
        const securityValue = computed(() => {
            return (selectedSecurity.value && selectedSecurity.value.security_type && !securityID.value) ? selectedSecurity.value.security_type.security_type_id : securityID.value;
        });
        const applicationValue = computed(() => {
            return (selectedSecurity.value && selectedSecurity.value.loan_application && !applicationID.value) ? selectedSecurity.value.loan_application.loan_application_id : applicationID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Security", value: securityValue.value, componentKey: memComponentKey,
                    selectOptions: securityArray, optionSelected: handleSelectedSecurity, required: true,
                    searchPlaceholder: 'Select Security...', dropdownWidth: '500px', updateValue: selectedSecurity.value,
                    fetchData: store.dispatch('Security_Types/fetchSecurityTypes', {company:companyID.value}), clearSearch: clearSelectedSecurity
                },
                {  
                    type:'search-dropdown', label:"Loan Application", value: applicationValue.value, componentKey: prodComponentKey,
                    selectOptions: applicationArray, optionSelected: handleSelectedApplication, required: true,
                    searchPlaceholder: 'Select Loan Application...', dropdownWidth: '500px', updateValue: selectedApplication.value,
                    fetchData: store.dispatch('Loan_Applications/fetchLoanApplications', {company:companyID.value}), clearSearch: clearSelectedApplication
                },
                { type: 'text', name: 'name',label: "Name", value: selectedSecurity.value?.name || '', required: true },
                { type: 'text', name: 'registration_number',label: "Reg/ID No", value: selectedSecurity.value?.registration_number || '', required: true },
                { type: 'text', name: 'phone_number',label: "Phone No", value: selectedSecurity.value?.phone_number || '0', required: true },
                { type: 'text', name: 'amount',label: "Amount", value: selectedSecurity.value?.amount || '0', required: true },
                { type: 'text-area', name: 'description',label: "Description", value: selectedSecurity.value?.description || '', required: false,textarea_rows: '4', textarea_cols: '56'},
            ];
        };
        const updateFormFields1 = () => {
            formFields1.value = [
                { type: 'dropdown', name: 'security_status',label: "Status", value: selectedSecurity.value?.security_status || '', placeholder: "", required: true, options: [{ text: 'Borrower Possession', value: 'Borrower Possession' }, { text: 'Company Possession', value: 'Company Possession' }, { text: 'Joint Possession', value: 'Joint Possession' }, { text: 'Auctioned', value: 'Auctioned' },{ text: 'Reclaimed', value: 'Reclaimed' }, { text: 'Under Litigation', value: 'Under Litigation' },{ text: 'Writen-off', value: 'Writen-off' },{ text: 'Settled', value: 'Settled' }] },
            ];
            
        };
        const handleFileChange = (fileData) => {
            filePath.value = fileData.filePath;
            upload_file.value = fileData.file;
        };
        const updateFormFields2 = () => {
            formFields2.value = [
                { type: 'file', name: 'file-input',label: "Attachment", value: '', filePath: computedFilePath.value, required: true, placeholder: "", accepted_formats: "*/*", method: handleFileChange}
            ];
            
        };
        watch([selectedSecurity], () => {
            if (selectedSecurity.value) {
                updateFormFields1();
                updateFormFields2();
            }
            else{
                updateFormFields();
                
            }
        }, { immediate: true });
        const addNewSecurity = () =>{
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Loan_Securities/updateState",{selectedSecurity:null, selectedSecurityType:null, selectedApplication:null,isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const previewDocument = (formData) =>{
            showLoader();
            axios
            .post("api/v1/preview-loan-security-document-pdf/", formData, { responseType: 'blob' })
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
            if( action == 'edit'){
                const accountID = row[idField];
                let formData = {
                    company: companyID.value,
                    loan_security: accountID
                }
                await store.dispatch('Loan_Securities/fetchLoanSecurity',formData).
                then(()=>{
                    propModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if( action == 'upload'){
                const accountID = row[idField];             
                let formData = {
                    company: companyID.value,
                    loan_security: accountID
                }
                await store.dispatch('Loan_Securities/fetchLoanSecurity',formData).
                then(()=>{
                    docModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })    
                
            }else if( action == 'generate-form'){
                const docStatus = row['security_status'];
                if(docStatus == "Reclaimed"){
                    showLoader();
                    const secID = row[idField];          
                    let formData = {
                        loan_security: secID,
                        date: "",
                        company_id: companyID.value
                    } 

                    axios
                    .post("api/v1/loan-security-claim-pdf/", formData, { responseType: 'blob' })
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
                }else{
                    toast.error("Change Security Status First")
                }
                
            }else if( action == 'preview'){
                const docID = row[idField];
                const docFile = row['document_file'];
                if(docFile == "Yes"){
                    let formData = {
                        loan_security: docID,
                        company: companyID.value
                    } 
                    previewDocument(formData);
                }else{
                    toast.error("No Document To Preview")
                }
                
                
            }else if(action == 'delete'){
                const accountID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    loan_security: accountID
                }
                await store.dispatch('Loan_Securities/deleteLoanSecurity',formData).
                then(()=>{
                    searchSecurities();
                })
            }else if(action == 'delete-attachment'){
                const accountID = [row[idField]];
                const docFile = row['document_file'];
                if(docFile == "Yes"){
                    let formData = {
                        company: companyID.value,
                        loan_security: accountID
                    }
                    await store.dispatch('Loan_Securities/deleteLoanSecurityAttachment',formData).
                    then(()=>{
                        searchSecurities();
                    })
                }else{
                    toast.error("No Attachment Detected")
                }
                
            }
        };
        watch(() => store.state.contextMenu.selectedAction, (actionPayload) => {
            if (!actionPayload) return;
            const { rowIndex, action, data } = actionPayload;
            handleActionClick(rowIndex, action, data);
            store.commit('contextMenu/CLEAR_SELECTED_ACTION');
        });
        const handleRightClick = (row, rowIndex, event) => {
            store.commit('contextMenu/CLEAR_SELECTED_ACTION');
            const menuOptions = [
                { label: 'Delete Attachment', action: 'delete-attachment', rowIndex: rowIndex, icon: 'fa fa-trash', rightName: 'Deleting Loan Securities' },
            ];

            store.commit('contextMenu/SHOW_CONTEXT_MENU', {
                x: event.clientX,
                y: event.clientY,
                options: menuOptions,
                contextData: row,
            });
        };
        const handleReset = () =>{
            store.dispatch("Loan_Securities/updateState",{selectedSecurity:null, selectedSecurityType:null, selectedApplication:null,isEditing:false})
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            securityID.value = "";
            applicationID.value = "";
            prodComponentKey.value += 1;
            memComponentKey.value += 1;

        }
        const handleReset1 = () =>{
            store.dispatch("Loan_Securities/updateState",{selectedSecurity:null, selectedSecurityType:null, selectedApplication:null,isEditing:false})
            for(let i=0; i < formFields1.value.length; i++){
                formFields1.value[i].value = '';
            }

        }
        const handleReset2 = () =>{
            store.dispatch("Loan_Securities/updateState",{selectedSecurity:null, selectedSecurityType:null, selectedApplication:null,isEditing:false})
            for(let i=0; i < formFields2.value.length; i++){
                formFields2.value[i].value = '';
            }
            upload_file.value = "";
        }
        const showModalLoader1 = () =>{
            modal_loader1.value = "block";
        }
        const hideModalLoader1 = () =>{
            modal_loader1.value = "none";
        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const showModalLoader2 = () =>{
            modal_loader2.value = "block";
        }
        const hideModalLoader2 = () =>{
            modal_loader2.value = "none";
        }
        const createLoanSecurity = async() =>{
            showModalLoader();
            let formData = {
                name: formFields.value[2].value,
                amount: formFields.value[5].value,
                phone_number: formFields.value[4].value,
                registration_number: formFields.value[3].value,
                description: formFields.value[6].value,
                document_file: null,
                security_type: securityID.value,
                security_type_id: securityID.value,
                loan_application: applicationID.value,
                loan_application_id: applicationID.value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=2; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type !='search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(securityValue.value == '' || applicationValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Loan_Securities/createLoanSecurity', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Security created successfully!');
                        handleReset();
                        memComponentKey.value += 1;
                        prodComponentKey.value += 1;
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

        };
        const changeSecurityStatus = async() =>{
            showModalLoader1();
            let formData = {
                loan_security: selectedSecurity.value.loan_security_id,
                name: selectedSecurity.value.name,
                amount: selectedSecurity.value.amount,
                phone_number: selectedSecurity.value.phone_number,
                registration_number: selectedSecurity.value.registration_number,
                description: selectedSecurity.value.description,
                security_type: selectedSecurity.value.security_type,
                security_type_id: selectedSecurity.value.security_type.security_type_id,
                loan_application: selectedSecurity.value.loan_application,
                loan_application_id: selectedSecurity.value.loan_application.loan_application_id,
                security_status: formFields1.value[0].value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=0; i < formFields1.value.length; i++){
                if(formFields1.value[i].value =='' && formFields1.value[i].required == true && formFields1.value[i].type !='search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader1();
            }else{
                try {
                    const response = await store.dispatch('Loan_Securities/updateLoanSecurity', formData);
                    if(response && response.status === 200) {
                        hideModalLoader1();
                        toast.success('Status Changed successfully!');
                        closeModal1();
                    }else {
                        toast.error('An error occurred while changing the Status.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to change Status: ' + error.message);
                } finally {
                    hideModalLoader1();
                    searchSecurities();
                }
            }

        };
        const uploadSecurityDocument = async() =>{
            showModalLoader2();
            let formData = new FormData();
            formData.append('loan_security', selectedSecurity.value.loan_security_id);
            formData.append('name', selectedSecurity.value.name);
            formData.append('amount', selectedSecurity.value.amount);
            formData.append('phone_number', selectedSecurity.value.phone_number);
            formData.append('registration_number', selectedSecurity.value.registration_number);
            formData.append('description', selectedSecurity.value.description);
            formData.append('document_file', upload_file.value);
            formData.append('security_type', selectedSecurity.value.security_type);
            formData.append('security_type_id', selectedSecurity.value.security_type.security_type_id);
            formData.append('loan_application', selectedSecurity.value.loan_application);
            formData.append('loan_application_id', selectedSecurity.value.loan_application.loan_application_id);
            formData.append('security_status', selectedSecurity.value.security_status);
            formData.append('company', companyID.value);


            errors.value = [];
            if(upload_file.value == ""){
                errors.value.push('Error');
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader2();
            }else{
                try {
                    const response = await store.dispatch('Loan_Securities/updateLoanSecurity', formData);
                    if(response && response.status === 200) {
                        hideModalLoader2();
                        toast.success('Document Uploaded successfully!');
                        closeModal2();
                    }else {
                        toast.error('An error occurred while uploading the Document.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to upload Document: ' + error.message);
                } finally {
                    hideModalLoader2();
                    searchSecurities();
                }
            }

        };
        const removeSecurity = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    loan_security: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Loan_Securities/deleteLoanSecurity',formData)
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
                    loan_security: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Loan_Securities/deleteLoanSecurity',formData)
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
                loan_number: loan_number_search.value,
                member_name: name_search.value,
                member_number: member_number_search.value,
                security_status: security_status_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios
            .post(`api/v1/loan-securities-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                securitiesList.value = response.data.results;
                store.commit('Loan_Securities/LIST_LOAN_SECURITIES', securitiesList.value)
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
            currentPage.value = 1;
            selectedValue.value = 50;
            name_search.value = "";
            loan_number_search.value = "";
            member_number_search.value = "";
            security_status_search.value = "";
            searchSecurities();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        }
        const closeModal1 = async() =>{
            propModalVisible.value = false;
            handleReset1();
        }
        const closeModal2 = async() =>{
            docModalVisible.value = false;
            handleReset2();
        }
        onMounted(()=>{
            searchSecurities();
        })
        return{
            title, title1,title2,idField, searchSecurities, addButtonLabel, searchFilters, resetFilters, tableColumns, securitiesList,
            currentPage,depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields,formFields1,formFields2, depModalVisible, propModalVisible,docModalVisible, addNewSecurity,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick,handleRightClick, handleReset, handleReset1,handleReset2, createLoanSecurity, changeSecurityStatus,uploadSecurityDocument,
            showLoader, loader, hideLoader, modal_loader,modal_loader1,modal_loader2, showModalLoader, hideModalLoader, removeSecurity, removeSecurities, showModalLoader1, hideModalLoader1,
            addingRight,removingRight,rightsModule, closeModal,closeModal1,selectSearchQuantity,selectedValue,handleSelectionChange, showModalLoader2, hideModalLoader2,
            handleFileChange
        }
    }
}
</script>