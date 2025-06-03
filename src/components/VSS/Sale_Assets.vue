<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewAsset"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchSaleAssets"
            @resetFilters="resetFilters"
            @importData="importMembers"
            @removeItem="removeSaleAsset"
            @removeSelectedItems="removeSaleAssets"
            @printList="printAssetsList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="assetsList"
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
            :showDetails="showDetails"
            :detailsTitle="detailsTitle"
            @hideDetails="hideDetails"
        />
    </div>
    <MovableModal v-model:visible="transModalVisible" :title="transTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="trans_modal_loader" @showLoader="showTransModalLoader" @hideLoader="hideTransModalLoader" @closeModal="closeTransModal">
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="approveAsset" @handleReset="handleReset"
        />
    </MovableModal>

</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';
import MovableModal from '@/components/MovableModal.vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import Swal from 'sweetalert2';

export default{
    name: 'Sale_Assets',
    components:{
        PageComponent,MovableModal,SearchableDropdown,DynamicForm
    },
    setup(){

        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const displayButtons = ref(true);
        const unitComponentKey = ref(0);
        const catSearchComponentKey = ref(0);
        const trans_modal_loader = ref('none');
        const member_status = ref('');
        const exit_date = ref('');
        const idField = 'sale_asset_id';
        const addButtonLabel = ref('New Asset');
        const addingRight = ref('Adding Sale Assets');
        const removingRight = ref('Deleting Sale Assets');
        const rightsModule = ref('PSS');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const assetsList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const showDetails = ref(false);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const detailsTitle = ref('Asset Documents');
        const transTitle = ref('Approve/Reject Asset');
        const transModalVisible = ref(false);
        const dropdownWidth = ref("500px")
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('45vw');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"asset_code"},
            {label: "Acq. Date", key:"start_date"},
            {label: "Vehicle Name", key:"name"},  
            {label: "Reg No", key: "registration_number"},
            {label: "Selling As", key:"selling_as"},
            {label: "Mileage", key:"mileage"},
            {label: "Fuel CC", key:"fuel_cc"},
            {label: "Color", key:"vehicle_color"},
            {label: "Condition", key:"vehicle_status"},
            {label: "Status", key:"approval_status", textColor: "textColor"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Asset', rightName: 'Editing Sale Assets'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Profile', rightName: 'Viewing Sale Assets'},
            {name: 'approve/reject', icon: 'fa fa-check-circle', title: 'Approve/Reject Asset', rightName: 'Approving Sale Assets'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Asset', rightName: 'Deleting Sale Assets'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const assetID = ref("");
        
        const name_search = ref('');
        const asset_code_search = ref("");
        const registration_number_search = ref("");
        const asset_type_search = ref("");
 
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:48,},
            {type:'text', placeholder:"Code...", value: asset_code_search, width:32,},
            {type:'text', placeholder:"Reg No...", value: registration_number_search, width:36,},
            {
                type:'dropdown', placeholder:"Type..", value: asset_type_search, width:24,
                options: [{text:'Land',value:'Land'},{text:'Building',value:'Building'}]
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const importMembers = () =>{
            
        };
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'dropdown', name: 'approval_status',label: "Status", value: '', placeholder: "", required: true, options: [{ text: 'Approve', value: 'Approved' }, { text: 'Reject', value: 'Rejected' }] },
            ]
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }

        const removeSaleAsset = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    sale_asset: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Sale_Assets/deleteSaleAsset',formData)
                    if(response && response.status == 200){
                        toast.success("Asset Removed Succesfully");
                        searchSaleAssets();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Asset: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Asset") 
            }else{
                toast.error("Please Select An Asset To Remove")
            }
        }
        const removeSaleAssets = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    sale_asset: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Sale_Assets/deleteSaleAsset',formData)
                    if(response && response.status == 200){
                        toast.success("Asset(s) Removed Succesfully");
                        searchPropertys();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Asset: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select An Asset To Remove")
            }
        };
        const showTransModalLoader = () =>{
            trans_modal_loader.value = "block";
        }
        const hideTransModalLoader = () =>{
            trans_modal_loader.value = "none";
        }
        const approveAsset = async() =>{
            showTransModalLoader();
            let formData = {
                sale_asset: assetID.value,
                approval_status: formFields.value[0].value,
                company: companyID.value
            }

            axios.post(`api/v1/approve-sale-asset/`,formData)
            .then((response)=>{
            if(response.data.msg == "Success"){
                hideTransModalLoader();
                closeTransModal();
                toast.success("Success")
                searchSaleAssets();
            }else{
                toast.error("Error");
                hideTransModalLoader();
            }                   
            })
            .catch((error)=>{
                console.log(error.message);
                toast.error(error.message);
                hideTransModalLoader();
            })
        };
        const closeTransModal = () =>{
            transModalVisible.value = false;
            assetID.value = null;
            hideTransModalLoader();
        };
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }

        const searchSaleAssets = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                name: name_search.value,
                asset_code: asset_code_search.value,
                registration_number: registration_number_search.value,
                asset_type: asset_type_search.value,
                agent_asset_ids: [],    
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/sale-assets-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                assetsList.value = response.data.results;
                store.commit('Sale_Assets/LIST_ASSETS', assetsList.value)
                propResults.value = response.data;
                propArrLen.value = assetsList.value.length;
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
            searchSaleAssets(selectedValue.value);
        };
        const resetFilters = () =>{
            catSearchComponentKey.value += 1;;
            selectedValue.value = 50;
            currentPage.value = 1;
            name_search.value = "";
            asset_type_search.value = "";
            registration_number_search.value = "";
            asset_code_search.value = "";
            searchSaleAssets();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchSaleAssets();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchSaleAssets();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchSaleAssets();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchSaleAssets();
            // scrollToTop();
        }
        const addNewAsset = async() =>{
            store.commit('Sale_Assets/initializeStore');
            await store.dispatch('Sale_Assets/updateState', {selectedAsset: null, selectedVendor: null,selectedMake: null,selectedModel: null,selectedCurrency: null,saleCharges:[],purchaseCharges:[],salePlans:[],isEditing: false});
            await store.dispatch('Asset_Fees/updateState', {feeArray: [], saleFeeArray: [],purchaseFeeArray: []})
            await store.dispatch('Payment_Plans/updateState', {salePlanArray: [],purchasePlanArray: []})
            store.commit('pageTab/ADD_PAGE', {'VSS':'Asset_Details'})
            store.state.pageTab.vssActiveTab = 'Asset_Details';
                         
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const assetStatus = row['approval_status']
                if(assetStatus == 'Pending'){
                    await store.dispatch('Sale_Assets/updateState', {selectedAsset: null, selectedVendor: null,selectedMake: null,selectedModel: null,selectedCurrency: null,saleCharges:[],purchaseCharges:[],salePlans:[],isEditing: false});
                    const assetID = row[idField];
                    let formData = {
                        company: companyID.value,
                        sale_asset: assetID
                    }
                    await store.dispatch('Sale_Assets/fetchSaleAsset',formData).
                    then(()=>{
                        store.commit('pageTab/ADD_PAGE', {'VSS':'Asset_Details'})
                        store.state.pageTab.vssActiveTab = 'Asset_Details';
                        
                    })
                }else{
                    toast.error(`Cannot Edit ${assetStatus} Asset`)
                }
            }else if(action == 'approve/reject'){
                const assetStatus = row['approval_status']
                if(assetStatus == 'Pending'){
                    updateFormFields();
                    assetID.value = row['sale_asset_id'];
                    transModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                }else{
                    toast.error(`Asset Already ${assetStatus}`)
                }
            }else if(action == 'delete'){
                const assetID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    sale_asset: assetID
                }
                await store.dispatch('Sale_Assets/deleteSaleAsset',formData).
                then(()=>{
                    searchSaleAssets();
                })
            }else if(action == 'view'){
                const assetStatus = row['approval_status']
                if(assetStatus != 'Pending'){
                    await store.dispatch('Sale_Assets/updateState', {selectedAsset: null, selectedVendor: null,selectedMake: null,selectedModel: null,selectedCurrency: null,saleCharges:[],purchaseCharges:[],salePlans:[],isEditing: false});
                    const assetID = row[idField];
                    let formData = {
                        company: companyID.value,
                        sale_asset: assetID
                    }
                    await store.dispatch('Sale_Assets/fetchSaleAsset',formData).
                    then(()=>{
                        store.commit('pageTab/ADD_PAGE', {'VSS':'Asset_Profile'})
                        store.state.pageTab.vssActiveTab = 'Asset_Profile';
                        
                    })
                }else{
                    toast.error(`Cannot View ${assetStatus} Asset`)
                }
            }else if(action == 'transfer'){
                hideTransModalLoader();
                assetID.value = row['member_id'];
                transModalVisible.value = true;
            }
        };
        const dropdownOptions = ref([
            
        ]);
        const handleDynamicOption = async(option) =>{
   
        };
        
        const printAssetsList = () =>{
            showLoader();
            let formData = {
                name: name_search.value,
                asset_code: asset_code_search.value,
                registration_number: registration_number_search.value,
                asset_type: asset_type_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 

            axios
            .post("api/v1/export-sale-assets-pdf/", formData, { responseType: 'blob' })
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
        const hideDetails = async() =>{
            showDetails.value = false;
        };
        const closeModal1 = async() =>{
            propModalVisible.value = false;
            handleReset1();
        }
        onBeforeMount(()=>{
            searchSaleAssets();
            
        })
        return{
            searchSaleAssets,resetFilters, addButtonLabel, searchFilters, tableColumns, assetsList,dropdownWidth,displayButtons,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,flex_basis,flex_basis_percentage,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,showDetails,detailsTitle,hideDetails,
            submitButtonLabel, showModal, addNewAsset, showLoader, loader, hideLoader, importMembers, removeSaleAsset, removeSaleAssets,
            handleSelectionChange,addingRight,removingRight,rightsModule,printAssetsList,selectSearchQuantity,selectedValue,
            modal_left,modal_top,modal_width,trans_modal_loader,formFields,transModalVisible,transTitle,showTransModalLoader,hideTransModalLoader,approveAsset,closeTransModal,
            handleReset,dropdownOptions,handleDynamicOption,member_status,exit_date,
        }
    }
};
</script>