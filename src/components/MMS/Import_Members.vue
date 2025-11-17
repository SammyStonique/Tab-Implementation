<template>
    <ImportComponent 
        :rows="excelMembersList"
        :columns="tableColumns"
        :idField="idField"
        :loader="loader"
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
import { defineComponent, ref, computed } from 'vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import ImportComponent from '@/components/ImportComponent.vue';

export default defineComponent({
    name: 'Import_Members',
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
            {label: "Joining Date", key:"joining_date"},
            {label: "Phone No", key: "phone_number"},
            {label: "Email", key:"email"},
            {label: "Category", key:"category_name"},
            {label: "Sponsor", key:"sponsor_name"},
            {label: "Gender", key:"gender"},
        ])
        const excelMembersList = ref([]);
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
                formData.append("members_excel", excel_file.value) 
                formData.append("company", companyID.value)

                axios.post("api/v1/display-members-import-excel/", formData)
                .then((response)=>{
                    excelMembersList.value = response.data.members;
                    console.log(excelMembersList.value);
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
        const importMembersExcel = () =>{
            showLoader();
            if(!excelMembersList.value.length){
                toast.error("Please Import Excel Template")
                hideLoader();
            }
            else{
                let formData = new FormData()
                formData.append("members_excel", excel_file.value)
                formData.append("company", companyID.value)

                axios.post("api/v1/import-members-excel/", formData)
                .then((response)=>{
                    if(response.data == "Success"){
                        toast.success("Members Imported Succesfully")
                        handleReset();
                        excelMembersList.value = [];
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
            axios.post("api/v1/download-members-import-excel/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Members_Import.xlsx');
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
            excelMembersList.value = [];
            filePath.value = "";
            excel_file.value = "";
        }

        return{
            tableColumns, excelMembersList, idField, loader, showLoader, hideLoader, excel_file, filePath, displayExcelData, handleFileChange,
            handleReset,importMembersExcel,downloadExcelTemplate
        }
    }
})
</script>