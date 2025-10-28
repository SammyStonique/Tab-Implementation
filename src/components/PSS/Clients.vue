<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewDebtor"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchAssetClients"
            @resetFilters="resetFilters"
            @importData="importDebtors"
            @removeItem="removeDebtor"
            @removeSelectedItems="removeDebtors"
            @printList="printCustomersList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="debtorList"
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
                :displayButtons="displayButtons" @handleSubmit="saveDebtor" @handleReset="handleReset"
            />
        </MovableModal>
        <MovableModal v-model:visible="transModalVisible" :title="title1" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader1" @showLoader="showModalLoader1" @hideLoader="hideModalLoader1"  @closeModal="closeModal1">
            <div class="px-3">
                <div class="text-left mb-4">
                    <label for="">Message:</label><br />
                    <!-- <quill-editor :key="editorComponentKey" v-model:value="messageContent"></quill-editor> -->
                    <div class="flex">
                        <div class="basis-1/2 mb-4 mr-3">
                            <select v-model="selectedPlaceholder" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-1 w-full">
                                <option value="" disabled>Select Placeholder</option>
                                <option v-for="placeholder in clientPlaceholders" :key="placeholder.value" :value="placeholder.value">
                                    {{ placeholder.label }}
                                </option>
                            </select>
                        </div>
                        <button @click="insertPlaceholder" :disabled="!selectedPlaceholder" class="w-24 h-8 rounded bg-green-400 text-sm mr-2  text-white px-2 py-0.5">Insert</button>
                    </div>
                    <textarea v-model="contentModel" ref="textareaRef" rows="8" cols="64" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2" placeholder="Type your content here..."></textarea>
                </div>
                <button @click="sendClientSMS" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Send SMS</button>
            </div>
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
import { quillEditor } from 'vue3-quill';
import { useTextareaEditor } from '@/composables/TextAreaEditor';

export default{
    name: 'Clients',
    components:{
        PageComponent, MovableModal,DynamicForm,quillEditor
    },
    setup(){
        const { contentModel,textareaRef,clientPlaceholders,selectedPlaceholder,insertPlaceholder,} = useTextareaEditor('');
        const messageContent = ref('');
        const modal_loader1 = ref('none');
        const title1 = ref('SMS Member');
        const transModalVisible = ref(false);
        const currComponentKey = ref(0);
        const clientID = ref('');
        const currencyID = ref('');
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'asset_sale_client_id';
        const addButtonLabel = ref('New Client');
        const title = ref('Client Details');
        const addingRight = ref('Adding Client');
        const removingRight = ref('Deleting Client');
        const rightsModule = ref('PSS');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const debtorList = ref([]);
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
        const isEditing = computed(()=> store.state.Asset_Clients.isEditing);
        const selectedCustomer = computed(()=> store.state.Asset_Clients.selectedCustomer);
        const selectedCurrency = computed(()=> store.state.Asset_Clients.selectedCurrency);
        const currencyArray = computed(() => store.state.Currencies.currencyArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"client_code"},
            {label: "Name", key:"client_name"},
            {label: "Email", key: "email"},
            {label: "ID No", key:"pin_no"},
            {label: "Phone No", key:"phone_number"},
            {label: "Address", key:"invoicing_address"},
            {label: "Town", key:"town"},
            {label: "Country", key:"country"},
            {label: "Currency", key:"currency"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Client', rightName: 'Editing Client'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Client', rightName: 'Deleting Client'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        
        const client_code_search = ref("");
        const client_name_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Code...", value: client_code_search, width:40,},
            {type:'text', placeholder:"Name...", value: client_name_search, width:48,},

        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedCurrency = async(option) =>{
            await store.dispatch('Currencies/handleSelectedCurrency', option)
            currencyID.value = store.state.Currencies.currencyID;
            if(selectedCustomer.value && selectedCurrency.value){
                selectedCustomer.value.client_currency.currency_id = currencyID.value;
            }
        }
        const clearSelectedCurrency = async() =>{
            await store.dispatch('Currencies/updateState', {currencyID: ''});
            currencyID.value = store.state.Currencies.currencyID;
            if(selectedCustomer.value && selectedCurrency.value){
                selectedCustomer.value.client_currency.currency_id = currencyID.value;
            }
        }

        const fetchCurrencies = async() =>{
            await store.dispatch('Currencies/fetchCurrencies', {company:companyID.value})
        };
        const currencyValue = computed(() => {
           return (selectedCustomer.value && selectedCustomer.value.client_currency && !currencyID.value) ? selectedCustomer.value.client_currency.currency_id : currencyID.value;
        });
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'client_name',label: "Name", value: selectedCustomer.value?.client_name || '', required: true },
                { type: 'text', name: 'phone_number',label: "Phone Number", value: selectedCustomer.value?.phone_number || '', required: true },
                { type: 'text', name: 'email',label: "Email", value: selectedCustomer.value?.email || '', required: true },
                { type: 'text', name: 'pin_no',label: "ID No", value: selectedCustomer.value?.pin_no || '', required: true },
                { type: 'text', name: 'invoicing_address',label: "Address", value: selectedCustomer.value?.invoicing_address || '', required: true },
                { type: 'text', name: 'town',label: "Town", value: selectedCustomer.value?.town || '', required: false },
                { type: 'text', name: 'country',label: "Country", value: selectedCustomer.value?.country || '', required: false },
                {  
                    type:'search-dropdown', label:"Currency", value: currencyValue.value, componentKey: currComponentKey,
                    selectOptions: currencyArray, optionSelected: handleSelectedCurrency, required: false,
                    searchPlaceholder: 'Select Currency...', dropdownWidth: '500px', updateValue: selectedCurrency.value,
                    clearSearch: clearSelectedCurrency
                },
                {required: false}
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }

        watch([selectedCustomer, selectedCurrency], () => {
            if (selectedCustomer.value && selectedCurrency.value) {
                updateFormFields();
                currComponentKey.value += 1;
            }
            else if (selectedCustomer.value) {
                updateFormFields();
          
            }
            
        }, { immediate: true });
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createCustomer = async() =>{
            showModalLoader();
            let formData = {
                client_name: formFields.value[0].value,
                client_code: null,
                town: formFields.value[5].value,
                country: formFields.value[6].value,
                email: formFields.value[2].value,
                phone_number: formFields.value[1].value,
                pin_no: formFields.value[3].value,
                invoicing_address: formFields.value[4].value,
                client_currency: currencyID.value,
                client_currency_id: currencyID.value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Asset_Clients/createAssetClient', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Client created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the Client.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Client: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchAssetClients();
                }
            }
        }
        const updateCustomer = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                asset_sale_client: selectedCustomer.value.asset_sale_client_id,
                client_code: selectedCustomer.value.client_code,
                client_name: formFields.value[0].value,
                town: formFields.value[5].value,
                country: formFields.value[6].value,
                email: formFields.value[2].value,
                phone_number: formFields.value[1].value,
                pin_no: formFields.value[3].value,
                invoicing_address: formFields.value[4].value,
                client_currency: currencyValue.value,
                client_currency_id: currencyValue.value,
                company: companyID.value
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Asset_Clients/updateAssetClient', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Client updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Client.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Client: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    await store.dispatch("Asset_Clients/updateState",{selectedCustomer:null,selectedCurrency:null})
                    searchAssetClients();
                }             
            }
        }
        const saveDebtor = () =>{
            if(isEditing.value == true){
                updateCustomer();
            }else{
                createCustomer();
            }
        }
        const importDebtors = () =>{
           
        }
        const removeDebtor = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    asset_sale_client: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Asset_Clients/deleteAssetClient',formData)
                    if(response && response.status == 200){
                        toast.success("Client Removed Succesfully");
                        searchAssetClients();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Client: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Client") 
            }else{
                toast.error("Please Select A Client To Remove")
            }
        }
        const removeDebtors = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    asset_sale_client: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Asset_Clients/deleteAssetClient',formData)
                    if(response && response.status == 200){
                        toast.success("Client(s) Removed Succesfully");
                        searchAssetClients();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Client: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Client To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchAssetClients = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                client_name: client_name_search.value,
                client_code: client_code_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/asset-sale-clients-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                debtorList.value = response.data.results;
                store.commit('Asset_Clients/LIST_CUSTOMERS', debtorList.value)
                propResults.value = response.data;
                propArrLen.value = debtorList.value.length;
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
            searchAssetClients(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            client_code_search.value = "";
            client_name_search.value = "";
            searchAssetClients();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchAssetClients();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchAssetClients();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchAssetClients();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchAssetClients();
            // scrollToTop();
        }
        const addNewDebtor = () =>{
            updateFormFields();
            store.dispatch("Asset_Clients/updateState",{selectedCustomer:null,selectedCurrency:null, isEditing:false})
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
                    asset_sale_client: clientID
                }
                await store.dispatch('Asset_Clients/fetchAssetClient',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const clientID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    asset_sale_client: clientID
                }
                await store.dispatch('Asset_Clients/deleteAssetClient',formData).
                then(()=>{
                    searchAssetClients();
                })
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printCustomersList = () =>{
            showLoader();

            let formData = {
                client_name: client_name_search.value,
                client_code: client_code_search.value,
                company_id: companyID.value
            }
            axios
            .post("api/v1/export-asset-sale-clients-pdf/", formData, { responseType: 'blob' })
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
        };
        const showModalLoader1 = () =>{
            modal_loader1.value = "block";
        }
        const hideModalLoader1 = () =>{
            modal_loader1.value = "none";
        }
        const handleReset1 = () =>{
            contentModel.value = "";
            clientID.value = "";
        }
        const sendClientSMS = async() =>{
            if(clientID.value && contentModel.value){
                showModalLoader1();
                let formData = {
                    content: contentModel.value,
                    client: clientID.value,
                    company: companyID.value
                }
                await axios.post('api/v1/member-general-sms/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("SMS Sent!")
                        closeModal1();
                        searchAssetClients();
                    }else{
                        toast.error(response.data.msg)
                    }
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideModalLoader1();
                })
            }else if(clientID.value == ""){
                toast.error("No Client Selected!!")
            }else if(contentModel.value == ""){
                toast.error("Cannot Send Blank SMS!!")
            }
            
        };
        const dropdownOptions = ref([
            {label: 'SMS Selected Client', action: 'send-sms', rightName: 'Sending PSS SMS'},
        ]);
        const handleDynamicOption = async(option) =>{
            if(option == 'send-sms'){
                clientID.value = selectedIds.value;
                transModalVisible.value = true;
                
            }else if(option == 'send-email'){
                showLoader();
                const clientID = [];
                let formData = {
                    member: clientID,
                    company: companyID.value
                }
                await axios.post('api/v1/member-general-email/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Email Sent!")
                    }else{
                        toast.error(response.data.msg)
                    }
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideLoader();
                })
            }
        };
        const closeModal1 = async() =>{
            transModalVisible.value = false;
            handleReset1();
        }
        onBeforeMount(()=>{
            searchAssetClients();
            fetchCurrencies();
        })
        return{
            title, searchAssetClients,resetFilters, addButtonLabel, searchFilters, tableColumns, debtorList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,dropdownOptions,handleDynamicOption,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewDebtor, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveDebtor, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            importDebtors, removeDebtor, removeDebtors, handleReset,printCustomersList,addingRight,removingRight,rightsModule,selectSearchQuantity,selectedValue,
            messageContent,modal_loader1,title1,showModalLoader1,hideModalLoader1,sendClientSMS,transModalVisible,
            closeModal1,contentModel,textareaRef,clientPlaceholders,selectedPlaceholder,insertPlaceholder,
        }
    }
};
</script>