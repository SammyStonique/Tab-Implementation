<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveUnitReservation" @handleReset="handleReset"> 
                    <template v-slot:additional-content>
                        <div class="border border-slate-200 rounded relative py-4 w-[50%] mt-3 px-2 min-h-[180px]">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Asset Units</h1>
                            <DynamicTable :key="tableKey" :columns="unitColumns" :rows="unitRows" :actions="actionUnits" @action-click="deleteUnit" :rightsModule="rightsModule" />
                        </div>
                    </template>
                </DynamicForm>
            </div>
            
        </template>
    </PageStyleComponent>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import DynamicTable from '@/components/DynamicTable.vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useDateFormatter } from '@/composables/DateFormatter';
import { useToast } from "vue-toastification";

export default defineComponent({
    name: 'Reservation_Details',
    components:{
        PageStyleComponent, DynamicForm,DynamicTable
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const tableKey = ref(0);
        const mainComponentKey = ref(0);
        const whlComponentKey = ref(0);
        const componentKey = ref(0);
        const catComponentKey = ref(0);
        const unitComponentKey = ref(0);
        const rightsModule = ref('PSS');
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const displayButtons = ref(true);
        const isEditing = computed(()=> store.state.Unit_Reservations.isEditing);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const selectedReservation = computed(()=> store.state.Unit_Reservations.selectedReservation);
        const selectedClient = computed(()=> store.state.Unit_Reservations.selectedClient);
        const selectedAsset = computed(()=> store.state.Unit_Reservations.selectedAsset);
        const reservedUnits = computed(()=> store.state.Unit_Reservations.reservedUnits);
        const assetArray = computed(() => store.state.Sale_Assets.assetArr);
        const units_array = computed(() => store.state.Asset_Units.unitArr);
        const assetID = ref('');
        const clientArray = computed(() => store.state.Asset_Clients.customerArr);
        const clientID = ref('');
        const actionUnits = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Unit', rightName: 'Adding Unit Reservations'},
        ])
        const unitColumns = ref([
            {label: "Unit Number", key:"unit_number", type: "text", editable: false},
            {label: "Selling Price", key:"unit_selling_price", type: "number", editable: true},
        ]);
        const unitRows = computed(() => {
            return store.state.Asset_Units.unitArray;
        });
        const deleteUnit = (rowIndex, action, row) =>{
            store.dispatch('Asset_Units/removeAssetUnit', rowIndex);
            tableKey.value += 1;
        };
        const fetchSaleAssets = (assetID) =>{
            store.dispatch('Sale_Assets/fetchSaleAssets', {company:companyID.value})
        };
        const handleSelectedAsset = async(option) =>{
            await store.dispatch('Sale_Assets/handleSelectedAsset', option)
            assetID.value = store.state.Sale_Assets.assetID;
            fetchAssetUnits(assetID.value);
            if(selectedReservation.value){
                selectedReservation.value.asset.sale_asset_id = assetID.value;
                assetValue.value = assetID.value;
                fetchAssetUnits(selectedReservation.value.asset.sale_asset_id );
            }
        };
        const clearSelectedAsset = async() =>{
            await store.dispatch('Sale_Assets/updateState', {assetID: ''});
            assetID.value = store.state.Sale_Assets.assetID;
        };
        const fetchSaleClients = (assetID) =>{
            store.dispatch('Asset_Clients/fetchAssetClients', {company:companyID.value})
        };
        const handleSelectedClient = async(option) =>{
            await store.dispatch('Asset_Clients/handleSelectedCustomer', option)
            clientID.value = store.state.Asset_Clients.customerID;
            formFields.value[3].value = store.state.Asset_Clients.customerName;
            formFields.value[4].value = store.state.Asset_Clients.customerPhoneNo;
            formFields.value[5].value = store.state.Asset_Clients.customerEmail;
            formFields.value[6].value = store.state.Asset_Clients.customerIdNo;
            if(selectedReservation.value && selectedClient.value){
                selectedReservation.value.customer.asset_client_id = clientID.value;
                clientValue.value = clientID.value
            }
        };
        const clearSelectedClient = async() =>{
            await store.dispatch('Asset_Clients/updateState', {customerID: ''});
            clientID.value = store.state.Asset_Clients.customerID;
        };
        const fetchAssetUnits = (assetID) =>{
            store.dispatch('Asset_Units/fetchAssetUnits', {company:companyID.value, asset: assetID, status: ["Available"]})
        };
        const handleSelectedUnit = async(option) =>{
            await store.dispatch('Asset_Units/handleSelectedUnit', option)
            unitComponentKey.value += 1;
        };
        const formFields = ref([]);
        const assetValue = computed(() => {
           return (selectedReservation.value && selectedReservation.value.asset && !assetID.value) ? selectedReservation.value.asset.sale_asset_id : assetID.value;

        });
        const clientValue = computed(() => {
            return (selectedReservation.value && selectedReservation.value.customer && !clientID.value) ? selectedReservation.value.customer.asset_client_id : clientID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Sale Asset", value: assetValue.value, componentKey: catComponentKey,
                    selectOptions: assetArray, optionSelected: handleSelectedAsset, required: true,
                    searchPlaceholder: 'Select Asset...', dropdownWidth: '450px', updateValue: selectedAsset.value,
                    clearSearch: clearSelectedAsset
                },
                {  
                    type:'search-dropdown', label:"Client", value: clientValue.value, componentKey: whlComponentKey,
                    selectOptions: clientArray, optionSelected: handleSelectedClient, required: false,
                    searchPlaceholder: 'Select Client...', dropdownWidth: '450px', updateValue: selectedClient.value,
                    clearSearch: clearSelectedClient
                },
                { type: 'date', name: 'date',label: "Date", value: selectedReservation.value?.date || '', required: true, placeholder: '' },
                { type: 'text', name: 'client_name',label: "Client Name", value: selectedReservation.value?.client_name || '', required: true },
                { type: 'text', name: 'client_phone_number',label: "Phone Number", value: selectedReservation.value?.client_phone_number || '', placeholder: "07XXXXXXXX", required: true },
                { type: 'text', name: 'client_email',label: "Email", value: selectedReservation.value?.client_email || '', required: true },
                { type: 'text', name: 'client_id_number',label: "ID Number", value: selectedReservation.value?.client_id_number || '', required: true },
                { type: 'number', name: 'days_reserved',label: "Reserved Days", value: selectedReservation.value?.days_reserved || 1, required: true },
                { type: 'number', name: 'reservation_fee',label: "Reservation Fees", value: selectedReservation.value?.reservation_fee || 0, required: false },
                { type: 'text-area', name: 'notes',label: "Notes", value: selectedReservation.value?.notes || '', textarea_rows: '3', textarea_cols: '56', required: false },
                {required: false},
                {required: false},
                {  
                    type:'search-dropdown', label:"Unit(s)", value: "", componentKey: unitComponentKey,
                    selectOptions: units_array, optionSelected: handleSelectedUnit, required: true,
                    searchPlaceholder: 'Select Unit...', dropdownWidth: '450px', updateValue: "",
                    
                },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].name == 'days_reserved'){
                    formFields.value[i].value = 1;
                }else if(formFields.value[i].name == 'reservation_fee'){
                    formFields.value[i].value = 0;
                }else{
                    formFields.value[i].value = '';
                }
                
            }
            assetID.value = '';
            clientID.value = '';
            catComponentKey.value += 1;
            unitComponentKey.value += 1;
            whlComponentKey.value += 1;
            mainComponentKey.value += 1;
            store.dispatch("Unit_Reservations/updateState", {selectedReservation: null, selectedAsset: null, selectedClient: null,isEditing: false,})
            store.dispatch("Asset_Units/updateState", {unitArray: []})
        }

        watch([selectedReservation, selectedAsset, selectedClient], () => {
            if (selectedReservation.value && selectedAsset.value && selectedClient.value) {
                whlComponentKey.value += 1;
                catComponentKey.value += 1;
                mainComponentKey.value += 1;
                updateFormFields();
                fetchAssetUnits(selectedReservation.value.asset.sale_asset_id)
                store.dispatch('Asset_Units/updateState', { unitArray: reservedUnits.value})
            }
            else if(selectedReservation.value && selectedAsset.value){
                catComponentKey.value += 1;
                mainComponentKey.value += 1;
                updateFormFields();
                fetchAssetUnits(selectedReservation.value.asset.sale_asset_id)
                store.dispatch('Asset_Units/updateState', { unitArray: reservedUnits.value})
            }
        }, { immediate: true });
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createUnitReservation = async() =>{
            showLoader();
            let formData = {
                company: companyID.value,
                date: formFields.value[2].value,
                days_reserved: formFields.value[7].value,
                reservation_fee: formFields.value[8].value,
                client_name: formFields.value[3].value,
                client_phone_number: formFields.value[4].value,
                client_email: formFields.value[5].value,
                client_id_number: formFields.value[6].value,
                notes: formFields.value[9].value,
                asset: assetID.value,
                asset_id: assetID.value,
                customer: clientID.value,
                customer_id: clientID.value,
                asset_units: unitRows.value,
            }

            errors.value = [];
            for(let i=2; i < (formFields.value.length); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(assetValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }
            else if(unitRows.value <= 0){
                toast.error('Please Select Units To Reserve');
                hideLoader();
            }else{            
                try {
                    const response = await store.dispatch('Unit_Reservations/createUnitReservation', formData);
                    if (response && response.status === 201) {
                        hideLoader();
                        toast.success('Reservation created successfully!');
                        handleReset();
                        mainComponentKey.value += 1;
                        catComponentKey.value += 1;
                        whlComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Reservation.');
                        hideLoader();
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Reservation: ' + error.message);
                } finally {
                    hideLoader();
                }              
            }
        }

        const updateUnitReservation = async() => {
            showLoader();
            errors.value = [];
            for(let i=2; i < (formFields.value.length); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(assetValue.value == '' ){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();
            }else if(unitRows.value <= 0){
                toast.error('Please Select Units To Reserve');
                hideLoader();
            }else{
                const updatedReservation = {
                    unit_reservation: selectedReservation.value.unit_reservation_id,
                    date: formFields.value[2].value,
                    days_reserved: formFields.value[7].value,
                    reservation_fee: formFields.value[8].value,
                    client_name: formFields.value[3].value,
                    client_phone_number: formFields.value[4].value,
                    client_email: formFields.value[5].value,
                    client_id_number: formFields.value[6].value,
                    notes: formFields.value[9].value,
                    asset: assetValue.value,
                    asset_id: assetValue.value,
                    customer: clientValue.value,
                    customer_id: clientValue.value,
                    asset_units: unitRows.value,
                    company: companyID.value,
                };
       
                try {
                        const response = await store.dispatch('Unit_Reservations/updateUnitReservation', updatedReservation);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Reservation updated successfully!');
                            handleReset();
                            await store.dispatch('Sale_Assets/updateState',{assetID:''})
                            await store.dispatch('Asset_Clients/updateState',{customerID:''})
                            await store.dispatch("Unit_Reservations/updateState",{selectedReservation:null,selectedAsset:null,selectedClient:null})
                            catComponentKey.value += 1;
                            whlComponentKey.value += 1;
                            mainComponentKey.value += 1;
                        } else {
                            toast.error('An error occurred while updating the Reservation.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to update Reservation: ' + error.message);
                    } finally {
                        hideLoader();
                    }
            }                    
        };

        const saveUnitReservation = () =>{
            if(isEditing.value == true){
                updateUnitReservation();
            }else{
                createUnitReservation();
            }
        }
        
        onBeforeMount(()=>{ 
            fetchSaleAssets();
            fetchSaleClients();
            updateFormFields();
            catComponentKey.value += 1;
            whlComponentKey.value += 1;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
        })
        onMounted(()=>{
            
        })

        return{
            componentKey, formFields, flex_basis, flex_basis_percentage,
            displayButtons, saveUnitReservation, mainComponentKey,
            handleReset, isEditing, loader, showLoader, hideLoader,
            tableKey,actionUnits,unitColumns,unitRows,deleteUnit,rightsModule
        }
    }
})
</script>