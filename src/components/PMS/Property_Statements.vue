<template>
    <div class="z-10">
        <PageComponent 
            :key="mainComponentKey"
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewStatement"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchStatements"
            @resetFilters="resetFilters"
            @removeItem="removeStatement"
            @removeSelectedItems="removeStatements"
            @printList="printStatementsList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="statementsList"
            :actions="actions"
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
import { useDateFormatter } from '@/composables/DateFormatter';
import PrintJS from 'print-js';
import Swal from 'sweetalert2';

export default{
    name: 'Property_Statements',
    components:{
        PageComponent
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('none');
        const modal_loader = ref('none');
        const mainComponentKey = ref(0);
        const idField = 'landlord_statement_id';
        const addButtonLabel = ref('New Statement');
        const addingRight = ref('Process Property Statement');
        const rightsModule = ref('PMS');
        const submitButtonLabel = ref('Add');
        const title = ref('Property Statement');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const landComponentKey = ref(0);
        const propComponentKey = ref(0);
        const selectedIds = ref([]);
        const statementsList = ref([]);
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
        const landlordSearchID = ref('');
        const landlordArray = computed(() => store.state.Landlords_List.landlordArr);
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Property Name", key:"property_name"},
            {label: "Type", key: "statement_type"},
            {label: "Prep Date", key: "formatted_date_prepared"},
            {label: "Prepared By", key:"prepared_by"},
            {label: "W.E.F", key:"formatted_with_effect_from"},
            {label: "W.E.T", key:"formatted_with_effect_to"},
            {label: "Month", key:"month"},
            {label: "Year", key:"year"},
            {label: "Approved By", key:"approved_by"},
            {label: "App. Date", key:"date_approved"},
            {label: "Collection", key:"formatted_period_collection"},
        ])
        
        const actions = ref([ 
            {name: 'approve', icon: 'fa fa-check-circle', title: 'Approve Statement', rightName: 'Approve Property Statement'},
            {name: 'preview', icon: 'fa fa-print', title: 'View Statement', rightName: 'Print Property Statement'},
            {name: 'download', icon: 'fa fa-download', title: 'Download Statement', rightName: 'Print Property Statement'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Statement', rightName: 'Deleting Property Statement'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const fetchProperties = async() =>{
            await store.dispatch('Properties_List/fetchProperties', {company:companyID.value})
        };
        const handleSearchProperty = async(option) =>{
            await store.dispatch('Properties_List/handleSelectedProperty', option)
            propertySearchID.value = store.state.Properties_List.propertyID;
        };
        const clearSearchProperty = async() =>{
            await store.dispatch('Properties_List/updateState', {propertyID: ''});
            propertySearchID.value = null;
        }
        const fetchLandlords = async() =>{
            await store.dispatch('Landlords_List/fetchLandlords', {company:companyID.value})
        };
        const handleSearchLandlord = async(option) =>{
            await store.dispatch('Landlords_List/handleSelectedLandlord', option)
            landlordSearchID.value = store.state.Landlords_List.landlordID;
        };
        const clearSearchLandlord = async() =>{
            await store.dispatch('Landlords_List/updateState', {landlordID: ''});
            landlordSearchID.value = null;
        }
        const month_search = computed({
            get: () => store.state.Property_Statements.month_search,
            set: (value) => store.commit('Property_Statements/SET_SEARCH_FILTERS', {"month_search":value}),
        });
        const year_search = computed({
            get: () => store.state.Property_Statements.year_search,
            set: (value) => store.commit('Property_Statements/SET_SEARCH_FILTERS', {"year_search":value}),
        });
        const statement_type_search = computed({
            get: () => store.state.Property_Statements.statement_type_search,
            set: (value) => store.commit('Property_Statements/SET_SEARCH_FILTERS', {"statement_type_search":value}),
        });
        const approval_status_search = computed({
            get: () => store.state.Property_Statements.approval_status_search,
            set: (value) => store.commit('Property_Statements/SET_SEARCH_FILTERS', {"approval_status_search":value}),
        });
        const searchFilters = ref([
            {
                type:'search-dropdown', value: propertySearchID.value, width:64, componentKey: propComponentKey,
                selectOptions: propertyArray, optionSelected: handleSearchProperty,
                searchPlaceholder: 'Property Search...', dropdownWidth: '350px',
                fetchData: fetchProperties(), clearSearch: clearSearchProperty()             
            },
            {
                type:'search-dropdown', value: landlordSearchID.value, width:64, componentKey: landComponentKey,
                selectOptions: landlordArray, optionSelected: handleSearchLandlord,
                searchPlaceholder: 'Landlord Search...', dropdownWidth: '350px',
                fetchData: fetchLandlords(), clearSearch: clearSearchLandlord()   
            },
            {
                type:'dropdown', placeholder:"Month", value: month_search, width:36,
                options: [{ text: 'January', value: 'January' }, { text: 'February', value: 'February' },{ text: 'March', value: 'March' }, { text: 'April', value: 'April' },{ text: 'May', value: 'May' }, { text: 'June', value: 'June' },{ text: 'July', value: 'July' }, { text: 'August', value: 'August' },{ text: 'September', value: 'September' }, { text: 'October', value: 'October' },{ text: 'November', value: 'November' }, { text: 'December', value: 'December' }]
            },
            {type:'text', placeholder:"Year...", value: year_search, width:36},
            {
                type:'dropdown', placeholder:"Statement Type", value: statement_type_search, width:40,
                options: [{text:'Rent',value:'Rent'},{text:'Utility',value:'Utility'},{text:'Combined',value:'Combined'}]
            },
            {
                type:'dropdown', placeholder:"Approved", value: approval_status_search, width:40,
                options: [{text:'Yes',value:'Yes'},{text:'No',value:'No'}]
            },
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        
        const handleReset = async() =>{

        }


        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }

        const removeStatement = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    landlord_statement: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Property_Statements/deletePropertyStatement',formData)
                    if(response && response.status == 200){
                        toast.success("Statement Removed Succesfully");
                        mainComponentKey.value += 1;
                        searchStatements();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Statement: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Statement") 
            }else{
                toast.error("Please Select A Statement To Remove")
            }
        }
        const removeStatements = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    landlord_statement: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Property_Statements/deletePropertyStatement',formData)
                    if(response && response.status == 200){
                        toast.success("Statement(s) Removed Succesfully");
                        mainComponentKey.value += 1;
                        searchStatements();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Statement(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Statement To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchStatements = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                month: month_search.value,
                year: year_search.value,
                approval_status: approval_status_search.value,
                statement_type: statement_type_search.value,
                landlord: landlordSearchID.value,
                property: propertySearchID.value,
                company: companyID.value
            } 
   
            axios
            .post(`api/v1/landlord-statements-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                statementsList.value = response.data.results;
                store.commit('Property_Statements/LIST_PROPERTY_STATEMENTS', statementsList.value)
                propResults.value = response.data;
                propArrLen.value = statementsList.value.length;
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
            landlordSearchID.value = null;
            propertySearchID.value = null;
            propComponentKey.value += 1;
            landComponentKey.value += 1;
            store.commit('Property_Statements/RESET_SEARCH_FILTERS')
            searchStatements();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchStatements();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchStatements();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchStatements();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchStatements();
            // scrollToTop();
        }
        const addNewStatement = async() =>{
            store.commit('pageTab/ADD_PAGE', {'PMS':'Statement_Processing'});
            store.state.pageTab.pmsActiveTab = 'Statement_Processing'; 
        };
        const previewStatement = (formData) =>{
            showLoader();
            axios
            .post("api/v1/preview-landlord-statement-pdf/", formData, { responseType: 'blob' })
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
        };
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const statementID = [row['landlord_statement_id']];
                let formData = {
                    company: companyID.value,
                    landlord_statement: statementID
                }
                await store.dispatch('Property_Statements/deletePropertyStatement',formData)
                mainComponentKey.value += 1;
                searchStatements();       
            }else if(action == 'approve'){
                if(row['approval_status'] == 'No'){
                    const statementID = row['landlord_statement_id'];
                    const statMonth = row['month'];
                    const statYear = row['year'];
                    const statWEF = row['with_effect_from'];
                    const statWET = row['with_effect_to'];
                    const periodColl = row['period_collection'];
                    const periodExp = row['period_expenses'];
                    const statTrans = row['statement_transactions'];
                    const statProperty = row['property_id'];
                    let formData = {
                        month: statMonth,
                        year: statYear,
                        with_effect_from: statWEF,
                        with_effect_to: statWET,
                        property: statProperty,
                        company: companyID.value,
                        user: userID.value,
                    } 
                    let formData1 = {
                        with_effect_from: statWEF,
                        with_effect_to: statWET,
                        month: statMonth,
                        year: statYear,
                        period_collection: periodColl,
                        period_expenses: periodExp,
                        statement_transactions: statTrans,
                        date_approved: formatDate(current_date),
                        approval_status: "Yes",
                        approved_by: userID.value,
                        approved_by_id: userID.value,
                        property: statProperty,
                        property_id: statProperty,
                        landlord_statement: statementID,
                        company: companyID.value,
                    } 
                    Swal.fire({
                        title: "Are you sure?",
                        text: `Do you wish to approve Statement?`,
                        type: 'warning',
                        showCloseButton: true,
                        showCancelButton: true,
                        confirmButtonText: 'Yes Approve Statement!',
                        cancelButtonText: 'Cancel!',
                        customClass: {
                            confirmButton: 'swal2-confirm-custom',
                            cancelButton: 'swal2-cancel-custom',
                        },
                        showLoaderOnConfirm: true,
                        }).then((result) => {
                        if (result.value) {
                            axios.put(`api/v1/update-landlord-statement/`,formData1)
                            .then((response)=>{
                                const response1 = axios.post('api/v1/approve-landlord-statement-pdf/', formData);
                                if(response.status == 200 && response1){                       
                                    Swal.fire("Statement approved succesfully!", {
                                        icon: "success",
                                    }); 
                                    
                                }else{
                                    Swal.fire({
                                    title: "Error Approving Statement",
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
                            .finally(()=>{
                                searchStatements();
                            })

                        }else{
                            Swal.fire(`Statement has not been approved!`);
                        }           
                    })
                }else{
                    toast.error('Statement Already Approved');
                }             
            }else if(action == 'preview'){
                const statMonth = row['month'];
                const statYear = row['year'];
                const statWEF = row['with_effect_from'];
                const statWET = row['with_effect_to'];
                const statProperty = row['property_id'];
                let formData = {
                    month: statMonth,
                    year: statYear,
                    with_effect_from: statWEF,
                    with_effect_to: statWET,
                    property: statProperty,
                    company: companyID.value
                } 
                previewStatement(formData);    
            }
        }
        const closeModal = async() =>{
            
        }

        const dropdownOptions = ref([
            // {label: 'Reverse Receipt', action: 'reverse-receipt'},
        ]);
        const handleDynamicOption = (option) =>{
            if(option == 'batch-meter-reading'){
                store.commit('pageTab/ADD_PAGE', {'PMS':'Statement_Details'})
                store.state.pageTab.pmsActiveTab = 'Statement_Details';
            }
        };
        const printStatementsList = () =>{
            showLoader();
            let formData = {
                month: month_search.value,
                year: year_search.value,
                approval_status: approval_status_search.value,
                statement_type: statement_type_search.value,
                landlord: landlordSearchID.value,
                property: propertySearchID.value,
                company: companyID.value
            } 

            axios
            .post("api/v1/export-property-statements-pdf/", formData, { responseType: 'blob' })
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
        onBeforeMount(()=>{
            searchStatements();
            
        })
        return{
            mainComponentKey, title, searchStatements,resetFilters, addButtonLabel, searchFilters, tableColumns, statementsList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewStatement, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeStatement, removeStatements, dropdownOptions, handleDynamicOption,addingRight,rightsModule,printStatementsList
        }
    }
};
</script>