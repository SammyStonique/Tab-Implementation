<template>
    <ImportComponent 
        :rows="excelTxnsList"
        :columns="tableColumns"
        :idField="idField"
        :loader="loader"
        :fields="formFields"
        @showLoader="showLoader"
        @hideLoader="hideLoader"  
        :excel_file="excel_file"  
        :filePath="filePath"
        @file-changed="handleFileChange"
        @displayExcelData="displayExcelData"
        @handleSubmit="importMembersExcel" 
        @handleReset="handleReset" 
        @downloadExcelTemplate="downloadExcelTemplate"
    />
</template>

<script>
import axios from "axios";
import { defineComponent, ref, computed, onBeforeMount } from 'vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import ImportComponent from '@/components/ImportComponent.vue';

export default defineComponent({
    name: 'Import_Mpesa_Txns',
    components:{
        ImportComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const tableColumns = ref([
            {label: "Receipt No", key:"receipt_no"},
            {label: "Completion Time", key:"completion_time"},
            {label: "Initiation Time", key:"transaction_time"},
            {label: "Details", key:"narration", minWidth:"500px", maxWidth: "500px"},
            {label: "Txn Status", key: "txn_status"},
            {label: "Paid In", key:"money_in"},            
            {label: "Withdrawn", key:"money_out"},
            {label: "Balance", key:"org_balance"},
            // {label: "Reason Type", key:"reason_type"},
            {label: "A/C No.", key:"account_no"},
        ])
        const excelTxnsList = ref([]);
        const idField = 'tenant_id';
        const excel_file = ref('');
        const filePath = ref('');

        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'date', name: 'recording_date',label: "Date", value: '', required: true },
                { type: 'text', name: 'bill_ref',label: "Short Code", value: '', required: true },            
                {required: false},
                {required: false},
            ]
        };

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 

        const handleFileChange = (fileData) => {
            filePath.value = fileData.filePath;
            excel_file.value = fileData.file;
        };

        const displayExcelData = () =>{
            showLoader();
            if(formFields.value[0].value == "" || formFields.value[1].value == ""){
                toast.error("Required Fields Missing!")
                hideLoader();
            }
            else if(excel_file.value == ""){
                toast.error("No File Selected!")
                hideLoader();
            }else{
                
                let formData = new FormData()
                formData.append("txns_excel", excel_file.value) 
                formData.append("company", companyID.value)
                formData.append("short_code", formFields.value[1].value)

                axios.post("api/v1/display-mpesa-upload-import-excel/", formData)
                .then((response)=>{
                    if(response.data.msg == "Incorrect"){
                        toast.error("Incorrect Short Code!")
                    }else{
                        excelTxnsList.value = response.data.transactions;
                    }          
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideLoader();
                })
            }
        };
        const importMembersExcel = () =>{
            showLoader();
            if(formFields.value[0].value == "" || formFields.value[1].value == ""){
                toast.error("Required Fields Missing!")
                hideLoader();
            }
            else if(!excelTxnsList.value.length){
                toast.error("Please Import Excel Template")
                hideLoader();
            }
            else{
                let formData = {
                    txns_excel: excelTxnsList.value,
                    date: formFields.value[0].value,
                    short_code: formFields.value[1].value,
                    user: userID.value,
                    company: companyID.value
                }

                axios.post("api/v1/import-mpesa-upload-excel/", formData)
                .then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Success")
                        handleReset();
                        excelTxnsList.value = [];
                        excel_file.value = "";
                    }else if(response.data.msg == "Incorrect"){
                        toast.error("Incorrect Short Code!")
                    }else{
                        toast.error(response.data) 
                    }
                   
                })
                .catch((error)=>{
                    console.log(error.message);
                    toast.error(error.message);
                })
                .finally(()=>{
                    hideLoader();
                })
            }
                
        };
        const downloadExcelTemplate = () =>{
            showLoader(); 
            let formData = {

            }
            axios.post("api/v1/download-mpesa-upload-excel/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Mpesa_Txns_Import.xls');
                        document.body.appendChild(link);
                        link.click();
                    }
                })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        }
        const handleReset = () =>{
            excelTxnsList.value = [];
            filePath.value = "";
            excel_file.value = "";
        }
        onBeforeMount(()=>{
            updateFormFields();
        })

        return{
            tableColumns, excelTxnsList, idField, loader, showLoader, hideLoader, excel_file, filePath, displayExcelData, handleFileChange,
            handleReset,importMembersExcel,downloadExcelTemplate,formFields
        }
    }
})
</script>