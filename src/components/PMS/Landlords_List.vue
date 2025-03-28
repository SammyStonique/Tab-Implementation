<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewLandlord"
            :searchFilters="searchFilters"
            @searchPage="searchLandlords"
            @resetFilters="resetFilters"
            @importData="importLandlords"
            @removeItem="removeLandlord"
            @removeSelectedItems="removeLandlords"
            @printList="printLandlordsList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="landlordList"
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
                :displayButtons="displayButtons" @handleSubmit="saveLandlord" @handleReset="handleReset"
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
import PrintJS from 'print-js';

export default{
    name: 'Landlords_List',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'landlord_id';
        const addButtonLabel = ref('New Landlord');
        const addingRight = ref('Adding Landlord');
        const removingRight = ref('Deleting Landlord');
        const rightsModule = ref('PMS');
        const title = ref('Landlord Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const landlordList = ref([]);
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
        const modal_left = ref('400px');
        const modal_width = ref('45vw');
        const isEditing = computed(()=> store.state.Landlords_List.isEditing);
        const selectedLandlord = computed(()=> store.state.Landlords_List.selectedLandlord);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"landlord_code"},
            {label: "Landlord Name", key:"name"},
            {label: "Type", key: "landlord_type"},
            {label: "Email", key:"email"},
            {label: "Phone No", key:"phone_number"},
            {label: "Properties", key:"property_count"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Landlord', rightName: 'Editing Landlord'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Statement'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Landlord', rightName: 'Deleting Landlord'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = computed({
            get: () => store.state.Landlords_List.name_search,
            set: (value) => store.commit('Landlords_List/SET_SEARCH_FILTERS', {"name_search":value}),
        });
        const landlord_code_search = computed({
            get: () => store.state.Landlords_List.landlord_code_search,
            set: (value) => store.commit('Landlords_List/SET_SEARCH_FILTERS', {"landlord_code_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Code...", value: landlord_code_search, width:60,},
            {type:'text', placeholder:"Name...", value: name_search, width:60,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'landlord_code',label: "Code", value: selectedLandlord.value?.landlord_code || '', required: false },
                { type: 'text', name: 'name',label: "Name", value: selectedLandlord.value?.name || '', required: true },
                { type: 'text', name: 'phone_number',label: "Phone Number", value: selectedLandlord.value?.phone_number || '', required: true },
                { type: 'text', name: 'email',label: "Email", value: selectedLandlord.value?.email || '', required: true },
                { type: 'text', name: 'id_number',label: "ID/Reg Number", value: selectedLandlord.value?.id_number || '', required: true },
                { type: 'text', name: 'kra_pin',label: "Tax Pin No", value: selectedLandlord.value?.kra_pin || '', required: true },
                { type: 'text', name: 'address',label: "Address", value: selectedLandlord.value?.address || '', required: true },
                { type: 'dropdown', name: 'landlord_type',label: "Landlord Type", value: selectedLandlord.value?.landlord_type || '', placeholder: "Select Landlord Type", required: true, options: [{ text: 'Individual', value: 'Individual' }, { text: 'Company', value: 'Company' }, { text: 'Organization', value: 'Organization' }] },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }

        watch([selectedLandlord], () => {
            if (selectedLandlord) {
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
        const createLandlord = async() =>{
            showModalLoader();
            let formData = {
                name: formFields.value[1].value,
                landlord_code: formFields.value[0].value,
                email: formFields.value[3].value,
                phone_number: formFields.value[2].value,
                kra_pin: formFields.value[5].value,
                id_number: formFields.value[4].value,
                address: formFields.value[6].value,
                landlord_type: formFields.value[7].value,
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
                    const response = await store.dispatch('Landlords_List/createLandlord', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Landlord created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the landlord.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create landlord: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchLandlords();
                }
            }
        }
        const updateLandlord = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                landlord: selectedLandlord.value.landlord_id,
                name: formFields.value[1].value,
                landlord_code: formFields.value[0].value,
                email: formFields.value[3].value,
                phone_number: formFields.value[2].value,
                kra_pin: formFields.value[5].value,
                id_number: formFields.value[4].value,
                address: formFields.value[6].value,
                landlord_type: formFields.value[7].value,
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
                    const response = await store.dispatch('Landlords_List/updateLandlord', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Landlord updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the landlord.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update landlord: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Landlords_List/updateState",{selectedLandlord:null})
                    searchLandlords();
                }             
            }
        }
        const saveLandlord = () =>{
            if(isEditing.value == true){
                updateLandlord();
            }else{
                createLandlord();
            }
        }
        const importLandlords = () =>{
            store.commit('pageTab/ADD_PAGE', {'PMS':'Import_Landlords'})
            store.state.pageTab.pmsActiveTab = 'Import_Landlords';
        }
        const removeLandlord = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    landlord: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Landlords_List/deleteLandlord',formData)
                    if(response && response.status == 200){
                        toast.success("Landlord Removed Succesfully");
                        searchLandlords();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove landlord: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 landlord") 
            }else{
                toast.error("Please Select A Landlord To Remove")
            }
        }
        const removeLandlords = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    landlord: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Landlords_List/deleteLandlord',formData)
                    if(response && response.status == 200){
                        toast.success("Landlord(s) Removed Succesfully");
                        searchLandlords();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove landlord: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Landlord To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchLandlords = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                name: name_search.value,
                landlord_code: landlord_code_search.value,
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/landlords-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                landlordList.value = response.data.results;
                store.commit('Landlords_List/LIST_LANDLORDS', landlordList.value)
                propResults.value = response.data;
                propArrLen.value = landlordList.value.length;
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
            currentPage.value = 1;
            store.commit('Landlords_List/RESET_SEARCH_FILTERS')
            searchLandlords();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchLandlords();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchLandlords();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchLandlords();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchLandlords();
            // scrollToTop();
        }
        const addNewLandlord = () =>{
            store.dispatch("Landlords_List/updateState",{selectedLandlord:null})
            propModalVisible.value = true;
            handleReset();
            store.dispatch("Landlords_List/updateState",{isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const landlordID = row[idField];
                let formData = {
                    company: companyID.value,
                    landlord: landlordID
                }
                await store.dispatch('Landlords_List/fetchLandlord',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const landlordID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    landlord: landlordID
                }
                await store.dispatch('Landlords_List/deleteLandlord',formData).
                then(()=>{
                    searchLandlords();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printLandlordsList = () =>{
            showLoader();
            let formData = {
                name: name_search.value,
                landlord_code: landlord_code_search.value,
                company_id: companyID.value
            } 

            axios
            .post("api/v1/export-landlords-pdf/", formData, { responseType: 'blob' })
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
            searchLandlords();
            
        })
        return{
            title, searchLandlords,resetFilters, addButtonLabel, searchFilters, tableColumns, landlordList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewLandlord, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveLandlord, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            importLandlords, removeLandlord, removeLandlords,addingRight,removingRight,rightsModule,printLandlordsList
        }
    }
};
</script>