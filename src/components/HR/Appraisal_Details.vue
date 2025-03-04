<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <h2><strong>Appraisal Details</strong></h2>
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveAppraisal" @handleReset="handleReset"> 
                    <template v-slot:additional-content>
                        <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[180px]">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">KPIs Details</h1>
                            <div class="tabs pt-2">
                                <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                                    {{ tab }}
                                </button>
                            </div>
                            <div class="tab-content">
                                <div v-show="activeTab == 0" class="text-left">  
                                    <DynamicTable :key="tableKey" :columns="scheduleColumns" :rows="scheduleRows" @update-average-rating="allocateAverageAmount" :showActions="showActions" :showTotals="showTotals"/>
                                </div>
                            </div>
                        </div>
                    </template>
                </DynamicForm>
            </div>
        </template>
    </PageStyleComponent>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import DynamicTable from '@/components/DynamicTable.vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default defineComponent({
    name: 'Appraisal_Details',
    components:{
         DynamicForm,PageStyleComponent,SearchableDropdown,DynamicTable
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const tabs = ref(['KPIs']);
        const mainComponentKey = ref(0);
        const empComponentKey = ref(0);
        const catComponentKey = ref(0);
        const periodComponentKey = ref(0);
        const activeTab = ref(0);
        const rightsModule = ref('MMS');
        const displayButtons = ref(true);
        const componentKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const isEditing = computed(()=> store.state.Appraisals.isEditing);
        const selectedAppraisal = computed(()=> store.state.Appraisals.selectedAppraisal);
        const selectedEmployee = computed(()=> store.state.Appraisals.selectedEmployee);
        const selectedCategory = computed(()=> store.state.Appraisals.selectedCategory);
        const selectedPeriod = computed(()=> store.state.Appraisals.selectedPeriod);
        const performanceIndicators = computed(()=> store.state.Appraisals.performanceIndicators);
        const employeeArray = computed(() => store.state.Employees.employeeArr);
        const periodArr = computed(() => store.state.Appraisal_Periods.periodArr);
        const categoryArr = computed(() => store.state.Appraisal_Categories.categoryArr);
        const employeeID = ref('');
        const periodID = ref("");
        const categoryID = ref("");
        const average_rating = ref(0);
        const appraisalMethod = computed(()=> store.state.Appraisal_Categories.categoryMethod);
        const showActions = ref(false);
        const showTotals = ref(true);
        const scheduleColumns = ref([
            {label: "KPI Name", key:"indicator_name", type: "text", editable: false},
            {label: "Min.", key:"min_weight", type: "number", editable: false},
            {label: "Max.", key:"max_weight", type: "number", editable: false},
            {label: "Empl. Rating", key:"employee_rating", type: "number", editable: true, hidden: true},
            {label: "Sup. Rating", key:"supervisor_rating", type: "number", editable: true},
            {label: "Avg Rating", key:"average_rating", type: "text", editable: false},
            {label: "Appraisal Comments/Remarks", key:"comments", type: "text", editable: true},
        ]);
        const scheduleRows = computed(() => {
            return store.state.Appraisals.performanceIndicators;
        });
        const handleSelectedEmployee = async(option) =>{
            await store.dispatch('Employees/handleSelectedEmployee', option)
            employeeID.value = store.state.Employees.employeeID;
            if(selectedAppraisal.value){
                selectedAppraisal.value.employee.employee_id = employeeID.value;
                employeeValue.value = employeeID.value
            }
        };
        const clearSelectedEmployee = async() =>{
            await store.dispatch('Employees/updateState', {employeeID: ''});
            employeeID.value = store.state.Employees.employeeID;
        };
        const handleSelectedCategory = async(option) =>{
            await store.dispatch('Appraisal_Categories/handleSelectedCategory', option)
            categoryID.value = store.state.Appraisal_Categories.categoryID;
            appraisalMethod.value = store.state.Appraisal_Categories.appraisalMethod;
            generateKPIs();
            if(selectedCategory.value){
                selectedAppraisal.value.category.appraisal_category_id = categoryID.value;
                categoryValue.value = categoryID.value
            }
        };
        const clearSelectedCategory = async() =>{
            await store.dispatch('Appraisal_Categories/updateState', {categoryID: ''});
            categoryID.value = store.state.Appraisal_Categories.categoryID;
        };
        const handleSelectedPeriod = async(option) =>{
            await store.dispatch('Appraisal_Periods/handleSelectedPeriod', option)
            periodID.value = store.state.Appraisal_Periods.periodID;
            if(selectedPeriod.value){
                selectedAppraisal.value.period.appraisal_period_id = periodID.value;
                periodValue.value = periodID.value
            }
        };
        const clearSelectedPeriod = async() =>{
            await store.dispatch('Appraisal_Periods/updateState', {periodID: ''});
            periodID.value = store.state.Appraisal_Periods.periodID;
        };
        const formFields = ref();
        const employeeValue = computed(() => {
            return (selectedAppraisal.value && selectedAppraisal.value.employee && !employeeID.value) ? selectedAppraisal.value.employee.employee_id : employeeID.value;
        });
        const categoryValue = computed(() => {
            return (selectedAppraisal.value && selectedAppraisal.value.category && !categoryID.value) ? selectedAppraisal.value.category.appraisal_category_id : categoryID.value;
        });
        const periodValue = computed(() => {
            return (selectedAppraisal.value && selectedAppraisal.value.period && !periodID.value) ? selectedAppraisal.value.period.appraisal_period_id: periodID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Employee", value: employeeValue.value, componentKey: empComponentKey,
                    selectOptions: employeeArray, optionSelected: handleSelectedEmployee, required: true,
                    searchPlaceholder: 'Select Employee...', dropdownWidth: '420px', updateValue: selectedEmployee.value,
                    fetchData: store.dispatch('Employees/fetchEmployees', {company:companyID.value}), clearSearch: clearSelectedEmployee
                },
                {  
                    type:'search-dropdown', label:"Period", value: periodValue.value, componentKey: periodComponentKey,
                    selectOptions: periodArr, optionSelected: handleSelectedPeriod, required: true,
                    searchPlaceholder: 'Select Period...', dropdownWidth: '420px', updateValue: selectedPeriod.value,
                    fetchData: store.dispatch('Appraisal_Periods/fetchAppraisalPeriods', {company:companyID.value}), clearSearch: clearSelectedPeriod
                },
                {  
                    type:'search-dropdown', label:"Category", value: categoryValue.value, componentKey: catComponentKey,
                    selectOptions: categoryArr, optionSelected: handleSelectedCategory, required: true,
                    searchPlaceholder: 'Select Category...', dropdownWidth: '420px', updateValue: selectedCategory.value,
                    fetchData: store.dispatch('Appraisal_Categories/fetchAppraisalCategories', {company:companyID.value}), clearSearch: clearSelectedCategory
                },
                { type: 'text', name: 'overall_rating',label: "Overall Rating", value: selectedAppraisal.value?.overall_rating || average_rating.value, required: true, disabled:true},
                { type: 'text-area', name: 'comments',label: "Remarks", value: selectedAppraisal.value?.comments || '', required: true,textarea_rows: '2', textarea_cols: '56'},
                {required:false}
            ];
        };

        const additionalFields = ref();
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                ];
        };

        watch([employeeID,periodID,categoryID,appraisalMethod], () => {
            if(employeeID.value != ""){
                formFields.value[0].value = employeeID.value;
            }else if(periodID.value != ""){
                formFields.value[1].value = periodID.value;
            }else if(categoryID.value != ""){
                formFields.value[2].value = categoryID.value;
            }
            if(appraisalMethod.value == "Employee & Supervisor"){
                scheduleColumns.value[3].hidden = false;
            }else{
                scheduleColumns.value[3].hidden = true;
            }
        }, { immediate: true });

        watch([selectedAppraisal,selectedEmployee,selectedPeriod,selectedCategory], () => {
            if (selectedAppraisal.value) {
                catComponentKey.value += 1;
                empComponentKey.value += 1;
                periodComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
        
            }
            // else{
            //     updateFormFields();
            //     updateAdditionalFormFields();
            // }
        }, { immediate: true });

        const handleReset = async() =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].label == 'Overall Rating'){
                    formFields.value[i].value = '0';
                }else{
                    formFields.value[i].value = '';
                }
  
            }
            await store.dispatch('Appraisals/updateState', {selectedAppraisal: null,selectedEmployee: null,selectedPeriod: null,selectedCategory: null, performanceIndicators: [], isEditing:false});
            mainComponentKey.value += 1;
            empComponentKey.value += 1;
            catComponentKey.value += 1;
            periodComponentKey.value += 1;
            employeeID.value = "";
            periodID.value = "";
            categoryID.value = "";
            average_rating.value = 0;
        }
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const generateKPIs = async() =>{
            showLoader();
            let formData = {
                appraisal_category: categoryValue.value,
                company: companyID.value
            }
            try {
                const response = await store.dispatch('Appraisals/generateKPIs', formData);
            } catch (error) {
                console.error(error.message);
                toast.error('Failed to generate KPIs: ' + error.message);
            } finally {
                hideLoader();
            }

        };
        const allocateAverageAmount = (amount) =>{
            let avgRating = 0;
            for(let i=0; i<scheduleRows.value.length; i++){
                avgRating += parseFloat(scheduleRows.value[i].average_rating);
            }
            average_rating.value = avgRating;
        };

        watch([average_rating], () => {
            if (average_rating.value) {
                formFields.value[3].value = average_rating.value;
            } 
        }, { immediate: true });
        const createAppraisal = async() =>{
            showLoader();
            let formData = {
                overall_rating: formFields.value[3].value,
                employee: employeeID.value,
                employee_id: employeeID.value,
                period: periodID.value,
                period_id: periodID.value,
                category: categoryID.value,
                category_id: categoryID.value,
                comments: formFields.value[4].value,
                skill_ratings: scheduleRows.value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=3; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(employeeValue.value == '' || periodValue.value == '' || categoryValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();
            }else{
                try {
                    const response = await store.dispatch('Appraisals/createAppraisal', formData);
                    if(response && response.status === 201) {
                        hideLoader();
                        toast.success('Appraisal created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Appraisal.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Appraisal: ' + error.message);
                } finally {
                    hideLoader();
                }
            }

        }
        const updateAppraisal = async() =>{
            showLoader();
            errors.value = [];
            let formData = {
                employee_appraisal: selectedAppraisal.value.employee_appraisal_id,
                overall_rating: formFields.value[3].value,
                employee: employeeValue.value,
                employee_id: employeeValue.value,
                period: periodValue.value,
                period_id: periodValue.value,
                category: categoryValue.value,
                category_id: categoryValue.value,
                comments: formFields.value[4].value,
                skill_ratings: scheduleRows.value,
                company: companyID.value,
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(employeeValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
            }else{
                try {
                    const response = await store.dispatch('Appraisals/updateAppraisal', formData);
                    if (response && response.status === 200) {
                        hideLoader();
                        toast.success("Appraisal updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Appraisal.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Appraisal: ' + error.message);
                } finally {
                    hideLoader();
                }
            }
        }
        const saveAppraisal = () =>{
            if(isEditing.value == true){
                updateAppraisal();
            }else{
                createAppraisal();
            }
        };

        const selectTab = (index) => {
            activeTab.value = index;
        };
        
        onBeforeMount(()=>{ 
            updateFormFields();
            updateAdditionalFormFields();
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '20';
            additional_flex_basis.value = '1/3';
            additional_flex_basis_percentage.value = '33.333';
        })
        onMounted(()=>{

        })

        return{
            tabs,componentKey, formFields, additionalFields, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, mainComponentKey,handleReset, loader, showLoader, hideLoader,allocateAverageAmount,
            displayButtons,saveAppraisal,selectTab,activeTab,rightsModule,scheduleColumns,scheduleRows,generateKPIs,showActions,showTotals
            
        }
    }
})
</script>

<style scoped>
.tabs {
    display: flex;
    border-bottom: 1px solid #ccc;
}
.tab {
    padding: 2px 20px 2px 20px;
    cursor: pointer;
}

.tab.active {
    border-bottom: 2px solid #000;
}

.tab-content {
    padding: 3px;
    margin-top: 10px !important;
}
</style>