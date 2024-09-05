<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewReading"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchMeterReadings"
            @resetFilters="resetFilters"
            @importData="importMeterReadings"
            @removeItem="removeMeterReading"
            @removeSelectedItems="removeMeterReadings"
            @printList="printList"
            :columns="tableColumns"
            :rows="readingsList"
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
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="saveMeterReading" @handleReset="handleReset"
            />
        </MovableModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Meter_Readings',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'meter_reading_id';
        const addButtonLabel = ref('New Reading');
        const title = ref('Reading Details');
        const submitButtonLabel = ref('Add');
        const setupComponentKey = ref(0);
        const propComponentKey = ref(0);
        const unitComponentKey = ref(0);
        const selectedIds = ref([]);
        const readingsList = ref([]);
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
        const modal_top = ref('150px');
        const modal_left = ref('300px');
        const modal_width = ref('55vw');
        const consumed_units = ref(0);
        const consumed_units_totals = ref(0);
        const units_cost = ref(0);
        const meter_rent = ref(0);
        const setupID = ref('');
        const unitID = ref('');
        const propertyID = ref(null);
        const propertySearchID = ref('');
        const utilitySearchID = ref('');
        const isEditing = computed(()=> store.state.Meter_Readings.isEditing);
        const unitsArray = computed(() => store.state.Active_Tenants.tenantUnitsArr);
        const setupArray = computed(() => store.state.Meter_Setup.setupArr);
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);
        const utilityArray = computed(() => store.state.Utilities.utilityArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "current_reading_date"},
            {label: "Tenant Name", key:"tenant_name"},
            {label: "Property Name", key:"property_name"},
            {label: "Prev Read.", key:"previous_reading"},
            {label: "Curr Read.", key:"current_reading"},
            {label: "Units", key:"units_consumed"},
            {label: "Meter Rent", key:"meter_rent"},
            {label: "Sub Total", key:"sub_total"},
            {label: "Total", key:"total_amount"},
            {label: "Invoice#", key:"invoice"},
        ])
        
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Reading'},
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
        const fetchUtilities = async() =>{
            await store.dispatch('Utilities/fetchUtilities', {company:companyID.value})
        };
        const handleSearchUtility = async(option) =>{
            await store.dispatch('Utilities/handleSelectedUtility', option)
            utilitySearchID.value = store.state.Utilities.utilityID;
        };
        const clearSearchUtility = async() =>{
            await store.dispatch('Utilities/updateState', {utilityID: ''});
            utilitySearchID.value = ""
        }
        const tenant_name_search = computed({
            get: () => store.state.Meter_Readings.tenant_name_search,
            set: (value) => store.commit('Meter_Readings/SET_SEARCH_FILTERS', {"tenant_name_search":value}),
        });
        const tenant_code_search = computed({
            get: () => store.state.Meter_Readings.tenant_code_search,
            set: (value) => store.commit('Meter_Readings/SET_SEARCH_FILTERS', {"tenant_code_search":value}),
        });
        const from_date_search = computed({
            get: () => store.state.Meter_Readings.from_date_search,
            set: (value) => store.commit('Meter_Readings/SET_SEARCH_FILTERS', {"from_date_search":value}),
        });
        const to_date_search = computed({
            get: () => store.state.Meter_Readings.to_date_search,
            set: (value) => store.commit('Meter_Readings/SET_SEARCH_FILTERS', {"to_date_search":value}),
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
            {
                type:'search-dropdown', value: utilitySearchID.value, width:48,
                selectOptions: utilityArray, optionSelected: handleSearchUtility,
                searchPlaceholder: 'Utility Search...', dropdownWidth: '250px',
                fetchData: fetchUtilities(), clearSearch: clearSearchUtility()   
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
        const fetchUnits = async() =>{
            if(propertyID.value){
                await store.dispatch('Active_Tenants/fetchTenantUnits', {company:companyID.value, property: propertyID.value})
            }       
        };
        const handleSelectedUnit = async(option) =>{
            await store.dispatch('Active_Tenants/handleSelectedTenantUnit', option)
            unitID.value = store.state.Active_Tenants.tenantUnitID;
        };
        const clearSelectedUnit = async() =>{
            await store.dispatch('Active_Tenants/updateState', {tenantUnitID: ''});
            unitID.value = ""
        }
        const fetchSetups = async() =>{
            if(propertyID.value){
                await store.dispatch('Meter_Setup/fetchSetups', {company:companyID.value, property: propertyID.value})
            }       
        };
        const handleSelectedSetup = async(option) =>{
            await store.dispatch('Meter_Setup/handleSelectedSetup', option)
            setupID.value = store.state.Meter_Setup.setupID;
            units_cost.value = store.state.Meter_Setup.unitCost;
            meter_rent.value = store.state.Meter_Setup.meterRent;
        };
        const clearSelectedSetup = async() =>{
            await store.dispatch('Meter_Setup/updateState', {setupID: ''});
            setupID.value = ""
        }
        const calculateUnitsConsumed = () =>{
            consumed_units.value = formFields.value[6].value - formFields.value[4].value;
            formFields.value[8].value = meter_rent.value;
            consumed_units_totals.value = Number(consumed_units.value * units_cost.value) + Number(meter_rent.value);
        }
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                {
                    type:'search-dropdown', label:"Property", value: propertyID.value, componentKey: propComponentKey,
                    selectOptions: propertyArray, optionSelected: handleSelectedProperty, required: true,
                    searchPlaceholder: 'Select Property...', dropdownWidth: '320px', updateValue: "",
                    fetchData: fetchProperties(), clearSearch: clearSelectedProperty()            
                },
                {
                    type:'search-dropdown', label:"Costing Setup", value: setupID.value, componentKey: setupComponentKey,
                    selectOptions: setupArray, optionSelected: handleSelectedSetup, required: true,
                    searchPlaceholder: 'Select Setup...', dropdownWidth: '320px', updateValue: "",
                    fetchData: fetchSetups(), clearSearch: clearSelectedSetup()  
                },
                {
                    type:'search-dropdown', label:"Unit", value: unitID.value, componentKey: unitComponentKey,
                    selectOptions: unitsArray, optionSelected: handleSelectedUnit, required: true,
                    searchPlaceholder: 'Select Unit...', dropdownWidth: '320px', updateValue: "",
                    fetchData: fetchUnits(), clearSearch: clearSelectedUnit()  
                },
                { type: 'date', name: 'previous_reading_date',label: "Prev Reading Date", value: '', required: true },
                { type: 'number', name: 'previous_reading',label: "Prev Reading", value: 0, required: true },
                { type: 'date', name: 'current_reading_date',label: "Curr Reading Date", value: '', required: true },
                { type: 'number', name: 'current_reading',label: "Curr Reading", value: 0, method: calculateUnitsConsumed, required: true },
                { type: 'number', name: 'units_consumed',label: "Units Consumed", value: 0, required: false, disabled: true },
                { type: 'number', name: 'meter_rent',label: "Meter Rent", value: 0, required: false, disabled: true },
                { type: 'number', name: 'total_amount',label: "Total", value: 0, required: false, disabled: true },
                { value: "", required: false},
                
            ]
        };
        const handleReset = async() =>{
            await store.dispatch('Meter_Setup/updateState', {setupArr:[]})
            await store.dispatch('Active_Tenants/updateState', {tenantUnitsArr:[]});
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            propComponentKey.value += 1;
            unitComponentKey.value += 1;
            setupComponentKey.value += 1;
            propertyID.value = '';
            unitID.value = "";
            setupID.value = '';
            setupArray.value = [];
            unitsArray.value = [];
        }

        watch([propertyID,], () => {
            if (propertyID.value) {
                unitComponentKey.value += 1;
                setupComponentKey.value += 1;
                fetchUnits();
                fetchSetups();
            }
            
        }, { immediate: true });

        watch([ consumed_units], ()=>{
            if(consumed_units.value){
                formFields.value[7].value = consumed_units.value;
                formFields.value[8].value = meter_rent.value;
                formFields.value[9].value = consumed_units_totals.value;
            }
        }, { immediate: true });
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const saveMeterReading = async() =>{
            showModalLoader();
            let formData = {
                unit: unitID.value,
                unit_id: unitID.value,
                previous_reading: formFields.value[4].value,
                previous_reading_date: formFields.value[3].value,
                current_reading: formFields.value[6].value,
                current_reading_date: formFields.value[5].value,
                meter_costing: setupID.value,
                meter_costing_id: setupID.value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=3; i < (formFields.value.length); i++){
                if(formFields.value[i].value =='' && formFields.value[i].type =='text' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }else if(formFields.value[i].value < 0 && formFields.value[i].type =='number' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(propertyID.value == '' && unitID.value == '' && setupID.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else if(consumed_units.value <= 0){
                toast.error('Invalid Reading');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Meter_Readings/createMeterReading', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Meter Reading created successfully!');
                        handleReset();
                        unitComponentKey.value += 1;
                        setupComponentKey.value += 1;
                        propComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the reading.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create reading: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchMeterReadings();
                }
            }
        }

        const removeMeterReading = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    meter_reading: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Meter_Readings/deleteMeterReading',formData)
                    if(response && response.status == 200){
                        toast.success("Meter Reading Removed Succesfully");
                        searchMeterReadings();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove meter reading: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 reading") 
            }else{
                toast.error("Please Select A Meter Reading To Remove")
            }
        }
        const removeMeterReadings = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    meter_reading: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Meter_Readings/deleteMeterReading',formData)
                    if(response && response.status == 200){
                        toast.success("Meter Reading(s) Removed Succesfully");
                        searchMeterReadings();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove readings: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Meter Reading To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchMeterReadings = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                tenant_name: tenant_name_search.value,
                tenant_code: tenant_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                property: propertySearchID.value,
                utility: utilitySearchID.value,
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/meter-readings-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                readingsList.value = response.data.results;
                store.commit('Meter_Readings/LIST_METER_READINGS', readingsList.value)
                propResults.value = response.data;
                propArrLen.value = readingsList.value.length;
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
            store.commit('Meter_Readings/RESET_SEARCH_FILTERS')
            searchMeterReadings();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchMeterReadings();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchMeterReadings();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchMeterReadings();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchMeterReadings();
            // scrollToTop();
        }
        const addNewReading = () =>{
            updateFormFields();
            store.dispatch("Meter_Readings/updateState",{selectedReading:null, isEditing:false})
            propertyID.value = "";
            unitID.value = "";
            setupID.value = "";
            unitComponentKey.value += 1;
            propComponentKey.value += 1;
            setupComponentKey.value += 1;
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const meter_readingID = [row['meter_reading_id']];
                let formData = {
                    company: companyID.value,
                    meter_reading: meter_readingID
                }
                await store.dispatch('Meter_Readings/deleteMeterReading',formData).
                then(()=>{
                    searchMeterReadings();
                })
            }
        }
        const closeModal = async() =>{
            await store.dispatch('Meter_Setup/updateState', {setupArr:[]})
            await store.dispatch('Active_Tenants/updateState', {tenantUnitsArr:[]})
            setupArray.value = [];
            unitsArray.value = [];
            propModalVisible.value = false;
            propComponentKey.value += 1;
            setupComponentKey.value += 1;
            unitComponentKey.value += 1;
            propertyID.value = "";
            unitID.value = "";
            setupID.value = "";
            
        }

        const dropdownOptions = ref([
            {label: 'Batch Reading', action: 'batch-meter-reading'},
        ]);
        const handleDynamicOption = (option) =>{
            if(option == 'batch-meter-reading'){
                store.commit('pageTab/ADD_PAGE', {'PMS':'Batch_Readings'})
                store.state.pageTab.pmsActiveTab = 'Batch_Readings';
            }
        }
        onBeforeMount(()=>{
            searchMeterReadings();
            
        })
        return{
            title, searchMeterReadings,resetFilters, addButtonLabel, searchFilters, tableColumns, readingsList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewReading, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveMeterReading, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeMeterReading, removeMeterReadings, dropdownOptions, handleDynamicOption
        }
    }
};
</script>