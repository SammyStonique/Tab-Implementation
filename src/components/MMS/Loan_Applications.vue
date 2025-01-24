<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewApplication"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchApplications"
            @resetFilters="resetFilters"
            @removeItem="removeApplication"
            @removeSelectedItems="removeApplications"
            @printList="printApplicationList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="applicationList"
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
            :showDetails="showDetails"
            :detailsTitle="detailsTitle"
            @hideDetails="hideDetails"
        />
    </div>
    <MovableModal v-model:visible="transModalVisible" :title="transTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="trans_modal_loader" @showLoader="showTransModalLoader" @hideLoader="hideTransModalLoader" @closeModal="closeTransModal">
        <div class="mt-4 mb-8 w-full">       
            <label for="">Date:</label><br />
            <input v-model="approval_date"  type="date" class="`bg-slate-50 rounded pl-3 border border-gray-400 text-base w-full`"/>
        </div>
        <div class="mb-8 w-full">         
            <label for="">Select Approval Status:</label><br />
            <select v-model="approval_status" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
                <option value="" selected disabled>Select Status</option>
                <option value="Approved">Approve</option>
                <option value="Rejected">Reject</option>
          </select>
        </div>
        <div class="flex-1 basis-full px-2">
            <button @click="approveLoan" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Save</button>
        </div>
    </MovableModal>

</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';
import MovableModal from '@/components/MovableModal.vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import Swal from 'sweetalert2';

export default{
    name: 'Loan_Applications',
    components:{
        PageComponent,MovableModal,SearchableDropdown,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const displayButtons = ref(true);
        const unitComponentKey = ref(0);
        const trans_modal_loader = ref('none');
        const approval_status = ref('');
        const approval_date = ref('');
        const idField = 'loan_application_id';
        const addButtonLabel = ref('New Application');
        const addingRight = ref('Adding Loan Applications');
        const rightsModule = ref('MMS');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const applicationList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const showDetails = ref(false);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const detailsTitle = ref('Application Documents');
        const transTitle = ref('Changing Application Status');
        const transModalVisible = ref(false);
        const dropdownWidth = ref("500px")
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('45vw');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"application_date"},
            {label: "Loan No", key:"loan_number"},
            {label: "Member Name", key:"member"},
            {label: "Product Name", key:"loan_product"},
            {label: "Applied Amnt", key: "applied_amount"},
            {label: "Approved Amnt", key: "approved_amount"},
            {label: "Status", key:"approval_status"},
            {label: "Loan Remarks", key:"loan_remarks"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Application', rightName: 'Editing Loan Applications'},
            {name: 'transfer', icon: 'fa fa-exchange', title: 'Change Application Status', rightName: 'Approving Loan Applications'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Application', rightName: 'Deleting Loan Applications'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const applicationID = ref("");
        const dropdownOptions = ref([
            
        ]);
        
        const name_search = ref('');
        const loan_number_search = ref("");
        const member_number_search = ref("");
 
        const searchFilters = ref([
            {type:'text', placeholder:"Loan No...", value: loan_number_search, width:48,},
            {type:'text', placeholder:"Member Name...", value: name_search, width:48,},
            {type:'text', placeholder:"Member No...", value: member_number_search, width:48,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const removeApplication = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    loan_application: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Loan_Applications/deleteLoanApplication',formData)
                    if(response && response.status == 200){
                        toast.success("Application Removed Succesfully");
                        searchApplications();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Application: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Application") 
            }else{
                toast.error("Please Select An Application To Remove")
            }
        }
        const removeApplications = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    loan_application: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Loan_Applications/deleteLoanApplication',formData)
                    if(response && response.status == 200){
                        toast.success("Application(s) Removed Succesfully");
                        searchPropertys();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Application: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select An Application To Remove")
            }
        };
        const showTransModalLoader = () =>{
            trans_modal_loader.value = "block";
        }
        const hideTransModalLoader = () =>{
            trans_modal_loader.value = "none";
        }
        const approveLoan = async() =>{
            showTransModalLoader();
            let formData = {
                loan_application: applicationID.value,
                company: companyID.value
            }
            Swal.fire({
            title: "Are you sure?",
            text: `Do you wish to Approve/Reject Loan?`,
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes, Approve/Reject Loan!',
            cancelButtonText: 'Cancel!',
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            showLoaderOnConfirm: true,
            }).then((result) => {
            if (result.value) {
                axios.post(`api/v1/approve-member-loan/`,formData)
                .then((response)=>{
                if(response.data.msg == "Success"){
                    Swal.fire("Success!", {
                        icon: "success",
                    }); 
                    unitComponentKey.value += 1;
                    closeTransModal();
                    searchApplications();
                }else{
                    Swal.fire({
                    title: "Error Approving/Rejecting Loan",
                    icon: "warning",
                    });
                }                   
                })
                .catch((error)=>{
                    console.log(error.message);
                    Swal.fire({
                        title: error.message,
                        icon: "warning",
                    });
                    hideTransModalLoader();
                })
            }else{
                Swal.fire(`Application has not been Approved/Rejected!`);
                hideTransModalLoader();
            }
            })     
        };
        const closeTransModal = () =>{
            transModalVisible.value = false;
            applicationID.value = null;
            hideTransModalLoader();
        };
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchApplications = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                member_name: name_search.value,
                loan_number: loan_number_search.value,
                member_number: member_number_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/loan-applications-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                applicationList.value = response.data.results;
                store.commit('Loan_Applications/LIST_APPLICATIONS', applicationList.value)
                propResults.value = response.data;
                propArrLen.value = applicationList.value.length;
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
            searchApplications(selectedValue.value);
        };
        const resetFilters = () =>{
            selectedValue.value = 50;
            name_search.value = "";
            member_number_search.value = "";
            loan_number_search.value = "";
            searchApplications();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchApplications();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchApplications();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchApplications();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchApplications();
            // scrollToTop();
        }
        const addNewApplication = async() =>{
            await store.dispatch('Loan_Products/updateState', {loanCharges: [], productMaxAmount: 0, installments:0});
            await store.dispatch('Loan_Guarantors/updateState', {memberArray: []});
            store.commit('Loan_Applications/initializeStore');
            await store.dispatch('Loan_Applications/updateState', {selectedApplication: null,selectedMember: null,selectedProduct: null,loanCharges: [],loanGuarantors: [],loanSchedules: [],isEditing: false});
            store.commit('pageTab/ADD_PAGE', {'MMS':'Loan_Application_Details'});
            store.state.pageTab.mmsActiveTab = 'Loan_Application_Details';          
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                await store.dispatch('Loan_Applications/updateState', {selectedApplication: null,selectedMember: null,selectedProduct: null,loanCharges: [],loanGuarantors: [],loanSchedules: [],isEditing: false});
                const applicationID = row[idField];

                let formData = {
                    company: companyID.value,
                    loan_application: applicationID
                }
                await store.dispatch('Loan_Applications/fetchLoanApplication',formData).
                then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'MMS':'Loan_Application_Details'})
                    store.state.pageTab.mmsActiveTab = 'Loan_Application_Details';
                })
            }else if(action == 'delete'){
                const applicationID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    loan_application: applicationID
                }
                await store.dispatch('Loan_Applications/deleteLoanApplication',formData).
                then(()=>{
                    searchApplications();
                })
            }else if(action == 'transfer'){
                hideTransModalLoader();
                applicationID.value = row['loan_application_id'];
                transModalVisible.value = true;
            }
        };

        const handleDynamicOption = (option) =>{
            
        };
        
        const printApplicationList = () =>{
            showLoader();
            let formData = {
                product_name: name_search.value,
                product_code: loan_number_search.value,
                active_status: member_number_search.value,
                company_id: companyID.value,
            } 

            axios
            .post("api/v1/export-loan-applications-pdf/", formData, { responseType: 'blob' })
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
        const hideDetails = async() =>{
            showDetails.value = false;
        };
        onBeforeMount(()=>{
            searchApplications();
            
        })
        return{
            searchApplications,resetFilters, addButtonLabel, searchFilters, tableColumns, applicationList,dropdownWidth,displayButtons,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,flex_basis,flex_basis_percentage,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,showDetails,detailsTitle,hideDetails,
            submitButtonLabel, showModal, addNewApplication, showLoader, loader, hideLoader, removeApplication, removeApplications,
            handleSelectionChange,addingRight,rightsModule,printApplicationList,selectSearchQuantity,selectedValue,
            modal_left,modal_top,modal_width,trans_modal_loader,transModalVisible,transTitle,showTransModalLoader,hideTransModalLoader,approveLoan,closeTransModal,
            dropdownOptions,handleDynamicOption,approval_status,approval_date
        }
    }
};
</script>