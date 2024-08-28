<template>
    <h2><strong>Tenant Details</strong></h2>
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
    <div class="flex-1 basis-full px-2">
      <button @click="openLeaseDetails" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-arrow-right text-xs mr-1.5" aria-hidden="true"></i>Next</button>
    </div>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default defineComponent({
    name: 'Tenant_Biodata',
    components:{
         DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const mainComponentKey = ref(0);
        const componentKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const selectedTenant = computed(()=> store.state.Active_Tenants.selectedTenant);
        const isEditing = computed(()=> store.state.Active_Tenants.isEditing);
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'tenant_code',label: "Code", value: selectedTenant.value?.tenant_code || '', required: false },
                { type: 'text', name: 'tenant_name',label: "Tenant Name", value: selectedTenant.value?.tenant_name || '', required: true },
                { type: 'text', name: 'phone_number',label: "Phone Number", value: selectedTenant.value?.phone_number || '', required: true, placeholder: '' },
                { type: 'text', name: 'id_number',label: "ID Number", value: selectedTenant.value?.id_number || '', required: true, placeholder: '' },
                { type: 'dropdown', name: 'gender',label: "Gender", value: selectedTenant.value?.gender || '', placeholder: "Gender", required: true, options: [{ text: 'Male', value: 'Male' }, { text: 'Female', value: 'Female' }, { text: 'Others', value: 'Others' }] },
                { type: 'text', name: 'email',label: "Email", value: selectedTenant.value?.email || '', required: true },
                { type: 'text', name: 'kra_pin',label: "Tax Pin", value: selectedTenant.value?.kra_pin || '', required: true },
                { type: 'dropdown', name: 'tenant_type',label: "Tenant Type", value: selectedTenant.value?.tenant_type || '', placeholder: "Tenant Type", required: true, options: [{ text: 'Individual', value: 'Individual' }, { text: 'Company', value: 'Company' }] },
                { type: 'text', name: 'country',label: "Country", value: selectedTenant.value?.country || 'Kenya', required: true },
                { type: 'text', name: 'address',label: "Address", value: selectedTenant.value?.address || '', required: false },
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

        watch([selectedTenant], () => {
            if (selectedTenant.value) {
                updateFormFields();
            }
        }, { immediate: true });

        const additionalFields = ref([]);
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                { type: 'text', name: 'contact_names',label: "Name", value: selectedTenant.value?.contact_names || '', required: false },
                { type: 'text', name: 'contact_phone_number',label: "Phone Number", value: selectedTenant.value?.contact_phone_number || '', required: false },
                { type: 'text', name: 'contact_email',label: "Email", value: selectedTenant.value?.contact_email || '', required: false },
                { type: 'text', name: 'contact_relationship',label: "Relationship", value: selectedTenant.value?.contact_relationship || '', required: false },
            ];
        };
        watch([selectedTenant], () => {
            if(selectedTenant.value){
                updateAdditionalFormFields();
            }
            
        }, { immediate: true });
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const openLeaseDetails = () =>{
            // errors.value = [];
            // for(let i=0; i < formFields.value.length; i++){
            //     if(formFields.value[i].value =='' && formFields.value[i].required){
            //         errors.value.push('Error');
            //     }
            // }
            // if(errors.value.length){
            //     toast.error('Fill In Required Fields');
            // }else{
            //     store.dispatch('Active_Tenants/updateState', {currentTab: "Lease_Details"})
            // }
            store.dispatch('Active_Tenants/updateState', {currentTab: "Lease_Details"})
            
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
            additional_flex_basis_percentage, mainComponentKey,handleReset, loader, showLoader, hideLoader,
            openLeaseDetails
        }
    }
})
</script>