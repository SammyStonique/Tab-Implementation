<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewGuarantor"
        :searchFilters="searchFilters"
        :dropdownOptions="dropdownOptions"
        @handleDynamicOption="handleDynamicOption"
        @searchPage="searchGuarantors"
        @resetFilters="resetFilters"
        @removeItem="removeGuarantor"
        @removeSelectedItems="removeGuarantors"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="guarantorsList"
        :actions="actions"
        :idField="idField"
        @handleSelectionChange="handleSelectionChange"
        @handleActionClick="handleActionClick"
        @handleOpenLink="handleOpenLink"
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
            :displayButtons="displayButtons" @handleSubmit="createLoanGuarantor" @handleReset="handleReset"
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
    name: 'Loan_Guarantors',
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
        const title = ref('Saving Account Details');
        const addButtonLabel = ref('New Guarantor');
        const addingRight = ref('Adding Loan Guarantors');
        const removingRight = ref('Deleting Loan Guarantors');
        const rightsModule = ref('MMS');
        const idField = 'loan_guarantor_id';
        const depModalVisible = ref(false);
        const guarantorsList = ref([]);
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
        const isEditing = computed(()=> store.state.Loan_Guarantors.isEditing)
        const selectedGuarantor = computed(()=> store.state.Loan_Guarantors.selectedGuarantor);
        const selectedMember = computed(()=> store.state.Loan_Guarantors.selectedMember);
        const selectedApplication = computed(()=> store.state.Loan_Guarantors.selectedApplication);
        const memberArray = computed(() => store.state.Members.memberArr);
        const applicationArray = computed(() => store.state.Loan_Applications.applicationArr);
        const productMinAmount = ref(0);
        const computedProdMinAmnt = computed(() =>  productMinAmount);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "date"},
            {label: "Member No", key: "member_number"},
            {label: "Member Name", key: "member_name"},
            {label: "Phone No", key: "phone_number"},
            {label: "Loan No", key: "loan_number", type:"link"},
            {label: "Guarantee", key: "guarantee"},
            {label: "Amount", key: "amount"},
            {label: "Approved", key: "approval_status"},
        ])
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Guarantor', rightName: 'Deleting Loan Guarantors'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const memberID = ref('');
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
        const handleSelectedMember = async(option) =>{
            await store.dispatch('Members/handleSelectedMember', option)
            memberID.value = store.state.Members.memberID;
            if(selectedGuarantor.value){
                selectedGuarantor.value.member.member_id = memberID.value;
                memberValue.value = memberID.value
            }
        };
        const clearSelectedMember = async() =>{
            await store.dispatch('Members/updateState', {memberID: ''});
            memberID.value = store.state.Members.memberID;
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
        const memberValue = computed(() => {
            return (selectedGuarantor.value && selectedGuarantor.value.member && !memberID.value) ? selectedGuarantor.value.member.member_id : memberID.value;
        });
        const applicationValue = computed(() => {
            return (selectedGuarantor.value && selectedGuarantor.value.loan_application && !applicationID.value) ? selectedGuarantor.value.loan_application.savings_product_id : applicationID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Member", value: memberValue.value, componentKey: memComponentKey,
                    selectOptions: memberArray, optionSelected: handleSelectedMember, required: true,
                    searchPlaceholder: 'Select Member...', dropdownWidth: '400px', updateValue: selectedMember.value,
                    fetchData: store.dispatch('Members/fetchMembers', {company:companyID.value}), clearSearch: clearSelectedMember
                },
                {  
                    type:'search-dropdown', label:"Loan Application", value: applicationValue.value, componentKey: prodComponentKey,
                    selectOptions: applicationArray, optionSelected: handleSelectedApplication, required: true,
                    searchPlaceholder: 'Select Loan Application...', dropdownWidth: '400px', updateValue: selectedApplication.value,
                    fetchData: store.dispatch('Loan_Applications/fetchLoanApplications', {company:companyID.value}), clearSearch: clearSelectedApplication
                },
                { type: 'date', name: 'approval_date',label: "Date", value: selectedGuarantor.value?.approval_date || '', required: true },
                { type: 'text', name: 'amount',label: "Amount", value: selectedGuarantor.value?.amount || '0', required: true },
            ];
        };
        watch([selectedGuarantor, selectedMember, selectedApplication], () => {
            if (selectedGuarantor.value && selectedMember.value && selectedApplication.value) {
                memComponentKey.value += 1;
                prodComponentKey.value += 1;
                updateFormFields();
            }
            else{
                updateFormFields();
            }
        }, { immediate: true });
        const addNewGuarantor = () =>{
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Loan_Guarantors/updateState",{selectedGuarantor:null, selectedMember:null, selectedApplication:null,isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        };
        const handleOpenLink = async(row) =>{
            const applicationID = row['loan_application_id'];
            let formData = {
                company: companyID.value,
                loan_application: applicationID
            }
            await store.dispatch('Loan_Applications/fetchLoanDetails',formData).
            then(()=>{
                store.commit('pageTab/ADD_PAGE', {'MMS':'Loan_Statement'});
                store.state.pageTab.mmsActiveTab = 'Loan_Statement'; 
            })
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const accountID = row[idField];
                let formData = {
                    company: companyID.value,
                    loan_guarantor: accountID
                }
                await store.dispatch('Loan_Guarantors/fetchLoanGuarantor',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const accountID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    loan_guarantor: accountID
                }
                await store.dispatch('Loan_Guarantors/deleteLoanGuarantor',formData).
                then(()=>{
                    searchGuarantors();
                })
            }
        } 
        const handleReset = () =>{
            store.dispatch("Loan_Guarantors/updateState",{selectedGuarantor:null, selectedMember:null, selectedApplication:null,isEditing:false})
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            memberID.value = "";
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
        const createLoanGuarantor = async() =>{
            showModalLoader();
            let formData = {
                date: formFields.value[2].value,
                amount: formFields.value[3].value,
                approved: 'Yes',
                member: memberID.value,
                member_id: memberID.value,
                loan_application: applicationID.value,
                loan_application_id: applicationID.value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type !='search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(memberValue.value == '' || applicationValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Loan_Guarantors/createLoanGuarantor', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Guarantor created successfully!');
                        handleReset();
                        memComponentKey.value += 1;
                        prodComponentKey.value += 1;
                    }else {
                        toast.error('An error occurred while creating the Guarantor.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Guarantor: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchGuarantors();
                }
            }

        };
        const removeGuarantor = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    loan_guarantor: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Loan_Guarantors/deleteLoanGuarantor',formData)
                    if(response && response.status == 200){
                        toast.success("Guarantor Removed Succesfully");
                        searchGuarantors();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Guarantor: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Guarantor") 
            }else{
                toast.error("Please Select A Guarantor To Remove")
            }
        }
        const removeGuarantors = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    loan_guarantor: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Loan_Guarantors/deleteLoanGuarantor',formData)
                    if(response && response.status == 200){
                        toast.success("Guarantor(s) Removed Succesfully");
                        searchGuarantors();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Guarantor(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Guarantor To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchGuarantors = () =>{
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
            .post(`api/v1/loan-guarantors-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                guarantorsList.value = response.data.results;
                store.commit('Loan_Guarantors/LIST_GUARANTORS', guarantorsList.value)
                depResults.value = response.data;
                depArrLen.value = guarantorsList.value.length;
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
            searchGuarantors(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchGuarantors();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchGuarantors();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchGuarantors();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchGuarantors();
        }
        const resetFilters = () =>{
            selectedValue.value = 50;
            name_search.value = "";
            loan_number_search.value = "";
            member_number_search.value = "";
            searchGuarantors();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        };
        const dropdownOptions = ref([
            {label: 'Guarantor Interest', action: 'interest-report', icon: 'fa-receipt', colorClass: 'text-black-600', rightName: 'Adding Loan Guarantors'}, 
        ]);
        const handleDynamicOption = async(option) =>{
            if( option == 'interest-report'){
                store.commit('pageTab/ADD_PAGE', {'MMS':'Guarantor_Interest'});
                store.state.pageTab.mmsActiveTab = 'Guarantor_Interest';          
            }
        }
        onMounted(()=>{
            searchGuarantors();
        })
        return{
            title,idField, searchGuarantors, addButtonLabel, searchFilters, resetFilters, tableColumns, guarantorsList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewGuarantor,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, createLoanGuarantor,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeGuarantor, removeGuarantors,
            addingRight,removingRight,rightsModule, closeModal,selectSearchQuantity,selectedValue,handleSelectionChange,handleOpenLink,
            dropdownOptions, handleDynamicOption
        }
    }
}
</script>