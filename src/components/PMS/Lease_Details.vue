<template>
    <h2><strong>Lease Details</strong></h2>
    <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage"  @handleReset="handleReset"> 
        <template v-slot:additional-content>
            <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[300px]">
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
                        <DynamicTable :key="tableKey" :columns="depositColumns" :rows="computedDepositRows" :idField="idFieldDeposit" :actions="actionsDeposit" @action-click="deleteDeposit" />
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
                        <DynamicTable :key="utilityTableKey" :columns="utilityColumns" :rows="computedUtilityRows" :idField="idFieldUtility" :actions="actionsUtility" @action-click="deleteUtility" />
                    </div>
                </div>
            </div>
        </template>
    </DynamicForm>
    
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch, reactive } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import DynamicTable from '@/components/DynamicTable.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default defineComponent({
    name: 'Lease_Details',
    components:{
        DynamicForm, SearchableDropdown, DynamicTable
    },
    props:{
        formFields: Array,
        additionalFields: Array,
        depositRows:{
            type: Array,
            default:() => [],
        },
        utilityRows:{
            type: Array,
            default:() => [],
        },
    },
    emits: ['update-form'],
    setup(props,{emit}){
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
        const companyID = computed(()=> store.state.userData.company_id);
        const isEditing = computed(()=> store.state.Active_Tenants.isEditing);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const selectedTenant = computed(()=> store.state.Active_Tenants.selectedTenant);
        const selectedProperty = computed(()=> store.state.Active_Tenants.selectedProperty);
        const selectedUnit = computed(()=> store.state.Active_Tenants.selectedUnit);
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);
        const unitArray = computed(() => store.state.Units_List.unitArr);
        const unitID = ref('');
        const propertyID = ref('');
        const depositsArr = computed({
            get: () => store.state.Security_Deposits.depositArr,
        });
        const depositsDropdownWidth = ref('400px');
        const depositsSearchPlaceholder = ref('Select Security Deposit');
        const depositID = ref('');
        const depositColumns = ref([
            {label: "Name", key:"name", type: "text", editable: false},
            {label: "Charge Mode", key:"default_mode", type: "text", editable: false},
            {label: "Default Value", key: "default_value", type: "number", editable: true},
        ])
        const selectedDeposit = ref(null);

        const localDepositRows = ref([...props.depositRows]);
        const localUtilitiesRows = ref([...props.utilityRows]);
        const computedDepositRows = computed(() => {
            return store.state.Security_Deposits.depositArray;
        });
        const computedUtilityRows = computed(() => {
            return store.state.Utilities.utilityArray;
        });

        const idFieldDeposit = 'deposit_id';
        const actionsDeposit = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Deposit'},
        ])

        const utilityArr = computed({
            get: () => store.state.Utilities.utilityArr,
        });
        const utilitySearchPlaceholder = ref('Select Utility');
        const utilityID = ref('');
        const utilityColumns = ref([
            {label: "Name", key:"name", type: "text", editable: false},
            {label: "Charge Mode", key:"default_mode", type: "text", editable: false},
            {label: "Default Value", key: "default_value", type: "number", editable: true},
        ])
        const selectedUtility = ref(null);

        const idFieldUtility = 'utility_id';
        const actionsUtility = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Utility'},
        ]);

        const showLoader = () =>{
            loader.value = "block";
        };
        const hideLoader = () =>{
            loader.value = "none";
        };

        const handleSelectedProperty = async(option) =>{
            await store.dispatch('Properties_List/handleSelectedProperty', option)
            propertyID.value = store.state.Properties_List.propertyID;
            if(selectedTenant.value){
                selectedTenant.value.property.property_id = propertyID.value;
                // zoneValue.value = zoneID.value
            }
        }
        const handleSelectedUnit = async(option) =>{
            await store.dispatch('Units_List/handleSelectedUnit', option)
            unitID.value = store.state.Units_List.unitID;
            if(selectedTenant.value){
                selectedTenant.value.property_unit.property_unit_id = unitID.value;
                // zoneValue.value = zoneID.value
            }
        }
        const formFields = ref(props.formFields);
        const propertyValue = computed(() => {
           return (selectedTenant.value && selectedTenant.value.property && !propertyID.value) ? selectedTenant.value.property.property_id : propertyID.value;
        });
        const unitValue = computed(() => {
            return (selectedTenant.value && selectedTenant.value.property_unit && !unitID.value) ? selectedTenant.value.property_unit.property_unit_id : unitID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                { type: 'date', name: 'lease_date',label: "Date", value: selectedTenant.value?.lease_date || '', required: true },
                { type: 'dropdown', name: 'lease_type',label: "Lease Type", value: selectedTenant.value?.lease_type || '', placeholder: "", required: true, options: [{ text: 'Lease', value: 'Lease' }, { text: 'License', value: 'License' },{ text: 'Residence', value: 'Residence' }, { text: 'Other', value: 'Others' }] },
                { type: 'dropdown', name: 'lease_mode',label: "Lease Mode", value: selectedTenant.value?.lease_mode || '', placeholder: "", required: true, options: [{ text: 'Residential', value: 'Residential' }, { text: 'Commercial', value: 'Commercial' }] },
                { type: 'dropdown', name: 'schedule_type',label: "Schedule Type", value: selectedTenant.value?.schedule_type || '', placeholder: "", required: true, options: [{ text: 'Calendar Period', value: 'Calendar Period' }, { text: 'Provided Start Date', value: 'Provided Start Date' }] },               
                { type: 'dropdown', name: 'lease_term_type',label: "Lease Term", value: selectedTenant.value?.lease_term_type || '', placeholder: "", required: true, options: [{ text: 'Open', value: 'Open' }, { text: 'Fixed', value: 'Fixed' }] },
                {  
                    type:'search-dropdown', label:"Property", value: propertyValue.value, componentKey: propComponentKey,
                    selectOptions: propertyArray, optionSelected: handleSelectedProperty, required: true,
                    searchPlaceholder: 'Select Property...', dropdownWidth: '400px', updateValue: selectedProperty.value,
                    fetchData: store.dispatch('Properties_List/fetchProperties', {company:companyID.value})
                },
                
                {  
                    type:'search-dropdown', label:"Unit", value: unitValue.value, componentKey: unitComponentKey,
                    selectOptions: unitArray, optionSelected: handleSelectedUnit, required: true,
                    searchPlaceholder: 'Select Unit...', dropdownWidth: '400px', updateValue: selectedUnit.value,
                    fetchData: store.dispatch('Units_List/fetchUnits', {company:companyID.value})
                },
                { type: 'date', name: 'lease_start_date',label: "Lease Start Date", value: selectedTenant.value?.lease_start_date || '', required: true },
                { type: 'date', name: 'lease_end_date',label: "Lease End Date", value: selectedTenant.value?.lease_end_date || '', required: true },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            propertyID.value = '';
            unitID.value = '';
            for(let i=0; i < additionalFields.value.length; i++){
                additionalFields.value[i].value = '';
            }
        }

        watch([selectedTenant, selectedProperty, selectedUnit], () => {
            if (selectedTenant.value && selectedProperty.value && selectedUnit.value) {
                propComponentKey.value += 1;
                unitComponentKey.value += 1;
                updateFormFields();
            }else{
                updateFormFields();
            }
        }, { immediate: true });

        const additionalFields = ref(props.additionalFields);
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                { type: 'number', name: 'rent_amount',label: "Rent Amount", value: selectedTenant.value?.rent_amount || 0, required: true },
                { type: 'dropdown', name: 'billing_frequency',label: "Billing Frequency", value: selectedTenant.value?.billing_frequency || '', placeholder: "", required: true, options: [{ text: 'One Off', value: 'One Off' }, { text: 'Weekly', value: 'Weekly' },{ text: 'Monthly', value: 'Monthly' }, { text: 'Quarterly', value: 'Quartely' },{ text: 'Semi-Annually', value: 'Semi-Annually' }, { text: 'Annually', value: 'Annually' }] },
                { type: 'number', name: 'lease_fees',label: "Lease Fees", value: selectedTenant.value?.lease_fees || 0, required: false },
                {  
                    type:'search-dropdown', label:"Rent Vat", value: propertyValue.value, componentKey: unitComponentKey,
                    selectOptions: propertyArray, optionSelected: handleSelectedUnit, required: false,
                    searchPlaceholder: 'Select Rent Vat...', dropdownWidth: '380px', updateValue: selectedProperty.value,
                    fetchData: store.dispatch('Zones/fetchZones', {company:companyID.value})
                },
                { type: 'dropdown', name: 'variation_type',label: "Variation Type", value: selectedTenant.value?.variation_type || '', placeholder: "", required: false, options: [{ text: 'Review', value: 'Review' }, { text: 'Escalation', value: 'Rent Escalation' }] },
                { type: 'dropdown', name: 'variation_mode',label: "Variation Mode", value: selectedTenant.value?.variation_mode || '', placeholder: "", required: false, options: [{ text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'Rent Percentage', value: 'Rent Percentage' }] },
                {  
                    type:'search-dropdown', label:"Variation Frequency", value: unitValue.value, componentKey: unitComponentKey,
                    selectOptions: unitArray, optionSelected: handleSelectedUnit, required: false,
                    searchPlaceholder: 'Select Variation...', dropdownWidth: '380px', updateValue: selectedUnit.value,
                    fetchData: store.dispatch('Zones/fetchZones', {company:companyID.value})
                },
                { type: 'number', name: 'variation_value',label: "Variation Value", value: selectedTenant.value?.variation_value || 0, required: false },
            ];
        };
        watch([selectedTenant, selectedProperty, selectedUnit], () => {
            if(selectedTenant.value  && selectedProperty.value && selectedUnit.value){
                propComponentKey.value += 1;
                unitComponentKey.value += 1;
                updateAdditionalFormFields();
            }else{
                updateAdditionalFormFields();
            }
        }, { immediate: true });

        const emitUpdatedFields = () => {
            emit('update-form', formFields.value, additionalFields.value, localDepositRows.value, localUtilitiesRows.value);
        };
        watch(() => store.state.Security_Deposits.depositArray, (newVal) => {
            if (newVal) {
                localDepositRows.value = [...newVal];
                tableKey.value += 1;
                emitUpdatedFields();
            }
        },{ immediate: true });
        watch(() => store.state.Utilities.utilityArray, (newVal) => {
            if (newVal) {
                localUtilitiesRows.value = [...newVal];
                utilityTableKey.value += 1;
                emitUpdatedFields();
            }
        },{ immediate: true });
         
        const selectTab = (index) => {
            activeTab.value = index;
        };
        
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
            emitUpdatedFields();
        })

        return{
            emitUpdatedFields, computedDepositRows, computedUtilityRows,
            tabs, selectTab,activeTab, depositComponentKey,utilityComponentKey, formFields, additionalFields, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, mainComponentKey,
            handleReset, isEditing, loader, showLoader, hideLoader,
            tableKey, depositsArr, depositsDropdownWidth, depositsSearchPlaceholder, depositColumns,  idFieldDeposit, actionsDeposit, deleteDeposit, handleSelectedDeposit,
            utilityTableKey, utilityArr, utilitySearchPlaceholder, utilityColumns, idFieldUtility,actionsUtility, deleteUtility, handleSelectedUtility
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