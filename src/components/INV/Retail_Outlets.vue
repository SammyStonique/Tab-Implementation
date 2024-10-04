<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewOutlet"
        :searchFilters="searchFilters"
        @searchPage="searchOutlets"
        @resetFilters="resetFilters"
        @removeItem="removeOutlet"
        @removeSelectedItems="removeOutlets"
        :addingRight="addingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="outletList"
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
            :displayButtons="displayButtons" @handleSubmit="saveOutlet" @handleReset="handleReset"
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
    name: 'Retail_Outlets',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Outlet Details');
        const addButtonLabel = ref('New Outlet');
        const addingRight = ref('Adding Outlet Counter');
        const rightsModule = ref('Inventory');
        const idField = 'warehouse_id';
        const selectedIds = ref([]);
        const depModalVisible = ref(false);
        const outletList = ref([]);
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
        const isEditing = computed(()=> store.state.Retail_Outlets.isEditing);
        const selectedOutlet = computed(()=> store.state.Retail_Outlets.selectedOutlet);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key: "warehouse_name", type: "text", editable: false},
            {label: "Type", key: "area_location", type: "text", editable: false},
            {label: "Location", key: "retail_type", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Outlet', rightName: 'Editing Outlet Counter'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Outlet', rightName: 'Deleting Outlet Counter'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const warehouse_name_search = computed({
            get: () => store.state.Retail_Outlets.warehouse_name_search,
            set: (value) => store.commit('Retail_Outlets/SET_SEARCH_FILTERS', {"warehouse_name_search":value}),
        });
        const area_location_search = computed({
            get: () => store.state.Retail_Outlets.area_location_search,
            set: (value) => store.commit('Retail_Outlets/SET_SEARCH_FILTERS', {"area_location_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Search Name...", value: warehouse_name_search},
            {
                type:'dropdown', placeholder:"Retail Type..", value: area_location_search, width:40,
                options: [{text:'Store',value:'Store'},{text:'Outlet',value:'Outlet'}]
            },
        ]);
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'dropdown', name: 'retail_type',label: "Retail Type", value: selectedOutlet.value?.retail_type || '', placeholder: "", required: true, options: [{ text: 'Store', value: 'Store' }, { text: 'Outlet', value: 'Outlet' }] },
                { type: 'text', name: 'warehouse_name',label: "Name", value: selectedOutlet.value?.warehouse_name || '', required: true },
                { type: 'text', name: 'area_location',label: "Area Location", value: selectedOutlet.value?.area_location || '', required: true },
            ];
        };
        watch([selectedOutlet], () => {
            if(selectedOutlet.value){
                updateFormFields();
            }      
        }, { immediate: true });
        const addNewOutlet = async() =>{
            updateFormFields();
            await store.dispatch("Retail_Outlets/updateState",{isEditing:false, selectedOutlet:null})
    
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
                const outletID = row[idField];
                let formData = {
                    company: companyID.value,
                    warehouse: outletID
                }
                await store.dispatch('Retail_Outlets/fetchOutlet',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const outletID = [row['warehouse_id']];
                let formData = {
                    company: companyID.value,
                    warehouse: outletID
                }
                await store.dispatch('Retail_Outlets/deleteOutlet',formData)
                searchOutlets();
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
        const createOutlet = async() =>{
            showModalLoader();
            let formData = {
                warehouse_name: formFields.value[1].value,
                area_location: formFields.value[2].value,
                retail_type: formFields.value[0].value,
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
                    const response = await store.dispatch('Retail_Outlets/createOutlet', formData);
                    if(response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Outlet created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Outlet.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Outlet: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchOutlets();
                }
            }

        }
        const updateOutlet = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                warehouse: selectedOutlet.value.warehouse_id,
                warehouse_name: formFields.value[1].value,
                area_location: formFields.value[2].value,
                retail_type: formFields.value[0].value,
                company: companyID.value
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
                    const response = await store.dispatch('Retail_Outlets/updateOutlet', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Outlet updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Outlet.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Outlet: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchOutlets();
                }
            }
        }
        const saveOutlet = () =>{
            if(isEditing.value == true){
                updateOutlet();
            }else{
                createOutlet();
            }
        }
        const removeOutlet = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    warehouse: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Retail_Outlets/deleteOutlet',formData)
                    if(response && response.status == 200){
                        toast.success("Outlet Removed Succesfully");
                        searchOutlets();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Outlet: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Outlet") 
            }else{
                toast.error("Please Select An Outlet To Remove")
            }
        }
        const removeOutlets = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    warehouse: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Retail_Outlets/deleteOutlet',formData)
                    if(response && response.status == 200){
                        toast.success("Outlet(s) Removed Succesfully");
                        searchOutlets();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Outlet(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select An Outlet To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchOutlets = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                warehouse_name: warehouse_name_search.value,
                area_location: area_location_search.value,
                company_id: companyID.value
            }
            axios
            .post(`api/v1/warehouse-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                outletList.value = response.data.results;
                store.commit('Retail_Outlets/LIST_OUTLETS', outletList.value)
                depResults.value = response.data;
                depArrLen.value = outletList.value.length;
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
            
            searchOutlets();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchOutlets();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchOutlets();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchOutlets();
        }
        const resetFilters = () =>{
            store.commit('Retail_Outlets/RESET_SEARCH_FILTERS')
            searchOutlets();
        };
        const closeModal = async() =>{
            await store.dispatch("Retail_Outlets/updateState",{isEditing:false, selectedOutlet:null})
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchOutlets();
        })
        return{
            title,idField, searchOutlets, addButtonLabel, searchFilters, resetFilters, tableColumns, outletList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewOutlet,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveOutlet,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeOutlet, removeOutlets,
            addingRight,rightsModule,handleSelectionChange,closeModal
        }
    }
}
</script>