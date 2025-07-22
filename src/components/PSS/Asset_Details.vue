<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <h2><strong>Asset Details</strong></h2>
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveSaleAsset" @handleReset="handleReset"> 
                    <template v-slot:additional-content>
                        <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[180px]">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Purchase & Selling Details</h1>
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
                                            :key="chargeComponentKey"
                                            :options="purchaseChargeArr"
                                            :dropdownWidth="chargesDropdownWidth"
                                            :searchPlaceholder="chargesSearchPlaceholder"
                                            @option-selected="handleSelectedPurchaseCharge"
                                            @fetchData="fetchData"
                                        />
                                    </div>                      
                                    <DynamicTable :key="tableKey" :columns="chargeColumns" :rows="purchaseChargeRows" :idField="idFieldCharge" :actions="actionCharges" @action-click="deletePurchaseCharge" :rightsModule="rightsModule" />
                                </div>
                                <div v-show="activeTab == 2">
                                    <DynamicForm :fields="additionalFields1" :flex_basis="additional_flex_basis" :flex_basis_percentage="additional_flex_basis_percentage" @handleReset="handleReset"/>
                                    <div class="text-left p-2">
                                        <SearchableDropdown 
                                            :key="planComponentKey"
                                            :options="planArr"
                                            :dropdownWidth="chargesDropdownWidth"
                                            :searchPlaceholder="plansSearchPlaceholder"
                                            @option-selected="handleSelectedPlan"
                                            @fetchData="fetchData"
                                        />
                                    </div>                      
                                    <DynamicTable :key="tableKey" :columns="planColumns" :rows="planRows" :idField="idFieldPlan" :actions="actionPlans" @action-click="deletePlan" :rightsModule="rightsModule" />
                                </div>
                                <div v-show="activeTab == 3">
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
                                    <DynamicTable :key="tableKey" :columns="chargeColumns" :rows="saleChargeRows" :idField="idFieldCharge" :actions="actionCharges" @action-click="deleteSaleCharge" :rightsModule="rightsModule" />
                                </div>
                                <div v-show="activeTab == 4">
                                    <DynamicForm :fields="additionalFields2" :flex_basis="additional_flex_basis" :flex_basis_percentage="additional_flex_basis_percentage" @handleReset="handleReset"/>
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

export default defineComponent({
    name: 'Asset_Details',
    components:{
         DynamicForm,PageStyleComponent,SearchableDropdown,DynamicTable
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const tabs = ref(['Purchase Details','Purchase Charges','Selling Details','Selling Charges','Commissions','Asset Features']);
        const mainComponentKey = ref(0);
        const depComponentKey = ref(0);
        const userComponentKey = ref(0);
        const currComponentKey = ref(0);
        const vendComponentKey = ref(0);
        const chargeComponentKey = ref(0);
        const planComponentKey = ref(0);
        const activeTab = ref(0);
        const rightsModule = ref('PSS');
        const displayButtons = ref(true);
        const componentKey = ref(0);
        const tableKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const selectedAsset = computed(()=> store.state.Sale_Assets.selectedAsset);
        const selectedMake = computed(()=> store.state.Sale_Assets.selectedMake);
        const selectedCurrency = computed(()=> store.state.Sale_Assets.selectedCurrency);
        const selectedVendor = computed(()=> store.state.Sale_Assets.selectedVendor);
        const selectedModel = computed(()=> store.state.Sale_Assets.selectedModel);
        const saleCharges = computed(()=> store.state.Sale_Assets.saleCharges);
        const purchaseCharges = computed(()=> store.state.Sale_Assets.purchaseCharges);
        const salePlans = computed(()=> store.state.Sale_Assets.salePlans);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const isEditing = computed(()=> store.state.Sale_Assets.isEditing);
        const vendorArray = computed(() => store.state.Vendors.vendorArr);
        const makeArray = computed(() => store.state.Asset_Makes.makeArr);
        const modelArr = computed(() => store.state.Asset_Models.modelArr);
        const currencyArray = computed(() => store.state.Currencies.currencyArr);
        const saleChargeArr = computed(() => store.state.Asset_Fees.saleFeeArr);
        const purchaseChargeArr = computed(() => store.state.Asset_Fees.purchaseFeeArr);
        const planArr = computed(() => store.state.Payment_Plans.salePlanArr);
        const chargesDropdownWidth = ref('400px');
        const chargesSearchPlaceholder = ref('Select Charge...');
        const plansSearchPlaceholder = ref('Select Plan...');
        const makeID = ref('');
        const modelID = ref('');
        const currencyID = ref('');
        const vendorID = ref('');
        const chargeColumns = ref([
            {label: "Name", key:"fee_name", type: "text", editable: false},
            {label: "Charge Mode", key:"charge_mode", type: "text", editable: false},
            // {label: "Divide", key:"divide", type: "text", editable: false},
            {label: "Amount", key: "default_amount", type: "number", editable: true},
        ]);
        const saleChargeRows = computed(() => {
            return store.state.Asset_Fees.saleFeeArray;
        });
        const purchaseChargeRows = computed(() => {
            return store.state.Asset_Fees.purchaseFeeArray;
        });
        const idFieldCharge = 'asset_fee_id';
        const actionCharges = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Charge', rightName: 'Adding Sale Assets'},
        ])
        const planColumns = ref([
            {label: "Name", key:"name", type: "text", editable: false},
            {label: "Payment Mode", key:"payment_mode", type: "text", editable: false},
            {label: "Installments", key:"installments", type: "text", editable: true},
            {label: "Deposit Mode", key:"deposit_mode", type: "dropdown", editable: false},
            {label: "Deposit Value", key:"deposit_value", type: "text", editable: true},
        ]);
        const planRows = computed(() => {
            return store.state.Payment_Plans.salePlanArray;
        });
        const idFieldPlan = 'payment_plan_id';
        const actionPlans = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Plan', rightName: 'Adding Sale Assets'},
        ])
        const fetchAssetMakes = async() =>{
            await store.dispatch('Asset_Makes/fetchAssetMakes', {company:companyID.value});
        };
        const handleSelectedMake = async(option) =>{
            await store.dispatch('Asset_Makes/handleSelectedMake', option)
            makeID.value = store.state.Asset_Makes.makeID;
            fetchAssetModels(makeID.value)
        };
        const clearSelectedMake = async() =>{
            await store.dispatch('Asset_Makes/updateState', {makeID: ''});
            makeID.value = store.state.Asset_Makes.makeID;   
            if(selectedAsset.value && selectedAsset.value.asset_make){
                selectedAsset.value.asset_make.asset_make_id = makeID.value;
                makeValue.value = makeID.value
            } 
        };
        const fetchAssetModels = async(makeID) =>{
            await store.dispatch('Asset_Models/fetchAssetModels', {company:companyID.value, asset_make:makeID});
        };
        const handleSelectedModel = async(option) =>{
            await store.dispatch('Asset_Models/handleSelectedModel', option)
            modelID.value = store.state.Asset_Models.modelID;
        };
        const clearSelectedModel = async() =>{
            await store.dispatch('Asset_Models/updateState', {modelID: ''});
            modelID.value = store.state.Asset_Models.modelID;
            if(selectedAsset.value && selectedAsset.value.asset_model){
                selectedAsset.value.asset_model.asset_model_id = modelID.value;
                modelValue.value = modelID.value
            } 
        };
        const handleSelectedCurrency = async(option) =>{
            await store.dispatch('Currencies/handleSelectedCurrency', option)
            currencyID.value = store.state.Currencies.currencyID;
            if(selectedAsset.value){
                selectedAsset.value.asset_currency.currency_id = currencyID.value;
            }
        }
        const clearSelectedCurrency = async() =>{
            await store.dispatch('Currencies/updateState', {currencyID: ''});
            currencyID.value = store.state.Currencies.currencyID;
        }

        const fetchCurrencies = async() =>{
            await store.dispatch('Currencies/fetchCurrencies', {company:companyID.value})
        };
        const fetchPlans = async() =>{
            await store.dispatch('Payment_Plans/fetchPaymentPlans', {company:companyID.value})
        };
        const fetchSalePlans = async() =>{
            await store.dispatch('Payment_Plans/fetchSalePlans', {company:companyID.value, category: 'Sale'})
        };
        const fetchCharges = async() =>{
            await store.dispatch('Asset_Fees/fetchAssetFees', {company:companyID.value})
        };
        const fetchSaleCharges = async() =>{
            await store.dispatch('Asset_Fees/fetchAssetSaleFees', {company:companyID.value, charge_time:['Sale','Purchase & Sale']})
        };
        const fetchPurchaseCharges = async() =>{
            await store.dispatch('Asset_Fees/fetchAssetPurchaseFees', {company:companyID.value, charge_time:['Purchase','Purchase & Sale']})
        };
        const formFields = ref();
        const currencyValue = computed(() => {
           return (selectedAsset.value && selectedAsset.value.asset_currency && !currencyID.value) ? selectedAsset.value.asset_currency.currency_id : currencyID.value;
        });
        const makeValue = computed(() => {
           return (selectedAsset.value && selectedAsset.value.asset_make && !makeID.value) ? selectedAsset.value.asset_make.asset_make_id : makeID.value;
        });
        const modelValue = computed(() => {
           return (selectedAsset.value && selectedAsset.value.asset_model && !modelID.value) ? selectedAsset.value.asset_model.asset_model_id : modelID.value;
        });
        const enableCommissionSetup = (value) =>{
            if(value != 'Owner'){
                additionalFields2.value[0].disabled = false;
                additionalFields2.value[1].disabled = false;
            }else{
                additionalFields2.value[0].disabled = true;
                additionalFields2.value[1].disabled = true;
            }
        }
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'asset_code',label: "Code", value: selectedAsset.value?.asset_code || '', required: false },
                { type: 'text', name: 'registration_number',label: "Reg No", value: selectedAsset.value?.registration_number || '', required: false },
                { type: 'dropdown', name: 'asset_type',label: "Asset Type", value: selectedAsset.value?.asset_type || '', placeholder: "", required: true, options: [{ text: 'Land', value: 'Land' }, { text: 'Building', value: 'Building' }] },
                { type: 'date', name: 'start_date',label: "Start Date", value: selectedAsset.value?.start_date || '', required: true, placeholder: '' },
                { type: 'text', name: 'name',label: "Asset Name", value: selectedAsset.value?.name || '', required: true },
                { type: 'dropdown', name: 'selling_as',label: "Selling As", value: selectedAsset.value?.selling_as || 'Owner', placeholder: "", required: true, options: [{ text: 'Owner', value: 'Owner' }, { text: 'Open Agency', value: 'Open Agency' }, { text: 'Exclusive Agency', value: 'Exclusive Agency' }], method: enableCommissionSetup },
                { type: 'text', name: 'location',label: "Location", value: selectedAsset.value?.location || '', required: false, placeholder: '' },
                { type: 'dropdown', name: 'unit_measure',label: "Unit Measure", value: selectedAsset.value?.unit_measure || '', placeholder: "", required: true, options: [{ text: 'Plots', value: 'Plots' }, { text: 'Acres', value: 'Acres' },{ text: 'Units', value: 'Units' }, { text: 'Sqr Ft', value: 'Sqr Ft' },{ text: 'Sqr Mtr', value: 'Sqr Mtr' }] },
                { type: 'number', name: 'units_quantity',label: "No of Units", value: selectedAsset.value?.units_quantity || 1, required: true },
                { type: 'text', name: 'size_per_unit',label: "Unit Size", value: selectedAsset.value?.size_per_unit || '', required: false },
                { type: 'number', name: 'number_of_floors',label: "Floors", value: selectedAsset.value?.number_of_floors || 0, required: false },
                {  
                    type:'search-dropdown', label:"Currency", value: currencyValue.value, componentKey: currComponentKey,
                    selectOptions: currencyArray, optionSelected: handleSelectedCurrency, required: true,
                    searchPlaceholder: 'Select Currency...', dropdownWidth: '500px', updateValue: selectedCurrency.value,
                    fetchData: fetchCurrencies(), clearSearch: clearSelectedCurrency
                },
                {  
                    type:'search-dropdown', label:"Type", value: makeValue.value, componentKey: depComponentKey,
                    selectOptions: makeArray, optionSelected: handleSelectedMake, required: false,
                    searchPlaceholder: 'Select Type...', dropdownWidth: '500px', updateValue: selectedMake.value,
                    fetchData: fetchAssetMakes(), clearSearch: clearSelectedMake
                },
                {  
                    type:'search-dropdown', label:"Design", value: modelValue.value, componentKey: userComponentKey,
                    selectOptions: modelArr, optionSelected: handleSelectedModel, required: false,
                    searchPlaceholder: 'Select Design...', dropdownWidth: '500px', updateValue: selectedModel.value,
                    clearSearch: clearSelectedModel
                },
                {required: false}
            ];
        };
        const fetchVendors = async() =>{
            await store.dispatch('Vendors/fetchVendors', {company:companyID.value})
        };
        const handleSelectedVendor = async(option) =>{
            await store.dispatch('Vendors/handleSelectedVendor', option)
            vendorID.value = store.state.Vendors.vendorID;
            if(selectedAsset.value && selectedAsset.value.vendor){
                selectedAsset.value.vendor.vendor_id = vendorID.value;
            }
        }
        const clearSelectedVendor = async() =>{
            await store.dispatch('Vendors/updateState', {vendorID: ''});
            vendorID.value = store.state.Vendors.vendorID;
        }
        const vendorValue = computed(() => {
           return (selectedAsset.value && selectedAsset.value.vendor && !vendorID.value) ? selectedAsset.value.vendor.vendor_id : vendorID.value;
        });
        const additionalFields = ref();
        const additionalFields1 = ref();
        const additionalFields2 = ref();
        const calculateUnitCost= (value) =>{
            let unitCost = (additionalFields.value[2].value / formFields.value[8].value)
            additionalFields1.value[0].value = additionalFields.value[2].value;
            additionalFields1.value[1].value = Number(unitCost).toFixed(2);
        }
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                { type: 'date', name: 'purchase_date',label: "Purchase Date", value: selectedAsset.value?.purchase_date || '', required: true, placeholder: '' },
                {  
                    type:'search-dropdown', label:"Vendor", value: vendorValue.value, componentKey: vendComponentKey,
                    selectOptions: vendorArray, optionSelected: handleSelectedVendor, required: false,
                    searchPlaceholder: 'Select Vendor...', dropdownWidth: '500px', updateValue: selectedVendor.value,
                    clearSearch: clearSelectedVendor
                },
                { type: 'number', name: 'value',label: "Purchase Price", value: selectedAsset.value?.value || 0, required: false, method: calculateUnitCost },
            ];
        };
        const calculateSellingPrice = (value) =>{
            let sellingPrice = parseFloat(additionalFields1.value[1].value) + parseFloat(additionalFields1.value[1].value * (parseFloat(value)/100))
            additionalFields1.value[3].value = sellingPrice
        }
        const updateAdditionalFormFields1 = () => {
            additionalFields1.value = [
                { type: 'number', name: 'value',label: "Asset Cost", value: selectedAsset.value?.value || 0, required: false, disabled: true },
                { type: 'number', name: 'value',label: "Unit Cost", value: selectedAsset.value?.asset_unit_cost || 0, required: false, disabled: true },
                { type: 'number', name: 'value',label: "Mark Up(%)", value: selectedAsset.value?.selling_markup || 0, required: false , method: calculateSellingPrice},
                { type: 'number', name: 'value',label: "Unit Selling Price", value: selectedAsset.value?.unit_selling_price || 0, required: false },
            ];
        };

        const updateAdditionalFormFields2 = () => {
            additionalFields2.value = [
                { type: 'dropdown', name: 'commision_mode',label: "Commission Mode", value: selectedAsset.value?.commision_mode || 'Percentage', placeholder: "", required: false, disabled: true , options: [{ text: 'Percentage', value: 'Percentage' }, { text: 'Fixed Amount', value: 'Fixed Amount' }] },
                { type: 'number', name: 'commision_value',label: "Commission Value", value: selectedAsset.value?.commision_value || 0, required: false, disabled: true },
                {required: false}
            ];
        };

        watch([makeID, modelID, selectedAsset], () => {
            if (makeID.value != "") {
                formFields.value[12].value = makeID.value;
            }
            if(modelID.value != ""){
                formFields.value[13].value = modelID.value;
            }
            if(selectedAsset.value){
                store.dispatch('Asset_Fees/updateState', { saleFeeArray: saleCharges.value, purchaseFeeArray: purchaseCharges.value})
                store.dispatch('Payment_Plans/updateState', { salePlanArray: salePlans.value})
            }
        }, { immediate: true });

        watch([selectedAsset, selectedCurrency, selectedMake, selectedModel, selectedVendor], () => {
            if (selectedAsset.value && selectedCurrency.value && selectedMake.value && selectedModel.value && selectedVendor.value) {
                depComponentKey.value += 1;
                userComponentKey.value += 1;
                currComponentKey.value += 1;
                vendComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
                updateAdditionalFormFields1();
                updateAdditionalFormFields2();
            }
            else if(selectedAsset.value && selectedCurrency.value && selectedMake.value){
                currComponentKey.value += 1;
                depComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
                updateAdditionalFormFields1();
                updateAdditionalFormFields2();
            }else if(selectedAsset.value && selectedCurrency.value && selectedModel.value){
                currComponentKey.value += 1;
                userComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
                updateAdditionalFormFields1();
                updateAdditionalFormFields2();
            }else if(selectedAsset.value && selectedCurrency.value && selectedVendor.value){
                currComponentKey.value += 1;
                vendComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
                updateAdditionalFormFields1();
                updateAdditionalFormFields2();
            }else if(selectedAsset.value && selectedCurrency.value){
                currComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
                updateAdditionalFormFields1();
                updateAdditionalFormFields2();
            }else if(selectedAsset.value){
                updateFormFields();
                updateAdditionalFormFields();
                updateAdditionalFormFields1();
                updateAdditionalFormFields2();
            }
        }, { immediate: true });

        const handleReset = async() =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].label != 'Country'){
                    formFields.value[i].value = '';
                }
            }
            for(let i=0; i < additionalFields.value.length; i++){
                additionalFields.value[i].value = '';
            }
            for(let i=0; i < additionalFields1.value.length; i++){
                additionalFields1.value[i].value = '';
            }
            for(let i=0; i < additionalFields2.value.length; i++){
                additionalFields2.value[i].value = '';
            }
            await store.dispatch('Payment_Plans/updateState', {purchasePlanArray: [], salePlanArray: []});
            await store.dispatch('Asset_Fees/updateState', {saleFeeArray: [], purchaseFeeArray: []});
            await store.dispatch('Sale_Assets/updateState', {selectedAsset: null, selectedVendor: null, selectedModel: null, selectedCurrency: null, selectedMake: null,saleCharges:[],purchaseCharges:[],salePlans:[], isEditing:false});
            mainComponentKey.value += 1;
            userComponentKey.value += 1;
            currComponentKey.value += 1;
            depComponentKey.value += 1;
            currencyID.value = "";
            modelID.value = "";
            makeID.value = "";
        }
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createSaleAsset = async() =>{
            showLoader();
            let formData = {
                asset_code: formFields.value[0].value || '-',
                asset_type: formFields.value[2].value,
                name: formFields.value[4].value,
                value: additionalFields.value[2].value,
                start_date: formFields.value[3].value,
                purchase_date: additionalFields.value[0].value,
                selling_as: formFields.value[5].value,
                commision_mode: additionalFields2.value[0].value,
                commision_value: additionalFields2.value[1].value,
                location: formFields.value[6].value,
                unit_measure: formFields.value[7].value,
                size_per_unit: formFields.value[9].value,
                units_quantity: formFields.value[8].value,
                unit_cost: additionalFields1.value[1].value,
                selling_markup: additionalFields1.value[2].value,
                unit_selling_price: additionalFields1.value[3].value,
                registration_number: formFields.value[1].value,
                approval_status: 'Pending',
                number_of_floors: formFields.value[10].value || 0,
                notes: formFields.value[14].value,
                customer_ids: null,
                asset_currency: currencyID.value,
                asset_currency_id: currencyID.value,
                vendor: vendorID.value,
                vendor_id: vendorID.value,
                asset_make: makeID.value,
                asset_make_id: makeID.value,
                asset_model: modelID.value,
                asset_model_id: modelID.value,
                sale_plans: planRows.value,
                sale_charges: saleChargeRows.value,
                purchase_charges: purchaseChargeRows.value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(currencyValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();
            }else{
                try {
                    const response = await store.dispatch('Sale_Assets/createSaleAsset', formData);
                    if(response && response.status === 201) {
                        hideLoader();
                        toast.success('Asset created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Asset.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Asset: ' + error.message);
                } finally {
                    hideLoader();
                }
            }

        }
        const updateSaleAsset = async() =>{
            showLoader();
            errors.value = [];
            let formData = {
                sale_asset: selectedAsset.value.sale_asset_id,
                asset_code: formFields.value[0].value || '-',
                asset_type: formFields.value[2].value,
                name: formFields.value[4].value,
                value: additionalFields.value[2].value,
                start_date: formFields.value[3].value,
                purchase_date: additionalFields.value[0].value,
                selling_as: formFields.value[5].value,
                commision_mode: additionalFields2.value[0].value,
                commision_value: additionalFields2.value[1].value,
                location: formFields.value[6].value,
                unit_measure: formFields.value[7].value,
                size_per_unit: formFields.value[9].value,
                units_quantity: formFields.value[8].value,
                unit_cost: additionalFields1.value[1].value,
                selling_markup: additionalFields1.value[2].value,
                unit_selling_price: additionalFields1.value[3].value,
                registration_number: formFields.value[1].value,
                approval_status: selectedAsset.value.approval_status,
                number_of_floors: formFields.value[10].value || 0,
                notes: formFields.value[14].value,
                customer_ids: selectedAsset.value.customer_ids,
                asset_currency: currencyValue.value,
                asset_currency_id: currencyValue.value,
                vendor: vendorValue.value,
                vendor_id: vendorValue.value,
                asset_make: makeValue.value,
                asset_make_id: makeValue.value,
                asset_model: modelValue.value,
                asset_model_id: modelValue.value,
                sale_plans: planRows.value,
                sale_charges: saleChargeRows.value,
                purchase_charges: purchaseChargeRows.value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(currencyValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
            }else{
                try {
                    const response = await store.dispatch('Sale_Assets/updateSaleAsset', formData);
                    if (response && response.status === 200) {
                        hideLoader();
                        toast.success("Asset updated successfully!");
                        handleReset();
                        store.commit('pageTab/REMOVE_PAGE', {'PSS':'Asset_Details'})
                        store.commit('pageTab/ADD_PAGE', {'PSS':'Sale_Assets'})
                        store.state.pageTab.pssActiveTab = 'Sale_Assets';
                    } else {
                        toast.error('An error occurred while updating the Asset.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Asset: ' + error.message);
                } finally {
                    hideLoader();
                }
            }
        }
        const saveSaleAsset = () =>{
            if(isEditing.value == true){
                updateSaleAsset();
            }else{
                createSaleAsset();
            }
        };

        const selectTab = (index) => {
            activeTab.value = index;
        };
        
        const handleSelectedSaleCharge = async(option) =>{
            await store.dispatch('Asset_Fees/handleSelectedSaleFee', option);
            chargeComponentKey.value += 1;
        }
        const handleSelectedPurchaseCharge = async(option) =>{
            await store.dispatch('Asset_Fees/handleSelectedPurchaseFee', option);
            chargeComponentKey.value += 1;
        }
        const deleteSaleCharge = (rowIndex, action, row) =>{
            store.dispatch('Asset_Fees/removeAssetSaleFee', rowIndex);
            tableKey.value += 1;
        }
        const deletePurchaseCharge = (rowIndex, action, row) =>{
            store.dispatch('Asset_Fees/removeAssetPurchaseFee', rowIndex);
            tableKey.value += 1;
        };
        const handleSelectedPlan = async(option) =>{
            await store.dispatch('Payment_Plans/handleSelectedSalePlan', option);
            planComponentKey.value += 1;
        }
        const deletePlan = (rowIndex, action, row) =>{
            store.dispatch('Payment_Plans/removeSalePlan', rowIndex);
            tableKey.value += 1;
        }
        
        onBeforeMount(()=>{ 
            fetchPlans();
            fetchVendors();
            fetchSalePlans();
            fetchCharges();
            fetchSaleCharges();
            fetchPurchaseCharges();
            updateFormFields();
            updateAdditionalFormFields();
            updateAdditionalFormFields1();
            updateAdditionalFormFields2();
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '20';
            additional_flex_basis.value = '1/5';
            additional_flex_basis_percentage.value = '20';
        })
        onMounted(()=>{
            
        })

        return{
            tabs,componentKey, formFields, additionalFields,additionalFields1,additionalFields2, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, mainComponentKey,handleReset, loader, showLoader, hideLoader,handleSelectedPurchaseCharge,
            displayButtons,saveSaleAsset,saleChargeArr,purchaseChargeArr,chargesDropdownWidth,chargesSearchPlaceholder,selectTab,handleSelectedSaleCharge,
            deleteSaleCharge,deletePurchaseCharge,activeTab,rightsModule,idFieldCharge,saleChargeRows,purchaseChargeRows,chargeColumns,actionCharges,chargeComponentKey,
            planArr,plansSearchPlaceholder,idFieldPlan,planRows,planColumns,actionPlans,planComponentKey,handleSelectedPlan,deletePlan
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