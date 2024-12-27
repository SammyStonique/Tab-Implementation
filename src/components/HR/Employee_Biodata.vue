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
        const selectedEmployeeDepartment = computed(()=> store.state.Employees.selectedEmployeeDepartment);
        const selectedEmployeeSupervisor = computed(()=> store.state.Employees.selectedEmployeeSupervisor);
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
            if(selectedEmployee.value){
                selectedEmployee.value.employee_department.department_id = departmentID.value;
            }
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
            if(selectedEmployee.value){
                selectedEmployee.value.supervisor.user_id = supervisorID.value;
            }
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
                { type: 'text', name: 'staff_number',label: "Staff Number", value: '', required: false },
                { type: 'text', name: 'tenant_name',label: "Employee Name", value: '', required: true },
                { type: 'text', name: 'phone_number',label: "Phone Number", value: '', required: true, placeholder: '' },
                { type: 'text', name: 'id_number',label: "ID Number", value: '', required: true, placeholder: '' },
                { type: 'date', name: 'dob',label: "D.O.B", value: '', required: true, placeholder: '' },
                { type: 'dropdown', name: 'gender',label: "Gender", value: '', placeholder: "", required: true, options: [{ text: 'Male', value: 'Male' }, { text: 'Female', value: 'Female' }, { text: 'Others', value: 'Others' }] },
                { type: 'text', name: 'email',label: "Email", value: '', required: false },
                { type: 'text', name: 'kra_pin',label: "Tax Pin", value: '', required: false },
                { type: 'dropdown', name: 'marital_status',label: "Marital Status", value: '', placeholder: "", required: true, options: [{ text: 'Single', value: 'Single' }, { text: 'Married', value: 'Married' },{ text: 'Separated', value: 'Separated' }, { text: 'Divorced', value: 'Divorced' },{ text: 'Widowed', value: 'Widowed' }] },
                { type: 'text', name: 'country',label: "Country", value: 'Kenya', required: true },
                { type: 'text', name: 'address',label: "Address", value: '', required: false },
                { type: 'text', name: 'job_title',label: "Job Title", value: '', required: true },
                {  
                    type:'search-dropdown', label:"Department", value: departmentValue.value, componentKey: depComponentKey,
                    selectOptions: depArray, optionSelected: handleSelectedDepartment, required: false,
                    searchPlaceholder: 'Select Department...', dropdownWidth: '500px', updateValue: selectedEmployeeDepartment.value,
                    fetchData: fetchDepartments(), clearSearch: clearSelectedDepartment
                },
                {  
                    type:'search-dropdown', label:"Supervisor", value: supervisorValue.value, componentKey: userComponentKey,
                    selectOptions: usersArray, optionSelected: handleSelectedSupervisor, required: false,
                    searchPlaceholder: 'Select Supervisor...', dropdownWidth: '500px', updateValue: selectedEmployeeSupervisor.value,
                    fetchData: fetchUsers(), clearSearch: clearSelectedSupervisor
                },
                {required:false}
            ];
        };

        watch([departmentID, supervisorID], () => {
            if (departmentID.value != "") {
                formFields.value[12].value = departmentID.value;
            }
            if(supervisorID.value != ""){
                formFields.value[13].value = supervisorID.value;
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


        const additionalFields = ref(props.additionalFields);
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                { type: 'text', name: 'contact_names',label: "Name", value: '', required: false },
                { type: 'text', name: 'contact_phone_number',label: "Phone Number", value: '', required: false },
                { type: 'text', name: 'contact_email',label: "Email", value: '', required: false },
                { type: 'text', name: 'contact_relationship',label: "Relationship", value: '', required: false },
            ];
        };
        const emitUpdatedFields = () => {
            emit('update-form', formFields.value, additionalFields.value);
        };
         
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