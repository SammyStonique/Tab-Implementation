<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="runPayroll"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchPayrolls"
            @resetFilters="resetFilters"
            @removeItem="removePayroll"
            @removeSelectedItems="removePayrolls"
            @printList="printPayrollList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="payrollList"
            :actions="actions"
            :showTotals="showTotals"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            @handleShowDetails="handleShowDetails"
            :count="propCount"
            :currentPage="currentPage"
            :result="propArrLen"
            @loadPrev="loadPrev"
            @loadNext="loadNext"
            @firstPage="firstPage"
            @lastPage="lastPage"
            :showNextBtn="showNextBtn"
            :showPreviousBtn="showPreviousBtn"
            :selectedValue="selectedValue"
            @selectSearchQuantity="selectSearchQuantity"
            :showDetails="showDetails"
            :detailsTitle="detailsTitle"
            @hideDetails="hideDetails"
        >
            <div>
                <div class="tabs pt-2">
                    <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                        {{ tab }}
                    </button>
                </div>
                <div class="tab-content mt-3">
                    <div v-if="activeTab == 0">
                        <JournalEntries 
                            :detailRows="journalEntries"
                        />
                    </div>
                    <div v-if="activeTab == 1">
                        <InvoiceLines 
                            :invLinesRows="invoiceLines"
                        />
                    </div>
                    <div v-if="activeTab == 2">
                        <InvoicePayments 
                            :invPayRows="invoicePayments"
                        />
                    </div>
                </div>
                
            </div>
        </PageComponent>
        <MovableModal v-model:visible="invModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
        >
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="payrollProcessing" @handleReset="handleReset"
            />
        </MovableModal>
        <MovableModal v-model:visible="appModalVisible" :title="appTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="app_modal_loader" @showLoader="showAppModalLoader" @hideLoader="hideAppModalLoader" @closeModal="closeAppModal"
        >
            <DynamicForm 
                :fields="formFields1" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="approvePayroll" @handleReset="handleAppReset"
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
import JournalEntries from "@/components/JournalEntries.vue";
import InvoiceLines from "@/components/InvoiceLines.vue";
import InvoicePayments from "@/components/InvoicePayments.vue";
import PrintJS from 'print-js';

export default{
    name: 'Payrolls',
    components:{
        PageComponent, MovableModal,DynamicForm,JournalEntries,InvoiceLines,InvoicePayments
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const { getYear } = useDateFormatter();
        const { getMonth } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('none');
        const modal_loader = ref('none');
        const app_modal_loader = ref('none');
        const idField = 'payroll_id';
        const addButtonLabel = ref('Run Payroll');
        const addingRight = ref('Running Payroll');
        const rightsModule = ref('HR');
        const submitButtonLabel = ref('Add');
        const title = ref('Run Payroll');
        const detailsTitle = ref('Payroll Details');
        const appTitle = ref('Approve Payroll');
        const tabs = ref(['Journal Entries','Invoice Lines','Invoice Payments']);
        const activeTab = ref(0);
        const invoiceID = ref(null);
        const propComponentKey = ref(0);
        const paySearchComponentKey = ref(0);
        const invModalVisible = ref(false);
        const appModalVisible = ref(false);
        const modal_top = ref('200px');
        const modal_left = ref('500px');
        const modal_width = ref('30vw');
        const selectedIds = ref([]);
        const payrollList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const showDetails = ref(false);
        const journalEntries = ref([]);
        const invoiceLines = ref([]);
        const invoicePayments = ref([]);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const payGroupID = ref(null);
        const payrollID = ref(null);
        const groupSearchID = ref('');
        const payGroupArray = computed(() => store.state.Pay_Groups.groupArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "date"},
            {label: "Month", key:"month"},
            {label: "Year", key:"year"},
            {label: "Basic Pay", key:"base_salary", type: "number"},
            {label: "Allowances", key:"allowances", type: "number"},
            {label: "Deductions", key:"deductions", type: "number"},
            {label: "Paye", key:"tax", type: "number"},
            {label: "Net Pay", key:"net_pay", type: "number"},
            {label: "Status", key:"status"},
            {label: "Appr. Date", key:"processed_at"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Payroll', rightName: 'View Payroll Details'},
            {name: 'approve', icon: 'fa fa-check-circle', title: 'Approve Payroll', rightName: 'Approve Payroll'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Payroll', rightName: 'Deleting Payroll'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const fetchPayGroups = async() =>{
            await store.dispatch('Pay_Groups/fetchPayGroups', {company:companyID.value})
        };
        const handleSearchPayGroup = async(option) =>{
            await store.dispatch('Pay_Groups/handleSelectedPayGroup', option)
            groupSearchID.value = store.state.Pay_Groups.groupID;
        };
        const clearSearchPayGroup = async() =>{
            await store.dispatch('Pay_Groups/updateState', {groupID: ''});
            groupSearchID.value = ""
        };
        const month_search = ref("");
        const year_search = ref("");
        const status_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {
                type:'dropdown', placeholder:"Month..", value: month_search, width:32,
                options: [{text:'January',value:'January'},{text:'February',value:'February'},{text:'March',value:'March'},{text:'April',value:'April'},{text:'May',value:'May'},{text:'June',value:'June'},
                        {text:'July',value:'July'},{text:'August',value:'August'},{text:'September',value:'September'},{text:'October',value:'October'},{text:'November',value:'November'},{text:'December',value:'December'}]
            },
            {type:'text', placeholder:"Year...", value: year_search, width:36},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            {
                type:'dropdown', placeholder:"Status..", value: status_search, width:32,
                options: [{text:'Pending',value:'Pending'},{text:'Processed',value:'Processed'},{text:'Approved',value:'Approved'}]
            },
            {
                type:'search-dropdown', value: payGroupArray, width:48,
                selectOptions: payGroupArray, optionSelected: handleSearchPayGroup,
                searchPlaceholder: 'Pay Group...', dropdownWidth: '300px',
                fetchData: store.dispatch('Pay_Groups/fetchPayGroups', {company:companyID.value}),
                clearSearch: clearSearchPayGroup, componentKey: paySearchComponentKey
            },
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        const handleSelectedPayGroup = async(option) =>{
            await store.dispatch('Pay_Groups/handleSelectedPayGroup', option)
            payGroupID.value = store.state.Pay_Groups.groupID;
        };
        const clearSelectedPayGroup = async() =>{
            await store.dispatch('Pay_Groups/updateState', {groupID: ''});
            payGroupID.value = ""
        }
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                {
                    type:'search-dropdown', label:"Pay Group", value: payGroupID.value, componentKey: propComponentKey,
                    selectOptions: payGroupArray, optionSelected: handleSelectedPayGroup, required: true,
                    searchPlaceholder: 'Select Pay Group...', dropdownWidth: '500px', updateValue: "",
                    fetchData: fetchPayGroups(), clearSearch: clearSelectedPayGroup            
                },
                { type: 'dropdown', name: 'month',label: "Month", value: '', placeholder: "", required: true, options: [{ text: 'January', value: 'January' }, { text: 'February', value: 'February' },{ text: 'March', value: 'March' }, { text: 'April', value: 'April' },{ text: 'May', value: 'May' }, { text: 'June', value: 'June' },{ text: 'July', value: 'July' }, { text: 'August', value: 'August' },{ text: 'September', value: 'September' }, { text: 'October', value: 'October' },{ text: 'November', value: 'November' }, { text: 'December', value: 'December' }] },
                { type: 'text', name: 'period_year',label: "Year", value: "", required: true },
                { type: 'date', name: 'date',label: "Running Date", value: "", required: true },
            ]
        };

        const handleReset = async() =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            propComponentKey.value += 1;
            payGroupID.value = '';
        }
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const payrollProcessing = async() =>{
            showModalLoader();
            let formData = {
                pay_group: payGroupID.value,
                date: formFields.value[3].value,
                period_month: formFields.value[1].value,
                period_year: formFields.value[2].value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=2; i < (formFields.value.length); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Payrolls/createPayroll', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Payroll Run Successfully!');
                        handleReset();
                        propComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while Running the Payroll.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to Run Payroll: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchPayrolls();
                }
            }
        }

        const formFields1 = ref([]);
        const updateFormFields1 = () =>{
            formFields1.value = [
                { type: 'date', name: 'date',label: "Approval Date", value: "", required: true },
            ]
        };

        const handleAppReset = async() =>{
            for(let i=0; i < formFields1.value.length; i++){
                formFields1.value[i].value = '';
            }
        }
        
        const showAppModalLoader = () =>{
            app_modal_loader.value = "block";
        }
        const hideAppModalLoader = () =>{
            app_modal_loader.value = "none";
        }
        const approvePayroll = async() =>{
            showAppModalLoader();
            let formData = {
                payroll: payrollID.value,
                date: formFields1.value[0].value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=0; i < (formFields1.value.length); i++){
                if(formFields1.value[i].value =='' && formFields1.value[i].required == true){
                    errors.value.push(formFields1.value[i].label);
                }
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideAppModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Payrolls/approvePayroll', formData);
                    if (response && response.status === 200) {
                        hideAppModalLoader();
                        toast.success('Payroll Approved Successfully!');
                        handleAppReset();
                    } else {
                        toast.error('An error occurred while Approving the Payroll.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to Approve Payroll: ' + error.message);
                } finally {
                    hideAppModalLoader();
                    searchPayrolls();
                }
            }
        };
        const closeAppModal = async() =>{
            appModalVisible.value = false;
            handleAppReset();
        }

        const removePayroll = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    payroll: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Payrolls/deletePayroll',formData)
                    if(response && response.status == 200){
                        toast.success("Payroll Removed Succesfully");
                        searchPayrolls();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Payroll: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    searchPayrolls();
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Payroll") 
            }else{
                toast.error("Please Select A Payroll To Remove")
            }
        }
        const removePayrolls = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    payroll: selectedIds.value,
                }

                try{
                    const response = await store.dispatch('Payrolls/deletePayroll',formData)
                    if(response && response.msg == "Success"){
                        toast.success("Payroll(s) Removed Succesfully");
                        searchPayrolls();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Payrolls: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    searchPayrolls();
                }
            }else{
                toast.error("Please Select A Payroll To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchPayrolls = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                month: month_search.value,
                year: year_search.value,
                status: status_search.value,
                pay_group: groupSearchID.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
   
            axios
            .post(`api/v1/payrolls-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                payrollList.value = response.data.results;
                store.commit('Payrolls/LIST_PAYROLLS', payrollList.value)
                propResults.value = response.data;
                propArrLen.value = payrollList.value.length;
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
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchPayrolls(selectedValue.value);
        };
        const resetFilters = () =>{
            selectedValue.value = 50;
            month_search.value = "";
            year_search.value = "";
            from_date_search.value= "";
            to_date_search.value = "";
            status_search.value = "";
            paySearchComponentKey.value += 1;
            groupSearchID.value = "";
            searchPayrolls();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchPayrolls();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchPayrolls();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchPayrolls();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchPayrolls();
            // scrollToTop();
        }
        const runPayroll = () =>{
            invModalVisible.value = true;
            updateFormFields();
            formFields.value[1].value = getMonth(current_date);
            formFields.value[2].value = getYear(current_date);
            payGroupID.value = "";
            propComponentKey.value += 1;
            propModalVisible.value = true;
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const payrollID = [row['payroll_id']];
                let formData = {
                    company: companyID.value,
                    payroll: payrollID,
                }
                await store.dispatch('Payrolls/deletePayroll',formData).
                then(()=>{
                    searchPayrolls();
                })
            }else if(action == 'view'){
                const payrollID = row['payroll_id'];
                await store.dispatch('Payrolls/updateState',{payrollID: payrollID})
                store.commit('pageTab/ADD_PAGE', {'HR':'Payroll_Employees'})
                store.state.pageTab.hrActiveTab = 'Payroll_Employees';
            }else if(action == 'approve'){
                const approvalStatus = row['status'];
                if (approvalStatus == "Approved"){
                    toast.error("Payroll Already Approved!")
                }else{
                    payrollID.value = row['payroll_id'];
                    appModalVisible.value = true;
                    updateFormFields1();
                }
                
            }
        }
        const handleShowDetails = async(row) =>{
            activeTab.value = 0;
            invoiceID.value = row['journal_id'];
            detailsTitle.value = row['journal_no'] + ' Details';
            showDetails.value = true;
            let formData = {
                journal: row['payroll_id'],
                company: companyID.value
            }
            axios.post('api/v1/journal-entries-search/',formData)
            .then((response)=>{
                journalEntries.value = response.data.journal_entries;
            })
            .catch((error)=>{
                console.log(error.message)
            })
        };
        const selectTab = async(index) => {
            activeTab.value = index;
            hideLoader();

        };
        const hideDetails = async() =>{
            showDetails.value = false;
        };
        const closeModal = async() =>{
            invModalVisible.value = false;
            propComponentKey.value += 1;
            payGroupID.value = "";
            handleReset();
        }

        const dropdownOptions = ref([
            {label: 'Withholding Tax', action: 'withholding-tax'},
        ]);
        const handleDynamicOption = (option) =>{

        };
        const printPayrollList = () =>{
            showLoader();

            let formData = {
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                month: month_search.value,
                year: year_search.value,
                status: status_search.value,
                pay_group: groupSearchID.value,
                company: companyID.value,
            } 
   
            axios
            .post("api/v1/export-payrolls-pdf/", formData, { responseType: 'blob' })
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
            searchPayrolls();
            
        })
        return{
            showTotals,title, searchPayrolls,resetFilters, addButtonLabel, searchFilters, tableColumns, payrollList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,invModalVisible,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, runPayroll, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removePayroll, removePayrolls, dropdownOptions, handleDynamicOption, payrollProcessing,addingRight,rightsModule,printPayrollList,
            selectSearchQuantity,selectedValue,showDetails,detailsTitle,hideDetails,handleShowDetails,journalEntries,
            invoiceLines,invoicePayments,tabs,selectTab,activeTab,app_modal_loader,appTitle,appModalVisible,approvePayroll,showAppModalLoader,hideAppModalLoader,
            formFields1,closeAppModal
        }
    }
};
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
}</style>