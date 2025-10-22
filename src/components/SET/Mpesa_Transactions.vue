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
        @removeItem="removeTransaction"
        @removeSelectedItems="removeTransactions"
        :removingRight="removingRight"
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

export default{
    name: 'Mpesa_Transactions',
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
        const removingRight = ref('Deleting Mpesa Transactions');
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const txnID = ref(null);
        const idField = 'mpesa_transaction_id';
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
            {label: "Date", key:"recording_date"},
            {label: "Txn Date", key:"transaction_time"},
            {label: "Type", key:"transaction_type"},
            {label: "Paybill#", key: "shortcode"},
            {label: "Phone No", key:"phone_number"},
            {label: "Reference No", key:"reference"},
            {label: "Bill Ref", key:"bill_reference"},
            {label: "Amount", key:"formatted_amount", type: "number"},
            {label: "F.Name", key:"first_name"},
            {label: "L.Name", key:"last_name"},
            {label: "Posted", key:"posted", textColor:"textColor"},
            {label: "Receipt#", key:"receipt_no", textColor:"textColor"},
            {label: "Offl.", key:"offline", textColor:"textColor"},
            {label: "Corr.", key:"corrected_txn", textColor:"textColor"},
            {label: "Corr. Ref", key:"corrected_ref_no", textColor:"textColor"},
            {label: "Corrected By", key:"corrected_by", textColor:"textColor"},
            {label: "Error", key:"posting_error", textColor:"textColor"},
        ])
        const showTotals = ref(true);
        const showActions = ref(true);
        const actions = ref([
            {name: 'correct-txn', icon: 'fa fa-check-circle', title: 'Correct Mpesa Txn', rightName: 'Correct Mpesa Transactions'},
            {name: 'add-receipt', icon: 'fa fa-receipt', title: 'Add Receipt', rightName: 'Correct Mpesa Transactions'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Item', rightName: 'Deleting Mpesa Transactions'},
        ])
        const date_from_search = ref("");
        const date_to_search = ref("");
        const posted_status_search = ref("");
        const reference_no_search = ref("");
        const amount_search = ref("");
        const phone_number_search = ref("");
        const offline_search = ref("");
        const corrected_search = ref("");

        const searchFilters = ref([
            {type:'date', placeholder:"From Date...", value: date_from_search, width:30,},
            {type:'date', placeholder:"To Date...", value: date_to_search, width:30,},
            {type:'text', placeholder:"Reference...", value: reference_no_search, width:44,},
            {type:'text', placeholder:"Amount...", value: amount_search, width:44,},
            {type:'text', placeholder:"Phone No...", value: phone_number_search, width:44,},
            {
                type:'dropdown', placeholder:"Posted", value: posted_status_search, width:36,
                options: [{text:'Yes',value:'Yes'},{text:'No',value:'No'}]
            },
            {
                type:'dropdown', placeholder:"Offline", value: offline_search, width:36,
                options: [{text:'Yes',value:'Yes'},{text:'No',value:'No'}]
            },
            {
                type:'dropdown', placeholder:"Corrected", value: corrected_search, width:36,
                options: [{text:'Yes',value:'Yes'},{text:'No',value:'No'}]
            },
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
        };
        const removeTransaction = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    mpesa_transaction: selectedIds.value
                }
                try{
                    const response = await axios.post('api/v1/delete-mpesa-transaction/', formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Success");
                        searchTransactions();
                    }else if(response && response.data.msg == "Failed"){
                        toast.error("Failed To Remove Transaction");
                        searchTransactions();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Transaction: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Transaction") 
            }else{
                toast.error("Please Select A Transaction To Remove")
            }
        }
        const removeTransactions = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    mpesa_transaction: selectedIds.value
                }
                try{
                    const response = await axios.post('api/v1/delete-mpesa-transaction/', formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Success");
                        searchTransactions();
                    }else if(response && response.data.msg == "Failed"){
                        toast.error("Failed To Remove Transaction");
                        searchTransactions();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Transaction: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Transaction To Remove")
            }
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
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                posted_status: posted_status_search.value,
                phone_number: phone_number_search.value,
                reference_no: reference_no_search.value,
                amount: amount_search.value,
                corrected: corrected_search.value,
                offline: offline_search.value,
                company: companyID.value,
                page_size: selectedValue.value,
            } 
            axios
            .post(`api/v1/mpesa-transactions-search/?page=${currentPage.value}`,formData)
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
        }
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchTransactions(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            date_from_search.value = "";
            date_to_search.value = "";
            posted_status_search.value = "";
            phone_number_search.value = "";
            reference_no_search.value = "";
            amount_search.value = "";
            corrected_search.value = "";
            offline_search.value = "";
            searchTransactions();
        }
        const closeModal = () =>{

        };
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'correct-txn'){
                txnID.value = row[idField];
                billRef.value = row['bill_reference'];
                shortCode.value = row['shortcode'];
                const posted = row['posted'];
                if(posted == "Yes"){
                    toast.error("Transaction Already Posted!")
                }else{
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                    updateFormFields();
                    appModalVisible.value = true;
                }
            }
            else if(action == 'add-receipt'){
                const posted = row['posted'];
                if(posted == "Yes"){
                    toast.error("Transaction Already Posted!")
                }else{
                    store.commit('pageTab/ADD_PAGE', {'MMS':'Receipt_Details'});
                    await store.dispatch('Members/updateState', {mpesaReceipt: row,receiptItems: [],outstandingBalance: 0});
                    store.state.pageTab.mmsActiveTab = 'Receipt_Details'; 
                }
            }
        };
        const correctTransaction = async() =>{
            showModalLoader();
            let formData = {
                transaction: txnID.value,
                bill_reference: formFields.value[0].value,
                date: formFields.value[1].value,
                short_code: shortCode.value,
                company: companyID.value,
                user: userID.value
            }
            await axios.post(`api/v1/correct-mpesa-transaction/`,formData)
            .then((response)=>{
                if(response.data.msg == "Success"){
                    toast.success("Success")
                    appModalVisible.value = false;
                    handleReset();
                }else if(response.data.msg == "Exists"){
                    toast.error("Duplicate Reference No")
                }else if(response.data.msg == "DoesNotExist"){
                    toast.error("Member Does Not Exist")
                }else{
                    toast.error("Error Correcting Transaction");
                }                   
            })
            .catch((error)=>{
                toast.error(error.message)
                hideModalLoader();
            })
            .finally(()=>{
                hideModalLoader();
                searchTransactions();
            })
        };
        const dropdownOptions = ref([
            {label: 'Offline Upload', action: 'offline-upload', icon: 'fa-cloud-upload', colorClass: 'text-blue-600', rightName: 'Correct Mpesa Transactions'}, 
        ]);
        const handleDynamicOption = async(option) =>{
            if( option == 'offline-upload'){
                store.commit('pageTab/ADD_PAGE', {'MMS':'Mpesa_Offline_Uploads'});
                store.state.pageTab.mmsActiveTab = 'Mpesa_Offline_Uploads';        
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
            closeModal, handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,printTransactionsList,
            removingRight,removeTransaction,removeTransactions
        }
    }
}
</script>
