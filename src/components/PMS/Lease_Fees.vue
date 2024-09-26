<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewLeaseFee"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchLeaseFees"
            @resetFilters="resetFilters"
            @removeItem="removeLeaseFee"
            @removeSelectedItems="removeLeaseFees"
            @printList="printList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="leaseFeeList"
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
        />
        <MovableModal v-model:visible="invModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
        >
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="createLeaseFee" @handleReset="handleReset"
            />
        </MovableModal>
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

export default{
    name: 'Lease_Fees',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'lease_fee_id';
        const addButtonLabel = ref('New Lease Fee');
        const addingRight = ref('Adding Lease Fees');
        const rightsModule = ref('PMS');
        const submitButtonLabel = ref('Add');
        const title = ref('Lease Fee Details');
        const propComponentKey = ref(0);
        const tntComponentKey = ref(0);
        const invModalVisible = ref(false);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const selectedIds = ref([]);
        const leaseFeeList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const tenantID = ref(null);
        const propertyID = ref(null);
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
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'print', icon: 'fa fa-print', title: 'Print Invoice', rightName: 'Print Lease Invoice'},
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
            get: () => store.state.Lease_Fees.tenant_name_search,
            set: (value) => store.commit('Lease_Fees/SET_SEARCH_FILTERS', {"tenant_name_search":value}),
        });
        const tenant_code_search = computed({
            get: () => store.state.Lease_Fees.tenant_code_search,
            set: (value) => store.commit('Lease_Fees/SET_SEARCH_FILTERS', {"tenant_code_search":value}),
        });
        const from_date_search = computed({
            get: () => store.state.Lease_Fees.from_date_search,
            set: (value) => store.commit('Lease_Fees/SET_SEARCH_FILTERS', {"from_date_search":value}),
        });
        const to_date_search = computed({
            get: () => store.state.Lease_Fees.to_date_search,
            set: (value) => store.commit('Lease_Fees/SET_SEARCH_FILTERS', {"to_date_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Tenant Code...", value: tenant_code_search, width:36},
            {type:'text', placeholder:"Tenant Name...", value: tenant_name_search, width:64},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            {
                type:'search-dropdown', value: propertySearchID.value, width:64,
                selectOptions: propertyArray, optionSelected: handleSearchProperty,
                searchPlaceholder: 'Property Search...', dropdownWidth: '200px',
                fetchData: fetchProperties(), clearSearch: clearSearchProperty()             
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
                { type: 'number', name: 'amount',label: "Amount", value: 0, required: true },
                { type: 'date', name: 'date',label: "Date", value: "", required: true },
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
        const createLeaseFee = async() =>{
            showModalLoader();
            let formData = {
                tenant: tenantID.value,
                amount: formFields.value[2].value,
                date: formFields.value[3].value,
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
                    const response = await store.dispatch('Lease_Fees/createLeaseFee', formData);
                    if (response && response.data.msg === "Success") {
                        hideModalLoader();
                        toast.success('Lease Fee Added Successfully!');
                        handleReset();
                        propComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while adding the fee.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to add lease fee: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchLeaseFees();
                }
            }
        }

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchLeaseFees = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                tenant_name: tenant_name_search.value,
                tenant_code: tenant_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                property: propertyID.value,
                company: companyID.value
            } 
   
            axios
            .post(`api/v1/lease-fees-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                leaseFeeList.value = response.data.results;
                store.commit('Lease_Fees/LIST_LEASE_FEES', leaseFeeList.value)
                propResults.value = response.data;
                propArrLen.value = leaseFeeList.value.length;
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
        const resetFilters = () =>{
            store.commit('Lease_Fees/RESET_SEARCH_FILTERS')
            searchLeaseFees();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchLeaseFees();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchLeaseFees();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchLeaseFees();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchLeaseFees();
            // scrollToTop();
        }
        const addNewLeaseFee = () =>{
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
        }
        onBeforeMount(()=>{
            searchLeaseFees();
            
        })
        return{
            showTotals,title, searchLeaseFees,resetFilters, addButtonLabel, searchFilters, tableColumns, leaseFeeList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,invModalVisible,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewLeaseFee, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            dropdownOptions, handleDynamicOption, createLeaseFee,addingRight,rightsModule
        }
    }
};
</script>