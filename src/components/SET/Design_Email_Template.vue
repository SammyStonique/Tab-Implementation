<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <div class="flex text-left mb-6">
                    <div class="basis-1/4"></div>
                    <div class="basis-1/2 flex">
                        <div class="basis-1/3 mr-6">
                            <label for="">Template Name:<em>*</em></label><br />
                            <input v-model="templateName" type="text" :class="`bg-slate-50 rounded pl-3 border border-gray-400 text-base w-full`"/>
                        </div>
                        <div class="basis-1/3 mr-6">
                            <label for="">Template Type:<em>*</em></label><br />
                            <select v-model="templateType" @change="handleChange($event)" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
                                <option value="" selected disabled></option>
                                <option value="Customized">Customized</option>
                                <option value="Tenant Invoice">Tenant Invoice</option>
                                <option value="Tenant Receipt">Tenant Receipt</option>
                                <option value="Tenant Statement">Tenant Statement</option>
                                <option value="Tenant Balance Reminder">Tenant Balance Reminder</option>
                                <option value="Tenant Creation">Tenant Creation</option>
                                <option value="Tenant Portal Invitation">Tenant Portal Invitation</option>
                                <option value="Tenant Meter Reading">Tenant Meter Reading</option>
                                <option value="Employee Payslip">Employee Payslip</option>
                                <option value="Customer Invoice">Customer Invoice</option>
                                <option value="Customer Receipt">Customer Receipt</option>
                                <option value="Customer Balance Reminder">Customer Balance Reminder</option>
                                <option value="Member Receipt">Member Receipt</option>
                                <option value="Member Loan Balance">Member Loan Balance</option>
                                <option value="Member Creation">Member Creation</option>
                                <option value="Member Portal Invitation">Member Portal Invitation</option>
                            </select>
                        </div>
                        <div class="basis-1/3">
                            <div class="flex-1 basis-full px-2 mt-6">
                                <button @click="saveTemplate" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Save</button>
                                <button @click="handleReset" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-refresh text-xs mr-1.5" aria-hidden="true"></i>Reset</button>
                            </div>
                        </div>
                    </div>
                    <div class="basis-1/4">
                    </div>
                </div>
                <div class="flex min-h-[550px]">
                    <div class="basis-1/4">
                        <table class="text-left">
                            <tr>
                                <td class="font-semibold">Selected Date: </td>
                                <td> &#123;&#123; selected_date &#125;&#125;</td>
                            </tr>
                            <tr>
                                <td class="font-semibold">Particulars: </td>
                                <td> &#123;&#123; particulars &#125;&#125;</td>
                            </tr>
                            <tr>
                                <td class="font-semibold">Particulars Amount: </td>
                                <td> &#123;&#123; particulars_amount &#125;&#125;</td>
                            </tr>
                            <tr>
                                <td class="font-semibold">Txn No: </td>
                                <td> &#123;&#123; txn_no &#125;&#125;</td>
                            </tr>
                        </table>
                        <div class="w-full">
                            <table class="text-left">                         
                                <h2 class="text-center font-bold uppercase mt-4 mb-4">Company</h2>
                                <tr>
                                    <td class="font-semibold">Company Name: </td>
                                    <td> &#123;&#123; company_name &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Company Email: </td>
                                    <td> &#123;&#123; company_email &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Company Phone No: </td>
                                    <td> &#123;&#123; company_phone_number &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Company Address: </td>
                                    <td> &#123;&#123; company_address &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Company Town: </td>
                                    <td> &#123;&#123; company_town &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Company Country: </td>
                                    <td> &#123;&#123; company_country &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Company Tax Pin: </td>
                                    <td> &#123;&#123; company_kra_pin &#125;&#125;</td>
                                </tr>
                            </table>
                        </div>
                        <div class="w-full" v-if="property_management">
                            <table class="text-left">  
                                <h2 class="text-center font-bold uppercase mb-4 mt-4">Tenants</h2>
                                <tr>
                                    <td class="font-semibold">Tenant Name: </td>
                                    <td> &#123;&#123; tenant_name &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Tenant Phone No: </td>
                                    <td> &#123;&#123; tenant_phone_number &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Tenant Code: </td>
                                    <td> &#123;&#123; tenant_code &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Tenant ID No: </td>
                                    <td> &#123;&#123; tenant_id_number &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Tenant Email: </td>
                                    <td> &#123;&#123; tenant_email &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Tenant Address: </td>
                                    <td> &#123;&#123; tenant_address &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Lease Agreement Date: </td>
                                    <td> &#123;&#123; lease_agreement_date &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Lease Start Date: </td>
                                    <td> &#123;&#123; lease_start_date &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Lease End Date: </td>
                                    <td> &#123;&#123; lease_end_date &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Lease Period: </td>
                                    <td> &#123;&#123; lease_period &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Lease Currency: </td>
                                    <td> &#123;&#123; lease_currency_code &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Rent Amount: </td>
                                    <td> &#123;&#123; rent_amount &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Outstanding Balance: </td>
                                    <td> &#123;&#123; outstanding_balance &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Deposit Held: </td>
                                    <td> &#123;&#123; deposit_held &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Exit Charges: </td>
                                    <td> &#123;&#123; exit_charges&#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Termination Date: </td>
                                    <td> &#123;&#123; lease_termination_date &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Net Refund: </td>
                                    <td> &#123;&#123; net_deposit_refund &#125;&#125;</td>
                                </tr>
                            </table>
                        </div>
                        <div class="w-full" v-else-if="member_management">
                            <table class="text-left">  
                                <h2 class="text-center font-bold uppercase mb-4 mt-4">Members</h2>
                                <tr>
                                    <td class="font-semibold">Member Name: </td>
                                    <td> &#123;&#123; member_name &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Member Phone No: </td>
                                    <td> &#123;&#123; member_phone_number &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Member Number: </td>
                                    <td> &#123;&#123; member_code &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Member ID No: </td>
                                    <td> &#123;&#123; member_id_number &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Member Email: </td>
                                    <td> &#123;&#123; member_email &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Member Address: </td>
                                    <td> &#123;&#123; member_address &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Member Joining Date: </td>
                                    <td> &#123;&#123; member_joining_date &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Member Loan Balance: </td>
                                    <td> &#123;&#123; member_loan_balance &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Member Savings Deposit: </td>
                                    <td> &#123;&#123; member_savings_deposit &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Member Shares Deposit: </td>
                                    <td> &#123;&#123; member_shares_deposit &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Member Currency: </td>
                                    <td> &#123;&#123; member_currency_code &#125;&#125;</td>
                                </tr>
                            </table>
                        </div>
                        <div class="w-full" v-else-if="human_resource">
                            <table class="text-left">  
                                <h2 class="text-center font-bold uppercase mb-4 mt-4">Employees</h2>
                                <tr>
                                    <td class="font-semibold">Employee Name: </td>
                                    <td> &#123;&#123; employee_name &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Employee Phone No: </td>
                                    <td> &#123;&#123; employee_phone_number &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Staff Number: </td>
                                    <td> &#123;&#123; staff_number &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Employee ID No: </td>
                                    <td> &#123;&#123; employee_id_number &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Employee Email: </td>
                                    <td> &#123;&#123; employee_email &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Employee Address: </td>
                                    <td> &#123;&#123; employee_address &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Employment Start Date: </td>
                                    <td> &#123;&#123; employment_start_date &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Employment End Date: </td>
                                    <td> &#123;&#123; employment_end_date &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Department: </td>
                                    <td> &#123;&#123; department &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Supervisor: </td>
                                    <td> &#123;&#123; supervisor &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Employee Currency: </td>
                                    <td> &#123;&#123; employee_currency_code &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Basic Pay: </td>
                                    <td> &#123;&#123; basic_pay &#125;&#125;</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div class="basis-1/2 text-left">
                        <quill-editor :key="editorComponentKey" v-model:value="templateContent"></quill-editor>
                    </div>
                    <div class="basis-1/4 pl-6">
                        <div class="w-full" v-if="property_management">
                            <table class="text-left"> 
                                <h2 class="text-center font-bold uppercase mt-4 mb-4">Landlord</h2>
                                <tr>
                                    <td class="font-semibold">Landlord Name: </td>
                                    <td> &#123;&#123; landlord_name &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Landlord Phone No: </td>
                                    <td> &#123;&#123; landlord_phone_number &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Landlord Email: </td>
                                    <td> &#123;&#123; landlord_email &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Landlord Address: </td>
                                    <td> &#123;&#123; landlord_address &#125;&#125;</td>
                                </tr>
                            </table>
                        </div>
                        <div class="w-full" v-if="property_management">
                            <table class="text-left">
                                <h2 class="text-center font-bold uppercase mt-4 mb-4">Property</h2>
                                <tr>
                                    <td class="font-semibold">Property Name: </td>
                                    <td> &#123;&#123; property_name &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Property L.R No: </td>
                                    <td> &#123;&#123; property_lr_number &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Property Address: </td>
                                    <td> &#123;&#123; property_address &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Property Unit: </td>
                                    <td> &#123;&#123; unit_number &#125;&#125;</td>
                                </tr>
                            </table>
                        </div>
                        <div class="w-full" v-if="property_management">
                            <table class="text-left">
                                <h2 class="text-center font-bold uppercase mt-4 mb-4">Meter Reading</h2>
                                <tr>
                                    <td class="font-semibold">Units Consumed: </td>
                                    <td> &#123;&#123; units_consumed &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Prev Reading: </td>
                                    <td> &#123;&#123; prev_reading &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Curr Reading: </td>
                                    <td> &#123;&#123; curr_reading &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Prev Reading Date: </td>
                                    <td> &#123;&#123; prev_date &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Curr Reading Date: </td>
                                    <td> &#123;&#123; curr_date &#125;&#125;</td>
                                </tr>
                                <tr>
                                    <td class="font-semibold">Meter Rent: </td>
                                    <td> &#123;&#123; meter_rent &#125;&#125;</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </PageStyleComponent>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { quillEditor } from 'vue3-quill'

export default defineComponent({
    name: 'Design_Email_Template',
    components:{
        PageStyleComponent, quillEditor
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const mainComponentKey = ref(0);
        const editorComponentKey = ref(0);
        const property_management = ref(false);
        const member_management = ref(false);
        const human_resource = ref(false);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const idField = ref('');
        const selectedTemplate = computed(()=> store.state.Email_Templates.selectedTemplate);
        const isEditing = computed(()=> store.state.Email_Templates.isEditing);
        const templateContent = ref('');
        const templateName = ref('');
        const templateType = ref('');

        const handleReset = async() =>{
            editorComponentKey.value += 1;
            templateContent.value = "";
            templateName.value = "";
            templateType.value = "";
        }
        watch([selectedTemplate], () => {
            if (selectedTemplate.value) {
                editorComponentKey.value += 1;
                templateContent.value = selectedTemplate.value.template_content;
                templateName.value = selectedTemplate.value.template_name;
                templateType.value = selectedTemplate.value.template_type;
            }
            
        }, { immediate: true });
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        };
        const handleChange = (event) =>{
            const selectedValue = event.target.value;
            if(selectedValue.includes("Tenant")){
                property_management.value = true;
                member_management.value = false;
                human_resource.value = false;
            }else if(selectedValue.includes("Member")){
                member_management.value = true;
                property_management.value = false;
                human_resource.value = false;
            }else if(selectedValue.includes("Employee")){
                human_resource.value = true;
                member_management.value = false;
                property_management.value = false;
            }
        }
        const createTemplate = async() =>{
            showLoader();
            let formData = {
                company: companyID.value,
                template_name: templateName.value,
                template_type: templateType.value,
                template_content: templateContent.value,
            }

            errors.value = [];
            if(templateName.value == '' || templateType.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }else{            
                try {
                    const response = await store.dispatch('Email_Templates/createTemplate', formData);
                    if (response && response.status === 200) {
                        hideLoader();
                        toast.success('Template created successfully!');
                        handleReset();
                        mainComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Template.');
                        hideLoader();
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Template: ' + error.message);
                } finally {
                    hideLoader();
                }              
            }
        }
        const updateTemplate = async() =>{
            showLoader();
            let formData = {
                company: companyID.value,
                template_name: templateName.value,
                template_type: templateType.value,
                template_content: templateContent.value,
                email_template: selectedTemplate.value.email_template_id
            }

            errors.value = [];
            if(templateName.value == '' || templateType.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }else{            
                try {
                    const response = await store.dispatch('Email_Templates/updateTemplate', formData);
                    if (response && response.status === 200) {
                        hideLoader();
                        toast.success('Template update successfully!');
                        handleReset();
                        mainComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while updating the Template.');
                        hideLoader();
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Template: ' + error.message);
                } finally {
                    hideLoader();
                }              
            }
        };
        const saveTemplate = () =>{
            if(isEditing.value == true){
                updateTemplate();
            }else{
                createTemplate();
            }
        };
        onBeforeMount(()=>{ 
            editorComponentKey.value += 1;

        })

        return{
            saveTemplate, mainComponentKey,handleReset, loader, showLoader, hideLoader, idField,handleChange,
            templateContent, templateName, templateType, editorComponentKey,property_management,member_management,human_resource
        }
    }
})
</script>

<style scoped>
em{
color: red;
}


</style>