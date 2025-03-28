<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewEmployee"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchEmployees"
            @resetFilters="resetFilters"
            @importData="importEmployees"
            @removeItem="removeEmployee"
            @removeSelectedItems="removeEmployees"
            @printList="printTenantsList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="employeesList"
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
        <div class="mt-4 mb-8">
            <label for="">Select Employment Status:</label><br />
            
        </div>
        <div class="flex-1 basis-full px-2">
            <button @click="changeEmployeeStatus" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Transfer</button>
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
    name: 'Employees',
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
        const idField = 'employee_id';
        const addButtonLabel = ref('New Employee');
        const addingRight = ref('Adding Employees');
        const removingRight = ref('Deleting Employees');
        const rightsModule = ref('HR');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const employeesList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const showDetails = ref(false);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const detailsTitle = ref('Employee Documents');
        const transTitle = ref('Changing Employment Status');
        const transModalVisible = ref(false);
        const dropdownWidth = ref("500px")
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Staff No", key:"staff_number"},
            {label: "Employee Name", key:"employee_name"},
            {label: "Phone No", key: "phone_number"},
            {label: "Email", key:"email"},
            {label: "Pay Group", key:"pay_group"},
            {label: "Gender", key:"gender"},
            {label: "Title", key:"job_title"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Employee', rightName: 'Editing Employees'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Profile', rightName: 'Viewing Employee Profile'},
            {name: 'transfer', icon: 'fa fa-exchange', title: 'Change Employment Status', rightName: 'Editing Employees'},
            {name: 'invite', icon: 'fa fa-paper-plane', title: 'Invite Employee', rightName: 'Inviting Employees To Portal'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Employee', rightName: 'Deleting Employees'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const unitID = ref("");
        const employeeID = ref("");
        const dropdownOptions = ref([
            
        ]);
        
        const name_search = ref('');
        const staff_number_search = ref("");
        const active_status_search = ref("");
        const phone_number_search = ref("");
        const gender_search = ref("");
 
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:48,},
            {type:'text', placeholder:"Staff No...", value: staff_number_search, width:48,},
            {type:'text', placeholder:"Phone No...", value: phone_number_search, width:48,},
            {
                type:'dropdown', placeholder:"Gender..", value: gender_search, width:40,
                options: [{text:'Male',value:'Male'},{text:'Female',value:'Female'},{text:'Others',value:'Others'}]
            },
            {
                type:'dropdown', placeholder:"Status..", value: active_status_search, width:40,
                options: [{text:'Active',value:'Active'},{text:'Resigned',value:'Resigned'},{text:'Dismissed',value:'Dismissed'},{text:'Retired',value:'Retired'},{text:'Died',value:'Died'}]
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const importEmployees = () =>{
            store.commit('pageTab/ADD_PAGE', {'HR':'Import_Employees'})
            store.state.pageTab.hrActiveTab = 'Import_Employees';
        }
        const removeEmployee = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    employee: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Employees/deleteEmployee',formData)
                    if(response && response.status == 200){
                        toast.success("Employee Removed Succesfully");
                        searchEmployees();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Employee: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Employee") 
            }else{
                toast.error("Please Select An Employee To Remove")
            }
        }
        const removeEmployees = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    employee: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Employees/deleteEmployee',formData)
                    if(response && response.status == 200){
                        toast.success("Employee(s) Removed Succesfully");
                        searchPropertys();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Employee: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select An Employee To Remove")
            }
        };
        const showTransModalLoader = () =>{
            trans_modal_loader.value = "block";
        }
        const hideTransModalLoader = () =>{
            trans_modal_loader.value = "none";
        }
        const changeEmployeeStatus = async() =>{
            showTransModalLoader();
            let formData = {
                tenant_unit: unitID.value,
                tenant: employeeID.value,
                company: companyID.value
            }
            Swal.fire({
            title: "Are you sure?",
            text: `Do you wish to Exit Employee?`,
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes Exit Employeet!',
            cancelButtonText: 'Cancel!',
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            showLoaderOnConfirm: true,
            }).then((result) => {
            if (result.value) {
                axios.post(`api/v1/transfer-tenant-unit/`,formData)
                .then((response)=>{
                if(response.data.msg == "Success"){
                    Swal.fire("Employee exited succesfully!", {
                        icon: "success",
                    }); 
                    unitComponentKey.value += 1;
                    closeTransModal();
                    searchEmployees();
                }else{
                    Swal.fire({
                    title: "Error Exiting Employee",
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
                Swal.fire(`Employee has not been exited!`);
                hideTransModalLoader();
            }
            })     
        };
        const employeePortalInvitation = async(employee_id) =>{
            let formData = {
                employee: employee_id,
                company: companyID.value
            }
            Swal.fire({
            title: "Are you sure?",
            text: `Do you wish to Invite To Portal?`,
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes Invite Employee!',
            cancelButtonText: 'Cancel!',
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            showLoaderOnConfirm: true,
            }).then((result) => {
            if (result.value) {
                axios.post(`api/v1/invite-employee-portal/`,formData)
                .then((response)=>{
                if(response.data.msg == "Success"){
                    Swal.fire("Employee invited succesfully!", {
                        icon: "success",
                    }); 
                    searchEmployees();
                }else if(response.data.msg == "Exists"){
                    Swal.fire("Employee Already Exists!", {
                        icon: "warning",
                    }); 
                    searchEmployees();
                }else if(response.data.msg == "Failed"){
                    Swal.fire("Invalid Email Address!", {
                        icon: "warning",
                    }); 
                    searchEmployees();
                }else{
                    Swal.fire({
                    title: "Error Inviting Employee",
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
                })
            }else{
                Swal.fire(`Employee has not been invited!`);
            }
            })     
        };
        const closeTransModal = () =>{
            transModalVisible.value = false;
            employeeID.value = null;
            hideTransModalLoader();
        };
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchEmployees = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                employee_name: name_search.value,
                staff_number: staff_number_search.value,
                active_status: active_status_search.value,
                gender: gender_search.value,
                phone_number: phone_number_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/employees-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                employeesList.value = response.data.results;
                store.commit('Employees/LIST_EMPLOYEES', employeesList.value)
                propResults.value = response.data;
                propArrLen.value = employeesList.value.length;
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
            searchEmployees(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            name_search.value = "";
            gender_search.value = "";
            phone_number_search.value = "";
            active_status_search.value = "";
            staff_number_search.value = "";
            searchEmployees();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchEmployees();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchEmployees();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchEmployees();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchEmployees();
            // scrollToTop();
        }
        const addNewEmployee = async() =>{
            store.commit('Employees/initializeStore');
            await store.dispatch('Employees/updateState', {currentTab: 'Employee_Biodata',selectedEmployee: null,selectedEmployeeID: null,selectedSupervisor: null,selectedCurrency: null,selectedDepartment:null,selectedPayGroup: null,selectedBank: null,employeeDeductions: [],isEditing: false});
            store.commit('pageTab/ADD_PAGE', {'HR':'Employee_Details'});
            store.state.pageTab.hrActiveTab = 'Employee_Details';          
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                await store.dispatch('Employees/updateState', {currentTab: 'Employee_Biodata',selectedEmployee: null,selectedEmployeeID: null,selectedSupervisor: null,selectedCurrency: null,selectedDepartment:null,selectedPayGroup: null,selectedBank: null,employeeDeductions: [],isEditing: false});
                store.dispatch('Employees/updateState', {tenantCompanyID: companyID.value})
                const employeeID = row[idField];
                let formData = {
                    company: companyID.value,
                    employee: employeeID
                }
                await store.dispatch('Employees/fetchEmployee',formData).
                then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'HR':'Employee_Details'})
                    store.state.pageTab.hrActiveTab = 'Employee_Details';
                })
            }else if(action == 'delete'){
                const employeeID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    employee: employeeID
                }
                await store.dispatch('Employees/deleteEmployee',formData).
                then(()=>{
                    searchEmployees();
                })
            }else if(action == 'view'){
                await store.dispatch('Employees/updateState', {currentTab: 'Employee_Biodata',selectedEmployee: null,selectedEmployeeID: null,selectedSupervisor: null,selectedCurrency: null,selectedDepartment:null,selectedPayGroup: null,selectedBank: null,employeeDeductions: [],isEditing: false});
                const employeeID = row[idField];
                let formData = {
                    company: companyID.value,
                    employee: employeeID
                }
                await store.dispatch('Employees/fetchEmployee',formData)
                store.commit('pageTab/ADD_PAGE', {'HR':'Employee_Profile'})
                store.state.pageTab.hrActiveTab = 'Employee_Profile';
            }else if(action == 'transfer'){
                hideTransModalLoader();
                employeeID.value = row['employee_id'];
                    transModalVisible.value = true;
            }else if(action == 'invite'){
                let employee_id = row['employee_id'];
                employeePortalInvitation(employee_id);
            }
        };

        const handleDynamicOption = (option) =>{
            
        };
        
        const printEmployeesList = () =>{
            showLoader();
            let formData = {
                employee_name: name_search.value,
                staff_number: staff_number_search.value,
                active_status: active_status_search.value,
                gender: gender_search.value,
                phone_number: phone_number_search.value,
                company_id: companyID.value,
            } 

            axios
            .post("api/v1/export-employees-pdf/", formData, { responseType: 'blob' })
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
            searchEmployees();
            
        })
        return{
            searchEmployees,resetFilters, addButtonLabel, searchFilters, tableColumns, employeesList,dropdownWidth,displayButtons,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,flex_basis,flex_basis_percentage,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,showDetails,detailsTitle,hideDetails,
            submitButtonLabel, showModal, addNewEmployee, showLoader, loader, hideLoader, importEmployees, removeEmployee, removeEmployees,
            handleSelectionChange,addingRight,removingRight,rightsModule,printEmployeesList,selectSearchQuantity,selectedValue,
            modal_left,modal_top,modal_width,trans_modal_loader,transModalVisible,transTitle,showTransModalLoader,hideTransModalLoader,changeEmployeeStatus,closeTransModal,
            dropdownOptions,handleDynamicOption,
        }
    }
};
</script>