<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewCase"
            :searchFilters="searchFilters"
            @searchPage="searchCases"
            @resetFilters="resetFilters"
            @removeItem="removeCase"
            @removeSelectedItems="removeCases"
            @printList="printCasesList"
            @printExcel="downloadCasesExcel"
            @printCSV="downloadCasesCSV"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="casesList"
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
                :displayButtons="displayButtons" @handleSubmit="saveCase" @handleReset="handleReset"
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
    name: 'Disciplinary_Cases',
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
        const idField = 'disciplinary_case_id';
        const addButtonLabel = ref('New Disciplinary Case');
        const addingRight = ref('Adding Disciplinary Cases');
        const removingRight = ref('Deleting Disciplinary Cases');
        const rightsModule = ref('HR');
        const title = ref('Disciplinary Case Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const casesList = ref([]);
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
        const categoryID = ref('');
        const isEditing = computed(()=> store.state.Disciplinary_Cases.isEditing);
        const selectedCase = computed(()=> store.state.Disciplinary_Cases.selectedCase);
        const selectedEmployee = computed(()=> store.state.Disciplinary_Cases.selectedEmployee);
        const selectedCategory = computed(()=> store.state.Disciplinary_Cases.selectedCategory);
        const employeeArray = computed(() => store.state.Employees.employeeArr);
        const categoryArray = computed(() => store.state.Disciplinary_Categories.categoryArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "date_reported"},
            {label: "Case#", key: "case_number"},
            {label: "Staff No", key: "staff_number"},
            {label: "Employee Name", key: "employee_name"},
            {label: "Category", key: "category_name"},
            {label: "Description", key:"case_description", maxWidth: "500px"},
            {label: "Status", key:"status"},
            {label: "Action Taken", key:"action_taken", maxWidth: "500px"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Case', rightName: 'Editing Disciplinary Cases'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Case', rightName: 'Deleting Disciplinary Cases'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const employee_name_search = ref('');
        const staff_number_search = ref('');
        const date_from_search = ref('');
        const date_to_search = ref('');
        const case_number_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Case No...", value: case_number_search, width:32,},
            {type:'text', placeholder:"Staff No...", value: staff_number_search, width:32,},
            {type:'text', placeholder:"Employee Name...", value: employee_name_search, width:64,},
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
        const handleSelectedCategory = async(option) =>{
            await store.dispatch('Disciplinary_Categories/handleSelectedCategory', option)
            categoryID.value = store.state.Disciplinary_Categories.categoryID;
        };
        const clearSelectedCategory = async() =>{
            await store.dispatch('Disciplinary_Categories/updateState', {categoryID: ''});
            categoryID.value = store.state.Disciplinary_Categories.categoryID;
        };
        const formFields = ref([]);
        const employeeValue = computed(() => {
           return (selectedCase.value && selectedCase.value.employee && !employeeID.value) ? selectedCase.value.employee.employee_id : employeeID.value;

        });
        const categoryValue = computed(() => {
           return (selectedCase.value && selectedCase.value.category && !categoryID.value) ? selectedCase.value.category.disciplinary_category_id : categoryID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Category", value: categoryValue.value, componentKey: levComponentKey,
                    selectOptions: categoryArray, optionSelected: handleSelectedCategory, required: true,
                    searchPlaceholder: 'Select Category...', dropdownWidth: '500px', updateValue: selectedCategory.value,
                    fetchData: store.dispatch('Disciplinary_Categories/fetchDisciplinaryCategories', {company:companyID.value}),
                    clearSearch: clearSelectedCategory
                },
                {  
                    type:'search-dropdown', label:"Employee", value: employeeValue.value, componentKey: emplComponentKey,
                    selectOptions: employeeArray, optionSelected: handleSelectedEmployee, required: true,
                    searchPlaceholder: 'Select Employee...', dropdownWidth: '500px', updateValue: selectedEmployee.value,
                    fetchData: store.dispatch('Employees/fetchEmployees', {company:companyID.value}),
                    clearSearch: clearSelectedEmployee
                },
                { type: 'date', name: 'date_reported',label: "Date", value: selectedCase.value?.date_reported || '', required: true },
                {type:'text-area', label:"Description", value: selectedCase.value?.case_description || '', textarea_rows: '4', textarea_cols: '56', required: true},
                {type:'text-area', label:"Action Taken", value: selectedCase.value?.action_taken || '', textarea_rows: '4', textarea_cols: '56', required: false},

            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            emplComponentKey.value += 1;
            levComponentKey.value += 1;
            categoryID.value = '';
            employeeID.value = '';
        }


        watch([selectedCase, selectedEmployee, selectedCategory], () => {
            if (selectedCase.value && selectedEmployee.value && selectedCategory.value) {
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
        const createDisciplinaryCase = async() =>{
            showModalLoader();
            let formData = {
                case_number: '-',
                date_reported: formFields.value[2].value,
                employee: employeeID.value,
                employee_id: employeeID.value,
                category: categoryID.value,
                category_id: categoryID.value,
                case_description: formFields.value[3].value,
                action_taken: formFields.value[4].value,
                status: "Open",
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=2; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(employeeValue.value == '' || categoryValue.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Disciplinary_Cases/createDisciplinaryCase', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Disciplinary Case created successfully!');
                        handleReset();
                        emplComponentKey.value += 1;
                        levComponentKey.value += 1;
                    }
                    else {
                        toast.error('An error occurred while creating the Disciplinary Case.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Disciplinary Case: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchCases();
                }
            }
        }
        const updateDisciplinaryCase = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                disciplinary_case: selectedCase.value.disciplinary_case_id,
                case_number: selectedCase.value.case_number,
                date_reported: formFields.value[2].value,
                employee: employeeValue.value,
                employee_id: employeeValue.value,
                category: categoryValue.value,
                category_id: categoryValue.value,
                case_description: formFields.value[3].value,
                action_taken: formFields.value[4].value,
                status: selectedCase.value.status,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown'  && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(employeeValue.value == '' || categoryValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Disciplinary_Cases/updateDisciplinaryCase', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        emplComponentKey.value += 1;
                        toast.success("Disciplinary Case updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Disciplinary Case.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Disciplinary Case: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Disciplinary_Cases/updateState",{selectedCase:null})
                    searchCases();
                }             
            }
        }
        const saveCase = () =>{
            if(isEditing.value == true){
                updateDisciplinaryCase();
            }else{
                createDisciplinaryCase();
            }
        }
        const removeCase = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    disciplinary_case: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Disciplinary_Cases/deleteDisciplinaryCase',formData)
                    if(response && response.status == 200){
                        toast.success("Disciplinary Case Removed Succesfully");
                        searchCases();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Disciplinary Case: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Disciplinary Case") 
            }else{
                toast.error("Please Select A Disciplinary Case To Remove")
            }
        }
        const removeCases = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    disciplinary_case: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Disciplinary_Cases/deleteDisciplinaryCase',formData)
                    if(response && response.status == 200){
                        toast.success("Disciplinary Case(s) Removed Succesfully");
                        searchCases();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Disciplinary Case: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Disciplinary Case To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchCases = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                case_number: case_number_search.value,
                user: "",
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/disciplinary-cases-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                casesList.value = response.data.results;
                store.commit('Disciplinary_Cases/LIST_CASES', casesList.value)
                propResults.value = response.data;
                propArrLen.value = casesList.value.length;
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
            searchCases(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            staff_number_search.value = "";
            employee_name_search.value = "";
            date_from_search.value = "";
            date_to_search.value = "";
            case_number_search.value = "";
            searchCases();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchCases();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchCases();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchCases();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchCases();
            // scrollToTop();
        }
        const addNewCase = () =>{
            store.dispatch("Disciplinary_Cases/updateState",{selectedCase:null, selectedEmployee:null, selectedCategory:null});
            emplComponentKey.value += 1;
            levComponentKey.value += 1;
            handleReset();
            updateFormFields();
            propModalVisible.value = true;
            store.dispatch("Disciplinary_Cases/updateState",{isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const advanceID = row['disciplinary_case_id'];
                let formData = {
                    company: companyID.value,
                    disciplinary_case: advanceID
                }
                await store.dispatch('Disciplinary_Cases/fetchDisciplinaryCase',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const advanceID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    disciplinary_case: advanceID
                }
                await store.dispatch('Disciplinary_Cases/deleteDisciplinaryCase',formData).
                then(()=>{
                    searchCases();
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
            .post("api/v1/export-disciplinary-cases-pdf/", formData, { responseType: 'blob' })
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
            axios.post("api/v1/export-disciplinary-casess-excel/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Disciplinary Cases.xlsx');
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
            axios.post("api/v1/export-disciplinary-cases-csv/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Disciplinary Cases.csv');
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
            searchCases();
            
        })
        return{
            title, searchCases,resetFilters, addButtonLabel, searchFilters, tableColumns, casesList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewCase, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveCase, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeCase, removeCases,addingRight,removingRight,rightsModule,printCasesList,selectSearchQuantity,selectedValue,
            downloadCasesCSV,downloadCasesExcel
        }
    }
};
</script>