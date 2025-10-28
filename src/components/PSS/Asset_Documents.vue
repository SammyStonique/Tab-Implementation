<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewDocument"
        :searchFilters="searchFilters"
        @searchPage="searchDocuments"
        @resetFilters="resetFilters"
        @removeItem="removeDocument"
        @removeSelectedItems="removeDocuments"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        v-model:printModalVisible="printModalVisible"
        :printTitle="printTitle"
        :pdfUrl="pdfUrl"
        :columns="tableColumns"
        :rows="documentsList"
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
        :selectedValue="selectedValue"
        @selectSearchQuantity="selectSearchQuantity"
    />
    <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader"  @closeModal="closeModal">
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="createAssetDocument" @handleReset="handleReset" @file-changed="handleFileChange"
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
import PrintJS from 'print-js';

export default{
    name: 'Asset_Documents',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const memComponentKey = ref(0);
        const prodComponentKey = ref(0);
        const title = ref('Document Details');
        const addButtonLabel = ref('New Document');
        const addingRight = ref('Adding Sale Documents');
        const removingRight = ref('Deleting Sale Documents');
        const rightsModule = ref('PSS');
        const idField = 'asset_document_id';
        const depModalVisible = ref(false);
        const printModalVisible = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Asset Document');
        const documentsList = ref([]);
        const selectedIds = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
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
        const upload_file = ref('');
        const filePath = ref('');
        const computedFilePath = ref('');
        const isEditing = computed(()=> store.state.Asset_Documents.isEditing)
        const selectedDocument = computed(()=> store.state.Asset_Documents.selectedDocument);
        const selectedAsset = computed(()=> store.state.Asset_Documents.selectedAsset);
        const assetArray = computed(() => store.state.Sale_Assets.assetArr);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key: "asset_code", type: "text", editable: false},
            {label: "Asset Name", key: "asset_name", type: "text", editable: false},
            {label: "Document Name", key: "document_name", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'preview', icon: 'fa fa-paperclip', title: 'View Document', rightName: 'Adding Sale Documents'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Document', rightName: 'Deleting Sale Documents'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const assetID = ref('');
        const asset_code_search = ref('');
        const asset_name_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Asset Code...", value: asset_code_search, width:40,},
            {type:'text', placeholder:"Search Name...", value: asset_name_search, width:48,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedAsset = async(option) =>{
            await store.dispatch('Sale_Assets/handleSelectedAsset', option)
            assetID.value = store.state.Sale_Assets.assetID;
        };
        const clearSelectedAsset = async() =>{
            await store.dispatch('Sale_Assets/updateState', {assetID: ''});
            assetID.value = store.state.Sale_Assets.assetID;
        };
        const formFields = ref([]);

        const assetValue = computed(() => {
            return (selectedDocument.value && selectedDocument.value.sale_asset && !assetID.value) ? selectedDocument.value.sale_asset.sale_asset_id : assetID.value;
        });
        const handleFileChange = (fileData) => {
            filePath.value = fileData.filePath;
            upload_file.value = fileData.file;

        };
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Asset", value: assetValue.value, componentKey: prodComponentKey,
                    selectOptions: assetArray, optionSelected: handleSelectedAsset, required: true,
                    searchPlaceholder: 'Select Asset...', dropdownWidth: '500px', updateValue: selectedAsset.value,
                    fetchData: store.dispatch('Sale_Assets/fetchSaleAssets', {company:companyID.value}), clearSearch: clearSelectedAsset
                },
                { type: 'text', name: 'document_name',label: "Name", value: selectedDocument.value?.document_name || '', required: true },
                { type: 'file', name: 'file-input',label: "Attachment", value: '', filePath: computedFilePath.value, required: false, placeholder: "", accepted_formats: "*/*", method: handleFileChange}
            ];
        };
        watch([selectedDocument, selectedDocument, selectedAsset], () => {
            if (selectedDocument.value && selectedDocument.value && selectedAsset.value) {
                memComponentKey.value += 1;
                prodComponentKey.value += 1;
                updateFormFields();
            }
            else{
                updateFormFields();
            }
        }, { immediate: true });
        const addNewDocument = () =>{
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Asset_Documents/updateState",{selectedDocument:null, selectedAsset:null,isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        };
        const previewDocument = (formData) =>{
            showLoader();
            axios
            .post("api/v1/preview-asset-attachment-pdf/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const blob1 = new Blob([response.data], { type: 'application/pdf' });
                        const url = URL.createObjectURL(blob1);
                        // PrintJS({printable: url, type: 'pdf'});
                        pdfUrl.value = url;
                        printModalVisible.value = true;
                    }
                })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'preview'){
                const docID = row['asset_document_id'];
                let formData = {
                    asset_document: docID,
                    company: companyID.value
                } 
                previewDocument(formData);
                
            }else if(action == 'delete'){
                const accountID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    asset_document: accountID
                }
                await store.dispatch('Asset_Documents/deleteAssetDocument',formData).
                then(()=>{
                    searchDocuments();
                })
            }
        } 
        const handleReset = () =>{
            store.dispatch("Asset_Documents/updateState",{selectedDocument:null, selectedAsset:null,isEditing:false})
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            assetID.value = "";
            prodComponentKey.value += 1;
            memComponentKey.value += 1;

        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createAssetDocument = async() =>{
            showModalLoader();
            let formData = new FormData();
            formData.append('document_name', formFields.value[1].value);
            formData.append('document_file', upload_file.value);
            formData.append('asset', assetID.value);
            formData.append('asset_id', assetID.value);
            formData.append('company', companyID.value);

            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type !='search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(assetValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Asset_Documents/createAssetDocument', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Document created successfully!');
                        handleReset();
                        memComponentKey.value += 1;
                        prodComponentKey.value += 1;
                    }else {
                        toast.error('An error occurred while creating the Document.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Document: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchDocuments();
                }
            }

        };
        const removeDocument = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    asset_document: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Asset_Documents/deleteAssetDocument',formData)
                    if(response && response.status == 200){
                        toast.success("Document Removed Succesfully");
                        searchDocuments();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Document: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Document") 
            }else{
                toast.error("Please Select A Document To Remove")
            }
        }
        const removeDocuments = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    asset_document: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Asset_Documents/deleteAssetDocument',formData)
                    if(response && response.status == 200){
                        toast.success("Document(s) Removed Succesfully");
                        searchDocuments();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Document(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Document To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchDocuments = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                asset_code: asset_code_search.value,
                asset_name: asset_name_search.value,
                company_id: companyID.value,
                agent_asset_ids: [],
                page_size: selectedValue.value
            }
            axios
            .post(`api/v1/asset-attachments-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                documentsList.value = response.data.results;
                store.commit('Asset_Documents/LIST_ASSET_DOCUMENTS', documentsList.value)
                depResults.value = response.data;
                depArrLen.value = documentsList.value.length;
                depCount.value = depResults.value.count;
                pageCount.value = Math.ceil(depCount.value / selectedValue.value);
                
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
        };
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchDocuments(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchDocuments();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchDocuments();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchDocuments();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchDocuments();
        }
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            asset_name_search.value = "";
            asset_code_search.value = "";
            client_code_search.value = "";
            searchDocuments();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchDocuments();
        })
        return{
            title,idField, searchDocuments, addButtonLabel, searchFilters, resetFilters, tableColumns, documentsList,
            currentPage,depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewDocument,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, createAssetDocument,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeDocument, removeDocuments,
            addingRight,removingRight,rightsModule, closeModal,selectSearchQuantity,selectedValue,handleSelectionChange,
            handleFileChange,printModalVisible,pdfUrl, printTitle,
        }
    }
}
</script>