<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewCycle"
            :searchFilters="searchFilters"
            @searchPage="searchCycles"
            @resetFilters="resetFilters"
            @removeItem="removeCycle"
            @removeSelectedItems="removeCycles"
            @printList="printList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="cyclesList"
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
                :displayButtons="displayButtons" @handleSubmit="saveCycle" @handleReset="handleReset"
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
    name: 'Pay_Cycles',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'pay_cycle_id';
        const addButtonLabel = ref('New Pay Cycle');
        const title = ref('Pay Cycle Details');
        const addingRight = ref('Adding Pay Cycles');
        const rightsModule = ref('HR');
        const submitButtonLabel = ref('Add');
        const ledComponentKey = ref(0);
        const selectedIds = ref([]);
        const selectedValue = ref(50);
        const cyclesList = ref([]);
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
        const isEditing = computed(()=> store.state.Pay_Cycles.isEditing);
        const selectedCycle = computed(()=> store.state.Pay_Cycles.selectedCycle);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"pay_cycle_name"},
            {label: "Interval", key: "interval"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Pay Cycle', rightName: 'Editing Pay Cycles'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Pay Cycle', rightName: 'Deleting Pay Cycles'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = computed({
            get: () => store.state.Pay_Cycles.name_search,
            set: (value) => store.commit('Pay_Cycles/SET_SEARCH_FILTERS', {"name_search":value}),
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
                { type: 'text', name: 'pay_cycle_name',label: "Name", value: selectedCycle.value?.pay_cycle_name || '', required: true },
                { type: 'dropdown', name: 'interval',label: "Interval", value: selectedCycle.value?.interval || 'Monthly', placeholder: "", required: true, options: [{ text: 'Daily', value: 'Daily' }, { text: 'Weekly', value: 'Weekly' },{ text: 'Monthly', value: 'Monthly' }, { text: 'Quarterly', value: 'Quarterly' }] },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }

        watch([selectedCycle], () => {
            if (selectedCycle.value) {
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
        const createCycle = async() =>{
            showModalLoader();
            let formData = {
                pay_cycle_name: formFields.value[0].value,
                interval: formFields.value[1].value,
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
                    const response = await store.dispatch('Pay_Cycles/createPayCycle', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Pay Cycle created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the Pay Cycle.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Pay Cycle: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchCycles();
                }
            }
        }
        const updateCycle= async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                pay_cycle: selectedCycle.value.pay_cycle_id,
                pay_cycle_name: formFields.value[0].value,
                interval: formFields.value[1].value,
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
                    const response = await store.dispatch('Pay_Cycles/updatePayCycle', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Pay Cycle updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Pay Cycle.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Pay Cycle: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Pay_Cycles/updateState",{selectedCycle:null})
                    searchCycles();
                }             
            }
        }
        const saveCycle = () =>{
            if(isEditing.value == true){
                updateCycle();
            }else{
                createCycle();
            }
        }
        const removeCycle = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    pay_cycle: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Pay_Cycles/deletePayCycle',formData)
                    if(response && response.status == 200){
                        toast.success("Pay Cycle Removed Succesfully");
                        searchCycles();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Pay Cycle: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Pay Cycle") 
            }else{
                toast.error("Please Select A Pay Cycle To Remove")
            }
        }
        const removeCycles = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    pay_cycle: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Pay_Cycles/deletePayCycle',formData)
                    if(response && response.status == 200){
                        toast.success("Pay Cycle(s) Removed Succesfully");
                        searchCycles();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove PayCycle: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Pay Cycle To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchCycles = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                pay_cycle_name: name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/pay-cycles-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                cyclesList.value = response.data.results;
                store.commit('Pay_Cycles/LIST_CYCLES', cyclesList.value)
                propResults.value = response.data;
                propArrLen.value = cyclesList.value.length;
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
            searchCycles(selectedValue.value);
        };
        const resetFilters = () =>{
            store.commit('Pay_Cycles/RESET_SEARCH_FILTERS')
            searchCycles();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchCycles();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchCycles();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchCycles();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchCycles();
            // scrollToTop();
        }
        const addNewCycle = () =>{
            store.dispatch("Pay_Cycles/updateState",{selectedCycle:null,isEditing:false})
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const cycleID = row[idField];
                let formData = {
                    company: companyID.value,
                    pay_cycle: cycleID
                }
                await store.dispatch('Pay_Cycles/fetchPayCycle',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';

            }else if(action == 'delete'){
                const cycleID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    pay_cycle: cycleID
                }
                await store.dispatch('Pay_Cycles/deletePayCycle',formData).
                then(()=>{
                    searchCycles();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchCycles();
            
        })
        return{
            title, searchCycles,resetFilters, addButtonLabel, searchFilters, tableColumns, cyclesList,selectSearchQuantity,selectedValue,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,addingRight,rightsModule,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewCycle, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveCycle, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeCycle, removeCycles
        }
    }
};
</script>