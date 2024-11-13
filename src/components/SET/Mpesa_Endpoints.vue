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
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Mpesa_Endpoints',
    components:{
        PageComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
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
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Short Code", key:"name"},
            {label: "Cashbook", key:"email"},
            {label: "Type", key:"phone_number"},
            {label: "Consumer Key", key:"registration_number"},
            {label: "Status", key: "status"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Setup', rightName: 'Payment Integrations'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Setup', rightName: 'Payment Integrations'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);

        const searchFilters = ref([

        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const removeEndpoint = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Mpesa_Integrations/deleteMpesaEndpoint',formData)
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
                    company: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Mpesa_Integrations/deleteMpesaEndpoint',formData)
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
            .post(`api/v1/companies-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                mpesaList.value = response.data.results;
                store.commit('Mpesa_Integrations/LIST_ENDPOINTS', mpesaList.value)
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
            await store.dispatch('Mpesa_Integrations/updateState', {selectedCompany: null, isEditing: false});
            store.commit('pageTab/ADD_PAGE', {'SET':'Mpesa_Setup_Details'});
            store.state.pageTab.setActiveTab = 'Mpesa_Setup_Details';          
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const companyName = row['name'];
                const companyStatus = row['status'];
                let formData = {
                    company_name: companyName,
                    status: companyStatus
                }
                await store.dispatch('Mpesa_Integrations/fetchMpesaEndpoint',formData).
                then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'SET':'Mpesa_Setup_Details'})
                    store.state.pageTab.setActiveTab = 'Mpesa_Setup_Details';
                })
            }else if(action == 'delete'){
                const companyID = row['company_id'];
                let formData = {
                    company: companyID
                }
                await store.dispatch('Mpesa_Integrations/deleteMpesaEndpoint',formData).
                then(()=>{
                    searchSetups();
                })
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchSetups();
            
        })
        return{
            searchSetups,resetFilters, addButtonLabel, searchFilters, tableColumns, mpesaList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewEndpoint, showLoader, loader, hideLoader, removeEndpoint, removeEndpoints,
            handleSelectionChange,addingRight,rightsModule
        }
    }
};
</script>