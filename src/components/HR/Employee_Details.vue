<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <div v-show="currentTab == 'Employee_Biodata'">
                    <keep-alive :include="['Employee_Biodata']">
                        <Employee_Biodata
                            :formFields="employeeFormFields"
                            :additionalFields="employeeAdditionalFields"
                            @update-form="updateEmployeeFormFields"
                            @reset-employee-details="handleReset"
                        />
                    </keep-alive>
                </div>
                <div v-show="currentTab == 'Deduction_Details'">
                    <keep-alive :include="['Deduction_Details']">
                        <Deduction_Details 
                            :formFields="deductionFormFields"
                            :additionalFields="employmentAdditionalFields" 
                            :deductionRows="employeeDeductions"
                            @update-form="updateDeductionFormFields"
                            @reset-employment-details="handleReset"
                        />  
                    </keep-alive> 
                </div>
            </div>
            <div class="flex-1 px-2">
                <button v-if="currentTab == 'Employee_Biodata'" @click="openDeductionDetails" class="rounded bg-green-400 text-sm mr-2 w-24 text-white px-2 py-1.5">Next<i class="fa fa-arrow-right text-xs mr-1.5" aria-hidden="true"></i></button>
                <button v-else-if="currentTab == 'Deduction_Details'" @click="openEmployeeDetails" class="rounded bg-green-400 text-sm mr-2 w-24 text-white px-2 py-1.5"><i class="fa fa-arrow-left text-xs mr-1.5" aria-hidden="true"></i>Previous</button>
                <button v-if="currentTab == 'Deduction_Details'" @click="submitAll" class="rounded bg-green-400 text-sm mr-2 w-24 text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Submit</button>
                <button @click="handleReset" class="rounded bg-green-400 text-sm mr-2 w-24 text-white px-2 py-1.5"><i class="fa fa-refresh text-xs mr-1.5" aria-hidden="true"></i>Reset</button>
            </div>
                
        </template>
    </PageStyleComponent>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import Employee_Biodata from '@/components/HR/Employee_Biodata.vue';
import Deduction_Details from '@/components/HR/Deduction_Details.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import axios from 'axios';

export default defineComponent({
    name: 'Employee_Details',
    components:{
        PageStyleComponent, Employee_Biodata, Deduction_Details
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const errors = ref([]);
        const mainComponentKey = ref(0);
        const currentTab = computed(()=> store.state.Employees.currentTab);
        const isEditing = computed(()=> store.state.Employees.isEditing);
        const selectedEmployee = computed(()=> store.state.Employees.selectedEmployee);
        const companyID = computed(()=> store.state.userData.company_id);

        const employeeFormFields = ref([]);
        const employeeAdditionalFields = ref([]);

        const deductionFormFields = ref([]);
        const employmentAdditionalFields = ref([]);
        const employeeDeductions = ref([]);

        const updateEmployeeFormFields = (fields,additionalFields) => {
            employeeFormFields.value = fields;
            employeeAdditionalFields.value = additionalFields;
        };

        watch([selectedEmployee], () => {
            if(selectedEmployee.value){
                employeeFormFields.value[0].value = selectedEmployee.value.staff_number;
                employeeFormFields.value[1].value = selectedEmployee.value.employee_name;
                employeeFormFields.value[2].value = selectedEmployee.value.phone_number;
                employeeFormFields.value[3].value = selectedEmployee.value.id_number;
                employeeFormFields.value[4].value = selectedEmployee.value.dob;
                employeeFormFields.value[5].value = selectedEmployee.value.gender;
                employeeFormFields.value[6].value = selectedEmployee.value.email;
                employeeFormFields.value[7].value = selectedEmployee.value.kra_pin;
                employeeFormFields.value[8].value = selectedEmployee.value.marital_status;
                employeeFormFields.value[9].value = selectedEmployee.value.country;
                employeeFormFields.value[10].value = selectedEmployee.value.address;
                employeeFormFields.value[11].value = selectedEmployee.value.job_title;
                employeeAdditionalFields.value[0].value = selectedEmployee.value.contact_names;
                employeeAdditionalFields.value[1].value = selectedEmployee.value.contact_phone_number;
                employeeAdditionalFields.value[2].value = selectedEmployee.value.contact_email;
                employeeAdditionalFields.value[3].value = selectedEmployee.value.contact_relationship;
                // updateEmployeeFormFields();
                deductionFormFields.value[0].value = selectedEmployee.value.employment_start_date;
                deductionFormFields.value[1].value = selectedEmployee.value.employment_end_date;
                deductionFormFields.value[2].value = selectedEmployee.value.basic_pay;
                deductionFormFields.value[3].value = selectedEmployee.value.employment_status;
                deductionFormFields.value[4].value = selectedEmployee.value.payment_method;
                // deductionFormFields.value[5].value = selectedEmployeeLease.value.email;
                // deductionFormFields.value[6].value = selectedEmployeeLease.value.kra_pin;
                // deductionFormFields.value[7].value = selectedEmployeeLease.value.lease_start_date;
                deductionFormFields.value[8].value = selectedEmployee.value.insurance_premium;
                deductionFormFields.value[9].value = selectedEmployee.value.insurance_relief;
                employmentAdditionalFields.value[0].value = selectedEmployee.value.deduct_shif;
                employmentAdditionalFields.value[1].value = selectedEmployee.value.shif_number;
                employmentAdditionalFields.value[2].value = selectedEmployee.value.deduct_nssf;
                employmentAdditionalFields.value[3].value = selectedEmployee.value.nssf_number;
            }
            
        }, { immediate: true });

        const updateDeductionFormFields = (fields,additionalFields,deductionRows) => {
            deductionFormFields.value = fields;
            employmentAdditionalFields.value = additionalFields;
            employeeDeductions.value = deductionRows;
        };
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 

        const openDeductionDetails = () =>{
            errors.value = [];
            for(let i=0; i < employeeFormFields.value.length; i++){
                if(employeeFormFields.value[i].value =='' && employeeFormFields.value[i].required){
                    errors.value.push('Error');
                }
            }
            for(let i=0; i < employeeAdditionalFields.value.length; i++){
                if(employeeAdditionalFields.value[i].value =='' && employeeAdditionalFields.value[i].required){
                    errors.value.push('Error');
                }
            }
            
            if(errors.value.length){
                toast.error('Fill In Required Fields');
            }else{
                store.dispatch('Employees/updateState', {currentTab: "Deduction_Details"})
            }
            // store.dispatch('Employees/updateState', {currentTab: "Lease_Details"})
        };

        const openEmployeeDetails = () =>{
            store.dispatch('Employees/updateState', {currentTab: "Employee_Biodata"})
        }

        const submitAll = async() => {
            // showLoader();
            if(!isEditing.value){
                const allFormData = {
                    employee_biodata: employeeFormFields.value,
                    emergency_contact: employeeAdditionalFields.value,
                    employment_details: deductionFormFields.value,
                    statutory_deductions: employmentAdditionalFields.value,
                    deductions: employeeDeductions.value,
                    company: companyID.value
                };        
                console.log('Submitting all form data:', allFormData);
                // await axios.post('api/v1/create-employee/',allFormData)
                // .then((response)=>{
                //     if(response.status == 200){
                //         toast.success("Employee Created Succesfully")
                //         handleReset();
                //     }else{
                //         toast.error("Error Creating Employee")
                //     }
                    
                // })
                // .catch((errors)=>{
                //     toast.error(errors.message)
                // })
                // .finally(()=>{
                //     hideLoader();
                // })
            }else{
                toast.error("Editing Details Not Allowed");
                hideLoader();
            }
        };

        const handleReset = async() =>{
            await store.dispatch('Deductions/updateState', {deductionArray: []})
            for(let i=0; i < employeeFormFields.value.length; i++){
                if(employeeFormFields.value[i].label != 'Country'){
                    employeeFormFields.value[i].value = '';
                }           
            }
            for(let i=0; i < employeeAdditionalFields.value.length; i++){
                employeeAdditionalFields.value[i].value = '';
            }
            for(let i=0; i < deductionFormFields.value.length; i++){
                deductionFormFields.value[i].value = '';         
            }
            for(let i=0; i < employmentAdditionalFields.value.length; i++){
                employmentAdditionalFields.value[i].value = '';
            }
            employeeDeductions.value = [];
            mainComponentKey.value += 1;
        }
        
        onBeforeMount(()=>{ 

        })
        onMounted(()=>{
            
        })

        return{
            mainComponentKey, currentTab, loader, showLoader, hideLoader, handleReset, 
            updateEmployeeFormFields,employeeFormFields,employeeAdditionalFields,
            updateDeductionFormFields, deductionFormFields, employmentAdditionalFields, employeeDeductions,
            submitAll, openDeductionDetails, openEmployeeDetails
        }
    }
})
</script>