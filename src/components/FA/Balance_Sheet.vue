<template>
    <div class="z-10">
        <PageStyleComponent :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="fixed bg-white w-[93%] z-50">
                <FilterBar 
                    :addButtonLabel="addButtonLabel" 
                    :filters="searchFilters" 
                    @add-new=""
                    @search="searchBalanceSheet"
                    @reset="resetFilters"
                    @printList="printList"
                    :dropdownOptions="dropdownOptions"
                    @handleDynamicOption="handleDynamicOption"
                    :options="options"
                    :dropdownWidth="dropdownWidth"
                    :selectOptions="selectOptions"
                    :updateValue="updateValue"
                    :searchPlaceholder="searchPlaceholder"
                    />
            </div>
            <div class="table-container  min-h-[330px] text-xs mt-20 uppercase flex">
                <div class="basis-1/2">
                  <h3 class="font-bold uppercase text-center my-3">Assets</h3>
                  <table class="min-w-full bg-white chart-of-accounts-table" style="width: 50%;"> 
                      <thead class="bg-gray-800 text-white">
                          <tr class="rounded bg-slate-800 text-white font-semibold text-xs uppercase">
                            <th class="text-left py-1.5 px-2" style="width: 70%;">Account Name</th>
                            <th class="text-left py-1.5 px-2" style="width: 30%;">Amount</th>
                          </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(ledger,index) in assetsList" :key="index" class="even:bg-gray-100 text-xs uppercase">
                            <td class="text-left py-1.5">{{ ledger.ledger_name }}</td>
                            <td class="text-left py-1.5">{{ Number(ledger.balance).toLocaleString() }}</td>
                        </tr>
                        <tr class="text-xs uppercase">
                            <td class="text-left py-1.5 font-bold">TOTALS</td>
                            <td class="text-left py-1.5 font-bold">{{ Number(assetTotals).toLocaleString() }}</td>

                        </tr>
                      </tbody>
                  </table> 
                </div> 
                <div class="basis-1/2">
                    <h3 class="font-bold uppercase text-center my-3">Liabilities & Owner's Equity</h3>
                    <table class="min-w-full bg-white chart-of-accounts-table" style="width: 50%;"> 
                      <thead class="bg-gray-800 text-white">
                          <tr class="rounded bg-slate-800 text-white font-semibold text-xs uppercase">
                            <th class="text-left py-1.5 px-2" style="width: 70%;">Account Name</th>
                            <th class="text-left py-1.5 px-2" style="width: 30%;">Amount</th>
                          </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(ledger,index) in liabilitiesList" :key="index" class="even:bg-gray-100 text-xs uppercase">
                            <td class="text-left py-1.5">{{ ledger.ledger_name }}</td>
                            <td class="text-left py-1.5">{{ Number(ledger.balance).toLocaleString() }}</td>
                        </tr>
                        <tr class="text-xs uppercase">
                            <td class="text-left py-1.5 font-bold">TOTALS</td>
                            <td class="text-left py-1.5 font-bold">{{ Number(liabilitiesTotals).toLocaleString() }}</td>

                        </tr>
                      </tbody>
                  </table> 
                </div> 
            </div>

        </template>
    </PageStyleComponent>
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="" @handleReset="handleReset"
            />
        </MovableModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import MovableModal from '@/components/MovableModal.vue'
import DynamicTable from '../DynamicTable.vue';
import FilterBar from "../FilterBar.vue";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Balance_Sheet',
    components:{
        PageStyleComponent, MovableModal,DynamicTable, FilterBar
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = '';
        const addButtonLabel = ref('');
        const title = ref('');
        const submitButtonLabel = ref('Add');
        const periodComponentKey = ref(0);
        const selectedIds = ref([]);
        const periodList = ref([]);
        const currentPage = ref(1);
        const propModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const showModal = ref(false);
        const patient_ledger_totals = ref(0);
        const customer_ledger_totals = ref(0);
        const vendor_ledger_totals = ref(0);
        const assetTotals = ref(0);
        const liabilitiesTotals = ref(0);
        const balanceSheetList = ref([]);
        const assetsList = ref([]);
        const liabilitiesList = ref([]);
        const from_date_search = ref('');
        const to_date_search = ref('');
        const merge_patients_setting = ref('Yes');
        const merge_vendors_setting = ref('Yes');
        const merge_debtors_setting = ref('Yes');
        
        const actions = ref([
           
        ])
        const companyID = computed(()=> store.state.userData.company_id);

        const searchFilters = ref([
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }


        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }

        const searchBalanceSheet = () =>{
            showLoader();
            patient_ledger_totals.value = 0;
            customer_ledger_totals.value = 0;
            vendor_ledger_totals.value = 0;
            assetTotals.value = 0;
            liabilitiesTotals.value = 0;
            balanceSheetList.value = [];
            assetsList.value = [];
            liabilitiesList.value = [];

            let formData = {
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                company_id: companyID.value
            }

            axios
            .post(`api/v1/balance-sheet-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                balanceSheetList.value = response.data.results;
                
                if(balanceSheetList.value.length){
                    for(let i=balanceSheetList.value.length - 1; i >= 0; i--){
                        if(balanceSheetList.value[i].ledger_category === "Patients" && merge_patients_setting.value === 'Yes'){
                            patient_ledger_totals.value += balanceSheetList.value[i].balance;
                            balanceSheetList.value.splice(i, 1);
                        }else if(balanceSheetList.value[i].ledger_category === "Vendors" && merge_vendors_setting.value === 'Yes'){
                            vendor_ledger_totals.value += balanceSheetList.value[i].balance;
                            balanceSheetList.value.splice(i, 1);
                        }else if(balanceSheetList.value[i].ledger_category === "Debtors" && merge_debtors_setting.value === 'Yes'){
                            customer_ledger_totals.value += balanceSheetList.value[i].balance;
                            balanceSheetList.value.splice(i, 1);
                        }
                    }
                    if(patient_ledger_totals.value !=0 ){
                        let patientArr ={
                            "ledger_code": 'PAT',
                            "ledger_name": 'PATIENTS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Patients',
                            "financial_statement": 'Balance Sheet',
                            "balance": patient_ledger_totals.value,
                            "status": 'Active',
                        }
                        balanceSheetList.value.push(patientArr);
                    }
                    if(customer_ledger_totals.value !=0 ){
                        let customersArr ={
                            "ledger_code": 'DEB',
                            "ledger_name": 'DEBTORS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Debtors',
                            "financial_statement": 'Balance Sheet',
                            "balance": customer_ledger_totals.value,
                            "status": 'Active',
                        }
                        balanceSheetList.value.push(customersArr);
                    }
                    if(vendor_ledger_totals.value != 0 ){
                        let vendorsArr ={
                            "ledger_code": 'VEN',
                            "ledger_name": 'VENDORS',
                            "ledger_type": 'Current Liability',
                            "ledger_category": 'Vendors',
                            "financial_statement": 'Balance Sheet',
                            "balance": vendor_ledger_totals.value,
                            "status": 'Active',
                        }
                        balanceSheetList.value.push(vendorsArr);
                    }

                }
                for(let i=0; i<balanceSheetList.value.length; i++){
                    if((balanceSheetList.value[i].ledger_type ==='Cashbook' || balanceSheetList.value[i].ledger_type ==='Current Asset' || balanceSheetList.value[i].ledger_type ==='Fixed Asset') && balanceSheetList.value[i].balance != 0){
                        assetTotals.value += Number(balanceSheetList.value[i].balance);
                        assetsList.value.push(balanceSheetList.value[i]);
                    }else if((balanceSheetList.value[i].ledger_type ==='Current Liability' || balanceSheetList.value[i].ledger_type ==='Longterm Liability' || balanceSheetList.value[i].ledger_type ==='Owner Equity') && balanceSheetList.value[i].balance != 0){
                        liabilitiesTotals.value += Number(balanceSheetList.value[i].balance);
                        liabilitiesList.value.push(balanceSheetList.value[i]);
                    }
                }

            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        }
        const resetFilters = () =>{
            searchBalanceSheet();
        }

        onBeforeMount(()=>{
            searchBalanceSheet()        
        })
        return{
            title, searchBalanceSheet,resetFilters, addButtonLabel, searchFilters, periodList,
            idField, actions, propModalVisible,
            submitButtonLabel, showModal, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            patient_ledger_totals,customer_ledger_totals,vendor_ledger_totals,assetTotals,liabilitiesTotals,balanceSheetList,assetsList,liabilitiesList
        }
    }
};
</script>

<style scoped>
.table-container thead th {
  position: sticky;
  top: 0;
  background: #3b4252;
}
.chart-of-accounts-table{
    min-height: 50vh;
    width: 50%;
    border-collapse: collapse;
    table-layout: fixed;
}
</style>




