<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveUser" @handleReset="handleReset"> 
                    <template v-slot:additional-content>
                        <div class="border border-slate-200 rounded relative py-3 mt-3 px-2 flex">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">User Allowed Modules</h1>
                            <div class="px-3">
                                <DynamicForm :fields="additionalFields" :flex_basis="additional_flex_basis" :flex_basis_percentage="additional_flex_basis_percentage" @handleReset="handleReset"/>
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
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useDateFormatter } from '@/composables/DateFormatter';
import { useToast } from "vue-toastification";
import axios from 'axios';

export default defineComponent({
    name: 'User_Details',
    components:{
        PageStyleComponent, DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const mainComponentKey = ref(0);
        const componentKey = ref(0);
        const depComponentKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const displayButtons = ref(true);
        const isEditing = computed(()=> store.state.userData.isEditing);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const selectedUser = computed(()=> store.state.userData.selectedUser);
        const selectedDepartment = computed(()=> store.state.userData.selectedDepartment);
        const depArray = computed(() => store.state.Departments.depArr);
        const depID = ref('');
        const temporary_password = ref('');
        const userDetails = ref([]);

        const fetchDepartments = () =>{
            store.dispatch('Departments/fetchDepartments', {company: companyID.value})
        }

        const handleSelectedDepartment = async(option) =>{
            await store.dispatch('Departments/handleSelectedDepartment', option)
            depID.value = store.state.Departments.depID;
            if(selectedUser.value){
                selectedUser.value.user_department.department_id = depID.value;
                depValue.value = depID.value;
            }
        }

        const formFields = ref([]);
        const depValue = computed(() => {
           return (selectedUser.value && selectedUser.value.user_department.department_id && !depID.value) ? selectedUser.value.user_department.department_id : depID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'first_name',label: "First Name", value: selectedUser.value?.first_name || '', required: true },
                { type: 'text', name: 'last_name',label: "Last Name", value: selectedUser.value?.last_name || '', required: true },
                { type: 'text', name: 'identification_no',label: "ID Number", value: selectedUser.value?.identification_no || '', required: true },
                { type: 'text', name: 'email',label: "Email", value: selectedUser.value?.email || '', required: true, placeholder: '' },
                { type: 'text', name: 'phone_number',label: "Phone Number", value: selectedUser.value?.phone_number || '', required: true },
                { type: 'date', name: 'birth_date',label: "D.O.B", value: selectedUser.value?.birth_date || '', required: true },
                { type: 'dropdown', name: 'gender',label: "Gender", value: selectedUser.value?.gender || '', placeholder: "", required: true, options: [{ text: 'Male', value: 'Male' }, { text: 'Female', value: 'Female' }, { text: 'Other', value: 'Other' }] },
                { type: 'dropdown', name: 'profile',label: "Profile", value: selectedUser.value?.profile || '', placeholder: "", required: true, options: [{text:'Admin',value:'Admin'},{text:'Property Manager',value:'Property Manager'},{text:'Accountant',value:'Accountant'},{text:'Human Resource',value:'Human Resource'},{text:'Credit Officer',value:'Credit Officer'},{text:'Doctor',value:'Doctor'},{text:'Office Clerk',value:'Office Clerk'},{text:'Clinical Officer',value:'Clinical Officer'}] },

                {  
                    type:'search-dropdown', label:"Department", value: depValue.value, componentKey: depComponentKey,
                    selectOptions: depArray, optionSelected: handleSelectedDepartment, required: false,
                    searchPlaceholder: 'Select Department...', dropdownWidth: '400px', updateValue: selectedDepartment.value,
                },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            depID.value = '';
            for(let i=0; i < additionalFields.value.length; i++){
                additionalFields.value[i].value = '';
            }
            depComponentKey.value += 1;
        }

        watch([selectedUser, selectedDepartment], () => {
            if (selectedUser.value && selectedDepartment.value) {
                depComponentKey.value += 1;
                updateFormFields();
            }
        }, { immediate: true });

        const additionalFields = ref([]);
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                { type: 'dropdown', name: 'pms_module',label: "Property Management", value: selectedUser.value?.pms_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },
                { type: 'dropdown', name: 'accounts_module',label: "Financial Accounts", value: selectedUser.value?.accounts_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },
                { type: 'dropdown', name: 'inventory_module',label: "Inventory Management", value: selectedUser.value?.inventory_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },
                { type: 'dropdown', name: 'hms_module',label: "Hospital Management", value: selectedUser.value?.hms_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },
                { type: 'dropdown', name: 'hr_module',label: "Human Resource", value: selectedUser.value?.hr_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },
                { type: 'dropdown', name: 'settings_module',label: "Settings", value: selectedUser.value?.settings_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },
                { type: 'dropdown', name: 'hhs_module',label: "Hotel Management", value: selectedUser.value?.hhs_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },
                { type: 'dropdown', name: 'mms_module',label: "Membership Management", value: selectedUser.value?.mms_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },
                { type: 'dropdown', name: 'pss_module',label: "Property Sales", value: selectedUser.value?.pss_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] }, 
                { type: 'dropdown', name: 'vss_module',label: "Vehicle Sales", value: selectedUser.value?.vss_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },  
                {required: false},
                {required: false},
            ];
        };
        watch([selectedUser, selectedDepartment], () => {
            if(selectedUser.value  && selectedDepartment.value){
                depComponentKey.value += 1;
                updateAdditionalFormFields();
            }
            
        }, { immediate: true });
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createUser = async() =>{
            showLoader();

            errors.value = [];
            for(let i=0; i < (formFields.value.length - 1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            for(let i=0; i < additionalFields.value.length; i++){
                if(additionalFields.value[i].value =='' && additionalFields.value[i].required == true){
                    errors.value.push(additionalFields.value[i].label);
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }else{            
                try {
                    const response1 = await axios.get("api/v1/pass-gen/");
                    temporary_password.value = response1.data;

                    let formData = {
                        company: companyID.value,
                        first_name: formFields.value[0].value,
                        last_name: formFields.value[1].value,
                        is_staff: true,
                        is_active: true,
                        email: formFields.value[3].value,
                        identification_no: formFields.value[2].value,
                        birth_date: formFields.value[5].value,
                        gender: formFields.value[6].value,
                        phone_number: formFields.value[4].value,
                        profile: formFields.value[7].value,
                        pms_module: additionalFields.value[0].value,
                        hms_module: additionalFields.value[3].value,
                        accounts_module: additionalFields.value[1].value,
                        hr_module: additionalFields.value[4].value,
                        inventory_module: additionalFields.value[2].value,
                        settings_module: additionalFields.value[5].value,
                        hhs_module: additionalFields.value[6].value,
                        mms_module: additionalFields.value[7].value,
                        pss_module: additionalFields.value[8].value,
                        vss_module: additionalFields.value[9].value,
                        user_department: depValue.value,
                        password: temporary_password.value
                    }

                    const response2 = await axios.post("api/v1/users/", formData);
                    if (response2.status == 201){
                        userDetails.value = response2.data;

                        let formData1 ={
                            temporary_password: temporary_password.value,
                            company: companyID.value
                        }

                        await axios.post(`api/v1/user-credentials/${userDetails.value.user_id}/`, formData1)
                        .then(()=>{
                            hideLoader();
                            toast.success('User created successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                            depComponentKey.value += 1;
                        })
                        
                    }else {
                        toast.error('An error occurred while creating the User.');
                        hideLoader();
                    }
                    
                } catch (error) {
                    toast.error('Failed to create User: ' + error.message);
                } finally {
                    hideLoader();
                }              
            }
        }

        const updateUser = async() => {
            showLoader();
            errors.value = [];
            for(let i=0; i < (formFields.value.length -1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            for(let i=0; i < additionalFields.value.length; i++){
                if(additionalFields.value[i].value =='' && additionalFields.value[i].required == true){
                    errors.value.push(additionalFields.value[i].label);
                }
            }
            if(depValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
                    hideLoader();
            }else{
                const updatedUser = {
                    user: selectedUser.value.user_id,
                    company: companyID.value,
                    first_name: formFields.value[0].value,
                    last_name: formFields.value[1].value,
                    is_staff: selectedUser.value.is_staff,
                    is_active: selectedUser.value.is_active,
                    email: formFields.value[3].value,
                    identification_no: formFields.value[2].value,
                    birth_date: formFields.value[5].value,
                    gender: formFields.value[6].value,
                    phone_number: formFields.value[4].value,
                    profile: formFields.value[7].value,
                    pms_module: additionalFields.value[0].value,
                    hms_module: additionalFields.value[3].value,
                    accounts_module: additionalFields.value[1].value,
                    hr_module: additionalFields.value[4].value,
                    inventory_module: additionalFields.value[2].value,
                    settings_module: additionalFields.value[5].value,
                    hhs_module: additionalFields.value[6].value,
                    mms_module: additionalFields.value[7].value,
                    pss_module: additionalFields.value[8].value,
                    vss_module: additionalFields.value[9].value,
                    user_department: depValue.value,
                };

                try {
                        const response = await store.dispatch('userData/updateUser', updatedUser);
                        if (response) {
                            hideLoader();
                            toast.success('User updated successfully!');
                            handleReset();
                            depComponentKey.value += 1;
                            mainComponentKey.value += 1;
                            store.dispatch('Departments/updateState',{depID:''})
                            store.dispatch("userData/updateState",{selectedUser:null, selectedDepartment:null})
                        } else {
                            toast.error('An error occurred while updating the User.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to update User: ' + error.message);
                    } finally {
                        hideLoader();
                    }
            }                    
        };

        const saveUser = () =>{
            if(isEditing.value == true){
                updateUser();
            }else{
                createUser();
            }
        }
        
        onBeforeMount(()=>{ 
            updateFormFields();
            updateAdditionalFormFields();
            depComponentKey.value += 1;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
            additional_flex_basis.value = '1/4';
            additional_flex_basis_percentage.value = '20';
            fetchDepartments();
        })
        onMounted(()=>{

        })

        return{
            componentKey, formFields, additionalFields, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, displayButtons, saveUser, mainComponentKey,
            handleReset, isEditing, loader, showLoader, hideLoader
        }
    }
})
</script>