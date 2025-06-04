<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewReservation"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchReservations"
            @resetFilters="resetFilters"
            @removeItem="removeReservation"
            @removeSelectedItems="removeReservations"
            @printList="printreservationsList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="reservationsList"
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
    name: 'Unit_Reservations',
    components:{
        PageComponent,MovableModal,SearchableDropdown,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const displayButtons = ref(true);
        const unitComponentKey = ref(0);
        const trans_modal_loader = ref('none');
        const product_status = ref('');
        const exit_date = ref('');
        const idField = 'unit_reservation_id';
        const addButtonLabel = ref('New Reservation');
        const addingRight = ref('Adding Unit Reservations');
        const removingRight = ref('Deleting Unit Reservations');
        const rightsModule = ref('PSS');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const reservationsList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const showDetails = ref(false);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const detailsTitle = ref('Approval');
        const transTitle = ref('Changing Product Status');
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
            {label: "Date", key:"date"},
            {label: "Asset Name", key:"asset"},
            {label: "Client Name", key: "client_name"},
            {label: "Phone No", key: "client_phone_number"},
            {label: "Email", key: "client_email"},
            {label: "ID No", key:"client_id_number"},
            {label: "Units", key:"reserved_units"},
            {label: "Days", key:"days_reserved"},
            {label: "Status", key:"status", textColor: "textColor"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Reservation', rightName: 'Editing Unit Reservations'},
            {name: 'convert', icon: 'fa fa-sign-in', title: 'Convert To Sale', rightName: 'Converting Unit Reservations'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Reservation', rightName: 'Deleting Unit Reservations'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const reservationID = ref("");
        const dropdownOptions = ref([
            
        ]);
        
        const asset_name_search = ref('');
        const client_name_search = ref('');
        const asset_code_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
 
        const searchFilters = ref([
            {type:'text', placeholder:"Client Name...", value: client_name_search, width:48,},
            {type:'text', placeholder:"Code...", value: asset_code_search, width:36,},
            {type:'text', placeholder:"Asset Name...", value: asset_name_search, width:48,},
            {type:'date', title: "From Date", placeholder:"From Date...", value: from_date_search, width:32,},
            {type:'date', title: "To Date",placeholder:"To Date...", value: to_date_search, width:32,},

        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const removeReservation = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    unit_reservation: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Unit_Reservations/deleteUnitReservation',formData)
                    if(response && response.status == 200){
                        toast.success("Reservation Removed Succesfully");
                        searchReservations();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Reservation: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Reservation") 
            }else{
                toast.error("Please Select A Reservation To Remove")
            }
        }
        const removeReservations = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    unit_reservation: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Unit_Reservations/deleteUnitReservation',formData)
                    if(response && response.status == 200){
                        toast.success("Reservation(s) Removed Succesfully");
                        searchPropertys();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Reservation: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Reservation To Remove")
            }
        };
        const showTransModalLoader = () =>{
            trans_modal_loader.value = "block";
        }
        const hideTransModalLoader = () =>{
            trans_modal_loader.value = "none";
        }
        const closeTransModal = () =>{
            transModalVisible.value = false;
            reservationID.value = null;
            hideTransModalLoader();
        };
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchReservations = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                client_name: client_name_search.value,
                asset_name: asset_name_search.value,
                asset_code: asset_code_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/unit-reservations-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                reservationsList.value = response.data.results;
                store.commit('Unit_Reservations/LIST_RESERVATIONS', reservationsList.value)
                propResults.value = response.data;
                propArrLen.value = reservationsList.value.length;
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
            searchReservations(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            asset_name_search.value = "";
            client_name_search.value = "";
            asset_code_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            searchReservations();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchReservations();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchReservations();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchReservations();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchReservations();
            // scrollToTop();
        }
        const addNewReservation = async() =>{
            store.commit('Unit_Reservations/initializeStore');
            await store.dispatch('Unit_Reservations/updateState', {selectedReservation: null,selectedAsset: null,selectedClient: null,isEditing: false});
            await store.dispatch('Asset_Units/updateState', {unitArray: []});
            store.commit('pageTab/ADD_PAGE', {'PSS':'Reservation_Details'});
            store.state.pageTab.pssActiveTab = 'Reservation_Details';          
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                await store.dispatch('Unit_Reservations/updateState', {selectedReservation: null,selectedAsset: null,selectedClient: null,isEditing: false});
                const reservationID = row[idField];
                const reservationStatus = row['status']
                if(reservationStatus != 'Sold'){
                    let formData = {
                        company: companyID.value,
                        unit_reservation: reservationID
                    }
                    await store.dispatch('Unit_Reservations/fetchUnitReservation',formData).
                    then(()=>{
                        store.commit('pageTab/ADD_PAGE', {'PSS':'Reservation_Details'})
                        store.state.pageTab.pssActiveTab = 'Reservation_Details';
                    })
                }else{
                    toast.error(`Cannot Edit ${reservationStatus} Reservation`);
                }
            }else if(action == 'delete'){
                const reservationID = [row[idField]];
                const reservationStatus = row['status']
                if(reservationStatus != 'Sold'){
                    let formData = {
                        company: companyID.value,
                        unit_reservation: reservationID
                    }
                    await store.dispatch('Unit_Reservations/deleteUnitReservation',formData).
                    then(()=>{
                        searchReservations();
                    })
                }else{
                    toast.error(`Cannot Delete ${reservationStatus} Reservation`);
                }
            }else if( action == 'convert'){
                const reservationStatus = row['status']
                if(reservationStatus == 'Active'){
                    await store.dispatch('Asset_Sales/updateState', {selectedSale: null,selectedReservation: null, selectedTransfer: null, selectedAgent: null, selectedPlan: null, selectedAsset: null, selectedClient: null,saleCharges:[],saleUnits:[],assetSchedules:[], isEditing:false});
                    const reservationID = row[idField];
                    let formData = {
                        company: companyID.value,
                        unit_reservation: reservationID
                    }
                    await store.dispatch('Asset_Sales/fetchUnitReservation',formData).
                    then(()=>{
                        store.commit('pageTab/ADD_PAGE', {'PSS':'Sale_Details'})
                        store.state.pageTab.pssActiveTab = 'Sale_Details';
                        
                    })
                }else{
                    toast.error(`Cannot Convert ${reservationStatus} Reservation To Sale`);
                }
            }
        };

        const handleDynamicOption = (option) =>{
            
        };
        
        const printreservationsList = () =>{
            showLoader();
            let formData = {
                product_name: asset_name_search.value,
                product_code: asset_code_search.value,
                active_status: active_status_search.value,
                company_id: companyID.value,
            } 

            axios
            .post("api/v1/export-unit-reservations-pdf/", formData, { responseType: 'blob' })
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
        onBeforeMount(()=>{
            searchReservations();
            
        })
        return{
            searchReservations,resetFilters, addButtonLabel, searchFilters, tableColumns, reservationsList,dropdownWidth,displayButtons,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,flex_basis,flex_basis_percentage,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,showDetails,detailsTitle,hideDetails,
            submitButtonLabel, showModal, addNewReservation, showLoader, loader, hideLoader, removeReservation, removeReservations,
            handleSelectionChange,addingRight,removingRight,rightsModule,printreservationsList,selectSearchQuantity,selectedValue,
            modal_left,modal_top,modal_width,trans_modal_loader,transModalVisible,transTitle,showTransModalLoader,hideTransModalLoader,closeTransModal,
            dropdownOptions,handleDynamicOption,product_status,exit_date
        }
    }
};
</script>