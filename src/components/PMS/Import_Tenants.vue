<template>
    <ImportComponent 
        :rows="excelTenantsList"
        :columns="tableColumns"
        :idField="idField"
        :loader="loader"
        @showLoader="showLoader"
        @hideLoader="hideLoader"  
        :excel_file="excel_file"  
        :filePath="filePath"
        @file-changed="handleFileChange"
        @displayExcelData="displayExcelData"
        @handleSubmit="importTenantsExcel" 
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
    name: 'Import_Tenants',
    components:{
        ImportComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const companyID = computed(()=> store.state.userData.company_id);
        const tableColumns = ref([
            {label: "Tenant Code", key:"tenant_code",type: "text", editable: false},
            {label: "Tenant Name", key:"tenant_name",type: "text", editable: false},
            {label: "Unit No", key:"unit_number",type: "text", editable: false},
            {label: "Property Name", key:"property_name",type: "text", editable: false},
            {label: "Rent Amount", key:"rent_amount",type: "text", editable: false},
            {label: "Bill. Freq.", key:"billing_frequency",type: "text", editable: false},
            {label: "Lease Start", key:"lease_start_date",type: "text", editable: false},
            {label: "Lease End", key:"lease_end_date",type: "text", editable: false},
            {label: "Term Type", key:"lease_term_type",type: "text", editable: false},
        ])
        const excelTenantsList = ref([]);
        const idField = 'tenant_id';
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
                formData.append("tenants_excel", excel_file.value) 
                formData.append("company", companyID.value)

                axios.post("api/v1/display-tenants-import-excel/", formData)
                .then((response)=>{
                    excelTenantsList.value = response.data.tenants;
                    console.log(excelTenantsList.value);
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
        const importTenantsExcel = () =>{
            showLoader();
            if(!excelTenantsList.value.length){
                toast.error("Please Import Excel Template")
                hideLoader();
            }
            else{
                let formData = new FormData()
                formData.append("tenants_excel", excel_file.value)
                formData.append("company", companyID.value)

                axios.post("api/v1/import-tenants-excel/", formData)
                .then((response)=>{
                    if(response.data == "Success"){
                        toast.success("Tenants Imported Succesfully")
                        handleReset();
                        excelTenantsList.value = [];
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
            axios.post("api/v1/download-tenants-import-excel/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Tenants_Import.xls');
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
            excelTenantsList.value = [];
            filePath.value = "";
            excel_file.value = "";
        }

        return{
            tableColumns, excelTenantsList, idField, loader, showLoader, hideLoader, excel_file, filePath, displayExcelData, handleFileChange,
            handleReset,importTenantsExcel,downloadExcelTemplate
        }
    }
})
</script>