<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            :showAddButton="showAddButton"
            @handleAddNew="addNewReward"
            :searchFilters="searchFilters"
            @searchPage="searchRewards"
            @resetFilters="resetFilters"
            @removeItem="removeReward"
            @removeSelectedItems="removeRewards"
            @printList="printrewardsList"
            @printExcel="downloadCasesExcel"
            @printCSV="downloadCasesCSV"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="rewardsList"
            :actions="actions"
            :showActions="showActions"
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
                :displayButtons="displayButtons" @handleSubmit="saveReward" @handleReset="handleReset"
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
    name: 'Employee_Rewards',
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
        const idField = 'employee_reward_id';
        const addButtonLabel = ref('New Employee Reward');
        const addingRight = ref('Adding Employee Rewards');
        const rightsModule = ref('HR');
        const showAddButton = ref(false);
        const showActions = ref(false);
        const title = ref('Employee Reward Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const rewardsList = ref([]);
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
        const modal_top = ref('150px');
        const modal_left = ref('500px');
        const modal_width = ref('30vw');
        const employeeID = ref('');
        const isEditing = computed(()=> store.state.Employee_Rewards.isEditing);
        const selectedReward = computed(()=> store.state.Employee_Rewards.selectedReward);
        const selectedEmployee = computed(()=> store.state.Employee_Rewards.selectedEmployee);
        const employeeArray = computed(() => store.state.Employees.employeeArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "date_awarded"},
            {label: "Staff No", key: "staff_number"},
            {label: "Employee Name", key: "employee_name"},
            {label: "Type", key: "reward_type"},
            {label: "Description", key:"description", maxWidth: "500px"},
            {label: "Amount", key:"amount"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Reward', rightName: 'Editing Employee Rewards'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Reward', rightName: 'Deleting Employee Rewards'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const employee_name_search = ref('');
        const staff_number_search = ref('');
        const date_from_search = ref('');
        const date_to_search = ref('');
        const searchFilters = ref([
            {type:'date',value: date_from_search, width:32, title: "Date From"},
            {type:'date',value: date_to_search, width:32, title: "Date To"},
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
        const formFields = ref([]);
        const employeeValue = computed(() => {
           return (selectedReward.value && selectedReward.value.employee && !employeeID.value) ? selectedReward.value.employee.employee_id : employeeID.value;

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
                { type: 'date', name: 'date_awarded',label: "Date", value: selectedReward.value?.date_awarded || '', required: true },
                { type: 'dropdown', name: 'reward_type',label: "Reward Type", value: selectedReward.value?.reward_type || '', placeholder: "", required: true, options: [{ text: 'Bonus', value: 'Bonus' }, { text: 'Recognition', value: 'Recognition' }, { text: 'Promotion', value: 'Promotion' },{ text: 'Gift', value: 'Gift' }, { text: 'Voucher', value: 'Voucher' }, { text: 'Other', value: 'Other' }] },
                { type: 'text', name: 'amount',label: "Amount", value: selectedReward.value?.date_awarded || '0', required: false },
                {type:'text-area', label:"Description", value: selectedReward.value?.description || '', textarea_rows: '4', textarea_cols: '56', required: true},

            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            emplComponentKey.value += 1;
            employeeID.value = '';
        }


        watch([selectedReward, selectedEmployee], () => {
            if (selectedReward.value && selectedEmployee.value) {
                emplComponentKey.value += 1;
                updateFormFields();
            }
            
        }, { immediate: true });
        
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createEmployeeReward = async() =>{
            showModalLoader();
            let formData = {
                date_awarded: formFields.value[1].value,
                employee: employeeID.value,
                employee_id: employeeID.value,
                reward_type: formFields.value[2].value,
                amount: formFields.value[3].value || '0',
                description: formFields.value[4].value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(employeeValue.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Employee_Rewards/createEmployeeReward', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Employee Reward created successfully!');
                        handleReset();
                        emplComponentKey.value += 1;
                    }
                    else {
                        toast.error('An error occurred while creating the Employee Reward.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Employee Reward: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchRewards();
                }
            }
        }
        const updateEmployeeReward = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                employee_reward: selectedReward.value.employee_reward_id,
                date_awarded: formFields.value[1].value,
                employee: employeeValue.value,
                employee_id: employeeValue.value,
                reward_type: formFields.value[2].value,
                amount: formFields.value[3].value,
                description: formFields.value[4].value,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown'  && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(employeeValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Employee_Rewards/updateEmployeeReward', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        emplComponentKey.value += 1;
                        toast.success("Employee Reward updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Employee Reward.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Employee Reward: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Employee_Rewards/updateState",{selectedReward:null})
                    searchRewards();
                }             
            }
        }
        const saveReward = () =>{
            if(isEditing.value == true){
                updateEmployeeReward();
            }else{
                createEmployeeReward();
            }
        }
        const removeReward = async() =>{

        }
        const removeRewards = async() =>{

        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchRewards = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                user: userID.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/employee-rewards-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                rewardsList.value = response.data.results;
                store.commit('Employee_Rewards/LIST_REWARDS', rewardsList.value)
                propResults.value = response.data;
                propArrLen.value = rewardsList.value.length;
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
            searchRewards(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            staff_number_search.value = "";
            employee_name_search.value = "";
            date_from_search.value = "";
            date_to_search.value = "";
            searchRewards();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchRewards();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchRewards();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchRewards();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchRewards();
            // scrollToTop();
        }
        const addNewReward = () =>{
            store.dispatch("Employee_Rewards/updateState",{selectedReward:null, selectedEmployee:null});
            emplComponentKey.value += 1;
            levComponentKey.value += 1;
            handleReset();
            updateFormFields();
            propModalVisible.value = true;
            store.dispatch("Employee_Rewards/updateState",{isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const advanceID = row['employee_reward_id'];
                let formData = {
                    company: companyID.value,
                    employee_reward: advanceID
                }
                await store.dispatch('Employee_Rewards/fetchEmployeeReward',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const advanceID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    employee_reward: advanceID
                }
                await store.dispatch('Employee_Rewards/deleteEmployeeReward',formData).
                then(()=>{
                    searchRewards();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printrewardsList = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                company_id: companyID.value,
            } 

            axios
            .post("api/v1/export-employee-rewards-pdf/", formData, { responseType: 'blob' })
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
        const downloadCasesExcel = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                status: status_search.value,
                company_id: companyID.value,
            }
            axios.post("api/v1/export-employee-rewardss-excel/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Employee Rewards.xlsx');
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
        const downloadCasesCSV = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                company_id: companyID.value,
            }
            axios.post("api/v1/export-employee-rewards-csv/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Employee Rewards.csv');
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
            searchRewards();
            
        })
        return{
            showAddButton,showActions,title, searchRewards,resetFilters, addButtonLabel, searchFilters, tableColumns, rewardsList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewReward, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveReward, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeReward, removeRewards,addingRight,rightsModule,printrewardsList,selectSearchQuantity,selectedValue,
            downloadCasesCSV,downloadCasesExcel
        }
    }
};
</script>