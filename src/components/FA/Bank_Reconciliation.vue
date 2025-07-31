<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <h1 class="font-bold text-red-600 uppercase">{{ ledgerName }} Reconciliation</h1>
                <DynamicForm :saveButtonLabel="Reconcile"  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="reconcileCashbook" @handleReset="handleReset"> 
                    <template v-slot:additional-content> 
                        <div class="flex flex-wrap gap-x-1 gap-y-1 text-xs">
                            <div v-for="(field, index) in formFields1" :key="index" class="flex items-center gap-x-1">
                                <label class="font-medium whitespace-nowrap w-[200px]" for="">{{ field.label }} : <em class="text-red-600">*</em></label>
                                <input disabled=true :hidden="field.hidden" v-model="field.value" :name="field.name" type="number" pattern="^\d+(\.\d{0,2})?$" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\.\d{2})\d+/g, '$1')" :class="[`bg-slate-50 rounded pl-3 border border-gray-400 text-sm w-16`]"/>
                                <input disabled=true v-model="field.value1" :name="field.name" type="number" pattern="^\d+(\.\d{0,2})?$" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\.\d{2})\d+/g, '$1')" :class="[`bg-slate-50 rounded pl-3 border border-gray-400 text-sm w-36`]"/>
                            </div>
                        </div>
                        <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[300px]">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Cashbook Entries</h1>  
                            <div class="mt-1 max-h-[260px] overflow-y-auto">  
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
                                <DynamicTable :key="tableKey" :showTotals="showTotals" :columns="cashbookColumns" :rows="cashbookRows" :showActions="showActions" :actions="actions" :rightsModule="rightsModule" @row-db-click="markAsReconciled"  @action-click="deleteJournalLine"/>
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
        const tableKey = ref(0);
        const mainComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const journalTotals = ref(0);
        const debitTotals = ref(0);
        const creditTotals = ref(0);
        const journalEntryArr = ref([]);
        const title = ref('Import Bank Statement');
        const rightsModule = ref('Accounts');
        const depModalVisible = ref(false);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('40vw');
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const displayButtons = ref(true);
        const showActions = ref(true);
        const idField = ref('');
        const selectedCashbookRow = ref([]);
        const selectedBankRow = ref([]);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const ledgerName = computed(()=> store.state.Ledgers.reconciliationLedgerName);
        const ledgerID = computed(()=> store.state.Ledgers.reconciliationLedgerID);
        const cbkRunningBalance = computed(()=> store.state.Ledgers.cbkRunningBalance);
        const cbkDebitCount = computed(()=> store.state.Ledgers.cbkDebitCount);
        const cbkDebitTotal = computed(()=> store.state.Ledgers.cbkDebitTotal);
        const cbkCreditCount = computed(()=> store.state.Ledgers.cbkCreditCount);
        const cbkCreditTotal = computed(()=> store.state.Ledgers.cbkCreditTotal);
        const cashbookRows = computed(() => {
            return store.state.Ledgers.cbkArray;
        });
        const bankRows = computed(()=> store.state.Ledgers.bnkArray);
        const localFile = ref(null);
        const localFilePath = ref('');
        const excelTxnsList = ref([]);

        const cashbookColumns = ref([
            {label: "Date", key:"txn_date", type: "text"},
            {label: "Bank. Date", key:"banking_date", type: "text"},
            {label: "Txn No", key:"journal_no", type: "text"},
            {label: "Ref No", key:"reference_no", type: "text"},
            {label: "Description", key:"description", type: "text", minWidth:"500px", maxWidth: "500px"},
            {label: "Money In", key: "formatted_debit_amount", type: "number"},
            {label: "Money Out", key: "formatted_credit_amount", type: "number"},
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

        const deleteJournalLine = (rowIndex, action, row) =>{
            store.dispatch('Ledgers/removeJournalLine', rowIndex);
        }
        const searchJournalEntries = async() =>{
            if(formFields.value[0].value == 0){
                toast.error('Bank Balance Required!')
                formFields.value[1].value = '';
            }else{
                showLoader();
                let formData = {
                    posting_account: ledgerID.value,
                    company: companyID.value,
                    date_from: "",
                    date_to: formFields.value[1].value,
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
            }

        };
        const calculateVariance = () =>{
            if(formFields.value[0].value == 0){
                formFields.value[3].value = 0;
            }else{
                let variance = formFields1.value[6].value1 - formFields.value[0].value;
                formFields.value[3].value = Number(variance).toLocaleString();
            }
        }
        const handleReset = () =>{
            store.dispatch('Ledgers/updateState',{cashbookArray: [], cbkArray:[], bnkArray:[], cbkRunningBalance: 0, cbkDebitTotal: 0, cbkCreditTotal: 0, cbkDebitCount: 0, cbkCreditCount: 0})
            updateFormFields1();
        }
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                { type: 'number', name: 'journal_no',label: "Bank Statement Balance", value: 0, required: true, method: calculateVariance},
                { type: 'date', name: 'issue_date',label: "Reconciliation Date", value: '', required: true, method: searchJournalEntries},
                { type: 'text', name: 'journal_no',label: "(+)Cashbook Balance", value: cbkRunningBalance, required: false, disabled:true},             
                { type: 'text', name: 'journal_no',label: "Variance", value: 0, required: true, disabled:true},        
            ]
        };
        const formFields1 = ref([]);
        const updateFormFields1 = () =>{
            formFields1.value = [
                { label: "Deposits Cleared", value: 0, value1: 0, name: "deposits_cleared" },
                { label: "Withdrawals Cleared", value: 0, value1: 0, name: "withdrawals_cleared" },
                { label: "(-)Deposits In Transit", value: cbkDebitCount, value1: cbkDebitTotal, name: "deposits_in_transit" },
                { label: "(+)Unpresented Cheques", value: cbkCreditCount, value1: cbkCreditTotal, name: "unpresented_cheques" },
                { label: "(+)Unposted Bank Deposits", value: 0, value1: 0, name: "unposted_bank_deposits" },
                { label: "(-)Unposted Bank Withdrawals", value: 0, value1: 0, name: "unposted_bank_withdrawals" },
                { label: "(=)Matching Bank Balance", value: 0, value1: 0, name: "matching_bank_balance", hidden: true },
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
            journalEntryArr.value = [];
            journalTotals.value = 0;
            creditTotals.value = 0;
            debitTotals.value = 0;
            
            for(let i=0; i<cashbookRows.value.length; i++){
                debitTotals.value += Number(cashbookRows.value[i].debit_amount);
                creditTotals.value += Number(cashbookRows.value[i].credit_amount);
                journalTotals.value += Number(cashbookRows.value[i].credit_amount);

                let jnlEntry = {
                    "date": formFields.value[1].value,
                    "description": cashbookRows.value[i].description,
                    "txn_type": "JNL",
                    "posting_account": cashbookRows.value[i].ledger_id,
                    "debit_amount": cashbookRows.value[i].debit_amount,
                    "credit_amount": cashbookRows.value[i].credit_amount,
                }
                journalEntryArr.value.push(jnlEntry)
            }

            let formData = {
                company: companyID.value,
                description: formFields.value[3].value,
                txn_type: "JNL",
                issue_date: formFields.value[1].value,
                total_amount: journalTotals.value,
                journal_entry_array: journalEntryArr.value,
                user: userID.value
            }
            
            errors.value = [];
            if(formFields.value[1].value == '' || formFields.value[3].value == ''){
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
                        const response = await store.dispatch('Journals/reconcileCashbook', formData);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Journal created successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                            ledComponentKey.value += 1;
                            store.dispatch('Ledgers/updateState', { journalItemsArray: []})
                        } else {
                            toast.error('An error occurred while creating the Journal.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to create Journal: ' + error.message);
                    } finally {
                        hideLoader();
                    }
                }                       
            }       
        }

        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        
        const applyReconciliation = async (row, reconciledStatus = "Yes") => {
            row.reconciled = reconciledStatus;

            if (reconciledStatus === "Yes") {
                row.rowColor = 'bg-green-200';
                if (row.debit_amount > 0) {
                    formFields1.value[0].value += 1;
                    formFields1.value[0].value1 += Number(row.debit_amount);
                    let variance = parseFloat((formFields.value[3].value || '0').toString().replace(/,/g, ''));
                    formFields.value[3].value = Number(variance + Number(row.debit_amount)).toLocaleString();
                    await store.dispatch('Ledgers/updateState', { cbkDebitCount: cbkDebitCount.value - 1, cbkDebitTotal: +(cbkDebitTotal.value - Number(row.debit_amount)).toFixed(2)});

                }else if (row.credit_amount > 0) {
                    formFields1.value[1].value += 1;
                    formFields1.value[1].value1 += Number(row.credit_amount);
                    let variance = parseFloat((formFields.value[3].value || '0').toString().replace(/,/g, ''));
                    formFields.value[3].value = Number(variance - Number(row.credit_amount)).toLocaleString();
                    await store.dispatch('Ledgers/updateState', { cbkCreditCount: cbkCreditCount.value - 1, cbkCreditTotal: +(cbkCreditTotal.value - Number(row.credit_amount)).toFixed(2)});
                }
            } else {
                row.rowColor = 'bg-orange-50';
                if (row.debit_amount > 0) {
                    formFields1.value[0].value -= 1;
                    formFields1.value[0].value1 -= Number(row.debit_amount);
                    let variance = parseFloat((formFields.value[3].value || '0').toString().replace(/,/g, ''));
                    formFields.value[3].value = Number(variance - Number(row.debit_amount)).toLocaleString();
                    await store.dispatch('Ledgers/updateState', { cbkDebitCount: cbkDebitCount.value + 1, cbkDebitTotal: +(cbkDebitTotal.value + Number(row.debit_amount)).toFixed(2)});
                }else if (row.credit_amount > 0) {
                    formFields1.value[1].value -= 1;
                    formFields1.value[1].value1 -= Number(row.credit_amount);
                    let variance = parseFloat((formFields.value[3].value || '0').toString().replace(/,/g, ''));
                    formFields.value[3].value = Number(variance + Number(row.credit_amount)).toLocaleString();
                    await store.dispatch('Ledgers/updateState', { cbkCreditCount: cbkCreditCount.value + 1, cbkCreditTotal: +(cbkCreditTotal.value + Number(row.credit_amount)).toFixed(2)});
                }
            }
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

        onBeforeMount(()=>{ 
            store.dispatch('Ledgers/updateState', { journalItemsArray: []})
            updateFormFields();
            updateFormFields1();
            ledComponentKey.value += 1;
            flex_basis.value = '1/6';
            flex_basis_percentage.value = '25';
        })
        onMounted(()=>{
            store.dispatch('Ledgers/updateState', { journalItemsArray: []})
        })

        return{
            formFields, formFields1, flex_basis, flex_basis_percentage, displayButtons, reconcileCashbook, mainComponentKey,showTotals,ledgerName,
            handleReset, loader, showLoader, hideLoader, tableKey, cashbookColumns, cashbookRows, showActions, actions, deleteJournalLine, idField,
            depModalVisible,title, modal_loader, modal_left, modal_top, modal_width, showModalLoader, hideModalLoader,rightsModule,bankColumns,bankRows,
            markAsReconciled,downloadTemplate,importBankStatement,onFileChange,displayExcelData,localFilePath,
            matchedTransactions,matchTransactions,markAllAsReconciled,unmarkAllAsReconciled,markAsMatched
        }
    }
})
</script>