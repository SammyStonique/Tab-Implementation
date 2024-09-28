<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        :showAddButton="showAddButton"
        :searchFilters="searchFilters"
        @searchPage="searchAllocations"
        @resetFilters="resetFilters"
        @removeItem="removeAllocation"
        @removeSelectedItems="removeAllocations"
        @printList="printList"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="prepaymentsList"
        :actions="actions"
        :idField="idField"
        :showTotals="showTotals"
        @handleSelectionChange="handleSelectionChange"
        @handleActionClick="handleActionClick"
        :count="appCount"
        :currentPage="currentPage"
        :result="appArrLen"
        @loadPrev="loadPrev"
        @loadNext="loadNext"
        @firstPage="firstPage"
        @lastPage="lastPage"
        :showNextBtn="showNextBtn"
        :showPreviousBtn="showPreviousBtn"
    />
    <MovableModal v-model:visible="appModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
    >
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="allocatePrepayment" @handleReset="handleReset"
        />
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted,watch } from 'vue';
import { useStore } from "vuex";
import PageComponent from "../PageComponent.vue";
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useToast } from "vue-toastification";

export default{
    name: 'Prepayment_Allocations',
    props: ['scrollToTop','loader','showLoader','hideLoader',],
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const addButtonLabel = ref('');
        const pageComponentKey = ref(0);
        const invComponentKey = ref(0);
        const showAddButton = ref(false);
        const title = ref('Prepayment Allocation');
        const rightsModule = ref('PMS');
        const companyID = computed(()=> store.state.userData.company_id);
        const tenantID = ref("");
        const prepaymentID = ref("");
        const prepaymentAmount = ref(0);
        const prepaymentAllocError = ref(false);
        const invoiceID = ref('');
        const invoiceDescription = ref('');
        const invoiceDueAmount = ref(0);
        const invoiceArray = computed(() => store.state.Journals.journalArr);
        const idField = 'tenant_prepayment_alloc_id';
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const prepaymentsList = ref([]);
        const appResults = ref([]);
        const appArrLen = ref(0);
        const appCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('35vw');
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date",type: "text", editable: false},
            {label: "Code", key:"tenant_code",type: "text", editable: false},
            {label: "Tenant Name", key:"tenant_name",type: "text", editable: false},
            {label: "Invoice", key:"invoice_no",type: "text", editable: false},
            {label: "Description", key:"description",type: "text", editable: false},
            {label: "Allocated", key: "allocated_amount", type: "number", editable: false},
            {label: "Receipt", key:"receipt_no",type: "text", editable: false},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Allocation', rightName: 'Deleting Prepayment Allocations'},
        ])
        const tenant_name_search = computed({
            get: () => store.state.Prepayment_Allocations.tenant_name_search,
            set: (value) => store.commit('Prepayment_Allocations/SET_SEARCH_FILTERS', {"tenant_name_search":value}),
        });
        const tenant_code_search = computed({
            get: () => store.state.Prepayment_Allocations.tenant_code_search,
            set: (value) => store.commit('Prepayment_Allocations/SET_SEARCH_FILTERS', {"tenant_code_search":value}),
        });
        const from_date_search = computed({
            get: () => store.state.Prepayment_Allocations.from_date_search,
            set: (value) => store.commit('Prepayment_Allocations/SET_SEARCH_FILTERS', {"from_date_search":value}),
        });
        const to_date_search = computed({
            get: () => store.state.Prepayment_Allocations.to_date_search,
            set: (value) => store.commit('Prepayment_Allocations/SET_SEARCH_FILTERS', {"to_date_search":value}),
        });
        const fetchInvoices = async(tenantID) =>{
            await store.dispatch('Journals/fetchJournals', {company:companyID.value, customer: tenantID.value, txn_type: ["INV","DBN"], status: "Open"})
        };
        const handleSelectedInvoice = async(option) =>{
            await store.dispatch('Journals/handleSelectedJournal', option)
            invoiceID.value = store.state.Journals.journalID;
            invoiceDescription.value = store.state.Journals.invoiceDescription;
            invoiceDueAmount.value = store.state.Journals.invoiceDueAmount;
        };
        const clearSelectedInvoice  = async() =>{
            await store.dispatch('Journals/updateState', {journalID: ''});
            invoiceID.value = ""
        }
        const searchFilters = ref([
            {type:'text', placeholder:"Tenant Code...", value: tenant_code_search, width:36},
            {type:'text', placeholder:"Tenant Name...", value: tenant_name_search, width:64},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const checkPrepaymentLimit = (value) =>{
            if(invoiceDueAmount.value < value){
                toast.error(`Invoice Balance is ${invoiceDueAmount.value}`)
                formFields.value[2].value = 0;
            }
            else if(prepaymentAmount.value < value){
                toast.error(`Cannot Allocate More Than ${prepaymentAmount.value}`)
                formFields.value[2].value = 0;
            }
        }
        const formFields = ref([
            {  
                type:'search-dropdown', label:"Invoice", value: invoiceID.value, componentKey: invComponentKey,
                selectOptions: invoiceArray, optionSelected: handleSelectedInvoice, required: true,
                searchPlaceholder: 'Select Deposit...', dropdownWidth: '450px', updateValue: "",
                fetchData: fetchInvoices(), clearSearch: clearSelectedInvoice() 
            },
            { type: 'date', name: 'date',label: "Date", value: '', required: true },
            { type: 'number', name: 'allocated_amount',label: "Amount", value: 0, required: true, method: checkPrepaymentLimit },
            
        ]);
        const handleReset = () =>{
            for(let i=1; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            invoiceID.value = '';
        }
        
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const allocationID = [row['tenant_prepayment_alloc_id']];
                let formData = {
                    company: companyID.value,
                    tenant_prepayment_allocs: allocationID
                }
                await store.dispatch('Prepayment_Allocations/deleteAllocation',formData)
                searchAllocations();     
            }
        } 
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const removeAllocation = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    tenant_prepayment_allocs: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Prepayment_Allocations/deleteAllocation',formData)
                    if(response && response.status == 200){
                        toast.success("Allocation Removed Succesfully");
                        pageComponentKey.value += 1;
                        searchAllocations();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Allocation: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Allocation") 
            }else{
                toast.error("Please Select An Allocation To Remove")
            }
        }
        const removeAllocations = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    tenant_prepayment_allocs: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Prepayment_Allocations/deleteAllocation',formData)
                    if(response && response.status == 200){
                        toast.success("Allocation(s) Removed Succesfully");
                        pageComponentKey.value += 1;
                        searchAllocations();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Allocation(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select An Allocation To Remove")
            }
        }
        const allocatePrepayment = async() =>{
            showModalLoader();
            let formData = {
                date: formFields.value[1].value,
                description: invoiceDescription.value,
                allocated_amount: formFields.value[2].value,
                invoice: invoiceID.value,
                invoice_id: invoiceID.value,
                tenant_prepayment: prepaymentID.value,
                tenant_prepayment_id: prepaymentID.value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != "number" && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }else if(formFields.value[i].value == 0 && formFields.value[i].type == "number"){
                    prepaymentAllocError.value = true;
                }
            }
            if(invoiceID.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else if(prepaymentAllocError.value){
                toast.error('Invalid Amount');
                hideModalLoader();
                prepaymentAllocError.value = false;
            }else{
                try {
                    const response = await store.dispatch('Tenant_Prepayments/allocatePrepayment', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Prepayment Allocated Successfully!');
                        handleReset();
                        invComponentKey.value += 1;
                        appModalVisible.value = false;
                    } else {
                        toast.error('An error occurred while allocating the prepayment.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to allocate prepayment: ' + error.message);
                } finally {
                    hideModalLoader();
                    store.dispatch('Journals/updateState',{journalID:''})
                    searchAllocations();
                }
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchAllocations = () =>{
            showLoader();
            let formData = {
                client_code: tenant_code_search.value,
                client_name: tenant_name_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                company: companyID.value
            }
 
            axios
            .post(`api/v1/tenant-prepayment-allocations-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                prepaymentsList.value = response.data.results;
                store.commit('Prepayment_Allocations/LIST_PREPAYMENT_ALLOCATIONS', prepaymentsList.value)
                appResults.value = response.data;
                appArrLen.value = prepaymentsList.value.length;
                appCount.value = appResults.value.count;
                pageCount.value = Math.ceil(appCount.value / 50);
                
                if(response.data.next){
                    showNextBtn.value = true;
                }
                if(response.data.previous){
                    showPreviousBtn.value = true;
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchAllocations();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchAllocations();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchAllocations();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchAllocations();
        }
        const resetFilters = () =>{
            store.commit('Prepayment_Allocations/RESET_SEARCH_FILTERS')
            searchAllocations();
        }
        const closeModal = () =>{
            appModalVisible.value = false;
            invoiceID.value = "";
            store.dispatch('Journals/updateState',{journalID:''})
        }
        onMounted(() =>{
            searchAllocations();
        })
        return{
            showTotals,showAddButton,title, searchAllocations, idField, selectedIds, actions, prepaymentsList, appArrLen,appCount,appResults,appModalVisible,formFields,
            addButtonLabel, searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,
            showNextBtn,showPreviousBtn, handleActionClick,allocatePrepayment,displayButtons,handleReset,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            closeModal, handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage, removeAllocation, removeAllocations,
            rightsModule
        }
    }
}
</script>
