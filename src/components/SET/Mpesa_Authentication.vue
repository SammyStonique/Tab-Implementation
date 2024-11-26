<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewMpesaAuth"
        :searchFilters="searchFilters"
        @searchPage="searchMpesaAuths"
        @resetFilters="resetFilters"
        :addingRight="addingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="depList"
        :actions="actions"
        :idField="idField"
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
            :displayButtons="displayButtons" @handleSubmit="saveMpesaAuth" @handleReset="handleReset"
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
import Swal from 'sweetalert2';

export default{
    name: 'Mpesa_Integrations',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Mpesa Auth Details');
        const addButtonLabel = ref('New Mpesa Auth');
        const addingRight = ref('Payment Integrations');
        const rightsModule = ref('Settings');
        const idField = 'authentication_id';
        const depModalVisible = ref(false);
        const depList = ref([]);
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
        const isEditing = computed(()=> store.state.Mpesa_Integrations.isEditing)
        const selectedMpesa = computed(()=> store.state.Mpesa_Integrations.selectedMpesa);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Consumer Key", key:"consumer_key",type: "text", editable: false},
            {label: "Consumer Secret", key: "consumer_secret", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Mpesa Auth', rightName: 'Payment Integrations'},
            {name: 'test', icon: 'fa fa-check-circle', title: 'Test Get Access Token', rightName: 'Payment Integrations'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Mpesa Auth', rightName: 'Payment Integrations'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);

        const searchFilters = ref([
            
        ]);
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'consumer_key',label: "Consumer Key", value: selectedMpesa.value?.consumer_key || '', required: true },
                { type: 'text', name: 'consumer_secret',label: "Consumer Secret", value: selectedMpesa.value?.consumer_secret || '', required: true },
                { type: 'dropdown', name: 'environment',label: "Environment", value: selectedMpesa.value?.environment || '', placeholder: "", required: true, options: [{ text: 'Sandbox', value: 'sandbox' }, { text: 'Production', value: 'production' }] },
                {type:'text-area', label:"OAuth Url", value: selectedMpesa.value?.oauth || '', textarea_rows: '3', textarea_cols: '56', required: true},
            ];
        };
        watch([selectedMpesa], () => {
            if(selectedMpesa.value){
                updateFormFields();
            }
        }, { immediate: true });
        const addNewMpesaAuth = () =>{
            updateFormFields();
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Mpesa_Integrations/updateState",{isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        };
        const testAuthentication = async(formData) =>{
            await axios.post("api/v1/test-get-access-token/", formData)
            .then((response)=>{
                Swal.fire("Access Token Is ",response.data.access_token, {
                    icon: "success",
                });
                
            })
            .catch((error)=>{
                console.log(error.message);
                toast.error(error.message);
            })
        };
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const mpesaID = row[idField];
                let formData = {
                    company: companyID.value,
                    authentication: mpesaID
                }
                await store.dispatch('Mpesa_Integrations/fetchMpesaAuthentication',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const mpesaID = row[idField];
                let formData = {
                    company: companyID.value,
                    authentication: mpesaID
                }
                await store.dispatch('Mpesa_Integrations/deleteMpesaAuthentication',formData).
                then(()=>{
                    searchMpesaAuths();
                })
            }else if(action == 'test'){
                const mpesaID = row[idField];
                let formData = {
                    company: companyID.value,
                    authentication: mpesaID
                }
                await testAuthentication(formData);
            }
        } 
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createMpesaAuth = async() =>{
            showModalLoader();
            let formData = {
                consumer_key: formFields.value[0].value,
                consumer_secret: formFields.value[1].value,
                oauth: formFields.value[3].value, 
                environment: formFields.value[2].value,
                company: companyID.value
            }
            errors.value = [];
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
                    const response = await store.dispatch('Mpesa_Integrations/createMpesaAuthentication', formData);
                    if(response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Mpesa Authentication created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Mpesa Authentication.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Mpesa Authentication: ' + error.message);
                } finally {
                    hideModalLoader();
                }
            }

        }
        const updateMpesaAuth = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                consumer_key: formFields.value[0].value,
                consumer_secret: formFields.value[1].value,
                oauth: formFields.value[3].value, 
                environment: formFields.value[2].value,
                company: companyID.value,
                authentication: selectedMpesa.value.authentication_id
            }
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
            }else{
                try {
                    const response = await store.dispatch('Mpesa_Integrations/updateMpesaAuthentication', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Mpesa Authentication updated successfully!");
                        handleReset();
                        searchMpesaAuths();
                    } else {
                        toast.error('An error occurred while updating the Mpesa Authentication.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Mpesa Authentication: ' + error.message);
                } finally {
                    hideModalLoader();
                }
            }
        }
        const saveMpesaAuth = () =>{
            if(isEditing.value == true){
                updateMpesaAuth();
            }else{
                createMpesaAuth();
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchMpesaAuths = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                company: companyID.value
            }
            axios
            .post(`api/v1/mpesa-authentication-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                depList.value = response.data.results;
                store.commit('Mpesa_Integrations/LIST_MPESA', depList.value)
                depResults.value = response.data;
                depArrLen.value = depList.value.length;
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
            
            searchMpesaAuths();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchMpesaAuths();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchMpesaAuths();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchMpesaAuths();
        }
        const resetFilters = () =>{
            store.commit('Mpesa_Integrations/RESET_SEARCH_FILTERS')
            searchMpesaAuths();
        }
        const closeModal = async() =>{
            await store.dispatch("Mpesa_Integrations/updateState",{isEditing:false, selectedMpesa:null})
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchMpesaAuths();
        })
        return{
            title,idField, searchMpesaAuths, addButtonLabel, searchFilters, resetFilters, tableColumns, depList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewMpesaAuth,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveMpesaAuth,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,addingRight,rightsModule,closeModal
        }
    }
}
</script>