<template>
    <ImportComponent 
        :rows="excelSalesList"
        :columns="tableColumns"
        :idField="idField"
        :loader="loader"
        @showLoader="showLoader"
        @hideLoader="hideLoader"  
        :excel_file="excel_file"  
        :filePath="filePath"
        @file-changed="handleFileChange"
        @displayExcelData="displayExcelData"
        @handleSubmit="importSalesExcel" 
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
    name: 'Import_Historical_Sales',
    components:{
        ImportComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const companyID = computed(()=> store.state.userData.company_id);
        const tableColumns = ref([
            {label: "Client Code", key:"client_code"},
            {label: "Client Name", key:"client_name"},
            {label: "Asset Name", key:"asset_name"},
            {label: "Date", key: "sale_date"},
            {label: "Sold Units", key:"sold_units"},
            {label: "Status", key:"sale_status"},
            {label: "Sale Amnt", key:"sale_amount"},
            {label: "Instl", key:"installments"},
            {label: "Sale Bal.", key:"sale_balance"},
            {label: "Principal", key:"principal_amount"},
            {label: "Interest", key:"interest_amount"},
            {label: "penalty_balance", key:"penalty_balance"},
        ])
        const excelSalesList = ref([]);
        const idField = 'asset_sale_id';
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
            console.log("File path updated to: ", filePath.value);
            console.log("Excel file updated to: ", excel_file.value);
        };

        const displayExcelData = () =>{
            showLoader();
            if(excel_file.value == ""){
                toast.error("No File Selected")
                hideLoader();
            }else{
                let formData = new FormData()
                formData.append("historical_sales_excel", excel_file.value) 
                formData.append("company", companyID.value)

                axios.post("api/v1/display-historical-asset-sales-import-excel/", formData)
                .then((response)=>{
                    excelSalesList.value = response.data.sales;
                    console.log(excelSalesList.value);
                })
                .catch((error)=>{
                    console.log(error.message);
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideLoader();
                })
            }
        };
        const importSalesExcel = () =>{
            showLoader();
            if(!excelSalesList.value.length){
                toast.error("Please Import Excel Template")
                hideLoader();
            }
            else{
                let formData = new FormData()
                formData.append("historical_sales_excel", excel_file.value)
                formData.append("company", companyID.value)

                axios.post("api/v1/import-historical-asset-sales-excel/", formData)
                .then((response)=>{
                    if(response.data == "Success"){
                        toast.success("Historical Sales Imported Succesfully")
                        handleReset();
                        excelSalesList.value = [];
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
            axios.post("api/v1/download-historical-asset-sales-import-excel/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Historical_Sales_Import.xls');
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
            excelSalesList.value = [];
            filePath.value = "";
            excel_file.value = "";
        }

        return{
            tableColumns, excelSalesList, idField, loader, showLoader, hideLoader, excel_file, filePath, displayExcelData, handleFileChange,
            handleReset,importSalesExcel,downloadExcelTemplate
        }
    }
})
</script>