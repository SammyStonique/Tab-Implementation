<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="flex mt-6">
                <div class="basis-1/2 flex h-16">
                    <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage"  @handleSubmit="createTenantReceipt" @handleReset="handleReset" /> 
                    <button @click="fetchTransactions" class="rounded bg-green-400 text-sm h-8 w-24 mt-2 text-white px-1.5 py-1.5"><i class="fa fa-binoculars text-xs mr-1.5" aria-hidden="true"></i>Search</button>
                    <button @click="printStatement" class="rounded bg-green-400 text-sm h-8 w-24 ml-1.5 mt-2 text-white px-1.5 py-1.5"><i class="fa fa-print text-xs mr-1.5" aria-hidden="true"></i>Print</button>
                </div>
            </div>
            <div class="table-container capitalize text-xs min-h-[480px] mt-3">
                <table class="dynamic-table rounded">
                    <thead>
                        <tr>
                            <!-- Fixed main headers -->
                            <th rowspan="2" style="width:6%;">Date</th>
                            <th rowspan="2" style="width:4%;">Txn No</th>
                            <th rowspan="2" style="width:6%;">Ref No</th>
                            <th rowspan="2" style="width:30%;">Description</th>
                            <th rowspan="2" style="width:5%;">Cash In</th>
                            <th rowspan="2" style="width:5%;">Cash Out</th>
                            <th rowspan="2" style="width:5%;">Running Bal</th>
                            <th class="sticky" v-for="(subHeader, index) in subHeaders" :key="index">{{ subHeader }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, rowIndex) in tableData" :key="rowIndex">
                            <td>{{ row.date }}</td>
                            <td>{{ row.txn_no }}</td>
                            <td>{{ row.ref_no }}</td>
                            <td>{{ row.description }}</td>
                            <td class="font-bold text-green-400">{{ Number(row.cash_in).toLocaleString() }}</td>
                            <td class="font-bold text-red-400">{{ Number(row.cash_out).toLocaleString() }}</td>
                            <td class="font-bold">{{ row.running_balance }}</td>
                            <td v-for="(category, subIndex) in subHeaders" :key="subIndex">{{ Number(row[category] || 0).toLocaleString() }}</td>
                        </tr> 
                        <tr v-if="tableData.length" class="font-bold">
                            <td></td>
                            <td></td>
                            <td></td>
                            <td class="font-bold">Totals</td>
                            <td class="font-bold">{{ Number(debitTotals).toLocaleString() }}</td>
                            <td class="font-bold">{{ Number(creditTotals).toLocaleString() }}</td>
                            <td></td>
                            <td v-for="(subTotal, subIndex) in itemCategoryTotals" :key="subIndex">{{ Number(subTotal).toLocaleString() }}</td>              
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>
    </PageStyleComponent>
    <MovableModal v-model:visible="prepModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
    >
        <DynamicForm 
            :fields="additionalFields" :flex_basis="flex_basis_additional" :flex_basis_percentage="flex_basis_percentage_additional" 
            :displayButtons="displayButtons" @handleSubmit="" @handleReset=""
        />
    </MovableModal>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import MovableModal from '@/components/MovableModal.vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import axios from 'axios';
import DynamicTable from '@/components/DynamicTable.vue';
import PrintJS from 'print-js';

export default defineComponent({
    name: 'Petty_Cash_Statement',
    components:{
        PageStyleComponent, DynamicForm, DynamicTable, MovableModal
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const { getYear } = useDateFormatter();
        const { getMonth } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('none');
        const modal_loader = ref('none');
        const tableKey = ref(0);
        const subHeaders = computed(()=> store.state.Petty_Cash.subHeaders);
        const tableData = computed(()=> store.state.Petty_Cash.tableData);
        const debitTotals = computed(()=> store.state.Petty_Cash.debitTotals);
        const creditTotals = computed(()=> store.state.Petty_Cash.creditTotals);
        const itemCategoryTotals = computed(()=> store.state.Petty_Cash.itemCategoryTotals);
        const selectedPettyCashID = computed(()=> store.state.Petty_Cash.selectedPettyCashID);
        const mainComponentKey = ref(0);
        const propComponentKey = ref(0);
        const prepModalVisible = ref(false);
        const title = ref('Add Prepayment');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const companyID = computed(()=> store.state.userData.company_id);
        const displayButtons = ref(true);
        const showActions = ref(false);
        const idField = ref('');
        const flex_basis = ref('');
        const flex_basis_percentage = ref(''); 

        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                { type: 'date', name: 'with_effect_from',label: "W.E.F", value: '', required: true, minDate: "", maxDate: formatDate(current_date), disabled: false },
                { type: 'date', name: 'with_effect_to',label: "W.E.T", value: '', required: true, minDate: "", maxDate: formatDate(current_date) },            
            ]
        };

        const handleReset = () =>{
            store.dispatch('Petty_Cash/updateState', {subHeaders: [], tableData: [], itemCategoryTotals: []})
            mainComponentKey.value += 1;
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].type == 'number'){
                    formFields.value[i].value = 0;
                }else if(formFields.value[i].type == 'date'){
                    formFields.value[i].value = '';
                    formFields.value[i].disabled = false;
                }else{
                    formFields.value[i].value = '';
                }
                
            }
            propComponentKey.value += 1;
        }

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 

        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }

        const closeModal = async() =>{
            prepModalVisible.value = false;
        }

        const fetchTransactions = async() =>{
            showLoader();
            let formData = {
                company: companyID.value,
                petty_cash: selectedPettyCashID.value,
                with_effect_from: formFields.value[0].value,
                with_effect_to: formFields.value[1].value
            }
            await store.dispatch('Petty_Cash/fetchStatementData',formData)
            .then(()=>{
                hideLoader();
            })
        }

        const processStatement = async() =>{

        };
        const printStatement = () =>{
            showLoader();
            let formData = {
                company: companyID.value,
                petty_cash: selectedPettyCashID.value,
                with_effect_from: formFields.value[0].value,
                with_effect_to: formFields.value[1].value
            } 

            axios
            .post("api/v1/export-petty-cash-statement-pdf/", formData, { responseType: 'blob' })
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

        onBeforeMount(()=>{ 
            updateFormFields();
            propComponentKey.value += 1;
            flex_basis.value = '1/5';
            flex_basis_percentage.value = '20';
        })
        onMounted(()=>{
            // store.dispatch('Petty_Cash/updateState', {subHeaders: [], tableData: []})
        })

        return{
            subHeaders, tableData, creditTotals, itemCategoryTotals, debitTotals, formFields, flex_basis, 
            flex_basis_percentage, displayButtons, mainComponentKey, handleReset, loader, showLoader, hideLoader, tableKey, showActions, idField,          
            title, modal_loader, modal_left, modal_top, modal_width, prepModalVisible, showModalLoader, hideModalLoader, closeModal,
            fetchTransactions, processStatement,printStatement
        }
    }
})
</script>

<style scoped>
.dynamic-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.dynamic-table th,
.dynamic-table td {
  border: 1px solid #ccc;
  padding: 3px;
  text-align: left;
}

.dynamic-table input{
  text-align: left;
  outline: none;
  background-color: inherit;
}
/* Style for fixed header */

.table-container thead th {
  position: sticky;
  top: 0;
  background: #3b4252;
  color: white;

}

.table-body tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>