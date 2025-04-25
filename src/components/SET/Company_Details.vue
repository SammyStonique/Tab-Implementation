<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveCompany" @handleReset="handleReset"> 
                    <template v-slot:additional-content>
                        <div class="border border-slate-200 rounded relative py-3 mt-3 px-2 flex">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Company Modules</h1>
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

export default defineComponent({
    name: 'Company_Details',
    components:{
        PageStyleComponent, DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const mainComponentKey = ref(0);
        const componentKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const displayButtons = ref(true);
        const isEditing = computed(()=> store.state.Companies.isEditing);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const selectedCompany = computed(()=> store.state.Companies.selectedCompany);

        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'name',label: "Name", value: selectedCompany.value?.name || '', required: true },
                { type: 'text', name: 'registration_number',label: "Reg. Number", value: selectedCompany.value?.registration_number || '', required: true },
                { type: 'text', name: 'email',label: "Email", value: selectedCompany.value?.email || '', required: true, placeholder: '' },
                { type: 'text', name: 'phone_number',label: "Phone Number", value: selectedCompany.value?.phone_number || '', required: true },
                { type: 'text', name: 'kra_pin',label: "Tax Pin", value: selectedCompany.value?.kra_pin || '', required: true },
                { type: 'text', name: 'address',label: "Address", value: selectedCompany.value?.address || '', required: true },
                { type: 'text', name: 'town',label: "Town", value: selectedCompany.value?.town || '', required: true },
                { type: 'text', name: 'country',label: "Country", value: selectedCompany.value?.country || 'Kenya', required: true },
                { type: 'dropdown', name: 'regime',label: "Tax Regime", value: selectedCompany.value?.regime || 'Kenya', placeholder: "", required: true, options: [{ text: 'Kenya', value: 'Kenya' }, { text: 'South Sudan', value: 'South Sudan' },{ text: 'Uganda', value: 'Uganda' }, { text: 'Tanzania', value: 'Tanzania' }] },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }

            for(let i=0; i < additionalFields.value.length; i++){
                additionalFields.value[i].value = '';
            }
        }

        watch([selectedCompany], () => {
            if (selectedCompany.value) {
                updateFormFields();
            }
        }, { immediate: true });

        const additionalFields = ref([]);
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                { type: 'dropdown', name: 'pms_module',label: "Property Management", value: selectedCompany.value?.pms_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },
                { type: 'dropdown', name: 'accounts_module',label: "Financial Accounts", value: selectedCompany.value?.accounts_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },
                { type: 'dropdown', name: 'inventory_module',label: "Inventory Management", value: selectedCompany.value?.inventory_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },
                { type: 'dropdown', name: 'hms_module',label: "Hospital Management", value: selectedCompany.value?.hms_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },
                { type: 'dropdown', name: 'hr_module',label: "Human Resource", value: selectedCompany.value?.hr_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },
                { type: 'dropdown', name: 'settings_module',label: "Settings", value: selectedCompany.value?.settings_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },
                { type: 'dropdown', name: 'hhs_module',label: "Hotel Management", value: selectedCompany.value?.hhs_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },
                { type: 'dropdown', name: 'mms_module',label: "Membership Management", value: selectedCompany.value?.mms_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },  
                { type: 'dropdown', name: 'pss_module',label: "Property Sales", value: selectedCompany.value?.pss_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] }, 
                { type: 'dropdown', name: 'vss_module',label: "Vehicle Sales", value: selectedCompany.value?.vss_module || 'Disabled', placeholder: "", required: true, options: [{ text: 'Enabled', value: 'Enabled' }, { text: 'Disabled', value: 'Disabled' }] },       
                {required: false},
                {required: false},
            ];
        };
        watch([selectedCompany], () => {
            if(selectedCompany.value){
                updateAdditionalFormFields();
            }
            
        }, { immediate: true });
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createCompany = async() =>{
            showLoader();
            let formData = {
                name: formFields.value[0].value,
                kra_pin: formFields.value[4].value,
                town: formFields.value[6].value,
                address: formFields.value[5].value,
                email: formFields.value[2].value,
                phone_number: formFields.value[3].value,
                registration_number: formFields.value[1].value,
                country: formFields.value[7].value,
                regime: formFields.value[8].value,
                status: "Active",
                pms_module: additionalFields.value[0].value,
                accounts_module: additionalFields.value[1].value,
                hr_module: additionalFields.value[4].value,
                inventory_module: additionalFields.value[2].value,
                hms_module: additionalFields.value[3].value,
                settings_module: additionalFields.value[5].value,
                hhs_module: additionalFields.value[6].value,
                mms_module: additionalFields.value[7].value,
                pss_module: additionalFields.value[8].value,
                vss_module: additionalFields.value[9].value,
            }

            errors.value = [];
            for(let i=0; i < (formFields.value.length); i++){
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
                    const response = await store.dispatch('Companies/createCompany', formData);
                    if (response) {
                        hideLoader();
                        toast.success('Company created successfully!');
                        handleReset();
                        mainComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Company.');
                        hideLoader();
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Company: ' + error.message);
                } finally {
                    hideLoader();
                }              
            }
        }

        const updateCompany = async() => {
            showLoader();
            errors.value = [];
            for(let i=0; i < (formFields.value.length); i++){
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
                const updatedCompany = {
                    company: selectedCompany.value.company_id,
                    name: formFields.value[0].value,
                    kra_pin: formFields.value[4].value,
                    town: formFields.value[6].value,
                    address: formFields.value[5].value,
                    email: formFields.value[2].value,
                    phone_number: formFields.value[3].value,
                    registration_number: formFields.value[1].value,
                    country: formFields.value[7].value,
                    regime: formFields.value[8].value,
                    status: selectedCompany.value.status,
                    pms_module: additionalFields.value[0].value,
                    accounts_module: additionalFields.value[1].value,
                    hr_module: additionalFields.value[4].value,
                    inventory_module: additionalFields.value[2].value,
                    hms_module: additionalFields.value[3].value,
                    settings_module: additionalFields.value[5].value,
                    hhs_module: additionalFields.value[6].value,
                    mms_module: additionalFields.value[7].value,
                    pss_module: additionalFields.value[8].value,
                    vss_module: additionalFields.value[9].value,
                };

                try {
                        const response = await store.dispatch('Companies/updateCompany', updatedCompany);
                        if (response) {
                            hideLoader();
                            toast.success('Company updated successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                            store.dispatch("Companies/updateState",{selectedCompany:null})
                        } else {
                            toast.error('An error occurred while updating the Company.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to update Company: ' + error.message);
                    } finally {
                        hideLoader();
                    }
            }                    
        };

        const saveCompany = () =>{
            if(isEditing.value == true){
                updateCompany();
            }else{
                createCompany();
            }
        }
        
        onBeforeMount(()=>{ 
            updateFormFields();
            updateAdditionalFormFields();
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
            additional_flex_basis.value = '1/4';
            additional_flex_basis_percentage.value = '25';
        })
        onMounted(()=>{

        })

        return{
            componentKey, formFields, additionalFields, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, displayButtons, saveCompany, mainComponentKey,
            handleReset, isEditing, loader, showLoader, hideLoader
        }
    }
})
</script>