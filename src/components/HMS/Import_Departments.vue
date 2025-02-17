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
                   toast.success("Departments Imported Succesfully")
                   handleReset();
                })
                .catch((error)=>{
                    console.log(error.message);
                })
                .finally(()=>{
                    hideLoader();
                    excelDepList.value = [];
                    excel_file.value = "";
                })
            }
                
        };
        const handleReset = () =>{
            excelDepList.value = [];
            filePath.value = "";
            excel_file.value = "";
        }

        return{
            tableColumns, excelDepList, idField, loader, showLoader, hideLoader, excel_file, filePath, displayExcelData, handleFileChange,
            handleReset,importDepartmentsExcel
        }
    }
})
</script>