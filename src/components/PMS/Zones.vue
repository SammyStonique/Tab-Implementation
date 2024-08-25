<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewZone"
            :searchFilters="searchFilters"
            @searchPage="searchZones"
            @resetFilters="resetFilters"
            @importData="importZones"
            @removeItem="removeZone"
            @removeSelectedItems="removeZones"
            @printList="printList"
            :columns="tableColumns"
            :rows="zonesList"
            :actions="actions"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            :count="zoneCount"
            :currentPage="currentPage"
            :result="zoneArrLen"
            @loadPrev="loadPrev"
            @loadNext="loadNext"
            @firstPage="firstPage"
            @lastPage="lastPage"
            :showNextBtn="showNextBtn"
            :showPreviousBtn="showPreviousBtn"
        />
        <MovableModal v-model:visible="zoneModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="saveZone" @handleReset="handleReset"
            />
        </MovableModal>
    </div>
    
</template>

<script>
import axios from "axios";
import { ref, computed, watch, onBeforeMount } from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Zones',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'zone_id';
        const addButtonLabel = ref('New Zone');
        const title = ref('Zone Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const zonesList = ref([]);
        const zoneResults = ref([]);
        const zoneArrLen = ref(0);
        const zoneCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const zoneModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('35vw');
        const isEditing = computed(()=> store.state.Zones.isEditing);
        const showModal = ref(false);
        const selectedZone = computed(()=> store.state.Zones.selectedZone);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"name"},
            {label: "Manager", key:"manager_name"},
            {label: "Manager Phone#", key: "manager_phone_number"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Zone'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Statement'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Zone'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const zoneID = ref(null);
        const name_search = computed({
            get: () => store.state.Zones.name_search,
            set: (value) => store.commit('Zones/SET_SEARCH_FILTERS', {"name_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:60,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
            { type: 'text', name: 'name',label: "Zone Name", value: selectedZone.value?.name || '', required: true },
            { type: 'text', name: 'manager_name',label: "Manager Name", value: selectedZone.value?.manager_name || '', required: true },
            { type: 'text', name: 'manager_phone_number',label: "Phone Number", value: selectedZone.value?.manager_phone_number || '', required: true },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }

        watch([selectedZone], () => {
            if (selectedZone) {
                updateFormFields();
            }else{
                updateFormFields();
            }
            
        }, { immediate: true });
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createZone = async() =>{
            showModalLoader();
            let formData = {
                name: formFields.value[0].value,
                manager_name: formFields.value[1].value,
                manager_phone_number: formFields.value[2].value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Zones/createZone', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Zone created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the zone.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create zone: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchZones();
                }
            }
        }
        const updateZone = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                zone: selectedZone.value.zone_id,
                name: formFields.value[0].value,
                manager_name: formFields.value[1].value,
                manager_phone_number: formFields.value[2].value,
                company: companyID.value,
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value ==''){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Zones/updateZone', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Zone updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the zone.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update zone: ' + error.message);
                } finally {
                    hideModalLoader();
                    zoneModalVisible.value = false;
                    store.dispatch("Zones/updateState",{selectedZone:null})
                    searchZones();
                }             
            }
        }
        const saveZone = () =>{
            if(isEditing.value == true){
                updateZone();
            }else{
                createZone();
            }
        }
        const importZones = () =>{
            store.commit('pageTab/ADD_PAGE', {'PMS':'Import_Zones'})
            store.state.pageTab.pmsActiveTab = 'Import_Zones';
        }
        const removeZone = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    zone: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Zones/deleteZone',formData)
                    if(response && response.status == 200){
                        toast.success("Zone Removed Succesfully");
                        searchZones();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove zone: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 zone") 
            }else{
                toast.error("Please Select A Zone To Remove")
            }
        }
        const removeZones = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    zone: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Zones/deleteZone',formData)
                    if(response && response.status == 200){
                        toast.success("Zone(s) Removed Succesfully");
                        searchZones();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove zone: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Zone To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchZones = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                name: name_search.value,
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/zones-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                zonesList.value = response.data.results;
                store.commit('Zones/LIST_ZONES', zonesList.value)
                zoneResults.value = response.data;
                zoneArrLen.value = zonesList.value.length;
                zoneCount.value = zoneResults.value.count;
                pageCount.value = Math.ceil(zoneCount.value / 50);
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
            store.commit('Zones/RESET_SEARCH_FILTERS')
            searchZones();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchZones();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchZones();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchZones();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchZones();
            // scrollToTop();
        }
        const addNewZone = () =>{
            store.dispatch("Zones/updateState",{selectedZone:null})
            zoneModalVisible.value = true;
            handleReset();
            store.dispatch("Zones/updateState",{isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const zoneID = row[idField];
                let formData = {
                    company: companyID.value,
                    zone: zoneID
                }
                await store.dispatch('Zones/fetchZone',formData)
                zoneModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';
                
            }else if(action == 'delete'){
                const zoneID = row[idField];
                let formData = {
                    company: companyID.value,
                    zone: zoneID
                }

                await store.dispatch('Zones/deleteZone',formData)
                searchZones();         
            }
        }
        const closeModal = () =>{
            zoneModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchZones();
            
        })
        return{
            title, searchZones,resetFilters, addButtonLabel, searchFilters, tableColumns, zonesList,
            zoneResults, zoneArrLen, zoneCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, zoneModalVisible, closeModal,
            submitButtonLabel, showModal, addNewZone, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveZone, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            importZones, removeZone, removeZones
        }
    }
};
</script>