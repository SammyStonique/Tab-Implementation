<template>
    <PageStyleComponent :key="mainComponentKey">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="createPatient" @handleReset="handleReset">
                    <template v-slot:additional-content>
                        <div class="border border-slate-200 rounded relative py-3 mt-3 px-2">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Emergency Contact</h1>
                            <DynamicForm :fields="additionalFields" :flex_basis="additional_flex_basis" :flex_basis_percentage="additional_flex_basis_percentage" @handleReset="handleReset"/>
                        </div>
                    </template> 
                    <template v-slot:additional-content1>
                        <div class="border border-slate-200 rounded relative py-3 mt-3 px-2 flex">
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
                                <DynamicTable :columns="columns" :rows="rows" :idField="idField" :actions="actions" @action-click="handleActionClick" />
                            </div>
                        </div>
                    </template>
                </DynamicForm>
            </div>
        </template>
    </PageStyleComponent>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed } from 'vue';
import DynamicForm from '../NewDynamicForm.vue';
import DynamicTable from '../DynamicTable.vue';
import PageStyleComponent from '../PageStyleComponent.vue';
import SearchableDropdown from '../SearchableDropdown.vue';
import { useStore } from "vuex";
import { useDateFormatter } from '@/composables/DateFormatter';

export default defineComponent({
    components:{
        PageStyleComponent, DynamicForm, DynamicTable, SearchableDropdown
    },
    setup(){
        const mainComponentKey = ref(0);
        const componentKey = ref(0);
        const doctComponentKey = ref(0);
        const store = useStore();
        const hospitalID = ref('9e14bcef-d3c1-400c-a8c0-66d7b25cc5ff');
        const { formatDate } = useDateFormatter();
        const displayButtons = ref(true);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const additional1_flex_basis = ref('');
        const additional1_flex_basis_percentage = ref('');
        const first_name = ref('');
        const last_name = ref('');
        const phone_number = ref('');
        const gender = ref('');
        const email = ref('');
        const birth_date = ref('');
        const id_number = ref('');
        const city = ref('');
        const address = ref('');
        const country = ref('Kenya');
        const contact_person_first_name = ref('');
        const contact_person_last_name = ref('');
        const contact_person_email = ref('');
        const contact_person_phone_number = ref('');
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
            {label: "Medical Fees", key:"fees_name"},
            {label: "Amount", key:"fees_amount"},
        ])
        const selectedFees = ref('');
        const rows = computed(() => store.state.Medical_Fees.feesArray);

        const idField = 'fees_id';
        const actions = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Delete Fee'},
        ])

        const formFields = ref([
            {type:'text', label:"First Name", value: first_name, required: true},
            {type:'text', label:"Last Name", value: last_name, required: true},
            {type:'text', label:"Phone No", value: phone_number, required: true},
            {type:'text', label:"ID No", value: id_number, required: true},
            {type:'text', label:"Email", value: email, required: true},
            {
                type:'dropdown', label:"Gender", value: gender, placeholder:"Select Gender", required: true,
                options: [{text:'Male',value:'Male'},{text:'Female',value:'Female'},{text:'Others',value:'Others'}]
            },
            {type:'date', label:"Date Of Birth", value: birth_date, required: true},
            {
                type:'dropdown', label:"City", value: city, birth_date, placeholder:"Select City", required: true,
                options: [{text:'Nairobi',value:'Nairobi'},{text:'Mombasa',value:'Mombasa'},{text:'Kisumu',value:'Kisumu'},{text:'Nakuru',value:'Nakuru'}]
            },
            {type:'text', label:"Country", value: country, required: true},
            {type:'text', label:"Address", value: address, required: true},
        
        ])
        const additionalFields = ref([
            {type:'text', label:"First Name", value: contact_person_first_name, required: true},
            {type:'text', label:"Last Name", value: contact_person_last_name, required: true},
            {type:'text', label:"Email", value: contact_person_email, required: true},
            {type:'text', label:"Phone No", value: contact_person_phone_number, required: true},
        ])
        
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
                console.log("THE ROW ARRAY IS ", rows.value.length);
                componentKey.value += 1;
            });

        }
        const handleSelectedDoctor = (option) =>{
            console.log("THE OPTION IS ", option);
            store.dispatch('Doctors/handleSelectedDoctor', option)
            .then(() => {
                doctorID.value = store.state.Doctors.doctID;
                console.log("THE DOCTOR ID IS ", doctorID.value);
            })
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
            store.dispatch('Medical_Fees/resetFees');
            country.value = 'Kenya';
        }   
        const createPatient = () =>{
            let formData = {
                hospital: hospitalID.value,
                contact_first_name: contact_person_first_name.value,
                contact_last_name: contact_person_last_name.value,
                contact_email: contact_person_email.value,
                contact_phone_number: contact_person_phone_number.value,
                patient: first_name.value + " "+ last_name.value,
                first_name: first_name.value,
                last_name: last_name.value,
                email: email.value,
                birth_date: birth_date.value,
                phone_number: phone_number.value,
                city: city.value,
                gender: gender.value,
                id_number: id_number.value,
                address: address.value,
                country: country.value,
                doctor: doctorID.value,
                staff: doctorID.value,
                visit_notes: visit_notes.value,
                visit_status: visit_status.value,
                issue_date: formatDate(today_date)
            }
            if(first_name.value == '' || last_name.value == '' || email.value == '' || phone_number.value == '' || birth_date.value == '' || gender.value == '' ||
                id_number.value == '' || city.value == '' || address.value == '' || country.value == '' || contact_person_first_name.value == '' || contact_person_last_name.value == '' || contact_person_email.value == '' || 
                contact_person_phone_number.value == '' || visit_notes.value == ''){
                    window.alert('Please Fill in The Required Information')
                    doctComponentKey.value += 1;
                    componentKey.value += 1;
                    mainComponentKey.value += 1;
            }else if(!rows){            
                store.dispatch('Patients_List/createPatient', formData)
                
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
                        "description": rows.value[i].fees_name +" for "+first_name.value+" "+last_name.value,
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
                formData['client'] = first_name.value+" "+last_name.value;
                formData['description'] = invDescr.value;
                formData['txn_type'] = txn_type.value;
                formData['total_amount'] = invoice_totals.value;
                formData['journal_entry_array'] = journalEntryArr.value;
                store.dispatch('Patients_List/createPatient', formData);
                handleReset();

            }
        }
        
        onBeforeMount(()=>{
            store.commit('Medical_Fees/initializeStore')
            fetchMedicalFees();
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
            additional_flex_basis.value = '1/3';
            additional_flex_basis_percentage.value = '33.333';
            additional1_flex_basis.value = '1/2';
            additional1_flex_basis_percentage.value = '50';
        })
        onMounted(()=>{
            console.log("THE FEES ARRAY IS ",feesArr.value)
        })

        return{
            componentKey, formFields, additionalFields, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, displayButtons, columns, rows, idField, actions, feesArr,
            feesDropdownWidth, feesSearchPlaceholder, selectedFees, handleSelectedFees, feesID, feesName,
            additional1Fields, additional1_flex_basis, additional1_flex_basis_percentage, createPatient, mainComponentKey,
            handleReset
        }
    }
})
</script>