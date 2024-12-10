<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <div class="flex h-16">
                    <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage"  @handleSubmit="createTenantReceipt" @handleReset="handleReset" /> 
                    <button @click="fetchTransactions" class="rounded bg-green-400 text-sm h-8 w-24 mt-2 text-white px-1.5 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Load</button>
                    <button @click="previewStatement" class="rounded bg-green-400 text-sm h-8 w-24 ml-1.5 mt-2 text-white px-1.5 py-1.5"><i class="fa fa-eye text-xs mr-1.5" aria-hidden="true"></i>Preview</button>
                </div>
            </div>
            <div class="table-container capitalize text-xs min-h-[480px] mt-3">
                <table class="dynamic-table rounded">
                    <thead>
                        <tr>
                            <!-- Fixed main headers -->
                            <th rowspan="2" style="width:5%;">Unit</th>
                            <th rowspan="2" style="width:15%;">Tenant Name</th>
                            <th rowspan="2">Bal. B/F</th>
                            <th :colspan="subHeaders.invoiced.length">Invoiced</th>
                            <th :colspan="subHeaders.paid.length">Paid</th>
                            <th rowspan="2">Bal. C/F</th>
                        </tr>
                        <tr>
                            <!-- Dynamic sub-column headers -->
                            <th class="sticky" v-for="(subHeader, index) in subHeaders['invoiced']" :key="'invoiced-' + index">{{ subHeader }}</th>
                            <th class="sticky" v-for="(subHeader, index) in subHeaders['paid']" :key="'paid-' + index">{{ subHeader }}</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, rowIndex) in tableData" :key="rowIndex">
                            <td>{{ row.unitNo }}</td>
                            <td>{{ row.tenantName }}</td>
                            <td>{{ Number(row.balanceBF).toLocaleString() }}</td>
                            <td v-for="(subHeader, subIndex) in subHeaders['invoiced']" :key="'invoiced-' + subIndex">{{ Number(row.invoiced[subIndex]).toLocaleString() }}</td>
                            <td v-for="(subHeader, subIndex) in subHeaders['paid']" :key="'paid-' + subIndex">{{ Number(row.paid[subIndex]).toLocaleString() }}</td>
                            <td class="font-bold">{{ Number(row.balanceCF).toLocaleString() }}</td>
                        </tr> 
                        <tr v-if="tableData.length" class="font-bold">
                            <td>{{ tableData.length }} Units</td>
                            <td></td>
                            <td>{{ Number(balanceBfTotals).toLocaleString() }}</td>
                            <td v-for="(subTotal, subIndex) in statementInvoicedTotals" :key="subIndex">{{ Number(subTotal).toLocaleString() }}</td>
                            <td v-for="(subTotal, subIndex) in statementPaidTotals" :key="subIndex">{{ Number(subTotal).toLocaleString() }}</td>
                            <td class="font-bold">{{ Number(balanceTotals).toLocaleString() }}</td>
                        </tr>
                        <tr v-if="tableData.length" class="font-bold">
                            <td></td>
                            <td></td>
                            <td></td>
                            <td :colspan="subHeaders.invoiced.length">TOTAL INVOICED: {{ Number(invoicedSum).toLocaleString() }}</td>
                            <td :colspan="subHeaders.paid.length">TOTAL PAID: {{ Number(paidSum).toLocaleString() }}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="flex-1 basis-full px-2 mt-6" v-if="displayButtons">
                <button @click="processStatement" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Process</button>
                <button @click="handleReset" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-refresh text-xs mr-1.5" aria-hidden="true"></i>Reset</button>
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
    name: 'Statement_Processing',
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
        const subHeaders = ref({
            invoiced: computed(()=> store.state.Property_Statements.newSubHeaders),
            paid: computed(()=> store.state.Property_Statements.subHeaders),
        });
        const tableData = computed(()=> store.state.Property_Statements.tableData);
        const statementTransactions = computed(()=> store.state.Property_Statements.statementTransactions);
        const statementInvoicedTotals = computed(()=> store.state.Property_Statements.statementInvoicedTotals);
        const statementPaidTotals = computed(()=> store.state.Property_Statements.statementPaidTotals);
        const balanceTotals = computed(()=> store.state.Property_Statements.statementBalanceTotals);
        const balanceBfTotals = computed(()=> store.state.Property_Statements.statementBfTotals);
        const paidSum = computed(()=> store.state.Property_Statements.paidSum);
        const invoicedSum = computed(()=> store.state.Property_Statements.invoicedSum);
        const mainComponentKey = ref(0);
        const propComponentKey = ref(0);
        const prepModalVisible = ref(false);
        const title = ref('Add Prepayment');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const displayButtons = ref(true);
        const showActions = ref(false);
        const idField = ref('');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const flex_basis_additional = ref('');
        const flex_basis_percentage_additional = ref('');
        const propertyID = ref('');
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);

        const fetchProperties = async() =>{
            await store.dispatch('Properties_List/fetchProperties', {company:companyID.value})
        };

        const handleSelectedProperty = async(option) =>{
            await store.dispatch('Properties_List/handleSelectedProperty', option)
            propertyID.value = store.state.Properties_List.propertyID;
        };
        const clearSelectedProperty = async() =>{
            await store.dispatch('Properties_List/updateState', {propertyID: ''});
            propertyID.value = null;
            formFields.value[3].value = "";
            formFields.value[3].disabled = false;
            mainComponentKey.value += 1;
        }

        const fetchPrevStatementDate = async() =>{
            let formData = {
                property: propertyID.value,
                company: companyID.value
            }
            const response = await axios.post("api/v1/previous-statement-date/",formData)
            formFields.value[3].value = response.data.date;
            if(response.data.date != ""){
                formFields.value[3].disabled = true;
            }
            
        }   

        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                {
                    type:'search-dropdown', label:"Property", value: propertyID.value, componentKey: propComponentKey,
                    selectOptions: propertyArray, optionSelected: handleSelectedProperty, required: true,
                    searchPlaceholder: 'Select Property...', dropdownWidth: '390px', updateValue: "",
                    fetchData: fetchProperties(), clearSearch: clearSelectedProperty()            
                },
                { type: 'dropdown', name: 'month',label: "Month", value: '', placeholder: "", required: true, options: [{ text: 'January', value: 'January' }, { text: 'February', value: 'February' },{ text: 'March', value: 'March' }, { text: 'April', value: 'April' },{ text: 'May', value: 'May' }, { text: 'June', value: 'June' },{ text: 'July', value: 'July' }, { text: 'August', value: 'August' },{ text: 'September', value: 'September' }, { text: 'October', value: 'October' },{ text: 'November', value: 'November' }, { text: 'December', value: 'December' }] },
                { type: 'text', name: 'reference_no',label: "Year", value: '', required: true,},
                { type: 'date', name: 'with_effect_from',label: "W.E.F", value: '', required: true, minDate: "", maxDate: formatDate(current_date), disabled: false },
                { type: 'date', name: 'with_effect_to',label: "W.E.T", value: '', required: true, minDate: "", maxDate: formatDate(current_date) },            
            ]
        };
        watch([propertyID, formFields], ()=>{
            if(propertyID.value){
                fetchPrevStatementDate();
            }
        }, {immediate: true})

        const handleReset = () =>{
            store.dispatch('Property_Statements/updateState', {subHeaders: [], tableData: [], statementTransactions: []})
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
            propertyID.value = '';
            propComponentKey.value += 1;
            formFields.value[1].value = getMonth(current_date);
            formFields.value[2].value = getYear(current_date);
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
                month: formFields.value[1].value,
                year: formFields.value[2].value,
                with_effect_from: formFields.value[3].value,
                with_effect_to: formFields.value[4].value,
                property: propertyID.value,
                company: companyID.value
            }
            errors.value = []
            for(let i=1; i<formFields.value.length; i++){
                if(formFields.value[i].value == "" && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label)
                }
            }
            if(propertyID.value == "" || propertyID.value == null){
                errors.value.push("Error")
            }
            if(errors.value.length){
                toast.error("Please Fill In The Required Fields");
                hideLoader();
            }else{
                await store.dispatch('Property_Statements/fetchStatementData', formData)
                hideLoader();
            }
        }

        const processStatement = async() =>{
            showLoader();
            let formData = {
                prepared_by: userID.value,
                prepared_by_id: userID.value,
                with_effect_from: formFields.value[3].value,
                with_effect_to: formFields.value[4].value,
                statement_type: "Combined",
                approval_status: "No",
                month: formFields.value[1].value,
                year: formFields.value[2].value,
                period_collection: paidSum.value,
                period_expenses: 0,
                approved_by: null,
                approved_by_id: null,
                date_approved: null,
                property: propertyID.value,
                property_id: propertyID.value,
                company: companyID.value,
                statement_transactions: statementTransactions.value
            }

            let formData1 = {
                month: formFields.value[1].value,
                year: formFields.value[2].value,
                with_effect_from: formFields.value[3].value,
                with_effect_to: formFields.value[4].value,
                property: propertyID.value,
                company: companyID.value,
                user: userID.value,
            }

            try{
                const response1 = await store.dispatch('Property_Statements/processPropertyStatementPDF', formData1)
                const response = await store.dispatch('Property_Statements/createPropertyStatement', formData)
                if(response && response.status == 200 && response1){ 
                    toast.success("Statement Processed Succesfully")
                    hideLoader();
                    handleReset();
                }
            }
            catch(error){
                toast.error("Error Processing Statement")
            }
            finally{
                hideLoader();
            }

        };
        const previewStatement = () =>{
            showLoader();
            let formData = {
                month: formFields.value[1].value,
                year: formFields.value[2].value,
                with_effect_from: formFields.value[3].value,
                with_effect_to: formFields.value[4].value,
                property: propertyID.value,
                company: companyID.value
            } 

            axios
            .post("api/v1/export-landlord-statement-pdf/", formData, { responseType: 'blob' })
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
            formFields.value[1].value = getMonth(current_date);
            formFields.value[2].value = getYear(current_date);
            store.dispatch('Property_Statements/updateState', {subHeaders: [], tableData: []})
        })

        return{
            subHeaders, tableData, balanceBfTotals, statementInvoicedTotals, statementPaidTotals, balanceTotals, invoicedSum, paidSum, formFields, flex_basis, 
            flex_basis_percentage, displayButtons, mainComponentKey, handleReset, loader, showLoader, hideLoader, tableKey, showActions, idField,          
            title, modal_loader, modal_left, modal_top, modal_width, prepModalVisible, showModalLoader, hideModalLoader, closeModal,
            fetchTransactions, processStatement,previewStatement
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