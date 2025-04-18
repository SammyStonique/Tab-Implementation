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
                            <select v-model="templateType" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
                                <option value="" selected disabled></option>
                                <option value="Registration Form">Registration Form</option>
                                <option value="Loan Security Claim">Loan Security Claim</option>
                                <option value="Loan Application Form">Loan Application Form</option>
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
                                    <td class="font-semibold">Loan Due Date: </td>
                                    <td> &#123;&#123; loan_due_date &#125;&#125;</td>
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
                                <tr>
                                    <td class="font-semibold">Loan Security: </td>
                                    <td> &#123;&#123; loan_security &#125;&#125;</td>
                                </tr>
                            
                        </table>
                    </div>
                    <div class="basis-1/2 text-left">
                        <quill-editor :key="editorComponentKey" v-model:value="templateContent"></quill-editor>
                    </div>
                    <div class="basis-1/4 pl-6">

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
    name: 'Design_Template',
    components:{
        PageStyleComponent, quillEditor
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const mainComponentKey = ref(0);
        const editorComponentKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const idField = ref('');
        const selectedTemplate = computed(()=> store.state.Member_Templates.selectedTemplate);
        const isEditing = computed(()=> store.state.Member_Templates.isEditing);
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
                    const response = await store.dispatch('Member_Templates/createTemplate', formData);
                    if (response && response.status === 201) {
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
                membership_template: selectedTemplate.value.membership_template_id
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
                    const response = await store.dispatch('Member_Templates/updateTemplate', formData);
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
            saveTemplate, mainComponentKey,handleReset, loader, showLoader, hideLoader, idField,
            templateContent, templateName, templateType, editorComponentKey
        }
    }
})
</script>

<style scoped>
em{
color: red;
}


</style>