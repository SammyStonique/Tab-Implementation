<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewDeduction"
            :searchFilters="searchFilters"
            @searchPage="searchDeductions"
            @resetFilters="resetFilters"
            @removeItem="removeDeduction"
            @removeSelectedItems="removeDeductions"
            @printList="printCasesList"
            @printExcel="downloadCasesExcel"
            @printCSV="downloadCasesCSV"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="deductionsList"
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
                :displayButtons="displayButtons" @handleSubmit="saveDeduction" @handleReset="handleReset"
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
    name: 'Employee_Deductions',
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
        const emplComponentKey = ref(0);
        const levComponentKey = ref(0);
        const idField = 'employee_deduction_id';
        const addButtonLabel = ref('New Earning/Deduction');
        const addingRight = ref('Adding Earnings/Deductions');
        const removingRight = ref('Deleting Earnings/Deductions');
        const rightsModule = ref('HR');
        const title = ref('Earning/Deduction Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const deductionsList = ref([]);
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
        const deductionID = ref('');
        const employeeID = ref('');
        const isEditing = computed(()=> store.state.Employee_Deductions.isEditing);
        const selectedDeduction = computed(()=> store.state.Employee_Deductions.selectedDeduction);
        const selectedDeductionType = computed(()=> store.state.Employee_Deductions.selectedDeductionType);
        const selectedEmployee = computed(()=> store.state.Employee_Deductions.selectedEmployee);
        const deductionArray = computed(() => store.state.Deductions.deductionArr);
        const employeeArray = computed(() => store.state.Employees.employeeArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Month", key: "month"},
            {label: "Year", key: "year"},
            {label: "Staff No", key: "staff_number"},
            {label: "Employee Name", key: "employee_name"},
            {label: "Name", key: "deduction_name"},
            {label: "Type", key: "deduction_type"},
            {label: "Amount", key: "amount"},
            
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Earnings/Deductions', rightName: 'Editing Earnings/Deductions'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Earnings/Deductions', rightName: 'Deleting Earnings/Deductions'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const employee_name_search = ref('');
        const staff_number_search = ref('');
        const month_search = ref('');
        const year_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Staff No...", value: staff_number_search, width:32,},
            {type:'text', placeholder:"Employee Name...", value: employee_name_search, width:64,},
            {
                type:'dropdown', placeholder:"Month..", value: getMonth(current_date), width:32,
                options: [{text:'January',value:'January'},{text:'February',value:'February'},{text:'March',value:'March'},{text:'April',value:'April'},{text:'May',value:'May'},{text:'June',value:'June'},
                        {text:'July',value:'July'},{text:'August',value:'August'},{text:'September',value:'September'},{text:'October',value:'October'},{text:'November',value:'November'},{text:'December',value:'December'}]
            },
            {type:'text', placeholder:"Year...", value: getYear(current_date), width:32,},
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
        const handleSelectedDeductionType = async(option) =>{
            await store.dispatch('Deductions/handleSelectedDeduction', option)
            deductionID.value = store.state.Deductions.deductionID;
        };
        const clearSelectedDeductionType = async() =>{
            await store.dispatch('Deductions/updateState', {deductionID: ''});
            deductionID.value = store.state.Deductions.deductionID;
        };
        const formFields = ref([]);

        const employeeValue = computed(() => {
           return (selectedDeduction.value && selectedDeduction.value.employee && !deductionID.value) ? selectedDeduction.value.employee.employee_id : employeeID.value;

        });

        const deductionValue = computed(() => {
           return (selectedDeduction.value && selectedDeduction.value.deduction && !deductionID.value) ? selectedDeduction.value.deduction.deduction_id : deductionID.value;

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
                    type:'search-dropdown', label:"Earning/Deduction", value: deductionValue.value, componentKey: levComponentKey,
                    selectOptions: deductionArray, optionSelected: handleSelectedDeductionType, required: true,
                    searchPlaceholder: 'Select Case...', dropdownWidth: '500px', updateValue: selectedDeductionType.value,
                    fetchData: store.dispatch('Deductions/fetchDeductions', {company:companyID.value}),
                    clearSearch: clearSelectedDeductionType
                },
                { type: 'dropdown', name: 'month',label: "Month", value: selectedDeduction.value?.month || getMonth(current_date), placeholder: "", required: true, options: [{ text: 'January', value: 'January' }, { text: 'February', value: 'February' },{ text: 'March', value: 'March' }, { text: 'April', value: 'April' },{ text: 'May', value: 'May' }, { text: 'June', value: 'June' },{ text: 'July', value: 'July' }, { text: 'August', value: 'August' },{ text: 'September', value: 'September' }, { text: 'October', value: 'October' },{ text: 'November', value: 'November' }, { text: 'December', value: 'December' }] },
                { type: 'text', name: 'year',label: "Year", value: selectedDeduction.value?.year || getYear(current_date), required: true },
                { type: 'text', name: 'amount',label: "Amount", value: selectedDeduction.value?.amount || '0', required: true },                                                                        
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            levComponentKey.value += 1;
            deductionID.value = '';
            emplComponentKey.value += 1;
            employeeID.value = '';
        }


        watch([selectedDeduction, selectedEmployee, selectedDeductionType], () => {
            if (selectedDeduction.value && selectedEmployee.value && selectedDeductionType.value) {
                levComponentKey.value += 1;
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
        const createEmployeeDeduction = async() =>{
            showModalLoader();
            let formData = {
                amount: formFields.value[4].value,
                deduction: deductionID.value,
                deduction_id: deductionID.value,
                employee: employeeID.value,
                employee_id: employeeID.value,
                month: formFields.value[2].value,
                year: formFields.value[3].value,
                recurrent: "No",
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(deductionValue.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Employee_Deductions/createEmployeeDeduction', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Earning/Deduction created successfully!');
                        handleReset();
                        emplComponentKey.value += 1;
                        levComponentKey.value += 1;
                    }
                    else {
                        toast.error('An error occurred while creating the Earning/Deduction.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Earning/Deduction: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchDeductions();
                }
            }
        }
        const updateDisciplinaryAction = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                employee_deduction: selectedDeduction.value.employee_deduction_id,
                amount: formFields.value[4].value,
                deduction: deductionValue.value,
                deduction_id: deductionValue.value,
                employee: employeeValue.value,
                employee_id: employeeValue.value,
                month: formFields.value[2].value,
                year: formFields.value[3].value,
                recurrent: "No",
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown'  && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(deductionValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Employee_Deductions/updateEmployeeDeduction', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        emplComponentKey.value += 1;
                        toast.success("Earning/Deduction updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Earning/Deduction.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Earning/Deduction: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("employee_deduction/updateState",{selectedDeduction:null})
                    searchDeductions();
                }             
            }
        }
        const saveDeduction = () =>{
            if(isEditing.value == true){
                updateDisciplinaryAction();
            }else{
                createEmployeeDeduction();
            }
        }
        const removeDeduction = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    employee_deduction: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Employee_Deductions/deleteEmployeeDeduction',formData)
                    if(response && response.status == 200){
                        toast.success("Earning/Deduction Removed Succesfully");
                        searchDeductions();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Earning/Deduction: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Earning/Deduction") 
            }else{
                toast.error("Please Select An Earning/Deduction To Remove")
            }
        }
        const removeDeductions = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    employee_deduction: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Employee_Deductions/deleteEmployeeDeduction',formData)
                    if(response && response.status == 200){
                        toast.success("Earning/Deduction(s) Removed Succesfully");
                        searchDeductions();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Earning/Deduction: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select An Earning/Deduction To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchDeductions = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                month: searchFilters.value[2].value,
                year: searchFilters.value[3].value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/employee-deductions-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                deductionsList.value = response.data.results;
                store.commit('Employee_Deductions/LIST_DEDUCTIONS', deductionsList.value)
                propResults.value = response.data;
                propArrLen.value = deductionsList.value.length;
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
            searchDeductions(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            staff_number_search.value = "";
            employee_name_search.value = "";
            searchFilters.value[2].value = getMonth(current_date);
            searchFilters.value[3].value = getYear(current_date);
            searchDeductions();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchDeductions();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchDeductions();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchDeductions();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchDeductions();
            // scrollToTop();
        }
        const addNewDeduction = () =>{
            store.dispatch("Employee_Deductions/updateState",{selectedDeduction:null,selectedEmployee:null,selectedDeductionType:null});
            emplComponentKey.value += 1;
            levComponentKey.value += 1;
            handleReset();
            updateFormFields();
            propModalVisible.value = true;
            store.dispatch("Employee_Deductions/updateState",{isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const advanceID = row['employee_deduction_id'];
                let formData = {
                    company: companyID.value,
                    employee_deduction: advanceID
                }
                await store.dispatch('Employee_Deductions/fetchEmployeeDeduction',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const advanceID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    employee_deduction: advanceID
                }
                await store.dispatch('Employee_Deductions/deleteEmployeeDeduction',formData).
                then(()=>{
                    searchDeductions();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printCasesList = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                company_id: companyID.value,
            } 

            axios
            .post("api/v1/export-disciplinary-meetings-pdf/", formData, { responseType: 'blob' })
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
            axios.post("api/v1/export-disciplinary-meetings-excel/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Disciplinary Meetings.xlsx');
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
            axios.post("api/v1/export-disciplinary-meetings-csv/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Disciplinary Meetings.csv');
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
            searchDeductions();
            
        })
        return{
            title, searchDeductions,resetFilters, addButtonLabel, searchFilters, tableColumns, deductionsList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewDeduction, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveDeduction, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeDeduction, removeDeductions,addingRight,removingRight,rightsModule,printCasesList,selectSearchQuantity,selectedValue,
            downloadCasesCSV,downloadCasesExcel
        }
    }
};
</script>