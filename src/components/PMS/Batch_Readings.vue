<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <div class="flex h-16">
                    <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" @handleReset="handleReset" /> 
                    <button @click="fetchTenantReadings" class="rounded bg-green-400 text-sm h-8 w-24 mt-2 text-white px-1.5 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Load</button>
                </div>
                <div>
                    <p class="text-gray-400">The Prev Date Format Is "YYYY-MM-DD"</p>
                </div>
                <div class="min-h-[480px]">
                    <DynamicTable :key="tableKey" :columns="readingColumns" :rows="readingRows" :showActions="showActions" :idField="idField" :actions="actions" />
                </div>
                <div class="flex-1 basis-full px-2 mt-6">
                    <button @click="createBatchReading" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Save</button>
                    <button @click="handleReset" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-refresh text-xs mr-1.5" aria-hidden="true"></i>Reset</button>
                </div>
            </div>
        </template>
    </PageStyleComponent>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import DynamicTable from '../DynamicTable.vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default defineComponent({
    name: 'Batch_Readings',
    components:{
        PageStyleComponent, DynamicForm, DynamicTable
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const mainComponentKey = ref(0);
        const tableKey = ref(0);
        const propComponentKey = ref(0);
        const setupComponentKey = ref(0);
        const current_date = ref('');
        const units_cost = ref(0);
        const meter_rent = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const propertyArray = computed(() => store.state.Properties_List.propertyArr);
        const propertyID = ref('');
        const setupArray = computed(() => store.state.Meter_Setup.setupArr);
        const setupID = ref('');
        const readingRows = computed(() => store.state.Meter_Readings.tenantReadings);
        const idField = ref('');
        const showActions = ref(false);
        const readingColumns = ref([
            {type: "checkbox"},
            {label: "Tenant Name", key:"tenant_name", type: "text", editable: false},
            {label: "Unit No", key:"unit_number", type: "text", editable: false},
            {label: "Prev Date", key: "prev_reading_date", type: "text", editable: true},
            {label: "Prev Read.", key: "prev_reading", type: "text", editable: true},
            {label: "Curr Read.", key: "current_reading", type: "text", editable: true},
            {label: "Cost", key: "unit_cost", type: "text", editable: false},
            {label: "M. Rent", key: "meter_rent", type: "text", editable: false},
            {label: "Units", key: "units_consumed", type: "text", editable: false},
            {label: "Total", key: "total", type: "text", editable: false},
        ])

        const actions = ref([
            {}
        ])

        const fetchProperties = async() =>{
            await store.dispatch('Properties_List/fetchProperties', {company:companyID.value})
        };
        const handleSelectedProperty = async(option) =>{
            await store.dispatch('Properties_List/handleSelectedProperty', option)
            propertyID.value = store.state.Properties_List.propertyID;
        }
        const clearSelectedProperty = async() =>{
            await store.dispatch('Properties_List/updateState', {propertyID: ''});
            propertyID.value = ""
        }
        const fetchSetups = async() =>{
            if(propertyID.value){
                await store.dispatch('Meter_Setup/fetchSetups', {company:companyID.value, property: propertyID.value})
            }       
        };
        const fetchTenantReadings = async() =>{
            if(propertyID.value && setupID.value){
                await store.dispatch('Meter_Readings/fetchTenantReadings', {company:companyID.value, property: propertyID.value, meter_costing:setupID.value})
            }       
        };
        const handleSelectedSetup = async(option) =>{
            await store.dispatch('Meter_Setup/handleSelectedSetup', option)
            setupID.value = store.state.Meter_Setup.setupID;
            units_cost.value = store.state.Meter_Setup.unitCost;
            meter_rent.value = store.state.Meter_Setup.meterRent;
        };
        const clearSelectedSetup = async() =>{
            await store.dispatch('Meter_Setup/updateState', {setupID: ''});
            setupID.value = ""
        }
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Property", value: propertyID.value, componentKey: propComponentKey,
                    selectOptions: propertyArray, optionSelected: handleSelectedProperty, required: true,
                    searchPlaceholder: 'Select Property...', dropdownWidth: '330px', updateValue: "",
                    fetchData: fetchProperties(), clearSearch: clearSelectedProperty() 
                },
                {  
                    type:'search-dropdown', label:"Costing Setup", value: setupID.value, componentKey: setupComponentKey,
                    selectOptions: setupArray, optionSelected: handleSelectedSetup, required: true,
                    searchPlaceholder: 'Select Setup...', dropdownWidth: '330px', updateValue: "",
                    fetchData: fetchSetups(), clearSearch: clearSelectedSetup()
                },
                { type: 'date', name: 'reading_date',label: "Curr Date", value: "", required: true },    
                
            ];
        };
        const handleReset = async() =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            propertyID.value = '';
            setupID.value = '';
            propComponentKey.value += 1;
            setupComponentKey.value += 1;
            await store.dispatch('Meter_Readings/updateState',{tenantReadings: []})
        }
        watch([propertyID, setupID], () => {
            if (propertyID.value && !setupID.value) {
                setupComponentKey.value += 1;
                fetchSetups();
            }
            
        }, { immediate: true });
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createBatchReading = async() =>{
            showLoader();
            let formData = {
                company: companyID.value,
                meter_costing: setupID.value,
                current_reading_date: formFields.value[2].value,
                meter_readings: readingRows.value,
            }

            errors.value = [];
            const tableValidation = []
            for(let i=2; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            for(let i=0; i<readingRows.value.length; i++){
                if(parseFloat(readingRows.value[i].total) < 0){
                    tableValidation.push('Invalid Total');
                }else if(parseFloat(readingRows.value[i].current_reading) < parseFloat(readingRows.value[i].prev_reading)){
                    tableValidation.push('Invalid Total');
                }
            }
  
            if(propertyID.value == '' || setupID.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }else if(tableValidation.length){
                toast.error('Invalid Reading');
                hideLoader();
            }else{            
                try {
                    const response = await store.dispatch('Meter_Readings/createBatchMeterReading', formData);
                    if (response && response.status === 200) {
                        hideLoader();
                        toast.success('Meter Readings created successfully!');
                        handleReset();
                        mainComponentKey.value += 1;
                        propComponentKey.value += 1;
                        setupComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the readings.');
                        hideLoader();
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create readings: ' + error.message);
                } finally {
                    hideLoader();
                }              
            }
        }
        
        onBeforeMount(()=>{ 
            updateFormFields();
            propComponentKey.value += 1;
            setupComponentKey.value += 1;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
        })
        onMounted(()=>{
            readingRows.value = [];
        })

        return{
            tableKey, formFields, flex_basis, flex_basis_percentage, createBatchReading, mainComponentKey, actions,
            handleReset, loader, showLoader, hideLoader, readingColumns, readingRows, idField, fetchTenantReadings,
            showActions
        }
    }
})
</script>