<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewLocation"
        :searchFilters="searchFilters"
        @searchPage="searchLocations"
        @resetFilters="resetFilters"
        @removeItem="removeLocation"
        @removeSelectedItems="removeLocations"
        :addingRight="addingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="locationList"
        :actions="actions"
        :idField="idField"
        @handleSelectionChange="handleSelectionChange"
        @handleActionClick="handleActionClick"
        :count="depCount"
        :currentPage="currentPage"
        :result="depArrLen"
        @loadPrev="loadPrev"
        @loadNext="loadNext"
        @firstPage="firstPage"
        @lastPage="lastPage"
        :showNextBtn="showNextBtn"
        :showPreviousBtn="showPreviousBtn"
    />
    <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="saveLocation" @handleReset="handleReset"
        />
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Item_Location',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Location Details');
        const addButtonLabel = ref('New Location');
        const addingRight = ref('Adding Item Categories');
        const rightsModule = ref('Inventory');
        const idField = 'location_id';
        const selectedIds = ref([]);
        const depModalVisible = ref(false);
        const locationList = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const isEditing = computed(()=> store.state.Item_Location.isEditing);
        const selectedLocation = computed(()=> store.state.Item_Location.selectedLocation);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key: "location_name", type: "text", editable: false},
            {label: "Column", key: "column", type: "text", editable: false},
            {label: "Row", key: "row", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Location', rightName: 'Editing Item Categories'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Location', rightName: 'Deleting Item Categories'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const location_name_search = computed({
            get: () => store.state.Item_Location.location_name_search,
            set: (value) => store.commit('Item_Location/SET_SEARCH_FILTERS', {"location_name_search":value}),
        });
        const column_search = computed({
            get: () => store.state.Item_Location.column_search,
            set: (value) => store.commit('Item_Location/SET_SEARCH_FILTERS', {"column_search":value}),
        });
        const row_search = computed({
            get: () => store.state.Item_Location.row_search,
            set: (value) => store.commit('Item_Location/SET_SEARCH_FILTERS', {"row_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Search Name...", value: location_name_search, width: 56},
            {type:'text', placeholder:"Search Column...", value: column_search, width: 36},
            {type:'text', placeholder:"Search Row...", value: row_search, width: 36},
        ]);
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'location_name',label: "Name", value: selectedLocation.value?.location_name || '', required: true },
                { type: 'text', name: 'column',label: "Column", value: selectedLocation.value?.column || '', required: true },
                { type: 'text', name: 'row',label: "Row", value: selectedLocation.value?.row || '', required: true },
            ];
        };
        watch([selectedLocation], () => {
            if(selectedLocation.value){
                updateFormFields();
            }      
        }, { immediate: true });
        const addNewLocation = async() =>{
            updateFormFields();
            await store.dispatch("Item_Location/updateState",{isEditing:false, selectedLocation:null})
            depModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        };
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const locationID = row[idField];
                let formData = {
                    company: companyID.value,
                    location: locationID
                }
                await store.dispatch('Item_Location/fetchAreaLocation',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const locationID = [row['location_id']];
                let formData = {
                    company: companyID.value,
                    location: locationID
                }
                await store.dispatch('Item_Location/deleteAreaLocation',formData)
                searchLocations();
            }
        } 
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createLocation = async() =>{
            showModalLoader();
            let formData = {
                location_name: formFields.value[0].value,
                column: formFields.value[1].value,    
                row: formFields.value[2].value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Item_Location/createAreaLocation', formData);
                    if(response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Location created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Location.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Location: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchLocations();
                }
            }

        }
        const updateLocation = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                location_name: formFields.value[0].value,
                column: formFields.value[1].value,    
                row: formFields.value[2].value,
                location: selectedLocation.value.location_id,
                company: companyID.value,
            }
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
            }else{
                try {
                    const response = await store.dispatch('Item_Location/updateAreaLocation', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Location updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Location.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Location: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchLocations();
                }
            }
        }
        const saveLocation = () =>{
            if(isEditing.value == true){
                updateLocation();
            }else{
                createLocation();
            }
        }
        const removeLocation = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    location: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Item_Location/deleteAreaLocation',formData)
                    if(response && response.status == 200){
                        toast.success("Location Removed Succesfully");
                        searchLocations();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Location: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Location") 
            }else{
                toast.error("Please Select A Location To Remove")
            }
        }
        const removeLocations = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    location: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Item_Location/deleteAreaLocation',formData)
                    if(response && response.status == 200){
                        toast.success("Location(s) Removed Succesfully");
                        searchLocations();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Location(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Location To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchLocations = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                location_name: location_name_search.value,
                column: column_search.value,
                row: row_search.value,
                company_id: companyID.value
            }
            axios
            .post(`api/v1/item-location-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                locationList.value = response.data.results;
                store.commit('Item_Location/LIST_LOCATIONS', locationList.value)
                depResults.value = response.data;
                depArrLen.value = locationList.value.length;
                depCount.value = depResults.value.count;
                pageCount.value = Math.ceil(depCount.value / 50);
                
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
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchLocations();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchLocations();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchLocations();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchLocations();
        }
        const resetFilters = () =>{
            store.commit('Item_Location/RESET_SEARCH_FILTERS')
            searchLocations();
        };
        const closeModal = async() =>{
            await store.dispatch("Item_Location/updateState",{isEditing:false, selectedLocation:null})
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchLocations();
        })
        return{
            title,idField, searchLocations, addButtonLabel, searchFilters, resetFilters, tableColumns, locationList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewLocation,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveLocation,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeLocation, removeLocations,
            addingRight,rightsModule,handleSelectionChange,closeModal
        }
    }
}
</script>