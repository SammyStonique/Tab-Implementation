<template>
    <ImportComponent 
        :rows="excelUnitsList"
        :columns="tableColumns"
        :idField="idField"
        :loader="loader"
        @showLoader="showLoader"
        @hideLoader="hideLoader"  
        :excel_file="excel_file"  
        :filePath="filePath"
        @file-changed="handleFileChange"
        @displayExcelData="displayExcelData"
        @handleSubmit="importUnitsExcel" 
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
    name: 'Import_Property_Units',
    components:{
        ImportComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const companyID = computed(()=> store.state.userData.company_id);
        const tableColumns = ref([
            {label: "Property Name", key:"property_name",type: "text", editable: false},
            {label: "Unit No", key:"unit_number",type: "text", editable: false},
            {label: "Market Rent", key:"market_rent",type: "text", editable: false},
            {label: "Charge Freq.", key:"charge_frequency",type: "text", editable: false},
            {label: "Owner Occ.", key:"owner_occupied",type: "text", editable: false},
            {label: "Bedrooms", key:"bedrooms",type: "text", editable: false},
        ])
        const excelUnitsList = ref([]);
        const idField = 'property_unit_id';
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
                formData.append("property_units_excel", excel_file.value) 
                formData.append("company", companyID.value)

                axios.post("api/v1/display-property-units-import-excel/", formData)
                .then((response)=>{
                    excelUnitsList.value = response.data.units;
                    console.log(excelUnitsList.value);
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
        const importUnitsExcel = () =>{
            showLoader();
            if(!excelUnitsList.value.length){
                toast.error("Please Import Excel Template")
                hideLoader();
            }
            else{
                let formData = new FormData()
                formData.append("property_units_excel", excel_file.value)
                formData.append("company", companyID.value)

                axios.post("api/v1/import-property-units-excel/", formData)
                .then((response)=>{
                    if(response.data == "Success"){
                        toast.success("Property Units Imported Succesfully")
                        handleReset();
                        excelUnitsList.value = [];
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
            axios.post("api/v1/download-property-units-excel/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Property_Units_Import.xls');
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
            excelUnitsList.value = [];
            filePath.value = "";
            excel_file.value = "";
        }

        return{
            tableColumns, excelUnitsList, idField, loader, showLoader, hideLoader, excel_file, filePath, displayExcelData, handleFileChange,
            handleReset,importUnitsExcel,downloadExcelTemplate
        }
    }
})
</script>