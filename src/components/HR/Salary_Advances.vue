<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewAdvance"
            :searchFilters="searchFilters"
            @searchPage="searchAdvances"
            @resetFilters="resetFilters"
            @removeItem="removeAdvance"
            @removeSelectedItems="removeAdvances"
            @printList="printAdvancesList"
            @printExcel="downloadAdvancesExcel"
            @printCSV="downloadAdvancesCSV"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="advancesList"
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
                :displayButtons="displayButtons" @handleSubmit="saveAdvance" @handleReset="handleReset"
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
    name: 'Salary_Advances',
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
        const idField = 'salary_advance_id';
        const addButtonLabel = ref('New Salary Advance');
        const addingRight = ref('Adding Salary Advances');
        const rightsModule = ref('HR');
        const title = ref('Salary Advance Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const advancesList = ref([]);
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
        const isEditing = computed(()=> store.state.Salary_Advances.isEditing);
        const selectedAdvance = computed(()=> store.state.Salary_Advances.selectedAdvance);
        const selectedEmployee = computed(()=> store.state.Salary_Advances.selectedEmployee);
        const employeeArray = computed(() => store.state.Employees.employeeArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "date"},
            {label: "Staff No", key: "staff_number"},
            {label: "Employee Name", key: "employee_name"},
            {label: "Month", key:"month"},
            {label: "Year", key:"year"},
            {label: "Amount", key:"amount"},
            {label: "Notes", key:"notes"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Advance', rightName: 'Editing Salary Advances'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Advance', rightName: 'Deleting Salary Advances'},
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
                type:'dropdown', placeholder:"Month..", value: month_search, width:32,
                options: [{text:'January',value:'January'},{text:'February',value:'February'},{text:'March',value:'March'},{text:'April',value:'April'},{text:'May',value:'May'},{text:'June',value:'June'},
                        {text:'July',value:'July'},{text:'August',value:'August'},{text:'September',value:'September'},{text:'October',value:'October'},{text:'November',value:'November'},{text:'December',value:'December'}]
            },
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
        const formFields = ref([]);
        const employeeValue = computed(() => {
           return (selectedAdvance.value && selectedAdvance.value.employee && !employeeID.value) ? selectedAdvance.value.employee.employee_id : employeeID.value;

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
                { type: 'date', name: 'date',label: "Date", value: selectedAdvance.value?.date || '', required: true },
                { type: 'dropdown', name: 'month',label: "Month", value: selectedAdvance.value?.month || '', placeholder: "", required: true, options: [{ text: 'January', value: 'January' }, { text: 'February', value: 'February' },{ text: 'March', value: 'March' }, { text: 'April', value: 'April' },{ text: 'May', value: 'May' }, { text: 'June', value: 'June' },{ text: 'July', value: 'July' }, { text: 'August', value: 'August' },{ text: 'September', value: 'September' }, { text: 'October', value: 'October' },{ text: 'November', value: 'November' }, { text: 'December', value: 'December' }] },
                { type: 'text', name: 'year',label: "Year", value: selectedAdvance.value?.year || '', required: true},
                { type: 'number', name: 'amount',label: "Amount", value: selectedAdvance.value?.amount || '0', required: true},
                {type:'text-area', label:"Notes", value: selectedAdvance.value?.notes || '', textarea_rows: '2', textarea_cols: '56', required: false},

            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            emplComponentKey.value += 1;
            employeeID.value = '';
        }


        watch([selectedAdvance, selectedEmployee], () => {
            if (selectedAdvance.value && selectedEmployee.value) {
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
        const createAdvance = async() =>{
            showModalLoader();
            let formData = {
                amount: formFields.value[4].value,
                date: formFields.value[1].value,
                employee: employeeID.value,
                employee_id: employeeID.value,
                notes: formFields.value[5].value,
                month: formFields.value[2].value,
                year: formFields.value[3].value,
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
                    const response = await store.dispatch('Salary_Advances/createSalaryAdvance', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Salary Advance created successfully!');
                        handleReset();
                        emplComponentKey.value += 1;
                        levComponentKey.value += 1;
                    }
                    else {
                        toast.error('An error occurred while creating the Salary Advance.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Salary Advance: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchAdvances();
                }
            }
        }
        const updateAdvance = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                salary_advance: selectedAdvance.value.salary_advance_id,
                amount: formFields.value[4].value,
                date: formFields.value[1].value,
                employee: employeeValue.value,
                employee_id: employeeValue.value,
                notes: formFields.value[5].value,
                month: formFields.value[2].value,
                year: formFields.value[3].value,
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
                    const response = await store.dispatch('Salary_Advances/updateSalaryAdvance', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        emplComponentKey.value += 1;
                        toast.success("Salary Advance updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Salary Advance.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Salary Advance: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Salary_Advances/updateState",{selectedAdvance:null})
                    searchAdvances();
                }             
            }
        }
        const saveAdvance = () =>{
            if(isEditing.value == true){
                updateAdvance();
            }else{
                createAdvance();
            }
        }
        const removeAdvance = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    salary_advance: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Salary_Advances/deleteSalaryAdvance',formData)
                    if(response && response.status == 200){
                        toast.success("Salary Advance Removed Succesfully");
                        searchAdvances();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Salary Advance: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Salary Advance") 
            }else{
                toast.error("Please Select A Salary Advance To Remove")
            }
        }
        const removeAdvances = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    salary_advance: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Salary_Advances/deleteSalaryAdvance',formData)
                    if(response && response.status == 200){
                        toast.success("Salary Advance(s) Removed Succesfully");
                        searchAdvances();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Salary Advance: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Salary Advance To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchAdvances = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                month: month_search.value,
                year: year_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/salary-advances-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                advancesList.value = response.data.results;
                store.commit('Salary_Advances/LIST_ADVANCES', advancesList.value)
                propResults.value = response.data;
                propArrLen.value = advancesList.value.length;
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
            searchAdvances(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            staff_number_search.value = "";
            employee_name_search.value = "";
            month_search.value = "";
            year_search.value = "";
            searchAdvances();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchAdvances();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchAdvances();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchAdvances();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchAdvances();
            // scrollToTop();
        }
        const addNewAdvance = () =>{
            store.dispatch("Salary_Advances/updateState",{selectedAdvance:null, selectedEmployee:null});
            emplComponentKey.value += 1;
            levComponentKey.value += 1;
            handleReset();
            updateFormFields();
            propModalVisible.value = true;
            store.dispatch("Salary_Advances/updateState",{isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const advanceID = row['salary_advance_id'];
                let formData = {
                    company: companyID.value,
                    salary_advance: advanceID
                }
                await store.dispatch('Salary_Advances/fetchSalaryAdvance',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const advanceID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    salary_advance: advanceID
                }
                await store.dispatch('Salary_Advances/deleteSalaryAdvance',formData).
                then(()=>{
                    searchAdvances();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printAdvancesList = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                company_id: companyID.value,
            } 

            axios
            .post("api/v1/export-salary-advances-pdf/", formData, { responseType: 'blob' })
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
        const downloadAdvancesExcel = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                status: status_search.value,
                company_id: companyID.value,
            }
            axios.post("api/v1/export-salary-advances-excel/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Salary Advances.xlsx');
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
        const downloadAdvancesCSV = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                company_id: companyID.value,
            }
            axios.post("api/v1/export-salary-advances-csv/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Salary Advances.csv');
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
            searchAdvances();
            
        })
        return{
            title, searchAdvances,resetFilters, addButtonLabel, searchFilters, tableColumns, advancesList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewAdvance, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveAdvance, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeAdvance, removeAdvances,addingRight,rightsModule,printAdvancesList,selectSearchQuantity,selectedValue,
            downloadAdvancesCSV,downloadAdvancesExcel
        }
    }
};
</script>