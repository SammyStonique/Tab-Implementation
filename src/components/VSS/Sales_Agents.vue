<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewAgent"
            :searchFilters="searchFilters"
            @searchPage="searchSaleAgents"
            @resetFilters="resetFilters"
            @importData="importDebtors"
            @removeItem="removeAgent"
            @removeSelectedItems="removeAgents"
            @printList="printAgentsList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="agentsList"
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
                <div class="tabs pt-1">
                    <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                        {{ tab }}
                    </button>
                </div>
                <div class="tab-content mt-3">
                    <div v-show="activeTab == 0">
                        <div class="border border-slate-200 rounded relative py-2 w-[75%] px-2 min-h-[50px]">                    
                            <ShowDetailsTable :key="tableKey" :columns="assetColumns" :rows="assignedAssetsRows" :displayButtons="displayDetailsButtons" :fields="detailsField" :idField="idFieldAsset" @handleSelectionChange="handleAssetChange" :showActions="showActions" :rightsModule="rightsModule" />
                        </div>
                    </div>
                </div>
                
            </div>
        </PageComponent>
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="saveAgent" @handleReset="handleReset"
            />
        </MovableModal>
        <MovableModal v-model:visible="depModalVisible" :title="title1" :modal_top="modal_top1" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader1" @showLoader="showModalLoader1" @hideLoader="hideModalLoader1" @closeModal="closeModal1">
            <DynamicForm 
                :fields="formFields1" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="assignAsset" @handleReset="handleReset"
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
import ShowDetailsTable from '@/components/ShowDetailsTable.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';
import Swal from 'sweetalert2';

export default{
    name: 'Sales_Agents',
    components:{
        PageComponent, MovableModal,DynamicForm,ShowDetailsTable
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const modal_loader1 = ref('none');
        const assetComponentKey = ref(0);
        const idField = 'sales_agent_id';
        const addButtonLabel = ref('New Agent');
        const title = ref('Agent Details');
        const title1 = ref('Assign Asset');
        const depModalVisible = ref(false);
        const addingRight = ref('Adding Sales Agents');
        const removingRight = ref('Deleting Sales Agents');
        const rightsModule = ref('PSS');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const agentsList = ref([]);
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
        const modal_top1 = ref('450px');
        const modal_left = ref('400px');
        const modal_width = ref('45vw');
        const isEditing = computed(()=> store.state.Sales_Agents.isEditing);
        const selectedAgent = computed(()=> store.state.Sales_Agents.selectedAgent);
        const assetArray = computed(()=> store.state.Sale_Assets.assetArr);
        const showModal = ref(false);
        const showDetails = ref(false);
        const showActions = ref(false);
        const detailsTitle = ref('');
        const displayDetailsButtons = ref(true);
        const tabs = ref(['Assigned Assets']);
        const idFieldAsset = 'agent_sale_asset_id';
        const assetColumns = ref([
            {type: "checkbox"},
            {label: "Asset Name", key:"asset.name"},
        ]);
        const selectedAssetIds = ref([]);
        const assignedAssetsRows = ref([]);
        const activeTab = ref(0);
        const agentID = ref(null);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Agent Name", key:"name"},
            {label: "Email", key: "email"},
            {label: "Gender", key: "gender"},
            {label: "ID No", key:"id_number"},
            {label: "Phone No", key:"phone_number"},
            {label: "Hire Date", key:"hire_date"},
            {label: "Location", key:"location"},
            {label: "Comm. Rate", key:"commission_rate"},
            {label: "Status", key:"status"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Agent', rightName: 'Editing Sales Agents'},
            {name: 'invite', icon: 'fa fa-paper-plane', title: 'Invite Agent', rightName: 'Inviting Sales Agents To Portal'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Agent', rightName: 'Deleting Sales Agents'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const assetID = ref(null);
        const phone_number_search = ref("");
        const agent_name_search = ref("");
        const status_search = ref("");
        const searchFilters = ref([
            
            {type:'text', placeholder:"Name...", value: agent_name_search, width:48,},
            {type:'text', placeholder:"Code...", value: phone_number_search, width:40,},
            {
                type:'dropdown', placeholder:"Status..", value: status_search, width:40,
                options: [{text:'Active',value:'Active'},{text:'Inactive',value:'Inactive'}]
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleAssetChange = (ids) => {
            selectedAssetIds.value = ids;
        };
        
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'name',label: "Name", value: selectedAgent.value?.name || '', required: true },
                { type: 'text', name: 'phone_number',label: "Phone Number", value: selectedAgent.value?.phone_number || '', required: true },
                { type: 'text', name: 'email',label: "Email", value: selectedAgent.value?.email || '', required: true },
                { type: 'text', name: 'id_number',label: "ID No", value: selectedAgent.value?.id_number || '', required: true },
                { type: 'text', name: 'location',label: "Location", value: selectedAgent.value?.location || '', required: false },
                { type: 'date', name: 'hire_date',label: "Hire Date", value: selectedAgent.value?.hire_date || '', required: true },
                { type: 'number', name: 'commission_rate',label: "Commission Rate(%)", value: selectedAgent.value?.commission_rate || 0, required: false },
                { type: 'dropdown', name: 'gender',label: "Gender", value: selectedAgent.value?.gender || '', placeholder: "", required: true, options: [{ text: 'Male', value: 'Male' }, { text: 'Female', value: 'Female' }, { text: 'Others', value: 'Others' }] },
                { type: 'text-area', name: 'notes',label: "Notes", value: selectedAgent.value?.notes || '', textarea_rows: '3', textarea_cols: '56', required: false },

            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }

        watch([selectedAgent], () => {
            if (selectedAgent.value) {
                updateFormFields();
          
            }
            
        }, { immediate: true });
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createAgent = async() =>{
            showModalLoader();
            let formData = {
                name: formFields.value[0].value,
                id_number: formFields.value[3].value,
                location: formFields.value[4].value,
                hire_date: formFields.value[5].value,
                email: formFields.value[2].value,
                phone_number: formFields.value[1].value,
                commission_rate: formFields.value[6].value,
                gender: formFields.value[7].value,
                notes: formFields.value[8].value,
                status: "Active",
                company: companyID.value
            }
  
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
                    const response = await store.dispatch('Sales_Agents/createSalesAgent', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Agent created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the Agent.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Agent: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchSaleAgents();
                }
            }
        }
        const updateAgent = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                sales_agent: selectedAgent.value.sales_agent_id,
                name: formFields.value[0].value,
                id_number: formFields.value[3].value,
                location: formFields.value[4].value,
                hire_date: formFields.value[5].value,
                email: formFields.value[2].value,
                phone_number: formFields.value[1].value,
                commission_rate: formFields.value[6].value,
                gender: formFields.value[7].value,
                notes: formFields.value[8].value,
                status: selectedAgent.value.status,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Sales_Agents/updateSalesAgent', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Agent updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Agent.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Agent: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Sales_Agents/updateState",{selectedAgent:null})
                    searchSaleAgents();
                }             
            }
        }
        const saveAgent = () =>{
            if(isEditing.value == true){
                updateAgent();
            }else{
                createAgent();
            }
        }
        const importDebtors = () =>{
           
        }
        const removeAgent = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    sales_agent: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Sales_Agents/deleteSalesAgent',formData)
                    if(response && response.status == 200){
                        toast.success("Agent Removed Succesfully");
                        searchSaleAgents();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Agent: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Agent") 
            }else{
                toast.error("Please Select An Agent To Remove")
            }
        }
        const removeAgents = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    sales_agent: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Sales_Agents/deleteSalesAgent',formData)
                    if(response && response.status == 200){
                        toast.success("Agent(s) Removed Succesfully");
                        searchSaleAgents();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Agent: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select An Agent To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchSaleAgents = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                name: agent_name_search.value,
                phone_number: phone_number_search.value,
                status: status_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/sales-agents-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                agentsList.value = response.data.results;
                store.commit('Sales_Agents/LIST_AGENTS', agentsList.value)
                propResults.value = response.data;
                propArrLen.value = agentsList.value.length;
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
            searchSaleAgents(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            phone_number_search.value = "";
            agent_name_search.value = "";
            searchSaleAgents();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchSaleAgents();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchSaleAgents();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchSaleAgents();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchSaleAgents();
            // scrollToTop();
        }
        const agentPortalInvitation = async(agent_id) =>{
            let formData = {
                sales_agent: agent_id,
                company: companyID.value
            }
            Swal.fire({
            title: "Are you sure?",
            text: `Do you wish to Invite To Portal?`,
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes Invite Agent!',
            cancelButtonText: 'Cancel!',
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            showLoaderOnConfirm: true,
            }).then((result) => {
            if (result.value) {
                axios.post(`api/v1/invite-sales-agent-portal/`,formData)
                .then((response)=>{
                    if(response.data.msg == "Success"){
                        Swal.fire("Agent invited succesfully!", {
                            icon: "success",
                        }); 
                        searchSaleAgents();
                    }else if(response.data.msg == "Exists"){
                        Swal.fire("Agent Already Exists!", {
                            icon: "warning",
                        }); 
                        searchSaleAgents();
                    }else if(response.data.msg == "Failed"){
                        Swal.fire("Invalid Email Address!", {
                            icon: "warning",
                        }); 
                        searchSaleAgents();
                    }else{
                        Swal.fire({
                        title: "Error Inviting Agent",
                        icon: "warning",
                        });
                    }                   
                })
                .catch((error)=>{
                    console.log(error.message);
                    Swal.fire({
                        title: error.message,
                        icon: "warning",
                    });
                })
            }else{
                Swal.fire(`Agent has not been invited!`);
            }
            })     
        };
        
        const addNewAgent = () =>{
            updateFormFields();
            store.dispatch("Sales_Agents/updateState",{selectedAgent:null, isEditing:false})
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const clientID = row[idField];
                let formData = {
                    company: companyID.value,
                    sales_agent: clientID
                }
                await store.dispatch('Sales_Agents/fetchSalesAgent',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const clientID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    sales_agent: clientID
                }
                await store.dispatch('Sales_Agents/deleteSalesAgent',formData).
                then(()=>{
                    searchSaleAgents();
                })
            }else if(action == 'invite'){
                let agent_id = row['sales_agent_id'];
                agentPortalInvitation(agent_id);
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printAgentsList = () =>{
            showLoader();

            let formData = {
                name: agent_name_search.value,
                phone_number: phone_number_search.value,
                status: status_search.value,
                company_id: companyID.value
            }
            axios
            .post("api/v1/export-sale-agents-pdf/", formData, { responseType: 'blob' })
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
        }
        const handleShowDetails = async(row) =>{
            activeTab.value = 0;
            agentID.value = row['sales_agent_id'];
            detailsTitle.value = row['name'] + ' Assets';
            showDetails.value = true;
            let formData = {
                sales_agent: row['sales_agent_id'],
                company: companyID.value
            }
            axios.post('api/v1/get-sales-agent-assets/',formData)
            .then((response)=>{
                assignedAssetsRows.value = response.data;
            })
            .catch((error)=>{
                console.log(error.message)
            })
        };
        const selectTab = async(index) => {

        };
        const hideDetails = async() =>{
            showDetails.value = false;
        };
        
        const fetchSaleAssets = async() =>{
            await store.dispatch('Sale_Assets/fetchSaleAssets', {company:companyID.value})
        };
        const handleSelectedAsset = async(option) =>{
            await store.dispatch('Sale_Assets/handleSelectedAsset', option)
            assetID.value = store.state.Sale_Assets.assetID;
        }
        const clearSelectedAsset = async() =>{
            await store.dispatch('Sale_Assets/updateState', {assetID: ''});
            assetID.value = store.state.Sale_Assets.assetID;
        }
        
        const formFields1 = ref([]);
        const updateFormFields1 = () => {
            formFields1.value = [
                {  
                    type:'search-dropdown', label:"Asset", value: assetID.value, componentKey: assetComponentKey,
                    selectOptions: assetArray, optionSelected: handleSelectedAsset, required: true,
                    searchPlaceholder: 'Select Asset...', dropdownWidth: '400px', updateValue: "",
                    clearSearch: clearSelectedAsset
                },
            ]
        };
        const displayAssets = () =>{
            fetchSaleAssets();
            depModalVisible.value = true;
            updateFormFields1();
            assetID.value = '';
        };
        const removeAgentAsset = async() =>{
            let formData = {
                agent_sale_asset: selectedAssetIds.value,
                company: companyID.value
            }
            Swal.fire({
            title: "Are you sure?",
            text: `Do you wish to Remove Assigned Asset?`,
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes Remove Asset!',
            cancelButtonText: 'Cancel!',
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            showLoaderOnConfirm: true,
            }).then((result) => {
            if (result.value) {
                axios.post(`api/v1/delete-sales-agent-asset/`,formData)
                .then((response)=>{
                    if(response.data.msg == "Success"){
                        Swal.fire("Asset removed succesfully!", {
                            icon: "success",
                        }); 
                    }else{
                        Swal.fire({
                        title: "Error Removing Asset",
                        icon: "warning",
                        });
                    }                   
                })
                .catch((error)=>{
                    console.log(error.message);
                    Swal.fire({
                        title: error.message,
                        icon: "warning",
                    });
                })
                .finally(()=>{
                    selectedAssetIds.value = [];
                });
            }else{
                Swal.fire(`Asset has not been removed!`);
            }
            })     
        };
        const detailsField = ref([
            {type: 'add', label: 'Assign Asset', icon: 'fa fa-plus', method: displayAssets},
            {type: 'remove', label: 'Remove Asset', icon: 'fa fa-times', method: removeAgentAsset},
        ]);
        const showModalLoader1 = () =>{
            modal_loader1.value = "block";
        }
        const hideModalLoader1 = () =>{
            modal_loader1.value = "none";
        }
        const closeModal1 = () =>{
            depModalVisible.value = false;
            hideModalLoader1();
            assetID.value = '';
        };
        const assignAsset = async() =>{
            showModalLoader1();
            let formData = {
                sales_agent: agentID.value,
                asset: assetID.value,
                sales_agent_id: agentID.value,
                asset_id: assetID.value,
                company: companyID.value
            }
            errors.value = [];
            if(assetID.value == '' || assetID.value == null){
                toast.error('Please Select An Asset');
                hideModalLoader1();
            }
            else if(assignedAssetsRows.value.some(asset => asset.asset.sale_asset_id === assetID.value)){
                toast.error('Asset Already Assigned To Agent');
                hideModalLoader1();
            }else{
                try {
                    const response = await axios.post('api/v1/create-sales-agent-asset/',formData);
                    if (response && response.status === 201) {
                        toast.success('Asset assigned successfully!');
                        closeModal1();
                        assetComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while assigning the Asset.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to assign Asset: ' + error.message);
                } finally {
                    hideModalLoader1();
                    depModalVisible.value = false;
                }
            }
        };
        onBeforeMount(()=>{
            searchSaleAgents();
            
        })
        return{
            title, searchSaleAgents,resetFilters, addButtonLabel, searchFilters, tableColumns, agentsList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewAgent, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveAgent, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            importDebtors, removeAgent, removeAgents, handleReset,printAgentsList,addingRight,removingRight,rightsModule,selectSearchQuantity,selectedValue,
            handleShowDetails, showDetails,assignedAssetsRows,assetColumns,showActions,tabs,selectTab,activeTab,idFieldAsset, detailsTitle,hideDetails,detailsField,
            displayDetailsButtons, assignAsset,modal_loader1,modal_top1, depModalVisible, title1, formFields1,showModalLoader1, hideModalLoader1,closeModal1,handleAssetChange
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