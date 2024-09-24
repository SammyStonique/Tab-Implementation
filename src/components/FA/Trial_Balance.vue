<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew=""
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchTrialBalance"
            @resetFilters="resetFilters"
            @printList="printList"
            :columns="tableColumns"
            :rows="trialBalanceList"
            :actions="actions"
            :idField="idField"
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
        const idField = 'ledger_id';
        const addButtonLabel = ref('');
        const submitButtonLabel = ref('Add');
        const title = ref('Invoice Booking');
        const invModalVisible = ref(false);
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
        const patientLedger = ref('');
        const vendorLedger = ref('');
        const customerLedger = ref('');
        const merge_patients_setting = ref('Yes');
        const merge_vendors_setting = ref('Yes');
        const merge_debtors_setting = ref('Yes');
        const trialBalanceList = ref([]);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Type", key:"ledger_type"},
            {label: "Code", key: "ledger_code"},
            {label: "Account Name", key:"ledger_name"},
            {label: "Debits", key:"debits"},
            {label: "Credits", key:"credits"},
        ])
        
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Journal'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);

        const from_date_search = ref("")
        const to_date_search = ref("");
        const searchFilters = ref([
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
        ]);
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
            vendor_ledger_totals.value = 0;
            trialBalanceList.value = [];

            let formData = {
                ledger_code: "",
                ledger_name: "",
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
                                patient_ledger_totals.value += trialBalanceList.value[i].debits;
                                patientLedger.value = "debit";
                                
                            }else if(trialBalanceList.value[i].credits !='-'){
                                patient_ledger_totals.value += trialBalanceList.value[i].credits;
                                patientLedger.value  = "credit";
                            }
                            trialBalanceList.value.splice(i, 1);
                        }else if(trialBalanceList.value[i].ledger_category === "Vendors" && merge_vendors_setting.value === 'Yes'){
                            if(trialBalanceList.value[i].debits !='-'){
                                vendor_ledger_totals.value += trialBalanceList.value[i].debits;
                                vendorLedger.value = 'debit';
                            }else if(trialBalanceList.value[i].credits !='-'){
                                vendor_ledger_totals.value += trialBalanceList.value[i].credits;
                                vendorLedger.value  = 'credit';
                            }
                        }else if(trialBalanceList.value[i].ledger_category === "Debtors" && merge_debtors_setting.value === 'Yes'){
                            if(trialBalanceList.value[i].debits !='-'){
                                customer_ledger_totals.value += trialBalanceList.value[i].debits;
                                customerLedger.value = 'debit';
                            }else if(trialBalanceList.value[i].credits !='-'){
                                customer_ledger_totals.value += trialBalanceList.value[i].credits;
                                customerLedger.value = 'credit';
                            }
                            trialBalanceList.value.splice(i, 1);
                            }
                    }
                    if(patientLedger.value === 'debit'){
                        let patientArr ={
                            "ledger_code": 'PAT',
                            "ledger_name": 'PATIENTS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Patients',
                            "financial_statement": 'Balance Sheet',
                            "debits": patient_ledger_totals.value,
                            "credits": '-',
                            "status": 'Active',
                        }
                        trialBalanceList.value.push(patientArr);
                    }else if(patientLedger.value  === 'credit'){
                        let patientArr ={
                            "ledger_code": 'PAT',
                            "ledger_name": 'PATIENTS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Patients',
                            "financial_statement": 'Balance Sheet',
                            "credits": Math.abs(patient_ledger_totals.value),
                            "debits": '-',
                            "status": 'Active',
                        }
                        trialBalanceList.value.push(patientArr);
                    }
                    if(customerLedger.value === 'debit'){
                        let customersArr ={
                            "ledger_code": 'DEB',
                            "ledger_name": 'DEBTORS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Debtors',
                            "financial_statement": 'Balance Sheet',
                            "debits": customer_ledger_totals.value,
                            "credits": '-',
                            "status": 'Active',
                        }
                        trialBalanceList.value.push(customersArr);
                    }else if(customerLedger.value === 'credit'){
                        let customersArr ={
                            "ledger_code": 'DEB',
                            "ledger_name": 'DEBTORS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Debtors',
                            "financial_statement": 'Balance Sheet',
                            "debits": '-',
                            "credits": Math.abs(customer_ledger_totals.value),
                            "status": 'Active',
                        }
                        trialBalanceList.value.push(customersArr);
                    }
                    if(vendorLedger.value  === 'debit'){
                        let vendorsArr ={
                            "ledger_code": 'VEN',
                            "ledger_name": 'VENDORS',
                            "ledger_type": 'Current Liability',
                            "ledger_category": 'Vendors',
                            "financial_statement": 'Balance Sheet',
                            "debits": vendor_ledger_totals.value,
                            "credits": '-',
                            "status": 'Active',
                        }
                        trialBalanceList.value.push(vendorsArr);
                    }else if(vendorLedger.value  === 'credit'){
                        let vendorsArr ={
                            "ledger_code": 'VEN',
                            "ledger_name": 'VENDORS',
                            "ledger_type": 'Current Liability',
                            "ledger_category": 'Vendors',
                            "financial_statement": 'Balance Sheet',
                            "debits": '-',
                            "credits": Math.abs(vendor_ledger_totals.value),
                            "status": 'Active',
                        }
                        trialBalanceList.value.push(vendorsArr);
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
            store.commit('Journals/RESET_SEARCH_FILTERS')
            searchTrialBalance();
        }

        const handleActionClick = async(rowIndex, action, row) =>{

        }
        const closeModal = async() =>{
            invModalVisible.value = false;
            handleReset();
        }

        const dropdownOptions = ref([
            {label: 'Withholding Tax', action: 'withholding-tax'},
        ]);
        const handleDynamicOption = (option) =>{
            if(option == 'batch-meter-reading'){
                store.commit('pageTab/ADD_PAGE', {'PMS':'Batch_Readings'})
                store.state.pageTab.faActiveTab = 'Batch_Readings';
            }
        }
        onBeforeMount(()=>{
            searchTrialBalance();
            
        })
        return{
            title, searchTrialBalance,resetFilters, addButtonLabel, searchFilters, tableColumns, trialBalanceList,
            invModalVisible, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
             dropdownOptions, handleDynamicOption,
        }
    }
};
</script>