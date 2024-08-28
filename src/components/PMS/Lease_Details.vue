<template>
    <h2><strong>Lease Details</strong></h2>
    <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveProperty" @handleReset="handleReset"> 
        <template v-slot:additional-content>
            <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[250px]">
                <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Lease Charges</h1>
                <div class="tabs pt-2">
                    <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                        {{ tab }}
                    </button>
                </div>
                <div class="tab-content">
                    <div v-if="activeTab == 0">
                        <DynamicForm :fields="additionalFields" :flex_basis="additional_flex_basis" :flex_basis_percentage="additional_flex_basis_percentage" @handleReset="handleReset"/>
                    </div>
                    <div v-else-if="activeTab == 1">
                        <div class="text-left p-2">
                            <SearchableDropdown 
                                :key="depositComponentKey"
                                :options="depositsArr"
                                :dropdownWidth="depositsDropdownWidth"
                                :searchPlaceholder="depositsSearchPlaceholder"
                                @option-selected="handleSelectedDeposit"
                                @clearSearch="depositsClearSearch"
                                @fetchData="fetchData"
                            />
                        </div>                      
                        <DynamicTable :key="tableKey" :columns="depositColumns" :rows="depositRows" :idField="idFieldDeposit" :actions="actionsDeposit" @action-click="deleteDeposit" />
                    </div>
                    <div v-if="activeTab == 2">
                        <div class="text-left p-2">
                            <SearchableDropdown 
                                :key="utilityComponentKey"
                                :options="utilityArr"
                                :dropdownWidth="depositsDropdownWidth"
                                :searchPlaceholder="utilitySearchPlaceholder"
                                @option-selected="handleSelectedUtility"
                                @clearSearch="utilityClearSearch"
                                @fetchData="fetchData"
                            />
                        </div>                      
                        <DynamicTable :key="utilityTableKey" :columns="utilityColumns" :rows="utilityRows" :idField="idFieldUtility" :actions="actionsUtility" @action-click="deleteUtility" />
                    </div>
                </div>
            </div>
        </template>
    </DynamicForm>
    <div class="flex-1 basis-full px-2 mt-2">
      <button @click="openTenantDetails" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-arrow-left text-xs mr-1.5" aria-hidden="true"></i>Previous</button>
    </div>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch, reactive } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import DynamicTable from '@/components/DynamicTable.vue';
import { useStore } from "vuex";
import { useDateFormatter } from '@/composables/DateFormatter';
import { useToast } from "vue-toastification";

export default defineComponent({
    name: 'Lease_Details',
    components:{
        DynamicForm, SearchableDropdown, DynamicTable
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const tabs = ref(['Charge Details','Security Deposits','Utilities']);
        const activeTab = ref(0);
        const mainComponentKey = ref(0);
        const depositComponentKey = ref(0);
        const utilityComponentKey = ref(0);
        const tableKey = ref(0);
        const utilityTableKey = ref(0);
        const propComponentKey = ref(0);
        const unitComponentKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const displayButtons = ref(true);
        const isEditing = computed(()=> store.state.Active_Tenants.isEditing);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const selectedProperty = computed(()=> store.state.Active_Tenants.selectedProperty);
        const selectedLandlord = computed(()=> store.state.Active_Tenants.selectedLandlord);
        const selectedZone = computed(()=> store.state.Active_Tenants.selectedZone);
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);
        const landlordID = ref('');
        const zoneArray = computed(() => store.state.Zones.zoneArr);
        const zoneID = ref('');

        const depositsArr = computed({
            get: () => store.state.Security_Deposits.depositArr,
        });
        const depositsDropdownWidth = ref('400px');
        const depositsSearchPlaceholder = ref('Select Security Deposit');
        const depositID = computed({
            get: () => store.state.Security_Deposits.depositID,
        });
        const depositColumns = ref([
            {label: "Name", key:"name", type: "text", editable: false},
            {label: "Charge Mode", key:"default_mode", type: "text", editable: false},
            {label: "Default Value", key: "default_value", type: "number", editable: true},
        ])
        const selectedDeposit = ref(null);
        const depositRows = computed(() => store.state.Security_Deposits.depositArray);

        const idFieldDeposit = 'deposit_id';
        const actionsDeposit = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Deposit'},
        ])

        const utilityArr = computed({
            get: () => store.state.Utilities.utilityArr,
        });
        const utilitySearchPlaceholder = ref('Select Utility');
        const utilityID = computed({
            get: () => store.state.Utilities.utilityID,
        });
        const utilityColumns = ref([
            {label: "Name", key:"name", type: "text", editable: false},
            {label: "Charge Mode", key:"default_mode", type: "text", editable: false},
            {label: "Default Value", key: "default_value", type: "number", editable: true},
        ])
        const selectedUtility = ref(null);
        const utilityRows = computed(() => store.state.Utilities.utilityArray);

        const idFieldUtility = 'utility_id';
        const actionsUtility = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Utility'},
        ])

        const handleSelectedProperty = async(option) =>{
            await store.dispatch('Landlords_List/handleSelectedLandlord', option)
            landlordID.value = store.state.Landlords_List.landlordID;
            if(selectedProperty.value){
                selectedProperty.value.landlord.landlord_id = landlordID.value;
                landlordValue.value = landlordID.value
            }
        }
        const handleSelectedUnit = async(option) =>{
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
                { type: 'date', name: 'lease_date',label: "Date", value: selectedProperty.value?.lease_date || '', required: true },
                { type: 'dropdown', name: 'lease_type',label: "Lease Type", value: selectedProperty.value?.lease_type || '', placeholder: "Lease Type", required: true, options: [{ text: 'Lease', value: 'Lease' }, { text: 'License', value: 'License' },{ text: 'Residence', value: 'Residence' }, { text: 'Other', value: 'Others' }] },
                { type: 'dropdown', name: 'lease_mode',label: "Lease Mode", value: selectedProperty.value?.lease_mode || '', placeholder: "Lease Mode", required: true, options: [{ text: 'Residential', value: 'Residential' }, { text: 'Commercial', value: 'Commercial' }] },
                { type: 'dropdown', name: 'schedule_type',label: "Schedule Type", value: selectedProperty.value?.schedule_type || '', placeholder: "Schedule Type", required: true, options: [{ text: 'Calendar Period', value: 'Calendar Period' }, { text: 'Provided Start Date', value: 'Provided Start Date' }] },               
                { type: 'dropdown', name: 'lease_term_type',label: "Lease Term", value: selectedProperty.value?.lease_term_type || '', placeholder: "Lease Term", required: true, options: [{ text: 'Open', value: 'Open' }, { text: 'Fixed', value: 'Fixed' }] },
                {  
                    type:'search-dropdown', label:"Property", value: landlordValue.value, componentKey: propComponentKey,
                    selectOptions: propertyArray, optionSelected: handleSelectedProperty, required: true,
                    searchPlaceholder: 'Select Property...', dropdownWidth: '400px', updateValue: selectedLandlord.value,
                    fetchData: store.dispatch('Properties_List/fetchProperties', {company:companyID.value})
                },
                
                {  
                    type:'search-dropdown', label:"Unit", value: zoneValue.value, componentKey: unitComponentKey,
                    selectOptions: zoneArray, optionSelected: handleSelectedUnit, required: true,
                    searchPlaceholder: 'Select Unit...', dropdownWidth: '400px', updateValue: selectedZone.value,
                    fetchData: store.dispatch('Zones/fetchZones', {company:companyID.value})
                },
                { type: 'date', name: 'lease_start_date',label: "Lease Start Date", value: selectedProperty.value?.lease_start_date || '', required: true },
                { type: 'date', name: 'lease_end_date',label: "Lease End Date", value: selectedProperty.value?.lease_end_date || '', required: true },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            landlordID.value = '';
            zoneID.value = '';
            for(let i=0; i < additionalFields.value.length; i++){
                additionalFields.value[i].value = '';
            }
        }

        watch([selectedProperty, selectedLandlord, selectedZone], () => {
            if (selectedProperty.value && selectedLandlord.value && selectedZone.value) {
                propComponentKey.value += 1;
                unitComponentKey.value += 1;
                updateFormFields();
            }
        }, { immediate: true });

        const additionalFields = ref([]);
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                { type: 'number', name: 'rent_amount',label: "Rent Amount", value: selectedProperty.value?.rent_amount || 0, required: true },
                { type: 'dropdown', name: 'billing_frequency',label: "Billing Frequency", value: selectedProperty.value?.billing_frequency || '', placeholder: "Billing Frequency", required: true, options: [{ text: 'One Off', value: 'One Off' }, { text: 'Weekly', value: 'Weekly' },{ text: 'Monthly', value: 'Monthly' }, { text: 'Quarterly', value: 'Quartely' },{ text: 'Semi-Annually', value: 'Semi-Annually' }, { text: 'Annually', value: 'Annually' }] },
                { type: 'number', name: 'lease_fees',label: "Lease Fees", value: selectedProperty.value?.lease_fees || 0, required: false },
                {  
                    type:'search-dropdown', label:"Rent Vat", value: zoneValue.value, componentKey: unitComponentKey,
                    selectOptions: zoneArray, optionSelected: handleSelectedUnit, required: false,
                    searchPlaceholder: 'Select Unit...', dropdownWidth: '380px', updateValue: selectedZone.value,
                    fetchData: store.dispatch('Zones/fetchZones', {company:companyID.value})
                },
                { type: 'dropdown', name: 'variation_type',label: "Variation Type", value: selectedProperty.value?.variation_type || '', placeholder: "Variation Type", required: false, options: [{ text: 'Review', value: 'Review' }, { text: 'Escalation', value: 'Rent Escalation' }] },
                { type: 'dropdown', name: 'variation_mode',label: "Variation Mode", value: selectedProperty.value?.variation_mode || '', placeholder: "Variation Mode", required: false, options: [{ text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'Rent Percentage', value: 'Rent Percentage' }] },
                {  
                    type:'search-dropdown', label:"Variation Frequency", value: zoneValue.value, componentKey: unitComponentKey,
                    selectOptions: zoneArray, optionSelected: handleSelectedUnit, required: false,
                    searchPlaceholder: 'Select Unit...', dropdownWidth: '380px', updateValue: selectedZone.value,
                    fetchData: store.dispatch('Zones/fetchZones', {company:companyID.value})
                },
                { type: 'number', name: 'variation_value',label: "Variation Value", value: selectedProperty.value?.variation_value || 0, required: false },
            ];
        };
        watch([selectedProperty, selectedLandlord, selectedZone], () => {
            if(selectedProperty.value  && selectedLandlord.value && selectedZone.value){
                propComponentKey.value += 1;
                unitComponentKey.value += 1;
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
                        propComponentKey.value += 1;
                        unitComponentKey.value += 1;
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
                            propComponentKey.value += 1;
                            unitComponentKey.value += 1;
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
        const selectTab = (index) => {
            activeTab.value = index;
        };
        const openTenantDetails = () =>{
            store.dispatch('Active_Tenants/updateState', {currentTab: "Tenant_Biodata"})
        }
        const handleSelectedDeposit = async(option) =>{
            await store.dispatch('Security_Deposits/handleSelectedDeposit', option);
            depositComponentKey.value += 1;
        }
        const deleteDeposit = (rowIndex, action, row) =>{
            store.dispatch('Security_Deposits/removeDeposit', rowIndex);
        }
        const handleSelectedUtility = async(option) =>{
            await store.dispatch('Utilities/handleSelectedUtility', option);
            utilityComponentKey.value += 1;
        }
        const deleteUtility = (rowIndex, action, row) =>{
            store.dispatch('Utilities/removeUtility', rowIndex);
        }
        onBeforeMount(()=>{ 
            store.dispatch('Security_Deposits/fetchDeposits',{company:companyID.value});
            store.dispatch('Utilities/fetchUtilities',{company:companyID.value});
            updateFormFields();
            updateAdditionalFormFields();
            propComponentKey.value += 1;
            unitComponentKey.value += 1;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
            additional_flex_basis.value = '1/4';
            additional_flex_basis_percentage.value = '25';
        })
        onMounted(()=>{

        })

        return{
            tabs, selectTab,activeTab, depositComponentKey,utilityComponentKey, formFields, additionalFields, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, displayButtons, saveProperty, mainComponentKey,
            handleReset, isEditing, loader, showLoader, hideLoader, openTenantDetails,
            tableKey, depositsArr, depositsDropdownWidth, depositsSearchPlaceholder, depositColumns, depositRows, idFieldDeposit, actionsDeposit, deleteDeposit, handleSelectedDeposit,
            utilityTableKey, utilityArr, utilitySearchPlaceholder, utilityColumns, utilityRows, idFieldUtility,actionsUtility, deleteUtility, handleSelectedUtility
        }
    }
})
</script>

<style scoped>
.tabs {
    display: flex;
    border-bottom: 1px solid #ccc;
}
.tab {
    padding: 2px 20px 2px 20px;
    cursor: pointer;
}

.tab.active {
    border-bottom: 2px solid #000;
}

.tab-content {
    padding: 3px;
    margin-top: 10px !important;
}
</style>