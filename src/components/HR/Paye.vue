<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewPaye"
            :searchFilters="searchFilters"
            @searchPage="searchPayes"
            @resetFilters="resetFilters"
            @removeItem="removePaye"
            @removeSelectedItems="removePayes"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="payeList"
            :actions="actions"
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
            <div>
                <div class="tabs pt-2">
                    <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                        {{ tab }}
                    </button>
                </div>
                <div class="tab-content mt-3">
                    <div v-if="activeTab == 0">
                        <TaxBands 
                            :detailRows="taxBands"
                        />
                    </div>
                </div>
                
            </div>
        </PageComponent>
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="savePaye" @handleReset="handleReset"
            />
        </MovableModal>
        <MovableModal v-model:visible="bandModalVisible" :title="bandTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="band_modal_width"
            :loader="band_modal_loader" @showLoader="showBandModalLoader" @hideLoader="hideBandModalLoader" @closeModal="closeBandModal">
            <DynamicForm 
                :fields="formFields1" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="savePayeBand" @handleReset="handleBandReset"
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
import TaxBands from "@/components/TaxBands.vue";
import PrintJS from 'print-js';

export default{
    name: 'Paye',
    components:{
        PageComponent, MovableModal,DynamicForm,TaxBands
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const band_modal_loader = ref('none');
        const ledComponentKey = ref(0);
        const idField = 'paye_id';
        const addButtonLabel = ref('New Paye');
        const addingRight = ref('Adding Paye');
        const rightsModule = ref('HR');
        const title = ref('Paye Details');
        const bandTitle = ref('Paye Band Details');
        const detailsTitle = ref('Item Details');
        const tabs = ref(['Tax Bands']);
        const activeTab = ref(0);
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const payeList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const showDetails = ref(false);
        const taxBands = ref([]);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const bandModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('500px');
        const modal_width = ref('40vw');
        const band_modal_width = ref('30vw');
        const ledgerID = ref('');
        const isEditing = computed(()=> store.state.Paye.isEditing);
        const selectedPaye = computed(()=> store.state.Paye.selectedPaye);
        const selectedLedger = computed(()=> store.state.Paye.selectedLedger);
        const ledgerArray = computed(() => store.state.Ledgers.liabilityLedgerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Regime", key: "regime"},
            {label: "Tax Relief", key:"tax_relief"},
            {label: "Charge Mode", key:"charge_mode"},
            {label: "Posting Account", key:"posting_account_name"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Paye', rightName: 'Editing Paye'},
            {name: 'add-paye-band', icon: 'fa fa-plus', title: 'Add Paye Band', rightName: 'Editing Paye'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Paye', rightName: 'Deleting Paye'},
        ])
        const payeID = ref("");
        const companyID = computed(()=> store.state.userData.company_id);
        const searchFilters = ref([]);
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
           return (selectedPaye.value && selectedPaye.value.posting_account && !ledgerID.value) ? selectedPaye.value.posting_account.ledger_id : ledgerID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                
                { type: 'date', name: 'date',label: "Effective Date", value: selectedPaye.value?.date || '', required: true },
                { type: 'dropdown', name: 'regime',label: "Regime", value: selectedPaye.value?.regime || 'Kenya', placeholder: "", required: true, options: [{ text: 'Kenya', value: 'Kenya' }, { text: 'South Sudan', value: 'South Sudan' }] },
                { type: 'dropdown', name: 'charge_mode',label: "Charge Mode", value: selectedPaye.value?.charge_mode || '', placeholder: "", required: true, options: [{ text: 'Monthly', value: 'Monthly' }, { text: 'Annually', value: 'Annually' }] },
                { type: 'number', name: 'tax_relief',label: "Tax Relief", value: selectedPaye.value?.tax_relief || 0, required: false },
                { type: 'number', name: 'insurance_tax_relief',label: "Insurance Relief(%)", value: selectedPaye.value?.insurance_tax_relief || 0, required: false },
                { type: 'number', name: 'insurance_relief_max',label: "Insurance Relief Max", value: selectedPaye.value?.insurance_relief_max || 0, required: false },
                // { type: 'number', name: 'housing_levy_tax_relief',label: "Housing Levy Relief(%)", value: selectedPaye.value?.housing_levy_tax_relief || 0, required: false },
                // { type: 'number', name: 'housing_levy_relief_max',label: "Housing Levy Relief Max", value: selectedPaye.value?.housing_levy_relief_max || 0, required: false },
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

        watch([selectedPaye, selectedLedger], () => {
            if (selectedPaye.value && selectedLedger.value) {
                ledComponentKey.value += 1;
                updateFormFields();
            }
            
        }, { immediate: true });
        
        const formFields1 = ref([]);
        const updateFormFields1 = () => {
            formFields1.value = [
                
                { type: 'number', name: 'amount_from',label: "From", value: selectedPaye.value?.amount_from || 0, required: true },
                { type: 'number', name: 'amount_to',label: "To", value: selectedPaye.value?.amount_to || 0, required: true },
                { type: 'text', name: 'tax_rate',label: "Tax Rate(%)", value: selectedPaye.value?.tax_rate || 0, required: true },
            ];
        };
        const handleBandReset = () =>{
            for(let i=0; i < formFields1.value.length; i++){
                formFields1.value[i].value = '';
            }
        }

        // watch([selectedPaye, selectedLedger], () => {
        //     if (selectedPaye.value && selectedLedger.value) {
        //         ledComponentKey.value += 1;
        //         updateFormFields1();
        //     }
            
        // }, { immediate: true });

        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }

        const createPaye = async() =>{
            showModalLoader();
            let formData = {
                date: formFields.value[0].value,
                regime: formFields.value[1].value,
                tax_relief: formFields.value[3].value,
                insurance_tax_relief: formFields.value[4].value,
                insurance_relief_max: formFields.value[5].value ,
                charge_mode: formFields.value[2].value|| 'Monthly',
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
                    const response = await store.dispatch('Paye/createPaye', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Paye created successfully!');
                        handleReset();
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Paye.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Paye: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchPayes();
                }
            }
        }
        const updatePaye = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                paye: selectedPaye.value.paye_id,
                date: formFields.value[0].value,
                regime: formFields.value[1].value,
                tax_relief: formFields.value[3].value,
                insurance_tax_relief: formFields.value[4].value,
                insurance_relief_max: formFields.value[5].value ,
                charge_mode: formFields.value[2].value|| 'Monthly',
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
                    const response = await store.dispatch('Paye/updatePaye', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        ledComponentKey.value += 1;
                        toast.success("Paye updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Paye.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Paye: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Paye/updateState",{selectedPaye:null})
                    searchPayes();
                }             
            }
        }
        const savePaye = () =>{
            if(isEditing.value == true){
                updatePaye();
            }else{
                createPaye();
            }
        }
        const removePaye = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    paye: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Paye/deletePaye',formData)
                    if(response && response.status == 200){
                        toast.success("Paye Removed Succesfully");
                        searchPayes();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Paye: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Paye") 
            }else{
                toast.error("Please Select An Paye To Remove")
            }
        }
        const removePayes = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    paye: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Paye/deletePaye',formData)
                    if(response && response.status == 200){
                        toast.success("Paye(s) Removed Succesfully");
                        searchPayes();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Paye: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select An Paye To Remove")
            }
        };
        const showBandModalLoader = () =>{
            band_modal_loader.value = "block";
        }
        const hideBandModalLoader = () =>{
            band_modal_loader.value = "none";
        }
        const createPayeBand = async() =>{
            showBandModalLoader();
            let formData = {
                amount_from: formFields1.value[0].value,
                tax_rate: formFields1.value[2].value,
                amount_to: formFields1.value[1].value,
                paye: payeID.value,
                paye_id: payeID.value,
                company: companyID.value
            }
  
            errors.value = [];

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideBandModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Paye/createPayeBand', formData);
                    if (response && response.status === 200) {
                        hideBandModalLoader();
                        toast.success('Paye Band created successfully!');
                        handleBandReset();
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Paye Band.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Paye Band: ' + error.message);
                } finally {
                    hideBandModalLoader();
                    searchPayes();
                }
            }
        }
        const updatePayeBand = async() =>{
            showBandModalLoader();
            errors.value = [];
            let formData = {
                paye_band: selectedPaye.value.paye_id,
                amount_from: formFields1.value[0].value,
                tax_rate: formFields1.value[2].value,
                amount_to: formFields1.value[1].value,
                paye: payeID.value,
                paye_id: payeID.value,
                company: companyID.value
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideBandModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Paye/updatePayeBand', formData);
                    if (response && response.status === 200) {
                        hideBandModalLoader();
                        handleBandReset();
                        ledComponentKey.value += 1;
                        toast.success("Paye Band updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Paye Band.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Paye Band: ' + error.message);
                } finally {
                    hideBandModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Paye/updateState",{selectedPaye:null})
                    searchPayes();
                }             
            }
        }
        const savePayeBand = () =>{
            if(isEditing.value == true){
                updatePayeBand();
            }else{
                createPayeBand();
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchPayes = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/payes-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                payeList.value = response.data.results;
                store.commit('Paye/LIST_PAYES', payeList.value)
                propResults.value = response.data;
                propArrLen.value = payeList.value.length;
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
            searchPayes(selectedValue.value);
        };
        const resetFilters = () =>{
            selectedValue.value = 50;
            searchPayes();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchPayes();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchPayes();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchPayes();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchPayes();
            // scrollToTop();
        }
        const addNewPaye = () =>{
            fetchAllLedgers();
            store.dispatch("Paye/updateState",{selectedPaye:null, selectedLedger:null});
            ledComponentKey.value += 1;
            handleReset();
            updateFormFields();
            propModalVisible.value = true;
            store.dispatch("Paye/updateState",{isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                fetchAllLedgers();
                const payeID = row['paye_id'];
                let formData = {
                    company: companyID.value,
                    paye: payeID
                }
                await store.dispatch('Paye/fetchPaye',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const payeID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    paye: payeID
                }
                await store.dispatch('Paye/deletePaye',formData).
                then(()=>{
                    searchPayes();
                })
            }else if( action == 'add-paye-band'){
                updateFormFields1();
                payeID.value = row['paye_id'];
                bandModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';

            }
        };
        const handleShowDetails = async(row) =>{
            activeTab.value = 0;
            detailsTitle.value = 'Paye Tax Band Details';
            showDetails.value = true;
            let formData = {
                paye: row['paye_id'],
                company: companyID.value
            }
            axios.post('api/v1/get-paye-bands/',formData)
            .then((response)=>{
                taxBands.value = response.data;
            })
            .catch((error)=>{
                console.log(error.message)
            })
        };
        const selectTab = async(index) => {     
            activeTab.value = index;
        };
        const hideDetails = async() =>{
            showDetails.value = false;
        };
        const closeModal = () =>{
            propModalVisible.value = false;
        };const closeBandModal = () =>{
            bandModalVisible.value = false;
        };

        onBeforeMount(()=>{
            searchPayes();
            
        })
        return{
            title, searchPayes,resetFilters, addButtonLabel, searchFilters, tableColumns, payeList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,handleReset,
            submitButtonLabel, showModal, addNewPaye, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, savePaye, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removePaye, removePayes,addingRight,rightsModule,selectSearchQuantity,selectedValue,band_modal_loader,bandModalVisible,bandTitle,
            band_modal_width,formFields1,showBandModalLoader,hideBandModalLoader,closeBandModal,handleBandReset,savePayeBand,showDetails,detailsTitle,
            hideDetails,handleShowDetails,taxBands,tabs,selectTab,activeTab
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