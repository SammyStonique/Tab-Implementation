<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <h1 class="font-bold text-red-600 uppercase">{{ ledgerName }} Reconciliation</h1>
                <DynamicForm :saveButtonLabel="Reconcile"  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveReconciliation" @handleReset="handleReset"> 
                    <template v-slot:additional-content> 
                        <div class="flex flex-wrap gap-x-1 gap-y-1 text-xs">
                            <div v-for="(field, index) in formFields1" :key="index" class="flex items-center gap-x-1">
                                <label class="font-medium whitespace-nowrap w-[200px]" for="">{{ field.label }} : <em class="text-red-600">*</em></label>
                                <input disabled=true :hidden="field.hidden" v-model="field.value" :name="field.name" type="number" pattern="^\d+(\.\d{0,2})?$" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\.\d{2})\d+/g, '$1')" :class="[`bg-slate-50 rounded pl-3 border border-gray-400 text-sm w-16`]"/>
                                <input disabled=true v-model="field.value1" :name="field.name" type="number" pattern="^\d+(\.\d{0,2})?$" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\.\d{2})\d+/g, '$1')" :class="[`bg-slate-50 rounded pl-3 border border-gray-400 text-sm w-36`]"/>
                            </div>
                        </div>
                        <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[400px]">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Cashbook Entries</h1>  
                            <div class="mt-1 max-h-[380px] overflow-y-auto">  
                                <div class="flex gap-x-2 mb-2">
                                    <button  @click="markAllAsReconciled" :class="['rounded cursor-pointer text-xs px-2 py-1 font-medium border transition','bg-green-100 text-green-600 border-green-300 hover:bg-green-200']">
                                        <i class="fas fa-check-double text-green-500 mr-2 text-xs"></i> Mark All
                                    </button>
                                    <button  @click="unmarkAllAsReconciled" :class="['rounded cursor-pointer text-xs px-2 py-1 font-medium border transition','bg-red-100 text-red-600 border-red-300 hover:bg-red-200']">
                                        <i class="fa fa-ban text-red-500 mr-2 text-xs"></i> Unmark All
                                    </button>
                                    <button @click="addQuickJournal" class="rounded cursor-pointer text-xs px-2 py-1 font-medium border transition bg-green-100 text-green-600 border-green-300 hover:bg-green-200 ml-2">
                                        <i class="fa fa-book text-green-500 mr-2 text-xs"></i> Quick Journal
                                    </button>
                                    <button @click="addReconcilingItem" class="rounded cursor-pointer text-xs px-2 py-1 font-medium border transition bg-blue-100 text-blue-600 border-blue-300 hover:bg-blue-200 ml-2">
                                        <i class="fa fa-plus text-blue-500 mr-2 text-xs"></i> Add Reconciling Item
                                    </button>
                                </div>
                                <div class="flex mb-1 items-end px-2">
                                    <div class="basis-1/8 mr-3">
                                        <input type="text" class="rounded pl-3 border-2 border-gray-200 text-sm w-full" name="name" id="" placeholder="Txn No...." v-model="txn_no_search">
                                    </div>
                                    <div class="basis-1/8 mr-3">
                                        <input type="text" class="rounded pl-3 border-2 border-gray-200 text-sm w-full" name="name" id="" placeholder="Ref No...." v-model="ref_no_search">
                                    </div>
                                    <div class="basis-1/4 mr-3">
                                        <input type="text" class="rounded pl-3 border-2 border-gray-200 text-sm w-full" name="name" id="" placeholder="Description...." v-model="description_search">
                                    </div>
                                    <div class="basis-1/8 mr-3">
                                        <input type="number" class="rounded pl-3 border-2 border-gray-200 text-sm w-full" name="name" id="" placeholder="Money In...." v-model="money_in_search">
                                    </div>
                                    <div class="basis-1/8 mr-3">
                                        <input type="number" class="rounded pl-3 border-2 border-gray-200 text-sm w-full" name="name" id="" placeholder="Money Out...." v-model="money_out_search">
                                    </div>
                                    <div class="basis-1/8 mr-3">
                                        <input type="text" class="rounded pl-3 border-2 border-gray-200 text-sm w-full" name="name" id="" placeholder="Reconciled...." v-model="reconciled_search">
                                    </div>
                                </div>              
                                <DynamicTable :key="tableKey" :showTotals="showTotals" :columns="cashbookColumns" :rows="filterCbkRows" :showActions="showActions" :actions="actions" :rightsModule="rightsModule" @row-db-click="markAsReconciled"  @action-click="deleteJournalLine"/>
                            </div> 
                        </div>
                        <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[300px]">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Bank Statement Entries</h1>
                            <div class="mt-1 max-h-[260px] overflow-y-auto"> 
                                <div class="flex gap-x-2 mb-2">
                                    <button  @click="downloadTemplate" :class="['rounded cursor-pointer text-xs px-2 py-1 font-medium border transition','bg-green-100 text-green-600 border-green-300 hover:bg-green-200']">
                                        <i class="fa fa-cloud-download text-blue-500 mr-2 text-xs"></i> Download Template
                                    </button>
                                    <button  @click="importBankStatement" :class="['rounded cursor-pointer text-xs px-2 py-1 font-medium border transition','bg-green-100 text-green-600 border-green-300 hover:bg-green-200']">
                                        <i class="fa fa-file-import text-blue-500 mr-2 text-xs"></i> Import Bank Statement
                                    </button>
                                    <button @click="matchTransactions" class="rounded cursor-pointer text-xs px-2 py-1 font-medium border transition bg-blue-100 text-blue-600 border-blue-300 hover:bg-blue-200 ml-2">
                                        <i class="fa fa-refresh text-red-500 mr-2 text-xs"></i> Match Transactions
                                    </button>
                                </div>
                                <DynamicTable :key="tableKey" :showTotals="showTotals" :columns="bankColumns" :rows="bankRows" :showActions=false :actions="actions" :rightsModule="rightsModule" @row-db-click="markAsMatched" @action-click="deleteJournalLine"/>
                            </div>
                        </div>
                        
                    </template>
                </DynamicForm>
            </div>
        </template>
    </PageStyleComponent>
    <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" >
        <div class="flex flex-col gap-y-1">
            <label for="" class="mb-2 mr-3 text-sm">Select Excel To Import:<em>*</em></label>
            <input type="text" name="" class="rounded border-2 border-gray-600 text-gray-500 text-xs pl-2 mr-2 mb-4 w-80 h-8" placeholder="" v-model="localFilePath" >
            <input type="file" class="text-xs" name="file-input" @change="onFileChange" id="file-input" accept=".csv, .xls, .xlsx, .xlsm, .xlsb, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
            <button type="button" class="rounded bg-green-400 text-sm mr-3 h-8 w-24 text-white px-2 py-1.5" @click="displayExcelData"><i class="fa fa-file-import mr-2 text-xs"></i>Import</button>
         </div>               
    </MovableModal>
    <MovableModal v-model:visible="propModalVisible" :title="title1" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader1" @showLoader="showModalLoader1" @hideLoader="hideModalLoader1" @closeModal="closeModal">
        <DynamicForm 
            :fields="formFields2" :flex_basis="flex_basis1" :flex_basis_percentage="flex_basis_percentage1" 
            :displayButtons="displayButtons" @handleSubmit="postQuickJournal" @handleReset="handleReset1"
        >
        <template v-slot:additional-content> 
            <div class="px-3 min-h-[50px]">
                <DynamicTable :key="tableKey" :columns="journalColumns" :rows="journalRows" :actions="reconActions" :showActions="showActions" :idField="idField" @action-click="deleteReconLine"/>
            </div>
            <p class="text-red-500 font-bold">Warning: Irreversible After Saving Reconciliation!</p>
        </template>
        </DynamicForm>
    </MovableModal>
    <MovableModal v-model:visible="reconModalVisible" :title="title2" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader2" @showLoader="showModalLoader1" @hideLoader="hideModalLoader1" @closeModal="closeModal">
        <DynamicForm 
            :fields="formFields3" :flex_basis="flex_basis1" :flex_basis_percentage="flex_basis_percentage1" 
            :displayButtons="displayButtons" @handleSubmit="postReconcilingItem" @handleReset="handleReset2"
        >
        <template v-slot:additional-content> 
            <p class="text-red-500 font-bold">Warning: Irreversible After Saving Reconciliation!</p>
        </template>
        </DynamicForm>
    </MovableModal>
</template>

<script>
import axios from "axios";
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import MovableModal from '@/components/MovableModal.vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import DynamicTable from '@/components/DynamicTable.vue';

export default defineComponent({
    name: 'Bank_Reconciliation',
    components:{
        PageStyleComponent, DynamicForm, DynamicTable, MovableModal
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('none');
        const modal_loader = ref('none');
        const modal_loader1 = ref('none');
        const modal_loader2 = ref('none');
        const tableKey = ref(0);
        const mainComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const journalTotals = ref(0);
        const debitTotals = ref(0);
        const creditTotals = ref(0);
        const title = ref('Import Bank Statement');
        const title1 = ref("Add Quick Journal");
        const title2 = ref("Add Reconciling Item");
        const propModalVisible = ref(false);
        const reconModalVisible = ref(false);
        const rightsModule = ref('Accounts');
        const depModalVisible = ref(false);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('40vw');
        const ref_no_search = ref('');
        const txn_no_search = ref('');
        const description_search = ref('');
        const money_in_search = ref('');
        const money_out_search = ref('');
        const reconciled_search = ref('');
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const displayButtons = ref(true);
        const showActions = ref(true);
        const idField = ref('');
        const selectedCashbookRow = ref([]);
        const selectedBankRow = ref([]);
        const flex_basis = ref('');
        const flex_basis1 = ref('');
        const flex_basis_percentage = ref('');
        const flex_basis_percentage1 = ref('');
        const ledgerName = computed(()=> store.state.Ledgers.reconciliationLedgerName);
        const ledgerID = computed(()=> store.state.Ledgers.reconciliationLedgerID);
        const cbkRunningBalance = computed(()=> store.state.Ledgers.cbkRunningBalance);
        const cbkOpeningBalance = computed(()=> store.state.Ledgers.cbkOpeningBalance);
        const cbkDebitCount = computed(()=> store.state.Ledgers.cbkDebitCount);
        const cbkDebitTotal = computed(()=> store.state.Ledgers.cbkDebitTotal);
        const cbkCreditCount = computed(()=> store.state.Ledgers.cbkCreditCount);
        const cbkCreditTotal = computed(()=> store.state.Ledgers.cbkCreditTotal);
        const selectedReconciliation = computed(()=> store.state.Ledgers.selectedReconciliation);
        const cashbookRows = computed(() => {
            return store.state.Ledgers.cbkArray;
        });
        const filterCbkRows = computed(() => {
            return cashbookRows.value.filter(perm => {
                const txnNo = (perm.journal_no?.toLowerCase() || '').includes(txn_no_search.value.toLowerCase());
                const refNo = (perm.reference_no?.toLowerCase() || '').includes(ref_no_search.value.toLowerCase());
                const desc = (perm.description?.toLowerCase() || '').includes(description_search.value.toLowerCase());
                const parseAmount = val => Number((val || '').toString().replace(/,/g, ''));
                const moneyIn = money_in_search.value ? parseAmount(perm.formatted_debit_amount) === parseAmount(money_in_search.value): true;
                const moneyOut = money_out_search.value ? parseAmount(perm.formatted_credit_amount) === parseAmount(money_out_search.value): true;
                const reconciled = perm.reconciled.toLowerCase().includes(reconciled_search.value.toLowerCase())

                return txnNo && refNo && desc && moneyIn && moneyOut && reconciled;
            });
        });
        const bankRows = computed(()=> store.state.Ledgers.bnkArray);
        const localFile = ref(null);
        const localFilePath = ref('');
        const excelTxnsList = ref([]);

        const cashbookColumns = ref([
            {label: "Date", key:"txn_date", type: "text", minWidth:"50px",},
            {label: "Bank. Date", key:"banking_date", type: "text", minWidth:"50px"},
            {label: "Txn No", key:"journal_no", type: "text", minWidth:"50px"},
            {label: "Ref No", key:"reference_no", type: "text", minWidth:"50px"},
            // {label: "Description", key:"description", type: "text", minWidth:"500px", maxWidth: "500px"},
            {label: "Description", key:"description", type: "text"},
            {label: "Money In", key: "formatted_debit_amount", type: "number", minWidth:"50px"},
            {label: "Money Out", key: "formatted_credit_amount", type: "number", minWidth:"50px"},
            {label: "Reconciled", key: "reconciled", type: "text"},
        ]);
        const bankColumns = ref([
            {label: "Date", key:"txn_date", type: "text"},
            {label: "Ref No", key:"reference_no", type: "text"},
            {label: "Description", key:"description", type: "text", maxWidth: "500px"},
            {label: "Money Out", key: "formatted_debits", type: "number"},
            {label: "Money In", key: "formatted_credits", type: "number"},
            {label: "Matched", key: "matched", type: "text"},
        ]);
        const showTotals = ref(false);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Journal Line', rightName: "Adding Journal"},
        ])

        const deleteJournalLine = async(rowIndex, action, row) =>{
            if(row.journal_no != '-' && !row.quick_recon_txn){
                toast.error('You Cannot Delete This Line!');
            }else{
                if (row.debit_amount > 0) {
                    formFields1.value[0].value -= 1;
                    formFields1.value[0].value1 -= Number(row.debit_amount);
                    let variance = parseFloat((formFields.value[4].value || '0').toString().replace(/,/g, ''));
                    formFields.value[4].value = Number(variance - Number(row.debit_amount)).toLocaleString();
                }else if (row.credit_amount > 0) {
                    formFields1.value[1].value -= 1;
                    formFields1.value[1].value1 -= Number(row.credit_amount);
                    let variance = parseFloat((formFields.value[4].value || '0').toString().replace(/,/g, ''));
                    formFields.value[4].value = Number(variance + Number(row.credit_amount)).toLocaleString();
                }
                await store.dispatch('Ledgers/removeCbkLine', rowIndex);
            }
            
        }
        const searchJournalEntries = async() =>{
            showLoader();
            let formData = {
                posting_account: ledgerID.value,
                company: companyID.value,
                date_from: "",
                date_to: formFields.value[0].value,
                min_amount: 0,
                max_amount: 0,
                reconciled: false
            }
            await store.dispatch('Ledgers/fetchCashbookEntries',formData)
            .then(()=>{
                hideLoader();
            })
            .finally(()=>{
                updateFormFields1();
            })        
        };
        const calculateVariance = () =>{
            if(formFields.value[1].value == 0){
                formFields.value[4].value = 0;
            }else{
                let variance = formFields.value[2].value - formFields.value[1].value;
                formFields.value[4].value = Number(variance).toLocaleString();
            }
        }
        const handleReset = () =>{
            store.dispatch('Ledgers/updateState',{cashbookArray: [], cbkArray:[], bnkArray:[], cbkRunningBalance: 0, cbkDebitTotal: 0, cbkCreditTotal: 0, cbkDebitCount: 0, cbkCreditCount: 0})
            updateFormFields1();
        }
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                { type: 'date', name: 'issue_date',label: "Reconciliation Date", value: selectedReconciliation.value?.reconciliation_date ||'', required: true, method: searchJournalEntries},
                { type: 'number', name: 'journal_no',label: "Bank Statement Balance", value: selectedReconciliation.value?.statement_balance || 0, required: true, method: calculateVariance},                
                { type: 'number', name: 'journal_no',label: "Opening Bank Balance", value: selectedReconciliation.value?.opening_cashbook_balance || 0, required: false, method: calculateVariance},
                { type: 'text', name: 'journal_no',label: "(+)Cashbook Balance", value: cbkRunningBalance, required: false, disabled:true},             
                { type: 'text', name: 'journal_no',label: "Variance", value: selectedReconciliation.value?.variance ||0, required: false, disabled:true},        
            ]
        };
        const formFields1 = ref([]);
        const updateFormFields1 = () =>{
            formFields1.value = [
                { label: "Deposits Cleared", value: +(Number(selectedReconciliation?.value?.deposits_cleared_count ?? 0).toFixed(0)), value1: Number(selectedReconciliation.value?.deposits_cleared_amount) || 0, name: "deposits_cleared" },
                { label: "Withdrawals Cleared", value: +(Number(selectedReconciliation?.value?.withdrawals_cleared_count ?? 0).toFixed(0)), value1: Number(selectedReconciliation.value?.withdrawals_cleared_amount) || 0, name: "withdrawals_cleared" },
                { label: "(-)Deposits In Transit", value: cbkDebitCount, value1: cbkDebitTotal, name: "deposits_in_transit" },
                { label: "(+)Unpresented Cheques", value: cbkCreditCount, value1: cbkCreditTotal, name: "unpresented_cheques" },
                { label: "(+)Unposted Bank Deposits", value: +(Number(selectedReconciliation?.value?.unposted_deposits_count ?? 0).toFixed(0)), value1: Number(selectedReconciliation.value?.unposted_deposits_amount) || 0, name: "unposted_bank_deposits" },
                { label: "(-)Unposted Bank Withdrawals", value: +(Number(selectedReconciliation?.value?.unposted_withdrawals_count ?? 0).toFixed(0)), value1: Number(selectedReconciliation.value?.unposted_withdrawals_amount) || 0, name: "unposted_bank_withdrawals" },
                { label: "(=)Matching Bank Balance", value: 0, value1: selectedReconciliation.value?.matching_balance || 0, name: "matching_bank_balance", hidden: true },
            ]
        };

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const reconcileCashbook = async() =>{
            showLoader();           
            if(cashbookRows.value.length == 0){
                toast.error('Invalid Reconciliation!');
                hideLoader();
                return;
            }
            let status = "Incomplete";
            if(formFields.value[4].value == '0'){
                status = "Complete";
            }
            let formData = {
                company: companyID.value,
                ledger: ledgerID.value,
                ledger_id: ledgerID.value,
                reconciliation_date: formFields.value[0].value,
                statement_balance: formFields.value[1].value,
                opening_cashbook_balance: formFields.value[2].value,
                cashbook_balance: formFields.value[3].value,
                variance: formFields.value[4].value,
                deposits_cleared_count: formFields1.value[0].value,
                deposits_cleared_amount: formFields1.value[0].value1.toFixed(2),
                withdrawals_cleared_count: formFields1.value[1].value,
                withdrawals_cleared_amount: formFields1.value[1].value1.toFixed(2),
                deposits_transit_count: formFields1.value[2].value,
                deposits_transit_amount: formFields1.value[2].value1.toFixed(2),
                unpresented_cheques_count: formFields1.value[3].value,
                unpresented_cheques_amount: formFields1.value[3].value1.toFixed(2),
                unposted_deposits_count: formFields1.value[4].value,
                unposted_deposits_amount: formFields1.value[4].value1.toFixed(2),
                unposted_withdrawals_count: formFields1.value[5].value,
                unposted_withdrawals_amount: formFields1.value[5].value1.toFixed(2),
                matching_balance: formFields1.value[6].value1.toFixed(2),
                cashbook_txns: cashbookRows.value,
                bank_txns: bankRows.value,
                status: status,
                done_by: null,
                user: userID.value
            }
            
            errors.value = [];
            if(formFields.value[0].value == '' || formFields.value[4].value == ''){
                errors.value.push('Error');
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }
            else{  
                if(creditTotals.value != debitTotals.value){
                    toast.error('Debits and Credit Totals Do Not Match.');
                    hideLoader();
                }else{
                    try {
                        const response = await store.dispatch('Ledgers/createBankReconciliation', formData);
                        if (response && response.status === 201) {
                            hideLoader();
                            toast.success('Success!');
                            handleReset();
                        } else {
                            toast.error('An error occurred while creating the Reconciliation.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to create Reconciliation: ' + error.message);
                    } finally {
                        hideLoader();
                    }
                }                       
            }       
        }
        const updateReconciliation = async() =>{
            showLoader();           
            if(cashbookRows.value.length == 0){
                toast.error('Invalid Reconciliation!');
                hideLoader();
                return;
            }
            let status = "Incomplete";
            if(formFields.value[4].value == '0'){
                status = "Complete";
            }
            let formData = {
                bank_reconciliation: selectedReconciliation.value.bank_reconciliation_id,
                company: companyID.value,
                ledger: ledgerID.value,
                ledger_id: ledgerID.value,
                reconciliation_date: formFields.value[0].value,
                statement_balance: formFields.value[1].value,
                opening_cashbook_balance: formFields.value[2].value,
                cashbook_balance: formFields.value[3].value,
                variance: formFields.value[4].value,
                deposits_cleared_count: formFields1.value[0].value,
                deposits_cleared_amount: formFields1.value[0].value1,
                withdrawals_cleared_count: formFields1.value[1].value,
                withdrawals_cleared_amount: formFields1.value[1].value1,
                deposits_transit_count: formFields1.value[2].value,
                deposits_transit_amount: formFields1.value[2].value1,
                unpresented_cheques_count: formFields1.value[3].value,
                unpresented_cheques_amount: formFields1.value[3].value1,
                unposted_deposits_count: formFields1.value[4].value,
                unposted_deposits_amount: formFields1.value[4].value1,
                unposted_withdrawals_count: formFields1.value[5].value,
                unposted_withdrawals_amount: formFields1.value[5].value1,
                matching_balance: formFields1.value[6].value1,
                cashbook_txns: cashbookRows.value,
                bank_txns: bankRows.value,
                status: status,
                done_by: null,
                user: userID.value
            }
            
            errors.value = [];
            if(formFields.value[0].value == '' || formFields.value[4].value == ''){
                errors.value.push('Error');
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }
            else{  
                if(creditTotals.value != debitTotals.value){
                    toast.error('Debits and Credit Totals Do Not Match.');
                    hideLoader();
                }else{
                    try {
                        const response = await store.dispatch('Ledgers/updateBankReconciliation', formData);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Success!');
                            handleReset();
                        } else {
                            toast.error('An error occurred while updating the Reconciliation.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to update Reconciliation: ' + error.message);
                    } finally {
                        hideLoader();
                    }
                }                       
            }       
        }
        const saveReconciliation = async() =>{
            if(selectedReconciliation.value){
                await updateReconciliation();
            }else{
                await reconcileCashbook();
            }
        }

        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const showModalLoader1 = () =>{
            modal_loader1.value = "block";
        }
        const hideModalLoader1 = () =>{
            modal_loader1.value = "none";
        }
        
        const applyReconciliation = async (row, reconciledStatus = "Yes") => {
            if(formFields.value[1].value == 0){
                toast.error('Bank Statement Balance Required!');
                return;
            }
            row.reconciled = reconciledStatus;

            if (reconciledStatus === "Yes") {
                row.rowColor = 'bg-green-200';
                if (row.debit_amount > 0) {
                    formFields1.value[0].value += 1;
                    formFields1.value[0].value1 += Number(row.debit_amount);
                    let variance = parseFloat((formFields.value[4].value || '0').toString().replace(/,/g, ''));
                    formFields.value[4].value = Number(variance + Number(row.debit_amount)).toLocaleString();
                    if(row.journal_no != '-'){
                       await store.dispatch('Ledgers/updateState', { cbkDebitCount: cbkDebitCount.value - 1, cbkDebitTotal: +(cbkDebitTotal.value - Number(row.debit_amount)).toFixed(2)}); 
                    }else{
                          await store.dispatch('Ledgers/updateState', { cbkDebitCount: cbkDebitCount.value, cbkDebitTotal: +(cbkDebitTotal.value).toFixed(2)});
                    }

                }else if (row.credit_amount > 0) {
                    formFields1.value[1].value += 1;
                    formFields1.value[1].value1 += Number(row.credit_amount);
                    let variance = parseFloat((formFields.value[4].value || '0').toString().replace(/,/g, ''));
                    formFields.value[4].value = Number(variance - Number(row.credit_amount)).toLocaleString();
                    if(row.journal_no != '-'){
                        await store.dispatch('Ledgers/updateState', { cbkCreditCount: cbkCreditCount.value - 1, cbkCreditTotal: +(cbkCreditTotal.value - Number(row.credit_amount)).toFixed(2)});
                    }else{
                        await store.dispatch('Ledgers/updateState', { cbkCreditCount: cbkCreditCount.value, cbkCreditTotal: +(cbkCreditTotal.value).toFixed(2)});
                    }
                }
            } else {
                row.rowColor = 'bg-orange-50';
                if (row.debit_amount > 0) {
                    formFields1.value[0].value -= 1;
                    formFields1.value[0].value1 -= Number(row.debit_amount);
                    let variance = parseFloat((formFields.value[4].value || '0').toString().replace(/,/g, ''));
                    formFields.value[4].value = Number(variance - Number(row.debit_amount)).toLocaleString();
                    if(row.journal_no != '-'){
                        await store.dispatch('Ledgers/updateState', { cbkDebitCount: cbkDebitCount.value + 1, cbkDebitTotal: +(cbkDebitTotal.value + Number(row.debit_amount)).toFixed(2)});
                    }else{
                        await store.dispatch('Ledgers/updateState', { cbkDebitCount: cbkDebitCount.value, cbkDebitTotal: +(cbkDebitTotal.value).toFixed(2)});
                    }
                }else if (row.credit_amount > 0) {
                    formFields1.value[1].value -= 1;
                    formFields1.value[1].value1 -= Number(row.credit_amount);
                    let variance = parseFloat((formFields.value[4].value || '0').toString().replace(/,/g, ''));
                    formFields.value[4].value = Number(variance + Number(row.credit_amount)).toLocaleString();
                    if(row.journal_no != '-'){
                        await store.dispatch('Ledgers/updateState', { cbkCreditCount: cbkCreditCount.value + 1, cbkCreditTotal: +(cbkCreditTotal.value + Number(row.credit_amount)).toFixed(2)});
                    }else{
                        await store.dispatch('Ledgers/updateState', { cbkCreditCount: cbkCreditCount.value, cbkCreditTotal: +(cbkCreditTotal.value).toFixed(2)});   
                    }
                }
            }
            let cbkBalance = parseFloat((formFields.value[3].value || '0').toString().replace(/,/g, ''));
            formFields1.value[6].value1 = cbkBalance - formFields1.value[2].value1 + formFields1.value[3].value1 + formFields1.value[4].value1 - formFields1.value[5].value1;
        };
        const markAsReconciled = async (row) => {
            if (row.reconciled === "Yes") {
                await applyReconciliation(row, "Yes");
            } else {
                await applyReconciliation(row, "No");
            }
        };
        const markAllAsReconciled = async () => {
            showLoader();
            for (const row of cashbookRows.value) {
                if (row.reconciled === "No") {
                    await applyReconciliation(row, "Yes");
                }
            }
            hideLoader();
        };
        const unmarkAllAsReconciled = async () => {
            showLoader();
            for (const row of cashbookRows.value) {
                if (row.reconciled === "Yes") {
                    await applyReconciliation(row, "No");
                }
            }
            hideLoader();
        };
        const markAsMatched = async (row) => {
            if (row.matched === "Yes") {
                row.matched = "No";
                row.reversed = "No";
            } else {
                row.matched = "Yes";
                row.reversed = "Yes";
            }
        };
        const downloadTemplate = () =>{
            showLoader();
            let formData = {
                
            } 
            axios
            .post("api/v1/download-bank-statement-import-excel/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Bank Statement Import.xls');
                        document.body.appendChild(link);
                        link.click();
                    }
                })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        const importBankStatement = () =>{
            depModalVisible.value = true;
            localFile.value = '';
            excelTxnsList.value = [];
            localFilePath.value = '';
        }
        const onFileChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                localFile.value = file;
                localFilePath.value = "C:\\fakepath\\" + file.name;
            }
        };
        const displayExcelData = () =>{
            showModalLoader();
            if(localFile.value == ""){
                toast.error("No File Selected")
                hideModalLoader();
            }else{
                let formData = new FormData()
                formData.append("bank_statement_excel", localFile.value) 
                formData.append("company", companyID.value)

                axios.post("api/v1/display-bank-statement-import-excel/", formData)
                .then((response)=>{
                    excelTxnsList.value = response.data.transactions;
                    if(response.data.transactions){
                        depModalVisible.value = false;
                        store.dispatch('Ledgers/updateState', { bnkArray: response.data.transactions });
                        bankRows.value = response.data.transactions;
                    }
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideModalLoader();
                })
            }
        };
        const matchedTransactions = ref([]);

        const matchTransactions = async() => {
            showLoader();
            matchedTransactions.value = [];
            if(!bankRows.value.length || !cashbookRows.value.length) {
                toast.error("No transactions to match.");
                hideLoader();
                return;
            }
            for (const bankTxn of bankRows.value) {
                const match = cashbookRows.value.find(cashTxn => {
                    const sameDate = bankTxn.txn_date === cashTxn.txn_date;
                    const sameCredit = bankTxn.credits === cashTxn.debit_amount;
                    const sameDebit = bankTxn.debits === cashTxn.credit_amount;
                    return sameDate && sameCredit && sameDebit;
                });
                if (match) {
                    bankTxn.matched = "Yes";
                    bankTxn.reversed = "Yes";
                    await applyReconciliation(match, "Yes"); 
                    matchedTransactions.value.push({
                        bankTxn,
                        cashTxn: match
                    });
                } else {
                    bankTxn.matched = "No";
                    bankTxn.reversed = "No";
                }
            }
            hideLoader();
        };
        const addQuickJournal = () =>{
            if(formFields.value[1].value == 0){
                toast.error('Bank Balance Required!')
                return;
            }
            handleReset1();
            propModalVisible.value = true;
            reconModalVisible.value = false;
            ledComponentKey.value += 1;
        };
        const addReconcilingItem = () =>{
            if(formFields.value[1].value == 0){
                toast.error('Bank Balance Required!')
                return;
            }
            handleReset2();
            reconModalVisible.value = true;
            propModalVisible.value = false;
        };
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const fetchLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedgerRecon', option)
            ledComponentKey.value += 1;
        };
        const clearSelectedLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
        }
        const formFields2 = ref([]);
        const updateFormFields2 = () => {
            formFields2.value = [
                { type: 'date', name: 'issue_date',label: "Recording Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
                { type: 'dropdown', name: 'txn_type',label: "Type", value: '', placeholder: "", required: true, options: [{ text: 'Direct Deposit', value: 'Deposit' }, { text: 'Direct Withdrawal', value: 'Withdrawal' }] },
                { type: 'text', name: 'ref_no',label: "Reference No", value: '', required: false },
                { type: 'number', name: 'total_amount',label: "Control Amount", value: 0, required: true,},
                {type:'text-area', label:"Memo", value: "", textarea_rows: '2', textarea_cols: '50', required: true},
                {
                    type:'search-dropdown', label:"Posting A/c", value: "", componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Posting A/c...', dropdownWidth: '300px', updateValue: "",
                    fetchData: fetchLedgers(), clearSearch: clearSelectedLedger()  
                },
            ];
        };
        const formFields3 = ref([]);
        const updateFormFields3 = () => {
            formFields3.value = [
                { type: 'date', name: 'issue_date',label: "Recording Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
                { type: 'dropdown', name: 'txn_type',label: "Type", value: '', placeholder: "", required: true, options: [{ text: 'Direct Deposit', value: 'Deposit' }, { text: 'Direct Withdrawal', value: 'Withdrawal' }] },
                { type: 'text', name: 'ref_no',label: "Reference No", value: '', required: true },
                { type: 'number', name: 'total_amount',label: "Amount", value: 0, required: true,},
                {type:'text-area', label:"Memo", value: "", textarea_rows: '2', textarea_cols: '50', required: true},
                
            ];
        };
        const handleReset1 = () =>{
            updateFormFields2();
            store.dispatch('Ledgers/updateState', { reconItemsArray: []});
        }
        const handleReset2 = () =>{
            updateFormFields3();
        }
        const journalRows = computed(() => store.state.Ledgers.reconItemsArray);
        const journalColumns = ref([
            {label: "Account", key:"posting_account", type: "text", editable: false},
            {label: "Description", key:"description", type: "text", editable: true},
            {label: "Amount", key: "total_amount", type: "text", editable: true},
        ]);
        const reconActions = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Recon. Item', rightName: "Accounts Reconciliation"},
        ])
        const postQuickJournal = async() =>{
            showModalLoader1();
            if(journalRows.value.length <=0){
                toast.error("Please Select Posting A/c")
                hideModalLoader1();
                return;
            }else{
                let totalAmount = 0;
                for(let i=0; i<journalRows.value.length; i++){
                    totalAmount += Number(journalRows.value[i].total_amount);
                }
                if(totalAmount != formFields2.value[3].value){
                    toast.error("Line Total Amount Must Be Equal To Control Amount")
                    hideModalLoader1();
                    return;
                }
                if(formFields2.value[1].value == 'Deposit'){
                    let obj1 = {
                        "txn_date": formFields2.value[0].value,
                        "txn_type": "Deposit",
                        "banking_date": formFields2.value[0].value,
                        "journal_no": "-",
                        "journal_entry_id": null,
                        "reference_no": formFields2.value[2].value,
                        "description": formFields2.value[4].value,
                        "formatted_debit_amount": Number(formFields2.value[3].value).toLocaleString(),
                        "formatted_credit_amount": 0,
                        "debit_amount": formFields2.value[3].value,
                        "total_amount": formFields2.value[3].value,
                        "credit_amount": 0,
                        "reconciled": "Yes",
                        "journal_txns": journalRows.value,
                        "quick_recon_txn": true,
                    }
                    await store.dispatch('Ledgers/addQuickReconJournal', obj1);  
                    markAsReconciled(obj1) 
                }else{
                    let obj2 = {
                        "txn_date": formFields2.value[0].value,
                        "txn_type": "Withdrawal",
                        "banking_date": formFields2.value[0].value,
                        "journal_no": "-",
                        "journal_entry_id": null,
                        "reference_no": formFields2.value[2].value,
                        "description": formFields2.value[4].value,
                        "debit_amount": 0,
                        "credit_amount": formFields2.value[3].value,
                        "total_amount": formFields2.value[3].value,
                        "formatted_debit_amount": 0,
                        "formatted_credit_amount": Number(formFields2.value[3].value).toLocaleString(),
                        "reconciled": "Yes",
                        "journal_txns": journalRows.value,
                        "quick_recon_txn": true,
                    } 
                    await store.dispatch('Ledgers/addQuickReconJournal', obj2);  
                    markAsReconciled(obj2) 
                }
               hideModalLoader1();  
               propModalVisible.value = false;
            }
        };
        const deleteReconLine = async(rowIndex, action, row) =>{
            markAsReconciled(row);
            await store.dispatch('Ledgers/removeReconLine', rowIndex);
        };
        const postReconcilingItem = async() =>{
            showModalLoader1();
            if(formFields3.value[1].value == 'Deposit'){
                let obj1 = {
                    "txn_date": formFields3.value[0].value,
                    "txn_type": "Deposit",
                    "journal_no": "-",
                    "reference_no": formFields3.value[2].value,
                    "description": formFields3.value[4].value,
                    "formatted_debit_amount": Number(formFields3.value[3].value).toLocaleString(),
                    "formatted_credit_amount": 0,
                    "debit_amount": formFields3.value[3].value,
                    "total_amount": formFields3.value[3].value,
                    "credit_amount": 0,
                    "reconciled": "Yes",
                    "reconciling_item": true,
                    "reconciling_item_id": null,
                    "quick_recon_txn": true,
                }
                await store.dispatch('Ledgers/addQuickReconJournal', obj1);
                markAsReconciled(obj1) 
            }else{
                let obj2 = {
                    "txn_date": formFields3.value[0].value,
                    "txn_type": "Withdrawal",
                    "journal_no": "-",
                    "reference_no": formFields3.value[2].value,
                    "description": formFields3.value[4].value,
                    "debit_amount": 0,
                    "credit_amount": formFields3.value[3].value,
                    "total_amount": formFields3.value[3].value,
                    "formatted_debit_amount": 0,
                    "formatted_credit_amount": Number(formFields3.value[3].value).toLocaleString(),
                    "reconciled": "Yes",
                    "reconciling_item": true,
                    "reconciling_item_id": null,
                    "quick_recon_txn": true,
                } 
                await store.dispatch('Ledgers/addQuickReconJournal', obj2); 
                markAsReconciled(obj2) 
            }
           hideModalLoader1();  
           reconModalVisible.value = false;
        };
        watch([selectedReconciliation, cbkOpeningBalance], () => {
            if (selectedReconciliation.value) {
                updateFormFields();
                updateFormFields1();
            }
            if(cbkOpeningBalance.value){
                formFields.value[2].value = store.state.Ledgers.cbkOpeningBalance;
            }
            
        }, { immediate: true });

        onBeforeMount(()=>{ 
            store.dispatch('Ledgers/updateState', { journalItemsArray: [], reconItemsArray: []})
            updateFormFields();
            updateFormFields1();
            ledComponentKey.value += 1;
            flex_basis.value = '1/6';
            flex_basis_percentage.value = '25';
            flex_basis1.value = '1/3';
            flex_basis_percentage.value = '33.33';
        })
        onMounted(()=>{
            store.dispatch('Ledgers/updateState', { journalItemsArray: []})
        })

        return{
            formFields, formFields1, flex_basis, flex_basis1, flex_basis_percentage,flex_basis_percentage1, displayButtons, saveReconciliation, mainComponentKey,showTotals,ledgerName,
            handleReset, loader, showLoader, hideLoader, tableKey, cashbookColumns, cashbookRows,filterCbkRows, showActions, actions, deleteJournalLine, idField,
            depModalVisible,title, modal_loader, modal_left, modal_top, modal_width, showModalLoader, hideModalLoader,rightsModule,bankColumns,bankRows,
            markAsReconciled,downloadTemplate,importBankStatement,onFileChange,displayExcelData,localFilePath,
            matchedTransactions,matchTransactions,markAllAsReconciled,unmarkAllAsReconciled,markAsMatched,addQuickJournal,
            propModalVisible,title1,modal_loader1,showModalLoader1,hideModalLoader1,formFields2,postQuickJournal,journalRows,journalColumns,deleteReconLine,reconActions,
            modal_loader2, reconModalVisible, title2, formFields3, postReconcilingItem, addReconcilingItem, handleReset1, handleReset2,
            txn_no_search, ref_no_search, description_search, money_in_search, money_out_search, reconciled_search,

        }
    }
})
</script>