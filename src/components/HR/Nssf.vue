<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewNssf"
            :searchFilters="searchFilters"
            @searchPage="searchNssfs"
            @resetFilters="resetFilters"
            @removeItem="removeNssf"
            @removeSelectedItems="removeNssfs"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="nssfList"
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
                :displayButtons="displayButtons" @handleSubmit="saveNssf" @handleReset="handleReset"
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
    name: 'Nssf',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const ledComponentKey = ref(0);
        const idField = 'nssf_id';
        const addButtonLabel = ref('New NSSF');
        const addingRight = ref('Adding Nssf');
        const rightsModule = ref('HR');
        const title = ref('NSSF Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const nssfList = ref([]);
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
        const isEditing = computed(()=> store.state.Nssf.isEditing);
        const selectedNssf = computed(()=> store.state.Nssf.selectedNssf);
        const selectedLedger = computed(()=> store.state.Nssf.selectedLedger);
        const ledgerArray = computed(() => store.state.Ledgers.liabilityLedgerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Regime", key: "regime"},
            {label: "Tax Allow.", key:"taxation_status"},
            {label: "Charge Mode", key:"charge_mode"},
            {label: "Year", key:"year"},
            {label: "Posting Account", key:"posting_account_name"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Nssf', rightName: 'Editing Nssf'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Nssf', rightName: 'Deleting Nssf'},
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
           return (selectedNssf.value && selectedNssf.value.posting_account && !ledgerID.value) ? selectedNssf.value.posting_account.ledger_id : ledgerID.value;

        });
        const updateFormFields = () => {
            formFields.value = [     
                { type: 'date', name: 'date',label: "Effective Date", value: selectedNssf.value?.date || '', required: true },
                { type: 'dropdown', name: 'regime',label: "Regime", value: selectedNssf.value?.regime || 'Kenya', placeholder: "", required: true, options: [{ text: 'Kenya', value: 'Kenya' }, { text: 'South Sudan', value: 'South Sudan' }] },
                { type: 'dropdown', name: 'charge_mode',label: "Charge Mode", value: selectedNssf.value?.charge_mode || '', placeholder: "", required: true, options: [{ text: 'Monthly', value: 'Monthly' }, { text: 'Annually', value: 'Annually' }] },
                { type: 'dropdown', name: 'taxation_status',label: "Tax Allowable", value: selectedNssf.value?.taxation_status || 'Yes', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }]},
                { type: 'number', name: 'max_amount',label: "Max Amount", value: selectedNssf.value?.max_amount || 0, required: true },
                { type: 'number', name: 'employee_rate',label: "Employee Rate(%)", value: selectedNssf.value?.employee_rate || 0, required: true },
                { type: 'number', name: 'employer_rate',label: "Employer Rate(%)", value: selectedNssf.value?.employer_rate || 0, required: true },
                { type: 'number', name: 'lower_limit',label: "Lower Limit", value: selectedNssf.value?.lower_limit || 0, required: true },
                { type: 'number', name: 'upper_limit',label: "Upper Limit", value: selectedNssf.value?.upper_limit || 0, required: true },
                { type: 'text', name: 'year',label: "Year", value: selectedNssf.value?.year || '', required: true },
                {  
                    type:'search-dropdown', label:"Posting Account", value: ledgerValue.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Posting Account...', dropdownWidth: '500px', updateValue: selectedLedger.value,
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

        watch([selectedNssf, selectedLedger], () => {
            if (selectedNssf.value && selectedLedger.value) {
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
        const createNssf = async() =>{
            showModalLoader();
            let formData = {
                date: formFields.value[0].value,
                employee_rate: formFields.value[5].value,
                employer_rate: formFields.value[6].value,
                regime: formFields.value[1].value,
                taxation_status: formFields.value[3].value || 'No',
                charge_mode: formFields.value[2].value,
                max_amount: formFields.value[4].value,
                lower_limit: formFields.value[7].value,
                upper_limit: formFields.value[8].value,
                year: formFields.value[9].value,
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
                    const response = await store.dispatch('Nssf/createNssf', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Nssf created successfully!');
                        handleReset();
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Nssf.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Nssf: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchNssfs();
                }
            }
        }
        const updateNssf = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                nssf: selectedNssf.value.nssf_id,
                date: formFields.value[0].value,
                employee_rate: formFields.value[5].value,
                employer_rate: formFields.value[6].value,
                regime: formFields.value[1].value,
                taxation_status: formFields.value[3].value || 'No',
                charge_mode: formFields.value[2].value,
                max_amount: formFields.value[4].value,
                lower_limit: formFields.value[7].value,
                upper_limit: formFields.value[8].value,
                year: formFields.value[9].value,
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
                    const response = await store.dispatch('Nssf/updateNssf', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        ledComponentKey.value += 1;
                        toast.success("Nssf updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Nssf.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Nssf: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Nssf/updateState",{selectedNssf:null})
                    searchNssfs();
                }             
            }
        }
        const saveNssf = () =>{
            if(isEditing.value == true){
                updateNssf();
            }else{
                createNssf();
            }
        }
        const removeNssf = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    nssf: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Nssf/deleteNssf',formData)
                    if(response && response.status == 200){
                        toast.success("Nssf Removed Succesfully");
                        searchNssfs();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Nssf: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Nssf") 
            }else{
                toast.error("Please Select An Nssf To Remove")
            }
        }
        const removeNssfs = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    nssf: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Nssf/deleteNssf',formData)
                    if(response && response.status == 200){
                        toast.success("Nssf(s) Removed Succesfully");
                        searchNssfs();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Nssf: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Nssf To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchNssfs = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/nssfs-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                nssfList.value = response.data.results;
                store.commit('Nssf/LIST_NSSF', nssfList.value)
                propResults.value = response.data;
                propArrLen.value = nssfList.value.length;
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
            searchNssfs(selectedValue.value);
        };
        const resetFilters = () =>{
            selectedValue.value = 50;
            searchNssfs();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchNssfs();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchNssfs();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchNssfs();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchNssfs();
            // scrollToTop();
        }
        const addNewNssf = () =>{
            fetchAllLedgers();
            store.dispatch("Nssf/updateState",{selectedNssf:null, selectedLedger:null});
            ledComponentKey.value += 1;
            handleReset();
            updateFormFields();
            propModalVisible.value = true;
            store.dispatch("Nssf/updateState",{isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                fetchAllLedgers();
                const nssfID = row['nssf_id'];
                let formData = {
                    company: companyID.value,
                    nssf: nssfID
                }
                await store.dispatch('Nssf/fetchNssf',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const nssfID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    nssf: nssfID
                }
                await store.dispatch('Nssf/deleteNssf',formData).
                then(()=>{
                    searchNssfs();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };

        onBeforeMount(()=>{
            searchNssfs();
            
        })
        return{
            title, searchNssfs,resetFilters, addButtonLabel, searchFilters, tableColumns, nssfList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewNssf, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveNssf, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeNssf, removeNssfs,addingRight,rightsModule,selectSearchQuantity,selectedValue,
        }
    }
};
</script>