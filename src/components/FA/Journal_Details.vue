<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="createJournal" @handleReset="handleReset"> 
                    <template v-slot:additional-content>                    
                        <div class="px-3 min-h-[280px]">
                            <DynamicTable :key="tableKey" :showTotals="showTotals" :columns="invoiceColumns" :rows="invoiceRows" :showActions="showActions" :idField="idField" :actions="actions" @action-click="deleteJournalLine"/>
                        </div>
                    </template>
                </DynamicForm>
            </div>
        </template>
    </PageStyleComponent>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import MovableModal from '@/components/MovableModal.vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import DynamicTable from '@/components/DynamicTable.vue';

export default defineComponent({
    name: 'Journal_Details',
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
        const title = ref('Add Prepayment');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const displayButtons = ref(true);
        const showActions = ref(true);
        const idField = ref('');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const ledgerID = ref('');
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const invoiceRows = computed(() => {
            return store.state.Ledgers.journalItemsArray;
        });

        const invoiceColumns = ref([
            {label: "Posting Account", key:"posting_account", type: "text", editable: false},
            {label: "Journal Description", key:"description", type: "text", editable: true, minWidth:"700px", maxWidth:"700px"},
            {label: "Debits", key: "debit_amount", type: "number", editable: true, maxWidth:"20px"},
            {label: "Credits", key: "credit_amount", type: "number", editable: true, maxWidth:"20px"},
        ]);
        const showTotals = ref(true);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Journal Line'},
        ])

        const deleteJournalLine = (rowIndex, action, row) =>{
            store.dispatch('Ledgers/removeJournalLine', rowIndex);
        }

        const fetchLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleJournalLedger', option)
            ledgerID.value = store.state.Ledgers.ledgerID;
            ledComponentKey.value += 1;
        };
        const clearSelectedLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            ledgerID.value = ""
        }

        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                { type: 'text', name: 'journal_no',label: "Journal No", value: '', required: false}, 
                { type: 'date', name: 'issue_date',label: "Date", value: formatDate(current_date), required: true},
                {
                    type:'search-dropdown', label:"Posting Account", value: ledgerID.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Posting Account...', dropdownWidth: '300px', updateValue: "",
                    fetchData: fetchLedgers(), clearSearch: clearSelectedLedger()  
                },  
                {type:'text-area', label:"Memo", value: "", textarea_rows: '2', textarea_cols: '40', required: true},
                
            ]
        };

        const handleReset = () =>{
            store.dispatch('Journals/updateState', {})
            store.dispatch('Ledgers/updateState', { journalItemsArray: []})
            mainComponentKey.value += 1;
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].type == 'number'){
                    formFields.value[i].value = 0;
                }else{
                    formFields.value[i].value = '';
                }
                
            }
            ledgerID.value = '';
            ledComponentKey.value += 1;
            journalTotals.value = 0;
        }

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createJournal = async() =>{
            showLoader();
            journalEntryArr.value = [];
            journalTotals.value = 0;
            creditTotals.value = 0;
            debitTotals.value = 0;
            
            for(let i=0; i<invoiceRows.value.length; i++){
                debitTotals.value += Number(invoiceRows.value[i].debit_amount);
                creditTotals.value += Number(invoiceRows.value[i].credit_amount);
                journalTotals.value += Number(invoiceRows.value[i].credit_amount);

                let jnlEntry = {
                    "date": formFields.value[1].value,
                    "description": invoiceRows.value[i].description,
                    "txn_type": "JNL",
                    "posting_account": invoiceRows.value[i].ledger_id,
                    "debit_amount": invoiceRows.value[i].debit_amount,
                    "credit_amount": invoiceRows.value[i].credit_amount,
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
                        const response = await store.dispatch('Journals/createJournal', formData);
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

        onBeforeMount(()=>{ 
            store.dispatch('Ledgers/updateState', { journalItemsArray: []})
            updateFormFields();
            ledComponentKey.value += 1;
            flex_basis.value = '1/5';
            flex_basis_percentage.value = '20';
        })
        onMounted(()=>{
            store.dispatch('Ledgers/updateState', { journalItemsArray: []})
        })

        return{
            formFields, flex_basis, flex_basis_percentage, displayButtons, createJournal, mainComponentKey,showTotals,
            handleReset, loader, showLoader, hideLoader, tableKey, invoiceColumns, invoiceRows, showActions, actions, deleteJournalLine, idField,
            title, modal_loader, modal_left, modal_top, modal_width, showModalLoader, hideModalLoader,
        }
    }
})
</script>