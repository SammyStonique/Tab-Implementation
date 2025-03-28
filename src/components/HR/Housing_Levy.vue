<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewLevy"
            :searchFilters="searchFilters"
            @searchPage="searchLevys"
            @resetFilters="resetFilters"
            @removeItem="removeLevy"
            @removeSelectedItems="removeLevies"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="levyList"
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
                :displayButtons="displayButtons" @handleSubmit="saveHousingLevy" @handleReset="handleReset"
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
import Housing_Levy from "@/store/HR/Housing_Levy";

export default{
    name: 'Housing_Levy',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const ledComponentKey = ref(0);
        const idField = 'housing_levy_id';
        const addButtonLabel = ref('New AHL');
        const addingRight = ref('Adding Housing Levy');
        const removingRight = ref('Deleting Housing Levy');
        const rightsModule = ref('HR');
        const title = ref('AHL Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const levyList = ref([]);
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
        const modal_width = ref('40vw');
        const ledgerID = ref('');
        const isEditing = computed(()=> store.state.Housing_Levy.isEditing);
        const selectedLevy = computed(()=> store.state.Housing_Levy.selectedLevy);
        const selectedLedger = computed(()=> store.state.Housing_Levy.selectedLedger);
        const ledgerArray = computed(() => store.state.Ledgers.liabilityLedgerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Regime", key: "regime"},
            {label: "Tax Allow.", key:"taxation_status"},
            {label: "Charge Mode", key:"charge_mode"},
            {label: "Employer", key:"employer_rate"},
            {label: "Employee", key:"employee_rate"},
            {label: "Status", key:"status"},
            {label: "Posting Account", key:"posting_account_name"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Housing Levy', rightName: 'Editing Housing Levy'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Housing Levy', rightName: 'Deleting Housing Levy'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const searchFilters = ref([
        
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const fetchAllLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            ledgerID.value = store.state.Ledgers.ledgerID;
        };
        const clearSelectedLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            ledgerID.value = store.state.Ledgers.ledgerID;
        }
        const formFields = ref([]);
        const ledgerValue = computed(() => {
           return (selectedLevy.value && selectedLevy.value.posting_account && !ledgerID.value) ? selectedLevy.value.posting_account.ledger_id : ledgerID.value;

        });
        const updateFormFields = () => {
            formFields.value = [     
                { type: 'date', name: 'date',label: "Effective Date", value: selectedLevy.value?.date || '', required: true },
                { type: 'dropdown', name: 'regime',label: "Regime", value: selectedLevy.value?.regime || 'Kenya', placeholder: "", required: true, options: [{ text: 'Kenya', value: 'Kenya' }, { text: 'South Sudan', value: 'South Sudan' }] },
                { type: 'dropdown', name: 'charge_mode',label: "Charge Mode", value: selectedLevy.value?.charge_mode || '', placeholder: "", required: true, options: [{ text: 'Monthly', value: 'Monthly' }, { text: 'Annually', value: 'Annually' }] },
                { type: 'dropdown', name: 'taxation_status',label: "Tax Allowable", value: selectedLevy.value?.taxation_status || 'Yes', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }]},
                { type: 'text', name: 'min_amount',label: "Min Amount", value: selectedLevy.value?.min_amount || '0', required: true },
                { type: 'text', name: 'max_amount',label: "Max Amount", value: selectedLevy.value?.max_amount || '0', required: false },
                { type: 'text', name: 'employer_rate',label: "Employer Rate(%)", value: selectedLevy.value?.employer_rate || '0', required: true },
                { type: 'text', name: 'employee_rate',label: "Employee Rate(%)", value: selectedLevy.value?.employee_rate || '0', required: true },
                { type: 'text', name: 'tax_relief',label: "Tax Relief(%)", value: selectedLevy.value?.tax_relief || '0', required: true },
                { type: 'text', name: 'tax_relief_max',label: "Tax Relief Max", value: selectedLevy.value?.tax_relief_max || '0', required: true },
                { type: 'dropdown', name: 'status',label: "Active Status", value: selectedLevy.value?.status || 'Active', placeholder: "", required: true, options: [{ text: 'Active', value: 'Active' }, { text: 'Inactive', value: 'Inactive' }]},

                {  
                    type:'search-dropdown', label:"Posting Account", value: ledgerValue.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Posting Account...', dropdownWidth: '400px', updateValue: selectedLedger.value,
                    fetchData: store.dispatch('Ledgers/fetchLiabilityLedgers', {company:companyID.value, ledger_type: 'Current Liability'}),
                    clearSearch: clearSelectedLedger
                },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            ledComponentKey.value += 1;
            ledgerID.value = '';
        }

        watch([selectedLevy, selectedLedger], () => {
            if (selectedLevy.value && selectedLedger.value) {
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
        const createHousingLevy = async() =>{
            showModalLoader();
            let formData = {
                date: formFields.value[0].value,
                employer_rate: formFields.value[6].value,
                employee_rate: formFields.value[7].value,
                regime: formFields.value[1].value,
                taxation_status: formFields.value[3].value || 'No',
                charge_mode: formFields.value[2].value,
                min_amount: formFields.value[4].value,
                max_amount: formFields.value[5].value,
                tax_relief: formFields.value[8].value,
                tax_relief_max: formFields.value[9].value,
                status: formFields.value[10].value || 'Active',
                posting_account: ledgerID.value,
                posting_account_id: ledgerID.value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(ledgerValue.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Housing_Levy/createHousingLevy', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('AHL created successfully!');
                        handleReset();
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the AHL.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create AHL: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchLevys();
                }
            }
        }
        const updateHousingLevy = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                housing_levy: selectedLevy.value.housing_levy_id,
                date: formFields.value[0].value,
                employer_rate: formFields.value[6].value,
                employee_rate: formFields.value[7].value,
                regime: formFields.value[1].value,
                taxation_status: formFields.value[3].value || 'No',
                charge_mode: formFields.value[2].value,
                min_amount: formFields.value[4].value,
                max_amount: formFields.value[5].value,
                tax_relief: formFields.value[8].value,
                tax_relief_max: formFields.value[9].value,
                status: formFields.value[10].value || 'Active',
                posting_account: ledgerValue.value,
                posting_account_id: ledgerValue.value,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown'  && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(ledgerValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Housing_Levy/updateHousingLevy', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        ledComponentKey.value += 1;
                        toast.success("AHL updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the AHL.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update AHL: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Housing_Levy/updateState",{selectedLevy:null})
                    searchLevys();
                }             
            }
        }
        const saveHousingLevy = () =>{
            if(isEditing.value == true){
                updateHousingLevy();
            }else{
                createHousingLevy();
            }
        }
        const removeLevy = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    housing_levy: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Housing_Levy/deleteHousingLevy',formData)
                    if(response && response.status == 200){
                        toast.success("AHL Removed Succesfully");
                        searchLevys();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove AHL: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 AHL") 
            }else{
                toast.error("Please Select A AHL To Remove")
            }
        }
        const removeLevies = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    housing_levy: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Housing_Levy/deleteHousingLevy',formData)
                    if(response && response.status == 200){
                        toast.success("AHL(s) Removed Succesfully");
                        searchLevys();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove AHL: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select AHL To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchLevys = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/housing-levies-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                levyList.value = response.data.results;
                store.commit('Housing_Levy/LIST_LEVIES', levyList.value)
                propResults.value = response.data;
                propArrLen.value = levyList.value.length;
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
            searchLevys(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            searchLevys();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchLevys();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchLevys();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchLevys();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchLevys();
            // scrollToTop();
        }
        const addNewLevy = () =>{
            fetchAllLedgers();
            store.dispatch("Housing_Levy/updateState",{selectedLevy:null, selectedLedger:null});
            ledComponentKey.value += 1;
            handleReset();
            updateFormFields();
            propModalVisible.value = true;
            store.dispatch("Housing_Levy/updateState",{isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                fetchAllLedgers();
                const levyID = row['housing_levy_id'];
                let formData = {
                    company: companyID.value,
                    housing_levy: levyID
                }
                await store.dispatch('Housing_Levy/fetchHousingLevy',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const levyID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    housing_levy: levyID
                }
                await store.dispatch('Housing_Levy/deleteHousingLevy',formData).
                then(()=>{
                    searchLevys();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };

        onBeforeMount(()=>{
            searchLevys();
            
        })
        return{
            title, searchLevys,resetFilters, addButtonLabel, searchFilters, tableColumns, levyList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewLevy, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveHousingLevy, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeLevy, removeLevies,addingRight,removingRight,rightsModule,selectSearchQuantity,selectedValue,
        }
    }
};
</script>