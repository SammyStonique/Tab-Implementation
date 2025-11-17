<template>
    <ImportComponent 
        :rows="excelDepositsList"
        :columns="tableColumns"
        :idField="idField"
        :loader="loader"
        @showLoader="showLoader"
        @hideLoader="hideLoader"  
        :excel_file="excel_file"  
        :filePath="filePath"
        @file-changed="handleFileChange"
        @displayExcelData="displayExcelData"
        @handleSubmit="importDepositsExcel" 
        @handleReset="handleReset" 
        @downloadExcelTemplate="downloadExcelTemplate"
        :showSearchableDropdown="showLedgerDropdown"
        :searchableDropdownLabel="searchableDropdownLabel"
        :componentKey="componentKey"         
        :selectOptions="ledgerArray"
        :dropdownWidth="dropdownWidth"
        :searchPlaceholder="searchPlaceholder"
        @optionSelected="handleSelectedLedger"
        @clearSearch="clearSelectedLedger"
        @fetchData="fetchAllLedgers"
    />
</template>

<script>
import axios from "axios";
import { defineComponent, ref, computed, onBeforeMount } from 'vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import ImportComponent from '@/components/ImportComponent.vue';

export default defineComponent({
    name: 'Import_Share_Deposits',
    components:{
        ImportComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const componentKey = ref(0);
        const dropdownWidth = ref('350px');
        const searchPlaceholder = ref('Select Posting Account...')
        const companyID = computed(()=> store.state.userData.company_id);
        const tableColumns = ref([
            {label: "Member No", key:"member_number"},
            {label: "Member Name", key:"member_name"},
            {label: "Share Product", key:"product_name"},
            {label: "Date", key: "date"},
            {label: "Ref. No", key: "reference_no"},
            {label: "Amount", key:"amount"},
            {label: "Open. Bal.", key: "opening_balance"},
        ])
        const excelDepositsList = ref([]);
        const idField = 'share_deposit_id';
        const ledgerID = ref('');
        const excel_file = ref('');
        const filePath = ref('');
        const showLedgerDropdown = ref(true);
        const searchableDropdownLabel = ref('Cashbook');

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        };
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const fetchAllLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            ledgerID.value = store.state.Ledgers.ledgerID;
        };
        const clearSelectedLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            ledgerID.value = ""
        }

        const handleFileChange = (fileData) => {
            filePath.value = fileData.filePath;
            excel_file.value = fileData.file;
        };

        const displayExcelData = () =>{
            showLoader();
            if(excel_file.value == ""){
                toast.error("No File Selected")
                hideLoader();
            }else{
                let formData = new FormData()
                formData.append("share_deposits_excel", excel_file.value) 
                formData.append("company", companyID.value)

                axios.post("api/v1/display-share-deposits-import-excel/", formData)
                .then((response)=>{
                    excelDepositsList.value = response.data.deposits;
                    console.log(excelDepositsList.value);
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
        const importDepositsExcel = () =>{
            showLoader();
            if(!excelDepositsList.value.length){
                toast.error("Please Import Excel Template")
                hideLoader();
            }else if(ledgerID.value == ""){
                toast.error("Please Select Posting Account")
                hideLoader();
            }
            else{
                let formData = new FormData()
                formData.append("share_deposits_excel", excel_file.value)
                formData.append("posting_account", ledgerID.value)
                formData.append("company", companyID.value)

                axios.post("api/v1/import-share-deposits-excel/", formData)
                .then((response)=>{
                    if(response.data == "Success"){
                        toast.success("Share Deposits Imported Succesfully")
                        handleReset();
                        excelDepositsList.value = [];
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
            axios.post("api/v1/download-share-deposits-import-excel/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Share_Deposits_Import.xlsx');
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
            excelDepositsList.value = [];
            filePath.value = "";
            excel_file.value = "";
            ledgerID.value = "";
            componentKey.value += 1;
        }

        onBeforeMount(()=>{
            fetchAllLedgers();
        })

        return{
            tableColumns, excelDepositsList, idField, loader, showLoader, hideLoader, excel_file, filePath, displayExcelData, handleFileChange,
            handleReset,importDepositsExcel,downloadExcelTemplate,showLedgerDropdown,searchableDropdownLabel,fetchAllLedgers,componentKey,
            dropdownWidth,searchPlaceholder,handleSelectedLedger,clearSelectedLedger,ledgerArray
        }
    }
})
</script>