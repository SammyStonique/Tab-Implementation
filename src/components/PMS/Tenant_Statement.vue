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
                <div class="tab-content">
                    <div v-show="activeTab == 0">
                        <div class="flex">
                            <div class="basis-1/2 border-left border-gray-400">
                                <h1 class="font-bold mb-10">Tenant BioData</h1>
                                <table class="w-full">
                                    <tr class="text-left">
                                        <td class="font-bold ">Tenant Code:</td>
                                        <td> {{tenantLease ? tenantLease.tenant['tenant_code'] : ''}}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold">Tenant Name:</td>
                                        <td>{{ tenantLease.tenant['tenant_name'] }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">ID Number:</td>
                                        <td>{{ tenantLease.tenant['id_number'] }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Phone Number:</td>
                                        <td>{{ tenantLease.tenant['phone_number'] }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Email:</td>
                                        <td>{{ tenantLease.tenant['email'] }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Tax Pin:</td>
                                        <td>{{ tenantLease.tenant['kra_pin'] }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Address:</td>
                                        <td>{{ tenantLease.tenant['address'] }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Country:</td>
                                        <td>{{ tenantLease.tenant['country'] }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Contact Name:</td>
                                        <td>{{ tenantLease.tenant['contact_names'] }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Contact Phone No:</td>
                                        <td>{{ tenantLease.tenant['contact_phone_number'] }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Contact Email:</td>
                                        <td>{{ tenantLease.tenant['contact_email'] }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Contact Rltshp:</td>
                                        <td>{{ tenantLease.tenant['contact_relationship'] }}</td>
                                    </tr>
                                </table>
                            </div>
                            <div class="basis-1/2">
                                <h1 class="font-bold mb-10">Lease Details</h1>
                                <table class="w-full">
                                    <tr class="text-left">
                                        <td class="font-bold">Property:</td>
                                        <td>{{ property }}</td>
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
                                        <td>{{ tenantLease.rent_amount }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Billing Amount:</td>
                                        <td>{{ tenantLease.billing_amount }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Lease Mode:</td>
                                        <td>{{ tenantLease.lease_mode }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Lease Currency:</td>
                                        <td>{{ tenantLease.lease_currency['code'] }} - {{ tenantLease.lease_currency['name'] }}</td>
                                    </tr>
                                    
                                </table>
                            </div>
                        </div>
                    </div>
                    <div v-show="activeTab == 1">
                        <DynamicTable :key="statementTableKey" :columns="statementColumns" :rows="statementRows" :idField="idFieldStatement" :actions="actionsStatement"/>
                    </div>          
                    <div v-show="activeTab == 2">                     
                        <DynamicTable :key="tableKey" :columns="depositColumns" :rows="computedDepositRows" :idField="idFieldDeposit" :actions="actionsDeposit" @action-click="deleteDeposit" />
                    </div>
                    <div v-show="activeTab == 3">                    
                        <DynamicTable :key="utilityTableKey" :columns="utilityColumns" :rows="computedUtilityRows" :idField="idFieldUtility" :actions="actionsUtility" @action-click="deleteUtility" />
                    </div>
                    <div v-show="activeTab == 4">                    
                        <DynamicTable :key="scheduleTableKey" :columns="scheduleColumns" :rows="scheduleRows" :idField="idFieldSchedule" :actions="actionsSchedule" @action-click="scheduleActionClick" />
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
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import axios from 'axios';

export default defineComponent({
    name: 'Tenant_Statement',
    components:{
        PageStyleComponent, DynamicTable
    },
    setup(props,{emit}){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const companyID = computed(()=> store.state.userData.company_id);
        const tabs = ref(['Tenant Details','Tenant Statement','Tenant Deposits','Tenant Utilities','Rent Schedules']);
        const activeTab = ref(0);
        const mainComponentKey = ref(0);
        const tableKey = ref(0);
        const utilityTableKey = ref(0);
        const scheduleTableKey = ref(0);
        const statementTableKey = ref(0);
        const idFieldDeposit = ref('deposit_id');
        const idFieldUtility = ref('utility_id');
        const idFieldSchedule = ref('rent_schedule_id');
        const idFieldStatement = ref('');
        const computedDepositRows = computed(()=> store.state.Security_Deposits.tenantDeposits);
        const computedUtilityRows = computed(()=> store.state.Utilities.tenantUtilities);
        const scheduleRows = computed(()=> store.state.Active_Tenants.rentSchedules);
        const statementRows = computed(()=> store.state.Journals.jnlArray);
        const tenantLease = computed(()=> store.state.Active_Tenants.tenantLease);
        const depositColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"security_deposit.name", type: "text", editable: false},
            {label: "Charge Mode", key:"deposit_charge_mode", type: "text", editable: false},
            {label: "Default Value", key: "deposit_value", type: "text", editable: false},
            {label: "Deposit Amount", key: "deposit_amount", type: "text", editable: false},
            {label: "Posted", key: "posted", type: "text", editable: false},
        ]);

        const actionsDeposit = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Deposit'},
        ]);

        const utilityColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"utility.name", type: "text", editable: false},
            {label: "Charge Mode", key:"utility_charge_mode", type: "text", editable: false},
            {label: "Default Value", key: "utility_value", type: "text", editable: false},
            {label: "Utility Vat", key: "deposit_value", type: "text", editable: false},
            {label: "Utility Amount", key: "utility_amount", type: "text", editable: false},
            {label: "Status", key: "status", type: "text", editable: false},
        ])

        const actionsUtility = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Utility'},
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

        const actionsSchedule = ref([
            {name: 'book-invoice', icon: 'fa fa-spinner', title: 'Book Rent'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Schedule'},
        ]);

        const statementColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date", type: "text", editable: false},
            {label: "Ref No", key:"reference_no", type: "text", editable: false},
            {label: "Txn No", key: "journal_no", type: "text", editable: false},
            {label: "Narration", key: "description", type: "text", editable: false},
            {label: "Charges", key: "debit_amount", type: "text", editable: false},
            {label: "Payments", key: "credit_amount", type: "text", editable: false},
            {label: "Balance", key: "running_balance", type: "text", editable: false},
        ]);

        const actionsStatement = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Transaction'},
        ]);

        const selectTab = (index) => {
            activeTab.value = index;
        };

        const showLoader = () =>{
            loader.value = "block";
        };
        const hideLoader = () =>{
            loader.value = "none";
        };

        const scheduleActionClick = async(rowIndex, action, row) =>{
            if( action == 'book-invoice'){
                const scheduleID = [row['rent_schedule_id']];
                let formData = {
                    company: companyID.value,
                    rent_schedule: scheduleID
                }
                console.log("THE FORM DATA IS ",formData)
                try{
                    showLoader();
                    await store.dispatch('Active_Tenants/bookRentInvoice',formData)
                }
                catch{

                }
                finally{
                    mainComponentKey.value += 1;
                    hideLoader();
                }
                
            }else if(action == 'delete'){
                const scheduleID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    rent_schedule: scheduleID
                }
                await store.dispatch('Active_Tenants/deleteTenant',formData)
            }
        }

        return{
            tabs, activeTab, mainComponentKey, depositColumns, utilityColumns, selectTab, loader, showLoader, hideLoader,
            tableKey,utilityTableKey, idFieldDeposit, idFieldUtility, actionsDeposit, actionsUtility, computedDepositRows, computedUtilityRows,
            scheduleTableKey, idFieldSchedule, scheduleColumns, actionsSchedule, scheduleRows, statementTableKey, idFieldStatement, statementRows,
            statementColumns, actionsStatement, tenantLease, scheduleActionClick
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
}

</style>