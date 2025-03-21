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
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="securitiesList"
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
            :displayButtons="displayButtons" @handleSubmit="createLoanSecurity" @handleReset="handleReset"
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
    name: 'Loan_Securities',
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
        const title = ref('Loan Security Details');
        const addButtonLabel = ref('New Security');
        const addingRight = ref('Adding Loan Securities');
        const rightsModule = ref('MMS');
        const idField = 'loan_security_id';
        const depModalVisible = ref(false);
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
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('35vw');
        const isEditing = computed(()=> store.state.Loan_Securities.isEditing)
        const selectedSecurity = computed(()=> store.state.Loan_Securities.selectedSecurity);
        const selectedApplication = computed(()=> store.state.Loan_Securities.selectedApplication);
        const securityArray = computed(() => store.state.Security_Types.securityArr);
        const applicationArray = computed(() => store.state.Loan_Applications.applicationArr);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Member No", key: "member_number", type: "text", editable: false},
            {label: "Member Name", key: "member_name", type: "text", editable: false},
            {label: "Loan No", key: "loan_number", type: "text", editable: false},
            {label: "Security Type", key: "security_name", type: "text", editable: false},
            {label: "Name", key: "name", type: "text", editable: false},
            {label: "Reg/ID No", key: "registration_number", type: "text", editable: false},
            {label: "Phone No", key: "phone_number", type: "text", editable: false},
            {label: "Amount", key: "amount", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Security', rightName: 'Deleting Loan Securities'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const securityID = ref('');
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
                { type: 'text-area', name: 'description',label: "Description", value: selectedApplication.value?.description || '', required: false,textarea_rows: '4', textarea_cols: '56'},
            ];
        };
        watch([selectedSecurity, selectedSecurity, selectedApplication], () => {
            if (selectedSecurity.value && selectedSecurity.value && selectedApplication.value) {
                memComponentKey.value += 1;
                prodComponentKey.value += 1;
                updateFormFields();
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
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const accountID = row[idField];
                let formData = {
                    company: companyID.value,
                    loan_security: accountID
                }
                await store.dispatch('Loan_Securities/fetchLoanSecurity',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/3';
                    flex_basis_percentage.value = '33.333';
                })
                
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
            }
        } 
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
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createLoanSecurity = async() =>{
            showModalLoader();
            let formData = {
                name: formFields.value[2].value,
                amount: formFields.value[5].value,
                phone_number: formFields.value[4].value,
                registration_number: formFields.value[3].value,
                description: formFields.value[6].value,
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
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, createLoanSecurity,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeSecurity, removeSecurities,
            addingRight,rightsModule, closeModal,selectSearchQuantity,selectedValue,handleSelectionChange
        }
    }
}
</script>