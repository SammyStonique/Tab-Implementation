<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewHoliday"
            :searchFilters="searchFilters"
            @searchPage="searchHolidays"
            @resetFilters="resetFilters"
            @removeItem="removeHoliday"
            @removeSelectedItems="removeHolidays"
            @printList="printList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="holidaysList"
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
                :displayButtons="displayButtons" @handleSubmit="saveHoliday" @handleReset="handleReset"
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
    name: 'Holidays',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'holiday_id';
        const addButtonLabel = ref('New Holiday');
        const title = ref('Holiday Details');
        const addingRight = ref('Adding Holidays');
        const removingRight = ref('Deleting Holidays');
        const rightsModule = ref('HR');
        const submitButtonLabel = ref('Add');
        const ledComponentKey = ref(0);
        const selectedIds = ref([]);
        const selectedValue = ref(50);
        const holidaysList = ref([]);
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
        const modal_top = ref('300px');
        const modal_left = ref('500px');
        const modal_width = ref('30vw');
        const isEditing = computed(()=> store.state.Holidays.isEditing);
        const selectedHoliday = computed(()=> store.state.Holidays.selectedHoliday);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"holiday_name"},
            {label: "Day", key: "day"},
            {label: "Month", key: "month"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Holiday', rightName: 'Editing Holidays'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Holiday', rightName: 'Deleting Holidays'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = computed({
            get: () => store.state.Holidays.name_search,
            set: (value) => store.commit('Holidays/SET_SEARCH_FILTERS', {"name_search":value}),
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
                { type: 'text', name: 'holiday_name',label: "Name", value: selectedHoliday.value?.holiday_name || '', required: true },
                { type: 'text', name: 'day',label: "Day", value: selectedHoliday.value?.day || '', required: true },
                { type: 'dropdown', name: 'month',label: "Month", value: selectedHoliday.value?.month || '', placeholder: "", required: true, options: [{ text: 'January', value: 'January' }, { text: 'February', value: 'February' },{ text: 'March', value: 'March' }, { text: 'April', value: 'April' },{ text: 'May', value: 'May' }, { text: 'June', value: 'June' },{ text: 'July', value: 'July' }, { text: 'August', value: 'August' }, { text: 'September', value: 'September' },{ text: 'October', value: 'October' }, { text: 'November', value: 'November' },{ text: 'December', value: 'December' }] },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }

        watch([selectedHoliday], () => {
            if (selectedHoliday.value) {
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
        const createHoliday = async() =>{
            showModalLoader();
            let formData = {
                holiday_name: formFields.value[0].value,
                day: formFields.value[1].value,
                month: formFields.value[2].value,
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
                    const response = await store.dispatch('Holidays/createHoliday', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Holiday created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the Holiday.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Holiday: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchHolidays();
                }
            }
        }
        const updateHoliday= async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                holiday: selectedHoliday.value.holiday_id,
                holiday_name: formFields.value[0].value,
                day: formFields.value[1].value,
                month: formFields.value[2].value,
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
                    const response = await store.dispatch('Holidays/updateHoliday', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Holiday updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Holiday.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Holiday: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Holidays/updateState",{selectedHoliday:null})
                    searchHolidays();
                }             
            }
        }
        const saveHoliday = () =>{
            if(isEditing.value == true){
                updateHoliday();
            }else{
                createHoliday();
            }
        }
        const removeHoliday = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    holiday: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Holidays/deleteHoliday',formData)
                    if(response && response.status == 200){
                        toast.success("Holiday Removed Succesfully");
                        searchHolidays();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Holiday: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Holiday") 
            }else{
                toast.error("Please Select A Holiday To Remove")
            }
        }
        const removeHolidays = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    holiday: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Holidays/deleteHoliday',formData)
                    if(response && response.status == 200){
                        toast.success("Holiday(s) Removed Succesfully");
                        searchHolidays();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Holiday: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Holiday To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchHolidays = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                holiday_name: name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/holidays-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                holidaysList.value = response.data.results;
                store.commit('Holidays/LIST_HOLIDAYS', holidaysList.value)
                propResults.value = response.data;
                propArrLen.value = holidaysList.value.length;
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
            searchHolidays(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            name_search.value = "";
            searchHolidays();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchHolidays();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchHolidays();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchHolidays();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchHolidays();
            // scrollToTop();
        }
        const addNewHoliday = () =>{
            store.dispatch("Holidays/updateState",{selectedHoliday:null,isEditing:false})
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const holidayID = row[idField];
                let formData = {
                    company: companyID.value,
                    holiday: holidayID
                }
                await store.dispatch('Holidays/fetchHoliday',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';

            }else if(action == 'delete'){
                const holidayID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    holiday: holidayID
                }
                await store.dispatch('Holidays/deleteHoliday',formData).
                then(()=>{
                    searchHolidays();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchHolidays();
            
        })
        return{
            title, searchHolidays,resetFilters, addButtonLabel, searchFilters, tableColumns, holidaysList,selectSearchQuantity,selectedValue,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,addingRight,removingRight,rightsModule,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewHoliday, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveHoliday, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeHoliday, removeHolidays
        }
    }
};
</script>