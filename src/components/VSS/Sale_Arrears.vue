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
        :columns="tableColumns"
        :rows="arrearsList"
        :actions="actions"
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
    name: 'Sale_Arrears',
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
        const assetID = ref('');
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
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
        const modal_width = ref('35vw');
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Sale Code", key:"sale_code",type: "text", editable: false},
            {label: "Client Code", key:"client_code",type: "text", editable: false},
            {label: "Client Name", key:"client_name",type: "text", editable: false},
            {label: "Phone No", key:"phone_number",type: "text", editable: false},
            {label: "Email", key:"client_email",type: "text", editable: false},
            {label: "Asset Name", key:"asset_name",type: "text", editable: false},
            {label: "Sale Amount", key: "sale_amount", type: "number", editable: false},
            {label: "Principal Arrears", key: "principal_arrears", type: "number", editable: false},
            {label: "Interest Arrears", key: "interest_arrears", type: "number", editable: false},
            {label: "Total Arrears", key: "total_arrears", type: "number", editable: false},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'send-sms', icon: 'fas fa-comment', title: 'Send SMS', rightName: 'Sending PSS SMS'},
            {name: 'send-email', icon: 'fas fa-envelope', title: 'Send Email', rightName: 'Sending PSS Emails'},
        ])
        const client_name_search = ref("");
        const client_code_search = ref("");
        const date_search = ref("");
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
            {type:'text', placeholder:"Client Code...", value: client_code_search, width:32},
            {type:'text', placeholder:"Client Name...", value: client_name_search, width:48},
            {type:'date', placeholder:"Date...", value: date_search, width:32, title: "As At Date Search"},

            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'send-sms'){
                showLoader();
                const clientNo = row['client_code'];
                const clientName = row['client_name'];
                const phoneNo = row['phone_number'];
                const dueDate = row['current_date'];
                const totalArrears = row['total_arrears'];
                let formData = {
                    client_code: clientNo,
                    client_name: clientName,
                    phone_number: phoneNo,
                    total_arrears: totalArrears,
                    due_date: dueDate,
                    company: companyID.value
                }
                await axios.post('api/v1/asset-sale-arrears-reminder-sms/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("SMS Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Sale Balance Template Not Set!")
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
                const clientNo = row['client_code'];
                const clientName = row['client_name'];
                const emailAddress = row['client_email'];
                const dueDate = row['current_date'];
                const totalArrears = row['total_arrears'];
                let formData = {
                    client_code: clientNo,
                    client_name: clientName,
                    email: emailAddress,
                    total_arrears: totalArrears,
                    due_date: dueDate,
                    company: companyID.value
                }
                await axios.post('api/v1/asset-sale-arrears-reminder-email/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Email Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Sale Balance Template Not Set!")
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
        const dropdownOptions = ref([
            {label: 'SMS Sale Arrears', action: 'send-sms'},
            {label: 'Email Sale Arrears', action: 'send-email'},
        ]);
        const handleDynamicOption = async(option) =>{
            if(option == 'send-sms'){
                showLoader();
                const tenantID = selectedIds.value
                let formData = {
                    tenant: tenantID,
                    company: companyID.value
                }
                await axios.post('api/v1/tenant-balance-reminder-sms/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("SMS Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Tenant Balance Reminder Template Not Set!")
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
                await axios.post('api/v1/tenant-balance-reminder-email/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Email Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Tenant Balance Reminder Template Not Set!")
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
                client_code: client_code_search.value,
                client_name: client_name_search.value,
                date: date_search.value,
                asset: assetID.value,
                company: companyID.value,
                page_size: selectedValue.value
            }
 
            axios
            .post(`api/v1/asset-sale-arrears-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                arrearsList.value = response.data.results;
                // store.commit('Loan_Arrears/LIST_LOAN_ARREARS', arrearsList.value)
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
            assetID.value = ""
            client_name_search.value = "";
            client_code_search.value = "";
            date_search.value = "";
            searchLoanArrears();
        };
        const printArrearsList = () =>{
            showLoader();
            let formData = {
                client_code: client_code_search.value,
                client_name: client_name_search.value,
                date: date_search.value,
                asset: assetID.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 

            axios
            .post("api/v1/export-loan-arrears-pdf/", formData, { responseType: 'blob' })
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
            searchLoanArrears();
        })
        return{
            showAddButton,title, searchLoanArrears, idField, selectedIds, actions, arrearsList, appArrLen,appCount,appResults,appModalVisible,
            currentPage,searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,dropdownOptions,handleDynamicOption,
            showNextBtn,showPreviousBtn, handleActionClick,displayButtons,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,rightsModule,
            handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,showTotals,printArrearsList,selectSearchQuantity,selectedValue
        }
    }
}
</script>
