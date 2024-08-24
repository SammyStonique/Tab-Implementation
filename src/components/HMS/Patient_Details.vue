<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="savePatient" @handleReset="handleReset">
                    <template v-slot:additional-content>
                        <div class="border border-slate-200 rounded relative py-3 mt-3 px-2">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Emergency Contact</h1>
                            <DynamicForm :fields="additionalFields" :flex_basis="additional_flex_basis" :flex_basis_percentage="additional_flex_basis_percentage" @handleReset="handleReset"/>
                        </div>
                    </template> 
                    <template v-slot:additional-content1>
                        <div class="border border-slate-200 rounded relative py-3 mt-3 px-2 flex" v-if="!isEditing">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Visit Details & Charges</h1>
                            <div class="basis-1/2 px-3">
                                <DynamicForm :fields="additional1Fields" :flex_basis="additional1_flex_basis" :flex_basis_percentage="additional1_flex_basis_percentage" @handleReset="handleReset"/>
                            </div>
                            <div class="basis-1/2 px-3">
                                <div class="text-left p-2">
                                    <SearchableDropdown 
                                        :key="componentKey"
                                        :options="feesArr"
                                        :dropdownWidth="feesDropdownWidth"
                                        :searchPlaceholder="feesSearchPlaceholder"
                                        @option-selected="handleSelectedFees"
                                        @clearSearch="feesClearSearch"
                                        @fetchData="fetchData"
                                    />
                                </div>                      
                                <DynamicTable :key="tableKey" :columns="columns" :rows="rows" :idField="idField" :actions="actions" @action-click="deleteFee" />
                            </div>
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
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import { useStore } from "vuex";
import { useDateFormatter } from '@/composables/DateFormatter';
import { useToast } from "vue-toastification";

export default defineComponent({
    name: 'Patient_Details',
    components:{
        PageStyleComponent, DynamicForm, DynamicTable, SearchableDropdown
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const mainComponentKey = ref(0);
        const componentKey = ref(0);
        const tableKey = ref(0);
        const doctComponentKey = ref(0);
        const errors = ref([]);
        const hospitalID = computed(()=> store.state.userData.company_id);
        const { formatDate } = useDateFormatter();
        const displayButtons = ref(true);
        const isEditing = computed(()=> store.state.Patients_List.isEditing);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const additional1_flex_basis = ref('');
        const additional1_flex_basis_percentage = ref('');
        const selectedPatient = computed(()=> store.state.Patients_List.selectedPatient);
        const country = ref('Kenya');
        const today_date = new Date();
        const visit_notes = ref('');
        const visit_status = ref('Arrived');
        const doctArray = computed(() => store.state.Doctors.doctArr);
        const doctorID = ref('');
        const txn_type = ref('INV');
        const journalEntryArr = ref([]);
        const invoice_description = ref([]);
        const invDescr = ref('');
        const invoice_totals = ref(0);
        const feesArr = computed({
            get: () => store.state.Medical_Fees.feesArr,
        });
        const feesDropdownWidth = ref('400px');
        const feesSearchPlaceholder = ref('Select Medical Fees');
        const feesID = computed({
            get: () => store.state.Medical_Fees.feesID,
        });
        const feesName = computed({
            get: () => store.state.Medical_Fees.feesName,
        });
        const columns = ref([
            {label: "Medical Fees", key:"fees_name", type: "text", editable: false},
            {label: "Amount", key:"fees_amount", type: "number", editable: true},
        ])
        const selectedFees = ref('');
        const rows = computed(() => store.state.Medical_Fees.feesArray);

        const idField = 'fees_id';
        const actions = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Delete Fee'},
        ])

        const formFields = ref([]);
        const updateFormFields = (patient) => {
            formFields.value = [
                { type: 'text', name: 'first_name',label: "First Name", value: patient?.first_name || '', required: true },
                { type: 'text', name: 'last_name',label: "Last Name", value: patient?.last_name || '', required: true },
                { type: 'text', name: 'phone_number',label: "Phone Number", value: patient?.phone_number || '', required: true, placeholder: '+2547XXX...' },
                { type: 'text', name: 'id_number',label: "ID Number", value: patient?.id_number || '', required: true },
                { type: 'text', name: 'email',label: "Email", value: patient?.email || '', required: true },
                { type: 'dropdown', name: 'gender',label: "Gender", value: patient?.gender || '', placeholder: "Select Gender", required: true, options: [{ text: 'Male', value: 'Male' }, { text: 'Female', value: 'Female' }, { text: 'Others', value: 'Others' }] },
                { type: 'date', name: 'birth_date',label: "Birth Date", value: patient?.birth_date || '', required: true },
                { type: 'dropdown', name: 'city',label: "City", value: patient?.city || '', placeholder: "Select City", required: true, options: [{ text: 'Nairobi', value: 'Nairobi' }, { text: 'Mombasa', value: 'Mombasa' }, { text: 'Kisumu', value: 'Kisumu' }, { text: 'Nakuru', value: 'Nakuru' }] },
                { type: 'text', name: 'country',label: "Country", value: patient?.country || 'Kenya', required: true },
                { type: 'text', name: 'address',label: "Address", value: patient?.address || '', required: true },
            ];
        };
        watch(selectedPatient, (newPatient) => {
            updateFormFields(newPatient);
        }, { immediate: true });

        const additionalFields = ref([]);
        const updateAdditionalFormFields = (patient) => {
            additionalFields.value = [
                {type:'text', label:"First Name", value: patient?.emergency_contact_person.first_name || '', required: true},
                {type:'text', label:"Last Name", value: patient?.emergency_contact_person.last_name || '', required: true},
                {type:'text', label:"Email", value: patient?.emergency_contact_person.email || '', required: true},
                {type:'text', label:"Phone No", value: patient?.emergency_contact_person.phone_number || '', required: true},
            ];
        };
        watch(selectedPatient, (newPatient) => {
            updateAdditionalFormFields(newPatient);
        }, { immediate: true });
        
        const fetchMedicalFees = () =>{
            let formData ={
                hospital_id : hospitalID.value,
                fees_name: ''
            }
            store.dispatch('Medical_Fees/fetchFees', formData)
        }
        const handleSelectedFees = (option) =>{
            store.dispatch('Medical_Fees/handleSelectedFees', option)
            .then(() => {
                componentKey.value += 1;
            });
        }
        const handleSelectedDoctor = (option) =>{
            store.dispatch('Doctors/handleSelectedDoctor', option)
            .then(() => {
                doctorID.value = store.state.Doctors.doctID;
            })
        }
        const deleteFee = (rowIndex, action, row) =>{
            store.dispatch('Medical_Fees/deleteFee', rowIndex);
        }
        const additional1Fields = ref([
            {  
                type:'search-dropdown', label:"Doctor To Visit", value: 'firstName', componentKey: doctComponentKey,
                selectOptions: doctArray, optionSelected: handleSelectedDoctor,
                searchPlaceholder: 'Select Doctor...', dropdownWidth: '380px',
                fetchData: store.dispatch('Doctors/fetchDoctors', {hospital:hospitalID.value})
            },
            {  
                type:'search-dropdown', label:"Staff To Visit", value: 'firstName',
                selectOptions: [], 
                searchPlaceholder: 'Select Staff...', dropdownWidth: '380px',
            },
            {type:'text-area', label:"Notes", value: visit_notes, textarea_rows: '4', textarea_cols: '50', required: true},
        ])
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            for(let i=0; i < additionalFields.value.length; i++){
                additionalFields.value[i].value = '';
            }
            for(let i=0; i < additional1Fields.value.length; i++){
                additional1Fields.value[i].value = '';
                doctComponentKey.value += 1;
            }
            tableKey.value += 1;
            store.dispatch('Medical_Fees/resetFees');
            let formData ={
                hospital_id : hospitalID.value,
                fees_name: ''
            }
            store.dispatch('Medical_Fees/fetchFees', formData);
            country.value = 'Kenya';
        }  
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createPatient = async() =>{
            showLoader();
            let formData = {
                hospital: hospitalID.value,
                contact_first_name: additionalFields.value[0].value,
                contact_last_name: additionalFields.value[1].value,
                contact_email: additionalFields.value[2].value,
                contact_phone_number: additionalFields.value[3].value,
                patient: formFields.value[0].value + " "+ formFields.value[1].value,
                first_name: formFields.value[0].value,
                last_name: formFields.value[1].value,
                phone_number: formFields.value[2].value,
                id_number: formFields.value[3].value,
                email: formFields.value[4].value,
                gender: formFields.value[5].value,
                birth_date: formFields.value[6].value,
                city: formFields.value[7].value,
                country: formFields.value[8].value,
                address: formFields.value[9].value,
                doctor: doctorID.value,
                staff: null,
                client: formFields.value[0].value + " "+ formFields.value[1].value,
                visit_notes: additional1Fields.value[2].value,
                visit_status: visit_status.value,
                issue_date: formatDate(today_date)
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value ==''){
                    errors.value.push('Error');
                }
            }
            for(let i=0; i < additionalFields.value.length; i++){
                if(additionalFields.value[i].value ==''){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }else if(!rows){            
                try {
                    const response = await store.dispatch('Patients_List/createPatient', formData);
                    if (response && response.status === 200) {
                        hideLoader();
                        toast.success('Patient created successfully!');
                        handleReset();
                        mainComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the patient.');
                        hideLoader();
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create patient: ' + error.message);
                } finally {
                    hideLoader();
                }
                
            }else{
                if(additional1Fields.value[2].value == '')   {
                    toast.error('Fill In Required Fields');
                }else{
                    for(let i=0; i < rows.value.length; i++){
                        invoice_totals.value += rows.value[i].fees_amount;
                        invoice_description.value.push(rows.value[i].fees_name);
                        let jnlEntry1 ={
                            "date": formatDate(today_date),
                            "description": rows.value[i].fees_name,
                            "txn_type": txn_type.value,
                            "posting_account": '',
                            "debit_amount": rows.value[i].fees_amount,
                            "credit_amount": 0,
                        }
                        let jnlEntry2 = {
                            "date": formatDate(today_date),
                            "description": rows.value[i].fees_name +" for "+formFields.value[0].value+" "+formFields.value[1].value,
                            "txn_type": txn_type.value,
                            "posting_account": rows.value[i].posting_account_id,
                            "debit_amount": 0,
                            "credit_amount": rows.value[i].fees_amount,
                        }
                    journalEntryArr.value.push(jnlEntry1,jnlEntry2);
                    console.log("THE JNLENTRY ARRAY IS ",journalEntryArr.value);
                    }  
                    if(invoice_description.value.length > 1){
                        for(let x=0; x < invoice_description.value.length; x++){
                            invDescr.value += (invoice_description.value[x]+", ")
                        }
                    }else{
                        invDescr.value += invoice_description.value[0];
                    }

                    formData['company'] = hospitalID.value;
                    formData['client'] = formFields.value[0].value+" "+formFields.value[1].value;
                    formData['description'] = invDescr.value;
                    formData['txn_type'] = txn_type.value;
                    formData['total_amount'] = invoice_totals.value;
                    formData['journal_entry_array'] = journalEntryArr.value;
                    try {
                        const response = await store.dispatch('Patients_List/createPatient', formData);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Patient created successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                        } else {
                            toast.error('An error occurred while creating the patient.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to create patient: ' + error.message);
                    } finally {
                        hideLoader();
                    }
                }         
                
            }
        }

        const updatePatient = async() => {
            showLoader();
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value ==''){
                    errors.value.push('Error');
                }
            }
            for(let i=0; i < additionalFields.value.length; i++){
                if(additionalFields.value[i].value ==''){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
                    hideLoader();
            }else{
                const updatedPatient = {
                    first_name: formFields.value[0].value,
                    last_name: formFields.value[1].value,
                    phone_number: formFields.value[2].value,
                    id_number: formFields.value[3].value,
                    email: formFields.value[4].value,
                    gender: formFields.value[5].value,
                    birth_date: formFields.value[6].value,
                    city: formFields.value[7].value,
                    country: formFields.value[8].value,
                    address: formFields.value[9].value,
                    emergency_contact_person: {
                        first_name: additionalFields.value[0].value,
                        last_name: additionalFields.value[1].value,
                        email: additionalFields.value[2].value,
                        phone_number: additionalFields.value[3].value,
                        patient: formFields.value[0].value + formFields.value[1].value
                    },
                    patient: selectedPatient.value.patient_id,
                    patient_code: selectedPatient.value.patient_code,
                    hospital: hospitalID.value
                };
                try {
                        const response = await store.dispatch('Patients_List/updatePatient', updatedPatient);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Patient updated successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                        } else {
                            toast.error('An error occurred while updating the patient.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to update patient: ' + error.message);
                    } finally {
                        hideLoader();
                    }
            }                    
        };

        const savePatient = () =>{
            if(isEditing.value == true){
                updatePatient();
            }else{
                createPatient();
            }
        }
        
        onBeforeMount(()=>{
            store.commit('Medical_Fees/initializeStore');
            fetchMedicalFees(); 
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
            additional_flex_basis.value = '1/3';
            additional_flex_basis_percentage.value = '33.333';
            additional1_flex_basis.value = '1/2';
            additional1_flex_basis_percentage.value = '50';
        })
        onMounted(()=>{
            
        })

        return{
            componentKey, formFields, additionalFields, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, displayButtons, columns, rows, idField, actions, feesArr,
            feesDropdownWidth, feesSearchPlaceholder, selectedFees, handleSelectedFees, feesID, feesName,
            additional1Fields, additional1_flex_basis, additional1_flex_basis_percentage, savePatient, mainComponentKey,
            handleReset, deleteFee, isEditing, loader, showLoader, hideLoader
        }
    }
})
</script>