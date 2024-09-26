<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[450px]">
                <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Tenant Details</h1>
                <div class="tabs pt-2">
                    <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                        {{ tab }}
                    </button>
                </div>
                <div class="tab-content mt-3">
                    <div v-if="activeTab == 0">
                        <div class="flex">
                            <div class="basis-1/2 border-left border-gray-400">
                                <h1 class="font-bold mb-10">Tenant BioData</h1>
                                <table class="w-full">
                                    <tr class="text-left">
                                        <td class="font-bold ">Tenant Code:</td>
                                        <td> {{ tenantDetails.tenant_code }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold">Tenant Name:</td>
                                        <td>{{ tenantDetails.tenant_name }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">ID Number:</td>
                                        <td>{{ tenantDetails.id_number }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Phone Number:</td>
                                        <td>{{ tenantDetails.phone_number }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Email:</td>
                                        <td>{{ tenantDetails.email }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Tax Pin:</td>
                                        <td>{{ tenantDetails.kra_pin }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Address:</td>
                                        <td>{{ tenantDetails.address }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Country:</td>
                                        <td>{{ tenantDetails.country }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Contact Name:</td>
                                        <td>{{ tenantDetails.contact_names }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Contact Phone No:</td>
                                        <td>{{ tenantDetails.contact_phone_number }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Contact Email:</td>
                                        <td>{{ tenantDetails.contact_email }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Contact Rltshp:</td>
                                        <td>{{ tenantDetails.contact_relationship }}</td>
                                    </tr>
                                </table>
                            </div>
                            <div class="basis-1/2">
                                <h1 class="font-bold mb-10">Lease Details</h1>
                                <table class="w-full">
                                    <tr class="text-left">
                                        <td class="font-bold">Property:</td>
                                        <td>{{ tenantProperty.name }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold">Occupied Unit(s):</td>
                                        <td>{{ property_units }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Agreement Date:</td>
                                        <td> {{ tenantLease.lease_date }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Lease Type:</td>
                                        <td>{{ tenantLease.lease_type }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Lease Start Date:</td>
                                        <td>{{ tenantLease.lease_start_date }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Lease End Date:</td>
                                        <td>{{ tenantLease.lease_end_date }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Lease Term Type:</td>
                                        <td>{{ tenantLease.lease_term_type }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Billing Frequency:</td>
                                        <td>{{ tenantLease.billing_frequency }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Rent Amount:</td>
                                        <td>{{ Number(tenantLease.rent_amount).toLocaleString() }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Billing Amount:</td>
                                        <td>{{ Number(tenantLease.billing_amount).toLocaleString() }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Lease Mode:</td>
                                        <td>{{ tenantLease.lease_mode }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Lease Currency:</td>
                                        <td>{{ tenantCurrency.code }} - {{ tenantCurrency.name }}</td>
                                    </tr>
                                    
                                </table>
                            </div>
                        </div>
                    </div>
                    <div v-if="activeTab == 1">
                        <DynamicTable :key="statementTableKey" :rightsModule="rightsModule" :columns="statementColumns" :rows="statementRows" :idField="idFieldStatement" :showActions="showActions" :actions="actionsStatement"/>
                    </div>          
                    <div v-if="activeTab == 2"> 
                        <div class="flex mb-1.5">
                            <button @click="addNewDeposit" :class="{ 'disabled': isDisabled('Adding Tenant Deposit') }" class="rounded bg-green-400 text-sm  text-white px-2 py-1.5"><i class="fa fa-plus" aria-hidden="true"></i>New Deposit</button>
                        </div>                    
                        <DynamicTable :key="tableKey" :rightsModule="rightsModule" :columns="depositColumns" :rows="computedDepositRows" :idField="idFieldDeposit" :actions="actionsDeposit" @action-click="depositActionClick" />
                        <MovableModal v-model:visible="depModalVisible" :title="depositTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
                            :loader="dep_modal_loader" @showLoader="showDepModalLoader" @hideLoader="hideDepModalLoader" @closeModal="closeDepModal"
                        >
                            <DynamicForm 
                                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                                :displayButtons="displayButtons" @handleSubmit="createTenantDeposit" @handleReset="handleDepReset"
                            />
                        </MovableModal>
                    </div>
                    <div v-show="activeTab == 3"> 
                        <div class="flex mb-1.5">
                            <button @click="addNewUtility" :class="{ 'disabled': isDisabled('Adding Tenant Utility') }" class="rounded bg-green-400 text-sm  text-white px-2 py-1.5"><i class="fa fa-plus" aria-hidden="true"></i>New Utility</button>
                        </div>                   
                        <DynamicTable :key="utilityTableKey" :rightsModule="rightsModule" :columns="utilityColumns" :rows="computedUtilityRows" :idField="idFieldUtility" :actions="actionsUtility" @action-click="utilityActionClick" />
                        <MovableModal v-model:visible="utilModalVisible" :title="utilityTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
                            :loader="util_modal_loader" @showLoader="showUtilModalLoader" @hideLoader="hideUtilModalLoader" @closeModal="closeUtilModal"
                        >
                            <DynamicForm 
                                :fields="additionalFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                                :displayButtons="displayButtons" @handleSubmit="createTenantUtility" @handleReset="handleUtilReset"
                            />
                        </MovableModal>
                        <MovableModal v-model:visible="voidModalVisible" :title="voidTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="void_modal_width"
                            :loader="void_modal_loader" @showLoader="showVoidModalLoader" @hideLoader="hideVoidModalLoader" @closeModal="closeVoidModal"
                        >
                            <div class="p-4 mb-3">
                                <label for="">Date:<em class="text-red-600">*</em></label><br />
                                <input v-model="void_date" type="date" class="`bg-slate-50 w-56 rounded pl-3 border border-gray-400 text-base w-full`"/>
                            </div>
                            <button @click="voidUtility" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Void</button>
                        </MovableModal>
                    </div>
                    <div v-show="activeTab == 4">                   
                        <DynamicTable :key="scheduleTableKey" :rightsModule="rightsModule" :columns="scheduleColumns" :rows="scheduleRows" :idField="idFieldSchedule" :actions="actionsSchedule" @action-click="scheduleActionClick" />
                    </div>  
                    <div v-show="activeTab == 5">                   
                        <DynamicTable :key="variationTableKey" :rightsModule="rightsModule" :columns="variationColumns" :rows="variationRows" :idField="idFieldVariation" :actions="actionsVariation" @action-click="variationActionClick" />
                    </div>    
                </div>
            </div>
        </template>
    </PageStyleComponent>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch, reactive } from 'vue';
import PageStyleComponent from '../PageStyleComponent.vue';
import DynamicTable from '@/components/DynamicTable.vue';
import DynamicForm from '../NewDynamicForm.vue';
import MovableModal from '@/components/MovableModal.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import axios from 'axios';

export default defineComponent({
    name: 'Tenant_Statement',
    components:{
        PageStyleComponent, DynamicTable, MovableModal, DynamicForm
    },
    setup(props,{emit}){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const errors = ref([]);
        const dep_modal_loader = ref('none');
        const util_modal_loader = ref('none');
        const void_modal_loader = ref('none');
        const rightsModule = ref('PMS');
        const allowedRights = ref([]);
        const voidModalVisible = ref(false);
        const depModalVisible = ref(false);
        const depositID = ref('');
        const utilModalVisible = ref(false);
        const utilityID = ref('');
        const taxID = ref(null);
        const displayButtons = ref(true);
        const depositTitle = ref('Security Deposit Details');
        const utilityTitle = ref('Utility Details');
        const voidTitle = ref('Void Utility');
        const utilityFormData = ref(null);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const void_modal_width = ref('45vw');
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const depositArray = computed(() => store.state.Security_Deposits.depositArr);
        const utilityArray = computed(() => store.state.Utilities.utilityArr);
        const taxArray = computed(() => store.state.Taxes.taxArr);
        const tabs = ref(['Tenant Details','Tenant Statement','Tenant Deposits','Tenant Utilities','Rent Schedules','Rent Variation']);
        const activeTab = ref(0);
        const mainComponentKey = ref(0);
        const depComponentKey = ref(0);
        const utilComponentKey = ref(0);
        const void_date = ref('');
        const taxComponentKey = ref(0);
        const tableKey = ref(0);
        const utilityTableKey = ref(0);
        const scheduleTableKey = ref(0);
        const statementTableKey = ref(0);
        const variationTableKey = ref(0);
        const idFieldDeposit = ref('deposit_id');
        const idFieldUtility = ref('utility_id');
        const idFieldSchedule = ref('rent_schedule_id');
        const idFieldVariation = ref('variation_id');
        const idFieldStatement = ref('');
        const computedDepositRows = computed(()=> store.state.Security_Deposits.tenantDeposits);
        const computedUtilityRows = computed(()=> store.state.Utilities.tenantUtilities);
        const scheduleRows = computed(()=> store.state.Active_Tenants.rentSchedules);
        const statementRows = computed(()=> store.state.Journals.jnlArray);
        const variationRows = computed(()=> store.state.Active_Tenants.tenantVariations);
        const tenantLease = computed(()=> store.state.Active_Tenants.tenantLease);
        const tenantDetails = computed(()=> store.state.Active_Tenants.tenantDetails);
        const tenantCurrency = computed(()=> store.state.Active_Tenants.tenantCurrency);
        const tenantProperty = computed(()=> store.state.Active_Tenants.tenantProperty);
        const depositColumns = ref([
            {type: "checkbox"},
            {label: "Deposit Name", key:"security_deposit.name", type: "text", editable: false},
            {label: "Charge Mode", key:"deposit_charge_mode", type: "text", editable: false},
            {label: "Def. Value", key: "deposit_value", type: "text", editable: false},
            {label: "Amount", key: "deposit_amount", type: "text", editable: false},
            {label: "Posted", key: "posted", type: "text", editable: false},
        ]);

        const actionsDeposit = ref([
            {name: 'book-invoice', icon: 'fa fa-spinner', title: 'Book Deposit', rightName: 'Booking Tenant Deposit'},
            {name: 'unbook-invoice', icon: 'fa fa-minus-circle', title: 'Cancel Booking', rightName: 'Booking Tenant Deposit'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Deposit', rightName: 'Deleting Tenant Deposit'},
        ]);

        const utilityColumns = ref([
            {type: "checkbox"},
            {label: "Utility Name", key:"utility.name", type: "text", editable: false},
            {label: "Charge Mode", key:"utility_charge_mode", type: "text", editable: false},
            {label: "Def. Value", key: "utility_value", type: "text", editable: false},
            {label: "Utility Vat", key: "deposit_value", type: "text", editable: false},
            {label: "Amount", key: "utility_amount", type: "text", editable: false},
            {label: "Status", key: "status", type: "text", editable: false},
            {label: "From", key: "from_date", type: "text", editable: false},
            {label: "To", key: "to_date", type: "text", editable: false},
        ])

        const actionsUtility = ref([
            {name: 'void-utility', icon: 'fa fa-minus-circle', title: 'Void Utility', rightName: 'Voiding Tenant Utility'},
            {name: 'reactivate-utility', icon: 'fa fa-redo', title: 'Reactivate Utility', rightName: 'Voiding Tenant Utility'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Utility', rightName: 'Deleting Tenant Utility'},
        ]);

        const scheduleColumns = ref([
            {type: "checkbox"},
            {label: "From", key:"from_date", type: "text", editable: false},
            {label: "To", key:"to_date", type: "text", editable: false},
            {label: "Description", key: "description", type: "text", editable: false},
            {label: "Rent", key: "rent_amount", type: "text", editable: false},
            {label: "Rent Vat", key: "rent_vat_amount", type: "text", editable: false},
            {label: "Utility", key: "utility_amount", type: "text", editable: false},
            {label: "Util Vat", key: "utility_vat_amount", type: "text", editable: false},
            {label: "Total", key: "total_amount", type: "text", editable: false},
            {label: "Booked", key: "booked", type: "text", editable: false},
            {label: "Posted", key: "posted", type: "text", editable: false},
            {label: "Invoice", key: "invoice.journal_no", type: "text", editable: false},
        ])
        const showActions = ref(false);

        const actionsSchedule = ref([
            {name: 'book-invoice', icon: 'fa fa-spinner', title: 'Book Rent', rightName: 'Book Rental Invoice'},
            {name: 'unbook-invoice', icon: 'fa fa-minus-circle', title: 'Cancel Booking', rightName: 'Cancel Invoice Booking'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Schedule', rightName: 'Deleting Rent Schedules'},
        ]);

        const statementColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date", type: "text", editable: false},
            {label: "Ref No", key:"reference_no", type: "text", editable: false},
            {label: "Txn No", key: "journal_no", type: "text", editable: false},
            {label: "Narration", key: "description", type: "text", editable: false, maxWidth:"700px"},
            {label: "Charges", key: "debit_amount", type: "text", editable: false},
            {label: "Payments", key: "credit_amount", type: "text", editable: false},
            {label: "Balance", key: "running_balance", type: "text", editable: false},
        ]);

        const actionsStatement = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Transaction'},
        ]);

        const variationColumns = ref([
            {type: "checkbox"},
            {label: "Variation Type", key: "variation_type", type: "text", editable: false},
            {label: "Variation Mode", key:"variation_mode", type: "text", editable: false},
            {label: "Variation Value", key: "variation_value", type: "text", editable: false},
        ]);

        const actionsVariation = ref([
            {name: 'reset-schedules', icon: 'fa fa-refresh', title: 'Reset Schedules', rightName: 'Reset Rent Schedules'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Variation', rightName: 'Deleting Rent Variation'},
        ]);

        const selectTab = async(index) => {
            showLoader();
            let formData = {
                company: companyID.value,
                tenant: tenantDetails.value.tenant_id
            }
            let formData1 = {
                company: companyID.value,
                client: tenantDetails.value.tenant_id
            }
            if(index == 1){
                activeTab.value = index;
                await store.dispatch('Journals/fetchClientJournals',formData1)
                .then(()=>{
                    hideLoader();
                })
            }else if( index == 2){
                activeTab.value = index;
                await store.dispatch('Security_Deposits/fetchTenantDeposits',formData)
                .then(()=>{
                    hideLoader();
                })
            }
            else if( index == 3){
                activeTab.value = index;
                await store.dispatch('Utilities/fetchTenantUtilities',formData)
                .then(()=>{
                    hideLoader();
                })
            }
            else if( index == 4){
                activeTab.value = index;
                await store.dispatch('Active_Tenants/fetchRentSchedules',formData)
                .then(()=>{
                    hideLoader();
                })

            }
            else if( index == 5){
                activeTab.value = index;
                await store.dispatch('Active_Tenants/fetchTenantVariations',formData)
                .then(()=>{
                    hideLoader();
                })
            }else{
                activeTab.value = index;
                hideLoader();
            }

        };

        const showLoader = () =>{
            loader.value = "block";
        };
        const hideLoader = () =>{
            loader.value = "none";
        };

        const depositActionClick = async(rowIndex, action, row) =>{
            if( action == 'book-invoice'){
                if (row['posted'] == 'No'){
                    const depositID = [row['tenant_deposit_id']];
                    let formData = {
                        company: companyID.value,
                        tenant_deposit: depositID
                    }
                    try{
                        const response = await store.dispatch('Active_Tenants/bookDepositInvoice',formData)
                        if(response && response.status == 200){
                            mainComponentKey.value += 1;
                        }
                    }                  
                    catch{

                    }
                }else{
                    toast.error("Security Deposit Already Booked")
                }             
            }else if( action == 'unbook-invoice'){
                if (row['posted'] == 'Yes'){
                    const depositID = [row['tenant_deposit_id']];
                    let formData = {
                        company: companyID.value,
                        tenant_deposit: depositID
                    }
                    try{
                        const response = await store.dispatch('Active_Tenants/cancelDepositBooking',formData)
                        if(response && response.status == 200){
                            mainComponentKey.value += 1;
                        }
                    }                  
                    catch{

                    }
                }else{
                    toast.error("Security Deposit Not Booked")
                }             
            }
            else if(action == 'delete'){
                const depositID = [row['tenant_deposit_id']];
                let formData = {
                    company: companyID.value,
                    tenant_deposit: depositID
                }
                if(row['posted'] == 'Yes'){
                    toast.error("Cannot Remove Posted Deposit")
                }else{
                    await store.dispatch('Active_Tenants/deleteTenantDeposit',formData)
                }
                
            }
        }

        const utilityActionClick = async(rowIndex, action, row) =>{
            if( action == 'void-utility'){
                if (row['status'] == 'Active'){
                    voidModalVisible.value = true;
                    const utilityID = row['tenant_utility_id'];
                    utilityFormData.value = {
                        company: companyID.value,
                        tenant_utility: utilityID,
                        utility: row['utility']['utility_id'],
                        utility_id: row['utility']['utility_id'],
                        utility_charge_mode: row['utility_charge_mode'],
                        utility_value: row['utility_value'],
                        utility_vat: row['utility_vat']?['tax_id'] : null,
                        tenant: row['tenant']['tenant_lease_id'],
                        tenant_id: row['tenant']['tenant_lease_id'],
                        status: 'Inactive',
                        from_date: row['from_date'],
                    }
                }else{
                    toast.error("Utility Already Voided")
                }             
            }else if( action == 'reactivate-utility'){
                if (row['status'] == 'Inactive'){
                    const utilityID = row['tenant_utility_id'];
                    let formData = {
                        company: companyID.value,
                        tenant_utility: utilityID,
                        utility: row['utility']['utility_id'],
                        utility_id: row['utility']['utility_id'],
                        utility_charge_mode: row['utility_charge_mode'],
                        utility_value: row['utility_value'],
                        utility_vat: row['utility_vat']?['tax_id'] : null,
                        tenant: row['tenant']['tenant_lease_id'],
                        tenant_id: row['tenant']['tenant_lease_id'],
                        status: 'Active',
                        from_date: row['from_date'],
                        to_date: row['tenant']['lease_end_date']
                    }
                    await store.dispatch('Active_Tenants/activateTenantUtility',formData)
                }else{
                    toast.error("Utility Already Active")
                }
            }
            else if(action == 'delete'){
                const tenant_utility = [row['tenant_utility_id']];
                let formData = {
                    company: companyID.value,
                    tenant_utility: tenant_utility
                }
                await store.dispatch('Active_Tenants/deleteTenantUtility',formData)
            }
        }

        const voidUtility = async() =>{
            showVoidModalLoader();
            if(void_date.value != ''){
                utilityFormData.value['to_date'] = void_date.value;
                try{
                    const response = await store.dispatch('Active_Tenants/voidTenantUtility',utilityFormData.value)
                    if(response && response.status == 200){
                        toast.success("Utility Voided Succesfully")
                        mainComponentKey.value += 1;
                        closeVoidModal();
                    }
                }catch (error) {
                    console.error(error.message);
                    toast.error('Failed to void utility: ' + error.message);
                }finally{
                    hideUtilModalLoader();
                }
            }else{
                hideUtilModalLoader();
                toast.error("Invalid Date");
            }
            
        }

        const scheduleActionClick = async(rowIndex, action, row) =>{
            if( action == 'book-invoice'){
                if (row['posted'] == 'No'){
                    const scheduleID = [row['rent_schedule_id']];
                    let formData = {
                        company: companyID.value,
                        rent_schedule: scheduleID
                    }
                    try{
                        const response = await store.dispatch('Active_Tenants/bookRentInvoice',formData)
                        if(response && response.status == 200){
                            mainComponentKey.value += 1;
                        }
                    }                  
                    catch{

                    }
                }else{
                    toast.error("Rent Already Booked")
                }             
            }else if( action == 'unbook-invoice'){
                if (row['posted'] == 'Yes'){
                    const scheduleID = [row['rent_schedule_id']];
                    let formData = {
                        company: companyID.value,
                        rent_schedule: scheduleID
                    }
                    try{
                        const response = await store.dispatch('Active_Tenants/cancelInvoiceBooking',formData)
                        if(response && response.status == 200){
                            mainComponentKey.value += 1;
                        }
                    }                  
                    catch{

                    }
                }else{
                    toast.error("Rent Not Booked")
                }             
            }
            else if(action == 'delete'){
                const scheduleID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    rent_schedule: scheduleID
                }
                await store.dispatch('Active_Tenants/deleteTenant',formData)
            }
        }
        const variationActionClick = async(rowIndex, action, row) =>{
            if( action === 'reset-schedules'){
                showLoader();
                const variationID = row['variation_id'];
                let formData = {
                    company: companyID.value,
                    variation: variationID
                }
                try{
                    const response = await store.dispatch('Active_Tenants/resetSchedules',formData)
                    if(response && response.status === 200){
                        mainComponentKey.value += 1
                        toast.success("Success")
                    }
                }catch{
                    toast.error("Error Reseting Schedules")
                }finally{
                    hideLoader();
                }
                
            }
            
        };
        const handleSelectedDeposit = async(option) =>{
            await store.dispatch('Security_Deposits/handleSelectedDeposit', option)
            depositID.value = store.state.Security_Deposits.depositID;
        }
        const fetchDeposits = async() =>{
            await store.dispatch('Security_Deposits/fetchDeposits', {company:companyID.value})
        }
        const formFields = ref([
            {  
                type:'search-dropdown', label:"Security Deposit", value: depositID.value, componentKey: depComponentKey,
                selectOptions: depositArray, optionSelected: handleSelectedDeposit, required: true,
                searchPlaceholder: 'Select Security Deposit...', dropdownWidth: '400px', updateValue: '',
                fetchData: fetchDeposits()
            },
            { type: 'date', name: 'date',label: "Date", value: '', required: true },
            { type: 'dropdown', name: 'default_mode',label: "Charge Mode", value: '', placeholder: "", required: true, options: [{ text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'Rent Percentage', value: 'Rent Percentage' }] },
            { type: 'number', name: 'default_value',label: "Default Value", value: 0, required: true },
        ]);

        const handleDepReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            depositID.value = '';
        }
        const showDepModalLoader = () =>{
            dep_modal_loader.value = "block";
        }
        const hideDepModalLoader = () =>{
            dep_modal_loader.value = "none";
        }
        
        const addNewDeposit = () =>{
            store.dispatch("Security_Deposits/updateState",{selectedDeposit:null, isEditing:false})
            depositID.value = "";
            depModalVisible.value = true;
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        };
        const createTenantDeposit = async() =>{
            showDepModalLoader();
            let formData = {
                security_deposit: depositID.value,
                security_deposit_id: depositID.value,
                date: formFields.value[1].value,
                tenant: tenantLease.value.tenant_lease_id,
                tenant_id: tenantLease.value.tenant_lease_id,
                deposit_charge_mode: formFields.value[2].value,
                deposit_value: formFields.value[3].value,
                posted: 'No',
                company: companyID.value
            }

            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(tenantLease.value.tenant['tenant_id'] == '' && depositID.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideDepModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Active_Tenants/createTenantDeposit', formData);
                    if (response && response.status === 200) {
                        hideDepModalLoader();
                        toast.success('Security Deposit added successfully!');
                        handleDepReset();
                        depComponentKey.value += 1;
                        depModalVisible.value = false;
                    } else {
                        toast.error('An error occurred while creating the deposit.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create deposit: ' + error.message);
                } finally {
                    hideDepModalLoader();
                    store.dispatch('Security_Deposits/updateState',{depositID:''})
                }
            }
        }
        const closeDepModal = () =>{
            depModalVisible.value = false;
            depositID.value = '';
            store.dispatch('Security_Deposits/updateState',{depositID:''})
        };
        const handleSelectedUtility = async(option) =>{
            await store.dispatch('Utilities/handleSelectedUtility', option)
            utilityID.value = store.state.Utilities.utilityID;
        }
        const handleSelectedTax = async(option) =>{
            await store.dispatch('Taxes/handleSelectedTax', option)
            taxID.value = store.state.Taxes.taxID;
        }
        const fetchUtilities = async() =>{
            await store.dispatch('Utilities/fetchUtilities', {company:companyID.value})
        }
        const fetchTaxes = async() =>{
            await store.dispatch('Taxes/fetchTaxes', {company:companyID.value})
        }
        const additionalFields = ref([
            {  
                type:'search-dropdown', label:"Utility", value: utilityID.value, componentKey: utilComponentKey,
                selectOptions: utilityArray, optionSelected: handleSelectedUtility, required: true,
                searchPlaceholder: 'Select Utility...', dropdownWidth: '400px', updateValue: "",
                fetchData: fetchUtilities()
            },
            { type: 'dropdown', name: 'default_mode',label: "Charge Mode", value: '', placeholder: "", required: true, options: [{ text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'Rent Percentage', value: 'Rent Percentage' }, { text: 'Billed On Use', value: 'Billed On Use' }] },
            { type: 'number', name: 'default_value',label: "Default Value", value: 0, required: true },
            { type: 'date', name: 'from_date',label: "From Date", value: '', required: true },
            {  
                type:'search-dropdown', label:"Utility Vat", value: '', componentKey: taxComponentKey,
                selectOptions: taxArray, optionSelected: handleSelectedTax, required: false,
                searchPlaceholder: 'Select Vat...', dropdownWidth: '400px', updateValue: "",
                fetchData: fetchTaxes()
            },
        ]);
        const handleUtilReset = () =>{
            for(let i=0; i < additionalFields.value.length; i++){
                additionalFields.value[i].value = '';
            }
            utilityID.value = '';
            taxID.value = null;
        }
        const showUtilModalLoader = () =>{
            util_modal_loader.value = "block";
        }
        const hideUtilModalLoader = () =>{
            util_modal_loader.value = "none";
        }
        const addNewUtility = () =>{
            store.dispatch("Utilities/updateState",{selectedUtility:null, isEditing:false})
            utilityID.value = "";
            utilModalVisible.value = true;
            handleUtilReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        };
        const createTenantUtility = async() =>{
            showUtilModalLoader();
            let formData = {
                utility: utilityID.value,
                utility_id: utilityID.value,
                from_date: additionalFields.value[3].value,
                to_date: tenantLease.value.lease_end_date,
                tenant: tenantLease.value.tenant_lease_id,
                tenant_id: tenantLease.value.tenant_lease_id,
                utility_charge_mode: additionalFields.value[1].value,
                utility_value: additionalFields.value[2].value,
                utility_vat: taxID.value,
                utility_vat_id: taxID.value,
                status: 'Active',
                company: companyID.value
            }

            errors.value = [];
            for(let i=1; i < (additionalFields.value.length -1); i++){
                if(additionalFields.value[i].value =='' && additionalFields.value[i].type != "number" && additionalFields.value[i].required == true){
                    errors.value.push(additionalFields.value[i].label);
                }
            }
            if(tenantLease.value.tenant['tenant_id'] == '' && utilityID.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideUtilModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Active_Tenants/createTenantUtility', formData);
                    if (response && response.status === 200) {
                        hideUtilModalLoader();
                        toast.success('Utility added successfully!');
                        handleUtilReset();
                        utilComponentKey.value += 1;
                        utilModalVisible.value = false;
                    } else {
                        toast.error('An error occurred while creating the utility.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create utility: ' + error.message);
                } finally {
                    hideUtilModalLoader();
                    store.dispatch('Utilities/updateState',{utilityID:''})
                }
            }
        }
        const closeUtilModal = () =>{
            utilModalVisible.value = false;
            utilityID.value = ''
            store.dispatch('Utilities/updateState',{utilityID:''})
        }
        const showVoidModalLoader = () =>{
            void_modal_loader.value = "block";
        }
        const hideVoidModalLoader = () =>{
            void_modal_loader.value = "none";
        }
        const closeVoidModal = () =>{
            voidModalVisible.value = false;
            void_date.value = '';
            utilityFormData.value = null;
        };
        const fetchEnabledRights = () =>{
            allowedRights.value = [];
            let formData = {
                user: userID.value,
                company: companyID.value,
                module: rightsModule.value
            }
            axios
            .post("api/v1/user-permissions-search/",formData)
            .then((response)=>{
                allowedRights.value = response.data.results;
            })
            .catch((error)=>{
                console.log(error.message);
            })
        };
        const isDisabled =(permissionName) =>{
            const permission = allowedRights.value.find(p => p.permission_name === permissionName);
            return permission ? !permission.right_status : true;
        };
        onMounted(()=>{
            fetchEnabledRights();
        })

        return{
            tabs, activeTab, mainComponentKey, depositColumns, utilityColumns, selectTab, loader, showLoader, hideLoader, formFields, additionalFields,
            tableKey,utilityTableKey, idFieldDeposit, idFieldUtility, actionsDeposit, actionsUtility, computedDepositRows, computedUtilityRows,
            scheduleTableKey, idFieldSchedule, scheduleColumns, actionsSchedule, scheduleRows, statementTableKey, idFieldStatement, statementRows,showActions,
            statementColumns, actionsStatement, tenantLease, tenantDetails, tenantCurrency, tenantProperty, scheduleActionClick,
            depositActionClick, variationColumns, variationRows, variationTableKey, idFieldVariation, actionsVariation, variationActionClick,
            addNewDeposit, addNewUtility, dep_modal_loader, util_modal_loader, depModalVisible, utilModalVisible, displayButtons, depositTitle, utilityTitle, 
            modal_top, modal_left, modal_width, showDepModalLoader, hideDepModalLoader, showUtilModalLoader, hideUtilModalLoader, handleDepReset,
            flex_basis, flex_basis_percentage, closeDepModal, closeUtilModal, handleUtilReset, createTenantDeposit, createTenantUtility, utilityActionClick,
            void_date, voidTitle, void_modal_loader, voidModalVisible, void_modal_width, showVoidModalLoader, hideVoidModalLoader, closeVoidModal, voidUtility,
            rightsModule,isDisabled
        }
    }
})
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
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
    padding: 1px;
}

</style>