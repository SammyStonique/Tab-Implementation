<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewProperty"
            :searchFilters="searchFilters"
            @searchPage="searchProperties"
            @resetFilters="resetFilters"
            :columns="tableColumns"
            :rows="propertyList"
            :actions="actions"
            :idField="idField"
            @handleActionClick="handleActionClick"
            :count="propCount"
            :currentPage="currentPage"
            :result="depArrLen"
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
import { ref, computed, onMounted, onBeforeMount , defineComponent } from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";

export default defineComponent({
    name: 'Properties_List',
    components:{
        PageComponent
    },
    setup(){
        const loader = ref('');
        const store = useStore();
        const idField = 'property_id';
        const addButtonLabel = ref('New Property');
        const submitButtonLabel = ref('Add');
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
            {label: "Vacancy", key:"vacancy_status"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Property'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Statement'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Property'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const landlordID = ref(null);
        const zoneID = ref(null);
        const name_search = computed({
            get: () => store.state.Patients_List.first_name_search,
            set: (value) => store.commit('Patients_List/SET_SEARCH_FILTERS', {"first_name_search":value}),
        });
        const property_code_search = computed({
            get: () => store.state.Patients_List.last_name_search,
            set: (value) => store.commit('Patients_List/SET_SEARCH_FILTERS', {"last_name_search":value}),
        });
        const status_search = computed({
            get: () => store.state.Patients_List.phone_number_search,
            set: (value) => store.commit('Patients_List/SET_SEARCH_FILTERS', {"phone_number_search":value}),
        });
        const vacancy_status_search = computed({
            get: () => store.state.Patients_List.phone_number_search,
            set: (value) => store.commit('Patients_List/SET_SEARCH_FILTERS', {"phone_number_search":value}),
        });
        const landlords_array = computed({
            get: () => store.state.Patients_List.patientsArr,
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
                type:'dropdown', placeholder:"Vacancy", value: vacancy_status_search, width:48,
                options: [{text:'Vacant',value:'Vacant'},{text:'Occupied',value:'Occupied'}]
            },
            
            {
                type:'search-dropdown', value: zones_array, width:48,
                selectOptions: zones_array,
                searchPlaceholder: 'Zone...', dropdownWidth: '300px',
                fetchData: store.dispatch('Zones/fetchZones', {company:companyID.value})
            },
        ])
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
                vacancy: vacancy_status_search.value,
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
        const addNewProperty = () =>{
            showModal.value = true;
            store.commit('pageTab/ADD_PAGE', {'HMS':'Patient_Details'})
            store.state.pageTab.hmsActiveTab = 'Patient_Details';
            store.dispatch('Patients_List/updateState', {isEditing: false});
            store.dispatch('Patients_List/updateState', {selectedPatient: null});
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const patientID = row[idField];
                let formData = {
                    hospital: companyID.value,
                    patient: patientID
                }
                await store.dispatch('Patients_List/fetchPatient',formData).
                then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'HMS':'Patient_Details'})
                    store.state.pageTab.hmsActiveTab = 'Patient_Details';
                })
                
                // patModalVisible.value = true;
            }else if(action == 'delete'){
                const patientID = row[idField];
                let formData = {
                    hospital: companyID.value,
                    patient: patientID
                }
                await store.dispatch('Patients_List/deletePatient',formData).
                then(()=>{
                    searchProperties();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchProperties();
            
        })
        return{
            searchProperties,resetFilters, addButtonLabel, searchFilters, tableColumns, propertyList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewProperty, showLoader, loader, hideLoader
        }
    }
})
</script>