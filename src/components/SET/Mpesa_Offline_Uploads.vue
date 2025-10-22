<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :showAddButton="showAddButton"
        :searchFilters="searchFilters"
        @searchPage="searchTransactions"
        @resetFilters="resetFilters"
        :dropdownOptions="dropdownOptions"
        @handleDynamicOption="handleDynamicOption"
        @removeItem=""
        @removeSelectedItems=""
        @importData="importTransactions"
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
        :selectedValue="selectedValue"
        @selectSearchQuantity="selectSearchQuantity"
    />
    <MovableModal v-model:visible="appModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
    >
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="correctTransaction" @handleReset="handleReset"
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
import { useDateFormatter } from '@/composables/DateFormatter';
import PrintJS from 'print-js';
import Swal from 'sweetalert2';

export default{
    name: 'Mpesa_Offline_Uploads',
    props: ['scrollToTop','loader','showLoader','hideLoader',],
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('none');
        const modal_loader = ref('none');
        const showAddButton = ref(false);
        const pageComponentKey = ref(0);
        const title = ref('Correct & Post Txn');
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const txnID = ref(null);
        const idField = 'offline_upload_id';
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const billRef = ref('');
        const computedBillRef = computed(()=> billRef.value);
        const shortCode = ref('');
        const txnList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const selectedValue = ref(50);
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
            {label: "Date", key:"date"},
            {label: "Paybill#", key: "short_code"},
            {label: "Done By", key:"done_by"},
        ])
        const showTotals = ref(false);
        const showActions = ref(true);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Upload', rightName: 'Deleting Offline Upload'},
        ])
        const date_from_search = ref("");
        const date_to_search = ref("");
        const short_code_search = ref("");

        const searchFilters = ref([
            {type:'text', placeholder:"Short Code...", value: short_code_search, width:44,},
            {type:'date', placeholder:"From Date...", value: date_from_search, width:32,},
            {type:'date', placeholder:"To Date...", value: date_to_search, width:32,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'bill_ref',label: "Reference Code", value: computedBillRef.value || '', required: true },
                { type: 'date', name: 'recording_date',label: "Txn Date", value: formatDate(current_date), required: false },
            ]
        };
        const handleReset = () =>{
            txnID.value = null;
            billRef.value = "";
            shortCode.value = "";
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
        const searchTransactions = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                from_date: date_from_search.value,
                to_date: date_to_search.value,
                short_code: short_code_search.value,
                company: companyID.value,
                page_size: selectedValue.value,
            } 
            axios
            .post(`api/v1/mpesa-offline-uploads-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                txnList.value = response.data.results;
                propResults.value = response.data;
                propArrLen.value = txnList.value.length;
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
        };
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchTransactions(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            
            searchTransactions();
        }
        const closeModal = () =>{

        };
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == "delete"){
                let formData = {
                    offline_upload: [row[idField]],
                    company: companyID.value
                }
                Swal.fire({
                    title: "Are you sure?",
                    text: `Do you wish to delete Upload?`,
                    type: 'warning',
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Yes Delete Upload!',
                    cancelButtonText: 'Cancel!',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom',
                    },
                    showLoaderOnConfirm: true,
                    }).then((result) => {
                    if (result.value) {
                        axios.post(`api/v1/delete-mpesa-offline-upload/`,formData)
                        .then((response)=>{
                        if(response.data.msg == "Success"){
                            Swal.fire("Poof! Upload removed succesfully!", {
                                icon: "success",
                            });
                            searchTransactions(); 
                        }else{
                            Swal.fire({
                            title: "Error Deleting Upload",
                            icon: "warning",
                            });
                        }                   
                        })
                        .catch((error)=>{
                        console.log(error.message);
                        Swal.fire({
                            title: error.message,
                            icon: "warning",
                        });
                        })
                    }else{
                        Swal.fire(`Upload has not been deleted!`);
                    }
                })
            }
        };
        const correctTransaction = async() =>{
            
        };
        const importTransactions = () =>{
            store.commit('pageTab/ADD_PAGE', {'MMS':'Import_Mpesa_Txns'})
            store.state.pageTab.mmsActiveTab = 'Import_Mpesa_Txns';
        }
        const dropdownOptions = ref([
 
        ]);
        const handleDynamicOption = async(option) =>{
            if( option == 'offline-upload'){
                            
            }
        };
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
            searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,formFields,handleReset,selectSearchQuantity,selectedValue,
            showNextBtn,showPreviousBtn,displayButtons,dropdownOptions,handleDynamicOption,handleActionClick,correctTransaction,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            closeModal, handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,printTransactionsList,importTransactions
        }
    }
}
</script>
