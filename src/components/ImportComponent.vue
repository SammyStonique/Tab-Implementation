<template>
    <PageStyleComponent :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-2">
                <div class="border-2 rounded-lg py-2 px-3 mb-2">
                    <div class="relative border h-18 w-76 mb-2">
                        <DropZone 
                            :maxFiles="Number(10000000000)"
                            url=""
                            :uploadOnDrop="false"
                            :multipleUpload="true"
                            :parallelUpload="3"
                            method="POST"
                            @addedFile="onFileAdd"
                            :headers="{'Cache-Control': '' ,'X-Requested-With': ''}"
                        />
                    </div>
                    <div class="text-left flex">
                        <button type="button" class="rounded bg-green-400 text-sm mr-2 h-8 w-36 text-white px-2 py-1.5" @click="downloadExcelTemplate"><i class="fa fa-download mr-1.5"></i>Download</button>
                        <label for="" class="mb-2 mr-3">Select Excel To Import:<em>*</em></label>
                        <input type="text" name="" class="rounded border-2 border-gray-600 text-gray-500 text-sm pl-2 mr-2 mb-4 w-80 h-8" placeholder="" v-model="filePath" >
                        <input type="file" name="file-input" @change="onFileChange" id="file-input" accept=".csv, .xls, .xlsx, .xlsm, .xlsb, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
                        <!-- <label class="rounded border bg-gray-200 px-2 py-1.5 w-30 cursor-pointer mr-6" for="file-input">Browse...</label> -->
                        <button type="button" class="rounded bg-green-400 text-sm mr-3 h-8 w-24 text-white px-2 py-1.5" @click="displayExcelData">Import</button>
                        <div class="h-8" v-if="showSearchableDropdown">
                            <label for="" class="text-left mr-3">{{ searchableDropdownLabel }}:<em>*</em></label>
                            <SearchableDropdown  
                                :key="componentKey"         
                                :options="selectOptions"
                                :dropdownWidth="dropdownWidth"
                                :searchPlaceholder="searchPlaceholder"
                                @option-selected="optionSelected"
                                @clearSearch="clearSearch"
                                @fetchData="fetchData"
                            />
                        </div> 
                    </div> 
                                     
                </div>
                <div class="mt-2 min-h-[50vh]">
                    <DynamicTable :columns="columns" :rows="rows" :idField="idField" :showActions="showActions"/>
                </div>
                <div class="flex-1 basis-full px-2 mt-3">
                    <button @click="handleSubmit" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Save</button>
                    <button @click="handleReset" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-refresh text-xs mr-1.5" aria-hidden="true"></i>Reset</button>
                </div>
                
            </div>
        </template>
    </PageStyleComponent>
    
</template>

<script>
import { defineComponent, ref } from 'vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import DynamicTable from '@/components/DynamicTable.vue';
import DropZone from 'dropzone-vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue'

export default defineComponent({
    name: 'ImportComponent',
    components: {
        PageStyleComponent, DynamicTable, DropZone,SearchableDropdown
    },
    props:{
        columns: {
            type: Array,
            required: true
        },
        rows: {
            type: Array,
            required: true
        },
        idField: {
            type: String,
            required: true
        },
        loader:{
            type: String,
            default: 'none'
        },
        excel_file:{
            type: String,
            required: true
        },
        filePath:{
            type: String,
            required: true
        },
        showSearchableDropdown:{
            type: Boolean,
            required: false,
            default: false
        },
        searchableDropdownLabel:{
            type: String,
            required: false,
            default: ''
        },
        componentKey:{
            type: Number,
            required: false,
            default: 0
        },
        selectOptions:{
            type: Array,
            required: false,
            default: []
        },
        dropdownWidth:{
            type: String,
            required: false,
            default: '350px'
        },
        searchPlaceholder:{
            type: String,
            required: false,
            default: ''
        },
    },
    setup(props,{emit}){
        const localFile = ref(null);
        const localFilePath = ref('');
        const showActions = ref(false);

        const showLoader = () =>{
            emit('showLoader');
        }
        const hideLoader = () =>{
            emit('hideLoader');
        };

        const downloadExcelTemplate = () =>{
            emit('downloadExcelTemplate');
        };

        const displayExcelData = () =>{
            emit('displayExcelData');
        };
        const handleSubmit = () =>{
            emit('handleSubmit');
        }
        const handleReset = () =>{
            emit('handleReset');
        }
        const optionSelected = (option) =>{
            emit('optionSelected', option);
        }
        const clearSearch = () =>{
            emit('clearSearch');
        }
        const fetchData = () =>{
            emit('fetchData');
        }

        const onFileChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                localFile.value = file;
                localFilePath.value = "C:\\fakepath\\" + file.name;

                console.log("The target is ", e.target);
                console.log("The file is ", file);

                emit('file-changed', { file: localFile.value,filePath: localFilePath.value});
                // displayExcelData();
            }
        };

        // Method to handle adding a file
        const onFileAdd = (item) => {
            const file = item.file;
            if (file) {
                localFile.value = file;
                localFilePath.value = "C:\\fakepath\\" + file.name;

                console.log("The item file is ", item);
                console.log("The excel file is ", localFile.value);
                console.log("The excel file name is ", localFile.value.name);

                emit('file-changed', { file: localFile.value,filePath: localFilePath.value});
                // displayExcelData();
            }
        };     

        return{
            showLoader, hideLoader, onFileAdd, displayExcelData, onFileChange,showActions,handleSubmit,handleReset,
            downloadExcelTemplate,optionSelected,clearSearch,fetchData
        }
    }
});
</script>

<style scoped>
em{
  color: red;
}
</style>