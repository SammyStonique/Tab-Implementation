<template>
    <div class="z-10">
        <PageComponent 
            :key="mainComponentKey"
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewReceipt"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchReceipts"
            @resetFilters="resetFilters"
            @removeItem="removeReceipt"
            @removeSelectedItems="removeReceipts"
            @printList="printList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="receiptsList"
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
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Credit_Notes',
    components:{
        PageComponent
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const mainComponentKey = ref(0);
        const idField = 'journal_id';
        const addButtonLabel = ref('New Credit Note');
        const addingRight = ref('Adding Credit Notes');
        const rightsModule = ref('PMS');
        const submitButtonLabel = ref('Add');
        const title = ref('Receipt Reversal');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const tntComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const propComponentKey = ref(0);
        const selectedIds = ref([]);
        const receiptsList = ref([]);
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
        const propertySearchID = ref('');
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "C.Note#", key:"journal_no"},
            {label: "Date", key: "date"},
            {label: "Tenant Name", key:"tenant_name"},
            {label: "Property Name", key:"property_name"},
            {label: "Unit", key:"unit_number"},
            {label: "Description", key:"description"},
            {label: "Amount", key:"total_amount", type:"number"},
            {label: "Done By", key:"done_by"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'print', icon: 'fa fa-print', title: 'Print Credit Note', rightName: 'Print Tenant Receipt'},
            {name: 'download', icon: 'fa fa-download', title: 'Download Credit Note', rightName: 'Print Tenant Receipt'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Credit Note', rightName: 'Deleting Tenant Receipt'},
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
            get: () => store.state.Journals.client_name_search,
            set: (value) => store.commit('Journals/SET_SEARCH_FILTERS', {"client_name_search":value}),
        });
        const tenant_code_search = computed({
            get: () => store.state.Journals.client_code_search,
            set: (value) => store.commit('Journals/SET_SEARCH_FILTERS', {"client_code_search":value}),
        });
        const from_date_search = computed({
            get: () => store.state.Journals.from_date_search,
            set: (value) => store.commit('Journals/SET_SEARCH_FILTERS', {"from_date_search":value}),
        });
        const to_date_search = computed({
            get: () => store.state.Journals.to_date_search,
            set: (value) => store.commit('Journals/SET_SEARCH_FILTERS', {"to_date_search":value}),
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
        
        
        const handleReset = async() =>{
            await store.dispatch('Active_Tenants/updateState', {tenantUnitsArr:[]});
            propComponentKey.value += 1;
            ledComponentKey.value += 1;
            tntComponentKey.value += 1;
            propertySearchID.value = '';
        }


        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }

        const removeReceipt = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    journal: selectedIds.value,
                    txn_type: "CDN"
                }
                try{
                    const response = await store.dispatch('Journals/deleteCreditNote',formData)
                    if(response && response.status == 200){
                        toast.success("Credit Note Removed Succesfully");
                        mainComponentKey.value += 1;
                        searchReceipts();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Credit Note: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Credit Note") 
            }else{
                toast.error("Please Select A Credit Note To Remove")
            }
        }
        const removeReceipts = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    journal: selectedIds.value,
                    txn_type: "CDN"
                }
                try{
                    const response = await store.dispatch('Journals/deleteCreditNote',formData)
                    if(response && response.status == 200){
                        toast.success("Credit Note(s) Removed Succesfully");
                        mainComponentKey.value += 1;
                        searchReceipts();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Credit Note(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Credit Note To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchReceipts = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                client_category: "Tenants",
                txn_type: "CDN",
                client_name: tenant_name_search.value,
                client_code: tenant_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                property: propertySearchID.value,
                company: companyID.value
            } 
   
            axios
            .post(`api/v1/clients-journals-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                receiptsList.value = response.data.results;
                store.commit('Journals/LIST_TENANTS_CREDIT_NOTES', receiptsList.value)
                propResults.value = response.data;
                propArrLen.value = receiptsList.value.length;
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
            store.commit('Journals/RESET_SEARCH_FILTERS')
            searchReceipts();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchReceipts();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchReceipts();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchReceipts();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchReceipts();
            // scrollToTop();
        }
        const addNewReceipt = async() =>{
            store.dispatch('Journals/updateState', {journalsClientList: [], outstandingBalance:0})
            store.commit('pageTab/ADD_PAGE', {'PMS':'Credit_Note_Details'});
            store.state.pageTab.pmsActiveTab = 'Credit_Note_Details'; 
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const journalID = [row['journal_id']];
                let formData = {
                    company: companyID.value,
                    journal: journalID
                }
                await store.dispatch('Journals/deleteCreditNote',formData)
                mainComponentKey.value += 1;
                searchReceipts();       
            }else if(action == 'print'){
                showLoader();
                const journalID = row['journal_id'];
                let formData = {
                    receipt: journalID,
                    client: row['customer_id'],
                    type: "CDN",
                    company: companyID.value
                }
                await store.dispatch('Journals/previewTenantReceipt',formData).
                then(()=>{
                    hideLoader();
                })
            }else if(action == 'download'){
                showLoader();
                const journalID = row['journal_id'];
                let formData = {
                    receipt: journalID,
                    client: row['customer_id'],
                    type: "CDN",
                    company: companyID.value
                }
                await store.dispatch('Journals/downloadTenantReceipt',formData).
                then(()=>{
                    hideLoader();
                })
            }
        }
        const closeModal = async() =>{
            
        }

        const dropdownOptions = ref([
            {label: 'Reverse Receipt', action: 'reverse-receipt'},
        ]);
        const handleDynamicOption = (option) =>{
            if(option == 'batch-meter-reading'){
                store.commit('pageTab/ADD_PAGE', {'PMS':'Batch_Readings'})
                store.state.pageTab.pmsActiveTab = 'Batch_Readings';
            }
        }
        onBeforeMount(()=>{
            searchReceipts();
            
        })
        return{
            showTotals,mainComponentKey, title, searchReceipts,resetFilters, addButtonLabel, searchFilters, tableColumns, receiptsList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewReceipt, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeReceipt, removeReceipts, dropdownOptions, handleDynamicOption,addingRight,rightsModule
        }
    }
};
</script>