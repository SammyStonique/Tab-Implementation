<template>
    <ImportComponent 
        :rows="excelPermList"
        :columns="tableColumns"
        :idField="idField"
        :loader="loader"
        @showLoader="showLoader"
        @hideLoader="hideLoader"  
        :excel_file="excel_file"  
        :filePath="filePath"
        @file-changed="handleFileChange"
        @displayExcelData="displayExcelData"
        @handleSubmit="importPermissionsList" 
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
    name: 'Import_Permissions',
    components:{
        ImportComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const hospitalID = computed(()=> store.state.userData.company_id);
        const tableColumns = ref([
            {label: "Permission Name", key:"permission_name",type: "text", editable: false},
            {label: "Module", key:"module",type: "text", editable: false},
        ])
        const excelPermList = ref([]);
        const idField = 'permission_id';
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
                formData.append("permissions_excel", excel_file.value) 

                axios.post("api/v1/display-permissions-import-excel/", formData)
                .then((response)=>{
                    excelPermList.value = response.data.permissions;
                    console.log(excelPermList.value);
                })
                .catch((error)=>{
                    console.log(error.message);
                })
                .finally(()=>{
                    hideLoader();
                })
            }
        };
        const importPermissionsList = () =>{
            showLoader();
            if(!excelPermList.value.length){
                toast.error("Please Import Excel Template")
                hideLoader();
            }
            else{
                let formData = new FormData()
                formData.append("permissions_excel", excel_file.value)

                axios.post("api/v1/import-permissions-excel/", formData)
                .then((response)=>{
                    if(response.data == "Success"){
                        toast.success("Permissions Imported Succesfully")
                        handleReset();
                        excelPermList.value = [];
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
            axios.post("api/v1/download-permissions-excel/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Permissions_Import.xls');
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
            excelPermList.value = [];
            filePath.value = "";
            excel_file.value = "";
        }

        return{
            tableColumns, excelPermList, idField, loader, showLoader, hideLoader, excel_file, filePath, displayExcelData, handleFileChange,
            handleReset,importPermissionsList,downloadExcelTemplate
        }
    }
})
</script>