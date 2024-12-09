<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[750px]">
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
                                <h1 class="font-bold mb-10">Debtor BioData</h1>
                                <table class="w-full">
                                    <tr class="text-left">
                                        <td class="font-bold ">Debtor Code:</td>
                                        <td> {{ customerDetails.customer_code }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold">Debtor Name:</td>
                                        <td>{{ customerDetails.customer_name }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">ID Number:</td>
                                        <td>{{ customerDetails.id_number }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Phone Number:</td>
                                        <td>{{ customerDetails.phone_number }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Email:</td>
                                        <td>{{ customerDetails.email }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Tax Pin:</td>
                                        <td>{{ customerDetails.pin_no }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Address:</td>
                                        <td>{{ customerDetails.invoicing_address }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Contact Person:</td>
                                        <td>{{ customerDetails.contact_person }}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div v-if="activeTab == 1">
                        <DynamicTable :key="statementTableKey" :columns="statementColumns" :rows="journalsList" :idField="idFieldStatement" :showActions="showActions" :actions="actionsStatement"/>
                    </div>             
                </div>
            </div>
            <div class="fixed w-[93%] z-30 bottom-5 pb-2 bg-white">
                <MyPagination 
                    :count="propCount"
                    :currentPage="currentPage"
                    :result="propArrLen"
                    @loadPrev="loadPrev"
                    @loadNext="loadNext"
                    @firstPage="firstPage"
                    @lastPage="lastPage"
                    :selectedValue="selectedValue"
                    @selectSearchQuantity="selectSearchQuantity"
                    :showNextBtn="showNextBtn"
                    :showPreviousBtn="showPreviousBtn"
            />
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
import MyPagination from '@/components/MyPagination.vue'

export default defineComponent({
    name: 'Debtor_Statement',
    components:{
        PageStyleComponent, DynamicTable, MyPagination
    },
    setup(props,{emit}){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const companyID = computed(()=> store.state.userData.company_id);
        const tabs = ref(['Debtor Details','Debtor Statement']);
        const activeTab = ref(0);
        const mainComponentKey = ref(0);
        const tableKey = ref(0);
        const journalsList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const selectedValue = ref(50);
        const propCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const statementTableKey = ref(0);
        const idFieldStatement = ref('');
        const statementRows = computed(()=> store.state.Journals.jnlArray);
        const customerDetails = computed(()=> store.state.Customers.customerDetails);
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

        const searchJournals = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                company: companyID.value,
                client: customerDetails.value.customer_id,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/client-journals-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                let journalsArray = []
                journalsList.value = [];
                let running_balance = 0;
                journalsArray = response.data.results;
                let jnlSortedArr = journalsArray.sort(function(a, b){
                    // Convert the date strings to Date objects
                    let dateA = new Date(a.date);
                    let dateB = new Date(b.date);

                    // Subtract the dates to get a value that is either negative, positive, or zero
                    return dateA - dateB;
                })

                for(let i=0; i<journalsArray.length; i++){
                    if(journalsArray[i].debit_amount != 0){
                        running_balance += journalsArray[i].debit_amount;
                        journalsArray[i]['running_balance'] = Number(running_balance).toLocaleString();
                        journalsList.value.push(journalsArray[i])
                    }
                    else if(journalsArray[i].credit_amount != 0){
                        running_balance -= journalsArray[i].credit_amount;
                        journalsArray[i]['running_balance'] = Number(running_balance).toLocaleString();
                        journalsList.value.push(journalsArray[i])
                    }
                }
                propResults.value = response.data;
                propArrLen.value = journalsList.value.length;
                propCount.value = propResults.value.count;
                pageCount.value = Math.ceil(propCount.value / selectedValue.value);
                if(response.data.next){
                    showNextBtn.value = true;
                }
                if(response.data.previous){
                    showPreviousBtn.value = true;
                }
            })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        };

        const selectTab = async(index) => {
            showLoader();
            if(index == 1){
                activeTab.value = index;
                searchJournals();
            }else{
                activeTab.value = index;
                hideLoader();
            }

        };

        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchJournals(selectedValue.value);
        };

        const showLoader = () =>{
            loader.value = "block";
        };
        const hideLoader = () =>{
            loader.value = "none";
        };

        return{
            tabs, activeTab, mainComponentKey, selectTab, loader, showLoader, hideLoader,
            tableKey, statementColumns ,statementRows, actionsStatement, customerDetails,
            showActions,selectSearchQuantity,selectedValue,propArrLen,propCount,propResults,currentPage,
            journalsList
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