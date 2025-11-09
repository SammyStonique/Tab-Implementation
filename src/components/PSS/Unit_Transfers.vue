<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewTransfer"
            :searchFilters="searchFilters"
            @searchPage="searchUnitTransfers"
            @resetFilters="resetFilters"
            @removeItem="removeTransfer"
            @removeSelectedItems="removeTransfers"
            @printList="printtransfersList"
            @printExcel="downloadGroupsExcel"
            @printCSV="downloadGroupsCSV"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="transfersList"
            :actions="actions"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            :groupingKey=true
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
                :displayButtons="displayButtons" @handleSubmit="approveTransfer" @handleReset="handleReset"
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
import Swal from 'sweetalert2';

export default{
    name: 'Unit_Transfers',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const ledComponentKey = ref(0);
        const idField = 'asset_unit_transfer_id';
        const addButtonLabel = ref('New Unit Transfer');
        const addingRight = ref('Adding Asset Unit Transfers');
        const removingRight = ref('Deleting Asset Unit Transfers');
        const rightsModule = ref('PSS');
        const title = ref('Asset Unit Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const transfersList = ref([]);
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
        const modal_top = ref('300px');
        const modal_left = ref('500px');
        const modal_width = ref('30vw');
        const transferID = ref('');
        const ledgerID = ref('');
        const ledgerArr = computed(()=> store.state.Ledgers.ledgerArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Client", key:"sale_client"},
            {label: "From Unit#", key: "unit_number"},
            {label: "Transfer Asset", key: "transfer_asset"},
            {label: "To Unit#", key: "new_unit_number"},
            {label: "Transfer Amnt", key: "formatted_amount"},
            {label: "Done By", key:"done_by"},
            {label: "Status", key:"approval_status", textColor:"textColor"},
            {label: "Approved By", key:"approved_by"},
            {label: "Journal#", key:"journal_no"},
        ])
        const actions = ref([
            {name: 'approve/reject', icon: 'fa fa-check-circle', title: 'Approve/Reject Transfer', rightName: 'Approving Asset Unit Transfers'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Transfer', rightName: 'Deleting Asset Unit Transfers'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const client_code_search = ref('');
        const client_name_search = ref("");
        const approval_status_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Client Code...", value: client_code_search, width:36,},
            {type:'text', placeholder:"Client Name...", value: client_name_search, width:56,},
            {type:'date', title: "From Date", placeholder:"From Date...", value: from_date_search, width:32,},
            {type:'date', title: "To Date",placeholder:"To Date...", value: to_date_search, width:32,},
            {
                type:'dropdown', placeholder:"Status..", value: approval_status_search, width:32,
                options: [{text:'Pending',value:'Pending'},{text:'Approved',value:'Approved'},{text:'Rejected',value:'Rejected'}]
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const removeTransfer = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    asset_unit_transfer: selectedIds.value
                }
                Swal.fire({
                    title: "Are you sure?",
                    text: `Do you wish to delete Transfer?`,
                    type: 'warning',
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Yes Delete Transfer!',
                    cancelButtonText: 'Cancel!',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom',
                    },
                    showLoaderOnConfirm: true,
                }).then((result) => {
                    if (result.value) {
                    axios.post(`api/v1/delete-asset-unit-transfer/`,formData)
                    .then((response)=>{
                        if(response.data.msg == "Success"){
                            Swal.fire("Poof! Transfer removed succesfully!", {
                                icon: "success",
                            }); 
                            searchUnitTransfers();
                        }else{
                        Swal.fire({
                            title: "Error Deleting Transfer",
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
                        Swal.fire(`Transfer has not been deleted!`);
                    }
                })
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Transfer") 
            }else{
                toast.error("Please Select A Transfer To Remove")
            }
        }
        const removeTransfers = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    asset_unit_transfer: selectedIds.value
                }
                Swal.fire({
                    title: "Are you sure?",
                    text: `Do you wish to delete Transfer?`,
                    type: 'warning',
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Yes Delete Transfer!',
                    cancelButtonText: 'Cancel!',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom',
                    },
                    showLoaderOnConfirm: true,
                }).then((result) => {
                    if (result.value) {
                    axios.post(`api/v1/delete-asset-unit-transfer/`,formData)
                    .then((response)=>{
                        if(response.data.msg == "Success"){
                            Swal.fire("Poof! Transfer removed succesfully!", {
                                icon: "success",
                            }); 
                            searchUnitTransfers();
                        }else{
                        Swal.fire({
                            title: "Error Deleting Transfer",
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
                        Swal.fire(`Transfer has not been deleted!`);
                    }
                })
            }else{
                toast.error("Please Select A Transfer To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchUnitTransfers = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                client_name: client_name_search.value,
                client_code: client_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                approval_status: approval_status_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/asset-unit-transfers-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                transfersList.value = response.data.results;
                propResults.value = response.data;
                propArrLen.value = transfersList.value.length;
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
            searchUnitTransfers(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            client_code_search.value = "";
            client_name_search.value = "";
            approval_status_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            searchUnitTransfers();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchUnitTransfers();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchUnitTransfers();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchUnitTransfers();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchUnitTransfers();
        }
        const addNewTransfer = async() =>{
            await store.dispatch('Asset_Fees/updateState', {saleFeeArray: []})
            await store.dispatch("Asset_Units/updateState", {unitArray: [], itemArr: []})
            await store.dispatch("Payment_Plans/updateState", {salePlanArray: []})
            await store.dispatch("Asset_Sales/updateState", {assetSchedules: []})
            store.commit('pageTab/ADD_PAGE', {'PSS':'Unit_Transfer_Details'});
            store.state.pageTab.pssActiveTab = 'Unit_Transfer_Details';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const transferID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    asset_unit_transfer: transferID
                }
                Swal.fire({
                    title: "Are you sure?",
                    text: `Do you wish to delete Transfer?`,
                    type: 'warning',
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Yes Delete Transfer!',
                    cancelButtonText: 'Cancel!',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom',
                    },
                    showLoaderOnConfirm: true,
                }).then((result) => {
                    if (result.value) {
                    axios.post(`api/v1/delete-asset-unit-transfer/`,formData)
                    .then((response)=>{
                        if(response.data.msg == "Success"){
                            Swal.fire("Poof! Transfer removed succesfully!", {
                                icon: "success",
                            }); 
                            searchUnitTransfers();
                        }else{
                        Swal.fire({
                            title: "Error Deleting Transfer",
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
                        Swal.fire(`Transfer has not been deleted!`);
                    }
                })
            }else if(action == 'approve/reject'){
                transferID.value = row[idField];
                updateFormFields();
                propModalVisible.value = true;
                ledComponentKey.value += 1;
                await fetchAllLedgers();
            }
        };
        const fetchAllLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            ledgerID.value = store.state.Ledgers.ledgerID;
        };
        const clearSelectedLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            ledgerID.value = ""
        };
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'dropdown', name: 'approval_status',label: "Status", value: '', placeholder: "", required: true, options: [{ text: 'Approve', value: 'Approved' }, { text: 'Reject', value: 'Rejected' }] },
                { type: 'date', name: 'approval_date', label: "Approval Date", value: '', placeholder: "Approval Date...", required: true },
                {  
                    type:'search-dropdown', label:"Posting Account", value: ledgerID.value, componentKey: ledComponentKey,
                    selectOptions: ledgerArr, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Posting Account...', dropdownWidth: '550px', updateValue: "",
                    clearSearch: clearSelectedLedger
                },
            ]
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            transferID.value = '';
            ledgerID.value = '';
            ledComponentKey.value += 1;
        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        };
        const approveTransfer = async() =>{
            showModalLoader();
            let formData = {
                asset_unit_transfer: transferID.value,
                ledger: ledgerID.value,
                approval_status: formFields.value[0].value,
                approval_date: formFields.value[1].value,
                user: userID.value,
                company: companyID.value
            }

            axios.post(`api/v1/approve-asset-unit-transfer/`,formData)
            .then((response)=>{
            if(response.data.msg == "Success"){
                hideModalLoader();
                closeModal();
                handleReset();
                toast.success("Success")
                searchUnitTransfers();
            }else{
                toast.error("Error");
                hideModalLoader();
            }                   
            })
            .catch((error)=>{
                toast.error(error.message);
                hideModalLoader();
            })
        };
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printtransfersList = () =>{

        };
        const downloadGroupsExcel = () =>{

        };
        const downloadGroupsCSV = () =>{

        };
        onBeforeMount(()=>{
            searchUnitTransfers();
            
        })
        return{
            title, searchUnitTransfers,resetFilters, addButtonLabel, searchFilters, tableColumns, transfersList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,approveTransfer,handleReset,
            submitButtonLabel, showModal, addNewTransfer, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeTransfer, removeTransfers,addingRight,removingRight,rightsModule,printtransfersList,selectSearchQuantity,selectedValue,
            downloadGroupsCSV,downloadGroupsExcel
        }
    }
};
</script>