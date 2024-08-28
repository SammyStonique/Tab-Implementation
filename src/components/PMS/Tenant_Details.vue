<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <keep-alive :include="cachedComponents">
                    <component 
                        :is="currentTab"
                    />
                </keep-alive>
            </div>
        </template>
    </PageStyleComponent>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import Tenant_Biodata from '@/components/PMS/Tenant_Biodata.vue';
import Lease_Details from '@/components/PMS/Lease_Details.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default defineComponent({
    name: 'Tenant_Details',
    components:{
        PageStyleComponent, Tenant_Biodata, Lease_Details
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const mainComponentKey = ref(0);
        const currentTab = computed(()=> store.state.Active_Tenants.currentTab);
        const isEditing = computed(()=> store.state.Active_Tenants.isEditing);
         
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
                penalize: additionalFields.value[0].value,
                penalty_charge_mode: additionalFields.value[1].value,
                penalty_day: additionalFields.value[2].value,
                payment_terms: additionalFields.value[4].value,
                payment_info: additionalFields.value[3].value,
                zone: zoneID.value,
                zone_id: zoneID.value,
                landlord: landlordID.value,
                landlord_id: landlordID.value,
            }
            console.log("THE FORM DAAATA IS ",formData)
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
                console.log("THE ERRORS ARRAY IS ",errors.value);
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
                    penalize: additionalFields.value[0].value,
                    penalty_charge_mode: additionalFields.value[1].value,
                    penalty_day: additionalFields.value[2].value,
                    payment_terms: additionalFields.value[4].value,
                    payment_info: additionalFields.value[3].value,
                    zone: zoneValue.value,
                    zone_id: zoneValue.value,
                    landlord: landlordValue.value,
                    landlord_id: landlordValue.value,
                };
                console.log("THE updatedProperty DAAATA IS ",updatedProperty)
                try {
                        const response = await store.dispatch('Properties_List/updateProperty', updatedProperty);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Property updated successfully!');
                            handleReset();
                            landComponentKey.value += 1;
                            zoneComponentKey.value += 1;
                            mainComponentKey.value += 1;
                            store.dispatch('Landlords_List/updateState',{landlordID:''})
                            store.dispatch('Zones/updateState',{zoneID:''})
                            store.dispatch("Properties_List/updateState",{selectedProperty:null,selectedLandlord:null,selectedZone:null})
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

        })
        onMounted(()=>{

        })

        return{
            mainComponentKey, currentTab, loader, showLoader, hideLoader
        }
    }
})
</script>