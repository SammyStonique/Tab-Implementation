<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewProperty"
            :searchFilters="searchFilters"
            @searchPage="searchProperties"
            @resetFilters="resetFilters"
            @importData="importProperties"
            @removeItem="removeProperty"
            @removeSelectedItems="removeProperties"
            @printList="printPropertiesList"
            @printExcel="downloadPropertiesExcel"
            @printCSV="downloadPropertiesCSV"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="propertyList"
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
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';

export default{
    name: 'Properties_List',
    components:{
        PageComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const idField = 'property_id';
        const addButtonLabel = ref('New Property');
        const addingRight = ref('Adding Property');
        const rightsModule = ref('PMS');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const propertyList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"property_code"},
            {label: "Property Name", key:"name"},
            {label: "Category", key: "property_type"},
            {label: "Zone", key:"zone_name"},
            {label: "Landlord", key:"landlord_name"},
            {label: "Units", key:"units_count"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Property', rightName: 'Editing Property'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Statement'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Property', rightName: 'Deleting Property'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const landlordID = ref(null);
        const zoneID = ref(null);
        const name_search = computed({
            get: () => store.state.Properties_List.name_search,
            set: (value) => store.commit('Properties_List/SET_SEARCH_FILTERS', {"name_search":value}),
        });
        const property_code_search = computed({
            get: () => store.state.Properties_List.property_code_search,
            set: (value) => store.commit('Properties_List/SET_SEARCH_FILTERS', {"property_code_search":value}),
        });
        const status_search = computed({
            get: () => store.state.Properties_List.status_search,
            set: (value) => store.commit('Properties_List/SET_SEARCH_FILTERS', {"status_search":value}),
        });
        const property_type_search = computed({
            get: () => store.state.Properties_List.property_type_search,
            set: (value) => store.commit('Properties_List/SET_SEARCH_FILTERS', {"property_type_search":value}),
        });
        const landlords_array = computed({
            get: () => store.state.Landlords_List.landlordArr,
        });
        const zones_array = computed({
            get: () => store.state.Zones.zoneArr,
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:48,},
            {type:'text', placeholder:"Code...", value: property_code_search, width:48,},
            {
                type:'search-dropdown', value: landlords_array, width:48,
                selectOptions: landlords_array,
                searchPlaceholder: 'Landlord...', dropdownWidth: '300px',
                fetchData: store.dispatch('Landlords_List/fetchLandlords', {company:companyID.value})
            },
            {
                type:'dropdown', placeholder:"Status", value: status_search, width:48,
                options: [{text:'Active',value:'Active'},{text:'Inactive',value:'Inactive'}]
            },
            {
                type:'dropdown', placeholder:"Property Type", value: property_type_search, width:48,
                options: [{text:'Residential',value:'Residential'},{text:'Commercial',value:'Commercial'}]
            },
            
            {
                type:'search-dropdown', value: zones_array, width:48,
                selectOptions: zones_array,
                searchPlaceholder: 'Zone...', dropdownWidth: '300px',
                fetchData: store.dispatch('Zones/fetchZones', {company:companyID.value})
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const importProperties = () =>{
            store.commit('pageTab/ADD_PAGE', {'PMS':'Import_Properties'})
            store.state.pageTab.pmsActiveTab = 'Import_Properties';
        }
        const removeProperty = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    property: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Properties_List/deleteProperty',formData)
                    if(response && response.status == 200){
                        toast.success("Property Removed Succesfully");
                        searchProperties();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove property: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 property") 
            }else{
                toast.error("Please Select A Property To Remove")
            }
        }
        const removeProperties = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    property: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Properties_List/deleteProperty',formData)
                    if(response && response.status == 200){
                        toast.success("Property(s) Removed Succesfully");
                        searchPropertys();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove property: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Property To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchProperties = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                name: name_search.value,
                property_code: property_code_search.value,
                status: status_search.value,
                landlord: landlordID.value,
                zone: zoneID.value,
                property_type: property_type_search.value,
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/properties-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                propertyList.value = response.data.results;
                store.commit('Properties_List/LIST_PROPERTIES', propertyList.value)
                propResults.value = response.data;
                propArrLen.value = propertyList.value.length;
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
            store.commit('Properties_List/RESET_SEARCH_FILTERS')
            searchProperties();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchProperties();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchProperties();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchProperties();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchProperties();
            // scrollToTop();
        }
        const addNewProperty = async() =>{
            store.commit('Properties_List/initializeStore');
            await store.dispatch('Properties_List/updateState', {selectedProperty: null,selectedLandlord:null,selectedZone:null, isEditing: false});
            store.commit('pageTab/ADD_PAGE', {'PMS':'Property_Details'});
            store.state.pageTab.pmsActiveTab = 'Property_Details';          
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const propertyID = row[idField];
                let formData = {
                    company: companyID.value,
                    property: propertyID
                }
                await store.dispatch('Properties_List/fetchProperty',formData).
                then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'PMS':'Property_Details'})
                    store.state.pageTab.pmsActiveTab = 'Property_Details';
                })
            }else if(action == 'delete'){
                const propertyID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    property: propertyID
                }
                await store.dispatch('Properties_List/deleteProperty',formData).
                then(()=>{
                    searchProperties();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printPropertiesList = () =>{
            showLoader();
            let formData = {
                name: name_search.value,
                property_code: property_code_search.value,
                status: status_search.value,
                landlord: landlordID.value,
                zone: zoneID.value,
                property_type: property_type_search.value,
                company_id: companyID.value
            } 

            axios
            .post("api/v1/export-properties-pdf/", formData, { responseType: 'blob' })
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
        const downloadPropertiesExcel = () =>{
            showLoader();
            let formData = {
                name: name_search.value,
                property_code: property_code_search.value,
                status: status_search.value,
                landlord: landlordID.value,
                zone: zoneID.value,
                property_type: property_type_search.value,
                company_id: companyID.value
            }
            axios.post("api/v1/export-properties-excel/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Properties.xlsx');
                document.body.appendChild(link);
                link.click();
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        const downloadPropertiesCSV = () =>{
            showLoader();
            let formData = {
                name: name_search.value,
                property_code: property_code_search.value,
                status: status_search.value,
                landlord: landlordID.value,
                zone: zoneID.value,
                property_type: property_type_search.value,
                company_id: companyID.value
            }
            axios.post("api/v1/export-properties-csv/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Properties.csv');
                document.body.appendChild(link);
                link.click();
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        onBeforeMount(()=>{
            searchProperties();
            
        })
        return{
            searchProperties,resetFilters, addButtonLabel, searchFilters, tableColumns, propertyList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewProperty, showLoader, loader, hideLoader, importProperties, removeProperty, removeProperties,
            handleSelectionChange,addingRight,rightsModule,printPropertiesList,downloadPropertiesCSV,downloadPropertiesExcel
        }
    }
};
</script>