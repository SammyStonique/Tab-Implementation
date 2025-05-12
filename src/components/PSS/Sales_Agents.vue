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
                :displayButtons="displayButtons" @handleSubmit="saveAgent" @handleReset="handleReset"
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
    name: 'Sales_Agents',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'sales_agent_id';
        const addButtonLabel = ref('New Agent');
        const title = ref('Agent Details');
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
        const modal_left = ref('400px');
        const modal_width = ref('45vw');
        const isEditing = computed(()=> store.state.Sales_Agents.isEditing);
        const selectedAgent = computed(()=> store.state.Sales_Agents.selectedAgent);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Agent Name", key:"name"},
            {label: "Email", key: "email"},
            {label: "ID No", key:"id_number"},
            {label: "Phone No", key:"phone_number"},
            {label: "Hire Date", key:"hire_date"},
            {label: "Location", key:"location"},
            {label: "Comm. Rate", key:"commission_rate"},
            {label: "Status", key:"status"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Agent', rightName: 'Editing Sales Agents'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Agent', rightName: 'Deleting Sales Agents'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        
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
                notes: formFields.value[7].value,
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
                notes: formFields.value[7].value,
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
        onBeforeMount(()=>{
            searchSaleAgents();
            
        })
        return{
            title, searchSaleAgents,resetFilters, addButtonLabel, searchFilters, tableColumns, agentsList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewAgent, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveAgent, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            importDebtors, removeAgent, removeAgents, handleReset,printAgentsList,addingRight,removingRight,rightsModule,selectSearchQuantity,selectedValue
        }
    }
};
</script>