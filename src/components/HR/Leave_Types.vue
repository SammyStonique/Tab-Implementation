<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewLeave"
            :searchFilters="searchFilters"
            @searchPage="searchLeaves"
            @resetFilters="resetFilters"
            @removeItem="removeLeave"
            @removeSelectedItems="removeLeaves"
            @printList="printList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="leavesList"
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
                :displayButtons="displayButtons" @handleSubmit="saveLeave" @handleReset="handleReset"
            />
        </MovableModal>
        <MovableModal v-model:visible="holModalVisible" :title="holTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="hol_modal_width"
            :loader="hol_modal_loader" @showLoader="showHolModalLoader" @hideLoader="hideHolModalLoader" @closeModal="closeHolModal">
            <div class="relative mb-6 mt-3 min-w-[500px]">
                <SearchableDropdown
                    :key="holComponentKey"
                    :options="holidaysArr"
                    :dropdownWidth="dropdownWidth"
                    @option-selected="handleSelectedHoliday"
                    @clearSearch="clearSelectedHoliday"   
                    @fetchData="fetchHolidays"                              
                />
            </div>
            <div class="min-h-[300px] min-w-[500px]">
                <DynamicTable :columns="holidaysColumns" :rows="holidaysRows" :idField="holidayIdField" @selection-changed="selectionHolidayChanged" :rightsModule="rightsModule" :actions="holidayActions" @action-click="handleHolidaysActions" />
            </div>
    </MovableModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import DynamicTable from '../DynamicTable.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import Swal from 'sweetalert2';

export default{
    name: 'Leave_Types',
    components:{
        PageComponent, MovableModal,DynamicForm,SearchableDropdown,DynamicTable
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const hol_modal_loader = ref('none');
        const idField = 'leave_type_id';
        const holidayIdField = 'holiday_id';
        const addButtonLabel = ref('New Leave Type');
        const title = ref('Leave Type Details');
        const holTitle = ref('Assign Holidays');
        const holidaysArr = computed(() => store.state.Holidays.holidayArr);
        const addingRight = ref('Adding Leave Types');
        const rightsModule = ref('HR');
        const submitButtonLabel = ref('Add');
        const holComponentKey = ref(0);
        const selectedIds = ref([]);
        const selectedHolidays = ref([]);
        const selectedValue = ref(50);
        const leavesList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const holModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const dropdownWidth = ref("320px")
        const modal_top = ref('250px');
        const modal_left = ref('500px');
        const modal_width = ref('30vw');
        const hol_modal_width = ref('35vw');
        const isEditing = computed(()=> store.state.Leave_Types.isEditing);
        const selectedLeave = computed(()=> store.state.Leave_Types.selectedLeave);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"leave_name"},
            {label: "Paid Leave", key: "paid_leave"},
            {label: "Carry Over", key:"carry_over"},
            {label: "Calculation Mode", key:"calculation_mode"},
            {label: "Max Accrual", key:"max_accrual"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Leave Type', rightName: 'Editing Leave Types'},
            {name: 'assign-holidays', icon: 'fa fa-tasks', title: 'Assign Holiday', rightName: 'Editing Leave Types'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Leave Type', rightName: 'Deleting Leave Types'},
        ]);
        const holidaysColumns = ref([
            {type: "checkbox"},
            {label: "Holiday Name", key:"holiday_name",type: "text", editable: false},
        ]);
        const holidayActions = ref([
            {name: 'add-holiday', icon: 'fa fa-check', title: 'Add Holiday', rightName: 'Editing Leave Types'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Holiday', rightName: 'Editing Leave Types'},
        ]);
        const holidaysRows = computed(()=> store.state.Holidays.leaveHolidaysArray);
        const companyID = computed(()=> store.state.userData.company_id);
        const leaveID = ref(null);
        const name_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:60,},
        ]);
        const fetchHolidays = async() =>{
            await store.dispatch('Holidays/fetchHolidays', {company:companyID.value});
        };
        const handleSelectedHoliday = async(option) =>{
            await store.dispatch('Holidays/handleSelectedHoliday', option)
            holComponentKey.value += 1;
        };
        const clearSelectedHoliday= async() =>{
            await store.dispatch('Holidays/updateState', {holidayID: '', holidayName: ""});
        };
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const selectionHolidayChanged = (ids) => {
            selectedHolidays.value = ids;
        };
        const showHolModalLoader = () =>{
            hol_modal_loader.value = "block";
        }
        const hideHolModalLoader = () =>{
            hol_modal_loader.value = "none";
        };
        const fetchLeaveHolidays = async(leaveID) =>{
            let formData = {
                leave: leaveID,
                company: companyID.value
            }
            axios.post("api/v1/custom-holidays-search/", formData)
            .then((response)=>{
                store.dispatch('Holidays/updateState', {leaveHolidaysArray: response.data.holidays})
            })
            .catch((error)=>{
                console.log(error.message)
            })
        };
        const handleHolidaysActions = (rowIndex, action, row) =>{
            if(action == "add-holiday"){
                let formData = {
                    leave: leaveID.value,
                    leave_id: leaveID.value,
                    holiday: row['holiday_id'],
                    holiday_id: row['holiday_id'],
                    company: companyID.value
                }
                if(!row['leave_holiday_id']){
                    axios.post("api/v1/create-leave-holiday/", formData)
                    .then((response)=>{
                        if(response.status === 200){
                            toast.success("Leave Holiday Added Succesfully")
                            holComponentKey.value += 1;
                            fetchLeaveHolidays(leaveID.value);
                        }
                        else{
                            toast.error("Error Adding Leave Holiday") 
                            holComponentKey.value += 1;
                        }
                        
                    })
                    .catch((error)=>{
                        console.log(error.message);
                        toast.error(error.message) 
                    })
                }else if(row['leave_holiday_id']){
                    toast.error("Leave Holiday Already Added")
                }
                
            }else if(action == "delete"){
                Swal.fire({
                title: "Are you sure?",
                text: `Do you wish to Remove Leave Holiday?`,
                type: 'warning',
                showCloseButton: true,
                showCancelButton: true,
                confirmButtonText: 'Yes Remove Leave Holiday!',
                cancelButtonText: 'Cancel!',
                customClass: {
                    confirmButton: 'swal2-confirm-custom',
                    cancelButton: 'swal2-cancel-custom',
                },
                showLoaderOnConfirm: true,
                }).then((result) => {
                if (result.value) {
                    let formData ={
                        company: companyID.value,
                        leave_holiday: [row['leave_holiday_id']]
                    }
                    axios.post(`api/v1/delete-leave-holiday/`,formData)
                    .then((response)=>{
                        if(response.data.msg == "Success"){
                            Swal.fire("Leave Holiday Removed succesfully!", {
                                icon: "success",
                            }); 
                            fetchLeaveHolidays(leaveID.value); 
                            selectedHolidays.value = [];
                        }else{
                            Swal.fire({
                                title: "Error Removing Leave Holiday",
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
                    Swal.fire(`Leave Holiday Not Removed!`);
                }
                })
            }
        };
        const closeHolModal = () =>{
            store.dispatch('Holidays/updateState', {leaveHolidaysArray: []})
            holModalVisible.value = false;
            leaveID.value = null;
            hideHolModalLoader();
        };
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'leave_name',label: "Name", value: selectedLeave.value?.leave_name || '', required: true },
                { type: 'dropdown', name: 'calculation_mode',label: "Calculation Mode", value: selectedLeave.value?.calculation_mode || 'Provided Days', placeholder: "", required: true, options: [{ text: 'Accrual', value: 'Accrual' }, { text: 'Provided Days', value: 'Provided Days' }] },
                { type: 'dropdown', name: 'paid_leave',label: "Paid Leave", value: selectedLeave.value?.paid_leave || 'Yes', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                { type: 'dropdown', name: 'carry_over',label: "Carry Over", value: selectedLeave.value?.carry_over || 'No', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                { type: 'number', name: 'max_accrual',label: "Days Carried Over", value: selectedLeave.value?.max_accrual || 0, required: false },
                { type: 'dropdown', name: 'print_on_payslip',label: "Display on Pay Slip", value: selectedLeave.value?.print_on_payslip || 'No', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },

            ];  
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }

        watch([selectedLeave], () => {
            if (selectedLeave.value) {
                updateFormFields();
            }else{
                updateFormFields();
            }
            
        }, { immediate: true });
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createLeaveType = async() =>{
            showModalLoader();
            let formData = {
                leave_name: formFields.value[0].value,
                carry_over: formFields.value[3].value,
                paid_leave: formFields.value[2].value,
                calculation_mode: formFields.value[1].value,
                print_on_payslip: formFields.value[5].value,
                max_accrual: formFields.value[4].value || 0,
                company: companyID.value
            }

            errors.value = [];
            for(let i=0; i < (formFields.value.length - 1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Leave_Types/createLeaveType', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Leave Type created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the Leave Type.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Leave Type: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchLeaves();
                }
            }
        }
        const updateLeaveType= async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                leave_type: selectedLeave.value.leave_type_id,
                leave_name: formFields.value[0].value,
                carry_over: formFields.value[3].value,
                paid_leave: formFields.value[2].value,
                calculation_mode: formFields.value[1].value,
                print_on_payslip: formFields.value[5].value || 0,
                max_accrual: formFields.value[4].value,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type !='number'){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Leave_Types/updateLeaveType', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Leave Type updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Leave Type.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Leave Type: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Leave_Types/updateState",{selectedLeave:null})
                    searchLeaves();
                }             
            }
        }
        const saveLeave = () =>{
            if(isEditing.value == true){
                updateLeaveType();
            }else{
                createLeaveType();
            }
        }
        const removeLeave = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    leave_type: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Leave_Types/deleteLeaveType',formData)
                    if(response && response.status == 200){
                        toast.success("Leave Type Removed Succesfully");
                        searchLeaves();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Leave Type: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Leave Type") 
            }else{
                toast.error("Please Select A Leave Type To Remove")
            }
        }
        const removeLeaves = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    leave_type: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Leave_Types/deleteLeaveType',formData)
                    if(response && response.status == 200){
                        toast.success("Leave Type(s) Removed Succesfully");
                        searchLeaves();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Leave Type: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Leave Type To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchLeaves = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                leave_name: name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/leave-types-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                leavesList.value = response.data.results;
                store.commit('Leave_Types/LIST_LEAVES', leavesList.value)
                propResults.value = response.data;
                propArrLen.value = leavesList.value.length;
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
            searchLeaves(selectedValue.value);
        };
        const resetFilters = () =>{
            name_search.value = "";
            searchLeaves();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchLeaves();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchLeaves();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchLeaves();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchLeaves();
            // scrollToTop();
        }
        const addNewLeave = () =>{
            store.dispatch("Leave_Types/updateState",{selectedLeave:null,isEditing:false})
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const leaveID = row[idField];
                let formData = {
                    company: companyID.value,
                    leave_type: leaveID
                }
                await store.dispatch('Leave_Types/fetchLeaveType',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';

            }else if(action == 'delete'){
                const leaveID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    leave_type: leaveID
                }
                await store.dispatch('Leave_Types/deleteLeaveType',formData).
                then(()=>{
                    searchLeaves();
                })
            }else if( action == 'assign-holidays'){
                store.dispatch('Holidays/updateState', {leaveHolidaysArray: []})
                holModalVisible.value = true;
                leaveID.value = row['leave_type_id'];
                await fetchLeaveHolidays(leaveID.value)
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchLeaves();
            
        })
        return{
            title, searchLeaves,resetFilters, addButtonLabel, searchFilters, tableColumns, leavesList,selectSearchQuantity,selectedValue,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,addingRight,rightsModule,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewLeave, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveLeave, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,hol_modal_loader,hol_modal_width,holModalVisible,holTitle,
            showHolModalLoader,hideHolModalLoader,closeHolModal,fetchHolidays, handleSelectedHoliday, clearSelectedHoliday,holidaysArr,holComponentKey,holidaysColumns,holidayActions,holidaysRows,
            dropdownWidth,holidayIdField,selectionHolidayChanged,handleHolidaysActions,removeLeave, removeLeaves
        }
    }
};
</script>