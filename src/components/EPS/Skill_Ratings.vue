<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        :showAddButton="showAddButton"
        :searchFilters="searchFilters"
        @searchPage="searchSkillRatings"
        @resetFilters="resetFilters"
        @removeItem="removeAllocation"
        @removeSelectedItems="removeAllocations"
        @printList="printRatingsList"
        :columns="tableColumns"
        :rows="ratingsList"
        :actions="actions"
        :showActions="showActions"
        :rightsModule="rightsModule"
        :idField="idField"
        :showTotals="showTotals"
        @handleSelectionChange="handleSelectionChange"
        @handleActionClick="handleActionClick"
        :count="appCount"
        :currentPage="currentPage"
        :result="appArrLen"
        @loadPrev="loadPrev"
        @loadNext="loadNext"
        @firstPage="firstPage"
        @lastPage="lastPage"
        :showNextBtn="showNextBtn"
        :showPreviousBtn="showPreviousBtn"
        :selectedValue="selectedValue"
        @selectSearchQuantity="selectSearchQuantity"
    />
    <MovableModal v-model:visible="appModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
    >
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="allocatePrepayment" @handleReset="handleReset"
        />
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted,watch } from 'vue';
import { useStore } from "vuex";
import PageComponent from "../PageComponent.vue";
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';

export default{
    name: 'Skill_Ratings',
    props: ['scrollToTop','loader','showLoader','hideLoader',],
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const pageComponentKey = ref(0);
        const propComponentKey = ref(0);
        const showAddButton = ref(false);
        const title = ref('');
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const idField = 'skill_rating_id';
        const rightsModule = ref('HR');
        const periodID = ref('');
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const ratingsList = ref([]);
        const appResults = ref([]);
        const appArrLen = ref(0);
        const appCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('35vw');
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"appraisal_date",type: "text", editable: false},
            {label: "Staff No", key:"staff_number",type: "text", editable: false},
            {label: "Employee Name", key:"employee_name",type: "text", editable: false},
            {label: "Category", key:"category_name",type: "text", editable: false},
            {label: "Period", key:"period_name",type: "text", editable: false},
            {label: "KPI", key:"indicator_name",type: "text", editable: false},
            {label: "Emp.", key:"employee_rating",type: "number", editable: false},
            {label: "Sup.", key:"supervisor_rating",type: "number", editable: false},
            {label: "Avg", key: "average_rating", type: "number", editable: false},
            {label: "Comments/Remarks", key: "comments", type: "text", editable: false},
        ])
        const showTotals = ref(true);
        const showActions = ref(false);
        const actions = ref([
            
        ])
        const employee_name_search = ref("");
        const staff_number_search = ref("");
        const date_from_search = ref("");
        const date_to_search = ref("");
        const period_array = computed({
            get: () => store.state.Appraisal_Periods.periodArr,
        });
        const handleSelectedPeriod = async(option) =>{
            await store.dispatch('Appraisal_Periods/handleSelectedPeriod', option)
            periodID.value = store.state.Appraisal_Periods.periodID;
        };
        const clearSelectedPeriod = async() =>{
            await store.dispatch('Appraisal_Periods/updateState', {periodID: ''});
            periodID.value = store.state.Appraisal_Periods.periodID;
        };
        const searchFilters = ref([
            {
                type:'search-dropdown', value: periodID.value, width:48, componentKey: propComponentKey,
                selectOptions: period_array, optionSelected: handleSelectedPeriod,
                searchPlaceholder: 'Period...', dropdownWidth: '250px',
                fetchData: store.dispatch('Appraisal_Periods/fetchAppraisalPeriods', {company:companyID.value}),
                clearSearch: clearSelectedPeriod
            },
            {type:'date', placeholder:"From Date...", value: date_from_search, width:36, title: "From Date Search"},
            {type:'date', placeholder:"To Date...", value: date_to_search, width:36, title: "To Date Search"},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        const handleActionClick = async(rowIndex, action, row) =>{

        } 

        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchSkillRatings = () =>{
            showLoader();
            let formData = {
                staff_number: staff_number_search.value,
                employee_name: employee_name_search.value,
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                period: periodID.value,
                user: userID.value,
                company: companyID.value,
                page_size: selectedValue.value
            }
 
            axios
            .post(`api/v1/skill-ratings-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                ratingsList.value = response.data.results;
                appResults.value = response.data;
                appArrLen.value = ratingsList.value.length;
                appCount.value = appResults.value.count;
                pageCount.value = Math.ceil(appCount.value / selectedValue.value);
                
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
        };
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchSkillRatings(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchSkillRatings();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchSkillRatings();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchSkillRatings();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchSkillRatings();
        }
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            propComponentKey.value += 1;
            periodID.value = ""
            staff_number_search.value = "";
            employee_name_search.value = "";
            date_from_search.value = "";
            date_to_search.value = "";
            searchSkillRatings();
        };
        const printRatingsList = () =>{
            showLoader();
            let formData = {
                client_code: tenant_code_search.value,
                client_name: tenant_name_search.value,
                date: date_search.value,
                company: companyID.value
            } 

            axios
            .post("api/v1/export-tenant-arrears-pdf/", formData, { responseType: 'blob' })
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

        onMounted(() =>{
            // searchSkillRatings();
        })
        return{
            showAddButton,title, searchSkillRatings, idField, selectedIds, actions, ratingsList, appArrLen,appCount,appResults,appModalVisible,
            currentPage,searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,
            showNextBtn,showPreviousBtn, handleActionClick,displayButtons,showActions,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,rightsModule,
            handleSelectionChange, pageComponentKey, flex_basis, flex_basis_percentage,showTotals,printRatingsList,selectSearchQuantity,selectedValue
        }
    }
}
</script>
