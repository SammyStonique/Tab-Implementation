<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveSetup" @handleReset="handleReset"> 
                    <template v-slot:additional-content>
                        <div class="border border-slate-200 rounded relative py-3 mt-3 px-2 flex">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">STK Push Setup</h1>
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
    name: 'Mpesa_Setup_Details',
    components:{
        PageStyleComponent, DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const mainComponentKey = ref(0);
        const componentKey = ref(0);
        const keyComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const displayButtons = ref(true);
        const isEditing = computed(()=> store.state.Companies.isEditing);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const selectedSetup = computed(()=> store.state.Mpesa_Integrations.selectedSetup);
        const selectedCashbook = computed(()=> store.state.Mpesa_Integrations.selectedCashbook);
        const selectedKey = computed(()=> store.state.Mpesa_Integrations.selectedKey);
        const keyArray = computed(() => store.state.Mpesa_Integrations.mpesaArr);
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const ledgerID = ref('');
        const keyID = ref('');

        const fetchLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value, ledger_type: 'Cashbook'})
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            ledgerID.value = store.state.Ledgers.ledgerID;
        };
        const clearSelectedLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            ledgerID.value = ""
        }
        const fetchKeys = async() =>{
            await store.dispatch('Mpesa_Integrations/fetchMpesaAuthentications', {company:companyID.value})
        };
        const handleSelectedKey = async(option) =>{
            await store.dispatch('Mpesa_Integrations/handleSelectedLedger', option)
            keyID.value = store.state.Mpesa_Integrations.mpesaID;
        };
        const clearSelectedKey = async() =>{
            await store.dispatch('Mpesa_Integrations/updateState', {mpesaID: ''});
            keyID.value = ""
        }

        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'short_code',label: "Short Code", value: selectedSetup.value?.short_code || '', required: true },
                { type: 'dropdown', name: 'config_type',label: "Type", value: selectedSetup.value?.config_type || 'Primary', placeholder: "", required: true, options: [{ text: 'Primary', value: 'Primary' }, { text: 'Secondary', value: 'Secondary' }] },
                { type: 'dropdown', name: 'transaction_type',label: "Transaction Type", value: selectedSetup.value?.transaction_type || 'Business Buy Goods', placeholder: "", required: true, options: [{ text: 'Business Pay Bill', value: 'Business Pay Bill' }, { text: 'Business Buy Goods', value: 'Business Buy Goods' }] },
                { type: 'text', name: 'confirmation_url',label: "Confirmation URL", value: selectedSetup.value?.confirmation_url || '', required: true },
                { type: 'text', name: 'validation_url',label: "Validation URL", value: selectedSetup.value?.validation_url || '', required: true },
                { type: 'text', name: 'register_url',label: "Register URL", value: selectedSetup.value?.register_url || 'https://api.safaricom.co.ke/mpesa/c2b/v2/registerurl', required: true },
                { type: 'text', name: 'response_type',label: "Response Type", value: selectedSetup.value?.response_type || 'Cancelled', required: true },
                {
                    type:'search-dropdown', label:"Consumer Key", value: keyID.value, componentKey: keyComponentKey,
                    selectOptions: keyArray, optionSelected: handleSelectedKey, required: true,
                    searchPlaceholder: 'Select Consumer Key...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchKeys(), clearSearch: clearSelectedKey()  
                },
                {
                    type:'search-dropdown', label:"Cashbook", value: ledgerID.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Cashbook...', dropdownWidth: '400px', updateValue: selectedCashbook.value,
                    fetchData: fetchLedgers(), clearSearch: clearSelectedLedger()  
                },
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

        watch([selectedSetup], () => {
            if (selectedSetup.value) {
                updateFormFields();
            }
        }, { immediate: true });

        const additionalFields = ref([]);
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                { type: 'text', name: 'stk_pass_key',label: "STK Push Pass Key", value: selectedSetup.value?.stk_pass_key || '', placeholder: "", required: false },
                { type: 'text', name: 'stk_callback_url',label: "STK Push Callback URL", value: selectedSetup.value?.stk_callback_url || '', placeholder: "", required: false },
                { type: 'text', name: 'stk_process_url',label: "STK Push Process URL", value: selectedSetup.value?.stk_process_url || 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', placeholder: "", required: false },
            ];
        };
        watch([selectedSetup], () => {
            if(selectedSetup.value){
                updateAdditionalFormFields();
            }
            
        }, { immediate: true });
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createSetup = async() =>{
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
                status: "Active",
                pms_module: additionalFields.value[0].value,
                accounts_module: additionalFields.value[1].value,
                hr_module: additionalFields.value[4].value,
                inventory_module: additionalFields.value[2].value,
                hms_module: additionalFields.value[3].value,
                settings_module: additionalFields.value[5].value,
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
                    const response = await store.dispatch('Mpesa_Integrations/createMpesaEndpoint', formData);
                    if (response) {
                        hideLoader();
                        toast.success('Setup created successfully!');
                        handleReset();
                        mainComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Setup.');
                        hideLoader();
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Setup: ' + error.message);
                } finally {
                    hideLoader();
                }              
            }
        }

        const updateSetup = async() => {
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
                    company: selectedSetup.value.company_id,
                    name: formFields.value[0].value,
                    kra_pin: formFields.value[4].value,
                    town: formFields.value[6].value,
                    address: formFields.value[5].value,
                    email: formFields.value[2].value,
                    phone_number: formFields.value[3].value,
                    registration_number: formFields.value[1].value,
                    country: formFields.value[7].value,
                    status: selectedSetup.value.status,
                    pms_module: additionalFields.value[0].value,
                    accounts_module: additionalFields.value[1].value,
                    hr_module: additionalFields.value[4].value,
                    inventory_module: additionalFields.value[2].value,
                    hms_module: additionalFields.value[3].value,
                    settings_module: additionalFields.value[5].value,
                };

                try {
                        const response = await store.dispatch('Mpesa_Integrations/updateMpesaEndpoint', updatedCompany);
                        if (response) {
                            hideLoader();
                            toast.success('Setup updated successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                            store.dispatch("Mpesa_Integrations/updateState",{selectedSetup:null})
                        } else {
                            toast.error('An error occurred while updating the Setup.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to update Setup: ' + error.message);
                    } finally {
                        hideLoader();
                    }
            }                    
        };

        const saveSetup = () =>{
            if(isEditing.value == true){
                updateSetup();
            }else{
                createSetup();
            }
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

        })

        return{
            componentKey, formFields, additionalFields, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, displayButtons, saveSetup, mainComponentKey,
            handleReset, isEditing, loader, showLoader, hideLoader
        }
    }
})
</script>