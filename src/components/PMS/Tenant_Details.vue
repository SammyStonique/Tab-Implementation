<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <div v-show="currentTab == 'Tenant_Biodata'">
                    <keep-alive :include="['Tenant_Biodata']">
                        <Tenant_Biodata
                            :formFields="tenantFormFields"
                            :additionalFields="tenantAdditionalFields" 
                            @update-form="updateTenantFormFields"
                        />
                    </keep-alive>
                </div>
                <div v-show="currentTab == 'Lease_Details'">
                    <keep-alive :include="['Lease_Details']">
                        <Lease_Details 
                            :formFields="leaseFormFields"
                            :additionalFields="leaseAdditionalFields" 
                            :depositRows="securityDeposits"
                            :utilityRows="leaseUtilities"
                            @update-form="updateLeaseFormFields"
                        />  
                    </keep-alive> 
                </div>
            </div>
            <div class="flex-1 px-2">
                    <button v-if="currentTab == 'Tenant_Biodata'" @click="openLeaseDetails" class="rounded bg-green-400 text-sm mr-2 w-24 text-white px-2 py-1.5">Next<i class="fa fa-arrow-right text-xs mr-1.5" aria-hidden="true"></i></button>
                    <button v-else-if="currentTab == 'Lease_Details'" @click="openTenantDetails" class="rounded bg-green-400 text-sm mr-2 w-24 text-white px-2 py-1.5"><i class="fa fa-arrow-left text-xs mr-1.5" aria-hidden="true"></i>Previous</button>
                    <button v-if="currentTab == 'Lease_Details'" @click="submitAll" class="rounded bg-green-400 text-sm mr-2 w-24 text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Submit</button>
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

        const tenantFormFields = ref([]);
        const tenantAdditionalFields = ref([]);

        const leaseFormFields = ref([]);
        const leaseAdditionalFields = ref([]);
        const securityDeposits = ref([]);
        const leaseUtilities = ref([]);

        const updateTenantFormFields = (fields,additionalFields) => {
            tenantFormFields.value = fields;
            tenantAdditionalFields.value = additionalFields;
        };

        const updateLeaseFormFields = (fields,additionalFields,depositRows,utilityRows) => {
            leaseFormFields.value = fields;
            leaseAdditionalFields.value = additionalFields;
            securityDeposits.value = depositRows;
            leaseUtilities.value = utilityRows;
        };
         
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
        };

        const openTenantDetails = () =>{
            store.dispatch('Active_Tenants/updateState', {currentTab: "Tenant_Biodata"})
        }

        const submitAll = () => {
            // Combine form data from both child components
            const allFormData = {
                tenantData: tenantFormFields.value,
                tenantAdditionalData: tenantAdditionalFields.value,
                leaseData: leaseFormFields.value,
                leaseAdditionalData: leaseAdditionalFields.value,
                deposits: securityDeposits.value,
                utilities: leaseUtilities.value,
            };
            
            // Perform submission logic, e.g., API call
            console.log('Submitting all form data:', allFormData);
        };
        
        onBeforeMount(()=>{ 

        })
        onMounted(()=>{
            
        })

        return{
            mainComponentKey, currentTab, loader, showLoader, hideLoader, 
            updateTenantFormFields,tenantFormFields,tenantAdditionalFields,
            updateLeaseFormFields, leaseFormFields, leaseAdditionalFields, securityDeposits, leaseUtilities,
            submitAll, openLeaseDetails, openTenantDetails
        }
    }
})
</script>