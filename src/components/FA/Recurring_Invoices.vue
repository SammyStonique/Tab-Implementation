<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewInvoice"
            :searchFilters="searchFilters"
            @searchPage="searchInvoices"
            @resetFilters="resetFilters"
            @removeItem="removeInvoice"
            @removeSelectedItems="removeInvoices"
            @printList=""
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="invoiceList"
            :actions="actions"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            :groupingKey=true
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
        />
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="saveInvoice" @handleReset="handleReset"
            />
        </MovableModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';

export default{
    name: 'Recurring_Invoices',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'recurring_journal_id';
        const addButtonLabel = ref('Recurring Invoice');
        const addingRight = ref('Adding Invoice');
        const removingRight = ref('Deleting Invoice');
        const rightsModule = ref('Accounts');
        const title = ref('Recurring Invoice Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const invoiceList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('45vw');
        const catComponentKey = ref(0);
        const isEditing = computed(()=> store.state.Recurring_Journals.isEditing);
        const selectedJournal = computed(()=> store.state.Recurring_Journals.selectedJournal);
        const selectedRecurringJournal = computed(()=> store.state.Recurring_Journals.selectedRecurringJournal);
        const journalArray = computed(()=> store.state.Journals.journalArr);
        const journalID = ref('');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Client Name", key:"client"},
            {label: "Invoice", key:"journal_no"},
            {label: "Amount", key: "amount"},
            {label: "Frequency", key:"frequency"},
            {label: "Bill Day", key:"recurring_day"},
            {label: "Due Day", key:"due_day"},
            {label: "Mode", key:"due_day_mode"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Invoice', rightName: 'Adding Invoice'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Invoice', rightName: 'Deleting Invoice'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        
        const journal_no_search = ref("");
        const client_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const fetchInvoices = async() =>{
            await store.dispatch('Journals/fetchJournals', {company:companyID.value, txn_type:'INV'})
        };
        const searchFilters = ref([
            {type:'text', placeholder:"Invoice#...", value: journal_no_search, width:40,},
            {type:'text', placeholder:"Client Name...", value: client_search, width:48,},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        const handleSelectedJournal = async(option) =>{
            await store.dispatch('Journals/handleSelectedJournal', option)
            journalID.value = store.state.Journals.journalID;
        };
        const clearSelectedJournal = async() =>{
            await store.dispatch('Journals/updateState', {journalID: ''});
            journalID.value = ""
        };
        const formFields = ref([]);
        const journalValue = computed(() => {
            return (selectedRecurringJournal.value && selectedRecurringJournal.value.journal && !journalID.value) ? selectedRecurringJournal.value.journal.journal_id : journalID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Invoices", value: journalValue.value, componentKey: catComponentKey,
                    selectOptions: journalArray, optionSelected: handleSelectedJournal, required: true,
                    searchPlaceholder: 'Select Invoice...', dropdownWidth: '500px', updateValue: selectedJournal.value,
                    fetchData: fetchInvoices(),clearSearch: clearSelectedJournal()
                },
                { type: 'dropdown', name: 'frequency',label: "Repeat Frequency", value: selectedRecurringJournal.value?.frequency || 'Monthly', placeholder: "", required: true, options: [{ text: 'One Off', value: 'One Off' }, { text: 'Daily', value: 'Daily' },{ text: 'Weekly', value: 'Weekly' }, { text: 'Monthly', value: 'Monthly' },{ text: 'Annually', value: 'Annually' }] },
                { type: 'date', name: 'start_date',label: "Start Date", value: selectedRecurringJournal.value?.start_date || '', required: true },
                { type: 'date', name: 'end_date',label: "End Date", value: selectedRecurringJournal.value?.end_date || null, required: false },
                { type: 'number', name: 'recurring_day',label: "Invoice Day", value: selectedRecurringJournal.value?.recurring_day || 1, required: true },
                { type: 'number', name: 'due_day',label: "Due Day", value: selectedRecurringJournal.value?.due_day || 1, required: true },
                { type: 'dropdown', name: 'due_day_mode',label: "Due Day Mode", value: selectedRecurringJournal.value?.due_day_mode || 'Current Month', placeholder: "", required: true, options: [{ text: 'Of Current Month', value: 'Current Month' }, { text: 'Of The Following Month', value: 'Following Month' },{ text: 'Days After Invoice Date', value: 'After Invoice Date' }] },

            ];
        };
        const handleReset = () =>{
            for(let i=1; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            journalID.value = "";
            catComponentKey.value += 1;
        }

        watch([selectedRecurringJournal, selectedJournal], () => {
            if (selectedRecurringJournal.value && selectedJournal.value) {
                updateFormFields();
                catComponentKey.value += 1;
            }
            
        }, { immediate: true });
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createRecurringInvoice = async() =>{
            showModalLoader();
            let formData = {
                start_date: formFields.value[2].value,
                end_date: formFields.value[3].value || null,
                recurring_day: formFields.value[4].value,
                due_day: formFields.value[5].value,
                due_day_mode: formFields.value[6].value,
                journal: journalID.value,
                journal_id: journalID.value,
                current_journal: journalID.value,
                current_journal_id: journalID.value,
                frequency: formFields.value[1].value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(journalID.value == ""){
                errors.value.push('Error');
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Recurring_Journals/createRecurringJournal', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Success!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the Invoice.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Invoice: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchInvoices();
                }
            }
        }
        const updateRecurringInvoice = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                recurring_journal: selectedRecurringJournal.value.recurring_journal_id,
                start_date: formFields.value[2].value,
                end_date: formFields.value[3].value || null,
                recurring_day: formFields.value[4].value,
                due_day: formFields.value[5].value,
                due_day_mode: formFields.value[6].value,
                journal: journalValue.value,
                journal_id: journalValue.value,
                frequency: formFields.value[1].value,
                company: companyID.value
            }

            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value ==''){
                    errors.value.push('Error');
                }
            }
            if(journalValue.value == ""){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Recurring_Journals/updateRecurringJournal', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Invoice updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Invoice.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Invoice: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Journals/updateState",{selectedJournal:null, selectedRecurringJournal:null,})
                    searchInvoices();
                }             
            }
        }
        const saveInvoice = () =>{
            if(isEditing.value == true){
                updateRecurringInvoice();
            }else{
                createRecurringInvoice();
            }
        }
        const removeInvoice = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    recurring_journal: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Recurring_Journals/deleteRecurringJournal',formData)
                    if(response && response.status == 200){
                        toast.success("Invoice Removed Succesfully");
                        searchInvoices();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Invoice: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Invoice") 
            }else{
                toast.error("Please Select An Invoice To Remove")
            }
        }
        const removeInvoices = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    recurring_journal: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Recurring_Journals/deleteRecurringJournal',formData)
                    if(response && response.status == 200){
                        toast.success("Invoice(s) Removed Succesfully");
                        searchInvoices();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Invoice: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select An Invoice To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchInvoices = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                client: client_search.value,
                journal_no: journal_no_search.value,
                start_date: from_date_search.value,
                end_date: to_date_search.value,
                txn_type: 'INV',
                company: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/recurring-journals-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                invoiceList.value = response.data.results;
                store.commit('Recurring_Journals/LIST_JOURNALS', invoiceList.value)
                propResults.value = response.data;
                propArrLen.value = invoiceList.value.length;
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
            searchInvoices(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            journal_no_search.value = "";
            client_search.value = "";
            catComponentKey.value += 1;
            from_date_search.value = "";
            to_date_search.value = "";
            searchInvoices();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchInvoices();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchInvoices();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchInvoices();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchInvoices();
            // scrollToTop();
        }
        const addNewInvoice = () =>{
            updateFormFields();
            store.dispatch("Recurring_Journals/updateState",{selectedJournal:null, selectedRecurringJournal:null, isEditing:false})
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const billID = row[idField];
                let formData = {
                    company: companyID.value,
                    recurring_journal: billID
                }
                await store.dispatch('Recurring_Journals/fetchRecurringJournal',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const billID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    recurring_journal: billID
                }
                await store.dispatch('Recurring_Journals/deleteRecurringJournal',formData).
                then(()=>{
                    searchInvoices();
                })
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchInvoices();
        })
        return{
            title, searchInvoices,resetFilters, addButtonLabel, searchFilters, tableColumns, invoiceList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewInvoice, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveInvoice, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeInvoice, removeInvoices, handleReset,addingRight,removingRight,rightsModule,selectSearchQuantity,selectedValue
        }
    }
};
</script>