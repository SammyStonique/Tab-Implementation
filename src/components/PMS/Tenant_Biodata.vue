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
        const componentKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const isEditing = computed(()=> store.state.Active_Tenants.isEditing);
        const formFields = ref(props.formFields);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'tenant_code',label: "Code", value: '', required: false },
                { type: 'text', name: 'tenant_name',label: "Tenant Name", value: '', required: true },
                { type: 'text', name: 'phone_number',label: "Phone Number", value: '', required: true, placeholder: '' },
                { type: 'text', name: 'id_number',label: "ID Number", value: '', required: true, placeholder: '' },
                { type: 'dropdown', name: 'gender',label: "Gender", value: '', placeholder: "", required: true, options: [{ text: 'Male', value: 'Male' }, { text: 'Female', value: 'Female' }, { text: 'Others', value: 'Others' }] },
                { type: 'text', name: 'email',label: "Email", value: '', required: true },
                { type: 'text', name: 'kra_pin',label: "Tax Pin", value: '', required: true },
                { type: 'dropdown', name: 'tenant_type',label: "Tenant Type", value: '', placeholder: "", required: true, options: [{ text: 'Individual', value: 'Individual' }, { text: 'Company', value: 'Company' }] },
                { type: 'text', name: 'country',label: "Country", value: 'Kenya', required: true },
                { type: 'text', name: 'address',label: "Address", value: '', required: false },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].label != 'Country'){
                    formFields.value[i].value = '';
                }
            }
            for(let i=0; i < additionalFields.value.length; i++){
                additionalFields.value[i].value = '';
            }
            emit('reset-tenant-details')
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
            additional_flex_basis.value = '1/4';
            additional_flex_basis_percentage.value = '25';
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