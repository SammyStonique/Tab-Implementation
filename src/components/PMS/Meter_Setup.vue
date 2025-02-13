<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewSetup"
            :searchFilters="searchFilters"
            @searchPage="searchMeterSetups"
            @resetFilters="resetFilters"
            @removeItem="removeMeterSetup"
            @removeSelectedItems="removeMeterSetups"
            @printList="printList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="setupList"
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
            :selectedValue="selectedValue"
            @selectSearchQuantity="selectSearchQuantity"
        />
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="saveMeterSetup" @handleReset="handleReset"
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
    name: 'Meter_Setup',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'meter_setup_id';
        const addButtonLabel = ref('New Setup');
        const addingRight = ref('Adding Meter Reading Setup');
        const rightsModule = ref('PMS');
        const title = ref('Setup Details');
        const submitButtonLabel = ref('Add');
        const utilComponentKey = ref(0);
        const propComponentKey = ref(0);
        const selectedIds = ref([]);
        const setupList = ref([]);
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
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const utilityID = ref('');
        const propertyID = ref('');
        const utilitySearchID = ref('');
        const propertySearchID = ref('');
        const isEditing = computed(()=> store.state.Meter_Setup.isEditing);
        const selectedSetup = computed(()=> store.state.Meter_Setup.selectedSetup);
        const selectedUtility = computed(()=> store.state.Meter_Setup.selectedUtility);
        const selectedProperty = computed(()=> store.state.Meter_Setup.selectedProperty);
        const utilityArray = computed(() => store.state.Utilities.utilityArr);
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Property Name", key:"property_name"},
            {label: "Utility Name", key:"utility_name"},
            {label: "Date", key: "date"},
            {label: "Costing Type", key:"costing_type"},
            {label: "Unit Cost", key:"unit_cost"},
            {label: "Meter Rent", key:"meter_rent"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Setup', rightName: 'Editing Meter Reading Setup'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Setup', rightName: 'Deleting Meter Reading Setup'},
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
        const searchFilters = ref([
            {
                type:'search-dropdown', value: propertySearchID.value, width:48,
                selectOptions: propertyArray, optionSelected: handleSearchProperty,
                searchPlaceholder: 'Property Search...', dropdownWidth: '300px',
                fetchData: fetchProperties(), clearSearch: clearSearchProperty()             
            },
            {
                type:'search-dropdown', value: utilitySearchID.value, width:48,
                selectOptions: utilityArray, optionSelected: handleSearchUtility,
                searchPlaceholder: 'Utility Search...', dropdownWidth: '300px',
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
        const handleSelectedUtility = async(option) =>{
            await store.dispatch('Utilities/handleSelectedUtility', option)
            utilityID.value = store.state.Utilities.utilityID;
        };
        const clearSelectedUtility = async() =>{
            await store.dispatch('Utilities/updateState', {utilityID: ''});
            utilityID.value = ""
        }
        const formFields = ref([]);
        const propertyValue = computed(() => {
           return (selectedSetup.value && selectedSetup.value.property && !propertyID.value) ? selectedSetup.value.property.property_id : propertyID.value;

        });
        const utilityValue = computed(() => {
           return (selectedSetup.value && selectedSetup.value.utility && !utilityID.value) ? selectedSetup.value.utility.utility_id : utilityID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                {
                    type:'search-dropdown', label:"Property", value: propertyValue.value, componentKey: propComponentKey,
                    selectOptions: propertyArray, optionSelected: handleSelectedProperty, required: true,
                    searchPlaceholder: 'Select Property...', dropdownWidth: '500px', updateValue: selectedProperty.value,
                    fetchData: fetchProperties(), clearSearch: clearSelectedProperty()            
                },
                {
                    type:'search-dropdown', label:"Utility", value: utilityValue.value, componentKey: utilComponentKey,
                    selectOptions: utilityArray, optionSelected: handleSelectedUtility, required: true,
                    searchPlaceholder: 'Select Utility...', dropdownWidth: '500px', updateValue: selectedUtility.value,
                    fetchData: fetchUtilities(), clearSearch: clearSelectedUtility()  
                },
                { type: 'date', name: 'date',label: "Date", value: selectedSetup.value?.date || '', required: true },
                { type: 'dropdown', name: 'costing_type',label: "Costing Type", value: selectedSetup.value?.costing_type || '', placeholder: "", required: false, options: [{ text: 'Flat Rate', value: 'Flat Rate' }, { text: 'Graduated', value: 'Graduated' }] },
                { type: 'number', name: 'unit_cost',label: "Unit Cost", value: selectedSetup.value?.unit_cost || 0, required: true },
                { type: 'number', name: 'meter_rent',label: "Meter Rent", value: selectedSetup.value?.meter_rent || 0, required: false },
                
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            propertyID.value = '';
            utilityID.value = "";
        }

        watch([selectedSetup, selectedProperty, selectedUtility], () => {
            if (selectedSetup.value && selectedProperty.value && selectedUtility.value) {
                utilComponentKey.value += 1;
                propComponentKey.value += 1;
                updateFormFields();
            }
            
        }, { immediate: true });
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createMeterSetup = async() =>{
            showModalLoader();
            let formData = {
                date: formFields.value[2].value,
                property: propertyID.value,
                property_id: propertyID.value,
                meter_rent: formFields.value[5].value || 0,
                unit_cost: formFields.value[4].value,
                graduated_costing: {},
                costing_type: formFields.value[3].value,
                utility: utilityID.value,
                utility_id: utilityID.value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=2; i < (formFields.value.length); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(propertyValue.value == '' && utilityValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Meter_Setup/createSetup', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Setup created successfully!');
                        handleReset();
                        utilComponentKey.value += 1;
                        propComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the setup.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create setup: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchMeterSetups();
                }
            }
        }
        const updateMeterSetup = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                meter_costing: selectedSetup.value.meter_costing_id,
                date: formFields.value[2].value,
                property: propertyValue.value,
                property_id: propertyValue.value,
                meter_rent: formFields.value[5].value || 0,
                unit_cost: formFields.value[4].value,
                graduated_costing: {},
                costing_type: formFields.value[3].value,
                utility: utilityValue.value,
                utility_id: utilityValue.value,
                company: companyID.value
            }

            for(let i=2; i < formFields.value.length; i++){
                if(formFields.value[i].value ==''){
                    errors.value.push('Error');
                }
            }
            if(propertyValue.value == '' && utilityValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Meter_Setup/updateSetup', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        propComponentKey.value += 1;
                        utilComponentKey.value += 1;
                        toast.success("Setup updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the setup.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update setup: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Meter_Setup/updateState",{selectedSetup:null})
                    searchMeterSetups();
                }             
            }
        }
        const saveMeterSetup = () =>{
            if(isEditing.value == true){
                updateMeterSetup();
            }else{
                createMeterSetup();
            }
        }
        const removeMeterSetup = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    meter_costing: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Meter_Setup/deleteSetup',formData)
                    if(response && response.status == 200){
                        toast.success("Setup Removed Succesfully");
                        searchMeterSetups();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove setup: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 setup") 
            }else{
                toast.error("Please Select A Setup To Remove")
            }
        }
        const removeMeterSetups = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    meter_costing: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Meter_Setup/deleteSetup',formData)
                    if(response && response.status == 200){
                        toast.success("Setup(s) Removed Succesfully");
                        searchMeterSetups();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove setups: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Setup To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchMeterSetups = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                property: propertySearchID.value,
                utility: utilitySearchID.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/meter-costings-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                setupList.value = response.data.results;
                store.commit('Meter_Setup/LIST_SETUPS', setupList.value)
                propResults.value = response.data;
                propArrLen.value = setupList.value.length;
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
            searchMeterSetups(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            store.commit('Meter_Setup/RESET_SEARCH_FILTERS')
            searchMeterSetups();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchMeterSetups();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchMeterSetups();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchMeterSetups();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchMeterSetups();
            // scrollToTop();
        }
        const addNewSetup = () =>{
            updateFormFields();
            store.dispatch("Meter_Setup/updateState",{selectedSetup:null, selectedUtility:null , selectedProperty:null, isEditing:false})
            propertyID.value = "";
            utilityID.value = "";
            utilComponentKey.value += 1;
            propComponentKey.value += 1;
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const meter_costingID = row['meter_costing_id'];
                let formData = {
                    company: companyID.value,
                    meter_costing: meter_costingID
                }

                await store.dispatch('Meter_Setup/fetchSetup',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const meter_costingID = [row['meter_costing_id']];
                let formData = {
                    company: companyID.value,
                    meter_costing: meter_costingID
                }
                await store.dispatch('Meter_Setup/deleteSetup',formData).
                then(()=>{
                    searchMeterSetups();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchMeterSetups();
            
        })
        return{
            title, searchMeterSetups,resetFilters, addButtonLabel, searchFilters, tableColumns, setupList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,selectSearchQuantity,selectedValue,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewSetup, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveMeterSetup, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeMeterSetup, removeMeterSetups,addingRight,rightsModule
        }
    }
};
</script>