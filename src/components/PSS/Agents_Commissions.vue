<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        :showAddButton="showAddButton"
        :searchFilters="searchFilters"
        :dropdownOptions="dropdownOptions"
        @handleDynamicOption="handleDynamicOption"
        @searchPage="searchSaleCommissions"
        @resetFilters="resetFilters"
        @removeItem="removeAllocation"
        @removeSelectedItems="removeAllocations"
        @printList="printCommissionsList"
        :columns="tableColumns"
        :rows="commissionsList"
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
    name: 'Agents_Commissions',
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
        const idField = 'sales_agent_commission_id';
        const rightsModule = ref('PSS');
        const assetID = ref('');
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const commissionsList = ref([]);
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
            {label: "Date", key:"date",type: "text", editable: false},
            {label: "Sale Code", key:"sale_code",type: "text", editable: false},
            {label: "Client Name", key:"customer",type: "text", editable: false},
            {label: "Agent Name", key:"agent_name",type: "text", editable: false},
            {label: "Asset Name", key:"asset",type: "text", editable: false},
            {label: "Sale Amount", key:"total_amount",type: "text", editable: false},
            {label: "Comm. Rate", key:"commission_rate",type: "text", editable: false},
            {label: "Comm. Amount", key:"commission_amount",type: "number", editable: false},
            {label: "Bill#", key:"journal_no",type: "text", editable: false},
        ])
        const showTotals = ref(true);
        const showActions = ref(false);
        const agent_name_search = ref("");
        const asset_name_search = ref("");
        const asset_code_search = ref("");
        const sale_code_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const assets_array = computed(()=> store.state.Sale_Assets.assetArr);
        const handleSelectedAsset = async(option) =>{
            await store.dispatch('Sale_Assets/handleSelectedAsset', option)
            assetID.value = store.state.Sale_Assets.assetID;
        };
        const clearSelectedAsset = async() =>{
            await store.dispatch('Sale_Assets/updateState', {assetID: ''});
            assetID.value = store.state.Sale_Assets.assetID;
        };
        const searchFilters = ref([
            {
                type:'search-dropdown', value: assetID.value, width:48, componentKey: propComponentKey,
                selectOptions: assets_array, optionSelected: handleSelectedAsset,
                searchPlaceholder: 'Sale Asset...', dropdownWidth: '250px',
                fetchData: store.dispatch('Sale_Assets/fetchSaleAssets', {company:companyID.value}),
                clearSearch: clearSelectedAsset
            },
            {type:'text', placeholder:"Asset Code...", value: asset_code_search, width:32},
            {type:'text', placeholder:"Asset Name...", value: asset_name_search, width:48},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:32, title: "From Date Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:32, title: "To Date Search"},
            {type:'text', placeholder:"Sale Code...", value: sale_code_search, width:32},
            {type:'text', placeholder:"Agent Name...", value: agent_name_search, width:48},
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
        const searchSaleCommissions = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                asset_code: asset_code_search.value,
                asset_name: asset_name_search.value,
                agent_name: agent_name_search.value,
                sale_code: sale_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                asset: assetID.value,
                sales_agent: '',
                company: companyID.value,
                page_size: selectedValue.value
            }
 
            axios
            .post(`api/v1/sales-agents-commissions-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                commissionsList.value = response.data.results;
                // store.commit('Loan_Arrears/LIST_LOAN_ARREARS', commissionsList.value)
                appResults.value = response.data;
                appArrLen.value = commissionsList.value.length;
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
            searchSaleCommissions(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchSaleCommissions();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchSaleCommissions();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchSaleCommissions();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchSaleCommissions();
        }
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            propComponentKey.value += 1;
            assetID.value = "";
            asset_name_search.value = "";
            asset_code_search.value = "";
            sale_code_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            agent_name_search.value = "";
            searchSaleCommissions();
        };
        const printCommissionsList = () =>{
            showLoader();
            let formData = {
                asset_code: asset_code_search.value,
                asset_name: asset_name_search.value,
                agent_name: agent_name_search.value,
                sale_code: sale_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                asset: assetID.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 

            axios
            .post("api/v1/export-sales-agents-commissions-pdf/", formData, { responseType: 'blob' })
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
            searchSaleCommissions();
        })
        return{
            showAddButton,title, searchSaleCommissions, idField, selectedIds, showActions, commissionsList, appArrLen,appCount,appResults,appModalVisible,
            currentPage,searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,dropdownOptions,handleDynamicOption,
            showNextBtn,showPreviousBtn, handleActionClick,displayButtons,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,rightsModule,
            handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,showTotals,printCommissionsList,selectSearchQuantity,selectedValue
        }
    }
}
</script>
