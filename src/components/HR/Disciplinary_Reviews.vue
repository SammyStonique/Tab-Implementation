<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewReview"
            :searchFilters="searchFilters"
            @searchPage="searchReviews"
            @resetFilters="resetFilters"
            @removeItem="removeReview"
            @removeSelectedItems="removeReviews"
            @printList="printCasesList"
            @printExcel="downloadCasesExcel"
            @printCSV="downloadCasesCSV"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="reviewsList"
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
            :selectedValue="selectedValue"
            @selectSearchQuantity="selectSearchQuantity"
        />
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="saveReview" @handleReset="handleReset"
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
    name: 'Disciplinary_Reviews',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const emplComponentKey = ref(0);
        const levComponentKey = ref(0);
        const idField = 'disciplinary_review_id';
        const addButtonLabel = ref('New Disciplinary Review');
        const addingRight = ref('Adding Disciplinary Reviews');
        const rightsModule = ref('HR');
        const title = ref('Disciplinary Review Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const reviewsList = ref([]);
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
        const modal_top = ref('150px');
        const modal_left = ref('500px');
        const modal_width = ref('30vw');
        const caseID = ref('');
        const isEditing = computed(()=> store.state.Disciplinary_Reviews.isEditing);
        const selectedReview = computed(()=> store.state.Disciplinary_Reviews.selectedReview);
        const selectedCase = computed(()=> store.state.Disciplinary_Reviews.selectedCase);
        const casesArray = computed(() => store.state.Disciplinary_Cases.caseArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "review_date"},
            {label: "Case#", key: "case_number"},
            {label: "Staff No", key: "staff_number"},
            {label: "Employee Name", key: "employee_name"},
            {label: "Outcome", key:"outcome", maxWidth: "500px"},
            {label: "Notes", key:"review_notes", maxWidth: "500px"},
            
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Review', rightName: 'Editing Disciplinary Reviews'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Review', rightName: 'Deleting Disciplinary Reviews'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const employee_name_search = ref('');
        const staff_number_search = ref('');
        const date_from_search = ref('');
        const date_to_search = ref('');
        const case_number_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Case No...", value: case_number_search, width:32,},
            {type:'text', placeholder:"Staff No...", value: staff_number_search, width:32,},
            {type:'text', placeholder:"Employee Name...", value: employee_name_search, width:64,},
            {type:'date',value: date_from_search, width:32, title: "Date From"},
            {type:'date',value: date_to_search, width:32, title: "Date To"},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedCase = async(option) =>{
            await store.dispatch('Disciplinary_Cases/handleselectedDisciplinaryCase', option)
            caseID.value = store.state.Disciplinary_Cases.caseID;
        };
        const clearSelectedCase = async() =>{
            await store.dispatch('Disciplinary_Cases/updateState', {caseID: ''});
            caseID.value = store.state.Disciplinary_Cases.caseID;
        };
        const formFields = ref([]);

        const caseValue = computed(() => {
           return (selectedReview.value && selectedReview.value.disciplinary_case && !caseID.value) ? selectedReview.value.disciplinary_case.disciplinary_case_id : caseID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Disciplinary Case", value: caseValue.value, componentKey: levComponentKey,
                    selectOptions: casesArray, optionSelected: handleSelectedCase, required: true,
                    searchPlaceholder: 'Select Case...', dropdownWidth: '500px', updateValue: selectedCase.value,
                    fetchData: store.dispatch('Disciplinary_Cases/fetchDisciplinaryCases', {company:companyID.value}),
                    clearSearch: clearSelectedCase
                },
                { type: 'date', name: 'review_date',label: "Date", value: selectedReview.value?.review_date || '', required: true },
                { type: 'dropdown', name: 'outcome',label: "Outcome", value: selectedReview.value?.outcome || '', placeholder: "", required: true, options: [{ text: 'Pending', value: 'Pending' }, { text: 'Guilty', value: 'Guilty' }, { text: 'Not Guilty', value: 'Not Guilty' }] },
                {type:'text-area', label:"Review Notes", value: selectedReview.value?.review_notes || '', textarea_rows: '4', textarea_cols: '56', required: true},

            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            levComponentKey.value += 1;
            caseID.value = '';
        }


        watch([selectedReview, selectedCase], () => {
            if (selectedReview.value && selectedCase.value) {
                levComponentKey.value += 1;
                updateFormFields();
            }
            
        }, { immediate: true });
        
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createDisciplinaryReview = async() =>{
            showModalLoader();
            let formData = {
                review_date: formFields.value[1].value,
                disciplinary_case: caseID.value,
                disciplinary_case_id: caseID.value,
                outcome: formFields.value[2].value,
                review_notes: formFields.value[3].value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(caseValue.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Disciplinary_Reviews/createDisciplinaryReview', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Disciplinary Review created successfully!');
                        handleReset();
                        emplComponentKey.value += 1;
                        levComponentKey.value += 1;
                    }
                    else {
                        toast.error('An error occurred while creating the Disciplinary Review.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Disciplinary Review: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchReviews();
                }
            }
        }
        const updateDisciplinaryReview = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                disciplinary_review: selectedReview.value.disciplinary_review_id,
                review_date: formFields.value[1].value,
                disciplinary_case: caseValue.value,
                disciplinary_case_id: caseValue.value,
                outcome: formFields.value[2].value,
                review_notes: formFields.value[3].value,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown'  && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(caseValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Disciplinary_Reviews/updateDisciplinaryReview', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        emplComponentKey.value += 1;
                        toast.success("Disciplinary Review updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Disciplinary Review.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Disciplinary Review: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Disciplinary_Reviews/updateState",{selectedReview:null})
                    searchReviews();
                }             
            }
        }
        const saveReview = () =>{
            if(isEditing.value == true){
                updateDisciplinaryReview();
            }else{
                createDisciplinaryReview();
            }
        }
        const removeReview = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    disciplinary_review: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Disciplinary_Reviews/deleteDisciplinaryReview',formData)
                    if(response && response.status == 200){
                        toast.success("Disciplinary Review Removed Succesfully");
                        searchReviews();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Disciplinary Review: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Disciplinary Review") 
            }else{
                toast.error("Please Select A Disciplinary Review To Remove")
            }
        }
        const removeReviews = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    disciplinary_review: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Disciplinary_Reviews/deleteDisciplinaryReview',formData)
                    if(response && response.status == 200){
                        toast.success("Disciplinary Review(s) Removed Succesfully");
                        searchReviews();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Disciplinary Review: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Disciplinary Review To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchReviews = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                date_from: date_from_search.value,
                date_to: date_to_search.value,
                case_number: case_number_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/disciplinary-reviews-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                reviewsList.value = response.data.results;
                store.commit('Disciplinary_Reviews/LIST_REVIEWS', reviewsList.value)
                propResults.value = response.data;
                propArrLen.value = reviewsList.value.length;
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
            searchReviews(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            staff_number_search.value = "";
            employee_name_search.value = "";
            date_from_search.value = "";
            date_to_search.value = "";
            case_number_search.value = "";
            searchReviews();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchReviews();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchReviews();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchReviews();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchReviews();
            // scrollToTop();
        }
        const addNewReview = () =>{
            store.dispatch("Disciplinary_Reviews/updateState",{selectedReview:null,selectedCase:null});
            emplComponentKey.value += 1;
            levComponentKey.value += 1;
            handleReset();
            updateFormFields();
            propModalVisible.value = true;
            store.dispatch("Disciplinary_Reviews/updateState",{isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const advanceID = row['disciplinary_review_id'];
                let formData = {
                    company: companyID.value,
                    disciplinary_review: advanceID
                }
                await store.dispatch('Disciplinary_Reviews/fetchDisciplinaryReview',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const advanceID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    disciplinary_review: advanceID
                }
                await store.dispatch('Disciplinary_Reviews/deleteDisciplinaryReview',formData).
                then(()=>{
                    searchReviews();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printCasesList = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                company_id: companyID.value,
            } 

            axios
            .post("api/v1/export-disciplinary-meetings-pdf/", formData, { responseType: 'blob' })
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
        };
        const downloadCasesExcel = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                status: status_search.value,
                company_id: companyID.value,
            }
            axios.post("api/v1/export-disciplinary-meetings-excel/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Disciplinary Meetings.xlsx');
                document.body.appendChild(link);
                link.click();
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        const downloadCasesCSV = () =>{
            showLoader();
            let formData = {
                employee_name: employee_name_search.value,
                staff_number: staff_number_search.value,
                company_id: companyID.value,
            }
            axios.post("api/v1/export-disciplinary-meetings-csv/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Disciplinary Meetings.csv');
                document.body.appendChild(link);
                link.click();
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        onBeforeMount(()=>{
            searchReviews();
            
        })
        return{
            title, searchReviews,resetFilters, addButtonLabel, searchFilters, tableColumns, reviewsList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewReview, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveReview, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeReview, removeReviews,addingRight,rightsModule,printCasesList,selectSearchQuantity,selectedValue,
            downloadCasesCSV,downloadCasesExcel
        }
    }
};
</script>