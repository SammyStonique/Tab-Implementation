<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="processPenalty"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchPenaltyBatches"
            @resetFilters="resetFilters"
            @removeItem="removeBatch"
            @removeSelectedItems="removeBatches"
            @printList="printbatchesList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="batchesList"
            :actions="actions"
            :showTotals="showTotals"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            @handleShowDetails="handleShowDetails"
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
            :showDetails="showDetails"
            :detailsTitle="detailsTitle"
            @hideDetails="hideDetails"
        >

        </PageComponent>
        <MovableModal v-model:visible="invModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
        >
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="penaltyProcessing" @handleReset="handleReset"
            />
        </MovableModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue';
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import PrintJS from 'print-js';

export default{
    name: 'Penalty_Batches',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const { getYear } = useDateFormatter();
        const { getMonth } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('none');
        const modal_loader = ref('none');
        const app_modal_loader = ref('none');
        const idField = 'penalty_batch_id';
        const addButtonLabel = ref('Process Penalty');
        const addingRight = ref('Processing Loan Penalties');
        const removingRight = ref('Deleting Loan Penalties');
        const rightsModule = ref('MMS');
        const submitButtonLabel = ref('Add');
        const title = ref('Process Penalty');
        const propComponentKey = ref(0);
        const paySearchComponentKey = ref(0);
        const invModalVisible = ref(false);
        const appModalVisible = ref(false);
        const modal_top = ref('200px');
        const modal_left = ref('500px');
        const modal_width = ref('30vw');
        const selectedIds = ref([]);
        const batchesList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const showDetails = ref(false);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const batchID = ref(null);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "From Date", key:"from_date"},
            {label: "To Date", key:"to_date"},
            {label: "Month", key:"month"},
            {label: "Year", key:"year"},
            {label: "Done By", key:"done_by"},
        ])
        const showTotals = ref(false);
        const actions = ref([
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Batch Details', rightName: 'Processing Loan Penalties'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Batch', rightName: 'Deleting Loan Penalties'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const month_search = ref("");
        const year_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {
                type:'dropdown', placeholder:"Month..", value: month_search, width:32,
                options: [{text:'January',value:'January'},{text:'February',value:'February'},{text:'March',value:'March'},{text:'April',value:'April'},{text:'May',value:'May'},{text:'June',value:'June'},
                        {text:'July',value:'July'},{text:'August',value:'August'},{text:'September',value:'September'},{text:'October',value:'October'},{text:'November',value:'November'},{text:'December',value:'December'}]
            },
            {type:'text', placeholder:"Year...", value: year_search, width:36},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:36, title: "Date To Search"},
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                { type: 'dropdown', name: 'month',label: "Month", value: '', placeholder: "", required: true, options: [{ text: 'January', value: 'January' }, { text: 'February', value: 'February' },{ text: 'March', value: 'March' }, { text: 'April', value: 'April' },{ text: 'May', value: 'May' }, { text: 'June', value: 'June' },{ text: 'July', value: 'July' }, { text: 'August', value: 'August' },{ text: 'September', value: 'September' }, { text: 'October', value: 'October' },{ text: 'November', value: 'November' }, { text: 'December', value: 'December' }] },
                { type: 'text', name: 'period_year',label: "Year", value: "", required: true },
                { type: 'date', name: 'date',label: "From Date", value: "", required: true },
                { type: 'date', name: 'date',label: "To Date", value: "", required: true },
            ]
        };

        const handleReset = async() =>{
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
        const penaltyProcessing = async() =>{
            showModalLoader();
            let formData = {
                from_date: formFields.value[2].value,
                to_date: formFields.value[3].value,
                month: formFields.value[0].value,
                year: formFields.value[1].value,
                done_by: "",
                user: userID.value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=0; i < (formFields.value.length); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Penalty_Batches/createPenaltyBatch', formData);
                    if (response && response.data.msg === "Success") {
                        hideModalLoader();
                        toast.success('Penalty Processed Successfully!');
                        searchPenaltyBatches();
                        handleReset();
                        closeModal();
                    }else if(response && response.data.msg === "Processed"){
                        hideModalLoader();
                        toast.error('Penalty Already Processed!');
                    }else if(response && response.data.msg === "Empty"){
                        hideModalLoader();
                        toast.error('Selected Period Has No Penalizable Schedules!');
                    }

                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to Process Penalty: ' + error.message);
                } finally {
                    hideModalLoader();
                    
                }
            }
        }

        const removeBatch = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    penalty_batch: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Penalty_Batches/deletePenaltyBatch',formData)
                    if(response && response.status == 200){
                        toast.success("Batch Removed Succesfully");
                        searchPenaltyBatches();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Batch: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    searchPenaltyBatches();
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Batch") 
            }else{
                toast.error("Please Select A Batch To Remove")
            }
        }
        const removeBatches = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    penalty_batch: selectedIds.value,
                }

                try{
                    const response = await store.dispatch('Penalty_Batches/deletePenaltyBatch',formData)
                    if(response && response.msg == "Success"){
                        toast.success("Batch(s) Removed Succesfully");
                        searchPenaltyBatches();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Batches: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    searchPenaltyBatches();
                }
            }else{
                toast.error("Please Select A Batch To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchPenaltyBatches = () =>{
            showLoader();
            selectedIds.value = [];
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                month: month_search.value,
                year: year_search.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
   
            axios
            .post(`api/v1/penalty-batches-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                batchesList.value = response.data.results;
                store.commit('Penalty_Batches/LIST_BATCHES', batchesList.value)
                propResults.value = response.data;
                propArrLen.value = batchesList.value.length;
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
            searchPenaltyBatches(selectedValue.value);
        };
        const resetFilters = () =>{
            selectedValue.value = 50;
            month_search.value = "";
            year_search.value = "";
            from_date_search.value= "";
            to_date_search.value = "";
            searchPenaltyBatches();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchPenaltyBatches();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchPenaltyBatches();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchPenaltyBatches();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchPenaltyBatches();
            // scrollToTop();
        }
        const processPenalty = () =>{
            invModalVisible.value = true;
            updateFormFields();
            formFields.value[0].value = getMonth(current_date);
            formFields.value[1].value = getYear(current_date);
            propModalVisible.value = true;
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const batchID = [row['penalty_batch_id']];
                let formData = {
                    company: companyID.value,
                    penalty_batch: batchID,
                }
                await store.dispatch('Penalty_Batches/deletePenaltyBatch',formData).
                then(()=>{
                    searchPenaltyBatches();
                })
            }else if(action == 'view'){
                const batchID = row['penalty_batch_id'];
                await store.dispatch('Penalty_Batches/updateState',{batchID: batchID})
                store.commit('pageTab/ADD_PAGE', {'MMS':'Loan_Penalties'})
                store.state.pageTab.mmsActiveTab = 'Loan_Penalties';
            }
        }

        const closeModal = async() =>{
            invModalVisible.value = false;
            handleReset();
        }

        const dropdownOptions = ref([
            {label: 'Withholding Tax', action: 'withholding-tax'},
        ]);
        const handleDynamicOption = (option) =>{

        };
        const printbatchesList = () =>{
            showLoader();

            let formData = {
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                month: month_search.value,
                year: year_search.value,
                status: status_search.value,
                pay_group: groupSearchID.value,
                company: companyID.value,
            } 
   
            axios
            .post("api/v1/export-payrolls-pdf/", formData, { responseType: 'blob' })
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
            searchPenaltyBatches();
            
        })
        return{
            showTotals,title, searchPenaltyBatches,resetFilters, addButtonLabel, searchFilters, tableColumns, batchesList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,invModalVisible,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, processPenalty, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeBatch, removeBatches, dropdownOptions, handleDynamicOption, penaltyProcessing,addingRight,removingRight,rightsModule,printbatchesList,
            selectSearchQuantity,selectedValue,
        }
    }
};
</script>

<style scoped>
.tabs {
    display: flex;
    border-bottom: 1px solid #ccc;
}
.tab {
    padding: 2px 20px 2px 20px;
    cursor: pointer;
}

.tab.active {
    border-bottom: 2px solid #000;
}

.tab-content {
    padding: 1px;
}</style>