<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <h2><strong>Sale Details</strong></h2>
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveAssetSale" @handleReset="handleReset"> 
                    <template v-slot:additional-content>
                        <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[180px]">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Sales Units & Charges</h1>
                            <div class="tabs pt-2">
                                <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                                    {{ tab }}
                                </button>
                            </div>
                            <div class="tab-content">
                                <div v-show="activeTab == 0">
                                    <div class="border border-slate-200 rounded relative py-4 w-[75%] mt-3 px-2 min-h-[180px]">
                                        <DynamicTable :key="tableKey" :columns="unitColumns" :rows="unitRows" :actions="actionUnits" @action-click="deleteUnit" :rightsModule="rightsModule" :showTotals="showTotals" />
                                    </div>
                                </div>
                                <div v-show="activeTab == 1">
                                    <div class="text-left p-2">
                                        <SearchableDropdown 
                                            :key="chargeComponentKey"
                                            :options="saleChargeArr"
                                            :dropdownWidth="chargesDropdownWidth"
                                            :searchPlaceholder="chargesSearchPlaceholder"
                                            @option-selected="handleSelectedSaleCharge"
                                            @fetchData="fetchData"
                                        />
                                    </div>  
                                    <div class="border border-slate-200 rounded relative py-4 w-[50%] mt-3 px-2 min-h-[180px]">                    
                                        <DynamicTable :key="tableKey" :columns="chargeColumns" :rows="saleChargeRows" :idField="idFieldCharge" :actions="actionCharges" @action-click="deleteSaleCharge" :rightsModule="rightsModule" />
                                    </div>
                                </div>
                                <div v-show="activeTab == 2">
                                    <DynamicForm :fields="additionalFields" :flex_basis="additional_flex_basis" :flex_basis_percentage="additional_flex_basis_percentage" @handleReset="handleReset"/>
                                </div>
                                <div v-show="activeTab == 3" class="text-left">  
                                    <button @click="generateSchedules" class="rounded bg-green-400 cursor-pointer text-sm mr-2 mb-1.5  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Generate Schedules</button>                
                                    <DynamicTable :key="tableKey" :columns="scheduleColumns" :rows="scheduleRows" :idField="idFieldCharge" :showActions="showActions" :showTotals="showTotals"/>
                                </div>
                                <div v-show="activeTab == 4">
                                    <DynamicForm :fields="additionalFields1" :flex_basis="additional_flex_basis" :flex_basis_percentage="additional_flex_basis_percentage" @handleReset="handleReset"/>
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
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import DynamicTable from '@/components/DynamicTable.vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';

export default defineComponent({
    name: 'Sale_Details',
    components:{
         DynamicForm,PageStyleComponent,SearchableDropdown,DynamicTable
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('none');
        const tabs = ref(['Asset Units','Selling Charges','Sale Commission','Repayment Schedules','Notes']);
        const mainComponentKey = ref(0);
        const clientComponetKey = ref(0);
        const planComponentKey = ref(0);
        const assetComponentKey = ref(0);
        const agentComponentKey = ref(0);
        const unitComponentKey = ref(0);
        const chargeComponentKey = ref(0);
        const activeTab = ref(0);
        const rightsModule = ref('PSS');
        const displayButtons = ref(true);
        const componentKey = ref(0);
        const tableKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const selectedSale = computed(()=> store.state.Asset_Sales.selectedSale);
        const selectedClient = computed(()=> store.state.Asset_Sales.selectedClient);
        const selectedAsset = computed(()=> store.state.Asset_Sales.selectedAsset);
        const selectedAgent = computed(()=> store.state.Asset_Sales.selectedAgent);
        const selectedPlan = computed(()=> store.state.Asset_Sales.selectedPlan);
        const saleCharges = computed(()=> store.state.Asset_Sales.saleCharges);
        const saleUnits = computed(()=> store.state.Asset_Sales.saleUnits);
        const defSaleCharges = computed(()=> store.state.Sale_Assets.saleCharges);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const isEditing = computed(()=> store.state.Asset_Sales.isEditing);
        const agentArray = computed(() => store.state.Sales_Agents.agentArr);
        const clientArray = computed(() => store.state.Asset_Clients.customerArr);
        const assetArray = computed(() => store.state.Sale_Assets.assetArr);
        const saleChargeArr = computed(() => store.state.Asset_Fees.saleFeeArr);
        const planArray = computed(() => store.state.Payment_Plans.salePlanArr);
        const units_array = computed(() => store.state.Asset_Units.unitArr);
        const chargesDropdownWidth = ref('400px');
        const chargesSearchPlaceholder = ref('Select Charge...');
        const clientID = ref('');
        const assetID = ref('');
        const planID = ref('');
        const salePlanTermsArr = ref([]);
        const payMode = ref("");
        const depositMode = ref("");
        const depositValue = ref(0);
        const installments = ref("");
        const interestMethod = ref("");
        const interestValue = ref(0);
        const interestMode = ref("");
        const balanceMode = ref("");
        const actualDeposit = ref(0);
        const repayFrequency = ref("");
        const computedDepositMode = computed(() => depositMode);
        const computedDepositValue = computed(() => depositValue);
        const computedInstallments = computed(() => installments);
        const computedInterestMethod = computed(() => interestMethod);
        const computedInterestValue = computed(() => interestValue);
        const computedInterestMode = computed(() => interestMode);
        const computedBalanceMode = computed(() => balanceMode);
        const computedActualDepositValue = computed(() => actualDeposit);
        const computedRepayFrequency= computed(() => repayFrequency);
        const agentID = ref('');
        const actionUnits = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Unit', rightName: 'Adding Asset Sales'},
        ])
        const unitColumns = ref([
            {label: "Unit Number", key:"unit_number", type: "text", editable: false},
            {label: "Selling Price", key:"unit_selling_price", type: "number", editable: true},
            {label: "Discount", key:"discount", type: "number", editable: true},
            {label: "Charges", key:"charges_amount", type: "number", editable: true},
            {label: "Total", key:"formatted_sale_total_amount", type: "number", editable: false},
        ]);
        const unitRows = computed(() => {
            return store.state.Asset_Units.unitArray;
        });
        const deleteUnit = (rowIndex, action, row) =>{
            store.dispatch('Asset_Units/removeAssetUnit', rowIndex);
            tableKey.value += 1;
        };
        const chargeColumns = ref([
            {label: "Name", key:"fee_name", type: "text", editable: false},
            {label: "Charge Mode", key:"charge_mode", type: "text", editable: false},
            {label: "Amount", key: "default_amount", type: "number", editable: true},
        ]);
        const saleChargeRows = computed(() => {
            return store.state.Asset_Fees.saleFeeArray;
        });
        const idFieldCharge = 'asset_fee_id';
        const actionCharges = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Charge', rightName: 'Adding Sale Assets'},
        ]);
        const showActions = ref(false);
        const showTotals = ref(true);
        const scheduleColumns = ref([
            {label: "Instlmnt", key:"installment", type: "text", editable: false},
            {label: "Due Date", key:"due_date", type: "text", editable: false},
            {label: "Asset Balance", key:"formatted_asset_balance", type: "text", editable: false},
            {label: "Instl Principal", key:"formatted_principal_amount", type: "number", editable: false},
            {label: "Instl Interest", key:"formatted_interest_amount", type: "number", editable: false},
            {label: "Schedule Payment", key:"formatted_schedule_repayment", type: "number", editable: false},
        ]);
        const scheduleRows = computed(() => {
            return store.state.Asset_Sales.assetSchedules;
        });
        const fetchAssetClients = async() =>{
            await store.dispatch('Asset_Clients/fetchAssetClients', {company:companyID.value});
        };
        const handleSelectedClient = async(option) =>{
            await store.dispatch('Asset_Clients/handleSelectedCustomer', option)
            clientID.value = store.state.Asset_Clients.customerID;
        };
        const clearSelectedClient = async() =>{
            await store.dispatch('Asset_Clients/updateState', {customerID: ''});
            clientID.value = store.state.Asset_Clients.customerID;   
            if(selectedSale.value && selectedSale.value.customer != ""){
                selectedSale.value.customer.asset_sale_client_id = clientID.value;
                clientValue.value = clientID.value
            } 
        };
        const handleSelectedPlan = async(option) =>{
            await store.dispatch('Payment_Plans/handleSelectedAssetSalePlan', option)
            planID.value = store.state.Payment_Plans.planID;
            payMode.value = store.state.Payment_Plans.payMode;
            depositMode.value = store.state.Payment_Plans.depositMode;
            depositValue.value = store.state.Payment_Plans.depositValue;
            installments.value = store.state.Payment_Plans.installments;
            interestMethod.value = store.state.Payment_Plans.interestMethod;
            interestValue.value = store.state.Payment_Plans.interestValue;
            interestMode.value = store.state.Payment_Plans.interestMode;
            balanceMode.value = store.state.Payment_Plans.balanceMode;
            repayFrequency.value = store.state.Payment_Plans.repayFrequency;

            if(payMode.value == "Hire Purchase"){
                formFields.value[5].hidden = false;
                formFields.value[6].hidden = false;
                formFields.value[7].hidden = false;
                formFields.value[8].hidden = false;
                formFields.value[9].hidden = false;
                formFields.value[10].hidden = false;
                formFields.value[11].hidden = false;
                formFields.value[12].hidden = false;
                formFields.value[13].hidden = false;
                formFields.value[14].hidden = false;
            }else{
                formFields.value[5].hidden = true;
                formFields.value[6].hidden = true;
                formFields.value[7].hidden = true;
                formFields.value[8].hidden = true;
                formFields.value[9].hidden = true;
                formFields.value[10].hidden = true;
                formFields.value[11].hidden = true;
                formFields.value[12].hidden = true;
                formFields.value[13].hidden = true;
                formFields.value[14].hidden = true;
            }
        };
        const clearSelectedPlan = async() =>{
            await store.dispatch('Payment_Plans/updateState', {planID: ''});
            planID.value = store.state.Payment_Plans.planID;   
            if(selectedSale.value && selectedSale.value.payment_plan != ""){
                selectedSale.value.payment_plan.payment_plan_id = planID.value;
                planValue.value = planID.value
            } 
        };
        const fetchAssetUnits = async(assetID) =>{
            await store.dispatch('Asset_Units/fetchAssetUnits', {company:companyID.value, asset: assetID, status: ["Available"]});
        };
        const handleSelectedUnit = async(option) =>{
            await store.dispatch('Asset_Units/handleSelectedUnit', option)
            unitComponentKey.value += 1;
        };
        const handleSelectedAsset = async(option) =>{
            await store.dispatch('Sale_Assets/handleSelectedAsset', option)
            assetID.value = store.state.Sale_Assets.assetID;
            fetchAssetUnits(assetID.value)
            fetchSalePlans(assetID.value)
            store.dispatch('Asset_Fees/updateState', {saleFeeArray: defSaleCharges.value});
            if(selectedSale.value){
                selectedSale.value.asset.sale_asset_id = assetID.value;
                fetchAssetUnits(assetID.value)
                fetchSalePlans(assetID.value)
            }
        }
        const clearSelectedAsset = async() =>{
            await store.dispatch('Sale_Assets/updateState', {assetID: ''});
            assetID.value = store.state.Sale_Assets.assetID;
        }

        const fetchSaleAssets = async() =>{
            await store.dispatch('Sale_Assets/fetchSaleAssets', {company:companyID.value})
        };
        const fetchPlans = async() =>{
            await store.dispatch('Payment_Plans/fetchPaymentPlans', {company:companyID.value})
        };
        const fetchSalePlans = async(assetID) =>{
            await store.dispatch('Payment_Plans/fetchAssetSalePlans', {company:companyID.value, asset: assetID})
        };
        const fetchCharges = async() =>{
            await store.dispatch('Asset_Fees/fetchAssetFees', {company:companyID.value})
        };
        const fetchSaleCharges = async() =>{
            await store.dispatch('Asset_Fees/fetchAssetSaleFees', {company:companyID.value, charge_time:['Sale','Purchase & Sale']})
        };
        const formFields = ref();
        const assetValue = computed(() => {
           return (selectedSale.value && selectedSale.value.asset && !assetID.value) ? selectedSale.value.asset.sale_asset_id : assetID.value;
        });
        const clientValue = computed(() => {
           return (selectedSale.value && selectedSale.value.customer && !clientID.value) ? selectedSale.value.customer.asset_sale_client_id : clientID.value;
        });
        const planValue = computed(() => {
           return (selectedSale.value && selectedSale.value.payment_plan && !planID.value) ? selectedSale.value.payment_plan.asset_sale_plan_id : planID.value;
        });
        const displayDepositValue = (value) =>{
            if(value == "None"){
                formFields.value[6].hidden = true;
                formFields.value[7].hidden = true;
            }else{
                formFields.value[6].hidden = false;
                formFields.value[7].hidden = false;
            }
        };
        const calculateDepositAmount= (value) =>{
            if(formFields.value[5].hidden == false && formFields.value[5].value == "Percentage"){
                let depAmount = (formFields.value[6].value / 100) * value;
                formFields.value[7].value = depAmount;
            }else if(formFields.value[5].hidden == false && formFields.value[5].value == "Fixed Amount"){
                formFields.value[7].value = formFields.value[6].value;
            }
        }
        const updateFormFields = () => {
            formFields.value = [
                { type: 'date', name: 'date',label: "Date", value: selectedSale.value?.date || formatDate(current_date), required: true,maxDate: formatDate(current_date), placeholder: '' },
                {  
                    type:'search-dropdown', label:"Client", value: clientValue.value, componentKey: clientComponetKey,
                    selectOptions: clientArray, optionSelected: handleSelectedClient, required: true,
                    searchPlaceholder: 'Select Client...', dropdownWidth: '300px', updateValue: selectedClient.value,
                    fetchData: fetchAssetClients(), clearSearch: clearSelectedClient
                },
                {  
                    type:'search-dropdown', label:"Asset", value: assetValue.value, componentKey: assetComponentKey,
                    selectOptions: assetArray, optionSelected: handleSelectedAsset, required: true,
                    searchPlaceholder: 'Select Asset...', dropdownWidth: '300px', updateValue: selectedAsset.value,
                    fetchData: fetchSaleAssets(), clearSearch: clearSelectedAsset
                },
                {  
                    type:'search-dropdown', label:"Sales Plan", value: planValue.value, componentKey: planComponentKey,
                    selectOptions: planArray, optionSelected: handleSelectedPlan, required: false,
                    searchPlaceholder: 'Select Plan...', dropdownWidth: '450px', updateValue: selectedPlan.value,
                    clearSearch: clearSelectedPlan
                },
                { type: 'dropdown', name: 'discount_mode',label: "Discount Mode", value: selectedSale.value?.discount_mode || 'Fixed Amount', placeholder: "", required: true, options: [{ text: 'Percentage', value: 'Percentage' }, { text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'None', value: 'None' }] },
                { type: 'dropdown', name: 'deposit_mode',label: "Deposit Mode", value: selectedSale.value?.deposit_mode || computedDepositMode.value, placeholder: "", required: true, hidden:true, options: [{ text: 'Percentage', value: 'Percentage' }, { text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'None', value: 'None' }] , method: displayDepositValue},
                { type: 'number', name: 'deposit_value',label: "Deposit Value", value: selectedSale.value?.deposit_value || computedDepositValue.value, placeholder: "", required: false, hidden:true },
                { type: 'number', name: 'actual_deposit',label: "Actual Deposit", value: selectedSale.value?.actual_deposit || computedActualDepositValue.value, placeholder: "", required: false, hidden:true },
                { type: 'number', name: 'installments',label: "Installments", value: selectedSale.value?.installments || computedInstallments.value, placeholder: "", required: false, hidden:true },
                { type: 'dropdown', name: 'interest_method',label: "Interest Method", value: selectedSale.value?.interest_method || computedInterestMethod.value, placeholder: "", required: true, hidden:true, options: [{ text: 'Simple Interest', value: 'Simple Interest' },{ text: 'Compound Interest', value: 'Compound Interest' },{ text: 'Reducing Interest EMI', value: 'Reducing Interest EMI' }, { text: 'Reducing Interest Fixed Principal', value: 'Reducing Interest Principal Payments' },{ text: 'Flat Interest EMI', value: 'Flat Interest EMI' }, { text: 'Flat Interest Principal Payments', value: 'Flat Interest Principal Payments' }] },
                { type: 'number', name: 'interest_value',label: "Interest Value", value: selectedSale.value?.interest_value || computedInterestValue.value, placeholder: "", required: false, hidden:true },
                { type: 'dropdown', name: 'interest_mode',label: "Interest Mode", value: selectedSale.value?.interest_mode || computedInterestMode.value, placeholder: "", required: true, hidden:true, options: [{ text: 'Deposit Inclusive', value: 'Deposit Inclusive' }, { text: 'Deposit Exclusive', value: 'Deposit Exclusive' }] },
                { type: 'dropdown', name: 'balance_mode',label: "Balance Mode", value: selectedSale.value?.balance_mode || computedBalanceMode.value, placeholder: "", required: true, hidden:true, options: [{ text: 'Equal Distribution', value: 'Equal Distribution' }, { text: 'One-Off', value: 'One-Off' }, { text: 'Any Amount', value: 'Any Amount' }] },
                { type: 'date', name: 'repayment_date',label: "Repayment Start Date", value: selectedSale.value?.repayment_date || '', required: true, placeholder: '', hidden: true },
                { type: 'dropdown', name: 'repayment_frequency',label: "Repayment Frequency", value: selectedSale.value?.repayment_frequency || computedRepayFrequency.value, placeholder: "", required: true, hidden: true, options: [{ text: 'Daily', value: 'Daily' }, { text: 'Weekly', value: 'Weekly' },{ text: 'Monthly', value: 'Monthly' }, { text: 'Annually', value: 'Annually' }] },
                { type: 'number', name: 'discount',label: "Discount", value: selectedSale.value?.discount || 0, required: false},
                { type: 'number', name: 'total_amount',label: "Total Amount", value: selectedSale.value?.total_amount || 0, required: true, method: calculateDepositAmount },
                {required: false},
                {required: false},
                {  
                    type:'search-dropdown', label:"Unit(s)", value: "", componentKey: unitComponentKey,
                    selectOptions: units_array, optionSelected: handleSelectedUnit, required: true,
                    searchPlaceholder: 'Select Unit...', dropdownWidth: '450px', updateValue: "",
                    
                },
            ];
        };
        const fetchSalesAgents = async() =>{
            await store.dispatch('Sales_Agents/fetchSalesAgents', {company:companyID.value})
        };
        const handleSelectedAgent = async(option) =>{
            await store.dispatch('Sales_Agents/handleSelectedAgent', option)
            agentID.value = store.state.Sales_Agents.agentID;
            additionalFields.value[2].value = store.state.Sales_Agents.agentCommission;
            if(selectedSale.value && selectedAgent.value){
                selectedSale.value.sales_agent.sales_agent_id = agentID.value;
            }
        }
        const clearSelectedAgent = async() =>{
            await store.dispatch('Sales_Agents/updateState', {agentID: ''});
            agentID.value = store.state.Sales_Agents.agentID;
        }
        const agentValue = computed(() => {
           return (selectedSale.value && selectedSale.value.sales_agent && !agentID.value) ? selectedSale.value.sales_agent.sales_agent_id : agentID.value;
        });
        const additionalFields = ref();
        const additionalFields1 = ref();
        const hideCommissionOptions= (value) =>{
            if(value != "None"){
                additionalFields.value[2].hidden = false;
                additionalFields.value[3].hidden = false;
            }else{
                additionalFields.value[2].hidden = true;
                additionalFields.value[3].hidden = true;
            }
        }
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                {  
                    type:'search-dropdown', label:"Sales Agent", value: agentValue.value, componentKey: agentComponentKey,
                    selectOptions: agentArray, optionSelected: handleSelectedAgent, required: false,
                    searchPlaceholder: 'Select Agent...', dropdownWidth: '350px', updateValue: selectedAgent.value,
                    clearSearch: clearSelectedAgent
                },
                { type: 'dropdown', name: 'commission_mode',label: "Commission Mode", value: selectedSale.value?.commission_mode || 'None', placeholder: "", required: false, options: [{ text: 'Percentage', value: 'Percentage' }, { text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'None', value: 'None' }], method: hideCommissionOptions },
                { type: 'number', name: 'commission_amount',label: "Commission Value", value: selectedSale.value?.commission_amount || 0, required: false, hidden: true },
                { type: 'dropdown', name: 'commission_method',label: "Commission Method", value: selectedSale.value?.commission_method || 'Discount Exclusive', placeholder: "", required: false, hidden: true, options: [{ text: 'Discount Exclusive', value: 'Discount Exclusive' }, { text: 'Discount Inclusive', value: 'Discount Inclusive' }] },

            ];
        };
        const updateAdditionalFormFields1 = () => {
            additionalFields1.value = [
                { type: 'text-area', name: 'notes',label: "Notes", value: selectedSale.value?.notes || '', textarea_rows: '9', textarea_cols: '112', required: false },

            ];
        };

        watch([clientID, planID,assetID, selectedSale, unitRows], () => {
            if (clientID.value != "") {
                formFields.value[1].value = clientID.value;
            }
            if (planID.value != "") {
                formFields.value[3].value = planID.value;
            }
            if (assetID.value != "") {
                formFields.value[2].value = assetID.value;
            }

            if(selectedSale.value){
                store.dispatch('Asset_Fees/updateState', { saleFeeArray: saleCharges.value,})
                store.dispatch('Asset_Units/updateState', { unitArray: saleUnits.value})
                fetchAssetUnits(selectedSale.value.asset.sale_asset_id)
                fetchSalePlans(selectedSale.value.asset.sale_asset_id)
            }
            
        }, { immediate: true });

        watch([selectedSale, selectedAsset, selectedClient, selectedPlan, selectedAgent], () => {
            if (selectedSale.value && selectedAsset.value && selectedClient.value && selectedPlan.value && selectedAgent.value) {
                clientComponetKey.value += 1;
                planComponentKey.value += 1;
                assetComponentKey.value += 1;
                agentComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
                updateAdditionalFormFields1();
                if(selectedSale.value.sale_plan_terms && selectedSale.value.sale_plan_terms.length){
                    formFields.value[5].hidden = false;
                    formFields.value[6].hidden = false;
                    formFields.value[7].hidden = false;
                    formFields.value[8].hidden = false;
                    formFields.value[9].hidden = false;
                    formFields.value[10].hidden = false;
                    formFields.value[11].hidden = false;
                    formFields.value[12].hidden = false;
                    formFields.value[13].hidden = false;
                    formFields.value[14].hidden = false;
                }
                if(selectedSale.value.commission_mode != "None"){
                    additionalFields.value[2].hidden = false;
                    additionalFields.value[3].hidden = false;
                }
            }else if(selectedSale.value && selectedAsset.value && selectedClient.value && selectedPlan.value){
                assetComponentKey.value += 1;
                clientComponetKey.value += 1;
                planComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
                updateAdditionalFormFields1();
                if(selectedSale.value.sale_plan_terms && selectedSale.value.sale_plan_terms.length){
                    formFields.value[5].hidden = false;
                    formFields.value[6].hidden = false;
                    formFields.value[7].hidden = false;
                    formFields.value[8].hidden = false;
                    formFields.value[9].hidden = false;
                    formFields.value[10].hidden = false;
                    formFields.value[11].hidden = false;
                    formFields.value[12].hidden = false;
                    formFields.value[13].hidden = false;
                    formFields.value[14].hidden = false;
                }
                
            }else if(selectedSale.value && selectedAsset.value){
                assetComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
                updateAdditionalFormFields1();
            }
        }, { immediate: true });

        const handleReset = async() =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].name == 'discount_mode'){
                    formFields.value[i].value = 'Fixed Amount';
                }else if(formFields.value[i].name == 'discount' || formFields.value[i].name == 'total_amount'){
                    formFields.value[i].value = 0;
                }else{
                    formFields.value[i].value = '';
                }
            }
            formFields.value[0].value = formatDate(current_date);
            
            formFields.value[5].hidden = true;
            formFields.value[6].hidden = true;
            formFields.value[7].hidden = true;
            formFields.value[8].hidden = true;
            formFields.value[9].hidden = true;
            formFields.value[10].hidden = true;
            formFields.value[11].hidden = true;
            formFields.value[12].hidden = true;
            formFields.value[13].hidden = true;
            formFields.value[14].hidden = true;

            for(let i=0; i < additionalFields.value.length; i++){
                if(additionalFields.value[i].name == 'commission_mode'){
                    additionalFields.value[i].value = 'None';
                }else if(additionalFields.value[i].name == 'commission_method'){
                    additionalFields.value[i].value = 'Discount Exclusive';
                }else if(additionalFields.value[i].name == 'commission_amount'){
                    additionalFields.value[i].value = 0;
                }else{
                    additionalFields.value[i].value = '';
                }
            }
            await store.dispatch('Payment_Plans/updateState', { salePlanArray: []});
            await store.dispatch("Asset_Units/updateState", {unitArray: []})
            await store.dispatch('Asset_Fees/updateState', {saleFeeArray: []});
            await store.dispatch('Asset_Sales/updateState', {selectedSale: null, selectedAgent: null, selectedPlan: null, selectedAsset: null, selectedClient: null,saleCharges:[],saleUnits:[],assetSchedules:[], isEditing:false});
            planComponentKey.value += 1;
            assetComponentKey.value += 1;
            clientComponetKey.value += 1;
            mainComponentKey.value += 1;
            assetID.value = "";
            clientID.value = "";
        }
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createAssetSale = async() =>{
            showLoader();
            salePlanTermsArr.value = [];
            if(formFields.value[5].hidden == false){
                let obj = {
                    'deposit_mode': formFields.value[5].value,
                    'deposit_value': formFields.value[6].value,
                    'actual_deposit': formFields.value[7].value,
                    'installments': formFields.value[8].value,
                    'interest_method': formFields.value[9].value,
                    'interest_value': formFields.value[10].value,
                    'interest_mode': formFields.value[11].value,
                    'balance_mode': formFields.value[12].value,
                    'repayment_date': formFields.value[13].value,
                    'repayment_frequency': formFields.value[14].value,
                }
                salePlanTermsArr.value.push(obj)
            }
            let formData = {
                sale_code: '-',
                date: formFields.value[0].value,
                total_amount: formFields.value[16].value,
                discount_mode: formFields.value[4].value,
                discount: formFields.value[15].value,
                notes: additionalFields1.value[0].value,
                commission_mode: additionalFields.value[1].value,
                commission_amount: additionalFields.value[2].value || 0,
                commission_method: additionalFields.value[3].value || 'Discount Exclusive',
                sale_plan_terms: salePlanTermsArr.value,
                approval_status: 'Pending',
                sale_status: 'Active',
                sale_type: 'New',
                sale_balance: 0,
                posted: 'No',
                asset: assetID.value,
                asset_id: assetID.value,
                sales_agent: agentID.value,
                sales_agent_id: agentID.value,
                customer: clientID.value,
                customer_id: clientID.value,
                payment_plan: planID.value,
                payment_plan_id: planID.value,
                sale_units: unitRows.value,
                sale_charges: saleChargeRows.value,
                company: companyID.value,
                user: userID.value,
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            let unitSum = 0;
            for(let i=0; i < unitRows.value.length; i++){
                unitSum += parseFloat(unitRows.value[i].sale_total_amount);
            }
            if(assetValue.value == '' || clientValue.value == '' || planValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();
            }else if(unitRows.value.length == 0){
                toast.error('Please Select Units');
                hideLoader();
            }else if(unitSum != formFields.value[16].value){
                toast.error('Invalid Amount');
                hideLoader();
            }else if(formFields.value[16].value <= 0){
                toast.error('Invalid Sale Amount');
                hideLoader();
            }
            else{
                try {
                    const response = await store.dispatch('Asset_Sales/createAssetSale', formData);
                    if(response && response.status === 201) {
                        hideLoader();
                        toast.success('Sale created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Sale.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Sale: ' + error.message);
                } finally {
                    hideLoader();
                }
            }

        }
        const updateAssetSale = async() =>{
            showLoader();
            salePlanTermsArr.value = [];
            if(formFields.value[5].hidden == false){
                let obj = {
                    'deposit_mode': formFields.value[5].value,
                    'deposit_value': formFields.value[6].value,
                    'actual_deposit': formFields.value[7].value,
                    'installments': formFields.value[8].value,
                    'interest_method': formFields.value[9].value,
                    'interest_value': formFields.value[10].value,
                    'interest_mode': formFields.value[11].value,
                    'balance_mode': formFields.value[12].value,
                    'repayment_date': formFields.value[13].value,
                    'repayment_frequency': formFields.value[14].value,
                }
                salePlanTermsArr.value.push(obj)
            }
            errors.value = [];
            let formData = {
                asset_sale: selectedSale.value.asset_sale_id,
                sale_code: selectedSale.value.sale_code,
                date: formFields.value[0].value,
                total_amount: formFields.value[16].value,
                discount_mode: formFields.value[4].value,
                discount: formFields.value[15].value,
                notes: additionalFields1.value[0].value,
                commission_mode: additionalFields.value[1].value,
                commission_amount: additionalFields.value[2].value,
                commission_method: additionalFields.value[3].value,
                sale_plan_terms: salePlanTermsArr.value,
                approval_status: selectedSale.value.approval_status,
                sale_status: selectedSale.value.sale_status,
                sale_type: selectedSale.value.sale_type,
                sale_balance: selectedSale.value.sale_balance,
                posted: selectedSale.value.posted,
                asset: assetValue.value,
                asset_id: assetValue.value,
                sales_agent: agentValue.value,
                sales_agent_id: agentValue.value,
                customer: clientValue.value,
                customer_id: clientValue.value,
                payment_plan: planValue.value,
                payment_plan_id: planValue.value,
                sale_units: unitRows.value,
                sale_charges: saleChargeRows.value,
                company: companyID.value,
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            let unitSum = 0;
            for(let i=0; i < unitRows.value.length; i++){
                unitSum += unitRows.value[i].sale_total_amount;
            }
            if(assetValue.value == ''|| clientValue.value == '' || planValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
                    hideLoader();
            }else if(unitRows.value.length == 0){
                toast.error('Please Select Units');
                hideLoader();
            }else if(unitSum != formFields.value[16].value){
                toast.error('Invalid Amount');
                hideLoader();
            }else if(formFields.value[16].value <= 0){
                toast.error('Invalid Sale Amount');
                hideLoader();
            }
            else{
                try {
                    const response = await store.dispatch('Asset_Sales/updateAssetSale', formData);
                    if (response && response.status === 200) {
                        hideLoader();
                        toast.success("Sale updated successfully!");
                        handleReset();
                        store.commit('pageTab/REMOVE_PAGE', {'PSS':'Sale_Details'})
                        store.commit('pageTab/ADD_PAGE', {'PSS':'Asset_Sales'})
                        store.state.pageTab.pssActiveTab = 'Asset_Sales';
                    } else {
                        toast.error('An error occurred while updating the Sale.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Sale: ' + error.message);
                } finally {
                    hideLoader();
                }
            }
        }
        const saveAssetSale = () =>{
            if(isEditing.value == true){
                updateAssetSale();
            }else{
                createAssetSale();
            }
        };

        const selectTab = (index) => {
            activeTab.value = index;
        };
        
        const handleSelectedSaleCharge = async(option) =>{
            await store.dispatch('Asset_Fees/handleSelectedSaleFee', option);
            chargeComponentKey.value += 1;
        }
        const deleteSaleCharge = (rowIndex, action, row) =>{
            store.dispatch('Asset_Fees/removeAssetSaleFee', rowIndex);
            tableKey.value += 1;
        };
        const generateSchedules = async() =>{
            showLoader();
            salePlanTermsArr.value = [];
            if(formFields.value[5].hidden == false){
                let obj = {
                    'deposit_mode': formFields.value[5].value,
                    'deposit_value': formFields.value[6].value,
                    'actual_deposit': formFields.value[7].value,
                    'installments': formFields.value[8].value,
                    'interest_method': formFields.value[9].value,
                    'interest_value': formFields.value[10].value,
                    'interest_mode': formFields.value[11].value,
                    'balance_mode': formFields.value[12].value,
                    'repayment_date': formFields.value[13].value,
                    'repayment_frequency': formFields.value[14].value,
                }
                salePlanTermsArr.value.push(obj)
            }
            let formData = {
                sale_plan_terms: salePlanTermsArr.value,
                repayment_start_date: formFields.value[13].value,
                start_date: formFields.value[0].value,
                total_amount: formFields.value[16].value,
                installments: parseFloat(formFields.value[8].value),
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(clientValue.value == '' || assetValue.value == '' || planValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();
            }else if(parseFloat(formFields.value[16].value) <= 0){
                toast.error('Invalid Amount');
                hideLoader();
            }
            else{
                try {
                    const response = await store.dispatch('Asset_Sales/generateArmotizationSchedules', formData);
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to generate schedules: ' + error.message);
                } finally {
                    hideLoader();
                }
            }

        };
        
        onBeforeMount(()=>{ 
            fetchPlans();
            fetchCharges();
            fetchSalesAgents();
            fetchSaleCharges();
            updateFormFields();
            updateAdditionalFormFields();
            updateAdditionalFormFields1();
            flex_basis.value = '1/6';
            flex_basis_percentage.value = '20';
            additional_flex_basis.value = '1/6';
            additional_flex_basis_percentage.value = '20';
        })
        onMounted(()=>{
            
        })

        return{
            tabs,componentKey, formFields, additionalFields,additionalFields1, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, mainComponentKey,handleReset, loader, showLoader, hideLoader,
            displayButtons,saveAssetSale,saleChargeArr,chargesDropdownWidth,chargesSearchPlaceholder,selectTab,handleSelectedSaleCharge,
            deleteSaleCharge,activeTab,rightsModule,idFieldCharge,saleChargeRows,chargeColumns,actionCharges,chargeComponentKey,
            tableKey,actionUnits,unitColumns,unitRows,deleteUnit,scheduleColumns,scheduleRows,generateSchedules,showActions,showTotals
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