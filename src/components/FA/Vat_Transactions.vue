<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        :showAddButton="showAddButton"
        :searchFilters="searchFilters"
        @searchPage="searchTaxTransactions"
        @resetFilters="resetFilters"
        @removeItem=""
        @removeSelectedItems=""
        @printList="printTransactionsList"
        :columns="tableColumns"
        :rows="transactionsList"
        :actions="actions"
        :showTotals="showTotals"
        :idField="idField"
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
            :displayButtons="displayButtons" @handleSubmit="" @handleReset="handleReset"
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
import PrintJS from 'print-js';

export default{
    name: 'Vat_Transactions',
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
        const showAddButton = ref(false);
        const pageComponentKey = ref(0);
        const title = ref('Vat Transaction');
        const companyID = computed(()=> store.state.userData.company_id);
        const taxRates = computed(() => store.getters['Taxes/getFormatedTax']);
        const idField = 'tax_transaction_id';
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const transactionsList = ref([]);
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
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('35vw');
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date",type: "text", editable: false},
            {label: "Type", key:"tax_category",type: "text", editable: false},
            {label: "Client Name", key:"client",type: "text", editable: false},
            {label: "Invoice#", key:"invoice_no",type: "text", editable: false},
            {label: "Description", key:"description",type: "text", editable: false},
            {label: "Rate", key: "tax_rate", type: "text", editable: false},
            {label: "Amount", key:"amount",type: "number", editable: false},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Tax Transaction'},
        ])
        const tax_type_search = computed({
            get: () => store.state.Taxes.tax_type_search,
            set: (value) => store.commit('Taxes/SET_SEARCH_FILTERS', {"tax_type_search":value}),
        });
        const tax_inclusivity_search = computed({
            get: () => store.state.Taxes.tax_inclusivity_search,
            set: (value) => store.commit('Taxes/SET_SEARCH_FILTERS', {"tax_inclusivity_search":value}),
        });
        const invoice_no_search = computed({
            get: () => store.state.Taxes.invoice_no_search,
            set: (value) => store.commit('Taxes/SET_SEARCH_FILTERS', {"invoice_no_search":value}),
        });
        const tax_category_search = computed({
            get: () => store.state.Taxes.tax_category_search,
            set: (value) => store.commit('Taxes/SET_SEARCH_FILTERS', {"tax_category_search":value}),
        });
        const date_from_search = computed({
            get: () => store.state.Taxes.date_from_search,
            set: (value) => store.commit('Taxes/SET_SEARCH_FILTERS', {"date_from_search":value}),
        });
        const date_to_search = computed({
            get: () => store.state.Taxes.date_to_search,
            set: (value) => store.commit('Taxes/SET_SEARCH_FILTERS', {"date_to_search":value}),
        });

        const searchFilters = ref([
            {type:'text', placeholder:"Invoice...", value: invoice_no_search, width:36},
            {
                type:'dropdown', placeholder:"Category..", value: tax_category_search, width:40,
                options: [{text:'Input',value:'Input'},{text:'Output',value:'Output'}]
            },
            {type:'date', placeholder:"From Date...", value: date_from_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: date_to_search, width:36, title: "Date To Search"},
            {
                type:'dropdown', placeholder:"Inclusivity..", value: tax_inclusivity_search, width:40,
                options: [{text:'Inclusive',value:'Inclusive'},{text:'Exclusive',value:'Exclusive'}]
            },
            // {
            //     type:'dropdown', placeholder:"Type..", value: tax_type_search, width:40,
            //     options: taxRates
            // },
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const formFields = ref([]);
        const handleReset = () =>{


        }
        
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const transactionID = [row['tax_transaction_id']];
                let formData = {
                    company: companyID.value,
                    tax_transaction: transactionID
                }
                await store.dispatch('Taxes/deleteTaxTransactions',formData)
                searchTaxTransactions();     
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
        const searchTaxTransactions = () =>{
            showLoader();
            let formData = {
                tax_type: "VAT",
                tax_category: tax_category_search.value,
                tax_inclusivity: tax_inclusivity_search.value,
                invoice_no: invoice_no_search.value,
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                company_id: companyID.value
            }
 
            axios
            .post(`api/v1/tax-transactions-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                transactionsList.value = response.data.results;
                store.commit('Prepayment_Allocations/LIST_PREPAYMENT_ALLOCATIONS', transactionsList.value)
                appResults.value = response.data;
                appArrLen.value = transactionsList.value.length;
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
            
            searchTaxTransactions();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchTaxTransactions();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchTaxTransactions();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchTaxTransactions();
        }
        const resetFilters = () =>{
            store.commit('Taxes/RESET_SEARCH_FILTERS')
            searchTaxTransactions();
        }
        const closeModal = () =>{

        }
        const fetchTaxes = async() =>{
            await store.dispatch('Taxes/fetchTaxes', {company:companyID.value})
        };
        const printTransactionsList = () =>{
            showLoader();

            let formData = {
                tax_type: "VAT",
                tax_category: tax_category_search.value,
                tax_inclusivity: tax_inclusivity_search.value,
                invoice_no: invoice_no_search.value,
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                company_id: companyID.value
            } 

            axios
            .post("api/v1/export-tax-transactions-pdf/", formData, { responseType: 'blob' })
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
        onMounted(() =>{
            fetchTaxes();
            searchTaxTransactions();
        })
        return{
            showAddButton,showTotals,title, searchTaxTransactions, idField, selectedIds, actions, transactionsList, appArrLen,appCount,appResults,appModalVisible,formFields,
            addButtonLabel, searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,
            showNextBtn,showPreviousBtn, handleActionClick,displayButtons,handleReset,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            closeModal, handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,printTransactionsList
        }
    }
}
</script>
