<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewFiscalPeriod"
            :searchFilters="searchFilters"
            @searchPage="searchFiscalPeriods"
            @resetFilters="resetFilters"
            @removeItem="removeFiscalPeriod"
            @removeSelectedItems="removeFiscalPeriods"
            @printList="printList"
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
                :displayButtons="displayButtons" @handleSubmit="createFiscalPeriod" @handleReset="handleReset"
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
    name: 'Fiscal_Periods',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const period_end_date = ref('');
        const idField = 'fiscal_period_id';
        const addButtonLabel = ref('New Fiscal Period');
        const title = ref('Fiscal Period Details');
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
        const isEditing = computed(()=> store.state.Fiscal_Periods.isEditing);
        const selectedPeriod = computed(()=> store.state.Fiscal_Periods.selectedPeriod);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Year", key:"fiscal_year"},
            {label: "Period", key:"period_name"},
            {label: "Start Date", key: "start_date"},
            {label: "End Date", key: "end_date"},
            {label: "Status", key: "status"},
        ])
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Period'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);

        const searchFilters = ref([
            
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
                { type: 'text', name: 'fiscal_year',label: "Fiscal Year", value: selectedPeriod.value?.fiscal_year || '', required: true },
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
        const createFiscalPeriod = async() =>{
            showModalLoader();
            let formData = {
                period_name: formFields.value[0].value,
                fiscal_year: formFields.value[0].value,
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
                    const response = await store.dispatch('Fiscal_Periods/createFiscalPeriod', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Fiscal Period created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the Fiscal Period.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Fiscal Period: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchFiscalPeriods();
                }
            }
        }


        const removeFiscalPeriod = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    fiscal_period: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Fiscal_Periods/deleteFiscalPeriod',formData)
                    if(response && response.status == 200){
                        toast.success("Fiscal Period Removed Succesfully");
                        searchFiscalPeriods();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Fiscal Period: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Fiscal Period") 
            }else{
                toast.error("Please Select A Fiscal Period To Remove")
            }
        }
        const removeFiscalPeriods = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    fiscal_period: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Fiscal_Periods/deleteFiscalPeriod',formData)
                    if(response && response.status == 200){
                        toast.success("Fiscal Period(s) Removed Succesfully");
                        searchFiscalPeriods();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Fiscal Period(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Fiscal Period To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchFiscalPeriods = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                name: "",
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/fiscal-periods-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                periodList.value = response.data.results;
                store.commit('Fiscal_Periods/LIST_PERIODS', periodList.value)
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
            store.commit('Fiscal_Periods/RESET_SEARCH_FILTERS')
            searchFiscalPeriods();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchFiscalPeriods();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchFiscalPeriods();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchFiscalPeriods();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchFiscalPeriods();
            // scrollToTop();
        }
        const addNewFiscalPeriod = () =>{
            updateFormFields();
            store.dispatch("Fiscal_Periods/updateState",{selectedPeriod:null, isEditing:false})
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const periodID = row[idField];
                let formData = {
                    company: companyID.value,
                    fiscal_period: periodID
                }
                await store.dispatch('Fiscal_Periods/deleteFiscalPeriod',formData)
                searchFiscalPeriods();
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchFiscalPeriods();
            
        })
        return{
            title, searchFiscalPeriods,resetFilters, addButtonLabel, searchFilters, tableColumns, periodList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewFiscalPeriod, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, createFiscalPeriod, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeFiscalPeriod, removeFiscalPeriods
        }
    }
};
</script>