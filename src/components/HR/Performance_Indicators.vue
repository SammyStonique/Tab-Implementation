<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewIndicator"
            :searchFilters="searchFilters"
            @searchPage="searchIndicators"
            @resetFilters="resetFilters"
            @removeItem="removeIndicator"
            @removeSelectedItems="removeIndicators"
            @printList="printindicatorsList"
            @printExcel="downloadDeductionsExcel"
            @printCSV="downloadDeductionsCSV"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="indicatorsList"
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
                :displayButtons="displayButtons" @handleSubmit="saveIndicator" @handleReset="handleReset"
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
    name: 'Performance_Indicators',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const ledComponentKey = ref(0);
        const idField = 'deduction_id';
        const addButtonLabel = ref('New Indicator');
        const addingRight = ref('Adding Performance Indicators');
        const removingRight = ref('Deleting Performance Indicators');
        const rightsModule = ref('HR');
        const title = ref('Performance Indicator Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const indicatorsList = ref([]);
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
        const modal_top = ref('200px');
        const modal_left = ref('500px');
        const modal_width = ref('30vw');
        const categoryID = ref('');
        const isEditing = computed(()=> store.state.Performance_Indicators.isEditing);
        const selectedIndicator = computed(()=> store.state.Performance_Indicators.selectedIndicator);
        const selectedCategory = computed(()=> store.state.Performance_Indicators.selectedCategory);
        const catArray = computed(() => store.state.Appraisal_Categories.categoryArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "KPI Name", key:"indicator_name"},
            {label: "Category", key: "category_name"},
            {label: "Min Weight", key:"min_weight"},
            {label: "Max Weight", key:"max_weight"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Indicator', rightName: 'Editing Performance Indicators'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Indicator', rightName: 'Deleting Performance Indicators'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"KPI Name...", value: name_search, width:56,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedCategory = async(option) =>{
            await store.dispatch('Appraisal_Categories/handleSelectedCategory', option)
            categoryID.value = store.state.Appraisal_Categories.categoryID;
        };
        const clearSelectedCategory = async() =>{
            await store.dispatch('Appraisal_Categories/updateState', {categoryID: ''});
            categoryID.value = store.state.Appraisal_Categories.categoryID;
        }
        const formFields = ref([]);
        const categoryValue = computed(() => {
           return (selectedIndicator.value && selectedIndicator.value.category && !categoryID.value) ? selectedIndicator.value.category.appraisal_category_id : categoryID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Category", value: categoryValue.value, componentKey: ledComponentKey,
                    selectOptions: catArray, optionSelected: handleSelectedCategory, required: true,
                    searchPlaceholder: 'Select Category...', dropdownWidth: '500px', updateValue: selectedCategory.value,
                    fetchData: store.dispatch('Appraisal_Categories/fetchAppraisalCategories', {company:companyID.value}),
                    clearSearch: clearSelectedCategory
                },
                { type: 'text', name: 'indicator_name',label: "KPI Name", value: selectedIndicator.value?.indicator_name || '', required: true },
                { type: 'text', name: 'min_weight',label: "Min Weight", value: selectedIndicator.value?.min_weight || '', required: false },
                { type: 'text', name: 'max_weight',label: "Max Weight", value: selectedIndicator.value?.max_weight || '', required: false },
            ];
        };
        const handleReset = () =>{
            for(let i=1; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            ledComponentKey.value += 1;
            categoryID.value = '';
        }

        watch([selectedIndicator, selectedCategory], () => {
            if (selectedIndicator.value && selectedCategory.value) {
                ledComponentKey.value += 1;
                updateFormFields();
            }
            
        }, { immediate: true });
        
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createPerformanceIndicator = async() =>{
            showModalLoader();
            let formData = {
                indicator_name: formFields.value[1].value,
                min_weight: formFields.value[2].value,
                max_weight: formFields.value[3].value,
                category: categoryID.value,
                category_id: categoryID.value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(categoryValue.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Performance_Indicators/createPerformanceIndicator', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('KPI created successfully!');
                        handleReset();
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the KPI.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create KPI: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchIndicators();
                }
            }
        }
        const updatePerformanceIndicator = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                performance_indicator: selectedIndicator.value.performance_indicator_id,
                indicator_name: formFields.value[1].value,
                min_weight: formFields.value[2].value,
                max_weight: formFields.value[3].value,
                category: categoryValue.value,
                category_id: categoryValue.value,
                company: companyID.value
            }

            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown'  && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(categoryValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Performance_Indicators/updatePerformanceIndicator', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        ledComponentKey.value += 1;
                        toast.success("KPI updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the KPI.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update KPI: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Performance_Indicators/updateState",{selectedIndicator:null})
                    searchIndicators();
                }             
            }
        }
        const saveIndicator = () =>{
            if(isEditing.value == true){
                updatePerformanceIndicator();
            }else{
                createPerformanceIndicator();
            }
        }
        const removeIndicator = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    performance_indicator: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Performance_Indicators/deletePerformanceIndicator',formData)
                    if(response && response.status == 200){
                        toast.success("KPI Removed Succesfully");
                        searchIndicators();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove KPI: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 KPI") 
            }else{
                toast.error("Please Select An KPI To Remove")
            }
        }
        const removeIndicators = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    performance_indicator: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Performance_Indicators/deletePerformanceIndicator',formData)
                    if(response && response.status == 200){
                        toast.success("KPI(s) Removed Succesfully");
                        searchIndicators();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove KPI: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select An KPI To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchIndicators = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                indicator_name: name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/performance-indicators-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                indicatorsList.value = response.data.results;
                store.commit('Performance_Indicators/LIST_INDICATORS', indicatorsList.value)
                propResults.value = response.data;
                propArrLen.value = indicatorsList.value.length;
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
            searchIndicators(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            name_search.value = "";
            searchIndicators();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchIndicators();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchIndicators();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchIndicators();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchIndicators();
            // scrollToTop();
        }
        const addNewIndicator = () =>{
            store.dispatch("Performance_Indicators/updateState",{selectedIndicator:null, selectedCategory:null});
            ledComponentKey.value += 1;
            handleReset();
            updateFormFields();
            propModalVisible.value = true;
            store.dispatch("Performance_Indicators/updateState",{isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const indicatorID = row['performance_indicator_id'];
                let formData = {
                    company: companyID.value,
                    performance_indicator: indicatorID
                }
                await store.dispatch('Performance_Indicators/fetchPerformanceIndicator',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';

            }else if(action == 'delete'){
                const indicatorID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    performance_indicator: indicatorID
                }
                await store.dispatch('Performance_Indicators/deletePerformanceIndicator',formData).
                then(()=>{
                    searchIndicators();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printindicatorsList = () =>{
            showLoader();
            let formData = {
                indicator_name: name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 

            axios
            .post("api/v1/export-performance-indicators-pdf/", formData, { responseType: 'blob' })
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
        const downloadDeductionsExcel = () =>{
            showLoader();
            let formData = {
                indicator_name: name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios.post("api/v1/export-performance-indicators-excel/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'KPIs.xlsx');
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
        const downloadDeductionsCSV = () =>{
            showLoader();
            let formData = {
                indicator_name: name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios.post("api/v1/export-performance-indicators-csv/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'KPIs.csv');
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
            searchIndicators();
            
        })
        return{
            title, searchIndicators,resetFilters, addButtonLabel, searchFilters, tableColumns, indicatorsList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewIndicator, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveIndicator, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeIndicator, removeIndicators,addingRight,removingRight,rightsModule,printindicatorsList,selectSearchQuantity,selectedValue,
            downloadDeductionsCSV,downloadDeductionsExcel
        }
    }
};
</script>