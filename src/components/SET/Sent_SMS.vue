<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="composeSMS"
            :searchFilters="searchFilters"
            @searchPage="searchSMSs"
            @resetFilters="resetFilters"
            @printList="printList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="smsList"
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
    <MovableModal v-model:visible="testModalVisible" :title="testTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="test_modal_loader" @showLoader="showTestModalLoader" @hideLoader="hideTestModalLoader" >
            <DynamicForm 
                :fields="formFields1" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="sendTestSMS" @handleReset="handleTestReset"
            />
        </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Sent_SMS',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const test_modal_loader = ref('none');
        const testModalVisible = ref(false);
        const idField = 'sent_sms_id';
        const addButtonLabel = ref('Compose SMS');
        const testTitle = ref('Compose SMS');
        const addingRight = ref('Sending System SMS');
        const rightsModule = ref('Settings');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const smsList = ref([]);
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
        const modal_top = ref('120px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const displayButtons = ref(true);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Recipient Name", key:"recipient_name"},
            {label: "Phone Number", key:"number"},
            {label: "Message", key:"status_description",maxWidth:"2000px"},
            {label: "Status", key:"status_code"},
            // {label: "Message ID", key:"message_id",maxWidth:"500px"},
            {label: "Cost", key:"cost"},
        ])
        const actions = ref([
            {name: 'resend', icon: 'fas fa-sync-alt', title: 'Resend', rightName: 'Sending System SMS'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const phone_number_search = ref('');
        const status_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Phone Number...", value: phone_number_search, width:56,},
            {type:'text', placeholder:"Status...", value: status_search, width:56,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const formFields1 = ref([]);
        const updateFormFields1 = () => {
            formFields1.value = [
                { type: 'text', name: 'recepient_names',label: "Recepient Name(s)", value: '', required: false, placeholder: "Jack,Jane" },
                { type: 'text', name: 'phone_number',label: "Phone Number(s)", value: '', required: true, placeholder: "+2547XXXXXXXX,+2547XXXXXXXX" },
                {type:'text-area', label:"Message", value: '', textarea_rows: '4', textarea_cols: '56', required: true},
            ];
        };
  
        const sendTestSMS = async() =>{
            showTestModalLoader();
            let formData = {
                content: formFields1.value[2].value,
                recepient_names: [formFields1.value[0].value],
                phone_numbers: [formFields1.value[1].value],
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields1.value.length; i++){
                if(formFields1.value[i].value =='' && formFields1.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideTestModalLoader();
            }else{
                try {
                    const response = await axios.post('api/v1/test-send-sms/', formData)
                    if(response && response.data.msg === "Success") {
                        hideTestModalLoader();
                        toast.success('SMS Sent!');
                        handleTestReset();
                    }else {
                        toast.error('An error occurred while sending the SMS.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to send SMS: ' + error.message);
                } finally {
                    hideTestModalLoader();
                }
            }

        }
        const handleTestReset = () =>{
            for(let i=0; i < formFields1.value.length; i++){
                formFields1.value[i].value = '';
            }
        }
        const showTestModalLoader = () =>{
            test_modal_loader.value = "block";
        }
        const hideTestModalLoader = () =>{
            test_modal_loader.value = "none";
        }
        
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchSMSs = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                phone_number: phone_number_search.value,
                status: status_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/sent-sms-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                smsList.value = response.data.results;
                propResults.value = response.data;
                propArrLen.value = smsList.value.length;
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
            searchSMSs(selectedValue.value);
        };
        const resetFilters = () =>{
            phone_number_search.value = "";
            status_search.value = "";
            searchSMSs();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchSMSs();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchSMSs();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchSMSs();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchSMSs();
            // scrollToTop();
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'resend'){
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';
                testModalVisible.value = true;
                updateFormFields1();

            }
        };
        const composeSMS = async() =>{
            updateFormFields1();
            handleTestReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
            testModalVisible.value = true; 
            
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchSMSs();
            
        })
        return{
            searchSMSs,resetFilters, addButtonLabel, searchFilters, tableColumns, smsList,flex_basis,flex_basis_percentage,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,selectSearchQuantity,selectedValue,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,modal_left,modal_top,modal_width,
            submitButtonLabel, showLoader, loader,handleSelectionChange,addingRight,rightsModule,displayButtons,
            composeSMS,testModalVisible,testTitle,test_modal_loader,handleTestReset,showTestModalLoader,hideTestModalLoader,
            formFields1,sendTestSMS
        }
    }
};
</script>