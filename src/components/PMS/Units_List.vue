<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewUnit"
            :searchFilters="searchFilters"
            @searchPage="searchUnits"
            @resetFilters="resetFilters"
            @importData="importUnits"
            @removeItem="removeUnit"
            @removeSelectedItems="removeUnits"
            @printList="printList"
            :columns="tableColumns"
            :rows="unitList"
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
                :displayButtons="displayButtons" @handleSubmit="saveUnit" @handleReset="handleReset"
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
    name: 'Units_List',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const propComponentKey = ref(0);
        const idField = 'property_unit_id';
        const addButtonLabel = ref('New Unit');
        const title = ref('Unit Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const unitList = ref([]);
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
        const modal_top = ref('120px');
        const modal_left = ref('400px');
        const modal_width = ref('40vw');
        const propertyID = ref('');
        const propertySearchID = ref('');
        const zoneSearchID = ref('');
        const landlordSearchID = ref('');
        const propertyName = ref('');
        const isEditing = computed(()=> store.state.Units_List.isEditing);
        const selectedUnit = computed(()=> store.state.Units_List.selectedUnit);
        const selectedProperty = computed(()=> store.state.Units_List.selectedProperty);
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Unit No", key:"unit_number"},
            {label: "Property", key:"property_name"},
            {label: "Tenant Name", key: "tenant_name"},
            {label: "Market Rent", key: "market_rent"},
            {label: "Curr. Rent", key: "current_rent"},
            {label: "Vacancy", key:"vacancy_status"},
            {label: "Owner Occ", key:"owner_occupied"},
            {label: "Bedrooms", key:"bedrooms"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Unit'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Statement'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Unit'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const unit_number_search = computed({
            get: () => store.state.Units_List.unit_number_search,
            set: (value) => store.commit('Units_List/SET_SEARCH_FILTERS', {"unit_number_search":value}),
        });
        const landlords_array = computed({
            get: () => store.state.Landlords_List.landlordArr,
        });
        const zones_array = computed({
            get: () => store.state.Zones.zoneArr,
        });
        const properties_array = computed({
            get: () => store.state.Properties_List.propertyArr,
        });
        const status_search = computed({
            get: () => store.state.Units_List.status_search,
            set: (value) => store.commit('Units_List/SET_SEARCH_FILTERS', {"status_search":value}),
        });
        const vacancy_status_search = computed({
            get: () => store.state.Units_List.vacancy_status_search,
            set: (value) => store.commit('Units_List/SET_SEARCH_FILTERS', {"vacancy_status_search":value}),
        });
        const owner_occupied_search = computed({
            get: () => store.state.Units_List.owner_occupied_search,
            set: (value) => store.commit('Units_List/SET_SEARCH_FILTERS', {"owner_occupied_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Unit No...", value: unit_number_search, width:36,},
            {
                type:'search-dropdown', value: landlords_array, width:48,
                selectOptions: landlords_array,
                searchPlaceholder: 'Landlord...', dropdownWidth: '300px',
                fetchData: store.dispatch('Landlords_List/fetchLandlords', {company:companyID.value})
            },
            {
                type:'dropdown', placeholder:"Status..", value: status_search, width:40,
                options: [{text:'Active',value:'Active'},{text:'Inactive',value:'Inactive'}]
            },
            {
                type:'dropdown', placeholder:"Vacancy Status..", value: vacancy_status_search, width:40,
                options: [{text:'Vacant',value:'Vacant'},{text:'Occupied',value:'Occupied'}]
            },
            {
                type:'dropdown', placeholder:"Owner Occuppied..", value: owner_occupied_search, width:40,
                options: [{text:'Yes',value:'True'},{text:'No',value:'False'}]
            },
            {
                type:'search-dropdown', value: properties_array, width:40,
                selectOptions: properties_array,
                searchPlaceholder: 'Property...', dropdownWidth: '200px',
                fetchData: store.dispatch('Properties_List/fetchProperties', {company:companyID.value})
            },        
            {
                type:'search-dropdown', value: zones_array, width:36,
                selectOptions: zones_array,
                searchPlaceholder: 'Zone...', dropdownWidth: '150px',
                fetchData: store.dispatch('Zones/fetchZones', {company:companyID.value})
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedProperty = async(option) =>{
            await store.dispatch('Properties_List/handleSelectedProperty', option);
            propertyID.value = store.state.Properties_List.propertyID;
            propertyName.value = store.state.Properties_List.propertyName;
            if(selectedUnit.value){
                selectedUnit.value.property.propertyID = propertyID.value;
                propertyValue.value = propertyID.value
            }
        }
        const formFields = ref([]);
        const propertyValue = computed(() => {
           return (selectedUnit.value && selectedUnit.value.property && !propertyID.value) ? selectedUnit.value.property.property_id : propertyID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Property", value: propertyValue.value, componentKey: propComponentKey,
                    selectOptions: propertyArray, optionSelected: handleSelectedProperty, required: true,
                    searchPlaceholder: 'Select Property...', dropdownWidth: '500px', updateValue: selectedProperty.value,
                    fetchData: store.dispatch('Properties_List/fetchProperties', {company:companyID.value})
                },
                { type: 'text', name: 'unit_number',label: "Unit No.", value: selectedUnit.value?.unit_number || '', required: true },
                { type: 'number', name: 'market_rent',label: "Rent Amount", value: selectedUnit.value?.market_rent || '', required: true },
                { type: 'dropdown', name: 'charge_frequency',label: "Charge Frequency", value: selectedUnit.value?.charge_frequency || '', placeholder: "", required: false, options: [{ text: 'One Off', value: 'One Off' }, { text: 'Weekly', value: 'Weekly' }, { text: 'Monthly', value: 'Monthly' }, { text: 'Quartely', value: 'Quartely' }, { text: 'Semi-Annually', value: 'Semi-Annually' }, { text: 'Annually', value: 'Annually' }] },
                { type: 'dropdown', name: 'owner_occupied',label: "Owner Occupied", value: selectedUnit.value?.owner_occupied || 'False', placeholder: "", required: false, options: [{ text: 'Yes', value: 'True' }, { text: 'No', value: 'False' }] },
                { type: 'dropdown', name: 'unit_type',label: "Unit Type", value: selectedUnit.value?.unit_type || '', placeholder: "", required: false, options: [{ text: 'Studio', value: 'Studio' }, { text: 'Bedsitter', value: 'Bedsitter' }, { text: 'Bedroomed', value: 'Bedroomed' },{ text: 'Shop', value: 'Shop' }, { text: 'Office', value: 'Office' }, { text: 'Other', value: 'Other' }] },                
                { type: 'number', name: 'bedrooms',label: "Bedrooms", value: selectedUnit.value?.bedrooms || '', required: false },
                { type: 'text', name: 'electricity_meter_number',label: "Electricity Mtr No.", value: selectedUnit.value?.electricity_meter_number || '', required: false },
                { type: 'text', name: 'water_meter_number',label: "Water Mtr No.", value: selectedUnit.value?.water_meter_number || '', required: false },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            propertyID.value = '';
        }

        watch([selectedUnit, selectedProperty], () => {
            if (selectedUnit.value && selectedProperty.value) {
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
        const createUnit = async() =>{
            showModalLoader();
            let formData = {
                unit_number: formFields.value[1].value,
                charge_frequency: formFields.value[3].value,
                owner_occupied: formFields.value[4].value || 'False',
                unit_type: formFields.value[5].value,
                vacancy_status: "Vacant",
                status: "Active",
                bedrooms: formFields.value[6].value,
                market_rent: formFields.value[2].value,
                current_rent: 0,
                electricity_meter_number: formFields.value[7].value,
                water_meter_number: formFields.value[8].value,
                property: propertyID.value,
                property_id: propertyID.value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(propertyValue.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Units_List/createUnit', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Unit created successfully!');
                        handleReset();
                        propComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the unit.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create unit: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchUnits();
                }
            }
        }
        const updateUnit = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                property_unit: selectedUnit.value.property_unit_id,
                unit_number: formFields.value[1].value,
                charge_frequency: formFields.value[3].value,
                owner_occupied: formFields.value[4].value,
                unit_type: formFields.value[5].value,
                vacancy_status: selectedProperty.value.vacancy_status,
                status: selectedProperty.value.status,
                bedrooms: formFields.value[6].value,
                market_rent: formFields.value[2].value,
                current_rent: selectedProperty.value.current_rent,
                electricity_meter_number: formFields.value[7].value,
                water_meter_number: formFields.value[8].value,
                property: propertyValue.value,
                property_id: propertyValue.value,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value ==''){
                    errors.value.push('Error');
                }
            }
            if(propertyValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Units_List/updateUnit', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        propComponentKey.value += 1;
                        toast.success("Unit updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the unit.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update unit: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Units_List/updateState",{selectedUnit:null})
                    searchUnits();
                }             
            }
        }
        const saveUnit = () =>{
            if(isEditing.value == true){
                updateUnit();
            }else{
                createUnit();
            }
        }
        const importUnits = () =>{
            store.commit('pageTab/ADD_PAGE', {'PMS':'Import_Units'})
            store.state.pageTab.pmsActiveTab = 'Import_Units';
        }
        const removeUnit = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    property_unit: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Units_List/deleteUnit',formData)
                    if(response && response.status == 200){
                        toast.success("Unit Removed Succesfully");
                        searchUnits();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove unit: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 unit") 
            }else{
                toast.error("Please Select A Unit To Remove")
            }
        }
        const removeUnits = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    property_unit: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Units_List/deleteUnit',formData)
                    if(response && response.status == 200){
                        toast.success("Unit(s) Removed Succesfully");
                        searchUnits();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove unit: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Unit To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchUnits = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                unit_number: unit_number_search.value,
                status: status_search.value,
                vacancy: vacancy_status_search.value,
                owner_occupied: owner_occupied_search.value,
                property: propertySearchID.value,
                landlord: landlordSearchID.value,
                zone: zoneSearchID.value,
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/property-units-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                unitList.value = response.data.results;
                store.commit('Units_List/LIST_UNITS', unitList.value)
                propResults.value = response.data;
                propArrLen.value = unitList.value.length;
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
            store.commit('Units_List/RESET_SEARCH_FILTERS')
            searchUnits();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchUnits();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchUnits();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchUnits();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchUnits();
            // scrollToTop();
        }
        const addNewUnit = () =>{
            store.dispatch("Units_List/updateState",{selectedUnit:null});
            updateFormFields();
            propModalVisible.value = true;
            propComponentKey.value += 1;
            handleReset();
            store.dispatch("Units_List/updateState",{isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const unitID = row[idField];
                let formData = {
                    company: companyID.value,
                    property_unit: unitID
                }
                await store.dispatch('Units_List/fetchUnit',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const unitID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    property_unit: unitID
                }
                await store.dispatch('Units_List/deleteUnit',formData).
                then(()=>{
                    searchUnits();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchUnits();
            
        })
        return{
            title, searchUnits,resetFilters, addButtonLabel, searchFilters, tableColumns, unitList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewUnit, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveUnit, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            importUnits, removeUnit, removeUnits
        }
    }
};
</script>