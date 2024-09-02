<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewDeposit"
            :searchFilters="searchFilters"
            @searchPage="searchDeposits"
            @resetFilters="resetFilters"
            @removeItem="removeDeposit"
            @removeSelectedItems="removeDeposits"
            @printList="printList"
            :columns="tableColumns"
            :rows="depositList"
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
                :displayButtons="displayButtons" @handleSubmit="saveDeposit" @handleReset="handleReset"
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
    name: 'Security_Deposits',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'deposit_id';
        const addButtonLabel = ref('New Deposit');
        const title = ref('Deposit Details');
        const submitButtonLabel = ref('Add');
        const ledComponentKey = ref(0);
        const selectedIds = ref([]);
        const depositList = ref([]);
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
        const isEditing = computed(()=> store.state.Security_Deposits.isEditing);
        const selectedDeposit = computed(()=> store.state.Security_Deposits.selectedDeposit);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"name"},
            {label: "Charge Mode", key:"default_mode"},
            {label: "Default Value", key: "default_value"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Deposit'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Deposit'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = computed({
            get: () => store.state.Security_Deposits.name_search,
            set: (value) => store.commit('Security_Deposits/SET_SEARCH_FILTERS', {"name_search":value}),
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
                { type: 'text', name: 'name',label: "Name", value: selectedDeposit.value?.name || '', required: true },
                { type: 'dropdown', name: 'default_mode',label: "Charge Mode", value: selectedDeposit.value?.default_mode || '', placeholder: "", required: false, options: [{ text: 'Fixed Amount', value: 'Fixed Amount' }, { text: 'Rent Percentage', value: 'Rent Percentage' }] },
                { type: 'number', name: 'default_value',label: "Default Value", value: selectedDeposit.value?.default_value || 0, required: false },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }

        watch([selectedDeposit], () => {
            if (selectedDeposit.value) {
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
        const createDeposit = async() =>{
            showModalLoader();
            let formData = {
                name: formFields.value[0].value,
                default_mode: formFields.value[1].value,
                default_value: formFields.value[2].value || 0,
                company: companyID.value
            }
            console.log("THE FORM DATA IS ",formData);
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
                    const response = await store.dispatch('Security_Deposits/createDeposit', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Security Deposit created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the deposit.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create deposit: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchDeposits();
                }
            }
        }
        const updateDeposit = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                deposit: selectedDeposit.value.deposit_id,
                name: formFields.value[0].value,
                default_mode: formFields.value[1].value,
                default_value: formFields.value[2].value,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label );
                }
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Security_Deposits/updateDeposit', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Security Deposit updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the deposit.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update deposit: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Security_Deposits/updateState",{selectedDeposit:null})
                    searchDeposits();
                }             
            }
        }
        const saveDeposit = () =>{
            if(isEditing.value == true){
                updateDeposit();
            }else{
                createDeposit();
            }
        }
        const removeDeposit = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    deposit: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Security_Deposits/deleteDeposit',formData)
                    if(response && response.status == 200){
                        toast.success("Security Deposit Removed Succesfully");
                        searchDeposits();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove deposit: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 deposit") 
            }else{
                toast.error("Please Select A Security Deposit To Remove")
            }
        }
        const removeDeposits = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    deposit: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Security_Deposits/deleteDeposit',formData)
                    if(response && response.status == 200){
                        toast.success("Security Deposit(s) Removed Succesfully");
                        searchDeposits();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove deposit(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Security Deposit To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchDeposits = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                name: name_search.value,
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/security-deposits-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                depositList.value = response.data.results;
                store.commit('Security_Deposits/LIST_DEPOSITS', depositList.value)
                propResults.value = response.data;
                propArrLen.value = depositList.value.length;
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
            store.commit('Security_Deposits/RESET_SEARCH_FILTERS')
            searchDeposits();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchDeposits();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchDeposits();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchDeposits();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchDeposits();
            // scrollToTop();
        }
        const addNewDeposit = () =>{
            store.dispatch("Security_Deposits/updateState",{selectedDeposit:null, isEditing:false})
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const depositID = row[idField];
                let formData = {
                    company: companyID.value,
                    deposit: depositID
                }
                await store.dispatch('Security_Deposits/fetchDeposit',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';

            }else if(action == 'delete'){
                const depositID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    deposit: depositID
                }
                await store.dispatch('Security_Deposits/deleteDeposit',formData).
                then(()=>{
                    searchDeposits();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchDeposits();
            
        })
        return{
            title, searchDeposits,resetFilters, addButtonLabel, searchFilters, tableColumns, depositList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewDeposit, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveDeposit, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeDeposit, removeDeposits
        }
    }
};
</script>