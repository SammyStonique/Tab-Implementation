<template>
    <ImportComponent 
        :rows="excelItemList"
        :columns="tableColumns"
        :idField="idField"
        :loader="loader"
        @showLoader="showLoader"
        @hideLoader="hideLoader"  
        :excel_file="excel_file"  
        :filePath="filePath"
        @file-changed="handleFileChange"
        @displayExcelData="displayExcelData"
        @handleSubmit="importItemsExcel" 
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
    name: 'Import_Item_Catalog',
    components:{
        ImportComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const companyID = computed(()=> store.state.userData.company_id);
        const tableColumns = ref([
            {label: "Item Name", key:"item_name",type: "text", editable: false},
            {label: "Code", key:"code",type: "text", editable: false},
            {label: "Category", key:"category",type: "text", editable: false},
            {label: "Inv Type", key:"inventory_type",type: "text", editable: false},
            {label: "Stock Type", key:"stock_type",type: "text", editable: false},
            {label: "Val Type", key:"valuation_type",type: "text", editable: false},
            {label: "P.Price", key:"purchase_price",type: "text", editable: false},
            {label: "MarkUp(%)", key:"selling_markup",type: "text", editable: false},
            {label: "S.Price", key:"selling_price",type: "text", editable: false},
            {label: "Whsl Price", key:"wholesale_price",type: "text", editable: false},
            {label: "MarkUp(%)", key:"wholesale_markup",type: "text", editable: false},
            {label: "Whsl Qty", key:"wholesale_quantity",type: "text", editable: false},
            {label: "U.O.M", key:"unit_of_measure",type: "text", editable: false},
            {label: "Reorder", key:"reorder_level",type: "text", editable: false},
        ])
        const excelItemList = ref([]);
        const idField = 'inventory_item_id';
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
                formData.append("items_excel", excel_file.value) 

                axios.post("api/v1/display-inventory-items-import-excel/", formData)
                .then((response)=>{
                    excelItemList.value = response.data.items;
                    console.log(excelItemList.value);
                })
                .catch((error)=>{
                    console.log(error.message);
                })
                .finally(()=>{
                    hideLoader();
                })
            }
        };
        const importItemsExcel = () =>{
            showLoader();
            if(!excelItemList.value.length){
                toast.error("Please Import Excel Template")
                hideLoader();
            }
            else{
                let formData = new FormData()
                formData.append("items_excel", excel_file.value)
                formData.append("company", companyID.value)

                axios.post("api/v1/import-inventory-items-excel/", formData)
                .then((response)=>{
                    if(response.data == "Success"){
                        toast.success("Item Catalog Imported Succesfully")
                        handleReset();
                        excelItemList.value = [];
                        excel_file.value = "";
                    }else{
                        toast.error(response.data) 
                    }
                   
                })
                .catch((error)=>{
                    console.log(error.message);
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
                        link.setAttribute('download', 'Departments_Import.xlsx');
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
            excelItemList.value = [];
            filePath.value = "";
            excel_file.value = "";
        }

        return{
            tableColumns, excelItemList, idField, loader, showLoader, hideLoader, excel_file, filePath, displayExcelData, handleFileChange,
            handleReset,importItemsExcel,downloadExcelTemplate
        }
    }
})
</script>