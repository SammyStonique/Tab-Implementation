<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewUom"
        :searchFilters="searchFilters"
        @searchPage="searchUoms"
        @resetFilters="resetFilters"
        @removeItem="removeUom"
        @removeSelectedItems="removeUoms"
        :addingRight="addingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="uomList"
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
            :displayButtons="displayButtons" @handleSubmit="saveUom" @handleReset="handleReset"
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
    name: 'Uom',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('U.o.M Details');
        const addButtonLabel = ref('New U.o.M');
        const addingRight = ref('Adding Item Categories');
        const rightsModule = ref('Inventory');
        const idField = 'uom_id';
        const selectedIds = ref([]);
        const depModalVisible = ref(false);
        const uomList = ref([]);
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
        const isEditing = computed(()=> store.state.Uom.isEditing);
        const selectedUom = computed(()=> store.state.Uom.selectedUom);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key: "uom_name", type: "text", editable: false},
            {label: "Abbr.", key: "abbreviation", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit U.o.M', rightName: 'Editing Item Categories'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete U.o.M', rightName: 'Deleting Item Categories'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const uom_name_search = computed({
            get: () => store.state.Uom.uom_name_search,
            set: (value) => store.commit('Uom/SET_SEARCH_FILTERS', {"uom_name_search":value}),
        });
        const abbreviation_search = computed({
            get: () => store.state.Uom.abbreviation_search,
            set: (value) => store.commit('Uom/SET_SEARCH_FILTERS', {"abbreviation_search":value}),
        });

        const searchFilters = ref([
            {type:'text', placeholder:"Search Name...", value: uom_name_search, width: 56},
            {type:'text', placeholder:"Search Abbreviation...", value: abbreviation_search, width: 56},
        ]);
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'uom_name',label: "Name", value: selectedUom.value?.uom_name || '', required: true },
                { type: 'text', name: 'abbreviation',label: "Abbreviation", value: selectedUom.value?.abbreviation || '', required: true },
            ];
        };
        watch([selectedUom], () => {
            if(selectedUom.value){
                updateFormFields();
            }      
        }, { immediate: true });
        const addNewUom = async() =>{
            updateFormFields();
            await store.dispatch("Uom/updateState",{isEditing:false, selectedUom:null})
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
                const uomID = row[idField];
                let formData = {
                    company: companyID.value,
                    uom: uomID
                }
                await store.dispatch('Uom/fetchUom',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const uomID = [row['uom_id']];
                let formData = {
                    company: companyID.value,
                    uom: uomID
                }
                await store.dispatch('Uom/deleteUom',formData)
                searchUoms();
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
        const createUom = async() =>{
            showModalLoader();
            let formData = {
                uom_name: formFields.value[0].value,
                abbreviation: formFields.value[1].value,    
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
                    const response = await store.dispatch('Uom/createUom', formData);
                    if(response && response.status === 200) {
                        hideModalLoader();
                        toast.success('U.o.M created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the U.o.M.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create U.o.M: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchUoms();
                }
            }

        }
        const updateUom = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                uom_name: formFields.value[0].value,
                abbreviation: formFields.value[1].value, 
                uom: selectedUom.value.uom_id,
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
                    const response = await store.dispatch('Uom/updateUom', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("U.o.M updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the U.o.M.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update U.o.M: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchUoms();
                }
            }
        }
        const saveUom = () =>{
            if(isEditing.value == true){
                updateUom();
            }else{
                createUom();
            }
        }
        const removeUom = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    uom: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Uom/deleteUom',formData)
                    if(response && response.status == 200){
                        toast.success("U.o.M Removed Succesfully");
                        searchUoms();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove U.o.M: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 U.o.M") 
            }else{
                toast.error("Please Select A U.o.M To Remove")
            }
        }
        const removeUoms = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    uom: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Uom/deleteUom',formData)
                    if(response && response.status == 200){
                        toast.success("U.o.M(s) Removed Succesfully");
                        searchUoms();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove U.o.M(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A U.o.M To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchUoms = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                uom_name: uom_name_search.value,
                abbreviation: abbreviation_search.value,
                company_id: companyID.value
            }
            axios
            .post(`api/v1/unit-of-measure-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                uomList.value = response.data.results;
                store.commit('Item_Location/LIST_UOMS', uomList.value)
                depResults.value = response.data;
                depArrLen.value = uomList.value.length;
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
            
            searchUoms();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchUoms();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchUoms();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchUoms();
        }
        const resetFilters = () =>{
            store.commit('Uom/RESET_SEARCH_FILTERS')
            searchUoms();
        };
        const closeModal = async() =>{
            await store.dispatch("Uom/updateState",{isEditing:false, selectedUom:null})
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchUoms();
        })
        return{
            title,idField, searchUoms, addButtonLabel, searchFilters, resetFilters, tableColumns, uomList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewUom,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveUom,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeUom, removeUoms,
            addingRight,rightsModule,handleSelectionChange,closeModal
        }
    }
}
</script>