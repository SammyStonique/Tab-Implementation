<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewPeriod"
            :searchFilters="searchFilters"
            @searchPage="searchAppraisalPeriods"
            @resetFilters="resetFilters"
            @removeItem="removeAppraisalPeriod"
            @removeSelectedItems="removeAppraisalPeriods"
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
                :displayButtons="displayButtons" @handleSubmit="createAppraisalPeriod" @handleReset="handleReset"
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
    name: 'Appraisal_Periods',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const period_end_date = ref('');
        const idField = 'appraisal_period_id';
        const addButtonLabel = ref('New Appraisal Period');
        const addingRight = ref('Adding Appraisal Periods');
        const rightsModule = ref('HR');
        const title = ref('Appraisal Period Details');
        const submitButtonLabel = ref('Add');
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
        const isEditing = computed(()=> store.state.Appraisal_Periods.isEditing);
        const selectedPeriod = computed(()=> store.state.Appraisal_Periods.selectedPeriod);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Period", key:"period_name"},
            {label: "Start Date", key: "start_date"},
            {label: "End Date", key: "end_date"},
            {label: "Status", key: "status"},
        ])
        const actions = ref([
            {name: 'close', icon: 'fa fa-sign-out', title: 'Close Period', rightName: 'Closing Appraisal Period'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Period', rightName: 'Deleting Appraisal Periods'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = ref("");
        const start_date_search = ref("");
        const end_date_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Search Name...", value: name_search},
            {type:'date', placeholder:"Start Date..", value: start_date_search},
            {type:'date', placeholder:"End Date...", value: end_date_search},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const calculateEndDate = (value) =>{
            if (value) {
                const startDate = new Date(value);
                // Assuming the fiscal year ends exactly one year after the start date minus one day
                const endDate = new Date(startDate);
                endDate.setFullYear(startDate.getFullYear() + 1);
                endDate.setDate(endDate.getDate() - 1);
                period_end_date.value = endDate.toISOString().split('T')[0]; // Format to 'YYYY-MM-DD'
            }
        };

        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'period_name',label: "Period Name", value: selectedPeriod.value?.period_name || '', required: true },
                { type: 'date', name: 'start_date',label: "Start Date", value: selectedPeriod.value?.start_date || '', required: true, method: calculateEndDate },
                { type: 'date', name: 'end_date',label: "End Date", value: selectedPeriod.value?.end_date || period_end_date.value, required: true },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }

        watch([selectedPeriod, period_end_date], () => {
            if (selectedPeriod.value) {
                updateFormFields();
            }
            if(period_end_date.value){
                formFields.value[2].value = period_end_date.value
            }
            
        }, { immediate: true });
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createAppraisalPeriod = async() =>{
            showModalLoader();
            let formData = {
                period_name: formFields.value[0].value,
                start_date: formFields.value[1].value,
                end_date: formFields.value[2].value,
                status: "Open",
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
                    const response = await store.dispatch('Appraisal_Periods/createAppraisalPeriod', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Appraisal Period created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the Appraisal Period.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Appraisal Period: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchAppraisalPeriods();
                }
            }
        }


        const removeAppraisalPeriod = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    appraisal_period: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Appraisal_Periods/deleteAppraisalPeriod',formData)
                    if(response && response.status == 200){
                        toast.success("Appraisal Period Removed Succesfully");
                        searchAppraisalPeriods();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Appraisal Period: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Appraisal Period") 
            }else{
                toast.error("Please Select An Appraisal Period To Remove")
            }
        }
        const removeAppraisalPeriods = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    appraisal_period: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Appraisal_Periods/deleteAppraisalPeriod',formData)
                    if(response && response.status == 200){
                        toast.success("Appraisal Period(s) Removed Succesfully");
                        searchAppraisalPeriods();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Appraisal Period(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select An Appraisal Period To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchAppraisalPeriods = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                period_name: name_search.value,
                start_date: start_date_search.value,
                end_date: end_date_search.value,
                page_size: "50",
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/appraisal-periods-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                periodList.value = response.data.results;
                store.commit('Appraisal_Periods/LIST_PERIODS', periodList.value)
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
            name_search.value = "";
            start_date_search.value = "";
            end_date_search.value = "";
            searchAppraisalPeriods();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchAppraisalPeriods();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchAppraisalPeriods();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchAppraisalPeriods();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchAppraisalPeriods();
            // scrollToTop();
        }
        const addNewPeriod = () =>{
            updateFormFields();
            store.dispatch("Appraisal_Periods/updateState",{selectedPeriod:null, isEditing:false})
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const periodID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    appraisal_period: periodID
                }
                await store.dispatch('Appraisal_Periods/deleteAppraisalPeriod',formData)
                searchAppraisalPeriods();
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchAppraisalPeriods();
            
        })
        return{
            title, searchAppraisalPeriods,resetFilters, addButtonLabel, searchFilters, tableColumns, periodList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewPeriod, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, createAppraisalPeriod, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeAppraisalPeriod, removeAppraisalPeriods,addingRight,rightsModule
        }
    }
};
</script>