<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveProperty" @handleReset="handleReset"> 
                    <template v-slot:additional-content>
                        <div class="border border-slate-200 rounded relative py-3 mt-3 px-2 min-h-[450px]">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Penalty & Payment Terms</h1>
                            <div class="px-3 flex">
                                <DynamicForm :fields="additionalFields" :flex_basis="additional_flex_basis" :flex_basis_percentage="additional_flex_basis_percentage" @handleReset="handleReset"/>
                            </div>
                            <div class="px-3 flex">
                                <div class="basis-1/2 text-left">
                                    <label for="">Payment Info:</label><br />
                                    <quill-editor :key="editorComponentKey" v-model:value="paymentInfo"></quill-editor>
                                </div>
                                <div class="basis-1/2 text-left">
                                    <label for="" class="text-left">Payment Terms:</label><br />
                                    <quill-editor :key="editorComponentKey" v-model:value="paymentTerms"></quill-editor>
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
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useDateFormatter } from '@/composables/DateFormatter';
import { useToast } from "vue-toastification";
import { quillEditor } from 'vue3-quill'

export default defineComponent({
    name: 'Property_Details',
    components:{
        PageStyleComponent, DynamicForm,quillEditor
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const mainComponentKey = ref(0);
        const editorComponentKey = ref(0);
        const componentKey = ref(0);
        const landComponentKey = ref(0);
        const zoneComponentKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const displayButtons = ref(true);
        const isEditing = computed(()=> store.state.Properties_List.isEditing);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const selectedProperty = computed(()=> store.state.Properties_List.selectedProperty);
        const selectedLandlord = computed(()=> store.state.Properties_List.selectedLandlord);
        const selectedZone = computed(()=> store.state.Properties_List.selectedZone);
        const landlordArray = computed(() => store.state.Landlords_List.landlordArr);
        const landlordID = ref('');
        const zoneArray = computed(() => store.state.Zones.zoneArr);
        const zoneID = ref('');
        const paymentInfo = ref('');
        const paymentTerms = ref('');

        const handleSelectedLandlord = async(option) =>{
            await store.dispatch('Landlords_List/handleSelectedLandlord', option)
            landlordID.value = store.state.Landlords_List.landlordID;
            if(selectedProperty.value){
                selectedProperty.value.landlord.landlord_id = landlordID.value;
                landlordValue.value = landlordID.value
            }
        }
        const handleSelectedZone = async(option) =>{
            await store.dispatch('Zones/handleSelectedZone', option)
            zoneID.value = store.state.Zones.zoneID;
            if(selectedProperty.value){
                selectedProperty.value.zone.zone_id = zoneID.value;
                zoneValue.value = zoneID.value
            }
        }
        const formFields = ref([]);
        const landlordValue = computed(() => {
           return (selectedProperty.value && selectedProperty.value.landlord && !landlordID.value) ? selectedProperty.value.landlord.landlord_id : landlordID.value;

        });
        const zoneValue = computed(() => {
            return (selectedProperty.value && selectedProperty.value.zone && !zoneID.value) ? selectedProperty.value.zone.zone_id : zoneID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Landlord", value: landlordValue.value, componentKey: landComponentKey,
                    selectOptions: landlordArray, optionSelected: handleSelectedLandlord, required: true,
                    searchPlaceholder: 'Select Landlord...', dropdownWidth: '400px', updateValue: selectedLandlord.value,
                    fetchData: store.dispatch('Landlords_List/fetchLandlords', {company:companyID.value})
                },
                { type: 'text', name: 'property_code',label: "Code", value: selectedProperty.value?.property_code || '', required: false },
                { type: 'text', name: 'name',label: "Name", value: selectedProperty.value?.name || '', required: true },
                { type: 'text', name: 'lr_number',label: "L.R Number", value: selectedProperty.value?.lr_number || '', required: true, placeholder: '' },
                { type: 'dropdown', name: 'property_type',label: "Property Type", value: selectedProperty.value?.property_type || '', placeholder: "", required: true, options: [{ text: 'Residential', value: 'Residential' }, { text: 'Commercial', value: 'Commercial' }] },
                { type: 'text', name: 'kra_pin',label: "Tax Pin", value: selectedProperty.value?.kra_pin || '', required: true },
                { type: 'text', name: 'address',label: "Address", value: selectedProperty.value?.address || '', required: true },
                
                {  
                    type:'search-dropdown', label:"Zone", value: zoneValue.value, componentKey: zoneComponentKey,
                    selectOptions: zoneArray, optionSelected: handleSelectedZone, required: true,
                    searchPlaceholder: 'Select Zone...', dropdownWidth: '400px', updateValue: selectedZone.value,
                    fetchData: store.dispatch('Zones/fetchZones', {company:companyID.value})
                },
                { type: 'dropdown', name: 'invoice_mode',label: "Invoice Mode", value: selectedProperty.value?.invoice_mode || 'Separate All', placeholder: "", required: true, options: [{ text: 'Combine All', value: 'Combine All' }, { text: 'Separate All', value: 'Separate All' },{ text: 'Combine Utilities', value: 'Combine Utilities' }] },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].label == 'Invoice Mode'){
                    formFields.value[i].value = 'Separate All';
                }else{
                    formFields.value[i].value = '';
                }         
            }
            landlordID.value = '';
            zoneID.value = '';
            for(let i=0; i < additionalFields.value.length; i++){
                additionalFields.value[i].value = '';
            }
            landComponentKey.value += 1;
            zoneComponentKey.value += 1;
            mainComponentKey.value += 1;
            editorComponentKey.value += 1;
            paymentInfo.value = "";
            paymentTerms.value = "";
        }

        watch([selectedProperty, selectedLandlord, selectedZone], () => {
            if (selectedProperty.value && selectedLandlord.value && selectedZone.value) {
                landComponentKey.value += 1;
                zoneComponentKey.value += 1;
                paymentInfo.value = selectedProperty.value.payment_info;
                paymentTerms.value = selectedProperty.value.payment_terms;
                mainComponentKey.value += 1;
                editorComponentKey.value += 1;
                updateFormFields();
            }
        }, { immediate: true });

        const additionalFields = ref([]);
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                { type: 'dropdown', name: 'penalize',label: "Penalize", value: selectedProperty.value?.penalize || '', placeholder: "", required: false, options: [{ text: 'Yes', value: 'True' }, { text: 'No', value: 'False' }] },
                { type: 'dropdown', name: 'penalty_charge_mode',label: "Penalty Charge Mode", value: selectedProperty.value?.penalty_charge_mode || '', placeholder: "Charge Mode", required: false, options: [{ text: 'Fixed Amount', value: 'Fixed Amount' }, { text: '% of Current Balance', value: 'Current Balance Percentage' }, { text: '% of Total Balance', value: 'Total Balance Percentage' }, { text: '% of Current Rent Only Balance', value: 'Current Rent Only Balance Percentage' }, { text: '% of Total Rent Only Balance', value: 'Total Rent Only Balance Percentage' }] },
                { type: 'text', name: 'penalty_charge_value',label: "Penalty Charge Value", value: selectedProperty.value?.penalty_charge_value || '0', required: false },
                { type: 'text', name: 'penalty_day',label: "Penalty Day", value: selectedProperty.value?.penalty_day || '', required: false },
                {required:false},
                {required:false},
            ];
        };
        watch([selectedProperty, selectedLandlord, selectedZone], () => {
            if(selectedProperty.value  && selectedLandlord.value && selectedZone.value){
                landComponentKey.value += 1;
                zoneComponentKey.value += 1;
                paymentInfo.value = selectedProperty.value.payment_info;
                paymentTerms.value = selectedProperty.value.payment_terms;
                mainComponentKey.value += 1;
                editorComponentKey.value += 1;
                updateAdditionalFormFields();
            }
            
        }, { immediate: true });
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createProperty = async() =>{
            showLoader();
            let formData = {
                company: companyID.value,
                property_code: formFields.value[1].value,
                property_type: formFields.value[4].value,
                status: "Active",
                name: formFields.value[2].value,
                kra_pin: formFields.value[5].value,
                lr_number: formFields.value[3].value,
                address: formFields.value[6].value,
                invoice_mode: formFields.value[8].value,
                penalize: additionalFields.value[0].value,
                penalty_charge_mode: additionalFields.value[1].value,
                penalty_charge_value: additionalFields.value[2].value,
                penalty_day: additionalFields.value[3].value,
                payment_terms: paymentTerms.value,
                payment_info: paymentInfo.value,
                zone: zoneID.value,
                zone_id: zoneID.value,
                landlord: landlordID.value,
                landlord_id: landlordID.value,
            }

            errors.value = [];
            for(let i=1; i < (formFields.value.length - 1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(landlordValue.value == '' || zoneValue.value == ''){
                errors.value.push('Error');
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
                    const response = await store.dispatch('Properties_List/createProperty', formData);
                    if (response && response.status === 200) {
                        hideLoader();
                        toast.success('Property created successfully!');
                        handleReset();
                        mainComponentKey.value += 1;
                        landComponentKey.value += 1;
                        zoneComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the property.');
                        hideLoader();
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create property: ' + error.message);
                } finally {
                    hideLoader();
                }              
            }
        }

        const updateProperty = async() => {
            showLoader();
            errors.value = [];
            for(let i=2; i < (formFields.value.length -1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            for(let i=0; i < additionalFields.value.length; i++){
                if(additionalFields.value[i].value =='' && additionalFields.value[i].required == true){
                    errors.value.push(additionalFields.value[i].label);
                }
            }
            if(landlordValue.value == '' || zoneValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
                    hideLoader();
            }else{
                const updatedProperty = {
                    property: selectedProperty.value.property_id,
                    company: companyID.value,
                    property_code: formFields.value[1].value,
                    property_type: formFields.value[4].value,
                    status: selectedProperty.value.status,
                    name: formFields.value[2].value,
                    kra_pin: formFields.value[5].value,
                    lr_number: formFields.value[3].value,
                    address: formFields.value[6].value,
                    invoice_mode: formFields.value[8].value,
                    penalize: additionalFields.value[0].value,
                    penalty_charge_mode: additionalFields.value[1].value,
                    penalty_charge_value: additionalFields.value[2].value,
                    penalty_day: additionalFields.value[3].value,
                    payment_terms: paymentTerms.value,
                    payment_info: paymentInfo.value,
                    zone: zoneValue.value,
                    zone_id: zoneValue.value,
                    landlord: landlordValue.value,
                    landlord_id: landlordValue.value,
                };
       
                try {
                        const response = await store.dispatch('Properties_List/updateProperty', updatedProperty);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Property updated successfully!');
                            handleReset();
                            await store.dispatch('Landlords_List/updateState',{landlordID:''})
                            await store.dispatch('Zones/updateState',{zoneID:''})
                            await store.dispatch("Properties_List/updateState",{selectedProperty:null,selectedLandlord:null,selectedZone:null})
                            landComponentKey.value += 1;
                            zoneComponentKey.value += 1;
                            mainComponentKey.value += 1;
                        } else {
                            toast.error('An error occurred while updating the property.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to update property: ' + error.message);
                    } finally {
                        hideLoader();
                    }
            }                    
        };

        const saveProperty = () =>{
            if(isEditing.value == true){
                updateProperty();
            }else{
                createProperty();
            }
        }
        
        onBeforeMount(()=>{ 
            updateFormFields();
            updateAdditionalFormFields();
            landComponentKey.value += 1;
            zoneComponentKey.value += 1;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
            additional_flex_basis.value = '1/4';
            additional_flex_basis_percentage.value = '25';
        })
        onMounted(()=>{

        })

        return{
            componentKey, formFields, additionalFields, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, displayButtons, saveProperty, mainComponentKey,editorComponentKey,
            handleReset, isEditing, loader, showLoader, hideLoader,paymentInfo,paymentTerms
        }
    }
})
</script>