<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="runPenalty"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchPenalties"
            @resetFilters="resetFilters"
            @removeItem="removePenalty"
            @removeSelectedItems="removePenalties"
            @printList="printPenaltiesList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="penaltyList"
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
                :displayButtons="displayButtons" @handleSubmit="processPenalty" @handleReset="handleReset"
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
import Swal from 'sweetalert2';

export default{
    name: 'Loan_Penalties',
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
        const idField = 'loan_penalty_id';
        const addButtonLabel = ref('Process Penalty');
        const addingRight = ref('Processing Loan Penalties');
        const rightsModule = ref('MMS');
        const submitButtonLabel = ref('Add');
        const title = ref('Penalty Processing');
        const propComponentKey = ref(0);
        const invModalVisible = ref(false);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const selectedIds = ref([]);
        const penaltyList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "From Date", key:"from_date"},
            {label: "To Date", key:"to_date"},
            {label: "Loan Product", key:"loan_product"},
            {label: "Loan#", key:"loan_number"},
            {label: "Inst#", key:"installment"},
            {label: "Due Date", key:"due_date"},
            {label: "Member No", key:"member_number"},
            {label: "Member Name", key:"member_name"},
            {label: "Amount", key:"amount", type:"number"},
            
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'delete', icon: 'fas fa-trash', title: 'Delete Penalty', rightName: 'Deleting Loan Penalties'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const member_number_search = ref("");
        const member_name_search = ref("");
        const loan_number_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Loan No...", value: loan_number_search, width:40},
            {type:'text', placeholder:"Member No...", value: member_name_search, width:40},
            {type:'text', placeholder:"Member Name...", value: member_number_search, width:64},
            {type:'date', placeholder:"From Date...", value: from_date_search, width:32, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date_search, width:32, title: "Date To Search"},

        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [

                { type: 'date', name: 'period_year',label: "Date From", value: "", required: true },
                { type: 'date', name: 'period_year',label: "Date To", value: "", required: true },
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
        const processPenalty = async() =>{
            showModalLoader();
            let formData = {
                date_from: formFields.value[0].value,
                date_to: formFields.value[1].value,
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
                    axios.post(`api/v1/process-loan-penalty/`,formData).
                    then((response)=>{
                        if (response.data.msg === "Success"){
                            hideModalLoader();
                            toast.success('Penalty(s) Posted Successfully!');
                            handleReset();
                            searchPenalties();
                        }else if(response.data.msg === "Processed"){
                            hideModalLoader();
                            toast.error('Penalty(s) Already Processed!');
                            handleReset();
                        } else {
                            toast.error('An error occurred while booking the Penalty(s).');
                        }
                    })
                    
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to book Penalty(s): ' + error.message);
                } finally {
                    hideModalLoader();
                    
                }
            }
        }

        const removePenalty = async() =>{

        }
        const removePenalties = async() =>{

        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchPenalties = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                loan_number: loan_number_search.value,
                member_number: member_number_search.value,
                member_name: member_name_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
   
            axios
            .post(`api/v1/loan-penalties-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                penaltyList.value = response.data.results;
                store.commit('Loan_Penalties/LIST_Loan_PENALTIES', penaltyList.value)
                propResults.value = response.data;
                propArrLen.value = penaltyList.value.length;
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
            searchPenalties(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            loan_number_search.value = "";
            member_number_search.value = "";
            member_name_search.value = "";
            from_date_search.value= "";
            to_date_search.value = "";
            searchPenalties();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchPenalties();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchPenalties();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchPenalties();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchPenalties();
            // scrollToTop();
        }
        const runPenalty = () =>{
            invModalVisible.value = true;
            updateFormFields();
            propModalVisible.value = true;
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{

        }

        const closeModal = async() =>{
            invModalVisible.value = false;
            handleReset();
        }

        const dropdownOptions = ref([

        ]);
        const handleDynamicOption = async(option) =>{

        };
        const printPenaltiesList = () =>{
            showLoader();

            let formData = {
                journal_no: "",
                client_category: "Tenants",
                txn_type: "INV",
                client: member_number_search.value,
                date_from: from_date_search.value,
                date_to: to_date_search.value,
                status: "",
                company_id: companyID.value
            } 
   
            axios
            .post("api/v1/export-armotization-schedules-pdf/", formData, { responseType: 'blob' })
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
            searchPenalties();
            
        })
        return{
            showTotals,title, searchPenalties,resetFilters, addButtonLabel, searchFilters, tableColumns, penaltyList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,invModalVisible,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, runPenalty, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removePenalty, removePenalties, dropdownOptions, handleDynamicOption, processPenalty,addingRight,rightsModule,printPenaltiesList,
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