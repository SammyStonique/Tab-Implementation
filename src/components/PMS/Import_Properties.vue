<template>
    <ImportComponent 
        :rows="excelPropertiesList"
        :columns="tableColumns"
        :idField="idField"
        :loader="loader"
        @showLoader="showLoader"
        @hideLoader="hideLoader"  
        :excel_file="excel_file"  
        :filePath="filePath"
        @file-changed="handleFileChange"
        @displayExcelData="displayExcelData"
        @handleSubmit="importPropertiesExcel" 
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
    name: 'Import_Properties',
    components:{
        ImportComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const companyID = computed(()=> store.state.userData.company_id);
        const tableColumns = ref([
            {label: "Landlord Name", key:"landlord_name",type: "text", editable: false},
            {label: "Property Code", key:"property_code",type: "text", editable: false},
            {label: "Property Name", key:"name",type: "text", editable: false},
            {label: "L.R No", key:"lr_number",type: "text", editable: false},
            {label: "KRA Pin", key:"kra_pin",type: "text", editable: false},
            {label: "Address", key:"address",type: "text", editable: false},
            {label: "Zone", key:"zone_name",type: "text", editable: false},
        ])
        const excelPropertiesList = ref([]);
        const idField = 'property_id';
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
                formData.append("properties_excel", excel_file.value) 
                formData.append("company", companyID.value)

                axios.post("api/v1/display-properties-import-excel/", formData)
                .then((response)=>{
                    if(response.status == 200){
                        excelPropertiesList.value = response.data.properties;
                        console.log(excelPropertiesList.value);
                    }else{
                        toast.error(response.data)
                    }
                    
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
        const importPropertiesExcel = () =>{
            showLoader();
            if(!excelPropertiesList.value.length){
                toast.error("Please Import Excel Template")
                hideLoader();
            }
            else{
                let formData = new FormData()
                formData.append("properties_excel", excel_file.value)
                formData.append("company", companyID.value)

                axios.post("api/v1/import-properties-excel/", formData)
                .then((response)=>{
                    if(response.data == "Success"){
                        toast.success("Properties Imported Succesfully")
                        handleReset();
                        excelPropertiesList.value = [];
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
            axios.post("api/v1/download-properties-excel/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Properties_Import.xls');
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
            excelPropertiesList.value = [];
            filePath.value = "";
            excel_file.value = "";
        }

        return{
            tableColumns, excelPropertiesList, idField, loader, showLoader, hideLoader, excel_file, filePath, displayExcelData, handleFileChange,
            handleReset,importPropertiesExcel,downloadExcelTemplate
        }
    }
})
</script>