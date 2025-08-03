<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        :showAddButton="showAddButton"
        :searchFilters="searchFilters"
        :dropdownOptions="dropdownOptions"
        @handleDynamicOption="handleDynamicOption"
        @searchPage="searchLoanArrears"
        @resetFilters="resetFilters"
        @removeItem="removeAllocation"
        @removeSelectedItems="removeAllocations"
        @printList="printArrearsList"
        v-model:printModalVisible="printModalVisible"
        :printTitle="printTitle"
        :pdfUrl="pdfUrl"
        :columns="tableColumns"
        :rows="arrearsList"
        :actions="actions"
        :rightsModule="rightsModule"
        :idField="idField"
        :showTotals="showTotals"
        @handleSelectionChange="handleSelectionChange"
        @handleActionClick="handleActionClick"
        @handleOpenLink="handleOpenLink"
        :groupingKey=true
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
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :saveButtonLabel="'Print'"
            :displayButtons="displayButtons" @handleSubmit="printArrearsList" @handleReset="handleReset"
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
    name: 'Loan_Arrears',
    props: ['scrollToTop','loader','showLoader','hideLoader',],
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const pageComponentKey = ref(0);
        const propComponentKey = ref(0);
        const riskComponentKey = ref(0);
        const showAddButton = ref(false);
        const title = ref('Print Loan Arrears');
        const companyID = computed(()=> store.state.userData.company_id);
        const idField = 'tenant_lease_id';
        const rightsModule = ref('MMS');
        const productID = ref('');
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const printModalVisible = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Loan Arrears');
        const arrearsList = ref([]);
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
        const errors = ref([]);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('45vw');
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Loan No", key:"loan_number",type: "link"},
            {label: "Member No", key:"member_number"},
            {label: "Member Name", key:"member_name"},
            {label: "Phone No", key:"phone_number"},
            {label: "Email", key:"member_email"},
            // {label: "Loan Product", key:"product_name"},
            {label: "Loan Amount", key: "loan_amount", type: "number"},
            {label: "Principal Arrears", key: "principal_arrears", type: "number"},
            {label: "Interest Arrears", key: "interest_arrears", type: "number"},
            {label: "Total Outstanding", key: "total_arrears", type: "number"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'send-sms', icon: 'fas fa-comment', title: 'Send SMS', rightName: 'Sending MMS SMS'},
            {name: 'send-email', icon: 'fas fa-envelope', title: 'Send Email', rightName: 'Sending MMS Emails'},
        ])
        const member_name_search = ref("");
        const member_number_search = ref("");
        const date_search = ref("");
        const products_array = computed(()=> store.state.Loan_Products.productArr);
        const handleSelectedProduct = async(option) =>{
            await store.dispatch('Loan_Products/handleSelectedProduct', option)
            productID.value = store.state.Loan_Products.productID;
        };
        const clearSelectedProduct = async() =>{
            await store.dispatch('Loan_Products/updateState', {productID: ''});
            productID.value = store.state.Loan_Products.productID;
        };
        const searchFilters = ref([
            {
                type:'search-dropdown', value: productID.value, width:48, componentKey: propComponentKey,
                selectOptions: products_array, optionSelected: handleSelectedProduct,
                searchPlaceholder: 'Loan Product...', dropdownWidth: '300px',
                fetchData: store.dispatch('Loan_Products/fetchLoanProducts', {company:companyID.value}),
                clearSearch: clearSelectedProduct
            },
            {type:'text', placeholder:"Member No...", value: member_number_search, width:32},
            {type:'text', placeholder:"Member Name...", value: member_name_search, width:48},
            {type:'date', placeholder:"Date...", value: date_search, width:32, title: "As At Date Search"},

            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleOpenLink = async(row) =>{
            const applicationID = row['loan_application_id'];
            let formData = {
                company: companyID.value,
                loan_application: applicationID
            }
            await store.dispatch('Loan_Applications/fetchLoanDetails',formData).
            then(()=>{
                store.commit('pageTab/ADD_PAGE', {'MMS':'Loan_Statement'});
                store.state.pageTab.mmsActiveTab = 'Loan_Statement'; 
            })
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'send-sms'){
                showLoader();
                const memberNo = row['member_number'];
                const memberName = row['member_name'];
                const phoneNo = row['phone_number'];
                const dueDate = row['current_date'];
                const totalArrears = row['total_arrears'];
                let formData = {
                    member_number: memberNo,
                    member_name: memberName,
                    phone_number: phoneNo,
                    total_arrears: totalArrears,
                    due_date: dueDate,
                    company: companyID.value
                }
                await axios.post('api/v1/loan-arrears-reminder-sms/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("SMS Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Loan Balance Template Not Set!")
                    }else{
                        toast.error(response.data.msg)
                    }
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideLoader();
                })
            }
            else if(action == 'send-email'){
                showLoader();
                const memberNo = row['member_number'];
                const memberName = row['member_name'];
                const emailAddress = row['member_email'];
                const dueDate = row['current_date'];
                const totalArrears = row['total_arrears'];
                let formData = {
                    member_number: memberNo,
                    member_name: memberName,
                    email: emailAddress,
                    total_arrears: totalArrears,
                    due_date: dueDate,
                    company: companyID.value
                }
                await axios.post('api/v1/loan-arrears-reminder-email/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Email Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Loan Balance Template Not Set!")
                    }else{
                        toast.error(response.data.msg)
                    }
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideLoader();
                })
            }
        } 
        const formFields = ref();
        const updateFormFields = () =>{
            formFields.value = [
                {  type: 'checkbox', label: 'Member No', name: 'member_number', value: '', required: false},
                {  type: 'checkbox', label: 'Member Name', name: 'member_name', value: true, selected: true, required: false},
                {  type: 'checkbox', label: 'Phone No', name: 'phone_number', value: true, selected: true, required: false},
                {  type:'checkbox', label:'Email Address', name:'email_address', value:'', required:false},
                {  type:'checkbox', label:'Guarantors', name:'guarantors', value:'', required:false},
                {  type:'checkbox', label:'Loan Amount', name:'loan_amount', value:'', required:false},
                {  type:'checkbox', label:'Principal Amount', name:'principal_amount', value:'', required:false},
                {  type:'checkbox', label:'Interest Amount', name:'interest_amount', value:'', required:false},
                {  type:'checkbox', label:'Principal Paid', name:'principal_paid', value:'', required:false},
                {  type:'checkbox', label:'Interest Paid', name:'interest_paid', value:'', required:false},          
                {  type:'checkbox', label:'Principal Balance', name:'principal_balance', value:'', required:false},
                {  type:'checkbox', label:'Interest Balance', name:'interest_balance', value:'', required:false}, 
                {  type:'checkbox', label:'Arrears Inclusive', name:'arrears_inclusive', value: true, selected: true, required:false},
                {  type:'checkbox', label:'Arrears Exclusive', name:'arrears_exclusive', value:'', required:false},
                {  type:'checkbox', label:'Loan Balance', name:'loan_balance', value:'', required:false}, 
            ]
        };
        const dropdownOptions = ref([
            {label: 'SMS Loan Arrears', action: 'send-sms', icon: 'fa-sms', colorClass: 'text-blue-500', rightName: 'Sending MMS SMS'},
            {label: 'Email Loan Arrears', action: 'send-email', icon: 'fa-envelope', colorClass: 'text-indigo-500', rightName: 'Sending MMS Emails'},
            {label: 'Print Detailed', action: 'print-detailed',icon: 'fa-print',colorClass: 'text-gray-700', rightName: 'Printing MMS Reports'},
        ]);
        const handleDynamicOption = async(option) =>{
            if(option == 'send-sms'){
                showLoader();
                const tenantID = selectedIds.value
                let formData = {
                    tenant: tenantID,
                    company: companyID.value
                }
                await axios.post('api/v1/loan-arrears-reminder-sms/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("SMS Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Loan Balance Reminder Template Not Set!")
                    }else{
                        toast.error(response.data.msg)
                    }
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideLoader();
                })
            }else if(option == 'send-email'){
                showLoader();
                const tenantID = selectedIds.value;
                let formData = {
                    tenant: tenantID,
                    company: companyID.value
                }
                await axios.post('api/v1/loan-arrears-reminder-email/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Email Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Loan Balance Reminder Template Not Set!")
                    }else{
                        toast.error(response.data.msg)
                    }
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideLoader();
                })
            }else if(option == 'print-detailed'){
                appModalVisible.value = true;
                updateFormFields();
                flex_basis.value = '1/4';
                flex_basis_percentage.value = '20';
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
        const searchLoanArrears = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                client_code: member_number_search.value,
                client_name: member_name_search.value,
                date: date_search.value,
                product: productID.value,
                company: companyID.value,
                page_size: selectedValue.value
            }
 
            axios
            .post(`api/v1/loan-arrears-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                arrearsList.value = response.data.results;
                store.commit('Loan_Arrears/LIST_LOAN_ARREARS', arrearsList.value)
                appResults.value = response.data;
                appArrLen.value = arrearsList.value.length;
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
            searchLoanArrears(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchLoanArrears();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchLoanArrears();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchLoanArrears();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchLoanArrears();
        }
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            propComponentKey.value += 1;
            productID.value = ""
            member_name_search.value = "";
            member_number_search.value = "";
            date_search.value = "";
            searchLoanArrears();
        };
        const printArrearsList = () =>{
            appModalVisible.value = false;
            showLoader();
            let formData = {
                client_code: member_number_search.value,
                client_name: member_name_search.value,
                date: date_search.value,
                product: productID.value,
                company: companyID.value,
                printData: formFields.value || [],
                page_size: selectedValue.value
            } 

            axios
            .post("api/v1/export-loan-arrears-pdf/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const blob1 = new Blob([response.data], { type: 'application/pdf' });
                        const url = URL.createObjectURL(blob1);
                        // PrintJS({printable: url, type: 'pdf'});
                        pdfUrl.value = url;
                        printModalVisible.value = true;
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
            searchLoanArrears();
        })
        return{
            showAddButton,title, searchLoanArrears, idField, selectedIds, actions, arrearsList, appArrLen,appCount,appResults,appModalVisible,
            currentPage,searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,dropdownOptions,handleDynamicOption,
            showNextBtn,showPreviousBtn, handleActionClick,displayButtons,formFields,handleOpenLink,printModalVisible,pdfUrl, printTitle,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,rightsModule,
            handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,showTotals,printArrearsList,selectSearchQuantity,selectedValue
        }
    }
}
</script>
