<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :showAddButton="showAddButton"
        :searchFilters="searchFilters"
        @searchPage="searchTransactions"
        @resetFilters="resetFilters"
        @removeItem=""
        @removeSelectedItems=""
        @printList="printTransactionsList"
        :columns="tableColumns"
        :rows="txnList"
        :actions="actions"
        :showActions="showActions"
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
    name: 'Mpesa_Transactions',
    props: ['scrollToTop','loader','showLoader','hideLoader',],
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const showAddButton = ref(false);
        const pageComponentKey = ref(0);
        const title = ref('Mpesa Transactions');
        const companyID = computed(()=> store.state.userData.company_id);
        const txnID = ref(null);
        const idField = 'mpesa_transaction_id';
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const txnList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
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
            {label: "Date", key:"recording_date"},
            {label: "Txn Date", key:"transaction_time"},
            {label: "Type", key:"transaction_type"},
            {label: "Short Code", key: "shortcode"},
            {label: "Phone No", key:"phone_number"},
            {label: "Reference No", key:"reference"},
            {label: "Bill Ref", key:"bill_reference"},
            {label: "Amnt", key:"amount", type: "number"},
            {label: "Posted", key:"posted"},
            {label: "Receipt#", key:"receipt_no"},
        ])
        const showTotals = ref(true);
        const showActions = ref(false);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Item'},
        ])
        const date_from_search = computed({
            get: () => store.state.Mpesa_Transactions.date_from_search,
            set: (value) => store.commit('Mpesa_Transactions/SET_SEARCH_FILTERS', {"date_from_search":value}),
        });
        const date_to_search = computed({
            get: () => store.state.Mpesa_Transactions.date_to_search,
            set: (value) => store.commit('Mpesa_Transactions/SET_SEARCH_FILTERS', {"date_to_search":value}),
        });
        const posted_status_search = computed({
            get: () => store.state.Mpesa_Transactions.posted_status_search,
            set: (value) => store.commit('Mpesa_Transactions/SET_SEARCH_FILTERS', {"posted_status_search":value}),
        });
        const reference_no_search = computed({
            get: () => store.state.Mpesa_Transactions.reference_no_search,
            set: (value) => store.commit('Mpesa_Transactions/SET_SEARCH_FILTERS', {"reference_no_search":value}),
        });
        const amount_search = computed({
            get: () => store.state.Mpesa_Transactions.amount_search,
            set: (value) => store.commit('Mpesa_Transactions/SET_SEARCH_FILTERS', {"amount_search":value}),
        });
        const phone_number_search = computed({
            get: () => store.state.Mpesa_Transactions.phone_number_search,
            set: (value) => store.commit('Mpesa_Transactions/SET_SEARCH_FILTERS', {"phone_number_search":value}),
        });

        const searchFilters = ref([
            {type:'date', placeholder:"From Date...", value: date_from_search, width:30,},
            {type:'date', placeholder:"To Date...", value: date_to_search, width:30,},
            {type:'text', placeholder:"Reference...", value: reference_no_search, width:44,},
            {type:'text', placeholder:"Amount...", value: amount_search, width:44,},
            {type:'text', placeholder:"Phone No...", value: phone_number_search, width:44,},
            {
                type:'dropdown', placeholder:"Posted", value: posted_status_search, width:48,
                options: [{text:'Yes',value:'Yes'},{text:'No',value:'No'}]
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

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
        const searchTransactions = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                posted_status: posted_status_search.value,
                phone_number: phone_number_search.value,
                reference_no: reference_no_search.value,
                amount: amount_search.value,
                company: companyID.value
            } 
            axios
            .post(`api/v1/mpesa-transactions-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                txnList.value = response.data.results;
                propResults.value = response.data;
                propArrLen.value = txnList.value.length;
                propCount.value = propResults.value.count;
                pageCount.value = Math.ceil(propCount.value / 50);
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
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchTransactions();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchTransactions();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchTransactions();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchTransactions();
        }
        const resetFilters = () =>{
            store.commit('Mpesa_Transactions/RESET_SEARCH_FILTERS')
            searchTransactions();
        }
        const closeModal = () =>{

        }
        const printTransactionsList = () =>{
            showLoader();
            let formData = {
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                posted_status: posted_status_search.value,
                phone_number: phone_number_search.value,
                reference_no: reference_no_search.value,
                amount: amount_search.value,
                company: companyID.value
            } 

            axios
            .post("api/v1/export-mpesa-transactions-pdf/", formData, { responseType: 'blob' })
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
            searchTransactions();
        })
        return{
            showAddButton,showActions,showTotals,title, searchTransactions, idField, selectedIds, actions, txnList, propArrLen,propCount,propResults,appModalVisible,
            searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,
            showNextBtn,showPreviousBtn,displayButtons,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            closeModal, handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,printTransactionsList
        }
    }
}
</script>
