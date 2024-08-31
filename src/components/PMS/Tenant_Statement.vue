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

                    </div>
                    <div v-show="activeTab == 1">

                    </div>          
                    <div v-show="activeTab == 2">                     
                        <DynamicTable :key="tableKey" :columns="depositColumns" :rows="computedDepositRows" :idField="idFieldDeposit" :actions="actionsDeposit" @action-click="deleteDeposit" />
                    </div>
                    <div v-show="activeTab == 3">                    
                        <DynamicTable :key="utilityTableKey" :columns="utilityColumns" :rows="computedUtilityRows" :idField="idFieldUtility" :actions="actionsUtility" @action-click="deleteUtility" />
                    </div>
                    <div v-show="activeTab == 4">                    
                        <DynamicTable :key="scheduleTableKey" :columns="scheduleColumns" :rows="scheduleRows" :idField="idFieldSchedule" :actions="actionsSchedule" @action-click="deleteSchedule" />
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
        const tabs = ref(['Tenant Details','Tenant Statement','Tenant Deposits','Tenant Utilities','Rent Schedules']);
        const activeTab = ref(0);
        const mainComponentKey = ref(0);
        const tableKey = ref(0);
        const utilityTableKey = ref(0);
        const scheduleTableKey = ref(0);
        const idFieldDeposit = ref('deposit_id');
        const idFieldUtility = ref('utility_id');
        const idFieldSchedule = ref('rent_schedule_id');
        const computedDepositRows = computed(()=> store.state.Security_Deposits.tenantDeposits);
        const computedUtilityRows = computed(()=> store.state.Utilities.tenantUtilities);
        const scheduleRows = computed(()=> store.state.Active_Tenants.rentSchedules);
        const depositColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"security_deposit.name", type: "text", editable: false},
            {label: "Charge Mode", key:"deposit_charge_mode", type: "text", editable: false},
            {label: "Default Value", key: "deposit_value", type: "text", editable: false},
            {label: "Deposit Amount", key: "deposit_amount", type: "text", editable: false},
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
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Schedule'},
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

        return{
            tabs, activeTab, mainComponentKey, depositColumns, utilityColumns, selectTab, loader, showLoader, hideLoader,
            tableKey,utilityTableKey, idFieldDeposit, idFieldUtility, actionsDeposit, actionsUtility, computedDepositRows, computedUtilityRows,
            scheduleTableKey, idFieldSchedule, scheduleColumns, actionsSchedule, scheduleRows
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