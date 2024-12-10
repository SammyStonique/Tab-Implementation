<template>
    <ImportComponent 
        :rows="excelDepList"
        :columns="tableColumns"
        :idField="idField"
        :loader="loader"
        @showLoader="showLoader"
        @hideLoader="hideLoader"  
        :excel_file="excel_file"  
        :filePath="filePath"
        @file-changed="handleFileChange"
        @displayExcelData="displayExcelData"
        @handleSubmit="importDepartmentsExcel" 
        @handleReset="handleReset" 
        @downloadExcelTemplate="downloadExcelTemplate"
    />
</template>

<script>
import axios from "axios";
import { defineComponent, ref, computed } from 'vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import ImportComponent from '../ImportComponent.vue';

export default defineComponent({
    name: 'Import_Appointments',
    components:{
        ImportComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const hospitalID = computed(()=> store.state.userData.company_id);
        const tableColumns = ref([
            {label: "Code", key:"code",type: "text", editable: false},
            {label: "Department", key:"name",type: "text", editable: false},
        ])
        const excelDepList = ref([]);
        const idField = 'department_id';
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
                formData.append("departments_excel", excel_file.value) 

                axios.post("api/v1/display-departments-import-excel/", formData)
                .then((response)=>{
                    excelDepList.value = response.data.departments;
                    console.log(excelDepList.value);
                })
                .catch((error)=>{
                    console.log(error.message);
                })
                .finally(()=>{
                    hideLoader();
                })
            }
        };
        const importDepartmentsExcel = () =>{
            showLoader();
            if(!excelDepList.value.length){
                toast.error("Please Import Excel Template")
                hideLoader();
            }
            else{
                let formData = new FormData()
                formData.append("departments_excel", excel_file.value)
                formData.append("company_id", hospitalID.value)

                axios.post("api/v1/import-departments-excel/", formData)
                .then((response)=>{
                    if(response.data == "Success"){
                        toast.success("Departments Imported Succesfully")
                        handleReset();
                        excelDepList.value = [];
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
            axios.post("api/v1/download-departments-excel/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Departments_Import.xls');
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
            excelDepList.value = [];
            filePath.value = "";
            excel_file.value = "";
        }

        return{
            tableColumns, excelDepList, idField, loader, showLoader, hideLoader, excel_file, filePath, displayExcelData, handleFileChange,
            handleReset,importDepartmentsExcel,downloadExcelTemplate
        }
    }
})
</script>