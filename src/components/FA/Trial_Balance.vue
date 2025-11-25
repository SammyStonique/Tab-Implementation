<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            :showAddButton="showAddButton"
            @handleAddNew=""
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchTrialBalance"
            @resetFilters="resetFilters"
            @printList="printTrialBalance"
            v-model:printModalVisible="printModalVisible"
            :printTitle="printTitle"
            :pdfUrl="pdfUrl"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="trialBalanceList"
            :actions="actions"
            :idField="idField"
            :showTotals="showTotals"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
        />
        <MovableModal v-model:visible="invModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
        >
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="saveJournal" @handleReset="handleReset"
            />
        </MovableModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue';
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import PrintJS from 'print-js';

export default{
    name: 'Trial_Balance',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const { getYear } = useDateFormatter();
        const { getMonth } = useDateFormatter();
        const loader = ref('none');
        const modal_loader = ref('none');
        const rightsModule = ref('Accounts');
        const idField = 'ledger_id';
        const addButtonLabel = ref('');
        const showAddButton = ref(false);
        const submitButtonLabel = ref('Add');
        const title = ref('Invoice Booking');
        const invModalVisible = ref(false);
        const printModalVisible = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Trial Balance');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const selectedIds = ref([]);
        const transactionsList = ref([]);
        const propModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const currentPage = ref(1);
        const patient_ledger_totals = ref(0);
        const customer_ledger_totals = ref(0);
        const vendor_ledger_totals = ref(0);
        const tenant_ledger_totals = ref(0);
        const member_ledger_totals = ref(0);
        const loan_ledger_totals = ref(0);
        const saving_ledger_totals = ref(0);
        const share_ledger_totals = ref(0);
        const patientLedger = ref('');
        const vendorLedger = ref('');
        const customerLedger = ref('');
        const tenantLedger = ref('');
        const memberLedger = ref('');
        const loanLedger = ref('');
        const savingLedger = ref('');
        const shareLedger = ref('');
        const merge_patients_setting = ref('No');
        const merge_vendors_setting = ref('No');
        const merge_debtors_setting = ref('No');
        const merge_tenants_setting = ref('No');
        const merge_members_setting = ref('Yes');
        const merge_loans_setting = ref('Yes');
        const merge_savings_setting = ref('Yes');
        const merge_shares_setting = ref('Yes');
        const trialBalanceList = ref([]);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Type", key:"ledger_type", txtColor: "txtColor"},
            {label: "Code", key: "ledger_code"},
            {label: "Account Name", key:"ledger_name"},
            {label: "Debits", key:"debits", type: "number"},
            {label: "Credits", key:"credits", type: "number"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Ledger Details', rightName: 'View Ledger Statement'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const defaultSettings = computed(()=> store.state.userData.defaultSettings);
        const from_date_search = ref("");
        const to_date_search = ref("");
        const ledger_code_search = ref("");
        const ledger_name_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Code...", value: ledger_code_search, width:36, title: ""},
            {type:'text', placeholder:"Name...", value: ledger_name_search, width:56, title: ""},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
        ]);
        const fetchDefaultSettings = async() =>{
            // await store.dispatch('Default_Settings/fetchDefaultSettings', {company:companyID.value})
            for(let i=0; i < defaultSettings.value.length; i++){
                if(defaultSettings.value[i].setting_name === 'Merge Patients Ledgers in Reports'){
                    merge_patients_setting.value = defaultSettings.value[i].setting_value_name;
                }else if(defaultSettings.value[i].setting_name === 'Merge Debtors Ledgers in Reports'){
                    merge_debtors_setting.value = defaultSettings.value[i].setting_value_name;
                }else if(defaultSettings.value[i].setting_name === 'Merge Vendors Ledgers in Reports'){
                    merge_vendors_setting.value = defaultSettings.value[i].setting_value_name;
                }else if(defaultSettings.value[i].setting_name === 'Merge Tenants Ledgers in Reports'){
                    merge_tenants_setting.value = defaultSettings.value[i].setting_value_name;
                }else if(defaultSettings.value[i].setting_name === 'Merge Loans Ledgers in Reports'){
                    merge_loans_setting.value = defaultSettings.value[i].setting_value_name;
                }else if(defaultSettings.value[i].setting_name === 'Merge Savings Ledgers in Reports'){
                    merge_savings_setting.value = defaultSettings.value[i].setting_value_name;
                }else if(defaultSettings.value[i].setting_name === 'Merge Shares Ledgers in Reports'){
                    merge_shares_setting.value = defaultSettings.value[i].setting_value_name;
                }
            }
        };
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [

            ]
        };

        const handleReset = async() =>{
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
        const searchTrialBalance = () =>{
            showLoader();
            patient_ledger_totals.value = 0;
            customer_ledger_totals.value = 0;
            tenant_ledger_totals.value = 0;
            vendor_ledger_totals.value = 0;
            member_ledger_totals.value = 0;
            loan_ledger_totals.value = 0;
            saving_ledger_totals.value = 0;
            share_ledger_totals.value = 0;
            trialBalanceList.value = [];

            let formData = {
                ledger_code: ledger_code_search.value,
                ledger_name: ledger_name_search.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                company_id: companyID.value
            }

            axios
            .post(`api/v1/trial-balance-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                trialBalanceList.value = response.data.results;
                
                if(trialBalanceList.value.length){
                    for(let i=trialBalanceList.value.length - 1; i >= 0; i--){
                        if(trialBalanceList.value[i].ledger_category === "Patients" && merge_patients_setting.value === 'Yes'){
                            if(trialBalanceList.value[i].debits !='-'){
                                let debits = parseFloat(trialBalanceList.value[i].debits.replace(/,/g, ''))
                                patient_ledger_totals.value += debits;
                                patientLedger.value = "debit";
                                
                            }else if(trialBalanceList.value[i].credits !='-'){
                                let credits = parseFloat(trialBalanceList.value[i].credits.replace(/,/g, ''))
                                patient_ledger_totals.value -= credits;
                                patientLedger.value  = "credit";
                            }
                            trialBalanceList.value.splice(i, 1);
                        }else if(trialBalanceList.value[i].ledger_category === "Vendors" && merge_vendors_setting.value === 'Yes'){
                            if(trialBalanceList.value[i].debits !='-'){
                                let debits = parseFloat(trialBalanceList.value[i].debits.replace(/,/g, ''))
                                vendor_ledger_totals.value += debits;
                                vendorLedger.value = 'debit';
                            }else if(trialBalanceList.value[i].credits !='-'){
                                let credits = parseFloat(trialBalanceList.value[i].credits.replace(/,/g, ''))
                                vendor_ledger_totals.value -= credits;
                                vendorLedger.value  = 'credit';
                            }
                            trialBalanceList.value.splice(i, 1);
                        }else if(trialBalanceList.value[i].ledger_category === "Debtors" && merge_debtors_setting.value === 'Yes'){
                            if(trialBalanceList.value[i].debits !='-'){
                                let debits = parseFloat(trialBalanceList.value[i].debits.replace(/,/g, ''))
                                customer_ledger_totals.value += debits;
                                customerLedger.value = 'debit';
                            }else if(trialBalanceList.value[i].credits !='-'){
                                let credits = parseFloat(trialBalanceList.value[i].credits.replace(/,/g, ''))
                                customer_ledger_totals.value -= credits;
                                customerLedger.value = 'credit';
                            }
                            trialBalanceList.value.splice(i, 1);
                        }else if(trialBalanceList.value[i].ledger_category === "Tenants" && merge_tenants_setting.value === 'Yes'){
                            if(trialBalanceList.value[i].debits !='-'){
                                let debits = parseFloat(trialBalanceList.value[i].debits.replace(/,/g, ''))
                                tenant_ledger_totals.value += debits;
                                tenantLedger.value = 'debit';
                            }else if(trialBalanceList.value[i].credits !='-'){
                                let credits = parseFloat(trialBalanceList.value[i].credits.replace(/,/g, ''))
                                tenant_ledger_totals.value -= credits;
                                tenantLedger.value = 'credit';
                            }
                            trialBalanceList.value.splice(i, 1);
                        }else if(response.data.results[i].ledger_category === "Members" && merge_members_setting.value === 'Yes'){
                            if(trialBalanceList.value[i].debits !='-'){
                                let debits = parseFloat(trialBalanceList.value[i].debits.replace(/,/g, ''))
                                member_ledger_totals.value += debits;
                                memberLedger.value = 'debit';
                            }else if(trialBalanceList.value[i].credits !='-'){
                                let credits = parseFloat(trialBalanceList.value[i].credits.replace(/,/g, ''))
                                member_ledger_totals.value -= credits;
                                memberLedger.value = 'credit';
                            }
                            trialBalanceList.value.splice(i, 1);
                        }else if(response.data.results[i].ledger_category === "Loans" && merge_loans_setting.value === 'Yes'){
                            if(trialBalanceList.value[i].debits !='-'){
                                let debits = parseFloat(trialBalanceList.value[i].debits.replace(/,/g, ''))
                                loan_ledger_totals.value += debits;
                                loanLedger.value = 'debit';
                            }else if(trialBalanceList.value[i].credits !='-'){
                                let credits = parseFloat(trialBalanceList.value[i].credits.replace(/,/g, ''))
                                loan_ledger_totals.value -= credits;
                                loanLedger.value = 'credit';
                            }
                            trialBalanceList.value.splice(i, 1);
                        }else if(response.data.results[i].ledger_category === "Savings" && merge_savings_setting.value === 'Yes'){
                            if(trialBalanceList.value[i].debits !='-'){
                                let debits = parseFloat(trialBalanceList.value[i].debits.replace(/,/g, ''))
                                saving_ledger_totals.value += debits;
                                tenantLedger.value = 'debit';
                            }else if(trialBalanceList.value[i].credits !='-'){
                                let credits = parseFloat(trialBalanceList.value[i].credits.replace(/,/g, ''))
                                saving_ledger_totals.value -= credits;
                                savingLedger.value = 'credit';
                            }
                            trialBalanceList.value.splice(i, 1);
                        }else if(response.data.results[i].ledger_category === "Shares" && merge_shares_setting.value === 'Yes'){
                            if(trialBalanceList.value[i].debits !='-'){
                                let debits = parseFloat(trialBalanceList.value[i].debits.replace(/,/g, ''))
                                share_ledger_totals.value += debits;
                                shareLedger.value = 'debit';
                            }else if(trialBalanceList.value[i].credits !='-'){
                                let credits = parseFloat(trialBalanceList.value[i].credits.replace(/,/g, ''))
                                share_ledger_totals.value -= credits;
                                shareLedger.value = 'credit';
                            }
                            trialBalanceList.value.splice(i, 1);
                        } 

                    }
                    if(patient_ledger_totals.value > 0){
                        let patientArr ={
                            "ledger_code": 'PAT',
                            "ledger_name": 'PATIENTS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Patients',
                            "financial_statement": 'Balance Sheet',
                            "debits": Number(patient_ledger_totals.value).toLocaleString(),
                            "credits": '-',
                            "status": 'Active',
                            "txtColor": 'blue',
                        }
                        trialBalanceList.value.push(patientArr);
                    }else if(patient_ledger_totals.value < 0){
                        let patientArr ={
                            "ledger_code": 'PAT',
                            "ledger_name": 'PATIENTS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Patients',
                            "financial_statement": 'Balance Sheet',
                            "credits": Number(Math.abs(patient_ledger_totals.value)).toLocaleString(),
                            "debits": '-',
                            "status": 'Active',
                            "txtColor": 'blue',
                        }
                        trialBalanceList.value.push(patientArr);
                    }
                    if(customer_ledger_totals.value > 0){
                        let customersArr ={
                            "ledger_code": 'DEB',
                            "ledger_name": 'DEBTORS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Debtors',
                            "financial_statement": 'Balance Sheet',
                            "debits": Number(customer_ledger_totals.value).toLocaleString(),
                            "credits": '-',
                            "status": 'Active',
                            "txtColor": 'blue',
                        }
                        trialBalanceList.value.push(customersArr);
                    }else if(customer_ledger_totals.value < 0){
                        let customersArr ={
                            "ledger_code": 'DEB',
                            "ledger_name": 'DEBTORS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Debtors',
                            "financial_statement": 'Balance Sheet',
                            "debits": '-',
                            "credits": Number(Math.abs(customer_ledger_totals.value)).toLocaleString(),
                            "status": 'Active',
                            "txtColor": 'blue',
                        }
                        trialBalanceList.value.push(customersArr);
                    }
                    if(vendor_ledger_totals.value > 0){
                        let vendorsArr ={
                            "ledger_code": 'VEN',
                            "ledger_name": 'VENDORS',
                            "ledger_type": 'Current Liability',
                            "ledger_category": 'Vendors',
                            "financial_statement": 'Balance Sheet',
                            "debits": Number(vendor_ledger_totals.value).toLocaleString(),
                            "credits": '-',
                            "status": 'Active',
                            "txtColor": 'yellow',
                        }
                        trialBalanceList.value.push(vendorsArr);
                    }else if(vendor_ledger_totals.value < 0){
                        let vendorsArr ={
                            "ledger_code": 'VEN',
                            "ledger_name": 'VENDORS',
                            "ledger_type": 'Current Liability',
                            "ledger_category": 'Vendors',
                            "financial_statement": 'Balance Sheet',
                            "debits": '-',
                            "credits": Number(Math.abs(vendor_ledger_totals.value)).toLocaleString(),
                            "status": 'Active',
                            "txtColor": 'yellow',
                        }
                        trialBalanceList.value.push(vendorsArr);
                    }

                    if(tenant_ledger_totals.value > 0){
                        let tenantsArr ={
                            "ledger_code": 'TNT',
                            "ledger_name": 'TENANTS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Tenants',
                            "financial_statement": 'Balance Sheet',
                            "debits": Number(tenant_ledger_totals.value).toLocaleString(),
                            "credits": '-',
                            "status": 'Active',
                            "txtColor": 'blue',
                        }
                        trialBalanceList.value.push(tenantsArr);
                    }else if(tenant_ledger_totals.value < 0){
                        let tenantsArr ={
                            "ledger_code": 'TNT',
                            "ledger_name": 'TENANTS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Tenants',
                            "financial_statement": 'Balance Sheet',
                            "debits": '-',
                            "credits": Number(Math.abs(tenant_ledger_totals.value)).toLocaleString(),
                            "status": 'Active',
                            "txtColor": 'blue',
                        }
                        trialBalanceList.value.push(tenantsArr);
                    }
                    if(member_ledger_totals.value > 0){
                        let membersArr ={
                            "ledger_code": 'MEM',
                            "ledger_name": 'MEMBERS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Members',
                            "financial_statement": 'Balance Sheet',
                            "debits": Number(member_ledger_totals.value).toLocaleString(),
                            "credits": '-',
                            "status": 'Active',
                            "txtColor": 'blue',
                        }
                        trialBalanceList.value.push(membersArr);
                    }else if(member_ledger_totals.value < 0){
                        let membersArr ={
                            "ledger_code": 'MEM',
                            "ledger_name": 'MEMBERS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Members',
                            "financial_statement": 'Balance Sheet',
                            "debits": '-',
                            "credits": Number(Math.abs(member_ledger_totals.value)).toLocaleString(),
                            "status": 'Active',
                            "txtColor": 'blue',
                        }
                        trialBalanceList.value.push(membersArr);
                    }
                    if(loan_ledger_totals.value > 0){
                        let loansArr ={
                            "ledger_code": 'LOAN',
                            "ledger_name": 'LOANS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Loans',
                            "financial_statement": 'Balance Sheet',
                            "debits": Number(loan_ledger_totals.value).toLocaleString(),
                            "credits": '-',
                            "status": 'Active',
                            "txtColor": 'blue',
                        }
                        trialBalanceList.value.push(loansArr);
                    }else if(loan_ledger_totals.value < 0){
                        let loansArr ={
                            "ledger_code": 'LOAN',
                            "ledger_name": 'LOANS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Loans',
                            "financial_statement": 'Balance Sheet',
                            "debits": '-',
                            "credits": Number(Math.abs(loan_ledger_totals.value)).toLocaleString(),
                            "status": 'Active',
                            "txtColor": 'blue',
                        }
                        trialBalanceList.value.push(loansArr);
                    }
                    if(saving_ledger_totals.value > 0){
                        let savingsArr ={
                            "ledger_code": 'SAV',
                            "ledger_name": 'SAVINGS',
                            "ledger_type": 'Current Liability',
                            "ledger_category": 'Savings',
                            "financial_statement": 'Balance Sheet',
                            "debits": Number(saving_ledger_totals.value).toLocaleString(),
                            "credits": '-',
                            "status": 'Active',
                            "txtColor": 'yellow',
                        }
                        trialBalanceList.value.push(savingsArr);
                    }else if(saving_ledger_totals.value < 0){
                        let savingsArr ={
                            "ledger_code": 'SAV',
                            "ledger_name": 'SAVINGS',
                            "ledger_type": 'Current Liability',
                            "ledger_category": 'Savings',
                            "financial_statement": 'Balance Sheet',
                            "debits": '-',
                            "credits": Number(Math.abs(saving_ledger_totals.value)).toLocaleString(),
                            "status": 'Active',
                            "txtColor": 'yellow',
                        }
                        trialBalanceList.value.push(savingsArr);
                    }
                    if(share_ledger_totals.value > 0){
                        let sharesArr ={
                            "ledger_code": 'SHA',
                            "ledger_name": 'SHARES',
                            "ledger_type": 'Owner Equity',
                            "ledger_category": 'Shares',
                            "financial_statement": 'Balance Sheet',
                            "debits": Number(share_ledger_totals.value).toLocaleString(),
                            "credits": '-',
                            "status": 'Active',
                        }
                        trialBalanceList.value.push(sharesArr);
                    }else if(share_ledger_totals.value < 0){
                        let sharesArr ={
                            "ledger_code": 'SHA',
                            "ledger_name": 'SHARES',
                            "ledger_type": 'Owner Equity',
                            "ledger_category": 'Shares',
                            "financial_statement": 'Balance Sheet',
                            "debits": '-',
                            "credits": Number(Math.abs(share_ledger_totals.value)).toLocaleString(),
                            "status": 'Active',
                        }
                        trialBalanceList.value.push(sharesArr);
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
            ledger_code_search.value = "";
            ledger_name_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            searchTrialBalance();
        }

        const handleActionClick = async(rowIndex, action, row) =>{
            let formData = {
                posting_account: row[idField],
                company: companyID.value,
                date_from: "",
                date_to: "",
            }
            let formData1 = {
                ledger: row[idField],
                company: companyID.value,
            }
            store.commit('pageTab/ADD_PAGE', {'FA':'Ledger_Details'});
            store.state.pageTab.faActiveTab = 'Ledger_Details'; 
            await store.dispatch('Ledgers/fetchLedger', formData1)
            await store.dispatch('Ledgers/updateState', {ledgerID: row[idField] })
        }
        const closeModal = async() =>{
            invModalVisible.value = false;
            handleReset();
        }

        const dropdownOptions = ref([
            // {label: 'Withholding Tax', action: 'withholding-tax'},
        ]);
        const handleDynamicOption = (option) =>{
            if(option == 'batch-meter-reading'){
                store.commit('pageTab/ADD_PAGE', {'PMS':'Batch_Readings'})
                store.state.pageTab.faActiveTab = 'Batch_Readings';
            }
        }
        const printTrialBalance = () =>{
            showLoader();

            let formData = {
                ledger_code: ledger_code_search.value,
                ledger_name: ledger_name_search.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                merge_patients_setting: merge_patients_setting.value,
                merge_debtors_setting: merge_debtors_setting.value,
                merge_vendors_setting: merge_vendors_setting.value,
                merge_tenants_setting: merge_tenants_setting.value,
                merge_members_setting: merge_members_setting.value,
                merge_loans_setting: merge_loans_setting.value,
                merge_savings_setting: merge_savings_setting.value,
                merge_shares_setting: merge_shares_setting.value,
                company_id: companyID.value
            } 
   
            axios
            .post("api/v1/export-trial-balance-pdf/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const blob1 = new Blob([response.data], { type: 'application/pdf' });
                        const url = URL.createObjectURL(blob1);
                        // PrintJS({printable: url, type: 'pdf'});
                        pdfUrl.value = url;
                        printModalVisible.value = true;
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
            fetchDefaultSettings();           
        })
        onMounted(() =>{
            searchTrialBalance();
        })
        return{
            showAddButton,showTotals,title, searchTrialBalance,resetFilters, addButtonLabel, searchFilters, tableColumns, trialBalanceList,
            invModalVisible, idField, actions, handleActionClick, propModalVisible, closeModal,printModalVisible,pdfUrl, printTitle,
            submitButtonLabel, showModal, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
             dropdownOptions, handleDynamicOption,printTrialBalance,rightsModule
        }
    }
};
</script>