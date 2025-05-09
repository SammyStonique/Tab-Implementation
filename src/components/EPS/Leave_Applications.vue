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
        <MovableModal v-model:visible="appModalVisible" :title="appTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="app_modal_loader" @showLoader="showAppModalLoader" @hideLoader="hideAppModalLoader" @closeModal="closeAppModal"
        >
            <DynamicForm 
                :fields="formFields1" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="approveLeaveApplication" @handleReset="handleAppReset"
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
        const app_modal_loader = ref('none');
        const emplComponentKey = ref(0);
        const levComponentKey = ref(0);
        const levSearchComponentKey = ref(0);
        const idField = 'leave_application_id';
        const addButtonLabel = ref('New Leave Application');
        const addingRight = ref('Adding Leave Applications');
        const rightsModule = ref('HR');
        const title = ref('Leave Application Details');
        const appTitle = ref('Approve Leave Application');
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
        const appModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('500px');
        const modal_width = ref('30vw');
        const employeeID = ref('-');
        const leaveID = ref('');
        const leaveSearchID = ref('');
        const applicationID = ref('');
        const requestedDays = ref(0);
        const computedRequestedDays = computed(()=> requestedDays);
        const leaveBalance = ref(0);
        const computedLeaveBalance = computed(()=> leaveBalance);
        const isEditing = computed(()=> store.state.Leave_Applications.isEditing);
        const selectedApplication = computed(()=> store.state.Leave_Applications.selectedApplication);
        const selectedEmployee = computed(()=> store.state.Leave_Applications.selectedEmployee);
        const selectedLeave = computed(()=> store.state.Leave_Applications.selectedLeave);
        const leaveArray = computed(() => store.state.Leave_Types.leaveArr);
        const employeeArray = computed(() => store.state.Employees.employeeArr);
        const excSaturday = computed(()=> store.state.Leave_Types.excSaturday);
        const excSunday = computed(()=> store.state.Leave_Types.excSunday);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Staff No", key: "staff_number"},
            {label: "Employee Name", key: "employee_name"},
            {label: "Leave Type", key: "leave_name"},
            {label: "Start Date", key:"start_date"},
            {label: "End Date", key:"end_date"},
            {label: "Applied", key:"days_requested"},
            {label: "Approved", key:"days_approved"},
            {label: "Status", key:"status"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Application', rightName: 'Editing Leave Applications'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Application', rightName: 'Deleting Leave Applications'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const employee_name_search = ref('');
        const staff_number_search = ref('');
        const status_search = ref('');
        const start_date_search = ref('');
        const end_date_search = ref('');
        const handleSelectedSearchLeave = async(option) =>{
            await store.dispatch('Leave_Types/handleSelectedLeaveType', option)
            leaveSearchID.value = store.state.Leave_Types.leaveID;
            
        };
        const clearSelectedSearchLeave = async() =>{
            await store.dispatch('Leave_Types/updateState', {leaveID: ''});
            leaveSearchID.value = store.state.Leave_Types.leaveID;
        };
        const searchFilters = ref([

            {  
                type:'search-dropdown', value: leaveSearchID.value, componentKey: levSearchComponentKey,
                selectOptions: leaveArray, optionSelected: handleSelectedSearchLeave,
                searchPlaceholder: 'Select Leave Type...', dropdownWidth: '200px',
                fetchData: store.dispatch('Leave_Types/fetchLeaveTypes', {company:companyID.value}),
                clearSearch: clearSelectedSearchLeave
            },
            {
                type:'dropdown', placeholder:"Status..", value: status_search, width:32,
                options: [{text:'Pending',value:'Pending'},{text:'Approved',value:'Approved'},{text:'Rejected',value:'Rejected'}]
            },
            {type:'date', placeholder:"Start Date...", value: start_date_search, width:32,},
            {type:'date', placeholder:"End Date...", value: end_date_search, width:32,},
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
            if(leaveID.value && userID.value){
                getLeaveBalance();
            }
            
        };
        const clearSelectedLeave = async() =>{
            await store.dispatch('Leave_Types/updateState', {leaveID: ''});
            leaveID.value = store.state.Leave_Types.leaveID;
        };
        const calculateDaysRequested = (value) =>{
            const start = new Date(formFields.value[1].value);
            const end = new Date(formFields.value[3].value);

            let differenceInDays = 0;
            let totalDays = 0;

            if(formFields.value[2].value == "Full Day" && formFields.value[4].value == "Full Day"){
                differenceInDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
                totalDays = differenceInDays;
            }
            else if(formFields.value[2].value == "Half Day" && formFields.value[4].value == "Half Day"){
                differenceInDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
                totalDays = differenceInDays - 1;
            }
            else if(formFields.value[2].value == "Full Day" && formFields.value[4].value == "Half Day"){
                differenceInDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
                totalDays = differenceInDays - 0.5;
            }
            else if(formFields.value[2].value == "Half Day" && formFields.value[4].value == "Full Day"){
                differenceInDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
                totalDays = differenceInDays - 0.5;
            }

            let saturdays = 0
            let sundays = 0
            for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
                const dayOfWeek = currentDate.getDay();
                if (dayOfWeek == 6){
                    saturdays += 1;
                }else if(dayOfWeek == 0){
                    sundays += 1;
                }
                
            }

            requestedDays.value = totalDays + 1

            if (excSaturday.value == "Yes"){
                requestedDays.value -= saturdays;
            }
            if (excSunday.value == "Yes"){
                requestedDays.value -= sundays;
            }
        }
        const getLeaveBalance = () => {
            let formData = {
                user: userID.value,
                leave: leaveID.value,
                company: companyID.value
            }
            axios.post('api/v1/get-leave-allocations/', formData)
            .then((response)=>{
                if(response.data.msg == "Failed"){
                    toast.error("Employee Has No Leave Allocation");
                    closeModal();
                }else{
                    leaveBalance.value = response.data.remaining_leave_days;
                }
                
            })
            .catch((error)=>{
                toast.error(error.message)
            })
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
                    type:'search-dropdown', label:"Leave Type", value: leaveValue.value, componentKey: levComponentKey,
                    selectOptions: leaveArray, optionSelected: handleSelectedLeave, required: true,
                    searchPlaceholder: 'Select Leave Type...', dropdownWidth: '500px', updateValue: selectedLeave.value,
                    clearSearch: clearSelectedLeave
                },
                { type: 'date', name: 'start_date',label: "Start Date", value: selectedApplication.value?.start_date || '', required: true },
                { type: 'dropdown', name: 'start_date_type',label: "Type", value: selectedApplication.value?.start_date_type || 'Full Day', placeholder: "", required: true, options: [{ text: 'Full Day', value: 'Full Day' }, { text: 'Half Day', value: 'Half Day' }] },
                { type: 'date', name: 'end_date',label: "End Date", value: selectedApplication.value?.end_date || '', required: true, method: calculateDaysRequested },
                { type: 'dropdown', name: 'end_date_type',label: "Type", value: selectedApplication.value?.end_date_type || 'Full Day', placeholder: "", required: true, options: [{ text: 'Full Day', value: 'Full Day' }, { text: 'Half Day', value: 'Half Day' }] },
                {type:'text-area', label:"Reason", value: selectedApplication.value?.reason || '', textarea_rows: '2', textarea_cols: '56', required: true},
                { type: 'text', name: 'days_requested',label: "Days Requested", value: selectedApplication.value?.days_requested || computedRequestedDays.value, required: false, disabled:true },
                { type: 'text', name: 'leave_balance',label: "Balance", value: selectedApplication.value?.leave_balance || computedLeaveBalance.value, required: false, disabled:true },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].label == 'Days Requested' || formFields.value[i].label == 'Balance'){
                    formFields.value[i].value = '0';
                }else{
                    formFields.value[i].value = '';
                }
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
                start_date: formFields.value[1].value,
                start_date_type: formFields.value[2].value,
                end_date: formFields.value[3].value,
                end_date_type: formFields.value[4].value,
                reason: formFields.value[5].value,
                days_requested: formFields.value[6].value,
                employee: employeeID.value,
                employee_id: employeeID.value,
                user: userID.value,
                leave_type: leaveID.value,
                leave_type_id: leaveID.value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(userID.value == '' || leaveValue.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else if(requestedDays.value > leaveBalance.value || requestedDays.value <= 0){
                toast.error('Invalid Requested Days');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Leave_Applications/createLeaveApplication', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Leave Application created successfully!');
                        handleReset();
                        emplComponentKey.value += 1;
                        levComponentKey.value += 1;
                        closeModal();
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
                start_date: formFields.value[1].value,
                start_date_type: formFields.value[2].value,
                end_date: formFields.value[3].value,
                end_date_type: formFields.value[4].value,
                reason: formFields.value[5].value,
                days_requested: formFields.value[6].value,
                employee: employeeValue.value,
                employee_id: employeeValue.value,
                user: userID.value,
                leave_type: leaveValue.value,
                leave_type_id: leaveValue.value,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown'  && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(userID.value == '' || leaveValue.value == ''){
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
                        closeModal();          
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
        };
        const formFields1 = ref([]);
        const updateFormFields1 = () =>{
            formFields1.value = [
                { type: 'date', name: 'date',label: "Date", value: "", required: true },
                { type: 'text', name: 'days_approved',label: "Days Approved", value: computedRequestedDays.value, required: true },
                { type: 'dropdown', name: 'status',label: "Status", value: '', placeholder: "", required: true, options: [{ text: 'Approve', value: 'Approved' }, { text: 'Reject', value: 'Rejected' }] },
                {type:'text-area', label:"Reason", value: '', textarea_rows: '2', textarea_cols: '56', required: true},

            ]
        };

        const handleAppReset = async() =>{
            for(let i=0; i < formFields1.value.length; i++){
                formFields1.value[i].value = '';
                
            }
            
        }
        
        const showAppModalLoader = () =>{
            app_modal_loader.value = "block";
        }
        const hideAppModalLoader = () =>{
            app_modal_loader.value = "none";
        }
        const approveLeaveApplication = async() =>{
            
        };
        const closeAppModal = async() =>{
            appModalVisible.value = false;
            handleAppReset();
            requestedDays.value = 0;
        }
        const removeApplication = async() =>{

        }
        const removeApplications = async() =>{
   
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
                start_date: start_date_search.value,
                end_date: end_date_search.value,
                leave_type: leaveSearchID.value,
                user: userID.value,
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
            levSearchComponentKey.value += 1;
            leaveSearchID.value = "";
            currentPage.value = 1;
            selectedValue.value = 50;
            staff_number_search.value = "";
            employee_name_search.value = "";
            status_search.value = "";
            start_date_search.value = "";
            end_date_search.value = "";
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
            requestedDays.value = 0;
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
                const approvalStatus = row['status'];
                if (approvalStatus != "Pending"){
                    toast.error(`Cannot Edit ${approvalStatus} Application!`)
                }else{
                    let formData = {
                        company: companyID.value,
                        leave_application: applicationID
                    }
                    await store.dispatch('Leave_Applications/fetchLeaveApplication',formData)
                    propModalVisible.value = true;
                    flex_basis.value = '1/3';
                    flex_basis_percentage.value = '33.333';
                }

            }else if(action == 'delete'){
                const applicationID = [row[idField]];
                const approvalStatus = row['status'];
                if (approvalStatus != "Pending"){
                    toast.error(`Cannot Delete ${approvalStatus} Application!`)
                }else{
                    let formData = {
                        company: companyID.value,
                        leave_application: applicationID
                    }
                    await store.dispatch('Leave_Applications/deleteLeaveApplication',formData).
                    then(()=>{
                        searchApplications();
                    })
                }
            }else if(action == 'approve'){
                const approvalStatus = row['status'];
                requestedDays.value = row['days_requested'];
                if (approvalStatus == "Approved"){
                    toast.error("Application Already Approved!")
                }else{
                    applicationID.value = row['leave_application_id'];
                    appModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                    updateFormFields1();
                }
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
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewApplication, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveApplication, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeApplication, removeApplications,addingRight,rightsModule,printApplicationsList,selectSearchQuantity,selectedValue,
            downloadApplicationsCSV,downloadApplicationsExcel,app_modal_loader,appTitle,appModalVisible,approveLeaveApplication,showAppModalLoader,hideAppModalLoader,
            formFields1,closeAppModal,handleAppReset
        }
    }
};
</script>