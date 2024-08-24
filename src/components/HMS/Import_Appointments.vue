<template>
    <ImportComponent 
        :rows="rows"
        :columns="tableColumns"
        :idField="idField"
        :loader="loader"
        @showLoader="showLoader"
        @hideLoader="hideLoader"  
        :excel_file="excel_file"  
        :filePath="filePath"
        @file-changed="handleFileChange"
        @displayExcelData="displayExcelData"
    />
</template>

<script>
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
            {label: "Code", key:"patient_code",type: "text", editable: false},
            {label: "Patient", key:"patient_name",type: "text", editable: false},
            {label: "ID No", key: "patient_id_number", type: "text", editable: false},
            {label: "Doctor", key: "doctor_name", type: "text", editable: false},
            {label: "Date", key: "date", type: "text", editable: false},
            {label: "Time", key: "time", type: "text", editable: false},
            {label: "Notes", key: "notes", type: "text", editable: false},
        ])
        const rows = ref([]);
        const idField = 'appointment_id';
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

        }

        return{
            tableColumns, rows, idField, loader, showLoader, hideLoader, excel_file, filePath, displayExcelData, handleFileChange
        }
    }
})
</script>