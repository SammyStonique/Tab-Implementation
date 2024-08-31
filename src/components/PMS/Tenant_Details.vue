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
                            @reset-tenant-details="handleReset"
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
                            @reset-lease-details="handleReset"
                        />  
                    </keep-alive> 
                </div>
            </div>
            <div class="flex-1 px-2">
                    <button v-if="currentTab == 'Tenant_Biodata'" @click="openLeaseDetails" class="rounded bg-green-400 text-sm mr-2 w-24 text-white px-2 py-1.5">Next<i class="fa fa-arrow-right text-xs mr-1.5" aria-hidden="true"></i></button>
                    <button v-else-if="currentTab == 'Lease_Details'" @click="openTenantDetails" class="rounded bg-green-400 text-sm mr-2 w-24 text-white px-2 py-1.5"><i class="fa fa-arrow-left text-xs mr-1.5" aria-hidden="true"></i>Previous</button>
                    <button v-if="currentTab == 'Lease_Details'" @click="submitAll" class="rounded bg-green-400 text-sm mr-2 w-24 text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Submit</button>
                    <button @click="handleReset" class="rounded bg-green-400 text-sm mr-2 w-24 text-white px-2 py-1.5"><i class="fa fa-refresh text-xs mr-1.5" aria-hidden="true"></i>Reset</button>
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
import axios from 'axios';

export default defineComponent({
    name: 'Tenant_Details',
    components:{
        PageStyleComponent, Tenant_Biodata, Lease_Details
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const errors = ref([]);
        const mainComponentKey = ref(0);
        const currentTab = computed(()=> store.state.Active_Tenants.currentTab);
        const isEditing = computed(()=> store.state.Active_Tenants.isEditing);
        const companyID = computed(()=> store.state.userData.company_id);

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

        const openLeaseDetails = () =>{
            errors.value = [];
            for(let i=0; i < tenantFormFields.value.length; i++){
                if(tenantFormFields.value[i].value =='' && tenantFormFields.value[i].required){
                    errors.value.push('Error');
                }
            }
            for(let i=0; i < tenantAdditionalFields.value.length; i++){
                if(tenantAdditionalFields.value[i].value =='' && tenantAdditionalFields.value[i].required){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
            }else{
                store.dispatch('Active_Tenants/updateState', {currentTab: "Lease_Details"})
            }
            // store.dispatch('Active_Tenants/updateState', {currentTab: "Lease_Details"})
        };

        const openTenantDetails = () =>{
            store.dispatch('Active_Tenants/updateState', {currentTab: "Tenant_Biodata"})
        }

        const submitAll = async() => {
            showLoader();
            const allFormData = {
                tenant_biodata: tenantFormFields.value,
                emergency_contact: tenantAdditionalFields.value,
                lease_details: leaseFormFields.value,
                lease_charges: leaseAdditionalFields.value,
                security_deposits: securityDeposits.value,
                utilities: leaseUtilities.value,
                company: companyID.value
            };        
            console.log('Submitting all form data:', allFormData);
            await axios.post('api/v1/create-tenant-lease/',allFormData)
            .then((response)=>{
                if(response.status == 200){
                    toast.success("Tenant Created Succesfully")
                    handleReset();
                }else{
                    toast.error("Error Creating Tenant")
                }
                
            })
            .catch((errors)=>{
                toast.error(errors.message)
            })
            .finally(()=>{
                hideLoader();
            })
        };

        const handleReset = async() =>{
            await store.dispatch('Security_Deposits/updateState', {depositArray: []})
            await store.dispatch('Utilities/updateState', {utilityArray: []})
            for(let i=0; i < tenantFormFields.value.length; i++){
                if(tenantFormFields.value[i].label != 'Country'){
                    tenantFormFields.value[i].value = '';
                }           
            }
            for(let i=0; i < tenantAdditionalFields.value.length; i++){
                tenantAdditionalFields.value[i].value = '';
            }
            for(let i=0; i < leaseFormFields.value.length; i++){
                leaseFormFields.value[i].value = '';         
            }
            for(let i=0; i < leaseAdditionalFields.value.length; i++){
                leaseAdditionalFields.value[i].value = '';
            }
            securityDeposits.value = [];
            leaseUtilities.value = [];
            mainComponentKey.value += 1;
        }
        
        onBeforeMount(()=>{ 

        })
        onMounted(()=>{
            
        })

        return{
            mainComponentKey, currentTab, loader, showLoader, hideLoader, handleReset, 
            updateTenantFormFields,tenantFormFields,tenantAdditionalFields,
            updateLeaseFormFields, leaseFormFields, leaseAdditionalFields, securityDeposits, leaseUtilities,
            submitAll, openLeaseDetails, openTenantDetails
        }
    }
})
</script>