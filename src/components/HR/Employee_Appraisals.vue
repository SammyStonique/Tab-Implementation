<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewAppraisal"
            :searchFilters="searchFilters"
            @searchPage="searchAppraisals"
            @resetFilters="resetFilters"
            @removeItem="removeAppraisal"
            @removeSelectedItems="removeAppraisals"
            @printList="printAppraisalList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="appraisalsList"
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
            >
        </PageComponent>
    </div>
    <MovableModal v-model:visible="transModalVisible" :title="transTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="trans_modal_loader" @showLoader="showTransModalLoader" @hideLoader="hideTransModalLoader" @closeModal="closeTransModal">
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="approveAppraisal" @handleReset="handleReset"
        />
    </MovableModal>

</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import PrintJS from 'print-js';
import MovableModal from '@/components/MovableModal.vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import Swal from 'sweetalert2';

export default{
    name: 'Employee_Appraisals',
    components:{
        PageComponent,MovableModal,SearchableDropdown,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('');
        const ledComponentKey = ref(0);
        const displayButtons = ref(true);
        const trans_modal_loader = ref('none');
        const ref_modal_loader = ref('none');
        const idField = 'employee_appraisal_id';
        const addButtonLabel = ref('New Appraisal');
        const addingRight = ref('Adding Employee Appraisals');
        const rightsModule = ref('HR');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const appraisalsList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const showDetails = ref(false);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const transTitle = ref('Approve/Reject Loan');
        const refTitle = ref('Disburse Loan');
        const transModalVisible = ref(false);
        const refModalVisible = ref(false);
        const dropdownWidth = ref("500px")
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"appraisal_date"},
            {label: "Staff No", key:"staff_number"},
            {label: "Employee Name", key:"employee_name"},
            {label: "Period", key: "period_name"},
            {label: "Category", key: "category_name"},
            {label: "Score", key: "overall_rating"},
            {label: "Comments/Remarks", key:"comments"},
            {label: "Appr. By", key:"reveiewer_name"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Appraisal', rightName: 'Editing Employee Appraisals'},
            {name: 'approve/reject', icon: 'fa fa-check-circle', title: 'Approve/Reject Appraisal', rightName: 'Approving Employee Appraisals'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Appraisal', rightName: 'Deleting Employee Appraisals'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);      
        const appraisalID = ref("");
        const dropdownOptions = ref([
            
        ]);
        
        const name_search = ref('');
        const staff_number = ref("");
 
        const searchFilters = ref([
            {type:'text', placeholder:"Employee Name...", value: name_search, width:48,},
            {type:'text', placeholder:"Staff No...", value: staff_number, width:48,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'date', name: 'date',label: "Date", value: '', required: true },
                { type: 'dropdown', name: 'approval_status',label: "Status", value: '', placeholder: "", required: true, options: [{ text: 'Approve', value: 'Approved' }, { text: 'Reject', value: 'Rejected' }] },
            ]
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }
        const removeAppraisal = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    employee_appraisal: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Appraisals/deleteAppraisal',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Appraisal(s) Removed Succesfully");
                        searchAppraisals();
                    }else if(response && response.data.msg == "Failed"){
                        toast.error("Failed To Remove Appraisal");
                        searchAppraisals();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Appraisal: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Appraisal") 
            }else{
                toast.error("Please Select An Appraisal To Remove")
            }
        }
        const removeAppraisals = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    employee_appraisal: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Appraisals/deleteAppraisal',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Appraisal(s) Removed Succesfully");
                        searchAppraisals();
                    }else if(response && response.data.msg == "Failed"){
                        toast.error("Failed To Remove Appraisal");
                        searchAppraisals();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Appraisal: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select An Appraisal To Remove")
            }
        };
        const showTransModalLoader = () =>{
            trans_modal_loader.value = "block";
        }
        const hideTransModalLoader = () =>{
            trans_modal_loader.value = "none";
        }
        const approveAppraisal = async() =>{
            showTransModalLoader();
            let formData = {
                employee_appraisal: appraisalID.value,
                approved_by: userID.value,
                approval_date: formFields.value[0].value,
                approval_status: formFields.value[1].value,
                company: companyID.value
            }

            axios.post(`api/v1/approve-employee-appraisal/`,formData)
            .then((response)=>{
            if(response.data.msg == "Success"){
                hideTransModalLoader();
                closeTransModal();
                toast.success("Success")
                searchAppraisals();
            }else{
                toast.error("Error");
                hideTransModalLoader();
            }                   
            })
            .catch((error)=>{
                console.log(error.message);
                toast.error(error.message);
                hideTransModalLoader();
            })
        };
        const closeTransModal = () =>{
            transModalVisible.value = false;
            appraisalID.value = null;
            hideTransModalLoader();
        };
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchAppraisals = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                employee_name: name_search.value,
                staff_number: staff_number.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/appraisals-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                appraisalsList.value = response.data.results;
                store.commit('Appraisals/LIST_APPRAISALS', appraisalsList.value)
                propResults.value = response.data;
                propArrLen.value = appraisalsList.value.length;
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
            searchAppraisals(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            name_search.value = "";
            staff_number.value = "";
            searchAppraisals();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchAppraisals();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchAppraisals();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchAppraisals();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchAppraisals();
            // scrollToTop();
        }
        const addNewAppraisal = async() =>{
            store.commit('Appraisals/initializeStore');
            await store.dispatch('Appraisals/updateState', {selectedAppraisal: null,selectedCategory: null,selectedEmployee: null,selectedPeriod: null,performanceIndicators: [],isEditing: false});
            store.commit('pageTab/ADD_PAGE', {'HR':'Appraisal_Details'});
            store.state.pageTab.hrActiveTab = 'Appraisal_Details';          
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                await store.dispatch('Appraisals/updateState', {selectedAppraisal: null,selectedCategory: null,selectedEmployee: null,selectedPeriod: null,performanceIndicators: [],isEditing: false});
                const appraisalID = row[idField];
                const applicationStatus = row['status']
                if(applicationStatus == 'Pending'){
                    let formData = {
                        company: companyID.value,
                        employee_appraisal: appraisalID
                    }
                    await store.dispatch('Appraisals/fetchAppraisal',formData).
                    then(()=>{
                        store.commit('pageTab/ADD_PAGE', {'HR':'Appraisal_Details'})
                        store.state.pageTab.hrActiveTab = 'Appraisal_Details';
                    })
                }else{
                    toast.error(`Cannot Edit ${applicationStatus} Appraisal`)
                }
                
            }else if(action == 'delete'){
                const appraisalID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    employee_appraisal: appraisalID
                }
                await store.dispatch('Appraisals/deleteAppraisal',formData).
                then(()=>{
                    searchAppraisals();
                })
            }else if(action == 'approve/reject'){
                const applicationStatus = row['status']
                if(applicationStatus == 'Pending'){
                    updateFormFields();
                    appraisalID.value = row['employee_appraisal_id'];
                    transModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                }else{
                    toast.error(`Appraisal Already ${applicationStatus}`)
                }
            }else if(action == 'view'){
                const appraisalID = row[idField];
                const applicationStatus = row['status']
                if(applicationStatus == 'Approved'){
                    let formData = {
                        company: companyID.value,
                        employee_appraisal: appraisalID
                    }
                    await store.dispatch('Appraisals/fetchLoanDetails',formData).
                    then(()=>{
                        store.commit('pageTab/ADD_PAGE', {'HR':'Loan_Ledger'});
                        store.state.pageTab.hrActiveTab = 'Loan_Ledger'; 
                    })
                }else{
                    toast.error(`Cannot View ${applicationStatus} Appraisal`)
                }
            }
        };
        
        const printAppraisalList = () =>{
            showLoader();
            let formData = {
                product_name: name_search.value,
                product_code: loan_number_search.value,
                active_status: staff_number.value,
                company_id: companyID.value,
            } 

            axios
            .post("api/v1/export-employee-loan-applications-pdf/", formData, { responseType: 'blob' })
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

        onBeforeMount(()=>{
            searchAppraisals();
            
        })
        return{
            searchAppraisals,resetFilters, addButtonLabel, searchFilters, tableColumns, appraisalsList,dropdownWidth,displayButtons,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,flex_basis,flex_basis_percentage,formFields,handleReset,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,showDetails,
            submitButtonLabel, showModal, addNewAppraisal, showLoader, loader, hideLoader, removeAppraisal, removeAppraisals,
            handleSelectionChange,addingRight,rightsModule,printAppraisalList,selectSearchQuantity,selectedValue,
            modal_left,modal_top,modal_width,trans_modal_loader,transModalVisible,transTitle,showTransModalLoader,hideTransModalLoader,approveAppraisal,closeTransModal,
            refTitle,refModalVisible,ref_modal_loader,
        }
    }
};
</script>

<style scoped>
.tabs {
    display: flex;
    border-bottom: 1px solid #ccc;
}
.tab {
    padding: 2px 20px 2px 20px;
    cursor: pointer;
}

.tab.active {
    border-bottom: 2px solid #000;
}

.tab-content {
    padding: 1px;
}</style>
