<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewLatePaymentFee"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchLatePaymentFees"
            @resetFilters="resetFilters"
            @removeItem="removeLeaseFee"
            @removeSelectedItems="removeLeaseFees"
            @printList="printLatePaymentFeesList"
            v-model:printModalVisible="printModalVisible"
            :printTitle="printTitle"
            :pdfUrl="pdfUrl"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="penaltyList"
            :actions="actions"
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
        <MovableModal v-model:visible="invModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
        >
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="createLatePaymentFee" @handleReset="handleReset"
            />
        </MovableModal>
        <PrintModal v-model:visible="printModalVisible1" :title="printTitle" >
            <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="100%" type="application/pdf" style="border: none;"></iframe>
        </PrintModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue';
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import PrintJS from 'print-js';
import PrintModal from '@/components/PrintModal.vue';

export default{
    name: 'Late_Payment_Fees',
    components:{
        PageComponent, MovableModal,DynamicForm,PrintModal
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'late_payment_fee_id';
        const addButtonLabel = ref('Process Penalty');
        const addingRight = ref('Processing Late Payment Fees');
        const removingRight = ref('Deleting Tenant Invoice');
        const rightsModule = ref('PMS');
        const submitButtonLabel = ref('Add');
        const title = ref('Late Payment Fee Details');
        const propComponentKey = ref(0);
        const propSearchComponentKey = ref(0);
        const tntComponentKey = ref(0);
        const invModalVisible = ref(false);
        const printModalVisible = ref(false);
        const printModalVisible1 = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Late Payment Fees');
        const modal_top = ref('200px');
        const modal_left = ref('500px');
        const modal_width = ref('32vw');
        const selectedIds = ref([]);
        const penaltyList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const tenantID = ref("");
        const propertyID = ref("");
        const propertySearchID = ref('');
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);
        const tenantArray = computed(() => store.state.Active_Tenants.tenantUnitsArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Invoice#", key:"invoice_no"},
            {label: "Date", key: "date"},
            {label: "Tenant Name", key:"tenant_name"},
            {label: "Property Name", key:"property_name"},
            {label: "Description", key:"description"},
            {label: "Amount", key:"amount", type: "number"},
            {label: "Paid", key:"paid", type: "number"},
            {label: "Balance", key:"balance", type: "number"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'print', icon: 'fa fa-print', title: 'Print Invoice', rightName: 'Print Tenant Invoice'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Lease Fee', rightName: 'Deleting Tenant Invoice'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const fetchProperties = async() =>{
            await store.dispatch('Properties_List/fetchProperties', {company:companyID.value})
        };
        const handleSearchProperty = async(option) =>{
            await store.dispatch('Properties_List/handleSelectedProperty', option)
            propertySearchID.value = store.state.Properties_List.propertyID;
        };
        const clearSearchProperty = async() =>{
            await store.dispatch('Properties_List/updateState', {propertyID: ''});
            propertySearchID.value = ""
        }
        const tenant_name_search = computed({
            get: () => store.state.Late_Payment_Fees.tenant_name_search,
            set: (value) => store.commit('Late_Payment_Fees/SET_SEARCH_FILTERS', {"tenant_name_search":value}),
        });
        const tenant_code_search = computed({
            get: () => store.state.Late_Payment_Fees.tenant_code_search,
            set: (value) => store.commit('Late_Payment_Fees/SET_SEARCH_FILTERS', {"tenant_code_search":value}),
        });
        const from_date_search = computed({
            get: () => store.state.Late_Payment_Fees.from_date_search,
            set: (value) => store.commit('Late_Payment_Fees/SET_SEARCH_FILTERS', {"from_date_search":value}),
        });
        const to_date_search = computed({
            get: () => store.state.Late_Payment_Fees.to_date_search,
            set: (value) => store.commit('Late_Payment_Fees/SET_SEARCH_FILTERS', {"to_date_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Tenant Code...", value: tenant_code_search, width:36},
            {type:'text', placeholder:"Tenant Name...", value: tenant_name_search, width:64},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            {
                type:'search-dropdown', value: propertySearchID.value, width:64, componentKey: propSearchComponentKey,
                selectOptions: propertyArray, optionSelected: handleSearchProperty,
                searchPlaceholder: 'Property Search...', dropdownWidth: '400px',
                fetchData: fetchProperties(), clearSearch: clearSearchProperty            
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        const handleSelectedProperty = async(option) =>{
            await store.dispatch('Properties_List/handleSelectedProperty', option)
            propertyID.value = store.state.Properties_List.propertyID;
        };
        const clearSelectedProperty = async() =>{
            await store.dispatch('Properties_List/updateState', {propertyID: ''});
            propertyID.value = ""
        }
        const fetchTenants = async() =>{
            if(propertyID.value){
                await store.dispatch('Active_Tenants/fetchTenantUnits', {company:companyID.value, property: propertyID.value})
            }       
        };
        const handleSelectedTenant = async(option) =>{
            await store.dispatch('Active_Tenants/handleSelectedTenantUnit', option)
            tenantID.value = store.state.Active_Tenants.tenantUnitID;
        };
        const clearSelectedTenant = async() =>{
            await store.dispatch('Active_Tenants/updateState', {tenantUnitID: ''});
            tenantID.value = ""
        }
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                {
                    type:'search-dropdown', label:"Property", value: propertyID.value, componentKey: propComponentKey,
                    selectOptions: propertyArray, optionSelected: handleSelectedProperty, required: false,
                    searchPlaceholder: 'Select Property...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchProperties(), clearSearch: clearSelectedProperty()            
                },
                {
                    type:'search-dropdown', label:"Tenant", value: tenantID.value, componentKey: tntComponentKey,
                    selectOptions: tenantArray, optionSelected: handleSelectedTenant, required: false,
                    searchPlaceholder: 'Select Tenant...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchTenants(), clearSearch: clearSelectedTenant()            
                },
                { type: 'date', name: 'date',label: "Date", value: "", required: true, maxDate: formatDate(current_date)},
            ]
        };

        watch([propertyID], () => {
            if (propertyID.value) {
                tntComponentKey.value += 1;
                fetchTenants();
            }      
        }, { immediate: true });

        const handleReset = async() =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            propComponentKey.value += 1;
            propertyID.value = '';
            tntComponentKey.value += 1;
            tenantID.value = '';
        }
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createLatePaymentFee = async() =>{
            showModalLoader();
            let formData = {
                tenant: tenantID.value,
                property: propertyID.value,
                date: formFields.value[2].value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=2; i < (formFields.value.length); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Late_Payment_Fees/createLatePaymentFee', formData);
                    if (response && response.data.msg === "Success") {
                        hideModalLoader();
                        toast.success('Late Payment Fee(s) Processed Successfully!');
                        handleReset();
                        propComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while processing the Late Payment Fee(s).');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to process Late Payment Fee(s): ' + error.message);
                } finally {
                    hideModalLoader();
                    searchLatePaymentFees();
                }
            }
        }

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchLatePaymentFees = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                tenant_name: tenant_name_search.value,
                tenant_code: tenant_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                property: propertySearchID.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
   
            axios
            .post(`api/v1/late-payment-fees-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                penaltyList.value = response.data.results;
                store.commit('Late_Payment_Fees/LIST_LATE_PAYMENT_FEES', penaltyList.value)
                propResults.value = response.data;
                propArrLen.value = penaltyList.value.length;
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
        };
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchLatePaymentFees(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            propSearchComponentKey.value += 1;
            propertySearchID.value  = "";
            store.commit('Late_Payment_Fees/RESET_SEARCH_FILTERS')
            searchLatePaymentFees();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchLatePaymentFees();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchLatePaymentFees();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchLatePaymentFees();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchLatePaymentFees();
        }
        const addNewLatePaymentFee = () =>{
            invModalVisible.value = true;
            updateFormFields();
            propertyID.value = "";
            tenantID.value = "";
            propComponentKey.value += 1;
            tntComponentKey.value += 1;
            propModalVisible.value = true;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const feeID = [row['late_payment_fee_id']];
                let formData = {
                    company: companyID.value,
                    late_payment_fee: feeID,
                }
                await store.dispatch('Late_Payment_Fees/deleteLatePaymentFees',formData).
                then(()=>{
                    searchInvoices();
                })
            }
            else if(action == 'print'){
                showLoader();
                const journalID = row['journal_id'];
                let formData = {
                    invoice: journalID,
                    company: companyID.value
                }
                const response = await store.dispatch('Journals/previewTenantInvoice',formData)
                if (response && response.status === 200) {
                    const blob1 = new Blob([response.data], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob1);
                    // PrintJS({printable: url, type: 'pdf'});
                    pdfUrl.value = url;
                    printModalVisible1.value = true;
                }
                hideLoader();
            }
        }
        const closeModal = async() =>{
            invModalVisible.value = false;
            propComponentKey.value += 1;
            propertyID.value = "";
            tntComponentKey.value += 1;
            tenantID.value = "";
            handleReset();
        }

        const dropdownOptions = ref([
            {label: 'Withholding Tax', action: 'withholding-tax'},
        ]);
        const handleDynamicOption = (option) =>{
            if(option == 'batch-meter-reading'){
                store.commit('pageTab/ADD_PAGE', {'PMS':'Batch_Readings'})
                store.state.pageTab.pmsActiveTab = 'Batch_Readings';
            }
        };
        const printLatePaymentFeesList = () =>{
            showLoader();
            let formData = {
                tenant_name: tenant_name_search.value,
                tenant_code: tenant_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                property: propertyID.value,
                company: companyID.value
            } 

            axios
            .post("api/v1/export-late-payment-fees-pdf/", formData, { responseType: 'blob' })
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
        onBeforeMount(()=>{
            searchLatePaymentFees();
            
        })
        return{
            showTotals,title, searchLatePaymentFees,resetFilters, addButtonLabel, searchFilters, tableColumns, penaltyList,handleReset,printModalVisible1,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,invModalVisible,printModalVisible,pdfUrl, printTitle,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewLatePaymentFee, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            dropdownOptions, handleDynamicOption, createLatePaymentFee,addingRight,removingRight,rightsModule,printLatePaymentFeesList,selectSearchQuantity,selectedValue
        }
    }
};
</script>