<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewCounter"
        :searchFilters="searchFilters"
        @searchPage="searchCounters"
        @resetFilters="resetFilters"
        @removeItem="removeCounter"
        @removeSelectedItems="removeCounters"
        :addingRight="addingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="counterList"
        :actions="actions"
        :idField="idField"
        @handleSelectionChange="handleSelectionChange"
        @handleActionClick="handleActionClick"
        :count="depCount"
        :currentPage="currentPage"
        :result="depArrLen"
        @loadPrev="loadPrev"
        @loadNext="loadNext"
        @firstPage="firstPage"
        @lastPage="lastPage"
        :showNextBtn="showNextBtn"
        :showPreviousBtn="showPreviousBtn"
    />
    <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="saveCounter" @handleReset="handleReset"
        />
    </MovableModal>
    <MovableModal v-model:visible="chanModalVisible" :title="title1" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader1" @showLoader="showChanModalLoader" @hideLoader="hideChanModalLoader" @closeModal="closeChanModal">
        <DynamicForm 
            :fields="formFields1" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="createChannel" @handleReset="handleChanReset"
        />
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Outlet_Counters',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const modal_loader1 = ref('none');
        const title = ref('Counter Details');
        const title1 = ref('Channel Details');
        const outComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const addButtonLabel = ref('New Counter');
        const addingRight = ref('Adding Outlet Counter');
        const rightsModule = ref('Inventory');
        const idField = 'outlet_counter_id';
        const selectedIds = ref([]);
        const depModalVisible = ref(false);
        const chanModalVisible = ref(false);
        const counterList = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const outlets_array = computed({
            get: () => store.state.Retail_Outlets.outletArr,
        });
        const ledgers_array = computed({
            get: () => store.state.Ledgers.cashbookLedgerArr,
        });
        const outletID = ref('');
        const ledgerID = ref('');
        const counterID = ref('');
        const outletSearchID = ref('');
        const isEditing = computed(()=> store.state.Outlet_Counters.isEditing);
        const selectedCounter = computed(()=> store.state.Outlet_Counters.selectedCounter);
        const selectedOutlet = computed(()=> store.state.Outlet_Counters.selectedOutlet);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key: "counter_name", type: "text", editable: false},
            {label: "Outlet", key: "warehouse_name", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Counter', rightName: 'Editing Outlet Counter'},
            {name: 'channel', icon: 'fa fa-check-circle', title: 'Assign Channel', rightName: 'Editing Outlet Counter'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Counter', rightName: 'Deleting Outlet Counter'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const counter_name_search = computed({
            get: () => store.state.Outlet_Counters.counter_name_search,
            set: (value) => store.commit('Outlet_Counters/SET_SEARCH_FILTERS', {"counter_name_search":value}),
        });
        const fetchOutlets = async() =>{
            await store.dispatch('Retail_Outlets/fetchOutlets', {company:companyID.value});
        };
        const handleSearchOutlet= async(option) =>{
            await store.dispatch('Retail_Outlets/handleSelectedOutlet', option)
            outletSearchID.value = store.state.Retail_Outlets.outletID;
        };
        const clearSearchOutlet= async() =>{
            await store.dispatch('Retail_Outlets/updateState', {outletID: ''});
            outletSearchID.value = store.state.Retail_Outlets.outletID;
        };
        const handleSelectedOutlet= async(option) =>{
            await store.dispatch('Retail_Outlets/handleSelectedOutlet', option)
            outletID.value = store.state.Retail_Outlets.outletID;
        };
        const clearSelectedOutlet= async() =>{
            await store.dispatch('Retail_Outlets/updateState', {outletID: ''});
            outletID.value = store.state.Retail_Outlets.outletID;
        };
        const fetchAllLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value});
        };
        const fetchLedgers = async() =>{
            await store.dispatch('Ledgers/fetchCashbookLedgers', {company:companyID.value, ledger_type: "Cashbook"});
        };
        const handleSelectedLedger= async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            ledgerID.value = store.state.Ledgers.ledgerID;
        };
        const clearSelectedLedger= async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            ledgerID.value = store.state.Ledgers.ledgerID;
        };
        const searchFilters = ref([
            {type:'text', placeholder:"Search Name...", value: counter_name_search, width: 56},
            {
                type:'search-dropdown', value: outlets_array, width:48, componentKey: outComponentKey,
                selectOptions: outlets_array,optionSelected: handleSearchOutlet,
                searchPlaceholder: 'Outlet...', dropdownWidth: '300px',
                fetchData: store.dispatch('Retail_Outlets/fetchOutlets', {company:companyID.value}), clearSearch: clearSearchOutlet()
            },
        ]);
        const outletValue = computed(() => {
            return (selectedCounter.value && selectedCounter.value.warehouse && !outletID.value) ? selectedCounter.value.warehouse.warehouse_id : outletID.value;
        });
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'uom_name',label: "Name", value: selectedCounter.value?.uom_name || '', required: true },
                {
                    type:'search-dropdown', value: outletValue.value, width:48, componentKey: outComponentKey,
                    selectOptions: outlets_array,optionSelected: handleSelectedOutlet,
                    label: 'Outlet', dropdownWidth: '380px', required: true,
                    fetchData: fetchOutlets(), clearSearch: clearSelectedOutlet()
                },
            ];
        };
        watch([selectedCounter, selectedOutlet], () => {
            if(selectedCounter.value && selectedOutlet.value){
                updateFormFields();
            }      
        }, { immediate: true });
        const formFields1 = ref([]);
        const updateFormFields1 = () => {
            formFields1.value = [
                { type: 'text', name: 'channel_name',label: "Channel Name", value: '', required: true },
                {
                    type:'search-dropdown', value: ledgerID.value, width:48, componentKey: ledComponentKey,
                    selectOptions: ledgers_array,optionSelected: handleSelectedLedger,
                    label: 'Ledger', dropdownWidth: '380px', required: true,
                    fetchData: fetchLedgers(), clearSearch: clearSelectedLedger()
                },
            ];
        };
        const addNewCounter = async() =>{
            updateFormFields();
            await store.dispatch("Outlet_Counters/updateState",{isEditing:false, selectedCounter:null, selectedOutlet:null})
            depModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        };
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const counterID = row[idField];
                let formData = {
                    company: companyID.value,
                    outlet_counter: counterID
                }
                await store.dispatch('Outlet_Counters/fetchCounter',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if( action == 'channel'){
                fetchAllLedgers();
                counterID.value = row[idField];
                updateFormFields1();
                handleChanReset();
                chanModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';
            }
            else if(action == 'delete'){
                const counterID = [row['outlet_counter_id']];
                let formData = {
                    company: companyID.value,
                    outlet_counter: counterID
                }
                await store.dispatch('Outlet_Counters/deleteCounter',formData)
                searchCounters();
            }
        } 
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            outletID.value = "";
            outletValue.value = "";
            outComponentKey.value += 1;
        }
        const handleChanReset = () =>{
            for(let i=0; i < formFields1.value.length; i++){
                formFields1.value[i].value = '';
            }
            ledgerID.value = "";
            ledComponentKey.value += 1;
        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const showChanModalLoader = () =>{
            modal_loader1.value = "block";
        }
        const hideChanModalLoader = () =>{
            modal_loader1.value = "none";
        }
        const createChannel = async() =>{
            showChanModalLoader();
            let formData = {
                channel_name: formFields1.value[0].value,
                outlet_counter: counterID.value,
                posting_account: ledgerID.value,
                outlet_counter_id: counterID.value,
                posting_account_id: ledgerID.value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < (formFields1.value.length -1); i++){
                if(formFields1.value[i].value =='' && formFields1.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideChanModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Counter_Channels/createChannel', formData);
                    if(response && response.status === 200) {
                        hideChanModalLoader();
                        toast.success('Channel created successfully!');
                        handleChanReset();
                    }else {
                        toast.error('An error occurred while creating the Channel.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Channel: ' + error.message);
                } finally {
                    hideChanModalLoader();
                    searchCounters();
                }
            }

        }
        const createCounter = async() =>{
            showModalLoader();
            let formData = {
                counter_name: formFields.value[0].value,
                warehouse: outletValue.value,
                warehouse_id: outletValue.value,    
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < (formFields.value.length -1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Outlet_Counters/createCounter', formData);
                    if(response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Counter created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Counter.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Counter: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchCounters();
                }
            }

        }
        const updateCounter = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                counter_name: formFields.value[0].value,
                warehouse: outletValue.value, 
                warehouse_id: outletValue.value,   
                outlet_counter: selectedCounter.value.outlet_counter_id,
                company: companyID.value,
            }
            for(let i=0; i < (formFields.value.length -1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
            }else{
                try {
                    const response = await store.dispatch('Outlet_Counters/updateCounter', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Counter updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Counter.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Counter: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchCounters();
                }
            }
        }
        const saveCounter = () =>{
            if(isEditing.value == true){
                updateCounter();
            }else{
                createCounter();
            }
        }
        const removeCounter = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    outlet_counter: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Outlet_Counters/deleteCounter',formData)
                    if(response && response.status == 200){
                        toast.success("Counter Removed Succesfully");
                        searchCounters();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Counter: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Counter") 
            }else{
                toast.error("Please Select A Counter To Remove")
            }
        }
        const removeCounters = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    outlet_counter: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Outlet_Counters/deleteCounter',formData)
                    if(response && response.status == 200){
                        toast.success("Counter(s) Removed Succesfully");
                        searchCounters();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Counter(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Counter To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchCounters = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                counter_name: counter_name_search.value,
                retail_outlet: outletValue.value,
                company_id: companyID.value
            }
            axios
            .post(`api/v1/outlet-counters-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                counterList.value = response.data.results;
                store.commit('Outlet_Counters/LIST_COUNTERS', counterList.value)
                depResults.value = response.data;
                depArrLen.value = counterList.value.length;
                depCount.value = depResults.value.count;
                pageCount.value = Math.ceil(depCount.value / 50);
                
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
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchCounters();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchCounters();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchCounters();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchCounters();
        }
        const resetFilters = () =>{
            store.commit('Outlet_Counters/RESET_SEARCH_FILTERS')
            searchCounters();
        };
        const closeModal = async() =>{
            await store.dispatch("Outlet_Counters/updateState",{isEditing:false, selectedCounter:null, selectedOutlet:null})
            depModalVisible.value = false;
            handleReset();
        };
        const closeChanModal = () =>{
            chanModalVisible.value = false;
            handleChanReset();
        };
        onMounted(()=>{
            searchCounters();
        })
        return{
            title,title1,idField, searchCounters, addButtonLabel, searchFilters, resetFilters, tableColumns, counterList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, formFields1, depModalVisible, chanModalVisible, addNewCounter,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, handleChanReset, saveCounter,
            showLoader, loader, hideLoader, modal_loader, modal_loader1, showModalLoader, showChanModalLoader, hideModalLoader, hideChanModalLoader, removeCounter, removeCounters,
            addingRight,rightsModule,handleSelectionChange,closeModal,closeChanModal,createChannel
        }
    }
}
</script>