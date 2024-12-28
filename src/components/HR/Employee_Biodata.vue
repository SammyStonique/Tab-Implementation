<template>

    <h2><strong>Employee Details</strong></h2>
    <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" @handleReset="handleReset"> 
        <template v-slot:additional-content>
            <div class="border border-slate-200 rounded relative py-3 mt-3 px-2 flex">
                <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Emergency Contact Details</h1>
                <div class="px-3">
                    <DynamicForm :fields="additionalFields" :flex_basis="additional_flex_basis" :flex_basis_percentage="additional_flex_basis_percentage" @handleReset="handleReset"/>
                </div>
            </div>
        </template>
    </DynamicForm>

</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default defineComponent({
    name: 'Employee_Biodata',
    components:{
         DynamicForm
    },
    props:{
        formFields: Array,
        additionalFields: Array
    },
    emits: ['update-form'],
    setup(props,{emit}){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const mainComponentKey = ref(0);
        const depComponentKey = ref(0);
        const userComponentKey = ref(0);
        const componentKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const selectedEmployee = computed(()=> store.state.Employees.selectedEmployee);
        const selectedDepartment = computed(()=> store.state.Employees.selectedDepartment);
        const selectedSupervisor = computed(()=> store.state.Employees.selectedSupervisor);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const isEditing = computed(()=> store.state.Employees.isEditing);
        const depArray = computed(() => store.state.Departments.depArr);
        const usersArray = computed(() => store.state.userData.userArr);
        const departmentID = ref('');
        const supervisorID = ref('');
        const fetchDepartments = async() =>{
            await store.dispatch('Departments/fetchDepartments', {company:companyID.value});
        };
        const handleSelectedDepartment = async(option) =>{
            await store.dispatch('Departments/handleSelectedDepartment', option)
            departmentID.value = store.state.Departments.depID;

        };
        const clearSelectedDepartment = async() =>{
            await store.dispatch('Departments/updateState', {depID: ''});
            departmentID.value = store.state.Departments.depID;    
        };
        const fetchUsers = async() =>{
            await store.dispatch('userData/fetchUsers', {company:companyID.value});
        };
        const handleSelectedSupervisor = async(option) =>{
            await store.dispatch('userData/handleSelectedUser', option)
            supervisorID.value = store.state.userData.userID;

        };
        const clearSelectedSupervisor = async() =>{
            await store.dispatch('userData/updateState', {supervisorID: ''});
            supervisorID.value = store.state.userData.supervisorID;
        };
        const formFields = ref(props.formFields);
        const departmentValue = computed(() => {
           return (selectedEmployee.value && selectedEmployee.value.employee_department && !departmentID.value) ? selectedEmployee.value.employee_department.department_id : departmentID.value;
        });
        const supervisorValue = computed(() => {
           return (selectedEmployee.value && selectedEmployee.value.supervisor && !supervisorID.value) ? selectedEmployee.value.supervisor.user_id : supervisorID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'staff_number',label: "Staff Number", value: selectedEmployee.value?.staff_number || '', required: false },
                { type: 'text', name: 'employee_name',label: "Employee Name", value: selectedEmployee.value?.employee_name || '', required: true },
                { type: 'text', name: 'phone_number',label: "Phone Number", value: selectedEmployee.value?.phone_number || '', required: true, placeholder: '' },
                { type: 'text', name: 'id_number',label: "ID Number", value: selectedEmployee.value?.id_number || '', required: true, placeholder: '' },
                { type: 'date', name: 'dob',label: "D.O.B", value: selectedEmployee.value?.dob || '', required: true, placeholder: '' },
                { type: 'dropdown', name: 'gender',label: "Gender", value: selectedEmployee.value?.gender || '', placeholder: "", required: true, options: [{ text: 'Male', value: 'Male' }, { text: 'Female', value: 'Female' }, { text: 'Others', value: 'Others' }] },
                { type: 'text', name: 'email',label: "Email", value: selectedEmployee.value?.email || '', required: false },
                { type: 'text', name: 'kra_pin',label: "Tax Pin", value: selectedEmployee.value?.kra_pin || '', required: false },
                { type: 'dropdown', name: 'marital_status',label: "Marital Status", value: selectedEmployee.value?.marital_status || '', placeholder: "", required: true, options: [{ text: 'Single', value: 'Single' }, { text: 'Married', value: 'Married' },{ text: 'Separated', value: 'Separated' }, { text: 'Divorced', value: 'Divorced' },{ text: 'Widowed', value: 'Widowed' }] },
                { type: 'text', name: 'country',label: "Country", value: selectedEmployee.value?.country || 'Kenya', required: true },
                { type: 'text', name: 'address',label: "Address", value: selectedEmployee.value?.address || '', required: false },
                { type: 'text', name: 'job_title',label: "Job Title", value: selectedEmployee.value?.job_title || '', required: true },
                {  
                    type:'search-dropdown', label:"Department", value: departmentValue.value, componentKey: depComponentKey,
                    selectOptions: depArray, optionSelected: handleSelectedDepartment, required: false,
                    searchPlaceholder: 'Select Department...', dropdownWidth: '500px', updateValue: selectedDepartment.value,
                    fetchData: fetchDepartments(), clearSearch: clearSelectedDepartment
                },
                {  
                    type:'search-dropdown', label:"Supervisor", value: supervisorValue.value, componentKey: userComponentKey,
                    selectOptions: usersArray, optionSelected: handleSelectedSupervisor, required: false,
                    searchPlaceholder: 'Select Supervisor...', dropdownWidth: '500px', updateValue: selectedSupervisor.value,
                    fetchData: fetchUsers(), clearSearch: clearSelectedSupervisor
                },
                {required:false}
            ];
            emitUpdatedFields();
        };

        const additionalFields = ref(props.additionalFields);
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                { type: 'text', name: 'contact_names',label: "Name", value: selectedEmployee.value?.contact_names ||'', required: false },
                { type: 'text', name: 'contact_phone_number',label: "Phone Number", value: selectedEmployee.value?.contact_phone_number ||'', required: false },
                { type: 'text', name: 'contact_email',label: "Email", value: selectedEmployee.value?.contact_email ||'', required: false },
                { type: 'text', name: 'contact_relationship',label: "Relationship", value: selectedEmployee.value?.contact_relationship ||'', required: false },
            ];
            emitUpdatedFields();
        };
        const emitUpdatedFields = () => {
            emit('update-form', formFields.value, additionalFields.value);
        };

        watch([departmentID, supervisorID], () => {
            if (departmentID.value != "") {
                formFields.value[12].value = departmentID.value;
            }
            if(supervisorID.value != ""){
                formFields.value[13].value = supervisorID.value;
            }
        }, { immediate: true });

        watch([selectedEmployee, selectedDepartment, selectedSupervisor], () => {
            if (selectedEmployee.value && selectedDepartment.value && selectedSupervisor.value) {
                depComponentKey.value += 1;
                userComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();

            }else if(selectedEmployee.value && selectedDepartment.value){
                depComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
                
            }else if(selectedEmployee.value && selectedSupervisor.value){
                userComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
            }else if(selectedEmployee.value){
                updateFormFields();
                updateAdditionalFormFields();
            }
        }, { immediate: true });

        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].label != 'Country'){
                    formFields.value[i].value = '';
                }
            }
            for(let i=0; i < additionalFields.value.length; i++){
                additionalFields.value[i].value = '';
            }
            emit('reset-employee-details')
        }
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        
        onBeforeMount(()=>{ 
            updateFormFields();
            updateAdditionalFormFields();
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
            additional_flex_basis.value = '1/3';
            additional_flex_basis_percentage.value = '33.333';
        })
        onMounted(()=>{
            emitUpdatedFields();
        })

        return{
            componentKey, formFields, additionalFields, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, mainComponentKey,handleReset, loader, showLoader, hideLoader,
            emitUpdatedFields
        }
    }
})
</script>