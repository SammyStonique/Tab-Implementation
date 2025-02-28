<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewAmmendment"
            :searchFilters="searchFilters"
            @searchPage="searchAmmendments"
            @resetFilters="resetFilters"
            @removeItem="removeAmmendment"
            @removeSelectedItems="removeAmmendments"
            @printList="printAmmendmentsList"
            @printExcel="downloadAmmendmentsExcel"
            @printCSV="downloadAmmendmentsCSV"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="ammendmentsList"
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
                :displayButtons="displayButtons" @handleSubmit="saveAmmendment" @handleReset="handleReset"
            />
        </MovableModal>
        <MovableModal v-model:visible="appModalVisible" :title="appTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="app_modal_loader" @showLoader="showAppModalLoader" @hideLoader="hideAppModalLoader" @closeModal="closeAppModal"
        >
            <DynamicForm 
                :fields="formFields1" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="approveLeaveAmmendment" @handleReset="handleAppReset"
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
    name: 'Leave_Ammendments',
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
        const idField = 'leave_ammendment_id';
        const addButtonLabel = ref('New Leave Ammendment');
        const addingRight = ref('Adding Leave Ammendments');
        const rightsModule = ref('HR');
        const title = ref('Leave Ammendment Details');
        const appTitle = ref('Approve Leave Ammendment');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const ammendmentsList = ref([]);
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
        const employeeID = ref('');
        const applicationID = ref('');
        const leaveID = ref('');
        const applicationSearchID = ref('');
        const ammendmentID = ref('');
        const requestedDays = ref(0);
        const computedRequestedDays = computed(()=> requestedDays);
        const leaveBalance = ref(0);
        const computedLeaveBalance = computed(()=> leaveBalance);
        const approvedDays = ref(0);
        const computedApprovedDays = computed(()=> approvedDays);
        const isEditing = computed(()=> store.state.Leave_Ammendments.isEditing);
        const selectedAmmendment = computed(()=> store.state.Leave_Ammendments.selectedAmmendment);
        const selectedEmployee = computed(()=> store.state.Leave_Ammendments.selectedEmployee);
        const selectedLeave = computed(()=> store.state.Leave_Ammendments.selectedLeave);
        const applicationArray = computed(() => store.state.Leave_Applications.applicationArr);
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
            {label: "Type", key:"ammendment_type"},
            {label: "Days", key:"days_ammended"},
            {label: "Reason", key: "reason"},
            {label: "Approved", key:"days_approved"},
            {label: "Status", key:"status"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Ammendment', rightName: 'Editing Leave Ammendments'},
            {name: 'approve', icon: 'fa fa-check-circle', title: 'Approve Ammendment', rightName: 'Approve Leave Ammendments'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Ammendment', rightName: 'Deleting Leave Ammendments'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const employee_name_search = ref('');
        const staff_number_search = ref('');
        const status_search = ref('');
        const start_date_search = ref('');
        const end_date_search = ref('');
        const handleSelectedSearchApplication = async(option) =>{
            await store.dispatch('Leave_Applications/handleSelectedLeaveApplication', option)
            applicationSearchID.value = store.state.Leave_Applications.applicationID;
            
        };
        const clearSelectedSearchApplication = async() =>{
            await store.dispatch('Leave_Applications/updateState', {applicationID: ''});
            applicationSearchID.value = store.state.Leave_Applications.applicationID;
        };
        const searchFilters = ref([
            {type:'text', placeholder:"Staff No...", value: staff_number_search, width:24,},
            {type:'text', placeholder:"Employee Name...", value: employee_name_search, width:44,},
            {  
                type:'search-dropdown', value: applicationSearchID.value, componentKey: levSearchComponentKey,
                selectOptions: applicationArray, optionSelected: handleSelectedSearchApplication,
                searchPlaceholder: 'Select Leave Application...', dropdownWidth: '300px',
                fetchData: store.dispatch('Leave_Applications/fetchLeaveApplications', {company:companyID.value, status:"Approved"}),
                clearSearch: clearSelectedSearchApplication
            },
            {
                type:'dropdown', placeholder:"Status..", value: status_search, width:24,
                options: [{text:'Pending',value:'Pending'},{text:'Approved',value:'Approved'},{text:'Rejected',value:'Rejected'}]
            },
            {type:'date', placeholder:"Start Date...", value: start_date_search, width:28,},
            {type:'date', placeholder:"End Date...", value: end_date_search, width:28,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedApplication = async(option) =>{
            await store.dispatch('Leave_Applications/handleSelectedLeaveApplication', option)
            applicationID.value = store.state.Leave_Applications.applicationID;
            leaveID.value = store.state.Leave_Applications.leaveID;
            employeeID.value = store.state.Leave_Applications.employeeID;
            approvedDays.value = store.state.Leave_Applications.approvedDays;
            if(leaveID.value && employeeID.value){
                getLeaveBalance();
            }
            
        };
        const clearSelectedApplication = async() =>{
            await store.dispatch('Leave_Applications/updateState', {applicationID: ''});
            applicationID.value = store.state.Leave_Applications.applicationID;
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
                employee: employeeID.value,
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
        const leaveValue = computed(() => {
           return (selectedAmmendment.value && selectedAmmendment.value.leave_application && !applicationID.value) ? selectedAmmendment.value.leave_application.leave_application_id : applicationID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Leave Application", value: leaveValue.value, componentKey: levComponentKey,
                    selectOptions: applicationArray, optionSelected: handleSelectedApplication, required: true,
                    searchPlaceholder: 'Select Leave Application...', dropdownWidth: '500px', updateValue: selectedLeave.value,
                    clearSearch: clearSelectedApplication
                },
                { type: 'date', name: 'start_date',label: "Start Date", value: selectedAmmendment.value?.start_date || '', required: true },
                { type: 'dropdown', name: 'start_date_type',label: "Type", value: selectedAmmendment.value?.start_date_type || 'Full Day', placeholder: "", required: true, options: [{ text: 'Full Day', value: 'Full Day' }, { text: 'Half Day', value: 'Half Day' }] },
                { type: 'date', name: 'end_date',label: "End Date", value: selectedAmmendment.value?.end_date || '', required: true, method: calculateDaysRequested },
                { type: 'dropdown', name: 'end_date_type',label: "Type", value: selectedAmmendment.value?.end_date_type || 'Full Day', placeholder: "", required: true, options: [{ text: 'Full Day', value: 'Full Day' }, { text: 'Half Day', value: 'Half Day' }] },
                {type:'text-area', label:"Reason", value: selectedAmmendment.value?.reason || '', textarea_rows: '2', textarea_cols: '56', required: true},
                { type: 'dropdown', name: 'ammendment_type',label: "Ammendment Type", value: selectedAmmendment.value?.ammendment_type || '', placeholder: "", required: true, options: [{ text: 'Recall', value: 'Recall' }, { text: 'Extension', value: 'Extension' }] },
                { type: 'text', name: 'days_ammended',label: "Days Ammended", value: selectedAmmendment.value?.days_ammended || computedRequestedDays.value, required: true},
                { type: 'text', name: 'approved_days',label: "Approved Days", value:  computedApprovedDays.value, required: false, disabled:true },
                { type: 'text', name: 'leave_balance',label: "Balance", value: selectedAmmendment.value?.leave_balance || computedLeaveBalance.value, required: false, disabled:true },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            emplComponentKey.value += 1;
            employeeID.value = '';
            levComponentKey.value += 1;
            applicationID.value = '';
            leaveID.value = "";
        }

        watch([selectedAmmendment, selectedEmployee, selectedLeave], () => {
            if (selectedAmmendment.value && selectedEmployee.value && selectedLeave.value) {
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
        const createAmmendment = async() =>{
            showModalLoader();
            let formData = {
                start_date: formFields.value[1].value,
                start_date_type: formFields.value[2].value,
                end_date: formFields.value[3].value,
                end_date_type: formFields.value[4].value,
                reason: formFields.value[5].value,
                ammendment_type: formFields.value[6].value,
                days_ammended: formFields.value[7].value,
                leave_application: applicationID.value,
                leave_application_id: applicationID.value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(leaveValue.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else if(((requestedDays.value > leaveBalance.value) && formFields.value[6].value == "Extension") || requestedDays.value <= 0){
                toast.error('Invalid Requested Days');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Leave_Ammendments/createLeaveAmmendment', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Leave Ammendment created successfully!');
                        handleReset();
                        emplComponentKey.value += 1;
                        levComponentKey.value += 1;
                        closeModal();
                    } else {
                        toast.error('An error occurred while creating the Leave Ammendment.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Leave Ammendment: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchAmmendments();
                }
            }
        }
        const updateAmmendment = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                leave_ammendment: selectedAmmendment.value.leave_ammendment_id,
                start_date: formFields.value[1].value,
                start_date_type: formFields.value[2].value,
                end_date: formFields.value[3].value,
                end_date_type: formFields.value[4].value,
                reason: formFields.value[5].value,
                ammendment_type: formFields.value[6].value,
                days_ammended: formFields.value[7].value,
                leave_application: leaveValue.value,
                leave_application_id: leaveValue.value,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown'  && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(leaveValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Leave_Ammendments/updateLeaveAmmendment', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        emplComponentKey.value += 1;
                        levComponentKey.value += 1;
                        toast.success("Leave Ammendment updated successfully!");    
                        closeModal();          
                    } else {
                        toast.error('An error occurred while updating the Leave Ammendment.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Leave Ammendment: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Leave_Ammendments/updateState",{selectedAmmendment:null})
                    searchAmmendments();
                }             
            }
        }
        const saveAmmendment = () =>{
            if(isEditing.value == true){
                updateAmmendment();
            }else{
                createAmmendment();
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
        const approveLeaveAmmendment = async() =>{
            showAppModalLoader();
            let formData = {
                leave_ammendment: ammendmentID.value,
                date: formFields1.value[0].value,
                days_approved: formFields1.value[1].value,
                status: formFields1.value[2].value,
                reason: formFields1.value[3].value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=0; i < (formFields1.value.length); i++){
                if(formFields1.value[i].value =='' && formFields1.value[i].required == true){
                    errors.value.push(formFields1.value[i].label);
                }
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideAppModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Leave_Ammendments/approveLeaveAmmendment', formData);
                    if (response && response.status === 200) {
                        hideAppModalLoader();
                        toast.success('Success!');
                        handleAppReset();
                    } else {
                        toast.error('An error occurred while Approving the Leave Ammendment.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to Approve Leave Ammendment: ' + error.message);
                } finally {
                    hideAppModalLoader();
                    searchAmmendments();
                }
            }
        };
        const closeAppModal = async() =>{
            appModalVisible.value = false;
            handleAppReset();
            requestedDays.value = 0;
        }
        const removeAmmendment = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    leave_ammendment: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Leave_Ammendments/deleteLeaveAmmendment',formData)
                    if(response && response.status == 200){
                        toast.success("Leave Ammendment Removed Succesfully");
                        searchAmmendments();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Leave Ammendment: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Leave Ammendment") 
            }else{
                toast.error("Please Select A Leave Ammendment To Remove")
            }
        }
        const removeAmmendments = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    leave_ammendment: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Leave_Ammendments/deleteLeaveAmmendment',formData)
                    if(response && response.status == 200){
                        toast.success("Leave Ammendment(s) Removed Succesfully");
                        searchAmmendments();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Leave Ammendment: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Leave Ammendment To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchAmmendments = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                status: status_search.value,
                start_date: start_date_search.value,
                end_date: end_date_search.value,
                leave_type: applicationSearchID.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/leave-ammendments-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                ammendmentsList.value = response.data.results;
                store.commit('Leave_Ammendments/LIST_AmmendmentS', ammendmentsList.value)
                propResults.value = response.data;
                propArrLen.value = ammendmentsList.value.length;
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
            searchAmmendments(selectedValue.value);
        };
        const resetFilters = () =>{
            levSearchComponentKey.value += 1;
            applicationSearchID.value = "";
            currentPage.value = 1;
            selectedValue.value = 50;
            staff_number_search.value = "";
            employee_name_search.value = "";
            status_search.value = "";
            start_date_search.value = "";
            end_date_search.value = "";
            searchAmmendments();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchAmmendments();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchAmmendments();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchAmmendments();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchAmmendments();
            // scrollToTop();
        }
        const addNewAmmendment = () =>{
            requestedDays.value = 0;
            store.dispatch("Leave_Ammendments/updateState",{selectedAmmendment:null, selectedEmployee:null, selectedLeave:null});
            emplComponentKey.value += 1;
            levComponentKey.value += 1;
            handleReset();
            updateFormFields();
            propModalVisible.value = true;
            store.dispatch("Leave_Ammendments/updateState",{isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const ammendmentID = row['leave_ammendment_id'];
                let formData = {
                    company: companyID.value,
                    leave_ammendment: ammendmentID
                }
                await store.dispatch('Leave_Ammendments/fetchLeaveAmmendment',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const ammendmentID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    leave_ammendment: ammendmentID
                }
                await store.dispatch('Leave_Ammendments/deleteLeaveAmmendment',formData).
                then(()=>{
                    searchAmmendments();
                })
            }else if(action == 'approve'){
                const approvalStatus = row['status'];
                requestedDays.value = row['days_ammended'];
                if (approvalStatus == "Approved"){
                    toast.error("Ammendment Already Approved!")
                }else{
                    ammendmentID.value = row['leave_ammendment_id'];
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
        const printAmmendmentsList = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                status: status_search.value,
                company_id: companyID.value,
            } 

            axios
            .post("api/v1/export-leave-ammendments-pdf/", formData, { responseType: 'blob' })
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
        const downloadAmmendmentsExcel = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                status: status_search.value,
                company_id: companyID.value,
            }
            axios.post("api/v1/export-leave-ammendments-excel/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Leave Ammendments.xlsx');
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
        const downloadAmmendmentsCSV = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                status: status_search.value,
                company_id: companyID.value,
            }
            axios.post("api/v1/export-leave-ammendments-csv/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Leave Ammendments.csv');
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
            searchAmmendments();
            
        })
        return{
            title, searchAmmendments,resetFilters, addButtonLabel, searchFilters, tableColumns, ammendmentsList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewAmmendment, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveAmmendment, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeAmmendment, removeAmmendments,addingRight,rightsModule,printAmmendmentsList,selectSearchQuantity,selectedValue,
            downloadAmmendmentsCSV,downloadAmmendmentsExcel,app_modal_loader,appTitle,appModalVisible,approveLeaveAmmendment,showAppModalLoader,hideAppModalLoader,
            formFields1,closeAppModal,handleAppReset
        }
    }
};
</script>