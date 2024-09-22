<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[450px]">
                <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Debtor Details</h1>
                <div class="tabs pt-2">
                    <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                        {{ tab }}
                    </button>
                </div>
                <div class="tab-content mt-3">
                    <div v-if="activeTab == 0">
                        <div class="flex">
                            <div class="basis-1/2 border-left border-gray-400">
                                <h1 class="font-bold mb-10">Vendor BioData</h1>
                                <table class="w-full">
                                    <tr class="text-left">
                                        <td class="font-bold ">Vendor Code:</td>
                                        <td> {{ vendorDetails.vendor_code }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold">Vendor Name:</td>
                                        <td>{{ vendorDetails.vendor_name }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">ID Number:</td>
                                        <td>{{ vendorDetails.id_number }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Phone Number:</td>
                                        <td>{{ vendorDetails.phone_number }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Email:</td>
                                        <td>{{ vendorDetails.email }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Tax Pin:</td>
                                        <td>{{ vendorDetails.pin_no }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Address:</td>
                                        <td>{{ vendorDetails.invoicing_address }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Contact Person:</td>
                                        <td>{{ vendorDetails.contact_person }}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div v-if="activeTab == 1">
                        <DynamicTable :key="statementTableKey" :columns="statementColumns" :rows="statementRows" :idField="idFieldStatement" :showActions="showActions" :actions="actionsStatement"/>
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
    name: 'Vendor_Statement',
    components:{
        PageStyleComponent, DynamicTable
    },
    setup(props,{emit}){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const companyID = computed(()=> store.state.userData.company_id);
        const tabs = ref(['Vendor Details','Vendor Statement']);
        const activeTab = ref(0);
        const mainComponentKey = ref(0);
        const tableKey = ref(0);
        const statementTableKey = ref(0);
        const idFieldStatement = ref('');
        const statementRows = computed(()=> store.state.Journals.jnlArray);
        const vendorDetails = computed(()=> store.state.Vendors.vendorDetails);
        const showActions = ref(false);

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


        const selectTab = async(index) => {
            showLoader();
            let formData1 = {
                company: companyID.value,
                client: vendorDetails.value.vendor_id
            }
            if(index == 1){
                activeTab.value = index;
                await store.dispatch('Journals/fetchClientJournals',formData1)
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

        return{
            tabs, activeTab, mainComponentKey, selectTab, loader, showLoader, hideLoader,
            tableKey, statementColumns ,statementRows, actionsStatement, vendorDetails,
            showActions
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
    padding: 1px;
}

</style>