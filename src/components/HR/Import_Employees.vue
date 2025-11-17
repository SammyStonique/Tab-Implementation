<template>
    <ImportComponent 
        :rows="excelEmployeesList"
        :columns="tableColumns"
        :idField="idField"
        :loader="loader"
        @showLoader="showLoader"
        @hideLoader="hideLoader"  
        :excel_file="excel_file"  
        :filePath="filePath"
        @file-changed="handleFileChange"
        @displayExcelData="displayExcelData"
        @handleSubmit="importEmployeesExcel" 
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
    name: 'Import_Employees',
    components:{
        ImportComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const companyID = computed(()=> store.state.userData.company_id);
        const tableColumns = ref([
            {label: "Staff No", key:"staff_number"},
            {label: "Employee Name", key:"employee_name"},
            {label: "Phone No", key: "phone_number"},
            {label: "Email", key:"email"},
            {label: "Gender", key:"gender"},
            {label: "Pay Group", key:"pay_group"},
            {label: "Title", key:"job_title"},
            {label: "Basic Pay", key:"basic_pay"},
            {label: "Start Date", key:"employment_start_date"},
            {label: "Emp. Status", key:"employment_status"},
            {label: "Department", key:"employee_department"},
            {label: "Supervisor", key:"supervisor"},
        ])
        const excelEmployeesList = ref([]);
        const idField = 'employee_id';
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
                formData.append("employees_excel", excel_file.value) 
                formData.append("company", companyID.value)

                axios.post("api/v1/display-employees-import-excel/", formData)
                .then((response)=>{
                    excelEmployeesList.value = response.data.employees;
                    console.log(excelEmployeesList.value);
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
        const importEmployeesExcel = () =>{
            showLoader();
            if(!excelEmployeesList.value.length){
                toast.error("Please Import Excel Template")
                hideLoader();
            }
            else{
                let formData = new FormData()
                formData.append("employees_excel", excel_file.value)
                formData.append("company", companyID.value)

                axios.post("api/v1/import-employees-excel/", formData)
                .then((response)=>{
                    if(response.data == "Success"){
                        toast.success("Employees Imported Succesfully")
                        handleReset();
                        excelEmployeesList.value = [];
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
            axios.post("api/v1/download-employees-import-excel/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Employees_Import.xlsx');
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
            excelEmployeesList.value = [];
            filePath.value = "";
            excel_file.value = "";
        }

        return{
            tableColumns, excelEmployeesList, idField, loader, showLoader, hideLoader, excel_file, filePath, displayExcelData, handleFileChange,
            handleReset,importEmployeesExcel,downloadExcelTemplate
        }
    }
})
</script>