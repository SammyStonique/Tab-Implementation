<template>
    <h2><strong>Lease Details</strong></h2>
    <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage"  @handleReset="handleReset"> 
        <template v-slot:additional-content>
            <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[280px]">
                <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Lease Charges</h1>
                <div class="tabs pt-2">
                    <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                        {{ tab }}
                    </button>
                </div>
                <div class="tab-content">
                    <div v-show="activeTab == 0">
                        <DynamicForm :fields="additionalFields" :flex_basis="additional_flex_basis" :flex_basis_percentage="additional_flex_basis_percentage" @handleReset="handleReset"/>
                    </div>
                    <div v-show="activeTab == 1">
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
                        <DynamicTable :key="tableKey" :columns="depositColumns" :rows="computedDepositRows" :idField="idFieldDeposit" :actions="actionsDeposit" @action-click="deleteDeposit" :rightsModule="rightsModule"/>
                    </div>
                    <div v-show="activeTab == 2">
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
                        <DynamicTable :key="utilityTableKey" :columns="utilityColumns" :rows="computedUtilityRows" :idField="idFieldUtility" :actions="actionsUtility" @action-click="deleteUtility" :rightsModule="rightsModule"/>
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
        const rightsModule = ref('PMS');
        const tableKey = ref(0);
        const utilityTableKey = ref(0);
        const propComponentKey = ref(0);
        const unitComponentKey = ref(0);
        const currencyComponentKey = ref(0);
        const taxComponentKey = ref(0);
        const periodComponentKey = ref(0);
        const companyID = computed(()=> store.state.userData.company_id);
        const isEditing = computed(()=> store.state.Active_Tenants.isEditing);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const selectedTenant = computed(()=> store.state.Active_Tenants.selectedTenant);
        const selectedTenantProperty = computed(()=> store.state.Active_Tenants.selectedTenantProperty);
        const selectedTenantUnit = computed(()=> store.state.Active_Tenants.selectedTenantUnit);
        const selectedTenantCurrency = computed(()=> store.state.Active_Tenants.selectedTenantCurrency);
        const selectedTenantVat = computed(()=> store.state.Active_Tenants.selectedTenantVat);
        const selectedPeriod = computed(()=> store.state.Active_Tenants.selectedPeriod);
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);
        const unitArray = computed(() => store.state.Units_List.unitArr);
        const taxArray = computed(() => store.state.Taxes.taxArr);
        const periodArray = computed(() => store.state.Variation_Periods.periodArr);
        const currencyArray = computed(() => store.state.Currencies.currencyArr);
        const unitID = ref('');
        const propertyID = ref(null);
        const currencyID = ref('');
        const taxID = ref('');
        const periodID = ref('');
        const unit_market_rent = ref(0);
        const billing_frequency = ref('');
        const lease_billing_amount = ref(0);
        const computed_billing_amount = computed(() =>{ return lease_billing_amount.value});
        const depositsArr = computed({
            get: () => store.state.Security_Deposits.depositArr,
        });
        const depositsDropdownWidth = ref('400px');
        const depositsSearchPlaceholder = ref('Select Security Deposit');
        const depositID = ref('');
        const depositColumns = ref([
            {label: "Name", key:"name", type: "text", editable: false},
            {label: "Charge Mode", key:"default_mode", type: "dropdown", editable: false},
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
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Deposit', rightName: 'Adding Tenants'},
        ])

        const utilityArr = computed({
            get: () => store.state.Utilities.utilityArr,
        });
        const utilitySearchPlaceholder = ref('Select Utility');
        const utilityID = ref('');
        const utilityColumns = ref([
            {label: "Name", key:"name", type: "text", editable: false},
            {label: "Charge Mode", key:"default_mode", type: "dropdown", editable: false},
            {label: "Default Value", key: "default_value", type: "number", editable: true},
        ])
        const selectedUtility = ref(null);

        const idFieldUtility = 'utility_id';
        const actionsUtility = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Utility', rightName: 'Adding Tenants'},
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
                // propertyValue.value = propertyID.value
            }
        }
        const clearSelectedProperty = async() =>{
            await store.dispatch('Properties_List/updateState', {propertyID: ''});
            propertyID.value = store.state.Properties_List.propertyID;
        }
        const handleSelectedUnit = async(option) =>{
            await store.dispatch('Units_List/handleSelectedUnit', option)
            unitID.value = store.state.Units_List.unitID;
            unit_market_rent.value = store.state.Units_List.unitPrice;
            if(selectedTenant.value){
                selectedTenant.value.property_unit.property_unit_id = unitID.value;
                // unitValue.value = unitID.value
            }
        }
        const clearSelectedUnit = async() =>{
            await store.dispatch('Units_List/updateState', {unitID: ''});
            unitID.value = store.state.Units_List.unitID;
        }
        const fetchProperties = async() =>{
            await store.dispatch('Properties_List/fetchProperties', {company:companyID.value});
        };
        const fetchUnits = async() =>{
            if(propertyID.value){
                await store.dispatch('Units_List/fetchUnits', {company:companyID.value, property: propertyID.value, vacancy_status: "Vacant", owner_occupied:"False"});
            }
        };
        watch([propertyID, unitID, currencyID, taxID, periodID], () => {
            if (propertyID.value) {
                fetchUnits();
            }
            if(propertyID.value && unitID.value){
                formFields.value[5].value = propertyID.value;
                formFields.value[6].value = unitID.value;
            }
            if(currencyID.value){
                additionalFields.value[0].value = currencyID.value;
            }
            if(taxID.value){
                additionalFields.value[5].value = taxID.value;
            }
            if(periodID.value){
                additionalFields.value[8].value = periodID.value;
            }

        }, { immediate: true });
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
                { type: 'dropdown', name: 'lease_type',label: "Lease Type", value: selectedTenant.value?.lease_type || 'Lease', placeholder: "", required: true, options: [{ text: 'Lease', value: 'Lease' }, { text: 'License', value: 'License' },{ text: 'Residence', value: 'Residence' }, { text: 'Other', value: 'Others' }] },
                { type: 'dropdown', name: 'lease_mode',label: "Lease Mode", value: selectedTenant.value?.lease_mode || 'Residential', placeholder: "", required: true, options: [{ text: 'Residential', value: 'Residential' }, { text: 'Commercial', value: 'Commercial' }] },
                { type: 'dropdown', name: 'schedule_type',label: "Schedule Type", value: selectedTenant.value?.schedule_type || 'Calendar Period', placeholder: "", required: true, options: [{ text: 'Calendar Period', value: 'Calendar Period' }, { text: 'Provided Start Date', value: 'Provided Start Date' }] },               
                { type: 'dropdown', name: 'lease_term_type',label: "Lease Term", value: selectedTenant.value?.lease_term_type || 'Open', placeholder: "", required: true, options: [{ text: 'Open', value: 'Open' }, { text: 'Fixed', value: 'Fixed' }] },
                {  
                    type:'search-dropdown', label:"Property", value: propertyValue.value, componentKey: propComponentKey,
                    selectOptions: propertyArray, optionSelected: handleSelectedProperty, required: true,
                    searchPlaceholder: 'Select Property...', dropdownWidth: '385px', updateValue: selectedTenantProperty.value,
                    fetchData: fetchProperties(), clearSearch: clearSelectedProperty
                },
                {  
                    type:'search-dropdown', label:"Unit", value: unitValue.value, componentKey: unitComponentKey,
                    selectOptions: unitArray, optionSelected: handleSelectedUnit, required: true,
                    searchPlaceholder: 'Select Unit...', dropdownWidth: '385px', updateValue: selectedTenantUnit.value,
                    fetchData: fetchUnits(), clearSearch: clearSelectedUnit
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
            currencyID.value = '';
            taxID.value = '';
            periodID.value = '';
            store.dispatch('Utilities/updateState',{utilityArray: []})
            store.dispatch('Security_Deposits/updateState',{depositArray: []})
            emit('reset-lease-details')
        }

        watch([selectedTenant, selectedTenantProperty, selectedTenantUnit], () => {
            if (selectedTenant.value && selectedTenantProperty.value && selectedTenantUnit.value) {
                propComponentKey.value += 1;
                unitComponentKey.value += 1;
                // updateFormFields();
            }
        }, { immediate: true });

        const handleSelectedCurrency = async(option) =>{
            await store.dispatch('Currencies/handleSelectedCurrency', option)
            currencyID.value = store.state.Currencies.currencyID;
            if(selectedTenant.value){
                selectedTenant.value.currency.currency_id = currencyID.value;
                // currencyValue.value = currencyID.value
            }
        }
        const clearSelectedCurrency = async() =>{
            await store.dispatch('Currencies/updateState', {currencyID: ''});
            currencyID.value = store.state.Currencies.currencyID;
        }
        const handleSelectedTax = async(option) =>{
            await store.dispatch('Taxes/handleSelectedTax', option)
            taxID.value = store.state.Taxes.taxID;
            if(selectedTenant.value){
                selectedTenant.value.tax.tax_id = taxID.value;
                // taxValue.value = taxID.value
            }
        }
        const clearSelectedTax = async() =>{
            await store.dispatch('Taxes/updateState', {taxID: ''});
            taxID.value = store.state.Taxes.taxID;
        }
        const handleSelectedPeriod = async(option) =>{
            await store.dispatch('Variation_Periods/handleSelectedPeriod', option)
            periodID.value = store.state.Variation_Periods.periodID;
            if(selectedTenant.value){
                selectedTenant.value.period.frequency_id = periodID.value;
                // periodValue.value = periodID.value
            }
        }
        const clearSelectedPeriod = async() =>{
            await store.dispatch('Variation_Periods/updateState', {periodID: ''});
            periodID.value = store.state.Variation_Periods.periodID;
        }
        const calculateBillingAmount = (value) =>{
            if(value == 'One Off'){
                lease_billing_amount.value = additionalFields.value[1].value;
            }else if(value == 'Weekly'){
                lease_billing_amount.value = (additionalFields.value[1].value / 4);
            }else if(value == 'Monthly'){
                lease_billing_amount.value = additionalFields.value[1].value;
            }else if(value == 'Quarterly'){
                lease_billing_amount.value = additionalFields.value[1].value * 3;
            }else if(value == 'Semi-Annually'){
                lease_billing_amount.value = additionalFields.value[1].value * 6;
            }else if(value == 'Annually'){
                lease_billing_amount.value = additionalFields.value[1].value * 12;
            }
        }
        const fetchCurrencies = async() =>{
            await store.dispatch('Currencies/fetchCurrencies', {company:companyID.value})
        };
        const fetchTaxes = async() =>{
            await store.dispatch('Taxes/fetchTaxes', {company:companyID.value})
        };
        const fetchPeriods = async() =>{
            await store.dispatch('Variation_Periods/fetchPeriods', {company:companyID.value})
        };
        const additionalFields = ref(props.additionalFields);
        const currencyValue = computed(() => {
           return (selectedTenant.value && selectedTenant.value.currency && !currencyID.value) ? selectedTenant.value.currency.currency_id : currencyID.value;
        });
        const taxValue = computed(() => {
            return (selectedTenant.value && selectedTenant.value.tax && !taxID.value) ? selectedTenant.value.tax.tax_id : taxID.value;
        });
        const periodValue = computed(() => {
            return (selectedTenant.value && selectedTenant.value.period && !periodID.value) ? selectedTenant.value.period.frequency_id : periodID.value;
        });
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                {  
                    type:'search-dropdown', label:"Rent Currency", value: currencyValue.value, componentKey: currencyComponentKey,
                    selectOptions: currencyArray, optionSelected: handleSelectedCurrency, required: true,
                    searchPlaceholder: 'Select Rent Currency...', dropdownWidth: '380px', updateValue: selectedTenantCurrency.value,
                    fetchData: fetchCurrencies(), clearSearch: clearSelectedCurrency
                },
                { type: 'number', name: 'rent_amount',label: "Rent Amount", value: selectedTenant.value?.rent_amount || unit_market_rent.value, required: true },
                { type: 'dropdown', name: 'billing_frequency',label: "Billing Frequency", value: selectedTenant.value?.billing_frequency || billing_frequency.value, method: calculateBillingAmount, placeholder: "", required: true, options: [{ text: 'One Off', value: 'One Off' }, { text: 'Weekly', value: 'Weekly' },{ text: 'Monthly', value: 'Monthly' }, { text: 'Quarterly', value: 'Quarterly' },{ text: 'Semi-Annually', value: 'Semi-Annually' }, { text: 'Annually', value: 'Annually' }] },
                { type: 'number', name: 'billing_amount',label: "Billing Amount", value: selectedTenant.value?.billing_amount || computed_billing_amount.value, required: true },
                { type: 'number', name: 'lease_fees',label: "Lease Fees", value: selectedTenant.value?.lease_fees || 0, required: false },
                {  
                    type:'search-dropdown', label:"Rent Vat", value: taxValue.value, componentKey: taxComponentKey,
                    selectOptions: taxArray, optionSelected: handleSelectedTax, required: false,
                    searchPlaceholder: 'Select Rent Vat...', dropdownWidth: '500px', updateValue: selectedTenantVat.value,
                    fetchData: fetchTaxes(), clearSearch: clearSelectedTax
                },
                { type: 'dropdown', name: 'variation_type',label: "Variation Type", value: selectedTenant.value?.variation_type || 'Review', placeholder: "", required: false, options: [{ text: 'Review', value: 'Review' }, { text: 'Escalation', value: 'Rent Escalation' }] },
                { type: 'dropdown', name: 'variation_mode',label: "Variation Mode", value: selectedTenant.value?.variation_mode || '', placeholder: "", required: false, options: [{ text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'Rent Percentage', value: 'Rent Percentage' }] },
                {  
                    type:'search-dropdown', label:"Variation Frequency", value: periodValue.value, componentKey: periodComponentKey,
                    selectOptions: periodArray, optionSelected: handleSelectedPeriod, required: false,
                    searchPlaceholder: 'Select Variation...', dropdownWidth: '500px', updateValue: selectedPeriod.value,
                    fetchData: fetchPeriods(), clearSearch: clearSelectedPeriod
                },
                { type: 'number', name: 'variation_value',label: "Variation Value", value: selectedTenant.value?.variation_value || 0, required: false },
                {required:false},
                {required:false}
            ];
        };
        watch([selectedTenant, selectedTenantCurrency, selectedTenantVat, selectedPeriod, computed_billing_amount, unit_market_rent], () => {
            if(selectedTenant.value  && selectedTenantCurrency.value && selectedTenantVat.value && selectedPeriod.value){
                currencyComponentKey.value += 1;
                taxComponentKey.value += 1;
                periodComponentKey.value += 1;
                updateAdditionalFormFields();
            }else if(computed_billing_amount.value){
                additionalFields.value[3].value = computed_billing_amount.value;
            }else if(unit_market_rent.value){
                additionalFields.value[1].value = unit_market_rent.value;
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
            }else{
                emitUpdatedFields();
            }
        },{ immediate: true });
        watch(() => store.state.Utilities.utilityArray, (newVal) => {
            if (newVal) {
                localUtilitiesRows.value = [...newVal];
                utilityTableKey.value += 1;
                emitUpdatedFields();
            }else{
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
            currencyComponentKey.value += 1;
            taxComponentKey.value += 1;
            periodComponentKey.value += 1;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
            additional_flex_basis.value = '1/4';
            additional_flex_basis_percentage.value = '25';
        })
        onMounted(()=>{
            emitUpdatedFields();
        })

        return{
            emitUpdatedFields, computedDepositRows, computedUtilityRows,rightsModule,
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