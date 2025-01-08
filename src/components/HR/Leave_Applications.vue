<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewApplication"
            :searchFilters="searchFilters"
            @searchPage="searchApplications"
            @resetFilters="resetFilters"
            @removeItem="removeApplication"
            @removeSelectedItems="removeApplications"
            @printList="printApplicationsList"
            @printExcel="downloadApplicationsExcel"
            @printCSV="downloadApplicationsCSV"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="applicationsList"
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
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="saveApplication" @handleReset="handleReset"
            />
        </MovableModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';

export default{
    name: 'Leave_Applications',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const emplComponentKey = ref(0);
        const levComponentKey = ref(0);
        const idField = 'leave_application_id';
        const addButtonLabel = ref('New Leave Application');
        const addingRight = ref('Adding Leave Applications');
        const rightsModule = ref('HR');
        const title = ref('Leave Application Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const applicationsList = ref([]);
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
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('500px');
        const modal_width = ref('30vw');
        const employeeID = ref('');
        const leaveID = ref('');
        const requestedDays = ref(0);
        const computedRequestedDays = computed(()=> requestedDays);
        const isEditing = computed(()=> store.state.Leave_Applications.isEditing);
        const selectedApplication = computed(()=> store.state.Leave_Applications.selectedApplication);
        const selectedEmployee = computed(()=> store.state.Leave_Applications.selectedEmployee);
        const selectedLeave = computed(()=> store.state.Leave_Applications.selectedLeave);
        const leaveArray = computed(() => store.state.Leave_Types.leaveArr);
        const employeeArray = computed(() => store.state.Employees.employeeArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Staff No", key: "staff_number"},
            {label: "Employee Name", key: "employee_name"},
            {label: "Leave Type", key: "leave_name"},
            {label: "Start Date", key:"start_date"},
            {label: "End Date", key:"end_date"},
            {label: "Days", key:"days_requested"},
            {label: "Status", key:"status"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Leave Applications', rightName: 'Editing Leave Applications'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Leave Applications', rightName: 'Deleting Leave Applications'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const employee_name_search = ref('');
        const staff_number_search = ref('');
        const status_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Staff No...", value: staff_number_search, width:32,},
            {type:'text', placeholder:"Employee Name...", value: employee_name_search, width:64,},
            {
                type:'dropdown', placeholder:"Status..", value: status_search, width:56,
                options: [{text:'Pending',value:'Pending'},{text:'Approved',value:'Approved'},{text:'Rejected',value:'Rejected'}]
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedEmployee = async(option) =>{
            await store.dispatch('Employees/handleSelectedEmployee', option)
            employeeID.value = store.state.Employees.employeeID;
        };
        const clearSelectedEmployee = async() =>{
            await store.dispatch('Employees/updateState', {employeeID: ''});
            employeeID.value = store.state.Employees.employeeID;
        };
        const handleSelectedLeave = async(option) =>{
            await store.dispatch('Leave_Types/handleSelectedLeaveType', option)
            leaveID.value = store.state.Leave_Types.leaveID;
        };
        const clearSelectedLeave = async() =>{
            await store.dispatch('Leave_Types/updateState', {leaveID: ''});
            leaveID.value = store.state.Leave_Types.leaveID;
        };
        const calculateDaysRequested = (value) =>{
            const start = new Date(formFields.value[2].value);
            const end = new Date(formFields.value[4].value);
            
            // Calculate the difference in days
            const differenceInTime = end.getTime() - start.getTime();
            const differenceInDays = differenceInTime / (1000 * 3600 * 24); // Convert from milliseconds to days
            
            requestedDays.value = differenceInDays + 1;
        }
        const formFields = ref([]);
        const employeeValue = computed(() => {
           return (selectedApplication.value && selectedApplication.value.employee && !employeeID.value) ? selectedApplication.value.employee.employee_id : employeeID.value;

        });
        const leaveValue = computed(() => {
           return (selectedApplication.value && selectedApplication.value.leave_type && !leaveID.value) ? selectedApplication.value.leave_type.leave_type_id : leaveID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Employee", value: employeeValue.value, componentKey: emplComponentKey,
                    selectOptions: employeeArray, optionSelected: handleSelectedEmployee, required: true,
                    searchPlaceholder: 'Select Employee...', dropdownWidth: '500px', updateValue: selectedEmployee.value,
                    fetchData: store.dispatch('Employees/fetchEmployees', {company:companyID.value}),
                    clearSearch: clearSelectedEmployee
                },
                {  
                    type:'search-dropdown', label:"Leave Type", value: employeeValue.value, componentKey: levComponentKey,
                    selectOptions: leaveArray, optionSelected: handleSelectedLeave, required: true,
                    searchPlaceholder: 'Select Leave Type...', dropdownWidth: '500px', updateValue: selectedLeave.value,
                    fetchData: store.dispatch('Leave_Types/fetchLeaveTypes', {company:companyID.value}),
                    clearSearch: clearSelectedLeave
                },
                { type: 'date', name: 'start_date',label: "Start Date", value: selectedApplication.value?.start_date || '', required: true },
                { type: 'dropdown', name: 'start_date_type',label: "Type", value: selectedApplication.value?.start_date_type || 'Full Day', placeholder: "", required: true, options: [{ text: 'Full Day', value: 'Full Day' }, { text: 'Half Day', value: 'Half Day' }] },
                { type: 'date', name: 'end_date',label: "End Date", value: selectedApplication.value?.end_date || '', required: true },
                { type: 'dropdown', name: 'end_date_type',label: "Type", value: selectedApplication.value?.end_date_type || '', method: calculateDaysRequested, placeholder: "", required: true, options: [{ text: 'Full Day', value: 'Full Day' }, { text: 'Half Day', value: 'Half Day' }] },
                {type:'text-area', label:"Reason", value: selectedApplication.value?.reason || '', textarea_rows: '2', textarea_cols: '56', required: true},
                { type: 'text', name: 'days_requested',label: "Days Requested", value: selectedApplication.value?.days_requested || computedRequestedDays.value, required: false, disabled:true },
                { type: 'text', name: 'leave_balance',label: "Balance", value: selectedApplication.value?.leave_balance || '0', required: false, disabled:true },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            emplComponentKey.value += 1;
            employeeID.value = '';
            levComponentKey.value += 1;
            leaveID.value = '';
        }

        watch([selectedApplication, selectedEmployee, selectedLeave], () => {
            if (selectedApplication.value && selectedEmployee.value && selectedLeave.value) {
                emplComponentKey.value += 1;
                levComponentKey.value += 1;
                updateFormFields();
            }
            
        }, { immediate: true });
        
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createApplication = async() =>{
            showModalLoader();
            let formData = {
                start_date: formFields.value[2].value,
                start_date_type: formFields.value[3].value,
                end_date: formFields.value[4].value,
                end_date_type: formFields.value[5].value,
                reason: formFields.value[6].value,
                employee: employeeID.value,
                employee_id: employeeID.value,
                leave_type: leaveID.value,
                leave_type_id: leaveID.value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=2; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(employeeValue.value == '' || leaveValue.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Leave_Applications/createLeaveApplication', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Leave Application created successfully!');
                        handleReset();
                        emplComponentKey.value += 1;
                        levComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Leave Application.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Leave Application: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchApplications();
                }
            }
        }
        const updateApplication = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                leave_application: selectedApplication.value.leave_application_id,
                start_date: formFields.value[2].value,
                start_date_type: formFields.value[3].value,
                end_date: formFields.value[4].value,
                end_date_type: formFields.value[5].value,
                reason: formFields.value[6].value,
                employee: employeeValue.value,
                employee_id: employeeValue.value,
                leave_type: leaveValue.value,
                leave_type_id: leaveValue.value,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown'  && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(employeeValue.value == '' || leaveValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Leave_Applications/updateLeaveApplication', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        emplComponentKey.value += 1;
                        levComponentKey.value += 1;
                        toast.success("Leave Application updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Leave Application.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Leave Application: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Leave_Applications/updateState",{selectedApplication:null})
                    searchApplications();
                }             
            }
        }
        const saveApplication = () =>{
            if(isEditing.value == true){
                updateApplication();
            }else{
                createApplication();
            }
        }
        const removeApplication = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    leave_application: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Leave_Applications/deleteLeaveApplication',formData)
                    if(response && response.status == 200){
                        toast.success("Leave Application Removed Succesfully");
                        searchApplications();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Leave Application: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Leave Application") 
            }else{
                toast.error("Please Select A Leave Application To Remove")
            }
        }
        const removeApplications = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    leave_application: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Leave_Applications/deleteLeaveApplication',formData)
                    if(response && response.status == 200){
                        toast.success("Leave Application(s) Removed Succesfully");
                        searchApplications();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Leave Application: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Leave Application To Remove")
            }
        }
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
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                status: status_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/leave-applications-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                applicationsList.value = response.data.results;
                store.commit('Leave_Applications/LIST_APPLICATIONS', applicationsList.value)
                propResults.value = response.data;
                propArrLen.value = applicationsList.value.length;
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
            staff_number_search.value = "";
            employee_name_search.value = "";
            status_search.value = "";
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
        const addNewApplication = () =>{
            store.dispatch("Leave_Applications/updateState",{selectedApplication:null, selectedEmployee:null, selectedLeave:null});
            emplComponentKey.value += 1;
            levComponentKey.value += 1;
            handleReset();
            updateFormFields();
            propModalVisible.value = true;
            store.dispatch("Leave_Applications/updateState",{isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const applicationID = row['leave_application_id'];
                let formData = {
                    company: companyID.value,
                    leave_application: applicationID
                }
                await store.dispatch('Leave_Applications/fetchLeaveApplication',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const applicationID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    leave_application: applicationID
                }
                await store.dispatch('Leave_Applications/deleteLeaveApplication',formData).
                then(()=>{
                    searchApplications();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printApplicationsList = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                status: status_search.value,
                company_id: companyID.value,
            } 

            axios
            .post("api/v1/export-leave-applications-pdf/", formData, { responseType: 'blob' })
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
        const downloadApplicationsExcel = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                status: status_search.value,
                company_id: companyID.value,
            }
            axios.post("api/v1/export-leave-applications-excel/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Leave Applications.xlsx');
                document.body.appendChild(link);
                link.click();
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        const downloadApplicationsCSV = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                status: status_search.value,
                company_id: companyID.value,
            }
            axios.post("api/v1/export-leave-applications-csv/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Leave Applications.csv');
                document.body.appendChild(link);
                link.click();
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        onBeforeMount(()=>{
            searchApplications();
            
        })
        return{
            title, searchApplications,resetFilters, addButtonLabel, searchFilters, tableColumns, applicationsList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewApplication, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveApplication, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeApplication, removeApplications,addingRight,rightsModule,printApplicationsList,selectSearchQuantity,selectedValue,
            downloadApplicationsCSV,downloadApplicationsExcel
        }
    }
};
</script>