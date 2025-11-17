<template>
    <ImportComponent 
        :rows="excelLoansList"
        :columns="tableColumns"
        :idField="idField"
        :loader="loader"
        @showLoader="showLoader"
        @hideLoader="hideLoader"  
        :excel_file="excel_file"  
        :filePath="filePath"
        @file-changed="handleFileChange"
        @displayExcelData="displayExcelData"
        @handleSubmit="importLoansExcel" 
        @handleReset="handleReset" 
        @downloadExcelTemplate="downloadExcelTemplate"
    />
</template>

<script>
import axios from "axios";
import { defineComponent, ref, computed } from 'vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import ImportComponent from '@/components/ImportComponent.vue';

export default defineComponent({
    name: 'Import_Historical_Loans',
    components:{
        ImportComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const companyID = computed(()=> store.state.userData.company_id);
        const tableColumns = ref([
            {label: "Member No", key:"member_number"},
            {label: "Member Name", key:"member_name"},
            {label: "Loan Product", key:"product_name"},
            {label: "Date", key: "application_date"},
            {label: "Status", key:"loan_status"},
            {label: "Approved Amnt", key:"approved_amount"},
            {label: "Instl", key:"installments"},
            {label: "Loan Bal.", key:"loan_balance"},
            {label: "Principal", key:"principal_amount"},
            {label: "Interest", key:"interest_amount"},
            {label: "penalty_balance", key:"penalty_balance"},
        ])
        const excelLoansList = ref([]);
        const idField = 'historical_loan_id';
        const excel_file = ref('');
        const filePath = ref('');

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
            if(excel_file.value == ""){
                toast.error("No File Selected")
                hideLoader();
            }else{
                let formData = new FormData()
                formData.append("historical_loans_excel", excel_file.value) 
                formData.append("company", companyID.value)

                axios.post("api/v1/display-historical-loans-import-excel/", formData)
                .then((response)=>{
                    excelLoansList.value = response.data.applications;
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideLoader();
                })
            }
        };
        const importLoansExcel = () =>{
            showLoader();
            if(!excelLoansList.value.length){
                toast.error("Please Import Excel Template")
                hideLoader();
            }
            else{
                let formData = new FormData()
                formData.append("historical_loans_excel", excel_file.value)
                formData.append("company", companyID.value)

                axios.post("api/v1/import-historical-loans-excel/", formData)
                .then((response)=>{
                    if(response.data == "Success"){
                        toast.success("Historical Loans Imported Succesfully")
                        handleReset();
                        excelLoansList.value = [];
                        excel_file.value = "";
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
            axios.post("api/v1/download-historical-loans-import-excel/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Historical_Loans_Import.xlsx');
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
            excelLoansList.value = [];
            filePath.value = "";
            excel_file.value = "";
        }

        return{
            tableColumns, excelLoansList, idField, loader, showLoader, hideLoader, excel_file, filePath, displayExcelData, handleFileChange,
            handleReset,importLoansExcel,downloadExcelTemplate
        }
    }
})
</script>