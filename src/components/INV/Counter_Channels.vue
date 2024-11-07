<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewChannel"
        :searchFilters="searchFilters"
        @searchPage="searchChannels"
        @resetFilters="resetFilters"
        @removeItem="removeChannel"
        @removeSelectedItems="removeChannels"
        :addingRight="addingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="channelList"
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
            :displayButtons="displayButtons" @handleSubmit="saveChannel" @handleReset="handleReset"
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
    name: 'Counter_Channels',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Channel Details');
        const outComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const addButtonLabel = ref('New Channel');
        const addingRight = ref('Adding Counter Channels');
        const rightsModule = ref('Inventory');
        const idField = 'counter_channel_id';
        const selectedIds = ref([]);
        const depModalVisible = ref(false);
        const channelList = ref([]);
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
        const counters_array = computed({
            get: () => store.state.Outlet_Counters.counterArr,
        });
        const ledgers_array = computed({
            get: () => store.state.Ledgers.cashbookLedgerArr,
        });
        const ledgerID = ref('');
        const counterID = ref('');
        const counterSearchID = ref('');
        const isEditing = computed(()=> store.state.Counter_Channels.isEditing);
        const selectedChannel = computed(()=> store.state.Counter_Channels.selectedChannel);
        const selectedCashbook = computed(()=> store.state.Counter_Channels.selectedCashbook);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key: "channel_name", type: "text", editable: false},
            {label: "Counter", key: "outlet_counter_name", type: "text", editable: false},
            {label: "Posting Acc.", key: "posting_account_name", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Channel', rightName: 'Adding Counter Channels'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Channel', rightName: 'Deleting Counter Channels'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const outlet_counter_search = computed({
            get: () => store.state.Counter_Channels.outlet_counter_search,
            set: (value) => store.commit('Counter_Channels/SET_SEARCH_FILTERS', {"outlet_counter_search":value}),
        });
        const fetchCounters = async() =>{
            await store.dispatch('Outlet_Counters/fetchCounters', {company:companyID.value});
        };
        const handleSearchCounter= async(option) =>{
            await store.dispatch('Outlet_Counters/handleSelectedCounter', option)
            counterSearchID.value = store.state.Outlet_Counters.counterID;
        };
        const clearSearchCounter= async() =>{
            await store.dispatch('Outlet_Counters/updateState', {counterID: ''});
            counterSearchID.value = store.state.Outlet_Counters.counterID;
        };
        const handleSelectedCounter= async(option) =>{
            await store.dispatch('Outlet_Counters/handleSelectedCounter', option)
            counterID.value = store.state.Outlet_Counters.counterID;
        };
        const clearSelectedCounter= async() =>{
            await store.dispatch('Outlet_Counters/updateState', {counterID: ''});
            counterID.value = store.state.Outlet_Counters.counterID;
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
            {
                type:'search-dropdown', value: counters_array, width:48, componentKey: outComponentKey,
                selectOptions: counters_array,optionSelected: handleSearchCounter,
                searchPlaceholder: 'Counter...', dropdownWidth: '300px',
                fetchData: store.dispatch('Outlet_Counters/fetchCounters', {company:companyID.value}), clearSearch: clearSearchCounter()
            },
        ]);
        const counterValue = computed(() => {
            return (selectedChannel.value && selectedChannel.value.outlet_counter.outlet_counter_id && !counterID.value) ? selectedChannel.value.outlet_counter.outlet_counter_id : counterID.value;
        });
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'channel_name',label: "Name", value: selectedChannel.value?.channel_name || '', required: true },
                {
                    type:'search-dropdown', value: counterValue.value, width:48, componentKey: outComponentKey,
                    selectOptions: counters_array,optionSelected: handleSelectedCounter,
                    label: 'Counter', dropdownWidth: '380px', required: true,
                    fetchData: fetchCounters(), clearSearch: clearSelectedCounter()
                },
                {
                    type:'search-dropdown', value: ledgerID.value, width:48, componentKey: ledComponentKey,
                    selectOptions: ledgers_array,optionSelected: handleSelectedLedger,
                    label: 'Ledger', dropdownWidth: '380px', required: true,
                    fetchData: fetchLedgers(), clearSearch: clearSelectedLedger()
                },
            ];
        };
        watch([selectedChannel, selectedCashbook], () => {
            if(selectedChannel.value && selectedCashbook.value){
                outComponentKey.value += 1;
                ledComponentKey.value += 1;
                updateFormFields();
            }      
        }, { immediate: true });

        const addNewChannel = async() =>{
            fetchAllLedgers();
            updateFormFields();
            await store.dispatch("Counter_Channels/updateState",{isEditing:false, selectedCounter:null, selectedCashbook:null})
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
                const channelID = row[idField];
                let formData = {
                    company: companyID.value,
                    counter_channel: channelID
                }
                await store.dispatch('Counter_Channels/fetchChannel',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }
            else if(action == 'delete'){
                const channelID = [row['counter_channel_id']];
                let formData = {
                    company: companyID.value,
                    counter_channel: channelID
                }
                await store.dispatch('Counter_Channels/deleteChannel',formData)
                searchChannels();
            }
        } 
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            counterID.value = "";
            counterValue.value = "";
            ledgerID.value = "";
            outComponentKey.value += 1;
            ledComponentKey.value += 1;
        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createChannel = async() =>{
            showModalLoader();
            let formData = {
                channel_name: formFields.value[0].value,
                outlet_counter: counterID.value,
                posting_account: ledgerID.value,
                outlet_counter_id: counterID.value,
                posting_account_id: ledgerID.value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < (formFields.value.length -1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != "search-dropdown"){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Counter_Channels/createChannel', formData);
                    if(response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Channel created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Channel.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Channel: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchChannels();
                }
            }

        }
        const updateChannel = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                channel_name: formFields.value[0].value,
                outlet_counter: counterID.value,
                posting_account: ledgerID.value,
                outlet_counter_id: counterID.value,
                posting_account_id: ledgerID.value,
                counter_channel: selectedChannel.value.counter_channel_id,
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
                    const response = await store.dispatch('Counter_Channels/updateChannel', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Channel updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Channel.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Channel: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchChannels();
                }
            }
        }
        const saveChannel = () =>{
            if(isEditing.value == true){
                updateChannel();
            }else{
                createChannel();
            }
        }
        const removeChannel = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    counter_channel: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Counter_Channels/deleteChannel',formData)
                    if(response && response.status == 200){
                        toast.success("Channel Removed Succesfully");
                        searchChannels();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Channel: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Channel") 
            }else{
                toast.error("Please Select A Channel To Remove")
            }
        }
        const removeChannels = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    counter_channel: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Counter_Channels/deleteChannel',formData)
                    if(response && response.status == 200){
                        toast.success("Channel(s) Removed Succesfully");
                        searchChannels();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Channel(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Channel To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchChannels = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                outlet_counter: counterSearchID.value,
                company: companyID.value
            }
            axios
            .post(`api/v1/counter-channels-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                channelList.value = response.data.channels;
                store.commit('Counter_Channels/LIST_CHANNELS', channelList.value)
                depResults.value = response.data;
                depArrLen.value = channelList.value.length;
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
            
            searchChannels();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchChannels();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchChannels();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchChannels();
        }
        const resetFilters = () =>{
            outComponentKey.value += 1;
            counterSearchID.value = "";
            store.commit('Counter_Channels/RESET_SEARCH_FILTERS')
            searchChannels();
        };
        const closeModal = async() =>{
            await store.dispatch("Counter_Channels/updateState",{isEditing:false, selectedChannel:null, selectedCashbook:null})
            depModalVisible.value = false;
            handleReset();
        };
        onMounted(()=>{
            searchChannels();
        })
        return{
            title,idField, searchChannels, addButtonLabel, searchFilters, resetFilters, tableColumns, channelList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewChannel,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveChannel,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeChannel, removeChannels,
            addingRight,rightsModule,handleSelectionChange,closeModal,
        }
    }
}
</script>