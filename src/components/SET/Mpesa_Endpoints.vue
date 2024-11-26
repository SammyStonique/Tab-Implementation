<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewEndpoint"
            :searchFilters="searchFilters"
            @searchPage="searchSetups"
            @resetFilters="resetFilters"
            @removeItem="removeEndpoint"
            @removeSelectedItems="removeEndpoints"
            @printList="printList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="mpesaList"
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
        <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="simulateSTKPush" @handleReset="handleReset"
            />
        </MovableModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Mpesa_Endpoints',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Simulate STK Push');
        const depModalVisible = ref(false);
        const displayButtons = ref(true);
        const idField = 'endpoint_id';
        const addButtonLabel = ref('New Setup');
        const addingRight = ref('Payment Integrations');
        const rightsModule = ref('Settings');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const mpesaList = ref([]);
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
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const showModal = ref(false);
        const mpesaID = ref('');
        const stkPassKey = ref('');
        const stkCallUrl = ref('');
        const short_code = ref('');
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Short Code", key:"short_code"},
            {label: "Txn Type", key:"transaction_type"},
            {label: "Cashbook", key:"cashbook"},
            {label: "Type", key:"config_type"},
            {label: "Consumer Key", key:"authentication"},
            {label: "Status", key:"status"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Setup', rightName: 'Payment Integrations'},
            {name: 'register', icon: 'fa fa-check-circle', title: 'Register Url', rightName: 'Payment Integrations'},
            {name: 'simulate', icon: 'fa fa-link', title: 'Simulate STK', rightName: 'Payment Integrations'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Setup', rightName: 'Payment Integrations'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);

        const searchFilters = ref([

        ]);
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'phone_number',label: "Phone Number", value: '', required: true, placeholder: "2547XXXX" },
                { type: 'text', name: 'amount',label: "Amount", value: '', required: true },
                { type: 'text', name: 'account_reference',label: "Account Number", value: '', required: true },
            ];
        };
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const removeEndpoint = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    mpesa_setup: selectedIds.value,
                    company: companyID.value
                }
                try{
                    const response = await store.dispatch('Mpesa_Integrations/deleteMpesaSetup',formData)
                    if(response && response.status == 200){
                        toast.success("Setup Removed Succesfully");
                        searchSetups();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Setup: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Setup") 
            }else{
                toast.error("Please Select A Setup To Remove")
            }
        }
        const removeEndpoints = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    mpesa_setup: selectedIds.value,
                    company: companyID.value
                }
                try{
                    const response = await store.dispatch('Mpesa_Integrations/deleteMpesaSetup',formData)
                    if(response && response.status == 200){
                        toast.success("Setup(s) Removed Succesfully");
                        searchCompanies();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Setup: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Setup To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchSetups = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                company: companyID.value
            } 
            axios
            .post(`api/v1/mpesa-setup-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                mpesaList.value = response.data.results;
                store.commit('Mpesa_Integrations/LIST_SETUPS', mpesaList.value)
                propResults.value = response.data;
                propArrLen.value = mpesaList.value.length;
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
            store.commit('Mpesa_Integrations/RESET_SEARCH_FILTERS')
            searchSetups();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchSetups();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchSetups();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchSetups();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchSetups();
            // scrollToTop();
        }
        const addNewEndpoint = async() =>{
            store.commit('Mpesa_Integrations/initializeStore');
            await store.dispatch('Mpesa_Integrations/updateState', {selectedSetup: null, isEditing: false, selectedCashbook: null, selectedKey: null, });
            store.commit('pageTab/ADD_PAGE', {'SET':'Mpesa_Setup_Details'});
            store.state.pageTab.setActiveTab = 'Mpesa_Setup_Details';          
        };

        const simulateSTKPush = async() =>{
            showModalLoader();
            let formData = {
                company: companyID.value,
                authentication: mpesaID.value,
                short_code: short_code.value,
                stk_pass_key: stkPassKey.value,
                stk_callback_url: stkCallUrl.value,
                transaction_desc: "Test STK Push",
                phone_number : formFields.value[0].value,
                amount : formFields.value[1].value,
                account_reference : formFields.value[2].value,
            } 
            await axios.post("api/v1/simulate-stk-push/", formData)
            .then((response)=>{
                if(response.data.ResponseCode == "0"){
                    toast.success("Success")
                    handleReset();
                    hideModalLoader();
                }else{
                    toast.error("Failed");
                    hideModalLoader();
                }
                
            })
            .catch((error)=>{
                console.log(error.message);
                toast.error(error.message);
            })
            .finally(()=>{
                hideModalLoader();
            })
        };

        const registerUrl = async(formData) =>{
            await axios.post("api/v1/register-callback-url/", formData)
            .then((response)=>{
                if(response.data.ResponseCode == "0"){
                    toast.success("Success")
                    searchSetups();
                }else{
                    toast.error("Failed")
                }
                
            })
            .catch((error)=>{
                console.log(error.message);
                toast.error(error.message);
            })
        };

        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }

        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const setupID = row['mpesa_setup_id'];
                let formData = {
                    company: companyID.value,
                    mpesa_setup: setupID
                }
                await store.dispatch('Mpesa_Integrations/fetchMpesaSetup',formData).
                then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'SET':'Mpesa_Setup_Details'})
                    store.state.pageTab.setActiveTab = 'Mpesa_Setup_Details';
                })
            }else if(action == 'delete'){
                const setupID = row['mpesa_setup_id'];
                let formData = {
                    company: companyID.value,
                    mpesa_setup: setupID
                }
                await store.dispatch('Mpesa_Integrations/deleteMpesaSetup',formData).
                then(()=>{
                    searchSetups();
                })
            }else if(action == 'register'){
                const mpesaID = row['authentication_id'];
                const regStatus = row['status'];
                if (regStatus == "Success"){
                    toast.error("Endpoints Already Registered")
                }else{
                    let formData = {
                        company: companyID.value,
                        authentication: mpesaID
                    }
                    await registerUrl(formData);
                }
                
            }else if(action == 'simulate'){
                updateFormFields();
                depModalVisible.value = true;
                handleReset();
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';
                mpesaID.value = row['authentication_id'];
                stkPassKey.value = row['stk_pass_key'];
                short_code.value = row['short_code'];
                stkCallUrl.value = row['stk_callback_url'];
                        
            }
        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const closeModal = () =>{
            propModalVisible.value = false;
            mpesaID.value = "";
            stkPassKey.value = "";
            short_code.value = "";
        }
        onBeforeMount(()=>{
            searchSetups();
            
        })
        return{
            searchSetups,resetFilters, addButtonLabel, searchFilters, tableColumns, mpesaList,displayButtons,handleReset,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewEndpoint, showLoader, loader, hideLoader, removeEndpoint, removeEndpoints,
            handleSelectionChange,addingRight,rightsModule,showModalLoader,hideModalLoader,modal_loader,title,flex_basis,flex_basis_percentage,
            modal_left,modal_top,modal_width,depModalVisible,formFields,simulateSTKPush
        }
    }
};
</script>