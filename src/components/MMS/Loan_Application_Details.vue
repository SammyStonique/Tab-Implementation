<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <h2><strong>Loan Application Details</strong></h2>
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveLoanApplication" @handleReset="handleReset"> 
                    <template v-slot:additional-content>
                        <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[180px]">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Amortization Details</h1>
                            <div class="tabs pt-2">
                                <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                                    {{ tab }}
                                </button>
                            </div>
                            <div class="tab-content">
                                <div v-show="activeTab == 0" class="text-left">  
                                    <button @click="generateSchedules" class="rounded bg-green-400 cursor-pointer text-sm mr-2 mb-1.5  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Generate Schedules</button>                
                                    <DynamicTable :key="tableKey" :columns="scheduleColumns" :rows="scheduleRows" :idField="idFieldCharge" :showActions="showActions" :showTotals="showTotals"/>
                                </div>
                                <div v-show="activeTab == 1">
                                    <div class="text-left p-2">
                                        <SearchableDropdown 
                                            :key="chargeComponentKey"
                                            :options="chargeArr"
                                            :dropdownWidth="chargesDropdownWidth"
                                            :searchPlaceholder="chargesSearchPlaceholder"
                                            @option-selected="handleSelectedCharge"
                                            @fetchData="fetchData"
                                        />
                                    </div>                      
                                    <DynamicTable :key="table1Key" :columns="chargeColumns" :rows="chargeRows" :idField="idFieldCharge" :actions="actionCharges" @action-click="deleteCharge" :rightsModule="rightsModule" />
                                </div>
                                <div v-show="activeTab == 2">
                                    <div class="text-left p-2">
                                        <SearchableDropdown 
                                            :key="grntComponentKey"
                                            :options="memberArr"
                                            :dropdownWidth="chargesDropdownWidth"
                                            :searchPlaceholder="grntSearchPlaceholder"
                                            @option-selected="handleSelectedGuarantor"
                                            @fetchData="fetchData"
                                        />
                                    </div>                      
                                    <DynamicTable :key="table2Key" :columns="guarantorColumns" :rows="guarantorRows" :idField="idFieldCharge" :actions="actionGuarantors" @action-click="deleteGuarantor" :rightsModule="rightsModule" />
                                </div>
                                <div v-show="activeTab == 3">
                                    <div class="text-left p-2">
                                        <SearchableDropdown 
                                            :key="secComponentKey"
                                            :options="securityArr"
                                            :dropdownWidth="chargesDropdownWidth"
                                            :searchPlaceholder="secSearchPlaceholder"
                                            @option-selected="handleSelectedSecurity"
                                            @fetchData="fetchData"
                                        />
                                    </div>                      
                                    <DynamicTable :key="table3Key" :columns="securityColumns" :rows="securityRows" :idField="idFieldCharge" :actions="actionSecurities" @action-click="deleteSecurity" :rightsModule="rightsModule" />
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
    name: 'Loan_Application_Details',
    components:{
         DynamicForm,PageStyleComponent,SearchableDropdown,DynamicTable
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const tabs = ref(['Amortization Schedule','Loan Charges','Guarantors','Security']);
        const mainComponentKey = ref(0);
        const intComponentKey = ref(0);
        const catComponentKey = ref(0);
        const chargeComponentKey = ref(0);
        const grntComponentKey = ref(0);
        const secComponentKey = ref(0);
        const activeTab = ref(0);
        const rightsModule = ref('MMS');
        const displayButtons = ref(true);
        const componentKey = ref(0);
        const tableKey = ref(0);
        const table1Key = ref(0);
        const table2Key = ref(0);
        const table3Key = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const isEditing = computed(()=> store.state.Loan_Applications.isEditing);
        const selectedApplication = computed(()=> store.state.Loan_Applications.selectedApplication);
        const selectedMember = computed(()=> store.state.Loan_Applications.selectedMember);
        const selectedProduct = computed(()=> store.state.Loan_Applications.selectedProduct);
        const loanGuarantors = computed(()=> store.state.Loan_Applications.loanGuarantors);
        const loanSchedules = computed(()=> store.state.Loan_Applications.loanSchedules);
        const loanCharges = computed(()=> store.state.Loan_Applications.loanCharges);
        const loanSecurities = computed(()=> store.state.Loan_Applications.loanSecurities);
        const memberArray = computed(() => store.state.Members.memberArr);
        const productArray = computed(() => store.state.Loan_Products.productArr);
        const productMaxAmount = computed(() => store.state.Loan_Products.productMaxAmount);
        const computedMaxAmnt = computed(() => productMaxAmount);
        const chargeArr = computed(() => store.state.Loan_Products.chargeArr);
        const memberArr = computed(() => store.state.Loan_Guarantors.memberArr);
        const securityArr = computed(() => store.state.Security_Types.securityArr);
        const chargesDropdownWidth = ref('400px');
        const chargesSearchPlaceholder = ref('Select Charge...');
        const grntSearchPlaceholder = ref('Select Guarantor...');
        const secSearchPlaceholder = ref('Select Security...');
        const memberID = ref('');
        const installments = computed(() => store.state.Loan_Products.installments);
        const computedInstlmnts = computed(() => installments);
        const productID = ref('');
        const showActions = ref(false);
        const showTotals = ref(true);
        const scheduleColumns = ref([
            {label: "Instlmnt", key:"installment", type: "text", editable: false},
            {label: "Due Date", key:"due_date", type: "text", editable: false},
            {label: "Loan Balance", key:"formatted_loan_balance", type: "text", editable: false},
            {label: "Instl Principal", key:"formatted_principal_amount", type: "number", editable: false},
            {label: "Instl Interest", key:"formatted_interest_amount", type: "number", editable: false},
            {label: "Schedule Payment", key:"formatted_schedule_repayment", type: "number", editable: false},
        ]);
        const scheduleRows = computed(() => {
            return store.state.Loan_Applications.loanSchedules;
        });
        const chargeColumns = ref([
            {label: "Name", key:"fee_name", type: "text", editable: false},
            {label: "Charge Time", key:"charge_time", type: "text", editable: false},
            {label: "Charge Mode", key:"charge_mode", type: "text", editable: false},
            {label: "Charge Type", key:"charge_type", type: "text", editable: false},
            {label: "Value", key: "default_amount", type: "number", editable: true},
        ]);
        const chargeRows = computed(() => {
            return store.state.Loan_Products.loanCharges;
        });
        const idFieldCharge = 'loan_fee_id';
        const actionCharges = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Charge', rightName: 'Adding Loan Applications'},
        ])
        const guarantorColumns = ref([
            {label: "Name", key:"member_name", type: "text", editable: false},
            {label: "Phone No", key:"phone_number", type: "text", editable: false},
            {label: "Savings", key:"total_savings", type: "text", editable: false},
            {label: "Shares", key:"total_shares", type: "text", editable: false},
            {label: "Amount", key: "amount", type: "number", editable: true},
        ]);
        const guarantorRows = computed(() => {
            return store.state.Loan_Guarantors.memberArray;
        });
        const actionGuarantors = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Guarantor', rightName: 'Adding Loan Applications'},
        ])
        const securityColumns = ref([
            {label: "Type", key:"security_name", type: "text", editable: false},
            {label: "Security Name", key:"name", type: "text", editable: true},
            {label: "Reg/ID No", key:"registration_number", type: "text", editable: true},
            {label: "Phone No", key:"phone_number", type: "text", editable: true},
            {label: "Value", key:"security_value", type: "text", editable: true},
            {label: "Security Description", key:"description", type: "text", editable: true},
        ]);
        const securityRows = computed(() => {
            return store.state.Security_Types.securityArray;
        });
        const actionSecurities = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Security', rightName: 'Adding Loan Applications'},
        ])

        const handleSelectedMember = async(option) =>{
            await store.dispatch('Members/handleSelectedMember', option)
            memberID.value = store.state.Members.memberID;
            if(selectedApplication.value){
                selectedApplication.value.member.member_id = memberID.value;
                memberValue.value = memberID.value
            }
        };
        const clearSelectedMember = async() =>{
            await store.dispatch('Members/updateState', {memberID: ''});
            memberID.value = store.state.Members.memberID;
        };
        const handleSelectedProduct = async(option) =>{
            await store.dispatch('Loan_Products/handleSelectedProduct', option)
            productID.value = store.state.Loan_Products.productID;
            
            let formData = {
                company: companyID.value,
                loan_product: productID.value
            }
            await store.dispatch('Loan_Products/fetchLoanProductCharges', formData);
            if(selectedApplication.value){
                selectedApplication.value.loan_product.loan_product_id = productID.value;
                productValue.value = productID.value
            }
        };
        const clearSelectedProduct = async() =>{
            await store.dispatch('Loan_Products/updateState', {productID: ''});
            productID.value = store.state.Loan_Products.productID;
        };
        const fetchCharges = async() =>{
            await store.dispatch('Loan_Products/fetchLoansCharges', {company:companyID.value})
        };
        const fetchGuarantors = async() =>{
            await store.dispatch('Loan_Guarantors/fetchMembers', {company:companyID.value})
        };
        const fetchSecurities = async() =>{
            await store.dispatch('Security_Types/fetchSecurityTypes', {company:companyID.value})
        };

        const checkMemberEligiility = (value) =>{
            if(productValue.value == '' || memberValue.value == ''){
                toast.error("Please Select a Member or Loan Product")
                formFields.value[2].value = 0;
            }

            if(parseFloat(value) > productMaxAmount.value){
                toast.error(`The Max Amount for the Product is ${productMaxAmount.value}`) 
                formFields.value[2].value = 0;
            }
        }

        const formFields = ref();
        const productValue = computed(() => {
           return (selectedApplication.value && selectedApplication.value.loan_product && !productID.value) ? selectedApplication.value.loan_product.loan_product_id : productID.value;

        });
        const memberValue = computed(() => {
            return (selectedApplication.value && selectedApplication.value.member && !memberID.value) ? selectedApplication.value.member.member_id : memberID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Member", value: memberValue.value, componentKey: catComponentKey,
                    selectOptions: memberArray, optionSelected: handleSelectedMember, required: true,
                    searchPlaceholder: 'Select Member...', dropdownWidth: '400px', updateValue: selectedMember.value,
                    fetchData: store.dispatch('Members/fetchMembers', {company:companyID.value}), clearSearch: clearSelectedMember
                },
                {  
                    type:'search-dropdown', label:"Loan Product", value: productValue.value, componentKey: catComponentKey,
                    selectOptions: productArray, optionSelected: handleSelectedProduct, required: true,
                    searchPlaceholder: 'Select Loan Product...', dropdownWidth: '400px', updateValue: selectedProduct.value,
                    fetchData: store.dispatch('Loan_Products/fetchLoanProducts', {company:companyID.value}), clearSearch: clearSelectedProduct
                },
                { type: 'text', name: 'applied_amount',label: "Applied Amount", value: selectedApplication.value?.applied_amount || '0', required: true , method: checkMemberEligiility},
                { type: 'date', name: 'application_date',label: "Application Date", value: selectedApplication.value?.application_date || '', required: true, placeholder: '' },
                { type: 'date', name: 'repayment_start_date',label: "Repayment Start Date", value: selectedApplication.value?.repayment_start_date || '', required: true, placeholder: '' },
                { type: 'text', name: 'loan_due_date',label: "Due Day", value: selectedApplication.value?.loan_due_date || '1', required: true },
                { type: 'text', name: 'installments',label: "Installments", value: installments.value, required: false },
                { type: 'text-area', name: 'loan_remarks',label: "Remarks", value: selectedApplication.value?.loan_remarks || '', required: false,textarea_rows: '2', textarea_cols: '56'},
                {required: false}
            ];
        };

        const additionalFields = ref();
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                ];
        };

        watch([productID, memberID], () => {
            if (productID.value != "") {
                formFields.value[1].value = productID.value;
                formFields.value[6].value = installments.value;
            }
            if(memberID.value != ""){
                formFields.value[0].value = memberID.value;
            }
        }, { immediate: true });

        watch([selectedApplication, selectedProduct, selectedMember, loanCharges, loanGuarantors, loanSchedules, loanSecurities], () => {
            if(loanCharges.value){
                store.dispatch('Loan_Products/updateState',{loanCharges: loanCharges.value})
                table1Key.value += 1;
            }
            if(loanGuarantors.value){
                store.dispatch('Loan_Guarantors/updateState',{memberArray: loanGuarantors.value})
                table2Key.value += 1;
            }
            if(loanSecurities.value){
                store.dispatch('Security_Types/updateState',{securityArray: loanSecurities.value})
                table3Key.value += 1; 
            }
            if(selectedApplication.value && loanSchedules.value){
                store.dispatch('Loan_Products/updateState',{installments: loanSchedules.value.length})
            }
            if (selectedApplication.value && selectedProduct.value && selectedMember.value) {
                catComponentKey.value += 1;
                intComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
        
            }else if(selectedApplication.value){
                updateFormFields();
                updateAdditionalFormFields();
            }
        }, { immediate: true });

        const handleReset = async() =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].label == 'Applied Amount'){
                    formFields.value[i].value = '0';
                }
                if(formFields.value[i].label == 'Due Day'){
                    formFields.value[i].value = '1';
                }
                if(formFields.value[i].label != 'Installments'){
                    formFields.value[i].value = '';
                }
            }
            await store.dispatch('Loan_Products/updateState', {loanCharges: [], productMaxAmount: 0, installments:0});
            await store.dispatch('Loan_Applications/updateState', {selectedApplication: null,selectedMember: null,selectedProduct: null, loanCharges: [], loanGuarantors: [], loanSecurities: [], loanSchedules: [], isEditing:false});
            mainComponentKey.value += 1;
            intComponentKey.value += 1;
            catComponentKey.value += 1;
            memberID.value = "";
            productID.value = "";

        }
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const generateSchedules = async() =>{
            showLoader();
            let formData = {
                loan_product: productID.value,
                due_day: formFields.value[5].value || '1',
                application_date: formFields.value[3].value,
                repayment_start_date: formFields.value[4].value,
                applied_amount: formFields.value[2].value,
                installments: formFields.value[6].value,
                company: companyID.value
            }
            let formData1 = {
                company: companyID.value,
                loan_product: productID.value
            }
            await store.dispatch('Loan_Products/fetchLoanProductCharges', formData1);
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(memberValue.value == '' || productValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();
            }else if(parseFloat(formFields.value[2].value) <= 0){
                toast.error('Invalid Amount');
                hideLoader();
            }
            else{
                try {
                    const response = await store.dispatch('Loan_Applications/generateArmotizationSchedules', formData);
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to generate schedules: ' + error.message);
                } finally {
                    hideLoader();
                }
            }

        }
        const createLoanApplication = async() =>{
            showLoader();
            let formData = {
                loan_number: "-",
                loan_due_date: formFields.value[5].value || '1',
                application_date: formFields.value[3].value,
                repayment_start_date: formFields.value[4].value,
                installments: formFields.value[6].value,
                member: memberID.value,
                member_id: memberID.value,
                loan_remarks: formFields.value[7].value,
                applied_amount: formFields.value[2].value,
                loan_product: productID.value,
                loan_product_id: productID.value,
                charges: chargeRows.value,
                guarantors: guarantorRows.value,
                securities: securityRows.value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(memberValue.value == '' || productValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();
            }else{
                try {
                    const response = await store.dispatch('Loan_Applications/createLoanApplication', formData);
                    if(response && response.status === 201) {
                        hideLoader();
                        toast.success('Application created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Application.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Application: ' + error.message);
                } finally {
                    hideLoader();
                }
            }

        }
        const updateLoanApplication = async() =>{
            showLoader();
            errors.value = [];
            let formData = {
                loan_application: selectedApplication.value.loan_application_id,
                loan_number: selectedApplication.value.loan_number,
                loan_due_date: formFields.value[5].value || '1',
                application_date: formFields.value[3].value,
                repayment_start_date: formFields.value[4].value,
                installments: formFields.value[6].value,
                member: memberValue.value,
                member_id: memberValue.value,
                loan_remarks: formFields.value[7].value,
                applied_amount: formFields.value[2].value,
                loan_product: productValue.value,
                loan_product_id: productValue.value,
                company: companyID.value,
                guarantors: guarantorRows.value,
                securities: securityRows.value,
                charges: chargeRows.value,
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(memberValue.value == ''|| productValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
            }else{
                try {
                    const response = await store.dispatch('Loan_Applications/updateLoanApplication', formData);
                    if (response && response.status === 200) {
                        hideLoader();
                        toast.success("Application updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Application.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Application: ' + error.message);
                } finally {
                    hideLoader();
                }
            }
        }
        const saveLoanApplication = () =>{
            if(isEditing.value == true){
                updateLoanApplication();
            }else{
                createLoanApplication();
            }
        };

        const selectTab = (index) => {
            activeTab.value = index;
        };
        
        const handleSelectedCharge = async(option) =>{
            await store.dispatch('Loan_Products/handleSelectedCharge', option);
            chargeComponentKey.value += 1;
        }
        const deleteCharge = (rowIndex, action, row) =>{
            store.dispatch('Loan_Products/removeLoanCharge', rowIndex);
            table1Key.value += 1;
        };
        const handleSelectedGuarantor = async(option) =>{
            await store.dispatch('Loan_Guarantors/handleSelectedMemberGuarantor', option);
            grntComponentKey.value += 1;
        }
        const deleteGuarantor = (rowIndex, action, row) =>{
            store.dispatch('Loan_Guarantors/removeMemberGuarantor', rowIndex);
            table2Key.value += 1;
        }
        const handleSelectedSecurity = async(option) =>{
            await store.dispatch('Security_Types/handleSelectedSecurity', option);
            secComponentKey.value += 1;
        }
        const deleteSecurity = (rowIndex, action, row) =>{
            store.dispatch('Security_Types/removeSecurityType', rowIndex);
            table3Key.value += 1;
        }
        
        onBeforeMount(()=>{ 
            fetchCharges();
            fetchGuarantors();
            fetchSecurities();
            updateFormFields();
            updateAdditionalFormFields();
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '20';
            additional_flex_basis.value = '1/3';
            additional_flex_basis_percentage.value = '33.333';
        })
        onMounted(()=>{
            
        })

        return{
            tabs,componentKey, formFields, additionalFields, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, mainComponentKey,handleReset, loader, showLoader, hideLoader,
            displayButtons,saveLoanApplication,chargeArr,chargesDropdownWidth,chargesSearchPlaceholder,selectTab,handleSelectedCharge,
            deleteCharge,activeTab,rightsModule,idFieldCharge,chargeRows,chargeColumns,actionCharges,chargeComponentKey,
            scheduleColumns,scheduleRows,generateSchedules,showActions,showTotals,tableKey,table1Key,table2Key,table2Key,
            memberArr,grntComponentKey,grntSearchPlaceholder,actionGuarantors,handleSelectedGuarantor,deleteGuarantor,guarantorColumns,guarantorRows,
            securityArr,secComponentKey,secSearchPlaceholder,actionSecurities,handleSelectedSecurity,deleteSecurity,securityColumns,securityRows,
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