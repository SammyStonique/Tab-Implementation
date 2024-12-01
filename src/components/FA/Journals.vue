<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewJournal"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchJournals"
            @resetFilters="resetFilters"
            @removeItem="removeJournal"
            @removeSelectedItems="removeJournals"
            @printList="printJournalsList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="journalsList"
            :actions="actions"
            :showTotals="showTotals"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
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
    name: 'Journals',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const { getYear } = useDateFormatter();
        const { getMonth } = useDateFormatter();
        const addingRight = ref('Adding Journal');
        const rightsModule = ref('Accounts');
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'journal_id';
        const addButtonLabel = ref('New Journal');
        const submitButtonLabel = ref('Add');
        const title = ref('Invoice Booking');
        const invModalVisible = ref(false);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const selectedIds = ref([]);
        const journalsList = ref([]);
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
        const ledgerID = ref('');
        const ledgersArray = computed(() => store.state.Ledgers.ledgerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Journal#", key:"journal_no"},
            {label: "Date", key: "issue_date"},
            {label: "Description", key:"description"},
            {label: "Amount", key:"total_amount", type:"number"},
            {label: "Done By", key:"done_by"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Journal', rightName: 'Deleting Journal'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const journal_no_search = computed({
            get: () => store.state.Journals.journal_no_search,
            set: (value) => store.commit('Journals/SET_SEARCH_FILTERS', {"journal_no_search":value}),
        });
        const description_search = computed({
            get: () => store.state.Journals.description_search,
            set: (value) => store.commit('Journals/SET_SEARCH_FILTERS', {"description_search":value}),
        });
        const min_amount_search = computed({
            get: () => store.state.Journals.min_amount_search,
            set: (value) => store.commit('Journals/SET_SEARCH_FILTERS', {"min_amount_search":value}),
        });
        const max_amount_search = computed({
            get: () => store.state.Journals.max_amount_search,
            set: (value) => store.commit('Journals/SET_SEARCH_FILTERS', {"max_amount_search":value}),
        });
        const from_date_search = computed({
            get: () => store.state.Journals.from_date_search,
            set: (value) => store.commit('Journals/SET_SEARCH_FILTERS', {"from_date_search":value}),
        });
        const to_date_search = computed({
            get: () => store.state.Journals.to_date_search,
            set: (value) => store.commit('Journals/SET_SEARCH_FILTERS', {"to_date_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Journal No...", value: journal_no_search, width:36},
            {type:'text', placeholder:"Description...", value: description_search, width:64},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            {type:'text', placeholder:"Min Amount...", value: min_amount_search, width:36},
            {type:'text', placeholder:"Max Amount...", value: max_amount_search, width:36},
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
        const addNewJournal = () =>{
            store.commit('pageTab/ADD_PAGE', {'FA':'Journal_Details'});
            store.state.pageTab.faActiveTab = 'Journal_Details'; 
        }
        const removeJournal = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    journal: selectedIds.value,
                    txn_type: "JNL"
                }
                try{
                    const response = await store.dispatch('Journals/deleteJournal',formData)
                    if(response && response.status == 200){
                        toast.success("Journal Removed Succesfully");
                        searchJournals();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Journal: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    searchJournals();
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Journal") 
            }else{
                toast.error("Please Select A Journal To Remove")
            }
        }
        const removeJournals = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    journal: selectedIds.value,
                    txn_type: "JNL"
                }

                try{
                    const response = await store.dispatch('Journals/deleteJournal',formData)
                    if(response && response.msg == "Success"){
                        toast.success("Journal(s) Removed Succesfully");
                        searchJournals();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Journals: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    searchJournals();
                }
            }else{
                toast.error("Please Select A Journal To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchJournals = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                description: description_search.value,
                txn_type: "JNL",
                status: "",
                client: "",
                reference_no: "",
                payment_method: "",
                journal_no: journal_no_search.value,
                min_amount: min_amount_search.value,
                max_amount: max_amount_search.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                client_category: "",
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
   
            axios
            .post(`api/v1/journals-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                journalsList.value = response.data.results;
                store.commit('Journals/LIST_JOURNALS', journalsList.value)
                propResults.value = response.data;
                propArrLen.value = journalsList.value.length;
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
            searchJournals(selectedValue.value);
        };
        const resetFilters = () =>{
            store.commit('Journals/RESET_SEARCH_FILTERS')
            searchJournals();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchJournals();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchJournals();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchJournals();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchJournals();
            // scrollToTop();
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const journalID = [row['journal_id']];
                let formData = {
                    company: companyID.value,
                    journal: journalID,
                    txn_type: "JNL"
                }
                await store.dispatch('Journals/deleteJournal',formData)
                searchJournals();
            }
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
        };
        const printJournalsList = () =>{
            showLoader();

            let formData = {
                description: description_search.value,
                txn_type: "JNL",
                status: "",
                client: "",
                reference_no: "",
                payment_method: "",
                journal_no: journal_no_search.value,
                min_amount: min_amount_search.value,
                max_amount: max_amount_search.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                client_category: "",
                company_id: companyID.value
            }
            axios
            .post("api/v1/export-journals-pdf/", formData, { responseType: 'blob' })
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
            searchJournals();
            
        })
        return{
            showTotals,title, searchJournals,resetFilters, addButtonLabel, searchFilters, tableColumns, journalsList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,invModalVisible,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeJournal, removeJournals, dropdownOptions, handleDynamicOption, addNewJournal, printJournalsList,addingRight,rightsModule,
            selectSearchQuantity,selectedValue
        }
    }
};
</script>