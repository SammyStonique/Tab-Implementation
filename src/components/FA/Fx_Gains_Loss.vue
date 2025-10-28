<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        :showAddButton="showAddButton"
        :searchFilters="searchFilters"
        @searchPage="searchFxGains"
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
        :selectedValue="selectedValue"
        @selectSearchQuantity="selectSearchQuantity"
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
    name: 'Fx_Gains_Loss',
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
        const idField = 'fx_gain_loss_id';
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const transactionsList = ref([]);
        const appResults = ref([]);
        const appArrLen = ref(0);
        const appCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
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
            {label: "Date", key:"date",type: "text"},
            {label: "Base Currency", key:"from_currency",type: "text"},
            {label: "Quote Currency", key:"to_currency",type: "text"},
            {label: "Ex Rate Inv", key:"ex_rate_invoice",type: "text"},
            {label: "Ex Rate Rcpt", key:"ex_rate_receipt",type: "text"},
            {label: "Type", key: "gain_loss_type", type: "text"},
            {label: "Amount", key:"gain_loss_amount",type: "number"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Tax Transaction'},
        ])
        const fx_type_search = ref("");
        const base_currency_search = ref("");
        const target_currency_search = ref("");
        const date_from_search = ref("");
        const date_to_search = ref("");

        const searchFilters = ref([
            {type:'text', placeholder:"Base Curr Code...", value: base_currency_search, width:36},
            {type:'text', placeholder:"Target Curr Code...", value: target_currency_search, width:36},
            {type:'date', placeholder:"From Date...", value: date_from_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: date_to_search, width:36, title: "Date To Search"},
            {
                type:'dropdown', placeholder:"Type..", value: fx_type_search, width:40,
                options: [{text:'Gain',value:'Gain'},{text:'Loss',value:'Loss'}]
            },
            
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
                searchFxGains();     
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
        const searchFxGains = () =>{
            showLoader();
            let formData = {
                currency_to: target_currency_search.value,
                fx_type: fx_type_search.value,
                currency_from: base_currency_search.value,
                from_date: date_from_search.value,
                to_date: date_to_search.value,
                company: companyID.value,
                page_size: selectedValue.value
            }
 
            axios
            .post(`api/v1/fx-gains-loss-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                transactionsList.value = response.data.results;
                appResults.value = response.data;
                appArrLen.value = transactionsList.value.length;
                appCount.value = appResults.value.count;
                pageCount.value = Math.ceil(appCount.value / selectedValue.value);
                
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
        };
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchFxGains(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchFxGains();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchFxGains();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchFxGains();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchFxGains();
        }
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedIds.value = [];
            base_currency_search.value = "";
            target_currency_search.value = "";
            date_from_search.value = "";
            date_to_search.value = "";
            fx_type_search.value = "";
            searchFxGains();
        }
        const closeModal = () =>{

        }
        const printTransactionsList = () =>{
            showLoader();

            let formData = {
                currency_to: target_currency_search.value,
                fx_type: fx_type_search.value,
                currency_from: base_currency_search.value,
                from_date: date_from_search.value,
                to_date: date_to_search.value,
                company: companyID.value,
                page_size: selectedValue.value
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
            searchFxGains();
        })
        return{
            showAddButton,showTotals,title, searchFxGains, idField, selectedIds, actions, transactionsList, appArrLen,appCount,appResults,appModalVisible,formFields,
            addButtonLabel, searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,currentPage,
            showNextBtn,showPreviousBtn, handleActionClick,displayButtons,handleReset,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            closeModal, handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,printTransactionsList,selectSearchQuantity,selectedValue
        }
    }
}
</script>
