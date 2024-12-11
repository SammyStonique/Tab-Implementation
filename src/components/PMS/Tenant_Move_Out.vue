<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :showAddButton="showAddButton"
            :searchFilters="searchFilters"
            @searchPage="searchTenants"
            @resetFilters="resetFilters"
            @removeItem="removeItem"
            @removeSelectedItems="removeItem"
            @printList="printTenantsList"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="tenantList"
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
    </div>
    <MovableModal v-model:visible="transModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="trans_modal_loader" @showLoader="showTransModalLoader" @hideLoader="hideTransModalLoader" @closeModal="closeTransModal">
        <div class="relative mb-6 mt-3 min-w-[500px]">
            <SearchableDropdown
                :key="unitComponentKey"
                :options="chargesArr"
                :dropdownWidth="dropdownWidth"
                @option-selected="handleSelectedExitCharge"
                @clearSearch="clearSelectedExitCharge"   
                @fetchData="fetchExitCharges"                              
            />
        </div>
        <div class="min-h-[200px]">
            <DynamicTable :key="tableCompKey" :columns="chargesColumns" :rows="chargesRows" :idField="chargeIdField" @selection-changed="selectionChargeChanged" :rightsModule="rightsModule" :actions="chargeActions" @action-click="handleExitChargeActions" />
        </div>
        <div class="flex-1 basis-full px-2" v-if="billedStatus == false">
            <button @click="billMoveOutCharges" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Bill Charges</button>
        </div>
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { Store, useStore } from "vuex";
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';
import MovableModal from '@/components/MovableModal.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import DynamicTable from '../DynamicTable.vue';
import Swal from 'sweetalert2';

export default{
    name: 'Tenant_Move_Out',
    components:{
        PageComponent,MovableModal,SearchableDropdown,DynamicTable
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const tableCompKey = ref(0);
        const unitComponentKey = ref(0);
        const trans_modal_loader = ref('none');
        const idField = 'tenant_moveout_id';
        const chargeIdField = 'company_id';
        const showAddButton = ref(false);
        const rightsModule = ref('PMS');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const selectedCharges = ref([]);
        const tenantList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const title = ref('Bill Move Out Charges');
        const chargesArr = computed(() => store.state.Exit_Charges.chargeArr);
        const transModalVisible = ref(false);
        const dropdownWidth = ref("320px")
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('70vw');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Term. Date", key:"termination_date"},
            {label: "Code", key:"tenant_code"},
            {label: "Tenant Name", key:"tenant_name"},
            {label: "Phone Number", key: "phone_number"},
            {label: "Property Name", key:"property_name"},
            {label: "Unit", key:"unit_number"},
            {label: "Deposit", key:"formatted_deposit_held"},
            {label: "Arrears", key:"outstanding_balance"},
            {label: "Charges", key:"exit_charges"},
            {label: "Net Refund", key:"net_refund"},
            {label: "Claim.", key:"deposit_claim_status"},
            {label: "Ref.", key:"refund_status"},
        ])
        const actions = ref([
            {name: 'bill-charges', icon: 'fa fa-file-pdf-o', title: 'Add Charges', rightName: 'Tenant Move Out'},
            {name: 'utilize-deposit', icon: 'fa fa-credit-card', title: 'Utilize Deposit', rightName: 'Tenant Move Out'},
            {name: 'tenant-refund', icon: 'fa fa-hand-holding-usd', title: 'Refund Tenant', rightName: 'Tenant Move Out'},
        ]);
        const chargesColumns = ref([
            {type: "checkbox"},
            {label: "Charge Name", key:"name",type: "text", editable: false},
            {label: "Amount", key:"value",type: "number", editable: true},
        ]);
        const chargeActions = ref([
            {name: 'add-charge', icon: 'fa fa-check', title: 'Add Charge', rightName: 'Tenant Move Out'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Charge', rightName: 'Tenant Move Out'},
        ]);
        const chargesRows = computed(()=> store.state.Exit_Charges.exitChargesArray);
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const propertyID = ref(null);
        const chargeID = ref(null);
        const chargeName = ref(null);
        const tenantID = ref(null);
        const tenantMoveOutID = ref(null);
        const billedStatus = ref(false);
        const name_search = ref('');
        const tenant_code_search = ref('');
        const unit_number_search = ref('');
        const phone_number_search = ref('');
        const properties_array = computed({
            get: () => store.state.Properties_List.propertyArr,
        });
        const handleSelectedProperty = async(option) =>{
            await store.dispatch('Properties_List/handleSelectedProperty', option)
            propertyID.value = store.state.Properties_List.propertyID;
        };
        const clearSelectedProperty = async() =>{
            await store.dispatch('Properties_List/updateState', {propertyID: ''});
            propertyID.value = store.state.Properties_List.propertyID;
        }
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:48,},
            {type:'text', placeholder:"Code...", value: tenant_code_search, width:48,},
            {
                type:'search-dropdown', value: properties_array, width:48,
                selectOptions: properties_array, optionSelected: handleSelectedProperty,
                searchPlaceholder: 'Property...', dropdownWidth: '300px',
                fetchData: store.dispatch('Properties_List/fetchProperties', {company:companyID.value}),
                clearSearch: clearSelectedProperty
            },
            {type:'text', placeholder:"Unit No...", value: unit_number_search, width:48,},
            {type:'text', placeholder:"Phone No...", value: phone_number_search, width:48,},
        ]);
        const fetchExitCharges = async(propertyID) =>{
            await store.dispatch('Exit_Charges/fetchExitCharges', {company:companyID.value});
        };
        const handleSelectedExitCharge = async(option) =>{
            await store.dispatch('Exit_Charges/handleSelectedExitCharge', option)
            chargeID.value = store.state.Exit_Charges.chargeID;
            chargeName.value = store.state.Exit_Charges.chargeName;
            unitComponentKey.value += 1;
        };
        const clearSelectedExitCharge = async() =>{
            await store.dispatch('Exit_Charges/updateState', {chargeID: '', chargeName: ""});
            chargeID.value = "";
            chargeName.value = "";
        }
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const selectionChargeChanged = (ids) => {
            selectedCharges.value = ids;
        };
        const showTransModalLoader = () =>{
            trans_modal_loader.value = "block";
        }
        const hideTransModalLoader = () =>{
            trans_modal_loader.value = "none";
        };
        const fetchTenantCharges = async(tenantID) =>{
            let formData = {
                tenant: tenantID,
                company: companyID.value
            }
            axios.post("api/v1/custom-exit-charges-search/", formData)
            .then((response)=>{
                for(let i=0; i < response.data.charges.length; i++){
                    if(response.data.charges[i].billed == "Yes"){
                        billedStatus.value = true;
                    }
                }
                store.dispatch('Exit_Charges/updateState', {exitChargesArray: response.data.charges})
            })
            .catch((error)=>{
                console.log(error.message)
            })
        };
        const billMoveOutCharges = async() =>{
            let totalCharges = 0;
            for(let i=0; i < chargesRows.value.length; i++){
                totalCharges += parseFloat(chargesRows.value[i].value)
            }
            let formData = {
                tenant: tenantID.value,
                move_out: tenantMoveOutID.value,
                exit_charges: chargesRows.value,
                total_amount: totalCharges,
                company: companyID.value
            }
            axios.post('api/v1/bill-move-out-charges/', formData)
            .then((response)=>{
                if(response.data.msg == "Success"){
                    toast.success("Succesfully Billed Exit Charges")
                    closeTransModal();
                    searchTenants();
                }else{
                    toast.error("Error Billing Charges")
                }
            })
            .catch((error)=>{
                toast.error(error.message)
            })
        };
 
        const handleExitChargeActions = (rowIndex, action, row) =>{
            if(action == "add-charge"){
                let formData = {
                    tenant: tenantMoveOutID.value,
                    tenant_id: tenantMoveOutID.value,
                    exit_charge: row['exit_charge_id'],
                    exit_charge_id: row['exit_charge_id'],
                    amount: row['value'],
                    company: companyID.value
                }
                if(row['value'] > 0 && !row['tenant_exit_charge_id']){
                    axios.post("api/v1/create-tenant-exit-charge/", formData)
                    .then((response)=>{
                        if(response.status === 200){
                            toast.success("Exit Charge Added Succesfully")
                            unitComponentKey.value += 1;
                            fetchTenantCharges(tenantID.value);
                        }
                        else{
                            toast.error("Error Adding Charge") 
                            unitComponentKey.value += 1;
                        }
                        
                    })
                    .catch((error)=>{
                        console.log(error.message);
                        toast.error(error.message) 
                    })
                }else if(row['tenant_exit_charge_id']){
                    toast.error("Charge Already Added")
                }
                else{
                    toast.error("Invalid Charge Amount")
                }
                
            }else if(action == "delete"){
                Swal.fire({
                title: "Are you sure?",
                text: `Do you wish to Remove Charge?`,
                type: 'warning',
                showCloseButton: true,
                showCancelButton: true,
                confirmButtonText: 'Yes Remove Charge!',
                cancelButtonText: 'Cancel!',
                customClass: {
                    confirmButton: 'swal2-confirm-custom',
                    cancelButton: 'swal2-cancel-custom',
                },
                showLoaderOnConfirm: true,
                }).then((result) => {
                if (result.value) {
                    let formData ={
                        company: companyID.value,
                        tenant_exit_charge: [row['tenant_exit_charge_id']]
                    }
                    axios.post(`api/v1/delete-tenant-exit-charge/`,formData)
                    .then((response)=>{
                        if(response.data.msg == "Success"){
                            Swal.fire("Charge Removed succesfully!", {
                                icon: "success",
                            }); 
                            fetchTenantCharges(tenantID.value); 
                            selectedCharges.value = [];
                        }else{
                            Swal.fire({
                                title: "Error Removing Charge",
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
                    Swal.fire(`Charge Not Removed!`);
                }
                })
            }
        };
        const closeTransModal = () =>{
            store.dispatch('Exit_Charges/updateState', {exitChargesArray: []})
            transModalVisible.value = false;
            tenantID.value = null;
            tenantMoveOutID.value = null;
            hideTransModalLoader();
        };
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchTenants = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                tenant_name: name_search.value,
                tenant_code: tenant_code_search.value,
                property: propertyID.value,
                phone_number: phone_number_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/tenant-move-out-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                tenantList.value = response.data.results;
                // store.commit('Terminated_Leases/LIST_TENANTS', tenantList.value)
                propResults.value = response.data;
                propArrLen.value = tenantList.value.length;
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
            searchTenants(selectedValue.value);
        };
        const resetFilters = () =>{
            name_search.value = "";
            tenant_code_search.value = "";
            phone_number_search.value = "";
            searchTenants();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchTenants();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchTenants();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchTenants();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchTenants();
            // scrollToTop();
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'bill-charges'){
                store.dispatch('Exit_Charges/updateState', {exitChargesArray: []})
                transModalVisible.value = true;
                tenantMoveOutID.value = row['tenant_moveout_id'];
                tenantID.value = row['tenant_lease_id'];
                await fetchTenantCharges(tenantID.value)
            }else if( action == 'utilize-deposit'){
                const outstBal = row['outstanding_balance'];
                const exitCharges = row['exit_charges'];
                const depHeld = row['deposit_held'];
                const netRefund = row['net_refund'];
                const depClaim = row['deposit_claim_status'];

                if(depClaim == "Yes"){
                    toast.error("Deposit Already Claimed")
                }else{
                    if(outstBal == 0 && exitCharges == 0){
                        toast.error("Tenant Has No Outstanding Charge")
                    }else{
                        let formData = {
                            tenant: row['tenant_id'],
                            amount: depHeld,
                            tenant_code: row['tenant_code'],
                            user: userID.value,
                            company: companyID.value
                        }
                        Swal.fire({
                            title: "Are you sure?",
                            text: `Do you wish to Utilize Deposit?`,
                            type: 'warning',
                            showCloseButton: true,
                            showCancelButton: true,
                            confirmButtonText: 'Yes Utilize Deposit!',
                            cancelButtonText: 'Cancel!',
                            customClass: {
                                confirmButton: 'swal2-confirm-custom',
                                cancelButton: 'swal2-cancel-custom',
                            },
                            showLoaderOnConfirm: true,
                            }).then((result) => {
                            if (result.value) {
                                axios.post(`api/v1/utilize-tenant-deposit/`,formData)
                                .then((response)=>{
                                    if(response.data.msg == "Success"){
                                        Swal.fire("Success!", {
                                            icon: "success",
                                        }); 
                                        searchTenants();
                                    }else{
                                        Swal.fire({
                                            title: "Error Utilizing Deposit",
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
                                Swal.fire(`Deposit has not been utilized!`);
                            }
                        })
                    }
                }
                

            }else if( action == 'tenant-refund'){

            }
        }
        
        const printTenantsList = () =>{
            showLoader();
            let formData = {
                tenant_name: name_search.value,
                tenant_code: tenant_code_search.value,
                unit_number: unit_number_search.value,
                property: propertyID.value,
                phone_number: phone_number_search.value,
                company_id: companyID.value
            } 

            axios
            .post("api/v1/export-tenant-leases-pdf/", formData, { responseType: 'blob' })
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
            searchTenants();
            
        })
        return{
            searchTenants,resetFilters, searchFilters, tableColumns, tenantList,dropdownWidth,showAddButton,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,
            submitButtonLabel, showModal, showLoader, loader, hideLoader,
            handleSelectionChange,rightsModule,printTenantsList,selectSearchQuantity,selectedValue,
            modal_left,modal_top,modal_width,trans_modal_loader,transModalVisible,title,showTransModalLoader,hideTransModalLoader,closeTransModal,
            fetchExitCharges, handleSelectedExitCharge, clearSelectedExitCharge,chargesArr,unitComponentKey,chargesColumns,chargeActions,chargesRows,
            chargeIdField,selectionChargeChanged,handleExitChargeActions,tableCompKey,billMoveOutCharges,billedStatus
        }
    }
};
</script>