<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewAllocation"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchAllocations"
            @resetFilters="resetFilters"
            @removeItem="removeAllocation"
            @removeSelectedItems="removeAllocations"
            @printList="printAllocationsList"
            @printExcel="downloadAllocationsExcel"
            @printCSV="downloadAllocationsCSV"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="allocationsList"
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
                :displayButtons="displayButtons" @handleSubmit="saveAllocation" @handleReset="handleReset"
            />
        </MovableModal>
        <MovableModal v-model:visible="allocModalVisible" :title="allocTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="alloc_modal_loader" @showLoader="showAllocModalLoader" @hideLoader="hideAllocModalLoader" @closeModal="closeAllocModal">
            <DynamicForm 
                :fields="formFields1" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="autoGenerateAllocations" @handleReset="handleAllocReset"
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
import { useDateFormatter } from '@/composables/DateFormatter';
import PrintJS from 'print-js';

export default{
    name: 'Leave_Allocations',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const { getYear } = useDateFormatter();
        const { getMonth } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('none');
        const modal_loader = ref('none');
        const alloc_modal_loader = ref('none');
        const emplComponentKey = ref(0);
        const levComponentKey = ref(0);
        const idField = 'leave_balance_id';
        const addButtonLabel = ref('New Leave Allocation');
        const addingRight = ref('Adding Leave Allocations');
        const rightsModule = ref('HR');
        const title = ref('Leave Allocation Details');
        const allocTitle = ref('Auto Generate Allocations');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const allocationsList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const allocModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('500px');
        const modal_width = ref('30vw');
        const employeeID = ref('');
        const leaveID = ref('');
        const maxLeaveDays = ref(0);
        const computedLeaveDays = computed(()=> maxLeaveDays);
        const isEditing = computed(()=> store.state.Leave_Allocations.isEditing);
        const selectedAllocation = computed(()=> store.state.Leave_Allocations.selectedAllocation);
        const selectedEmployee = computed(()=> store.state.Leave_Allocations.selectedEmployee);
        const selectedLeave = computed(()=> store.state.Leave_Allocations.selectedLeave);
        const leaveArray = computed(() => store.state.Leave_Types.leaveArr);
        const employeeArray = computed(() => store.state.Employees.employeeArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Staff No", key: "staff_number"},
            {label: "Employee Name", key: "employee_name"},
            {label: "Leave Type", key: "leave_name"},
            {label: "Max Alloc.", key:"maximum_allocation"},
            {label: "Year", key:"year"},
            {label: "Start Date", key:"start_date"},
            {label: "End Date", key:"end_date"},
            {label: "Bal B/f", key:"balance_bf"},
            {label: "Alloted", key:"total_leave_days"},
            {label: "Entitled", key:"current_entitlement"},
            {label: "Used", key:"used_leave_days"},
            {label: "Balance", key:"remaining_leave_days"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Leave Allocations', rightName: 'Editing Leave Allocations'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Leave Allocations', rightName: 'Deleting Leave Allocations'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const employee_name_search = ref('');
        const staff_number_search = ref('');
        const year_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Staff No...", value: staff_number_search, width:32,},
            {type:'text', placeholder:"Employee Name...", value: employee_name_search, width:64,},
            {type:'text', placeholder:"Year...", value: year_search, width:32,},

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
            maxLeaveDays.value = store.state.Leave_Types.leaveMaxDays;
        };
        const clearSelectedLeave = async() =>{
            await store.dispatch('Leave_Types/updateState', {leaveID: '', leaveMaxDays:0});
            leaveID.value = store.state.Leave_Types.leaveID;
            maxLeaveDays.value = store.state.Leave_Types.leaveMaxDays;
        };
        const formFields = ref([]);
        const employeeValue = computed(() => {
           return (selectedAllocation.value && selectedAllocation.value.employee && !employeeID.value) ? selectedAllocation.value.employee.employee_id : employeeID.value;

        });
        const leaveValue = computed(() => {
           return (selectedAllocation.value && selectedAllocation.value.leave_type && !leaveID.value) ? selectedAllocation.value.leave_type.leave_type_id : leaveID.value;

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
                { type: 'text', name: 'total_leave_days',label: "Allocated Days", value: selectedAllocation.value?.total_leave_days || '0', required: true },
                { type: 'text', name: 'max_allocations',label: "Max Allocations", value: computedLeaveDays.value, required: false, disabled:true },
                { type: 'text', name: 'used_leave_days',label: "Used Days", value: selectedAllocation.value?.used_leave_days || '0', required: false, disabled:true },
                { type: 'text', name: 'remaining_leave_days',label: "Balance", value: selectedAllocation.value?.remaining_leave_days || '0', required: false, disabled:true },
                { type: 'text', name: 'year',label: "Year", value: selectedAllocation.value?.year || getYear(current_date), required: true },
                { type: 'text', name: 'balance_bf',label: "Balance B/f", value: selectedAllocation.value?.balance_bf || '0', required: true },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].label == "Year"){
                    formFields.value[i].value = getYear(current_date);
                }else{
                    formFields.value[i].value = '';
                }
                
            }
            emplComponentKey.value += 1;
            employeeID.value = '';
            levComponentKey.value += 1;
            leaveID.value = '';
        }


        watch([selectedAllocation, selectedEmployee, selectedLeave], () => {
            if (selectedAllocation.value && selectedEmployee.value && selectedLeave.value) {
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
        };
        const formFields1 = ref([]);
        const updateFormFields1 = () => {
            formFields1.value = [
                { type: 'text', name: 'year',label: "Year", value: getYear(current_date), required: true },
            ];
        };
        const showAllocModalLoader = () =>{
            alloc_modal_loader.value = "block";
        }
        const hideAllocModalLoader = () =>{
            alloc_modal_loader.value = "none";
        };
        const closeAllocModal = () =>{
            allocModalVisible.value = false;
        };
        const createAllocation = async() =>{
            showModalLoader();
            let formData = {
                total_leave_days: formFields.value[2].value,
                used_leave_days: formFields.value[4].value,
                year: formFields.value[6].value,
                balance_bf: formFields.value[7].value,
                employee: employeeID.value,
                employee_id: employeeID.value,
                leave_type: leaveID.value,
                leave_type_id: leaveID.value,
                start_date: null,
                end_date: null,
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
                    const response = await store.dispatch('Leave_Allocations/createLeaveAllocation', formData);
                    if (response && response.status === 201 && response.data.msg != 'Exists') {
                        hideModalLoader();
                        toast.success('Leave Allocation created successfully!');
                        handleReset();
                        emplComponentKey.value += 1;
                        levComponentKey.value += 1;
                    }else if(response && response.data.msg == 'Exists'){
                        toast.error('Employee Already Has Leave Allocation.');
                    }
                    else {
                        toast.error('An error occurred while creating the Leave Allocation.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Leave Allocation: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchAllocations();
                }
            }
        }
        const updateAllocation = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                leave_balance: selectedAllocation.value.leave_balance_id,
                start_date: selectedAllocation.value.start_date,
                end_date: selectedAllocation.value.end_date,
                total_leave_days: formFields.value[2].value,
                used_leave_days: formFields.value[4].value,
                year: formFields.value[6].value,
                balance_bf: formFields.value[7].value,
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
                    const response = await store.dispatch('Leave_Allocations/updateLeaveAllocation', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        emplComponentKey.value += 1;
                        levComponentKey.value += 1;
                        toast.success("Leave Allocation updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Leave Allocation.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Leave Allocation: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Leave_Allocations/updateState",{selectedAllocation:null})
                    searchAllocations();
                }             
            }
        }
        const saveAllocation = () =>{
            if(isEditing.value == true){
                updateAllocation();
            }else{
                createAllocation();
            }
        }
        const removeAllocation = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    leave_balance: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Leave_Allocations/deleteLeaveAllocation',formData)
                    if(response && response.status == 200){
                        toast.success("Leave Allocation Removed Succesfully");
                        searchAllocations();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Leave Allocation: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Leave Allocation") 
            }else{
                toast.error("Please Select A Leave Allocation To Remove")
            }
        }
        const removeAllocations = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    leave_balance: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Leave_Allocations/deleteLeaveAllocation',formData)
                    if(response && response.status == 200){
                        toast.success("Leave Allocation(s) Removed Succesfully");
                        searchAllocations();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Leave Allocation: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Leave Allocation To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchAllocations = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                company_id: companyID.value,
                year: year_search.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/leave-allocations-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                allocationsList.value = response.data.results;
                store.commit('Leave_Allocations/LIST_ALLOCATIONS', allocationsList.value)
                propResults.value = response.data;
                propArrLen.value = allocationsList.value.length;
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
            searchAllocations(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            staff_number_search.value = "";
            employee_name_search.value = "";
            year_search.value = "";
            searchAllocations();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchAllocations();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchAllocations();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchAllocations();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchAllocations();
            // scrollToTop();
        }
        const addNewAllocation = () =>{
            store.dispatch("Leave_Allocations/updateState",{selectedAllocation:null, selectedEmployee:null, selectedLeave:null});
            emplComponentKey.value += 1;
            levComponentKey.value += 1;
            handleReset();
            updateFormFields();
            propModalVisible.value = true;
            store.dispatch("Leave_Allocations/updateState",{isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const allocationID = row['leave_balance_id'];
                let formData = {
                    company: companyID.value,
                    leave_balance: allocationID
                }
                await store.dispatch('Leave_Allocations/fetchLeaveAllocation',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const allocationID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    leave_balance: allocationID
                }
                await store.dispatch('Leave_Allocations/deleteLeaveAllocation',formData).
                then(()=>{
                    searchAllocations();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const dropdownOptions = ref([
            {label: 'Autogenerate Allocations', action: 'generate-allocations'},
        ]);
        const autoGenerateAllocations = async() =>{
            showAllocModalLoader();
                let formData = {
                    year: formFields1.value[0].value,
                    company: companyID.value
                }
                await axios.post('api/v1/auto-generate-leave-allocations/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Allocations Generated!")
                    }else{
                        toast.error(response.data.msg)
                    }
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideAllocModalLoader();
                })
        };
        const handleDynamicOption = async(option) =>{
            if(option == 'generate-allocations'){
                allocModalVisible.value = true;
                updateFormFields1()
            }
        };
        const printAllocationsList = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                company_id: companyID.value,
            } 

            axios
            .post("api/v1/export-leave-allocations-pdf/", formData, { responseType: 'blob' })
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
        const downloadAllocationsExcel = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                status: status_search.value,
                company_id: companyID.value,
            }
            axios.post("api/v1/export-leave-allocations-excel/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Leave Allocations.xlsx');
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
        const downloadAllocationsCSV = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                company_id: companyID.value,
            }
            axios.post("api/v1/export-leave-allocations-csv/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Leave Allocations.csv');
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
            searchAllocations();
            
        })
        return{
            title, searchAllocations,resetFilters, addButtonLabel, searchFilters, tableColumns, allocationsList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,dropdownOptions,handleDynamicOption,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewAllocation, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveAllocation, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            alloc_modal_loader,allocTitle,formFields1,allocModalVisible,showAllocModalLoader,hideAllocModalLoader,closeAllocModal,autoGenerateAllocations,
            removeAllocation, removeAllocations,addingRight,rightsModule,printAllocationsList,selectSearchQuantity,selectedValue,
            downloadAllocationsCSV,downloadAllocationsExcel
        }
    }
};
</script>