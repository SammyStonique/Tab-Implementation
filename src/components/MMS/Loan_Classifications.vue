<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        :showAddButton="showAddButton"
        :searchFilters="searchFilters"
        :dropdownOptions="dropdownOptions"
        @handleDynamicOption="handleDynamicOption"
        @searchPage="searchLoanClassifications"
        @resetFilters="resetFilters"
        @removeItem="removeAllocation"
        @removeSelectedItems="removeAllocations"
        @printList="printLoansList"
        v-model:printModalVisible="printModalVisible"
        :printTitle="printTitle"
        :pdfUrl="pdfUrl"
        :columns="tableColumns"
        :rows="classList"
        :actions="actions"
        :showActions="showActions"
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
import PrintJS from 'print-js';

export default{
    name: 'Loan_Classifications',
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
        const title = ref('');
        const companyID = computed(()=> store.state.userData.company_id);
        const idField = 'tenant_lease_id';
        const rightsModule = ref('MMS');
        const productID = ref('');
        const riskID = ref('');
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const printModalVisible = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Loan Classifications');
        const classList = ref([]);
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
        const modal_width = ref('35vw');
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Loan No", key:"loan_number",type: "text",type: "link"},
            {label: "Member No", key:"member_number",type: "text"},
            {label: "Member Name", key:"member_name",type: "text"},
            {label: "Loan Product", key:"product_name",type: "text"},
            {label: "Loan Amount", key: "loan_amount", type: "number"},
            {label: "Portfolio At Risk", key: "principal_arrears", type: "number"},
            {label: "Risk Class", key: "risk_classification", type: "text", txtColor: "txtColor"},
            {label: "Days In Arrears", key: "days_in_arrears", type: "text"},
            {label: "Last Repay. Date", key: "last_repayment", type: "text"},
        ])
        const showTotals = ref(true);
        const showActions = ref(false);
        const actions = ref([
            
        ])
        const member_name_search = ref("");
        const member_number_search = ref("");
        const products_array = computed(()=> store.state.Loan_Products.productArr);
        const risks_array = computed(()=> store.state.Risk_Classifications.classificationArr);
        const handleSelectedProduct = async(option) =>{
            await store.dispatch('Loan_Products/handleSelectedProduct', option)
            productID.value = store.state.Loan_Products.productID;
        };
        const clearSelectedProduct = async() =>{
            await store.dispatch('Loan_Products/updateState', {productID: ''});
            productID.value = store.state.Loan_Products.productID;
        };
        const handleSelectedClassification = async(option) =>{
            await store.dispatch('Risk_Classifications/handleSelectedClassification', option)
            riskID.value = store.state.Risk_Classifications.classificationID;
        };
        const clearSelectedClassification = async() =>{
            await store.dispatch('Risk_Classifications/updateState', {classificationID: ''});
            riskID.value = store.state.Risk_Classifications.classificationID;
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
            {
                type:'search-dropdown', value: riskID.value, width:48, componentKey: riskComponentKey,
                selectOptions: risks_array, optionSelected: handleSelectedClassification,
                searchPlaceholder: 'Risk Classifications...', dropdownWidth: '250px',
                fetchData: store.dispatch('Risk_Classifications/fetchRiskClassifications', {company:companyID.value}),
                clearSearch: clearSelectedClassification
            },
            
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

        } 
        const dropdownOptions = ref([

        ]);
        const handleDynamicOption = async(option) =>{

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
        const searchLoanClassifications = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                client_code: member_number_search.value,
                client_name: member_name_search.value,
                product: productID.value,
                risk_classification: riskID.value,
                company: companyID.value,
                page_size: selectedValue.value
            }
 
            axios
            .post(`api/v1/loan-classifications-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                classList.value = response.data.results;
                store.commit('Loan_Classifications/LIST_LOAN_CLASSES', classList.value)
                appResults.value = response.data;
                appArrLen.value = classList.value.length;
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
            searchLoanClassifications(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchLoanClassifications();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchLoanClassifications();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchLoanClassifications();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchLoanClassifications();
        }
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            propComponentKey.value += 1;
            productID.value = ""
            member_name_search.value = "";
            member_number_search.value = "";
            riskID.value = "";
            riskComponentKey.value += 1;
            searchLoanClassifications();
        };
        const printLoansList = () =>{
            showLoader();
            let formData = {
                client_code: member_number_search.value,
                client_name: member_name_search.value,
                product: productID.value,
                risk_classification: riskID.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 

            axios
            .post("api/v1/export-loan-classifications-pdf/", formData, { responseType: 'blob' })
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
            searchLoanClassifications();
        })
        return{
            showAddButton,showActions,title, searchLoanClassifications, idField, selectedIds, actions, classList, appArrLen,appCount,appResults,appModalVisible,
            currentPage,searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,dropdownOptions,handleDynamicOption,
            showNextBtn,showPreviousBtn, handleActionClick,displayButtons,printModalVisible,pdfUrl, printTitle,handleOpenLink,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,rightsModule,
            handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,showTotals,printLoansList,selectSearchQuantity,selectedValue
        }
    }
}
</script>
