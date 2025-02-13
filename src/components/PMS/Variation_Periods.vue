<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewPeriod"
            :searchFilters="searchFilters"
            @searchPage="searchPeriods"
            @resetFilters="resetFilters"
            @removeItem="removePeriod"
            @removeSelectedItems="removePeriods"
            @printList="printList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="periodList"
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
                :displayButtons="displayButtons" @handleSubmit="savePeriod" @handleReset="handleReset"
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
    name: 'Variation_Periods',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'frequency_id';
        const addButtonLabel = ref('New Variation Period');
        const title = ref('Variation Details');
        const addingRight = ref('Adding Lease Periods');
        const rightsModule = ref('PMS');
        const submitButtonLabel = ref('Add');
        const ledComponentKey = ref(0);
        const selectedIds = ref([]);
        const periodList = ref([]);
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
        const modal_width = ref('30vw');
        const isEditing = computed(()=> store.state.Variation_Periods.isEditing);
        const selectedPeriod = computed(()=> store.state.Variation_Periods.selectedPeriod);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"name"},
            {label: "Months", key: "value"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Period', rightName: 'Editing Lease Periods'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Period', rightName: 'Deleting Lease Periods'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = computed({
            get: () => store.state.Variation_Periods.name_search,
            set: (value) => store.commit('Variation_Periods/SET_SEARCH_FILTERS', {"name_search":value}),
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
                { type: 'text', name: 'name',label: "Name", value: selectedPeriod.value?.name || '', required: true },
                { type: 'number', name: 'value',label: "Months", value: selectedPeriod.value?.value || 0, required: true },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }

        watch([selectedPeriod], () => {
            if (selectedPeriod.value) {
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
        const createPeriod = async() =>{
            showModalLoader();
            let formData = {
                name: formFields.value[0].value,
                value: formFields.value[1].value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=0; i < (formFields.value.length - 1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Variation_Periods/createPeriod', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Period created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the period.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create period: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchPeriods();
                }
            }
        }
        const updatePeriod= async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                frequency: selectedPeriod.value.frequency_id,
                name: formFields.value[0].value,
                value: formFields.value[1].value,
                company: companyID.value
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
                    const response = await store.dispatch('Variation_Periods/updatePeriod', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Period updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the period.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update period: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Variation_Periods/updateState",{selectedPeriod:null})
                    searchPeriods();
                }             
            }
        }
        const savePeriod = () =>{
            if(isEditing.value == true){
                updatePeriod();
            }else{
                createPeriod();
            }
        }
        const removePeriod = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    frequency: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Variation_Periods/deletePeriod',formData)
                    if(response && response.status == 200){
                        toast.success("Period Removed Succesfully");
                        searchPeriods();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove period: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 period") 
            }else{
                toast.error("Please Select A Period To Remove")
            }
        }
        const removePeriods = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    frequency: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Variation_Periods/deletePeriod',formData)
                    if(response && response.status == 200){
                        toast.success("Period(s) Removed Succesfully");
                        searchPeriods();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove periods: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Periods To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchPeriods = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                name: name_search.value,
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/escalation-frequencies-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                periodList.value = response.data.results;
                store.commit('Variation_Periods/LIST_PERIODS', periodList.value)
                propResults.value = response.data;
                propArrLen.value = periodList.value.length;
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
            store.commit('Variation_Periods/RESET_SEARCH_FILTERS')
            searchPeriods();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchPeriods();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchPeriods();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchPeriods();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchPeriods();
            // scrollToTop();
        }
        const addNewPeriod = () =>{
            store.dispatch("Variation_Periods/updateState",{selectedPeriod:null,isEditing:false})
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const frequencyID = row[idField];
                let formData = {
                    company: companyID.value,
                    frequency: frequencyID
                }
                await store.dispatch('Variation_Periods/fetchPeriod',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';

            }else if(action == 'delete'){
                const frequencyID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    frequency: frequencyID
                }
                await store.dispatch('Variation_Periods/deletePeriod',formData).
                then(()=>{
                    searchPeriods();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchPeriods();
            
        })
        return{
            title, searchPeriods,resetFilters, addButtonLabel, searchFilters, tableColumns, periodList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,addingRight,rightsModule,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewPeriod, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, savePeriod, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removePeriod, removePeriods
        }
    }
};
</script>