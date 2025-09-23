<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        :showAddButton="showAddButton"
        :searchFilters="searchFilters"
        :dropdownOptions="dropdownOptions"
        @handleDynamicOption="handleDynamicOption"
        @searchPage="searchInterests"
        @resetFilters="resetFilters"
        @removeItem="removeAllocation"
        @removeSelectedItems="removeAllocations"
        @printList="printLoansList"
        v-model:printModalVisible="printModalVisible"
        :printTitle="printTitle"
        :pdfUrl="pdfUrl"
        :columns="tableColumns"
        :rows="interestList"
        :actions="actions"
        :showActions="showActions"
        :rightsModule="rightsModule"
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
        :selectedValue="selectedValue"
        @selectSearchQuantity="selectSearchQuantity"
        :groupingKey=true
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
    name: 'Guarantor_Interest',
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
        const idField = 'loan_recovery_id';
        const rightsModule = ref('MMS');
        const productID = ref('');
        const riskID = ref('');
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const printModalVisible = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Guarantor Interests');
        const interestList = ref([]);
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
            {label: "Loan No", key:"loan_number",type: "text", editable: false},
            {label: "Member No", key:"member_number",type: "text", editable: false},
            {label: "Member Name", key:"member_name",type: "text", editable: false},
            {label: "Loan Amount", key: "loan_amount", type: "text", editable: false},
            {label: "Grntd Amount", key: "amount", type: "number", editable: false},
            {label: "Interest", key: "formatted_interest_amount", type: "number", editable: false},
        ])
        const showTotals = ref(true);
        const showActions = ref(false);
        const actions = ref([
            
        ])
        const loan_number_search = ref("");
        const member_name_search = ref("");
        const member_number_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
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
            {type:'text', placeholder:"Loan Number...", value: loan_number_search, width:48},
            {type:'text', placeholder:"Grnt No...", value: member_number_search, width:32},
            {type:'text', placeholder:"Guarantor Name...", value: member_name_search, width:48},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:32, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:32, title: "Date To Search"},
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
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
        const searchInterests = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                member_number: member_number_search.value,
                member_name: member_name_search.value,
                loan_number: loan_number_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                product: productID.value,
                company: companyID.value,
                page_size: selectedValue.value
            }
 
            axios
            .post(`api/v1/loan-guarantor-interests-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                interestList.value = response.data.results;
                appResults.value = response.data;
                appArrLen.value = interestList.value.length;
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
            searchInterests(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchInterests();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchInterests();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchInterests();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchInterests();
        }
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            propComponentKey.value += 1;
            productID.value = ""
            member_name_search.value = "";
            member_number_search.value = "";
            loan_number_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            searchInterests();
        };
        const printLoansList = () =>{
            showLoader();
            let formData = {
                member_number: member_number_search.value,
                member_name: member_name_search.value,
                loan_number: loan_number_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                product: productID.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 

            axios
            .post("api/v1/export-loan-guarantor-interests-pdf/", formData, { responseType: 'blob' })
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
            // searchInterests();
        })
        return{
            showAddButton,showActions,title, searchInterests, idField, selectedIds, actions, interestList, appArrLen,appCount,appResults,appModalVisible,
            currentPage,searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,dropdownOptions,handleDynamicOption,
            showNextBtn,showPreviousBtn, handleActionClick,displayButtons,printModalVisible,pdfUrl, printTitle,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,rightsModule,
            handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,showTotals,printLoansList,selectSearchQuantity,selectedValue
        }
    }
}
</script>
