<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[750px]">
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
                                        <td>{{ tenantLease.unit }}</td>
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
                        <div class="relative w-[100%] bg-white z-50 px-6">
                            <FilterBar 
                                :showAddButton="showAddButton"
                                :filters="searchFilters" 
                                @search="searchTenantTransactions"
                                @reset="resetFilters"
                                @printList="printTenantStatement"
                                @printExcel="printExcel"
                                @printCSV="printCSV"
                            />
                        </div>
                        <div class="table w-[100%] top-[17.1rem] z-30 px-6">
                            <DynamicTable :key="statementTableKey" :rightsModule="rightsModule" :columns="statementColumns" :rows="statementRows" :idField="idFieldStatement" :showActions="showActions" :actions="actionsStatement"/>
                        </div>
                    </div>              
                </div>
            </div>
        </template>
    </PageStyleComponent>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch, reactive } from 'vue';
import PageStyleComponent from '../PageStyleComponent.vue';
import FilterBar from "@/components/FilterBar.vue";
import DynamicTable from '@/components/DynamicTable.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import axios from 'axios';
import PrintJS from 'print-js';

export default defineComponent({
    name: 'Tenant_Statement',
    components:{
        PageStyleComponent, DynamicTable,FilterBar
    },
    setup(props,{emit}){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const showAddButton = ref(false);
        const errors = ref([]);
        const dep_modal_loader = ref('none');
        const util_modal_loader = ref('none');
        const void_modal_loader = ref('none');
        const tnt_modal_loader = ref('none');
        const term_modal_loader = ref('none');
        const review_modal_loader = ref('none');
        const rightsModule = ref('PMS');
        const allowedRights = ref([]);
        const voidModalVisible = ref(false);
        const depModalVisible = ref(false);
        const tntModalVisible = ref(false);
        const reviewModalVisible = ref(false);
        const termModalVisible = ref(false);
        const depositID = ref('');
        const utilModalVisible = ref(false);
        const utilityID = ref('');
        const taxID = ref(null);
        const displayButtons = ref(true);
        const depositTitle = ref('Security Deposit Details');
        const utilityTitle = ref('Utility Details');
        const voidTitle = ref('Void Utility');
        const tntTitle = ref('Tenant Biodata');
        const reviewTitle = ref('Revision Details');
        const termTitle = ref('Termination Details');
        const utilityFormData = ref(null);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const tnt_modal_left = ref('200px');
        const modal_width = ref('30vw');
        const void_modal_width = ref('45vw');
        const tnt_modal_width = ref('70vw');
        const tenantFormFields = ref([]);
        const tenantAdditionalFields = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const depositArray = computed(() => store.state.Security_Deposits.depositArr);
        const utilityArray = computed(() => store.state.Utilities.utilityArr);
        const taxArray = computed(() => store.state.Taxes.taxArr);
        const tabs = ref(['Tenant Details','Tenant Statement']);
        const activeTab = ref(0);
        const mainComponentKey = ref(0);
        const depComponentKey = ref(0);
        const utilComponentKey = ref(0);
        const void_date = ref('');
        const depositHeld = ref(0);
        const computedDepHeld = computed(() => {return depositHeld});
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
        const scheduleRows = computed(()=> store.state.Terminated_Leases.rentSchedules);
        const statementRows = computed(()=> store.state.Journals.jnlArray);
        const variationRows = computed(()=> store.state.Terminated_Leases.tenantVariations);
        const selectedTenant = computed(()=> store.state.Terminated_Leases.selectedTenant);
        const tenantLease = computed(()=> store.state.Terminated_Leases.tenantLease);
        const tenantDetails = computed(()=> store.state.Terminated_Leases.tenantDetails);
        const tenantCurrency = computed(()=> store.state.Terminated_Leases.tenantCurrency);
        const tenantProperty = computed(()=> store.state.Terminated_Leases.tenantProperty);
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

        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            
        ]);
        const searchTenantTransactions = async() =>{
            showLoader();
            let formData = {
                client: tenantDetails.value.tenant_id,
                company: companyID.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                page_size: 1000
            }
            try{
                const response = await store.dispatch('Ledgers/fetchClientJournals', formData)
            }
            catch(error){

            }finally{
                hideLoader();
            }  
        }
        const printTenantStatement = () =>{
            showLoader();
            let formData = {
                client: tenantDetails.value.tenant_id,
                company: companyID.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
            }
            axios
            .post("api/v1/tenant-statement-pdf/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                    const blob1 = new Blob([response.data]);
                    // Convert blob to URL
                    const url = URL.createObjectURL(blob1);
                    PrintJS({printable: url, type: 'pdf'});
                }
            })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchTenantTransactions();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchTenantTransactions();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchTenantTransactions();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchTenantTransactions();
        }
        const resetFilters = () =>{
            from_date_search.value = "";
            to_date_search.value = "";
            searchTenantTransactions();
        }

        const variationColumns = ref([
            {type: "checkbox"},
            {label: "Variation Type", key: "variation_type", type: "text", editable: false},
            {label: "From Date", key: "from_date", type: "text", editable: false},
            {label: "To Date", key: "to_date", type: "text", editable: false},
            {label: "Variation Mode", key:"variation_mode", type: "text", editable: false},
            {label: "Variation Value", key: "variation_value", type: "text", editable: false},
            {label: "Amount", key: "rent_amount", type: "text", editable: false},
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
                client: tenantDetails.value.tenant_id,
                page_size: "100"
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
                await store.dispatch('Terminated_Leases/fetchRentSchedules',formData)
                .then(()=>{
                    hideLoader();
                })

            }
            else if( index == 5){
                activeTab.value = index;
                await store.dispatch('Terminated_Leases/fetchTenantVariations',formData)
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
                        const response = await store.dispatch('Terminated_Leases/bookDepositInvoice',formData)
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
                        const response = await store.dispatch('Terminated_Leases/cancelDepositBooking',formData)
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
                    await store.dispatch('Terminated_Leases/deleteTenantDeposit',formData)
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
                    await store.dispatch('Terminated_Leases/activateTenantUtility',formData)
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
                await store.dispatch('Terminated_Leases/deleteTenantUtility',formData)
            }
        }

        const voidUtility = async() =>{
            showVoidModalLoader();
            if(void_date.value != ''){
                utilityFormData.value['to_date'] = void_date.value;
                try{
                    const response = await store.dispatch('Terminated_Leases/voidTenantUtility',utilityFormData.value)
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
                        const response = await store.dispatch('Terminated_Leases/bookRentInvoice',formData)
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
                        const response = await store.dispatch('Terminated_Leases/cancelInvoiceBooking',formData)
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
                await store.dispatch('Terminated_Leases/deleteTenant',formData)
            }
        }
        const variationActionClick = async(rowIndex, action, row) =>{
            if( action === 'reset-schedules'){
                showLoader();
                const fromDate = row['from_date'];
                const toDate = row['to_date'];
                const rentAmount = row['rent_amount'];
                const variationID = row['variation_id'];

                let formData = {
                    company: companyID.value,
                    variation: variationID,
                    from_date: fromDate,
                    to_date: toDate,
                    rent_amount: rentAmount
                }
                try{
                    const response = await store.dispatch('Terminated_Leases/resetSchedules',formData)
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

        const updateTenantFormFields = (fields,additionalFields) => {
            tenantFormFields.value = fields;
            tenantAdditionalFields.value = additionalFields;
        };

        watch([selectedTenant], () => {
            if (selectedTenant.value) {
                tenantFormFields.value[0].value = selectedTenant.value.tenant_code;
                tenantFormFields.value[1].value = selectedTenant.value.tenant_name;
                tenantFormFields.value[2].value = selectedTenant.value.phone_number;
                tenantFormFields.value[3].value = selectedTenant.value.id_number;
                tenantFormFields.value[4].value = selectedTenant.value.gender;
                tenantFormFields.value[5].value = selectedTenant.value.email;
                tenantFormFields.value[6].value = selectedTenant.value.kra_pin;
                tenantFormFields.value[7].value = selectedTenant.value.tenant_type;
                tenantFormFields.value[8].value = selectedTenant.value.country;
                tenantFormFields.value[9].value = selectedTenant.value.address;
                tenantAdditionalFields.value[0].value = selectedTenant.value.contact_names;
                tenantAdditionalFields.value[1].value = selectedTenant.value.contact_phone_number;
                tenantAdditionalFields.value[2].value = selectedTenant.value.contact_email;
                tenantAdditionalFields.value[3].value = selectedTenant.value.contact_relationship;
            }
        }, { immediate: true });

        const handleTntReset = () =>{
            for(let i=0; i < tenantFormFields.value.length; i++){
                tenantFormFields.value[i].value = '';
            }
            for(let i=0; i < tenantAdditionalFields.value.length; i++){
                tenantAdditionalFields.value[i].value = '';
            }
            
        }
        const showTntModalLoader = () =>{
            tnt_modal_loader.value = "block";
        }
        const hideTntModalLoader = () =>{
            tnt_modal_loader.value = "none";
        }
        
        const editTenantDetails = async() =>{
            let formData = {
                company: companyID.value,
                tenant: tenantDetails.value.tenant_id
            }
            await store.dispatch('Terminated_Leases/fetchTenant',formData)
            tntModalVisible.value = true;
        };
        const updateTenantDetails = async() =>{
            showTntModalLoader();
            let formData = {
                tenant_code: tenantFormFields.value[0].value,
                tenant_name: tenantFormFields.value[1].value,
                gender: tenantFormFields.value[4].value,
                id_number: tenantFormFields.value[3].value,
                kra_pin: tenantFormFields.value[6].value,
                phone_number: tenantFormFields.value[2].value,
                email: tenantFormFields.value[5].value,
                country: tenantFormFields.value[8].value,
                address: tenantFormFields.value[9].value,
                tenant_type: tenantFormFields.value[7].value,
                contact_phone_number: tenantAdditionalFields.value[1].value,
                contact_email: tenantAdditionalFields.value[2].value,
                contact_relationship: tenantAdditionalFields.value[3].value,
                contact_names: tenantAdditionalFields.value[0].value,
                ledger_id: tenantDetails.value.ledger_id,
                tenant: tenantDetails.value.tenant_id,
                active_status: tenantDetails.value.active_status,
                company: companyID.value
            }

            errors.value = [];
            for(let i=1; i < tenantFormFields.value.length; i++){
                if(tenantFormFields.value[i].value =='' && tenantFormFields.value[i].required == true){
                    errors.value.push(tenantFormFields.value[i].label);
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideTntModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Terminated_Leases/updateTenant', formData);
                    if (response && response.status === 200) {
                        hideTntModalLoader();
                        toast.success('Tenant Biodata updated successfully!');
                        handleTntReset();
                        tntModalVisible.value = false;
                    } else {
                        toast.error('An error occurred while updating the Tenant Biodata.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Tenant Biodata: ' + error.message);
                } finally {
                    hideTntModalLoader();
                }
            }
        }
        const closeTntModal = () =>{
            tntModalVisible.value = false;
        };

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
                    const response = await store.dispatch('Terminated_Leases/createTenantDeposit', formData);
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
                    const response = await store.dispatch('Terminated_Leases/createTenantUtility', formData);
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
        const additionalFields1 = ref([
            { type: 'date', name: 'from_date',label: "From Date", value: '', required: true },
            { type: 'date', name: 'to_date',label: "To Date", value: '', required: true },
            { type: 'number', name: 'rent_amount',label: "New Rent", value: 0, required: true },      
        ]);
        const handleReviewReset = () =>{
            for(let i=0; i < additionalFields1.value.length; i++){
                additionalFields1.value[i].value = '';
            }
            
        }
        const showReviewModalLoader = () =>{
            review_modal_loader.value = "block";
        }
        const hideReviewModalLoader = () =>{
            review_modal_loader.value = "none";
        }
        
        const reviewRent = async() =>{
            reviewModalVisible.value = true;
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';

        };
        const reviewTenantRent = async() =>{
            showReviewModalLoader();
            let formData = {
                variation_type: "Review",
                variation_mode: null,
                variation_value: 0,
                rent_amount: additionalFields1.value[2].value,
                from_date: additionalFields1.value[0].value,
                to_date: additionalFields1.value[1].value,
                frequency: null,
                frequency_id: null,
                tenant_lease: tenantLease.value.tenant_lease_id,
                tenant_lease_id: tenantLease.value.tenant_lease_id,
                company: companyID.value
            }

            errors.value = [];
            for(let i=1; i < additionalFields1.value.length; i++){
                if(additionalFields1.value[i].value =='' && additionalFields1.value[i].required == true){
                    errors.value.push(additionalFields1.value[i].label);
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideReviewModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Terminated_Leases/createTenantVariation', formData);
                    if (response && response.status === 200) {
                        hideReviewModalLoader();
                        toast.success('Rent Review created successfully!');
                        handleReviewReset();
                        reviewModalVisible.value = false;
                    } else {
                        toast.error('An error occurred while creating the Rent Review.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Rent Review: ' + error.message);
                } finally {
                    hideReviewModalLoader();
                }
            }
        }
        const closeReviewModal = () =>{
            reviewModalVisible.value = false;
        };

        const additionalFields2 = ref([
            { type: 'date', name: 'termination_date',label: "Termination Date", value: formatDate(current_date), required: true,  maxDate: formatDate(current_date) },
            { type: 'number', name: 'deposit held',label: "Deposit Held", value: computedDepHeld.value, required: false },      
        ]);
        const handleTermReset = () =>{
            for(let i=0; i < additionalFields2.value.length; i++){
                additionalFields2.value[i].value = '';
            }
            
        }
        const showTermModalLoader = () =>{
            term_modal_loader.value = "block";
        }
        const hideTermModalLoader = () =>{
            term_modal_loader.value = "none";
        }
        
        const terminateLease = async() =>{
            let formData = {
                tenant: tenantLease.value.tenant_lease_id,
                company: companyID.value
            }
            await axios.post('api/v1/get-held-deposits/', formData).
            then((response)=>{
                depositHeld.value = response.data;
                if(response.status == 200){
                    termModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                }
            })
            .catch((error)=>{
                toast.error(error.message)
            })
        };
        const terminateTenantLease = async() =>{
            showTermModalLoader();
            let formData = {
                date: additionalFields2.value[0].value,
                tenant_lease: tenantLease.value.tenant_lease_id,
                company: companyID.value
            }

            errors.value = [];
            for(let i=1; i < additionalFields2.value.length; i++){
                if(additionalFields2.value[i].value =='' && additionalFields2.value[i].required == true){
                    errors.value.push(additionalFields2.value[i].label);
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideTermModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Terminated_Leases/terminateTenantLease', formData);
                    if (response && response.status === 200) {
                        hideTermModalLoader();
                        toast.success('Termination successful!');
                        handleTermReset();
                        reviewModalVisible.value = false;
                    } else {
                        toast.error('An error occurred while Terminating Lease.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Terminate Lease: ' + error.message);
                } finally {
                    hideTermModalLoader();
                }
            }
        }
        const closeTermModal = () =>{
            termModalVisible.value = false;
            depositHeld.value = 0;
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
            scheduleTableKey, idFieldSchedule, scheduleColumns, actionsSchedule, scheduleRows, statementTableKey, idFieldStatement, statementRows,showActions,searchFilters,printTenantStatement,resetFilters,
            statementColumns, actionsStatement, tenantLease, tenantDetails, tenantCurrency, tenantProperty, scheduleActionClick,showAddButton,
            depositActionClick, variationColumns, variationRows, variationTableKey, idFieldVariation, actionsVariation, variationActionClick,
            addNewDeposit, addNewUtility,tnt_modal_loader, dep_modal_loader, util_modal_loader, tntModalVisible, depModalVisible, utilModalVisible, displayButtons, depositTitle, utilityTitle,tntTitle,
            tnt_modal_width,modal_top,tnt_modal_left, modal_left, modal_width, showDepModalLoader, hideDepModalLoader, showUtilModalLoader, hideUtilModalLoader, handleDepReset,showTntModalLoader,
            flex_basis, flex_basis_percentage, closeDepModal, closeUtilModal, handleUtilReset, createTenantDeposit, createTenantUtility, utilityActionClick, closeTntModal,handleTntReset,
            void_date, voidTitle, void_modal_loader, voidModalVisible, void_modal_width, showVoidModalLoader, hideVoidModalLoader, closeVoidModal, voidUtility,hideTntModalLoader,updateTenantDetails,
            tenantFormFields,tenantAdditionalFields,updateTenantFormFields,editTenantDetails,rightsModule,isDisabled,
            reviewModalVisible,review_modal_loader,reviewTitle,reviewRent,reviewTenantRent,showReviewModalLoader,hideReviewModalLoader,closeReviewModal,handleReviewReset,additionalFields1,
            termModalVisible,term_modal_loader,termTitle,terminateLease,terminateTenantLease,showTermModalLoader,hideTermModalLoader,closeTermModal,handleTermReset,additionalFields2,depositHeld
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
.table{
    min-height: 15vh;
    max-height: 15vh;
    overflow-y: scroll;
    overflow-x: scroll;
}

</style>